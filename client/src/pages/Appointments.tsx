import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction';
import '../utils/fullCalendar/fullCalendar.css'
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { GlobalContext } from '../App';
import { GetUserDefaultCalendarDocument, useDisplayUserQuery, useGetUserDefaultCalendarQuery, useSetDefaultCalendarMutation } from '../generated/graphql';
import { MdLocationPin, MdPerson } from 'react-icons/md';
import GoogleMap from "google-map-react"
import Geocode from "react-geocode"

interface MapMarkerProps {
    lat: number;
    lng: number;
}

const MapMarker: React.FC<MapMarkerProps> = () => {
    return (
        <>
            <motion.div className="map-marker"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 5, delay: 0.5 }}
            />
        </>
    )
}

function Appointments() {
    const yVariants = {
        initial: { y: 10, opacity: 0.5 },
        animate: { y: 0, opacity: 1 }
    }

    const xVariants = {
        initial: { x: -10, opacity: 0.5 },
        animate: { x: 0, opacity: 1 }
    }

    const { isGLoggedIn, setIsGLoggedIn } = useContext(GlobalContext)
    const [loginModal, setLoginModal] = useState<boolean>(true)
    const { data: userData } = useDisplayUserQuery({
        onError: (error) => console.log(error)
    })
    const [calendars, setCalendars] = useState<any[] | null>()
    const { data: getCalendarData, loading: calendarIdLoading } = useGetUserDefaultCalendarQuery({
        onError: (error) => console.log(error)
    })
    const calendarId = getCalendarData?.getUserDefaultCalendar.defaultCalendarId
    const { calendarEvents, setCalendarEvents } = useContext(GlobalContext)
    const [setDefaultCalendar] = useSetDefaultCalendarMutation({
        onError: (error) => {
            console.log(error)
        }
    })

    const getGCalendarsList = async () => {
        try {
            await axios.get('https://www.googleapis.com/calendar/v3/users/me/calendarList')
                .then(res => {
                    console.log(res.data.items)
                    const calendarsRef: any[] = []
                    res.data.items.map((cal: { id: string, summary: string, backgroundColor: string }) => {
                        calendarsRef.push({
                            id: cal.id,
                            name: cal.summary,
                            color: cal.backgroundColor
                        })
                    })
                    calendarsRef.length > 0 && (
                        setCalendars(calendarsRef)
                    )
                })
        } catch (error: any) {
            console.log("Error getting calendar data", error);
            return error.message;
        }
    };

    // choose default calendar on first usage
    const chooseCalendar = async (calId: string) => {
        await setDefaultCalendar({
            variables: {
                calendarId: calId,
                userId: userData?.displayUser?.id!
            },
            refetchQueries: [{ query: GetUserDefaultCalendarDocument }]
        })
    }

    // edit calendar event
    // const gCalendarEdit = async (eventId: string) => {
    //     const reqBody = {}
    //     if (descriptionInput) {
    //         Object.assign(reqBody, { description: descriptionInput })
    //     }
    //     if (locationInput) {
    //         Object.assign(reqBody, { location: locationInput })
    //     }
    //     await axios.patch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
    //         reqBody
    //     ).then(res => {
    //         // console.log(res)
    //         // update calendarInfo (cache state)
    //         const calendarInfoRef = calendarInfo
    //         if (descriptionInput) {
    //             Object.assign(calendarInfoRef, {
    //                 description: res.data.description
    //             })
    //         }
    //         if (locationInput) {
    //             Object.assign(calendarInfoRef, {
    //                 location: res.data.location
    //             })
    //         }
    //         setCalendarInfo(calendarInfoRef)
    //         // update global state
    //         const updatedEvent = calendarEvents.find((event: any) => event.id === eventId)
    //         if (descriptionInput) {
    //             Object.assign(updatedEvent, {
    //                 extendedProps: {
    //                     description: res.data.description
    //                 }
    //             })
    //         }
    //         if (locationInput) {
    //             Object.assign(updatedEvent, {
    //                 extendedProps: {
    //                     location: res.data.location
    //                 }
    //             })
    //         }
    //         const otherEvents = calendarEvents.filter((event: any) => event.id !== eventId)
    //         const updatedEvents = [...otherEvents, updatedEvent]
    //         setCalendarEvents(updatedEvents)

    //         // reset toggles and inputs states
    //         setDescriptionToggle(false)
    //         setDescriptionInput(undefined)
    //         setLocationToggle(false)
    //         setLocationInput(undefined)
    //     })
    // }

    const createAppointment = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
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
                    "dateTime": new Date(startDate + " " + startTime).toISOString(),
                    "timeZone": "America/New_York"
                }
            })
        }
        if (endTime && !allDay) {
            Object.assign(appointmentRef, {
                "end": {
                    "dateTime": new Date(endDate + " " + endTime).toISOString(),
                    "timeZone": "America/New_York"
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
                "description": `Client: ${client}`
            })
        }
        console.log(appointmentRef)
        await axios.post(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, appointmentRef)
            .then(res => console.log(res))
    }

    const [appointmentInfo, setAppointmentInfo] = useState<any>()
    const [title, setTitle] = useState<string>()
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().substring(0, 10))
    const [startTime, setStartTime] = useState<string>("00:00")
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().substring(0, 10))
    const [endTime, setEndTime] = useState<string>("23:59")
    const [allDay, setAllDay] = useState<boolean>(true)
    const [location, setLocation] = useState<string>()
    const [client, setClient] = useState<string>()

    const [descriptionToggle, setDescriptionToggle] = useState<boolean>(false)
    const [descriptionInput, setDescriptionInput] = useState<string>()
    const [locationToggle, setLocationToggle] = useState<boolean>(false)
    const [locationInput, setLocationInput] = useState<string>()

    // set Google Maps Geocoding API
    Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY!);
    Geocode.setLanguage("en");
    Geocode.setRegion("us");

    const [mapCoords, setMapCoords] = useState<any>()
    const [mapMarker, setMapMarker] = useState<any>()

    // after login success, get Calendars Lists, if there is no default Calendar
    useEffect(() => {
        if (isGLoggedIn && !calendarIdLoading && !calendarId) {
            getGCalendarsList()
        }
    }, [isGLoggedIn, calendarId])

    // onload, onGlogin & onCalIdSet, get calendar events if no calendars events
    useMemo(() => {
        if (isGLoggedIn && calendarId && !calendarEvents) {
            try {

                const calItemsRef: { id: any; title: any; start: any; end: any; startStr: any; endStr: any; extendedProps: { description: any; location: any; }; url: any; allDay: boolean }[] = []

                // set time range for g calendar events fetch
                const minDate = new Date()
                minDate.setDate(minDate.getDate() - 180)
                const maxDate = new Date()
                maxDate.setDate(maxDate.getDate() + 180)

                axios.get(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
                    params: {
                        orderBy: 'startTime',
                        singleEvents: true,
                        timeMin: minDate.toISOString(),
                        timeMax: maxDate.toISOString(),
                        timeZone: 'America/New_York'
                    }
                }).then(res => {
                    console.log(res.data.items)
                    const gCalItems = res.data.items
                    gCalItems.map((item: any) => {
                        calItemsRef.push({
                            id: item.id,
                            title: item.summary,
                            start: item.start.date || item.start.dateTime,
                            end: item.end.date || item.end.dateTime,
                            startStr: item.start.dateTime,
                            endStr: item.end.dateTime,
                            extendedProps: {
                                description: item.description,
                                location: item.location
                            },
                            url: item.htmlLink,
                            allDay: item.start.dateTime ? false : true
                        })
                    })
                    console.log(calItemsRef)
                    setCalendarEvents(calItemsRef)
                })
            } catch (error: any) {
                console.log("Error getting calendar events")
                return error.message
            }
        }
    }, [isGLoggedIn, calendarId])

    useMemo(() => {
        appointmentInfo &&
            Geocode.fromAddress(appointmentInfo?.location).then(
                (response) => {
                    const { lat, lng } = response.results[0].geometry.location;
                    // {lat, lng} are google-map-react component props
                    setMapCoords({ lat: lat, lng: lng })
                    setMapMarker(<MapMarker lat={lat} lng={lng} />)
                },
                (error) => {
                    console.error(error);
                }
            );
    }, [appointmentInfo])
    console.log(calendarEvents)
    return (
        <>
            <div className='wrapper'>
                <div className='appointments-wrapper'>
                    <div className='appointments-list'>
                        <div className='appointments-header'>
                            <h3>Appointments</h3>
                        </div>
                        {isGLoggedIn ? (
                            calendarEvents && calendarId ?
                                <>
                                    <motion.div className="full-calendar-month"
                                        key='full-calendar'
                                        variants={yVariants}
                                        initial='initial'
                                        animate='animate'
                                    >
                                        <FullCalendar
                                            plugins={[dayGridPlugin, interactionPlugin]}
                                            initialView="dayGridMonth"
                                            initialEvents={calendarEvents}
                                            height='auto'
                                            headerToolbar={{
                                                left: 'title',
                                                center: '',
                                                right: 'prev,next'
                                            }}
                                            // visibleRange={(currentDate) => {
                                            //     console.log(currentDate)
                                            //     const startDate = new Date(currentDate.valueOf());
                                            //     const endDate = new Date(currentDate.valueOf());
                                            //     // Adjust the start & end dates, respectively
                                            //     startDate.setDate(startDate.getDate() - 1); // One day in the past
                                            //     endDate.setDate(endDate.getDate() + 180); // Six months into the future
                                            //     console.log(startDate, endDate)
                                            //     return {start: startDate, end: endDate}
                                            // }}
                                            duration={{ 'days': 180 }}
                                            timeZone='America/New_York'
                                            dateClick={(info) => {
                                                setStartDate(info.dateStr)
                                                setEndDate(info.dateStr)
                                                setAppointmentInfo(undefined)
                                            }}
                                            eventClick={(info) => {
                                                info.jsEvent.preventDefault(); // don't let the browser navigate
                                                // open event link in new window
                                                // if (info.event.url) {
                                                // window.open(info.event.url);
                                                // }
                                                const infoRef = {
                                                    id: info.event.id,
                                                    title: info.event.title,
                                                    start: info.event.startStr,
                                                    end: info.event.endStr,
                                                    description: info.event.extendedProps.description,
                                                    location: info.event.extendedProps.location,
                                                    url: info.event.url,
                                                    allDay: info.event.allDay,
                                                }
                                                setAppointmentInfo(infoRef)

                                            }}
                                            selectable={true}
                                        />
                                    </motion.div>
                                </>
                                : null)
                            : null}
                    </div>
                    <div className='appointments-side'>
                        <div className='appointments-side-header'>
                            {appointmentInfo
                                ? <h4>Appointment Details</h4>
                                : <h3>Create an appointment</h3>
                            }
                        </div>
                        <div className='appointments-side-body'>
                            {appointmentInfo
                                ? (
                                    <motion.div className="calendar-info"
                                        key='calendar-info'
                                        variants={xVariants}
                                        initial='initial'
                                        animate='animate'
                                        exit={{ x: -10, opacity: 0 }}
                                    >
                                        <div className="calendar-info-title-date">
                                            <div className="calendar-info-title">
                                                <span />
                                                <h4>{appointmentInfo?.title}</h4>
                                            </div>

                                            <h5>{new Date(appointmentInfo?.start).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                            </h5>
                                            {appointmentInfo?.allDay === false && (
                                                <div id='times'>
                                                    <h5>{new Date(appointmentInfo?.start).toLocaleTimeString('en-US', {
                                                        timeZone: 'America/New_York',
                                                        hour12: true,
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                    </h5>
                                                    <p>-</p>
                                                    <h5>{new Date(appointmentInfo?.end).toLocaleTimeString('en-US', {
                                                        timeZone: 'America/New_York',
                                                        hour12: true,
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                    </h5>
                                                </div>
                                            )}

                                        </div>
                                        <div className="calendar-info-location">
                                            {/* <h6>Location:</h6> */}
                                            <MdLocationPin color='#737373' size='24px' />
                                            {appointmentInfo.location ?
                                                <p>{appointmentInfo?.location}</p>
                                                : !appointmentInfo?.location && !locationToggle
                                                    ? <motion.button onClick={() => setLocationToggle(true)}>Add a location</motion.button>
                                                    : !appointmentInfo?.location && locationToggle
                                                        ? <motion.input
                                                            initial={{ opacity: 0.5, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            value={locationInput}
                                                            onChange={(e) => setLocationInput(e.target.value)}
                                                        />
                                                        : null}
                                        </div>
                                        <div className="calendar-info-description">
                                            {/* <h6>Description:</h6> */}
                                            <MdPerson color='#737373' size='24px' />
                                            <div className="calendar-info-description-value">
                                                {appointmentInfo?.description ?
                                                    <p>{appointmentInfo?.description}</p>
                                                    : !appointmentInfo?.description && !descriptionToggle
                                                        ? <button onClick={() => setDescriptionToggle(true)}>Add clients</button>
                                                        : !appointmentInfo?.description && descriptionToggle
                                                            ? <motion.input
                                                                initial={{ opacity: 0.5, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                value={descriptionInput}
                                                                onChange={(e) => setDescriptionInput(e.target.value)} />
                                                            : null}
                                            </div>
                                        </div>
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
                                        <button className="view" onClick={() => window.open(appointmentInfo?.url)}>View in Google Calendar</button>
                                    </motion.div>
                                )
                                : (
                                    <form>
                                        <label>Title *</label>
                                        <input required={true} value={title} onChange={(e) => setTitle(e.target.value)}></input>
                                        <div className='form-date-time'>
                                            <span id='start-date-time'>
                                                <label>Start Date *</label>
                                                <input type="date" id="start-date"
                                                    required={true}
                                                    defaultValue={startDate || new Date().toISOString().substring(0, 10)}
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
                                                    defaultValue={startDate || new Date().toISOString().substring(0, 10)}
                                                    value={endDate}
                                                    min={startDate || "2022-01-01"}
                                                    max="2025-12-31"
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
                                                <button className='submit-btn' onClick={(e) => createAppointment(e)}>Submit</button>
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
                                    </form>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Appointments