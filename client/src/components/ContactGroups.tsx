import axios from 'axios'
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

    const { data: getContactGroupData, loading: contactGroupIdLoading } = useGetUserDefaultContactGroupQuery({
        onError: (error: any) => console.log(error)
    })
    const contactGroupId = getContactGroupData?.getUserDefaultContactGroup.defaultContactGroupId

    // const [contactGroupsLoading, setContactGroupsLoading] = useState<boolean>(false)

    const getGContactGroupsList = async () => {
        // setContactGroupsLoading(true)
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

    const chooseContactGroup = async (cGroupId: string) => {
        await setDefaultContactGroup({
            variables: {
                contactGroupId: cGroupId,
                userId: userData?.displayUser?.id!
            },
            refetchQueries: [{ query: GetUserDefaultContactGroupDocument }]
        })
    }

    useEffect(() => {
        if (isGLoggedIn && !contactGroupIdLoading && !contactGroupId) {
            getGContactGroupsList()
        }
    }, [isGLoggedIn, contactGroupId])

    return (
        <>
            <div className="contact-groups">
                {contactGroups ? (
                    <>
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
                                {contactGroups?.map((group: { resourceName: string; formattedName: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined }, i: number) => {
                                    return <li onClick={() => chooseContactGroup(group.resourceName)}><span></span>{group.formattedName}</li>
                                })}
                            </ul>
                        </div>
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
            </div>
        </>
    )
}

export default ContactGroups