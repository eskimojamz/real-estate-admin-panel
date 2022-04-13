import { motion } from 'framer-motion'
import React, { useContext, useState } from 'react'
import { MdAddCircle, MdDeleteOutline, MdEdit } from 'react-icons/md'
import { GlobalContext } from '../App'
import ContactGroups from '../components/ContactGroups'
import GoogleConnected from '../components/GoogleConnected'
import { useGetUserDefaultContactGroupQuery } from '../generated/graphql'

function Clients() {
    const { isGLoggedIn, contacts } = useContext(GlobalContext)
    console.log(contacts)
    const { data: getContactGroupData, loading: contactGroupIdLoading } = useGetUserDefaultContactGroupQuery({
        onError: (error: any) => console.log(error)
    })

    const contactGroupId = getContactGroupData?.getUserDefaultContactGroup.defaultContactGroupId
    console.log(contactGroupId)

    const [clientInfo, setClientInfo] = useState()
    const editToggle = useState<boolean>(false)
    const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false)

    const [clientName, setClientName] = useState<string>()
    const [clientPhone, setClientPhone] = useState<string>()

    const [isError, setIsError] = useState<boolean>(false)

    const resetForm = () => {
        return
    }

    const createClient = (e: any) => {
        return
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
                        {isGLoggedIn && contacts && contactGroupId ? (
                            <>
                                <div className="clients-list">
                                    <div className="clients-list-body">
                                        <ul className="clients-list">
                                            {contacts.map((contact: any) => {
                                                const contactId = contact.id.replace('people/', "")
                                                return (
                                                    <li>
                                                        <div><h4>{contact.firstName}</h4><h4>{contact.lastName}</h4></div>
                                                        <div><span /><p>{contact.phoneNumber}</p></div>
                                                        {/* onClick={() => window.open(`https://contacts.google.com/person/${contactId}`)} */}
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                </div>
                                <div className="clients-side">
                                    <div className='clients-side-header'>
                                        {clientInfo
                                            ? (
                                                <>
                                                    {editToggle ? <h4>Edit Client</h4> : <h4>Client Information</h4>}
                                                    <span>
                                                        <MdDeleteOutline size='24px' color='#2c5990'
                                                            onClick={() => {
                                                                setIsDeleteModal(true)
                                                            }}
                                                        />
                                                        {!editToggle &&
                                                            <MdEdit size='24px' color='#2c5990' />
                                                        }
                                                        <MdAddCircle size='24px' color='#2c5990'
                                                            onClick={() => {
                                                                resetForm()
                                                                setClientInfo(undefined)
                                                            }}
                                                        />
                                                    </span>
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
                                                editToggle // edit client form
                                                    ? (
                                                        <>
                                                        </>
                                                    )
                                                    : ( // client info
                                                        <>
                                                        </>
                                                    )
                                            )
                                            : ( // add client form
                                                <>
                                                    <motion.form
                                                        key='appointments-form'
                                                        variants={xVariants}
                                                        initial='initial'
                                                        animate='animate'
                                                    >
                                                        <label>Name *</label>
                                                        <input required={true} value={clientName} onChange={(e) => setClientName(e.target.value)}></input>

                                                        <label>Phone Number *</label>
                                                        <input required={true} type='tel' pattern="[0-9]{3}-[0-9]{4}-[0-9]{3}" placeholder="XXX-XXX-XXXX" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}></input>

                                                        <p>* Required Fields</p>
                                                        {clientName && clientPhone
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
                            : isGLoggedIn && !contacts && !contactGroupId
                                ? (
                                    <ContactGroups />
                                )
                                : null
                        }

                    </div>
                </motion.div>
            </div>
        </>
    )
}

export default Clients