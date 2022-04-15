import { motion } from 'framer-motion'
import React, { useContext, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { GlobalContext } from '../App'
import Calendars from '../components/Calendars'
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

    const [panelCategory, setPanelCategory] = useState<string>('admin')
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
                        <div className="settings-side">
                            <span onClick={() => setPanelCategory('admin')} className={panelCategory === 'admin' ? 'active' : 'inactive'}>
                                <h5>Admin</h5>
                            </span>
                            <span onClick={() => setPanelCategory('google')} className={panelCategory === 'google' ? 'active' : 'inactive'}>
                                <h5>Google</h5>
                            </span>
                            <button className='btn-grey' style={{ width: '134px', margin: 'auto 0 0 0' }}>Logout</button>
                        </div>
                        <div className="settings-main">
                            {panelCategory === 'admin' ? (
                                <div className="settings-body-admin settings-body-section">
                                    <span>
                                        <h4>Admin Account</h4>
                                    </span>
                                    <span>
                                        <h6>ID</h6>
                                        <p>{userData?.displayUser?.username}</p>
                                    </span>
                                    <span>
                                        <h6>PASSWORD</h6>
                                        <p>*******</p>
                                    </span>

                                    <button className='btn-primary' style={{ marginTop: '1rem' }} onClick={() => handleModal('admin')}>Update Credentials</button>
                                </div>
                            ) : panelCategory === 'google' ? (
                                <div className="settings-body-google settings-body-section">
                                    <span>
                                        <h4>Google Account</h4>
                                    </span>

                                    {isGLoggedIn ? (
                                        <>
                                            <span>
                                                <img src={gAccountInfo?.photo} />
                                                <h6>EMAIL</h6>
                                                <p>{gAccountInfo?.email}</p>
                                            </span>
                                            <span>
                                                <h6>CALENDAR ID</h6>
                                                {calendarId ? (
                                                    <>
                                                        <p>{calendarId}</p>
                                                        <button className='btn-primary' onClick={() => handleModal('calendar')}>Change Calendar</button>
                                                    </>
                                                )
                                                    : (
                                                        <button className='btn-primary' onClick={() => handleModal('calendar')}>Set Calendar</button>
                                                    )}
                                            </span>
                                            <span>
                                                <h6>CONTACTS GROUP</h6>
                                                {contactGroupName ? (
                                                    <>
                                                        <p>{contactGroupName}</p>
                                                        <button className='btn-primary' onClick={() => handleModal('contacts')}>Change Contact Group</button>
                                                    </>
                                                )
                                                    : (
                                                        <button className='btn-primary' onClick={() => handleModal('contacts')}>Set Contact Group</button>
                                                    )
                                                }
                                            </span>
                                        </>
                                    )
                                        : (
                                            <p>Google Account not connected</p>
                                        )
                                    }
                                </div>
                            ) : (
                                <Skeleton />
                            )}
                        </div>

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
                                            <>
                                                <Calendars />
                                            </>
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