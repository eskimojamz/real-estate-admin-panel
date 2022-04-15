import axios from 'axios'
import { motion } from 'framer-motion'
import React, { useContext, useEffect, useState } from 'react'
import { ScaleLoader } from 'react-spinners'
import { GlobalContext } from '../App'
import { GetUserDefaultContactGroupDocument, useDisplayUserQuery, useGetUserDefaultContactGroupQuery, useSetDefaultContactGroupMutation } from '../generated/graphql'

function ContactGroups() {
    const { isGLoggedIn } = useContext(GlobalContext)
    const { data: userData } = useDisplayUserQuery({
        onError: (error: any) => console.log(error)
    })
    const [contactsInput, setContactsInput] = useState<string>("Horizon Clients")
    const [contactGroups, setContactGroups] = useState<any[] | null>()
    const [contactGroupId, setContactGroupId] = useState<string>()
    const [contactGroupName, setContactGroupName] = useState<string>()

    const { data: getContactGroupData, loading: contactGroupIdLoading } = useGetUserDefaultContactGroupQuery({
        onError: (error) => console.log(error),
        onCompleted: (data) => {
            setContactGroupId(data.getUserDefaultContactGroup.defaultContactGroupId)
            setContactGroupName(data.getUserDefaultContactGroup.defaultContactGroupName)
        }
    })

    console.log(contactGroupId, contactGroupIdLoading)
    // const [contactGroupsLoading, setContactGroupsLoading] = useState<boolean>(false)

    const getGContactGroupsList = async () => {
        // setContactGroupsLoading(true)
        console.log('getting contact groups')
        await axios.get('https://people.googleapis.com/v1/contactGroups')
            .then(res => {
                // console.log(res.data.contactGroups)
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
                // setContactGroupsLoading(false)
            })
            .catch(err => {
                // setContactGroupsLoading(false)
                throw new Error(err)
            })
    }

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
            refetchQueries: [{ query: GetUserDefaultContactGroupDocument }]
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
                                value={contactsInput}
                                onChange={(e) => setContactsInput(e.target.value)}
                            />
                            <button className="btn-primary">Create Group</button>
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