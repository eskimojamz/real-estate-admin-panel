import axios from 'axios'
import { motion } from 'framer-motion'
import React, { useContext, useState } from 'react'
import { FaGoogle } from 'react-icons/fa'
import { MdAddCircle, MdDeleteOutline, MdEdit } from 'react-icons/md'
import Skeleton from 'react-loading-skeleton'
import { ScaleLoader } from 'react-spinners'
import { GlobalContext } from '../App'
import ContactGroups from '../components/ContactGroups'
import GoogleConnected from '../components/GoogleConnected'
import { useGetUserDefaultContactGroupQuery } from '../generated/graphql'
import { googleAuth } from '../utils/googleAuth'

function Clients() {
    const { isGLoggedIn, contacts, setContacts } = useContext(GlobalContext)
    console.log(contacts)
    const { data: getContactGroupData, loading: contactGroupIdLoading } = useGetUserDefaultContactGroupQuery({
        onError: (error: any) => console.log(error)
    })

    const contactGroupId = getContactGroupData?.getUserDefaultContactGroup.defaultContactGroupId
    console.log(contactGroupId)

    const [clientInfo, setClientInfo] = useState<any>()
    const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false)

    const [clientFirstname, setClientFirstname] = useState<string>()
    const [clientLastname, setClientLastname] = useState<string>()
    const [clientPhone, setClientPhone] = useState<string>()

    const [isError, setIsError] = useState<boolean>(false)
    const [fnLoading, setFnLoading] = useState<boolean>()

    const resetForm = () => {
        setClientFirstname(undefined)
        setClientLastname(undefined)
        setClientPhone(undefined)
    }

    const createClient = (e: any) => {
        e.preventDefault()
        setFnLoading(true)
        const bodyRef = {
            "names": {
                "givenName": clientFirstname,
            },
            "phoneNumbers": {
                "value": clientPhone,
            }
        }
        if (clientLastname) {
            Object.assign(bodyRef.names, { "familyName": clientLastname })
        }
        let createdContact = {}
        axios.post('https://people.googleapis.com/v1/people:createContact',
            bodyRef,
            {
                params: {
                    personFields: 'names,phoneNumbers,photos'
                }
            }
        ).then(res => {
            console.log(res)
            if (res.status === 200) {
                Object.assign(createdContact, {
                    id: res.data.resourceName.replace('people/', ""),
                    firstName: res.data.names[0].givenName,
                    lastName: res.data.names[0].familyName,
                    phoneNumber: res.data.phoneNumbers[0].value,
                    photo: res.data.photos[0].url
                })
                axios.post(`https://people.googleapis.com/v1/${contactGroupId}/members:modify`,
                    {
                        "resourceNamesToAdd": res.data.resourceName
                    }
                ).then(res => {
                    console.log(res)
                    if (res.status === 200) {
                        if (contacts) {
                            setContacts((contacts: any) => [...contacts, createdContact])
                        } else {
                            setContacts([createdContact])
                        }
                    }
                }).then(() => {
                    setClientInfo({
                        id: res.data.resourceName.replace('people/', ""),
                        firstName: res.data.names[0].givenName,
                        lastName: res.data.names[0].familyName,
                        phoneNumber: res.data.phoneNumbers[0].value,
                        photo: res.data.photos[0].url
                    })
                    setFnLoading(false)
                })
            }
        }).catch(err => {
            setIsError(true)
            throw new Error(err)
        })
    }

    const xVariants = {
        initial: { x: -10, opacity: 0.5 },
        animate: { x: 0, opacity: 1 }
    }

    return (
        <>
            <div className="wrapper">
                <motion.div className="clients-wrapper"
                    initial={{ y: 10, opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="page-header">
                        <h3>Clients</h3>
                        {isGLoggedIn && (
                            <GoogleConnected />
                        )}
                    </div>
                    <div className="clients-body">
                        {isGLoggedIn && contactGroupId ? (
                            <>
                                <div className="clients-list-container">
                                    {contacts ? (
                                        <ul className="clients-list">
                                            {contacts.sort((a: { firstName: string }, b: { firstName: string }) => a.firstName.localeCompare(b.firstName)).map((contact: any) => {
                                                const contactId = contact.id.replace('people/', "")
                                                return (
                                                    <li>
                                                        <div>
                                                            <h4 onClick={() => {
                                                                setClientInfo({
                                                                    id: contactId,
                                                                    firstName: contact.firstName,
                                                                    lastName: contact.lastName,
                                                                    phoneNumber: contact.phoneNumber,
                                                                    photo: contact.photo
                                                                })
                                                            }}>{contact.firstName}</h4>
                                                            <h4 onClick={() => {
                                                                setClientInfo({
                                                                    id: contactId,
                                                                    firstName: contact.firstName,
                                                                    lastName: contact.lastName,
                                                                    phoneNumber: contact.phoneNumber,
                                                                    photo: contact.photo
                                                                })
                                                            }}>{contact.lastName}</h4>
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                setClientInfo({
                                                                    id: contactId,
                                                                    firstName: contact.firstName,
                                                                    lastName: contact.lastName,
                                                                    phoneNumber: contact.phoneNumber,
                                                                    photo: contact.photo
                                                                })
                                                            }}
                                                        ><span /><p>{contact.phoneNumber}</p></div>
                                                        {/* onClick={() => window.open(`https://contacts.google.com/person/${contactId}`)} */}
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    )
                                        : contacts === null ? (
                                            <div className='clients-list-empty'>
                                                <h6>It looks like there are no clients yet...</h6>
                                                <h6>Add a new client!</h6>
                                            </div>
                                        ) : (
                                            <Skeleton containerClassName='clients-list-container-skeleton' count={20} height='35px' width='100%' />
                                        )
                                    }
                                </div>
                                <div className="clients-side">
                                    {fnLoading && (
                                        <motion.div className='clients-side-loading'
                                            initial={{ opacity: 0.5 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className='loading-div'>
                                                <ScaleLoader color='#2c5990' />
                                                <span>Creating Client on Google Contacts</span>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div className='clients-side-header'>
                                        {clientInfo
                                            ? (
                                                <>
                                                    <h4>Client Information</h4>
                                                    <MdAddCircle size='24px' color='#2c5990'
                                                        onClick={() => {
                                                            resetForm()
                                                            setClientInfo(undefined)
                                                        }}
                                                    />
                                                </>
                                            )
                                            : (
                                                <h4>Add Client</h4>
                                            )
                                        }
                                    </div>
                                    <div className='clients-side-body'>
                                        {clientInfo
                                            ? (
                                                // client info
                                                <>
                                                    <div className='client-info'>
                                                        <div className='client-info-photo' style={{ backgroundImage: `url(${clientInfo.photo})` }} />
                                                        <span>
                                                            <h6>FIRST NAME</h6>
                                                            <h4>{clientInfo.firstName}</h4>
                                                        </span>
                                                        <span>
                                                            <h6>LAST NAME</h6>
                                                            <h4>{clientInfo.lastName}</h4>
                                                        </span>
                                                        <span>
                                                            <h6>PHONE NUMBER</h6>
                                                            <h4>{clientInfo.phoneNumber}</h4>
                                                        </span>
                                                        <button className='btn-primary'
                                                            onClick={() => window.open(`https://contacts.google.com/person/${clientInfo.id}`, '_blank')}
                                                        >
                                                            View in Google Contacts
                                                        </button>
                                                    </div>
                                                </>
                                            )
                                            : ( // add client form
                                                <>
                                                    <motion.form
                                                        key='appointments-form'
                                                        variants={xVariants}
                                                        initial='initial'
                                                        animate='animate'
                                                    >
                                                        <label>First Name *</label>
                                                        <input required={true} value={clientFirstname} onChange={(e) => setClientFirstname(e.target.value)}></input>

                                                        <label>Last Name</label>
                                                        <input value={clientLastname} onChange={(e) => setClientLastname(e.target.value)}></input>

                                                        <label>Phone Number *</label>
                                                        <input required={true} placeholder="XXX-XXX-XXXX" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}></input>

                                                        <p>* Required Fields</p>
                                                        {clientFirstname && clientPhone
                                                            ? (
                                                                <button className='btn-primary' onClick={(e) => createClient(e)}>Submit</button>
                                                            )
                                                            : (
                                                                <>
                                                                    <button className='submit-btn-null'>
                                                                        Submit
                                                                        <div className='submit-btn-null-tooltip'>
                                                                            Please enter required fields to submit
                                                                        </div>
                                                                    </button>
                                                                </>
                                                            )
                                                        }
                                                        {isError && (
                                                            <div className='error-div'>
                                                                <p>Oops, there was an error.</p>
                                                                <p>Refresh the page and try again.</p>
                                                            </div>
                                                        )}
                                                    </motion.form>
                                                </>
                                            )
                                        }
                                    </div>
                                </div>
                            </>
                        )
                            : isGLoggedIn && !contactGroupId ?
                                (
                                    <ContactGroups />
                                )
                                : isGLoggedIn === false ?
                                    (
                                        <div className="dashboard-g-login">
                                            <p>Connect your Google Account to access Contacts</p>
                                            <motion.button className="g-login-btn" onClick={googleAuth}><FaGoogle color='white' size='18px' />Sign in with Google</motion.button>
                                        </div>
                                    ) : null //skeleton
                        }

                    </div>
                </motion.div>
            </div>
        </>
    )
}

export default Clients