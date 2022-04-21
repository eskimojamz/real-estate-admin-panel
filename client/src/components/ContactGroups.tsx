import axios from 'axios'
import { motion } from 'framer-motion'
import React, { useContext, useEffect, useState } from 'react'
import { ScaleLoader } from 'react-spinners'
import { GlobalContext } from '../App'
import { GetUserDefaultContactGroupDocument, useDisplayUserQuery, useGetUserDefaultContactGroupQuery, useSetDefaultContactGroupMutation } from '../generated/graphql'

function ContactGroups() {
    const { isGLoggedIn, setIsGLoggedIn } = useContext(GlobalContext)
    const [loading, setLoading] = useState<boolean>(true)
    const { data: userData } = useDisplayUserQuery({
        onError: (error: any) => console.log(error)
    })
    const [newContactGroup, setNewContactGroup] = useState<string>("Horizon Clients")
    const [contactGroups, setContactGroups] = useState<any[] | null>()
    const [contactGroupId, setContactGroupId] = useState<string>()
    const [contactGroupName, setContactGroupName] = useState<string>()

    const { } = useGetUserDefaultContactGroupQuery({
        onError: (error) => console.log(error),
        onCompleted: (data) => {
            setContactGroupId(data.getUserDefaultContactGroup.defaultContactGroupId)
            setContactGroupName(data.getUserDefaultContactGroup.defaultContactGroupName)
        }
    })

    const axiosInstance = axios.create()

    const getGContactGroupsList = async () => {
        await axiosInstance.get('https://people.googleapis.com/v1/contactGroups')
            .then(res => {
                if (res.status === 200) {
                    const groupsRef: any[] = []
                    // get user contact groups
                    res.data.contactGroups.map((group: { groupType: string; formattedName: string; resourceName: string; }) => {
                        if (group.groupType === 'USER_CONTACT_GROUP') {
                            groupsRef.push({
                                formattedName: group.formattedName,
                                resourceName: group.resourceName
                            })
                        }
                    })
                    // set groups
                    groupsRef.length > 0 && (
                        setContactGroups(groupsRef)
                    )
                    setLoading(false)
                }
                return
            })
            .catch(err => {
                // setContactGroupsLoading(false)
                throw new Error(err)
            })
    }

    // if Calendar fetch fails, get new gAccessToken and retry
    axiosInstance.interceptors.response.use((response) => {
        return response
    }, async function (error) {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            // originalRequest._retry = true;
            axios.post('http://localhost:4000/auth/google/silent-refresh', {}, {
                withCredentials: true
            }).then((res) => {
                const { gAccessToken } = res.data
                console.log(gAccessToken)
                if (gAccessToken) {
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${gAccessToken}`
                    return axiosInstance.request(originalRequest);
                } else {
                    setIsGLoggedIn(false)
                }
            })
        }
        return Promise.reject(error);
    });

    const [setDefaultContactGroup] = useSetDefaultContactGroupMutation({
        onError: (error: any) => {
            console.log(error)
        }
    })

    const chooseContactGroup = async (cGroupId: string, cGroupName: string) => {
        await setDefaultContactGroup({
            variables: {
                contactGroupId: cGroupId,
                contactGroupName: cGroupName,
                userId: userData?.displayUser?.id!
            },
            refetchQueries: [{ query: GetUserDefaultContactGroupDocument }],
            awaitRefetchQueries: true,
        })
    }

    const createGContactGroup = (e: { preventDefault: () => void }) => {
        e.preventDefault()
        setLoading(true)
        axiosInstance.post('https://people.googleapis.com/v1/contactGroups', {
            contactGroup: {
                name: newContactGroup,
            }
        }).then((res) => {
            console.log(res)
            if (res.status === 200) {
                setContactGroupId(res.data.resourceName)
                setContactGroupName(res.data.formattedName)
                chooseContactGroup(res.data.resourceName, res.data.formattedName)
                setLoading(false)
            }
        })
    }

    useEffect(() => {
        if (isGLoggedIn) {
            getGContactGroupsList()
        }
    }, [isGLoggedIn])

    return (
        <>
            {contactGroups ? (
                <>
                    <motion.div className="contact-groups"
                        key='c-groups'
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                    >
                        {contactGroupId && contactGroupName && (
                            <>
                                <div className='contact-groups-current'>
                                    <h6>Default Contact Group</h6>
                                    <span>
                                        {contactGroupName}
                                    </span>
                                </div>
                            </>
                        )}
                        <form>
                            <h6>Create a new Google Contacts group:</h6>
                            <input placeholder="Horizon Clients"
                                value={newContactGroup}
                                onChange={(e) => setNewContactGroup(e.target.value)}
                            />
                            <button className="btn-primary" onClick={(e) => createGContactGroup(e)}>Create Group</button>
                        </form>
                        <div className="contact-groups-list">
                            <h6>Or choose an existing account contact group:</h6>
                            <ul>
                                {contactGroups?.filter(group => group.resourceName !== contactGroupId).map((group: { resourceName: string; formattedName: string }) => {
                                    return <li onClick={() => chooseContactGroup(group.resourceName, group.formattedName)}><span></span>{group.formattedName}</li>
                                })}
                            </ul>
                        </div>
                    </motion.div>
                </>
            )
                : (
                    <>
                        <div className="contact-groups-loading">
                            <ScaleLoader color='#2c5990' />
                            <p>Loading Google Contact Groups</p>
                        </div>
                    </>
                )
            }
        </>
    )
}

export default ContactGroups