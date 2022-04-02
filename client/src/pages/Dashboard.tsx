import React, { createRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"

import { GetUserDefaultCalendarDocument, GetUserDefaultContactGroupDocument, useAllListingsQuery, useDisplayUserQuery, useGetUserDefaultCalendarQuery, useGetUserDefaultContactGroupQuery, useSetDefaultCalendarMutation, useSetDefaultContactGroupMutation } from "../generated/graphql"
import { Doughnut, Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useLocation, useNavigate } from "react-router-dom";
import { gapi } from 'gapi-script'
import { SignInButton, useGoogleAuth, useGoogleUser } from "react-gapi-auth2";
import axios from "axios";
import GoogleSignin from "../utils/GoogleSignIn";
import { getGToken } from "../utils/gTokens";
import FullCalendar from "@fullcalendar/react";
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid'
import '../utils/fullCalendar/fullCalendar.css'
import GoogleMap from "google-map-react"
import Geocode from "react-geocode"
import { GlobalContext } from "../App";
import { MdLocationPin, MdPerson, MdArrowBack } from "react-icons/md"
import { FaGoogle } from "react-icons/fa"
import { IoCloseCircle } from "react-icons/io5"

interface MapMarkerProps {
    listingId: string;
    lat: number;
    lng: number;
}

const MapMarker: React.FC<MapMarkerProps> = ({listingId}) => {
    const navigate = useNavigate()
    return (
        <>
        <motion.div className="map-marker" 
            onClick={() => navigate(`/listings/${listingId}`)}
            initial={{scale: 0, opacity:0}}
            animate={{scale: 1, opacity:1}}
            transition={{type: 'spring', damping:5, delay: 0.5}}
        />
        </>
    )
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate()
    const {data:allListingsData, loading} = useAllListingsQuery()

    const activeListingsTotal = allListingsData?.allListings.filter(l => l.status === "Active").length
    const activeListings = allListingsData?.allListings.filter(l => l.status === "Active")
    const soldListings = allListingsData?.allListings.filter(l => l.status === "Sold")

    const activeDataFilled = [
        {label: "Queens", value: activeListings?.filter(l => l.area === "Queens").length},
        {label: "Brooklyn", value: activeListings?.filter(l => l.area === "Brooklyn").length},
        {label: "Bronx", value: activeListings?.filter(l => l.area === "Bronx").length},
        {label: "Manhattan", value: activeListings?.filter(l => l.area === "Manhattan").length},
        {label: "Long Island", value: activeListings?.filter(l => l.area === "Long Island").length},
        {label: "New Jersey", value: activeListings?.filter(l => l.area === "New Jersey").length},
        {label: "Staten Island", value: activeListings?.filter(l => l.area === "Staten Island").length},
    ]

    const activeDataLabels = useMemo(() => {
        const arr: any[] = []
        activeDataFilled.filter(d => d.value !== 0).map(x => {
            arr.push(x.label)
        })
        return arr
    }, [activeDataFilled])

    const activeDataValues = useMemo(() => {
        const arr: any[] = []
        activeDataFilled.filter(d => d.value !== 0).map(x => {
            arr.push(x.value)
        })
        return arr
    }, [activeDataFilled])

    const yVariants = {
        initial: {y: 10, opacity: 0.5},
        animate: {y: 0, opacity: 1}
    }

    const xVariants = {
        initial: {x: -10, opacity: 0.5},
        animate: {x: 0, opacity: 1}
    }

    const pieColorScale = [
        "#FCA703",
        "#FF5E4F",
        "rgba(98, 142, 255, 1)",
        "#62F4AC",
        "#FFA49C",
        "#ADC5FF",
    ]

    ChartJS.register(ArcElement, Tooltip, Legend);

    const activeData = {
        labels: activeDataLabels,
        datasets: [
          {
            label: 'Areas',
            data: activeDataValues,
            fill: true,
            backgroundColor: pieColorScale,
            hoverBackgroundColor: pieColorScale,
            borderWidth: 1,
          },
        ],
    };

    const activeOptions = {
        layout: {
            padding: 16,
        },
        borderWidth: 0,
        spacing: 1,
        hoverBorderWidth: 0,
        hoverOffset: 10,
        plugins: {
            tooltip: {
                enabled: false,
            //     intersect: true,
            //     displayColors: false,
            //     backgroundColor: 'rgba(249, 249, 249, 1)',
            //     bodyColor: 'rgba(115, 115, 115, 1)',
            //     bodyFont: {
            //         family: "'Noto Sans', sans-serif",
            //         size: 13,
            //         weight: '700'
            //     },
            //     caretSize: 3,
            //     callbacks: {
            //         label: function(context: { dataset: { data: { [x: string]: any; }; }; dataIndex: string | number; }) {
            //             let label
            //             if (context.dataIndex === 1) {
            //                 label = context.dataset.data[context.dataIndex] + " listing"
            //             } else {
            //                 label = context.dataset.data[context.dataIndex] + " listings"
            //             }
            //             return label;
            //         }
            //     }
            },
            legend: {
                display: false,
            },
        }
    }

    // useEffect(() => {
    //     setTimeout(() => {
    //         setActiveData(activeDataFilled)
    //         // setEndAngle(360)
    //     }, 100)
    // }, [])

    console.log(activeData)

    const soldData = [
        soldListings?.filter(l => l.area === "Queens").length,
        soldListings?.filter(l => l.area === "Brooklyn").length,
        soldListings?.filter(l => l.area === "Bronx").length,
        soldListings?.filter(l => l.area === "Manhattan").length,
        soldListings?.filter(l => l.area === "Long Island").length,
        soldListings?.filter(l => l.area === "New Jersey").length,
        soldListings?.filter(l => l.area === "Staten Island").length,
    ]

    const dashboardListings = useMemo(() => {
        const arr = allListingsData?.allListings.slice(0,3)
        return arr
    }, [allListingsData])

    const [events, setEvents] = useState(null);

    const [showAuthButton, setShowAuthButton] = useState(true)
    const [showSignOutButton, setShowSignOutButton] = useState(false)
    
    const [isGLoggedIn, setIsGLoggedIn] = useState<boolean | null | undefined>(null) 
    
    const googleAuth = async () => {
        try {
            const request = await fetch("http://localhost:4000/auth/google", {
                method: "POST",
            });
            const response = await request.json();
            console.log(response)
            window.location.href = response.url;
        } catch (error:any) {
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
    
    const gLogOut = async() => {
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

    const {data: userData} = useDisplayUserQuery({
        onError: (error) => console.log(error)
    })

    const [calendars, setCalendars] = useState<any[] | null>()
    const {data: getCalendarData, loading: calendarIdLoading} = useGetUserDefaultCalendarQuery({
        onError: (error) => console.log(error)
    }) 
    const calendarId = getCalendarData?.getUserDefaultCalendar.defaultCalendarId
    const {calendarEvents, setCalendarEvents} = useContext(GlobalContext)
    const [setDefaultCalendar] = useSetDefaultCalendarMutation({
        onError: (error) => {
            console.log(error)
        }
    })
    
    // calendar appointments inputs
    const [calendarInput, setCalendarInput] = useState<string>("Horizon Appointments")
    const [calendarInfo, setCalendarInfo] = useState<any>()
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
                    res.data.items.map((cal: { id: string, summary: string, backgroundColor:string }) => {
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
        } catch (error:any) {
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
            refetchQueries: [{query: GetUserDefaultCalendarDocument}]
        })
    }

    // edit calendar event
    const gCalendarEdit = async(eventId:string) => {
        const reqBody = {}
        if (descriptionInput) {
            Object.assign(reqBody, {description: descriptionInput})
        }
        if (locationInput) {
            Object.assign(reqBody, {location: locationInput})
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
                const updatedEvent = calendarEvents.find((event:any) => event.id === eventId)
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
                const otherEvents = calendarEvents.filter((event:any) => event.id !== eventId)
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

    const [contactGroups, setContactGroups] = useState<any[] | null>()

    const {data: getContactGroupData, loading: contactGroupIdLoading} = useGetUserDefaultContactGroupQuery({
        onError: (error) => console.log(error)
    }) 
    const contactGroupId = getContactGroupData?.getUserDefaultContactGroup.defaultContactGroupId
    const {contacts, setContacts} = useContext(GlobalContext)
    const [setDefaultContactGroup] = useSetDefaultContactGroupMutation({
        onError: (error) => {
            console.log(error)
        }
    })
    const [contactsInput, setContactsInput] = useState<string>("Horizon Clients")
    
    const getGContactGroupsList = async () => {
        await axios.get('https://people.googleapis.com/v1/contactGroups')
            .then(res => {
                // console.log(res.data.contactGroups)
                const groupsRef: any[] = []
                // get user contact groups
                res.data.contactGroups.map((group: { groupType: string; formattedName: string; resourceName: string; }) => {
                    if (group.groupType === 'USER_CONTACT_GROUP'){
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
            })
            .catch(err => {
                throw new Error(err)
            })
    }
    console.log(userData)
    const chooseContactGroup = async (cGroupId: string) => {
        await setDefaultContactGroup({
            variables: {
                contactGroupId: cGroupId,
                userId: userData?.displayUser?.id!
            },
            refetchQueries: [{query: GetUserDefaultContactGroupDocument}]
        })
    }

    useEffect(() => {
        if (allListingsData) {
            // map coordinates and set map markers
            allListingsData?.allListings.map((listing: { id: string; address1: string; address2: string; }) => {
                const address:string = listing.address1 + listing.address2
                return (
                    Geocode.fromAddress(address).then(
                        (response) => {
                            const { lat, lng } = response.results[0].geometry.location;
                            setMapMarkers((mapMarkers: any) => [...mapMarkers, <MapMarker listingId={listing.id} lat={lat} lng={lng}/>])
                        },
                        (error) => {
                            console.error(error);
                        }
                    )
                )
            })
        }
    }, [allListingsData])
    
    useEffect(() => {
        let gLoginRef = false
        axios.post('http://localhost:4000/auth/google/silent-refresh', {}, {
            withCredentials:true
        }).then((res) => {
            const {gAccessToken} = res.data
            console.log(gAccessToken)
            if (gAccessToken) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${gAccessToken}`
                gLoginRef = true
            }   
        })
        // .then(() => {
        //     if (!calendarIdLoading && !getCalendarData && !calendarId && gLoginRef){
        //         getGCalendarsList()
        //     }
        // }).then(() => {
        //     // if (!contactGroupId){
        //     //     getGContactGroupsList()
        //     // }
        //     if (!contactGroupIdLoading && !getContactGroupData && !contactGroupId && gLoginRef) {
        //         getGContactGroupsList()
        //     }
        // })
        .then(() => {
            if (gLoginRef) {
                setIsGLoggedIn(true)
            } else {
                setIsGLoggedIn(false)
            }
        })
    }, [])

    // after login success, get Calendars Lists, if there is no default Calendar
    useEffect(() => {
        if (isGLoggedIn && !calendarIdLoading && !calendarId){
                getGCalendarsList()
            }
    }, [isGLoggedIn, calendarId])

    // onload, onGlogin & onCalIdSet, get calendar events if no calendars events
    useMemo(() => {
        if (isGLoggedIn && calendarId && !calendarEvents){
            try {

                const calItemsRef: { id: any; title: any; start: any; end: any; startTime: any; endTime: any; extendedProps: { description: any; location: any; }; url: any; }[] = []
                
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
                    }
                }).then(res => {
                    console.log(res.data.items)
                    const gCalItems = res.data.items
                    gCalItems.map((item:any) => {
                        calItemsRef.push({
                            id: item.id,
                            title: item.summary,
                            start: item.start.date,
                            end: item.end.date,
                            startTime: item.start.datetime,
                            endTime: item.end.dateTime,
                            extendedProps: {
                                description: item.description,
                                location: item.location
                            },
                            url: item.htmlLink
                        })
                    })
                    console.log(calItemsRef)
                    setCalendarEvents(calItemsRef)
                })
            } catch (error:any) {
                console.log("Error getting calendar events")
                return error.message
            }
        }
    }, [isGLoggedIn, calendarId])

    useEffect(() => {
        if (isGLoggedIn && !contactGroupIdLoading && !contactGroupId) {
            getGContactGroupsList()
        }
    }, [isGLoggedIn, contactGroupId])

    useMemo(() => {
        if (isGLoggedIn && contactGroupId && !contacts) {
            const contactsRef:string[] = []
            axios.get(`https://people.googleapis.com/v1/${contactGroupId}`, {
                params: {
                    maxMembers: 200
                }
            }).then((res) => {
                console.log(res.data)
                const gContactItems = res.data.memberResourceNames
                gContactItems.map((cId:string) => {
                    contactsRef.push(cId)
                })
            }).then(() => {
                const paramsRef = new URLSearchParams()
                contactsRef.map(c => {
                    paramsRef.append("resourceNames", c)
                }) 
                paramsRef.append("personFields", 'names,phoneNumbers,emailAddresses')
                
                axios.get('https://people.googleapis.com/v1/people:batchGet', {
                    params: paramsRef
                }).then(res => {
                    const contactItemsRef: { id: string | null; lastName: string | null; firstName: string | null; phoneNumber: string | null; }[] = []
                    const gContactsData = res.data.responses
                    gContactsData.forEach((obj: { person: { resourceName: string, names: { givenName: string, familyName: string }[]; phoneNumbers: { canonicalForm: string; }[]; }; }) => {
                        contactItemsRef.push({
                            id: obj.person.resourceName,
                            lastName: obj.person.names[0].familyName,
                            firstName: obj.person.names[0].givenName,
                            phoneNumber: obj.person.phoneNumbers[0].canonicalForm,
                        })
                    })
                    setContacts(contactItemsRef)
                })
            }).catch(err => console.log(err))
        }
    }, [isGLoggedIn, contactGroupId])

    // all component variables loaded ? else { skeletonloading...}
    return (
        <>
        {isGLoggedIn === false && loginModal && (
            <>
            <motion.div className="dashboard-g-login-modal-backdrop"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                onClick={() => setLoginModal(false)}
            />
                <motion.div key='g-login' className="dashboard-g-login-modal"
                    initial={{opacity: 0.5, scale: 0.5}}
                    animate={{opacity: 1, scale: 1}}
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
        <div className="dashboard-wrapper-ml">
            <motion.div className="dashboard-wrapper">
                <motion.div className="dashboard-header">
                    <h3>Dashboard</h3>
                </motion.div>
                <motion.div className="dashboard-body">
                    {/* <motion.div className="dashboard-row-top"> */}
                        
                        <motion.div className="dashboard-info-card pie">
                            <AnimatePresence>
                            <div className="dashboard-card-header">
                                <h4>Active Listings</h4>
                            </div>
                            <motion.div className="piechart-active-listings"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                            >
                                {allListingsData ? (
                                <>
                                <Doughnut data={activeData} 
                                    options={activeOptions}
                                />
                                </>
                                ):null}
                            </motion.div>
                            <div className="piechart-active-listings-legend">
                                {allListingsData && activeDataLabels?.map((label, i) => {
                                    return (
                                    <>
                                    <motion.div className="piechart-legend-item" 
                                        initial={{scale: 0, opacity: 0}}
                                        animate={{scale: 1, opacity: 1}}
                                    >
                                        <div className="label"
                                            style={{backgroundColor: pieColorScale[i]}}
                                        >
                                            <h6>{label}</h6>
                                        </div>
                                        <div className="value"
                                            style={{backgroundColor: pieColorScale[i]}}
                                        >
                                            <h6>{activeDataValues[i]}</h6>
                                        </div>
                                    </motion.div>
                                    </>
                                    )
                                })}
                            </div>
                            </AnimatePresence>
                        </motion.div>

                        <motion.div className="dashboard-info-card cal"
                            variants={yVariants}
                            initial='initial'
                            animate='animate'
                        >
                            <div className="dashboard-card-header">
                                <h4>Appointments</h4>
                            </div>
                            <div className="calendar-events">
                            <LayoutGroup>
                            {isGLoggedIn ? (
                                calendarEvents && calendarId && !calendarInfo ?
                                    <>
                                    <motion.div className="full-calendar"
                                        key='full-calendar'
                                        variants={yVariants}
                                        initial='initial'
                                        animate='animate'
                                    >
                                    <FullCalendar
                                        plugins={[ listPlugin, dayGridPlugin ]}
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
                                        duration={{'days': 180}}
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
                                        exit={{x: -10, opacity: 0}}
                                    >
                                        <div className="calendar-info-header">
                                            <h5>Event Details</h5>
                                        </div>
                                        <div className="calendar-info-title-date">
                                            <div className="calendar-info-title">
                                                <span />
                                                <h4>{calendarInfo.title}</h4>
                                            </div>
                                            
                                            <h5>{new Date(calendarInfo.start).toLocaleDateString('en-US', { 
                                                    weekday: 'long', 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </h5>
                                        </div>
                                        <div className="calendar-info-location">
                                            {/* <h6>Location:</h6> */}
                                            <MdLocationPin color='#737373' size='24px' />
                                            {calendarInfo.location ?
                                            <p>{calendarInfo.location}</p>
                                            : !calendarInfo.location && !locationToggle 
                                                ? <motion.button onClick={() => setLocationToggle(true)}>Add a location</motion.button>
                                                : !calendarInfo.location && locationToggle
                                                    ? <motion.input
                                                        initial={{opacity: 0.5, x: -10}}
                                                        animate={{opacity: 1, x: 0}}
                                                        value={locationInput} 
                                                        onChange={(e) => setLocationInput(e.target.value)} 
                                                        />
                                                    : null }
                                        </div>
                                        <div className="calendar-info-description">
                                            {/* <h6>Description:</h6> */}
                                            <MdPerson color='#737373' size='24px' />
                                            <div className="calendar-info-description-value">
                                                {calendarInfo.description ? 
                                                <p>{calendarInfo.description}</p>
                                                : !calendarInfo.description && !descriptionToggle 
                                                    ? <button onClick={() => setDescriptionToggle(true)}>Add clients</button>
                                                    : !calendarInfo.description && descriptionToggle
                                                        ? <motion.input 
                                                            initial={{opacity: 0.5, x: -10}}
                                                            animate={{opacity: 1, x: 0}}
                                                            value={descriptionInput} 
                                                            onChange={(e) => setDescriptionInput(e.target.value)} />
                                                        : null }
                                            </div>
                                        </div>
                                        {descriptionToggle || locationToggle
                                            ? 
                                            <div className="calendar-info-edit-buttons">
                                                <button className="cancel-btn"
                                                    onClick={ () => {
                                                        // reset states
                                                        setDescriptionToggle(false)
                                                        setDescriptionInput(undefined)
                                                        setLocationToggle(false)
                                                        setLocationInput(undefined)
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button className="submit-btn"
                                                    onClick={() => gCalendarEdit(calendarInfo.id)}
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                            :
                                            <div className="calendar-info-link">
                                                <button className="return" 
                                                    onClick={() => {
                                                        // null calendar info, returns to no-cal-view-all state <FullCalendar/>
                                                        setCalendarInfo(null)
                                                    }}
                                                >
                                                    <MdArrowBack color="grey" size='18px'/>
                                                </button>
                                                <button className="view" onClick={() => window.open(calendarInfo.url)}>View in Google Calendar</button>
                                            </div>
                                        }
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
                                            {calendars?.map((cal: { id: string, name: string, color:string }) => {
                                                return <li onClick={() => chooseCalendar(cal.id)}><span style={{backgroundColor: `${cal.color}`}}></span>{cal.name}</li>
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
                        </motion.div>
                        
                        <motion.div className="dashboard-info-card contacts">
                            <div className="dashboard-card-header">
                                <h4>Clients</h4>
                            </div>
                            <div className="clients-dashboard">
                                {isGLoggedIn ? (
                                    contacts && contactGroupId ? 
                                    <>
                                    <ul className="clients-list">
                                        {contacts.map((contact:any) => {
                                            const contactId = contact.id.replace('people/', "")
                                            return (
                                                <li onClick={() => window.open(`https://contacts.google.com/person/${contactId}`)}>
                                                    <div><h4>{contact.firstName}</h4><h4>{contact.lastName}</h4></div>
                                                    <div><span /><p>{contact.phoneNumber}</p></div>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                    </>
                                    : !contactGroupIdLoading && !contactGroupId ? 
                                    <>
                                    <div className="contact-groups">
                                        <form>
                                            <h6>Create a new Google Contacts group:</h6>
                                            <input placeholder="Horizon Clients" 
                                                value={contactsInput} 
                                                onChange={(e) => setContactsInput(e.target.value)}
                                            />
                                            <button className="create-cgroup">Create Group</button>
                                        </form>
                                        {contactGroups && 
                                        <div className="contact-groups-list">
                                            <h6>Or choose an existing account contact group:</h6>
                                            <ul>
                                            {contactGroups?.map((group, i) => {
                                                return <li onClick={() => chooseContactGroup(group.resourceName)}><span style={{backgroundColor: `${pieColorScale[i%6]}`}}></span>{group.formattedName}</li>
                                            })}
                                            </ul>
                                        </div>
                                        }
                                    </div>
                                    </>
                                    : null
                                )
                                : (
                                    null
                                )
                                }
                            </div>
                        </motion.div>
                    {/* </motion.div> */}
                    {/* <motion.div className="dashboard-row-bottom"> */}
                        <motion.div className="dashboard-info-card table">
                            {dashboardListings && 
                            <>
                            <div className="dashboard-card-header dashboard-header-mb-0">
                                <h4>Recent Listings</h4>
                            </div>
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
                                {dashboardListings && dashboardListings?.map((listing:any) => {
                                    const listingId = listing?.id
                
                                    return (
                                    <>
                                    <tr id={listingId} onClick={() => navigate(`/listings/${listingId}`)}>
                                        <td><img src={listing.image1}/></td>
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
                        </motion.div>
                        
                        <motion.div className="dashboard-info-card map">
                            <div className="dashboard-card-header">
                                <h4>Listings Map</h4>
                            </div>
                            <div className="listings-map">
                                <GoogleMap
                                    bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY! }}
                                    center={{lat: 40.7366, lng: -73.8200}}
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
                        </motion.div>
                    {/* </motion.div> */}
                </motion.div>
            </motion.div>
        </div>
        </>
    )
}

export default Dashboard