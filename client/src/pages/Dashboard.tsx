import React, { useContext, useEffect, useMemo, useState } from "react"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"

import { GetUserDefaultCalendarDocument, useAllListingsQuery, useDisplayUserQuery, useGetUserDefaultCalendarQuery, useGetUserDefaultContactGroupQuery, useSetDefaultCalendarMutation } from "../generated/graphql"

import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid'
import '../utils/fullCalendar/fullCalendar.css'
import GoogleMap from "google-map-react"
import Geocode from "react-geocode"
import { GlobalContext } from "../App";
import { MdLocationPin, MdPerson, MdArrowBack, MdOutlineAccessTime } from "react-icons/md"
import { FaGoogle } from "react-icons/fa"
import GoogleConnected from "../components/GoogleConnected";
import ContactGroups from "../components/ContactGroups";
import { CgCalendarToday } from "react-icons/cg";


interface MapMarkerProps {
    listingId: string;
    lat: number;
    lng: number;
}

const MapMarker: React.FC<MapMarkerProps> = ({ listingId }) => {
    const navigate = useNavigate()
    return (
        <>
            <motion.div className="map-marker"
                onClick={() => navigate(`/listings/${listingId}`)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 5, delay: 0.5 }}
            />
        </>
    )
}

const Dashboard: React.FC = () => {
    const { isGLoggedIn, setIsGLoggedIn, calendarEvents, setCalendarEvents, contacts, setContacts } = useContext(GlobalContext)
    const navigate = useNavigate()
    const { data: allListingsData, loading } = useAllListingsQuery()

    const activeListingsTotal = allListingsData?.allListings.filter(l => l.status === "Active").length
    const activeListings = allListingsData?.allListings.filter(l => l.status === "Active")

    const activeDataFilled = [
        { label: "Queens", value: activeListings?.filter(l => l.area === "Queens").length },
        { label: "Brooklyn", value: activeListings?.filter(l => l.area === "Brooklyn").length },
        { label: "Bronx", value: activeListings?.filter(l => l.area === "Bronx").length },
        { label: "Manhattan", value: activeListings?.filter(l => l.area === "Manhattan").length },
        { label: "Long Island", value: activeListings?.filter(l => l.area === "Long Island").length },
        { label: "New Jersey", value: activeListings?.filter(l => l.area === "New Jersey").length },
        { label: "Staten Island", value: activeListings?.filter(l => l.area === "Staten Island").length },
    ]

    const activeData = useMemo(() => {
        const arr: any[] = []
        activeDataFilled.filter(d => d.value !== 0).map(x => {
            arr.push(x)
        })
        return arr
    }, [activeDataFilled])

    const yVariants = {
        initial: { y: 10, opacity: 0.5 },
        animate: { y: 0, opacity: 1 }
    }

    const xVariants = {
        initial: { x: -10, opacity: 0.5 },
        animate: { x: 0, opacity: 1 }
    }

    const [activePieIndex, setActivePieIndex] = useState<number>(0)

    const onPieEnter = (_: any, index: any) => {
        setActivePieIndex(index)
    };

    const pieColorScale = [
        "#13345d",
        "#2c5990",
        "#769ac5",
        "#9cbee8",
        "#9cbee8ad",
    ]

    const renderActiveShape = (props: { cx: any; cy: any; innerRadius: any; outerRadius: any; startAngle: any; endAngle: any; fill: any; payload: any; }) => {

        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;

        return (
            <g>
                <text className="pie-label-a" x={cx} y={cy} dy={-2} textAnchor="middle" fill="#000000">
                    {payload.label}
                </text>
                <text className="pie-label-b" x={cx} y={cy} dy={20} textAnchor="middle" fill="#838282">
                    {payload.value} {payload.value > 1 ? 'Listings' : 'Listing'}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                />
            </g>
        );
    };

    const dashboardListings = useMemo(() => {
        const arr = allListingsData?.allListings.slice(0, 3)
        return arr
    }, [allListingsData])

    const googleAuth = async () => {
        try {
            const request = await fetch("http://localhost:4000/auth/google", {
                method: "POST",
            });
            const response = await request.json();
            console.log(response)
            window.location.href = response.url;
        } catch (error: any) {
            console.log("App.js 12 | error", error);
            throw new Error(error.message);
        }
    }

    // const handleTokenFromQueryParams = () => {
    //     console.log(query)
    //     const expirationDate = newExpirationDate();
    //     console.log("App.js 30 | expiration Date", expirationDate);
    //     console.log(accessToken)
    //     console.log(refreshToken)
    //     if (accessToken && refreshToken) {
    //         storeTokenData(accessToken, refreshToken, expirationDate)
    //     }
    // }

    // const newExpirationDate = () => {
    //     var expiration = new Date();
    //     expiration.setHours(expiration.getHours() + 1);
    //     return expiration;
    // };

    // const storeTokenData = (accessToken: string, refreshToken: string, expirationDate: Date) => {
    //     localStorage.setItem("gAccessToken", accessToken);
    //     localStorage.setItem("gRefreshToken", refreshToken);
    //     localStorage.setItem("gExpirationDate", expirationDate.toDateString());
    //     console.log(accessToken, refreshToken)
    // };

    const gLogOut = async () => {
        await axios.get("http://localhost:4000/auth/google/logout", {
            withCredentials: true
        }).then(() => {
            setIsGLoggedIn(false)
            console.log(isGLoggedIn)
        }).catch(err => {
            console.log(err)
            throw new Error(err)
        })
    };

    const [loginModal, setLoginModal] = useState<boolean>(true)

    const { data: userData } = useDisplayUserQuery({
        onError: (error) => console.log(error)
    })

    const { data: getContactGroupData, loading: contactGroupIdLoading } = useGetUserDefaultContactGroupQuery({
        onError: (error: any) => console.log(error)
    })

    const contactGroupId = getContactGroupData?.getUserDefaultContactGroup.defaultContactGroupId

    const [calendars, setCalendars] = useState<any[] | null>()
    const { data: getCalendarData, loading: calendarIdLoading } = useGetUserDefaultCalendarQuery({
        onError: (error) => console.log(error)
    })
    const calendarId = getCalendarData?.getUserDefaultCalendar.defaultCalendarId

    const [setDefaultCalendar] = useSetDefaultCalendarMutation({
        onError: (error) => {
            console.log(error)
        }
    })
    const [calendarInfo, setCalendarInfo] = useState<any>()

    // calendar appointments inputs
    const [calendarInput, setCalendarInput] = useState<string>("Horizon Appointments")
    const [descriptionToggle, setDescriptionToggle] = useState<boolean>(false)
    const [descriptionInput, setDescriptionInput] = useState<string>()
    const [locationToggle, setLocationToggle] = useState<boolean>(false)
    const [locationInput, setLocationInput] = useState<string>()

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
    const gCalendarEdit = async (eventId: string) => {
        const reqBody = {}
        if (descriptionInput) {
            Object.assign(reqBody, { description: descriptionInput })
        }
        if (locationInput) {
            Object.assign(reqBody, { location: locationInput })
        }
        await axios.patch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
            reqBody
        ).then(res => {
            // console.log(res)
            // update calendarInfo (cache state)
            const calendarInfoRef = calendarInfo
            if (descriptionInput) {
                Object.assign(calendarInfoRef, {
                    description: res.data.description
                })
            }
            if (locationInput) {
                Object.assign(calendarInfoRef, {
                    location: res.data.location
                })
            }
            setCalendarInfo(calendarInfoRef)
            // update global state
            const updatedEvent = calendarEvents.find((event: any) => event.id === eventId)
            if (descriptionInput) {
                Object.assign(updatedEvent, {
                    extendedProps: {
                        description: res.data.description
                    }
                })
            }
            if (locationInput) {
                Object.assign(updatedEvent, {
                    extendedProps: {
                        location: res.data.location
                    }
                })
            }
            const otherEvents = calendarEvents.filter((event: any) => event.id !== eventId)
            const updatedEvents = [...otherEvents, updatedEvent]
            setCalendarEvents(updatedEvents)

            // reset toggles and inputs states
            setDescriptionToggle(false)
            setDescriptionInput(undefined)
            setLocationToggle(false)
            setLocationInput(undefined)
        })
    }

    // set Google Maps Geocoding API
    Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY!);
    Geocode.setLanguage("en");
    Geocode.setRegion("us");

    const [mapMarkers, setMapMarkers] = useState<any[]>([])
    // console.log(mapMarkers)
    // console.log(allListingsData?.allListings)

    // const [contactGroups, setContactGroups] = useState<any[] | null>()

    // const { data: getContactGroupData, loading: contactGroupIdLoading } = useGetUserDefaultContactGroupQuery({
    //     onError: (error) => console.log(error)
    // })
    // const contactGroupId = getContactGroupData?.getUserDefaultContactGroup.defaultContactGroupId
    // const { contacts, setContacts } = useContext(GlobalContext)
    // const [setDefaultContactGroup] = useSetDefaultContactGroupMutation({
    //     onError: (error) => {
    //         console.log(error)
    //     }
    // })
    // const [contactsInput, setContactsInput] = useState<string>("Horizon Clients")

    // const getGContactGroupsList = async () => {
    //     await axios.get('https://people.googleapis.com/v1/contactGroups')
    //         .then(res => {
    //             // console.log(res.data.contactGroups)
    //             const groupsRef: any[] = []
    //             // get user contact groups
    //             res.data.contactGroups.map((group: { groupType: string; formattedName: string; resourceName: string; }) => {
    //                 if (group.groupType === 'USER_CONTACT_GROUP') {
    //                     groupsRef.push({
    //                         formattedName: group.formattedName,
    //                         resourceName: group.resourceName
    //                     })
    //                 }
    //             })
    //             // set groups
    //             groupsRef.length > 0 && (
    //                 setContactGroups(groupsRef)
    //             )
    //         })
    //         .catch(err => {
    //             throw new Error(err)
    //         })
    // }
    // console.log(userData)
    // const chooseContactGroup = async (cGroupId: string) => {
    //     await setDefaultContactGroup({
    //         variables: {
    //             contactGroupId: cGroupId,
    //             userId: userData?.displayUser?.id!
    //         },
    //         refetchQueries: [{ query: GetUserDefaultContactGroupDocument }]
    //     })
    // }

    useEffect(() => {
        if (allListingsData) {
            // map coordinates and set map markers
            allListingsData?.allListings.map((listing: { id: string; address1: string; address2: string; }) => {
                const address: string = listing.address1 + listing.address2
                return (
                    Geocode.fromAddress(address).then(
                        (response) => {
                            const { lat, lng } = response.results[0].geometry.location;
                            setMapMarkers((mapMarkers: any) => [...mapMarkers, <MapMarker listingId={listing.id} lat={lat} lng={lng} />])
                        },
                        (error) => {
                            console.error(error);
                        }
                    )
                )
            })
        }
    }, [allListingsData])

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

    // useEffect(() => {
    //     if (isGLoggedIn && !contactGroupIdLoading && !contactGroupId) {
    //         getGContactGroupsList()
    //     }
    // }, [isGLoggedIn, contactGroupId])

    // useMemo(() => {
    //     if (isGLoggedIn && contactGroupId && !contacts) {
    //         const contactsRef: string[] = []
    //         axios.get(`https://people.googleapis.com/v1/${contactGroupId}`, {
    //             params: {
    //                 maxMembers: 200
    //             }
    //         }).then((res) => {
    //             console.log(res.data)
    //             const gContactItems = res.data.memberResourceNames
    //             gContactItems.map((cId: string) => {
    //                 contactsRef.push(cId)
    //             })
    //         }).then(() => {
    //             const paramsRef = new URLSearchParams()
    //             contactsRef.map(c => {
    //                 paramsRef.append("resourceNames", c)
    //             })
    //             paramsRef.append("personFields", 'names,phoneNumbers,emailAddresses')

    //             axios.get('https://people.googleapis.com/v1/people:batchGet', {
    //                 params: paramsRef
    //             }).then(res => {
    //                 const contactItemsRef: { id: string | null; lastName: string | null; firstName: string | null; phoneNumber: string | null; }[] = []
    //                 const gContactsData = res.data.responses
    //                 gContactsData.forEach((obj: { person: { resourceName: string, names: { givenName: string, familyName: string }[]; phoneNumbers: { canonicalForm: string; }[]; }; }) => {
    //                     contactItemsRef.push({
    //                         id: obj.person.resourceName,
    //                         lastName: obj.person.names[0].familyName,
    //                         firstName: obj.person.names[0].givenName,
    //                         phoneNumber: obj.person.phoneNumbers[0].canonicalForm,
    //                     })
    //                 })
    //                 setContacts(contactItemsRef)
    //             })
    //         }).catch(err => console.log(err))
    //     }
    // }, [isGLoggedIn, contactGroupId])

    // all component variables loaded ? else { skeletonloading...}
    return (
        <>
            {isGLoggedIn === false && loginModal && (
                <>
                    <motion.div className="dashboard-g-login-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setLoginModal(false)}
                    />
                    <motion.div key='g-login' className="dashboard-g-login-modal"
                        initial={{ opacity: 0.5, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        {/* <div className="close-btn">
                        <IoCloseCircle color="red" size="18px" />
                    </div> */}
                        <span>
                            <h6>Connect your Google Account</h6>
                            <h6>to access Calendars and Contacts</h6>
                        </span>
                        <motion.button className="g-login-btn" onClick={googleAuth}><FaGoogle color='white' size='18px' />Sign in with Google</motion.button>
                    </motion.div>
                </>
            )}
            <div className="wrapper">
                <motion.div className="dashboard-wrapper"
                    initial={{ y: 10, opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <motion.div className="page-header">
                        <h3>Dashboard</h3>
                        <span className="page-header-end">
                            {isGLoggedIn && (
                                <GoogleConnected />
                            )}
                            <button className="btn-primary" onClick={() => navigate("/listings/create")}>Create Listing</button>
                        </span>
                    </motion.div>
                    <motion.div className="dashboard-body">
                        {/* <motion.div className="dashboard-row-top"> */}

                        <motion.div className="dashboard-info-card pie">
                            <AnimatePresence>
                                <div className="dashboard-card-header">
                                    <h4>Active Listings</h4>
                                </div>
                                <div className="dashboard-card-body">
                                    {activeData.length ? (
                                        <>
                                            <ResponsiveContainer width='95%' height='95%'>
                                                <PieChart>
                                                    <Pie
                                                        activeIndex={activePieIndex}
                                                        activeShape={renderActiveShape}
                                                        data={activeData}
                                                        dataKey='value'
                                                        nameKey='label'
                                                        innerRadius={60}
                                                        outerRadius={90}
                                                        paddingAngle={2}
                                                        onMouseEnter={onPieEnter}
                                                        onClick={(index) => {
                                                            navigate(`/listings?area=${index.label.replace(' ', '_')}`)
                                                        }}
                                                    >
                                                        {activeDataFilled.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={pieColorScale[index % pieColorScale.length]} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </>
                                    ) : null}
                                </div>
                            </AnimatePresence>
                        </motion.div>

                        <motion.div className="dashboard-info-card cal"
                        >
                            <div className="dashboard-card-header">
                                <h4>Appointments</h4>
                            </div>
                            <div className="dashboard-card-body">
                                <div className="calendar-events">
                                    <LayoutGroup>
                                        {isGLoggedIn ? (
                                            calendarEvents && calendarId && !calendarInfo ?
                                                <>
                                                    <motion.div className="full-calendar"
                                                        key='full-calendar'
                                                    >
                                                        <FullCalendar
                                                            plugins={[listPlugin, dayGridPlugin]}
                                                            initialView="list"
                                                            initialEvents={calendarEvents}
                                                            height='100%'
                                                            headerToolbar={false}
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
                                                            eventTimeFormat={{
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                meridiem: 'short'
                                                            }}
                                                            timeZone='America/New_York'
                                                            eventClick={(info) => {
                                                                info.jsEvent.preventDefault(); // don't let the browser navigate
                                                                // open event link in new window
                                                                // if (info.event.url) {
                                                                // window.open(info.event.url);
                                                                // }
                                                                const eventInfo = {
                                                                    id: info.event.id,
                                                                    title: info.event.title,
                                                                    start: info.event.startStr,
                                                                    end: info.event.endStr,
                                                                    description: info.event.extendedProps.description,
                                                                    location: info.event.extendedProps.location,
                                                                    url: info.event.url,
                                                                    allDay: info.event.allDay
                                                                }
                                                                setCalendarInfo(eventInfo)

                                                            }}
                                                        />
                                                    </motion.div>
                                                </>
                                                : calendarInfo ?
                                                    <>
                                                        <motion.div className="calendar-info"
                                                            key='calendar-info'
                                                            variants={xVariants}
                                                            initial='initial'
                                                            animate='animate'
                                                            exit={{ x: -10, opacity: 0 }}
                                                        >
                                                            <div className="calendar-info-header">
                                                                <h5>Event Details</h5>
                                                            </div>
                                                            <div className="calendar-info-title">
                                                                <span />
                                                                <h3>{calendarInfo?.title}</h3>
                                                            </div>
                                                            <div className="calendar-info-date">
                                                                <CgCalendarToday size='24px' color='#737373' />
                                                                <h5>{new Date(calendarInfo?.start).toLocaleDateString('en-US', {
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
                                                                    {calendarInfo?.allDay
                                                                        ? (
                                                                            <h5>All-Day</h5>
                                                                        )
                                                                        : (
                                                                            <>
                                                                                <h5>{new Date(calendarInfo?.start).toLocaleTimeString('en-US', {
                                                                                    hour12: true,
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                })}
                                                                                </h5>
                                                                                <p>-</p>
                                                                                <h5>{new Date(calendarInfo?.end).toLocaleTimeString('en-US', {
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

                                                            {calendarInfo.location &&
                                                                <div className="calendar-info-location">
                                                                    {/* <h6>Location:</h6> */}
                                                                    <MdLocationPin color='#737373' size='24px' />

                                                                    <p>{calendarInfo?.location}</p>
                                                                </div>
                                                            }
                                                            {calendarInfo?.description &&
                                                                <div className="calendar-info-description">
                                                                    {/* <h6>Description:</h6> */}
                                                                    <MdPerson color='#737373' size='24px' />
                                                                    <div className="calendar-info-description-value">
                                                                        <p>{calendarInfo?.description}</p>
                                                                    </div>
                                                                </div>
                                                            }

                                                            <div className="calendar-info-link">
                                                                <button className="return btn-grey"
                                                                    onClick={() => {
                                                                        // null calendar info, returns to no-cal-view-all state <FullCalendar/>
                                                                        setCalendarInfo(null)
                                                                    }}
                                                                >
                                                                    <MdArrowBack color="grey" size='18px' />
                                                                </button>
                                                                <button className="view" onClick={() => window.open(calendarInfo.url)}>View in <FaGoogle color='white' size='12px' /> Calendar</button>
                                                            </div>
                                                        </motion.div>
                                                    </>
                                                    : !calendarIdLoading && !calendarId ?
                                                        <>
                                                            <motion.div className="calendar-list"
                                                                key='cal-list'
                                                            >
                                                                <form>
                                                                    <h6>Create a new Google Calendar:</h6>
                                                                    <input placeholder="Horizon Appointments"
                                                                        value={calendarInput}
                                                                        onChange={(e) => setCalendarInput(e.target.value)}
                                                                    />
                                                                    <button className="create-calendar">Create Calendar</button>
                                                                </form>
                                                                {calendars &&
                                                                    <div className="calendar-list-existing">
                                                                        <h6>Or choose an existing account calendar:</h6>
                                                                        <ul>
                                                                            {calendars?.map((cal: { id: string, name: string, color: string }) => {
                                                                                return <li onClick={() => chooseCalendar(cal.id)}><span style={{ backgroundColor: `${cal.color}` }}></span>{cal.name}</li>
                                                                            })}
                                                                        </ul>
                                                                    </div>
                                                                }
                                                            </motion.div>
                                                        </>
                                                        : null // skeleton loading?
                                        )
                                            : isGLoggedIn === false ?
                                                <>
                                                    <div className="calendar-events-login">
                                                        <motion.button className="g-login-btn" onClick={googleAuth}><FaGoogle color='white' size='18px' />Sign in with Google</motion.button>
                                                    </div>
                                                </> : null
                                        }
                                    </LayoutGroup>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div className="dashboard-info-card contacts">
                            <div className="dashboard-card-header">
                                <h4>Clients</h4>
                            </div>
                            <div className="dashboard-card-body">
                                <div className="clients-dashboard">
                                    {isGLoggedIn ? (
                                        contacts && contactGroupId ?
                                            <>
                                                <ul className="clients-list">
                                                    {contacts.map((contact: any) => {
                                                        const contactId = contact.id.replace('people/', "")
                                                        return (
                                                            <li>
                                                                <div>
                                                                    <h4 onClick={() => window.open(`https://contacts.google.com/person/${contactId}`)}>{contact.firstName}</h4>
                                                                    <h4 onClick={() => window.open(`https://contacts.google.com/person/${contactId}`)}>{contact.lastName}</h4></div>
                                                                <div><span /><p onClick={() => window.open(`https://contacts.google.com/person/${contactId}`)}>{contact.phoneNumber}</p></div>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            </>
                                            : !contactGroupIdLoading && !contactGroupId ?
                                                <ContactGroups />
                                                : null
                                    )
                                        : (
                                            null
                                        )
                                    }
                                </div>
                            </div>
                        </motion.div>
                        {/* </motion.div> */}
                        {/* <motion.div className="dashboard-row-bottom"> */}
                        <motion.div className="dashboard-info-card table">
                            <div className="dashboard-card-header dashboard-header-mb-0">
                                <h4>Recent Listings</h4>
                            </div>
                            <div className="dashboard-card-body">
                                {dashboardListings &&
                                    <>

                                        <table>
                                            <thead>
                                                <tr className="thead-row">
                                                    <th></th>
                                                    <th>ADDRESS</th>
                                                    <th>PRICE</th>
                                                    <th>BEDS</th>
                                                    <th>BATHS</th>
                                                    <th>STATUS</th>
                                                    <th>AREA</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {dashboardListings && dashboardListings?.map((listing: any) => {
                                                    const listingId = listing?.id

                                                    return (
                                                        <>
                                                            <tr id={listingId} onClick={() => navigate(`/listings/${listingId}`)}>
                                                                <td><img src={listing.image1} /></td>
                                                                <td>
                                                                    <p className="address1">{listing.address1}</p>
                                                                    <p className="address2">{listing.address2}</p>
                                                                </td>
                                                                <td>
                                                                    <p className="td-p-bold">$ {listing.price.toLocaleString('en-US')}</p>
                                                                </td>
                                                                <td>
                                                                    <p className="td-p-bold">{listing.beds}</p>
                                                                </td>
                                                                <td>
                                                                    <p className="td-p-bold">{listing.baths}</p>
                                                                </td>
                                                                <td><p className={`td-p-bold ${listing.status == "Active" ? "status-active" : "status-sold"}`}>{listing.status}</p></td>
                                                                <td><p className="td-p-bold">{listing.area}</p></td>
                                                            </tr>
                                                        </>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </>
                                }
                            </div>
                        </motion.div>

                        <motion.div className="dashboard-info-card map">
                            <div className="dashboard-card-header">
                                <h4>Listings Map</h4>
                            </div>
                            <div className="dashboard-card-body">
                                <div className="listings-map">
                                    <GoogleMap
                                        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY! }}
                                        center={{ lat: 40.7366, lng: -73.8200 }}
                                        defaultZoom={10}
                                        options={{
                                            fullscreenControl: false,
                                            scrollwheel: true,
                                            zoomControl: false,
                                        }}
                                    >
                                        {mapMarkers}
                                    </GoogleMap>
                                </div>
                            </div>
                        </motion.div>
                        {/* </motion.div> */}
                    </motion.div>
                </motion.div>
            </div>
        </>
    )
}

export default Dashboard