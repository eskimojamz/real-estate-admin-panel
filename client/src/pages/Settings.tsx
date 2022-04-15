import { motion } from 'framer-motion'
import React, { useContext, useState } from 'react'
import { GlobalContext } from '../App'
import ContactGroups from '../components/ContactGroups'
import GoogleConnected from '../components/GoogleConnected'
import { useDisplayUserQuery, useGetUserDefaultCalendarQuery, useGetUserDefaultContactGroupQuery } from '../generated/graphql'

function Settings() {
    const { data: userData } = useDisplayUserQuery()
    const { isGLoggedIn, gAccountInfo } = useContext(GlobalContext)
    const [calendarId, setCalendarId] = useState<string>()
    const [contactGroupId, setContactGroupId] = useState<string>()
    const [contactGroupName, setContactGroupName] = useState<string>()
    const { data: calendarData } = useGetUserDefaultCalendarQuery({
        onError: (err) => console.log(err),
        onCompleted: (data => setCalendarId(data.getUserDefaultCalendar.defaultCalendarId))
    })
    const { data: contactsData } = useGetUserDefaultContactGroupQuery({
        onError: (err) => console.log(err),
        onCompleted: (data => {
            setContactGroupId(data.getUserDefaultContactGroup.defaultContactGroupId)
            setContactGroupName(data.getUserDefaultContactGroup.defaultContactGroupName)
        })
    })

    const [isModal, setIsModal] = useState<boolean>()
    const [modalCategory, setModalCategory] = useState<string>()

    const handleModal = (category: string) => {
        setModalCategory(category)
        setIsModal(true)
    }

    return (
        <>
            <div className='wrapper'>
                <motion.div className='settings-wrapper'
                    initial={{ y: 10, opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="page-header">
                        <h3>Settings</h3>
                        {isGLoggedIn && (
                            <GoogleConnected />
                        )}
                    </div>
                    <div className='settings-body'>
                        <div className="settings-body-admin settings-body-section">
                            <h5>Admin Account</h5>
                            <span>
                                <h6>ID</h6>
                                <p>{userData?.displayUser?.username}</p>
                                <h6>PASSWORD</h6>
                                <p>*******</p>
                                <button className='btn-primary' onClick={() => handleModal('admin')}>Update Credentials</button>
                            </span>
                        </div>
                        <div className="settings-body-google settings-body-section">
                            <h5>Google Account</h5>
                            <span>
                                {isGLoggedIn ? (
                                    <>
                                        <img src={gAccountInfo?.photo} />
                                        <h6>EMAIL</h6>
                                        <p>{gAccountInfo?.email}</p>
                                        <h6>CALENDAR ID</h6>
                                        {calendarId ? (
                                            <>
                                                <span>
                                                    <p>{calendarId}</p>
                                                </span>
                                                <button className='btn-primary' onClick={() => handleModal('calendar')}>Change Calendar</button>
                                            </>
                                        )
                                            : (
                                                <button className='btn-primary' onClick={() => handleModal('calendar')}>Set Calendar</button>
                                            )}
                                        <h6>CONTACTS GROUP</h6>
                                        {contactGroupName ? (
                                            <>
                                                <span>
                                                    <p>{contactGroupName}</p>
                                                </span>
                                                <button className='btn-primary' onClick={() => handleModal('contacts')}>Change Contact Group</button>
                                            </>
                                        )
                                            : (
                                                <button className='btn-primary' onClick={() => handleModal('contacts')}>Set Contact Group</button>
                                            )}
                                    </>
                                )
                                    : (
                                        <p>Google Account not connected</p>
                                    )
                                }
                            </span>
                        </div>
                        <button className='btn-grey'>Logout</button>
                        {isModal && (
                            <>
                                <div className="settings-modal-overlay"
                                    onClick={() => {
                                        setIsModal(false)
                                        setModalCategory(undefined)
                                    }}
                                />
                                <div className="settings-modal">
                                    {modalCategory === 'admin' ? (
                                        <>

                                        </>
                                    )
                                        : modalCategory === 'calendar' ? (
                                            <></>
                                        )
                                            // modalCategory === 'contacts'
                                            : (
                                                <>
                                                    <ContactGroups />
                                                </>
                                            )
                                    }
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    )
}

export default Settings