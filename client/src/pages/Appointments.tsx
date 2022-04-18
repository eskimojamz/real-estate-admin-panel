import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction';
import '../utils/fullCalendar/fullCalendar.css'
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { createRef, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GlobalContext } from '../App';
import { GetUserDefaultCalendarDocument, useDisplayUserQuery, useGetUserDefaultCalendarQuery, useSetDefaultCalendarMutation } from '../generated/graphql';
import { MdAddCircle, MdDeleteOutline, MdEdit, MdLocationPin, MdOutlineAccessTime, MdPerson } from 'react-icons/md';
import { CgCalendarToday } from 'react-icons/cg'
import GoogleMap from "google-map-react"
import Geocode from "react-geocode"
import GoogleConnected from '../components/GoogleConnected';
import { BarLoader, ScaleLoader } from 'react-spinners';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import Calendars from '../components/Calendars';

const MapMarker: React.FC<any> = (props) => {
    const { address } = props
    const encodedAddress = encodeURIComponent(address).replace(/%20/g, "+")
    return (
        <>
            <motion.div className="map-marker"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 5, delay: 0.5 }}
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`)}
            />
        </>
    )
}

function Appointments() {
    const xVariants = {
        initial: { x: -10, opacity: 0.5 },
        animate: { x: 0, opacity: 1 }
    }

    const { isGLoggedIn, setIsGLoggedIn } = useContext(GlobalContext)
    const [loginModal, setLoginModal] = useState<boolean>(true)

    const calRef = createRef<any>()
    const { data: getCalendarData, loading: calendarIdLoading } = useGetUserDefaultCalendarQuery({
        onError: (error) => console.log(error)
    })
    const calendarId = getCalendarData?.getUserDefaultCalendar.defaultCalendarId
    const { calendarEvents, setCalendarEvents } = useContext(GlobalContext)

    const [editToggle, setEditToggle] = useState<boolean>()
    const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false)
    const [fnLoading, setFnLoading] = useState<boolean>(false)
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)
    const [isDeleteError, setIsDeleteError] = useState<boolean>(false)

    // edit calendar event
    const editAppointment = async (e: any, eventId: string) => {
        e.preventDefault()
        setFnLoading(true)
        // fullCalendar Api
        let calendarApi = calRef.current.getApi()
        // set editFields for GoogleApiCall
        const editFields = {}
        if (title) {
            Object.assign(editFields, { summary: title })
        }
        if (allDay && startDate && endDate) {
            Object.assign(editFields, {
                start: {
                    date: startDate,
                    dateTime: null
                },
                end: {
                    date: endDate,
                    dateTime: null
                }
            })
            Object.assign(editFields, { allDay: true })
        } else if (!allDay && startTime && endTime) {
            Object.assign(editFields, {
                "start": {
                    "date": null,
                    "dateTime": new Date(startDate + " " + startTime).toISOString()
                },
                "end": {
                    "date": null,
                    "dateTime": new Date(endDate + " " + endTime).toISOString()
                }
            })
            Object.assign(editFields, { allDay: false })
        }
        if (location) {
            Object.assign(editFields, { location: location })
        }
        if (client) {
            Object.assign(editFields, { description: client })
        }
        // patch to Google Api
        await axios.patch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
            editFields
        ).then(res => {
            const newAppointmentInfo = {
                id: res?.data?.id,
                title: res?.data?.summary,
                start: res?.data?.start?.date || res?.data?.start?.dateTime,
                end: res?.data?.end?.date || res?.data?.end?.dateTime,
                description: res?.data?.description,
                location: res?.data?.location,
                url: res?.data?.htmlLink,
                allDay: res?.data?.start?.dateTime ? false : true
            }
            // update FullCalendar events
            if (title) {
                calendarApi.getEventById(eventId).setProp('title', title)
            }
            if (allDay && startDate) {
                calendarApi.getEventById(eventId).setDates(
                    res?.data?.start?.date,
                    res?.data?.end?.date,
                    { allDay: true }
                )
                // assign allDay to appointmentInfo... not return as res from gApi
                Object.assign(newAppointmentInfo, { allDay: true })
            } else if (!allDay && startTime) {
                calendarApi.getEventById(eventId).setDates(
                    res?.data?.start?.dateTime,
                    res?.data?.end?.dateTime,
                    { allDay: false }
                )
                // assign allDay to appointmentInfo... not return as res from gApi
                Object.assign(newAppointmentInfo, { allDay: false })
            }
            if (location) {
                calendarApi.getEventById(eventId).setExtendedProp('location', res?.data?.location)
            }
            if (client) {
                calendarApi.getEventById(eventId).setExtendedProp('description', res?.data?.description)
            }
            // remove old event and add new, edited event.. then setCalendarEvents 
            setCalendarEvents((events: any) => [...events.filter((ev: { id: string; }) => ev.id !== res?.data?.id), {
                id: res?.data?.id,
                title: res?.data?.summary,
                start: res?.data?.start?.date || res?.data?.start?.dateTime,
                end: res?.data?.end?.date || res?.data?.end?.dateTime,
                extendedProps: {
                    description: res?.data?.description,
                    location: res?.data?.location,
                },
                url: res?.data?.htmlLink,
                allDay: res?.data?.start?.dateTime ? false : true
            }])
            // setAppointmentInfo for rendering new info data on screen
            setAppointmentInfo(newAppointmentInfo)
        }).then(() => {
            resetForm()
            setFnLoading(false)
            setEditToggle(false)
        }).catch(err => {
            setIsError(true)
            throw new Error(err)
        })
    }

    const deleteAppointment = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, eventId: string) => {
        e.preventDefault()
        setDeleteLoading(true)
        let calendarApi = calRef.current.getApi()
        // delete event on Google Calendar
        await axios.delete(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`)
            .then(() => {
                // remove event from FullCalendar events
                calendarApi.getEventById(eventId).remove()
                // remove event from global state
                setCalendarEvents((events: any[]) => [...events.filter(ev => ev.id !== eventId)])
            })
            .then(() => {
                setDeleteLoading(false)
                setIsDeleteModal(false)
                setAppointmentInfo(undefined)
                if (editToggle) {
                    setEditToggle(false)
                }
            })
            .catch((err) => {
                setIsDeleteError(true)
                setDeleteLoading(false)
                throw new Error(err)
            })
    }

    const createAppointment = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setFnLoading(true)
        let calendarApi = calRef.current.getApi()
        // assign fields to object for send to Google Calendar
        const appointmentRef = {
            "start": {
                "date": startDate,
            },
            "end": {
                "date": endDate
            },
            "summary": title,
        }
        if (startTime && !allDay) {
            Object.assign(appointmentRef, {
                "start": {
                    "dateTime": new Date(startDate + " " + startTime).toISOString()
                }
            })
        }
        if (endTime && !allDay) {
            Object.assign(appointmentRef, {
                "end": {
                    "dateTime": new Date(endDate + " " + endTime).toISOString()
                }
            })
        }
        if (location) {
            Object.assign(appointmentRef, {
                "location": location
            })
        }
        if (client) {
            Object.assign(appointmentRef, {
                "description": client
            })
        }
        console.log(appointmentRef)
        // create new Event on Google Calendar
        await axios.post(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, appointmentRef)
            .then(res => {
                console.log(res)
                const newAppointmentInfo = {
                    id: res?.data?.id,
                    title: res?.data?.summary,
                    start: res?.data?.start?.date || res?.data?.start?.dateTime,
                    end: res?.data?.end?.date || res?.data?.end?.dateTime,
                    description: res?.data?.description,
                    location: res?.data?.location,
                    url: res?.data?.htmlLink,
                    allDay: res?.data?.start?.dateTime ? false : true
                }
                // add event to FullCalendar
                calendarApi.addEvent({
                    id: res?.data?.id,
                    title: res?.data?.summary,
                    start: res?.data?.start?.date || res?.data?.start?.dateTime,
                    end: res?.data?.end?.date || res?.data?.end?.dateTime,
                    startStr: res?.data?.start?.dateTime,
                    endStr: res?.data?.end?.dateTime,
                    extendedProps: {
                        description: res?.data?.description,
                        location: res?.data?.location
                    },
                    url: res?.data?.htmlLink,
                    allDay: res?.data?.start?.dateTime ? false : true
                })
                // add new appointment event data to calendarEvents global state
                setCalendarEvents((events: any) => [...events, {
                    id: res?.data?.id,
                    title: res?.data?.summary,
                    start: res?.data?.start?.date || res?.data?.start?.dateTime,
                    end: res?.data?.end?.date || res?.data?.end?.dateTime,
                    extendedProps: {
                        description: res?.data?.description,
                        location: res?.data?.location,
                    },
                    url: res?.data?.htmlLink,
                    allDay: res?.data?.start?.dateTime ? false : true
                }])
                // set AppointmentInfo for immediate update on screen
                setAppointmentInfo(newAppointmentInfo)
            })
            .then(() => {
                resetForm()
                setFnLoading(false)
            })
            .catch(err => {
                setIsError(true)
                throw new Error(err)
            })
    }

    const [appointmentInfo, setAppointmentInfo] = useState<any>()
    const [title, setTitle] = useState<string>()
    const [startDate, setStartDate] = useState<string>(new Date().getFullYear().toString().padStart(4, '0') + '-' + (new Date().getMonth() + 1).toString().padStart(2, '0') + '-' + new Date().getDate().toString().padStart(2, '0'))
    const [startTime, setStartTime] = useState<string>("12:00")
    const [endDate, setEndDate] = useState<string>(new Date((new Date().setDate(new Date().getDate() + 1))).getFullYear().toString().padStart(4, '0') + '-' + (new Date((new Date().setDate(new Date().getDate() + 1))).getMonth() + 1).toString().padStart(2, '0') + '-' + new Date((new Date().setDate(new Date().getDate() + 1))).getDate().toString().padStart(2, '0'))
    const [endTime, setEndTime] = useState<string>("13:00")
    const [allDay, setAllDay] = useState<boolean>(true)
    const [location, setLocation] = useState<string>()
    const [client, setClient] = useState<string>()
    // console.log(appointmentInfo, startDate, endDate, startTime, endTime)
    // const [descriptionToggle, setDescriptionToggle] = useState<boolean>(false)
    // const [descriptionInput, setDescriptionInput] = useState<string>()
    // const [locationToggle, setLocationToggle] = useState<boolean>(false)
    // const [locationInput, setLocationInput] = useState<string>()
    const resetForm = () => {
        setTitle(undefined)
        setAllDay(true)
        setStartDate(new Date().getFullYear().toString().padStart(4, '0') + '-' + (new Date().getMonth() + 1).toString().padStart(2, '0') + '-' + new Date().getDate().toString().padStart(2, '0'))
        setEndDate(new Date((new Date().setDate(new Date().getDate() + 1))).getFullYear().toString().padStart(4, '0') + '-' + (new Date((new Date().setDate(new Date().getDate() + 1))).getMonth() + 1).toString().padStart(2, '0') + '-' + new Date((new Date().setDate(new Date().getDate() + 1))).getDate().toString().padStart(2, '0'))
        setStartTime("12:00")
        setEndTime("13:00")
        setLocation(undefined)
        setClient(undefined)
    }

    // set endDate for every time allDay is checked/set 
    useEffect(() => {
        if (allDay) {
            let d = new Date(startDate)
            d.setDate(d.getDate() + 1)
            setEndDate(d.getFullYear().toString().padStart(4, '0') + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0'))
        }
    }, [allDay, startDate])

    // set Google Maps Geocoding API
    Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY!);
    Geocode.setLanguage("en");
    Geocode.setRegion("us");

    const [mapCoords, setMapCoords] = useState<any>()
    const [mapMarker, setMapMarker] = useState<any>()

    useMemo(() => {
        appointmentInfo &&
            Geocode.fromAddress(appointmentInfo?.location).then(
                (response) => {
                    const { lat, lng } = response.results[0].geometry.location;
                    // {lat, lng} are google-map-react component props
                    setMapCoords({ lat: lat, lng: lng })
                    setMapMarker(<MapMarker lat={lat} lng={lng} address={appointmentInfo?.location} />)
                },
                (error) => {
                    console.error(error);
                }
            );
    }, [appointmentInfo])

    return (
        <>
            <div className='wrapper'>
                <motion.div className='appointments-wrapper'
                    initial={{ y: 10, opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="page-header">
                        <h3>Appointments</h3>
                        {isGLoggedIn && (
                            <GoogleConnected />
                        )}
                    </div>
                    <div className="appointments-body">
                        {isGLoggedIn && calendarId ? (
                            <>
                                <div className='appointments-list'>
                                    {calendarEvents ? (
                                        <>
                                            <div className="full-calendar-month">
                                                <FullCalendar
                                                    ref={calRef}
                                                    plugins={[dayGridPlugin, interactionPlugin]}
                                                    initialView="dayGridMonth"
                                                    initialEvents={calendarEvents}
                                                    height='100%'
                                                    headerToolbar={{
                                                        left: 'title',
                                                        center: '',
                                                        right: 'prev,next'
                                                    }}
                                                    duration={{ 'days': 180 }}
                                                    dateClick={(info) => {
                                                        // if edit was on, reset form on clicking new date 
                                                        editToggle && resetForm()
                                                        // if editmode is on, toggle off
                                                        editToggle && setEditToggle(false)
                                                        setStartDate(info.dateStr)
                                                        setEndDate(new Date((new Date(info.dateStr).setDate(new Date(info.dateStr).getDate() + 1))).getFullYear().toString().padStart(4, '0') + '-' + (new Date((new Date(info.dateStr).setDate(new Date(info.dateStr).getDate() + 1))).getMonth() + 1).toString().padStart(2, '0') + '-' + new Date((new Date(info.dateStr).setDate(new Date(info.dateStr).getDate() + 1))).getDate().toString().padStart(2, '0'))
                                                        setAppointmentInfo(undefined)
                                                    }}
                                                    eventClick={(info) => {
                                                        info.jsEvent.preventDefault(); // don't let the browser navigate
                                                        // if edit was on, reset form on clicking new event 
                                                        editToggle && resetForm()
                                                        // if editmode is on, toggle off
                                                        editToggle && setEditToggle(false)
                                                        const infoRef = {
                                                            id: info.event.id,
                                                            title: info.event.title,
                                                            start: info.event.start,
                                                            end: info.event.end,
                                                            description: info.event.extendedProps.description,
                                                            location: info.event.extendedProps.location,
                                                            url: info.event.url,
                                                            allDay: info.event.allDay,
                                                        }
                                                        setAppointmentInfo(infoRef)
                                                    }}
                                                    selectable={true}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Skeleton containerClassName='calendar-header-skeleton' count={2} inline={true} height='100%' width='30%' />
                                            <Skeleton containerClassName='calendar-skeleton' count={6} height='100%' />
                                        </>
                                    )}
                                </div>
                                <div className='appointments-side'>
                                    {/* loading overlay */}
                                    {fnLoading && (
                                        <motion.div className='appointments-side-loading'
                                            initial={{ opacity: 0.5 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className='loading-div'>
                                                <ScaleLoader color='#2c5990' />
                                                <span>Sending appointment data to Google Calendar</span>
                                            </div>
                                        </motion.div>
                                    )}
                                    {/* delete modal */}
                                    {isDeleteModal && (
                                        <motion.div className='delete-modal-overlay'
                                            initial={{ opacity: 0.5 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <motion.div className='delete-modal'
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                {deleteLoading ? (
                                                    <>
                                                        <BarLoader color='#2c5990' />
                                                        <p>Deleting Appointment from Google Calendar</p>
                                                    </>
                                                )
                                                    : isDeleteError
                                                        ? (
                                                            <>
                                                                <span>
                                                                    <p>There was an error.</p>
                                                                    <p>Please refresh the page and try again.</p>
                                                                </span>
                                                                <span>
                                                                    <button className='btn-primary'
                                                                        onClick={() => window.location.reload()}
                                                                    >
                                                                        Refresh Page
                                                                    </button>
                                                                </span>
                                                            </>
                                                        )
                                                        : (
                                                            <>
                                                                <span>
                                                                    <p>Are you sure you want to delete this appointment?</p>
                                                                    <em>This action cannot be undone!</em>
                                                                </span>
                                                                <span>
                                                                    <button className='btn-grey'
                                                                        style={{ width: 75 }}
                                                                        onClick={() => setIsDeleteModal(false)}
                                                                    >Cancel</button>
                                                                    <button className='delete-btn'
                                                                        onClick={(e) => {
                                                                            deleteAppointment(e, appointmentInfo?.id)
                                                                        }}
                                                                    >Delete</button>
                                                                </span>
                                                            </>
                                                        )
                                                }
                                            </motion.div>
                                        </motion.div>
                                    )}

                                    <div className='appointments-side-header'>
                                        {appointmentInfo
                                            ? (
                                                <>
                                                    {editToggle ? <h4>Edit Appointment</h4> : <h4>Appointment Details</h4>}
                                                    <span>
                                                        <MdDeleteOutline size='24px' color='#2c5990'
                                                            onClick={() => {
                                                                setIsDeleteModal(true)
                                                            }}
                                                        />
                                                        {!editToggle &&
                                                            <MdEdit size='24px' color='#2c5990'
                                                                onClick={() => {
                                                                    // set form fields to appointmentInfo
                                                                    setTitle(appointmentInfo?.title)
                                                                    setAllDay(appointmentInfo?.allDay)
                                                                    if (appointmentInfo?.allDay) {
                                                                        setStartDate(new Date(appointmentInfo?.start).getFullYear().toString().padStart(4, '0') + '-' + (new Date(appointmentInfo?.start).getMonth() + 1).toString().padStart(2, '0') + '-' + new Date(appointmentInfo?.start).getDate().toString().padStart(2, '0'))
                                                                        if (appointmentInfo?.end) {
                                                                            setEndDate(new Date(appointmentInfo?.end).getFullYear().toString().padStart(4, '0') + '-' + (new Date(appointmentInfo?.end).getMonth() + 1).toString().padStart(2, '0') + '-' + new Date(appointmentInfo?.end).getDate().toString().padStart(2, '0'))
                                                                        }
                                                                    }
                                                                    if (!appointmentInfo?.allDay) {
                                                                        setStartDate(new Date(appointmentInfo?.start).getFullYear().toString().padStart(4, '0') + '-' + (new Date(appointmentInfo?.start).getMonth() + 1).toString().padStart(2, '0') + '-' + new Date(appointmentInfo?.start).getDate().toString().padStart(2, '0'))
                                                                        if (appointmentInfo?.end) {
                                                                            setEndDate(new Date(appointmentInfo?.end).getFullYear().toString().padStart(4, '0') + '-' + (new Date(appointmentInfo?.end).getMonth() + 1).toString().padStart(2, '0') + '-' + new Date(appointmentInfo?.end).getDate().toString().padStart(2, '0'))
                                                                        }
                                                                        setStartTime(new Date(appointmentInfo?.start).toLocaleTimeString('en', {
                                                                            timeStyle: 'short',
                                                                            hour12: false,
                                                                        }))
                                                                        setEndTime(new Date(appointmentInfo?.end).toLocaleTimeString('en', {
                                                                            timeStyle: 'short',
                                                                            hour12: false,
                                                                        }))
                                                                    }
                                                                    setLocation(appointmentInfo?.location)
                                                                    setClient(appointmentInfo?.description)
                                                                    // toggle edit mode
                                                                    setEditToggle(true)
                                                                }}
                                                            />
                                                        }
                                                        <MdAddCircle size='24px' color='#2c5990'
                                                            onClick={() => {
                                                                resetForm()
                                                                setAppointmentInfo(undefined)
                                                            }}
                                                        />
                                                    </span>
                                                </>
                                            )
                                            : <h4>Create Appointment</h4>
                                        }
                                    </div>
                                    <div className='appointments-side-body'>
                                        {appointmentInfo
                                            ? (
                                                editToggle
                                                    ? (
                                                        <motion.div className="calendar-edit"
                                                            key='calendar-edit'
                                                            variants={xVariants}
                                                            initial='initial'
                                                            animate='animate'
                                                        >
                                                            <form>
                                                                <label>Title *</label>
                                                                <input required={true} defaultValue={appointmentInfo?.title} value={title} onChange={(e) => setTitle(e.target.value)}></input>
                                                                <div className='form-date-time'>
                                                                    <span id='start-date-time'>
                                                                        <label>Start Date *</label>
                                                                        <input type="date" id="start-date"
                                                                            required={true}
                                                                            value={startDate}
                                                                            min="2022-01-01"
                                                                            max="2025-12-31"
                                                                            onChange={(e) => {
                                                                                setStartDate(e.target.value)
                                                                            }}
                                                                        />
                                                                        {allDay === false && (
                                                                            <>
                                                                                <label>Start Time</label>
                                                                                <input id="start-time" type="time"
                                                                                    defaultValue="00:00"
                                                                                    value={startTime}
                                                                                    onChange={(e) => setStartTime(e.target.value)}
                                                                                />
                                                                            </>
                                                                        )}
                                                                    </span>
                                                                    <span id='end-date-time'>
                                                                        <label>End Date</label>
                                                                        <input type="date" id="end-date"
                                                                            required={true}
                                                                            value={endDate}
                                                                            min={startDate || "2022-01-01"}
                                                                            max="2025-12-31"
                                                                            disabled={allDay}
                                                                            onChange={(e) => setEndDate(e.target.value)}
                                                                        />
                                                                        {allDay === false && (
                                                                            <>
                                                                                <label>End Time</label>
                                                                                <input id="end-time" type="time"
                                                                                    defaultValue="23:59"
                                                                                    value={endTime}
                                                                                    onChange={(e) => setEndTime(e.target.value)}
                                                                                />
                                                                            </>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div id='form-checkbox-allday'>
                                                                    <input type="checkbox" id="all-day" checked={allDay}
                                                                        onChange={() => {
                                                                            setAllDay(!allDay)
                                                                        }}
                                                                    />
                                                                    <label>All-Day</label>
                                                                </div>
                                                                <label>Location</label>
                                                                <input value={location} onChange={(e) => setLocation(e.target.value)}></input>
                                                                <label>Client</label>
                                                                <input value={client} onChange={(e) => setClient(e.target.value)}></input>
                                                                <p>* Required Fields</p>
                                                                {!fnLoading && title && startDate && endDate
                                                                    ? (
                                                                        <button className='btn-primary' disabled={fnLoading} onClick={(e) => editAppointment(e, appointmentInfo?.id)}>Submit</button>
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
                                                            </form>
                                                        </motion.div>
                                                    )
                                                    // appointment details / info
                                                    : (
                                                        <motion.div className="calendar-info"
                                                            key='calendar-info'
                                                            variants={xVariants}
                                                            initial='initial'
                                                            animate='animate'
                                                        >

                                                            <div className="calendar-info-title">
                                                                <span />
                                                                <h3>{appointmentInfo?.title}</h3>
                                                            </div>
                                                            <div className="calendar-info-date">
                                                                <CgCalendarToday size='24px' color='#737373' />
                                                                <h5>{new Date(appointmentInfo?.start).toLocaleDateString('en-US', {
                                                                    weekday: 'long',
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                                </h5>
                                                            </div>

                                                            <div className='calendar-info-time'>
                                                                <MdOutlineAccessTime size='24px' color='#737373' />
                                                                <div id='time-text'>
                                                                    {appointmentInfo?.allDay
                                                                        ? (
                                                                            <h5>All-Day</h5>
                                                                        )
                                                                        : (
                                                                            <>
                                                                                <h5>{new Date(appointmentInfo?.start).toLocaleTimeString('en-US', {
                                                                                    hour12: true,
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                })}
                                                                                </h5>
                                                                                <p>-</p>
                                                                                <h5>{new Date(appointmentInfo?.end).toLocaleTimeString('en-US', {
                                                                                    hour12: true,
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                })}
                                                                                </h5>
                                                                            </>
                                                                        )
                                                                    }

                                                                </div>
                                                            </div>

                                                            {appointmentInfo.location &&
                                                                <div className="calendar-info-location">
                                                                    {/* <h6>Location:</h6> */}
                                                                    <MdLocationPin color='#737373' size='24px' />

                                                                    <p>{appointmentInfo?.location}</p>
                                                                </div>
                                                            }
                                                            {appointmentInfo?.description &&
                                                                <div className="calendar-info-description">
                                                                    {/* <h6>Description:</h6> */}
                                                                    <MdPerson color='#737373' size='24px' />
                                                                    <div className="calendar-info-description-value">
                                                                        <p>{appointmentInfo?.description}</p>
                                                                    </div>
                                                                </div>
                                                            }
                                                            {appointmentInfo?.location && (
                                                                <motion.div className='calendar-info-map'
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                >
                                                                    <GoogleMap
                                                                        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY! }}
                                                                        center={mapCoords}
                                                                        defaultZoom={12}
                                                                        options={{
                                                                            fullscreenControl: false,
                                                                            scrollwheel: true,
                                                                            zoomControl: false,
                                                                        }}
                                                                    >
                                                                        {mapMarker}
                                                                    </GoogleMap>
                                                                </motion.div>
                                                            )}
                                                            <button className="btn-primary" style={{ width: 'fit-content' }} onClick={() => window.open(appointmentInfo?.url)}>View in Google Calendar</button>
                                                        </motion.div>
                                                    )
                                            )
                                            // create appointment
                                            : (
                                                <motion.form
                                                    key='appointments-form'
                                                    variants={xVariants}
                                                    initial='initial'
                                                    animate='animate'
                                                >
                                                    <label>Title *</label>
                                                    <input required={true} value={title} onChange={(e) => setTitle(e.target.value)}></input>
                                                    <div className='form-date-time'>
                                                        <span id='start-date-time'>
                                                            <label>Start Date *</label>
                                                            <input type="date" id="start-date"
                                                                required={true}
                                                                defaultValue={startDate}
                                                                value={startDate}
                                                                min="2022-01-01"
                                                                max="2025-12-31"
                                                                onChange={(e) => setStartDate(e.target.value)}
                                                            />
                                                            {allDay === false && (
                                                                <>
                                                                    <label>Start Time</label>
                                                                    <input id="start-time" type="time"
                                                                        defaultValue="00:00"
                                                                        value={startTime}
                                                                        onChange={(e) => setStartTime(e.target.value)}
                                                                    />
                                                                </>
                                                            )}
                                                        </span>
                                                        <span id='end-date-time'>
                                                            <label>End Date *</label>
                                                            <input type="date" id="end-date"
                                                                required={true}
                                                                defaultValue={endDate}
                                                                value={endDate}
                                                                min={startDate || "2022-01-01"}
                                                                max="2025-12-31"
                                                                disabled={allDay}
                                                                onChange={(e) => setEndDate(e.target.value)}
                                                            />
                                                            {allDay === false && (
                                                                <>
                                                                    <label>End Time</label>
                                                                    <input id="end-time" type="time"
                                                                        defaultValue="23:59"
                                                                        value={endTime}
                                                                        onChange={(e) => setEndTime(e.target.value)}
                                                                    />
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div id='form-checkbox-allday'>
                                                        <input type="checkbox" id="all-day" checked={allDay} onChange={() => setAllDay(!allDay)} />
                                                        <label>All-Day</label>
                                                    </div>
                                                    <label>Location</label>
                                                    <input value={location} onChange={(e) => setLocation(e.target.value)}></input>
                                                    <label>Client</label>
                                                    <input value={client} onChange={(e) => setClient(e.target.value)}></input>
                                                    <p>* Required Fields</p>
                                                    {title && startDate && endDate
                                                        ? (
                                                            <button className='btn-primary' onClick={(e) => createAppointment(e)}>Submit</button>
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
                                            )}
                                    </div>
                                </div>
                            </>
                        ) : isGLoggedIn && !calendarId ? (
                            <><Calendars /></>
                        ) : null
                        }
                    </div>
                </motion.div>
            </div >
        </>
    )
}

export default Appointments