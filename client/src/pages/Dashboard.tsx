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
import Calendars from "../components/Calendars";
import { googleAuth } from "../utils/googleAuth";
import Skeleton from "react-loading-skeleton";


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

    const [loginModal, setLoginModal] = useState<boolean>(true)

    const { data: getContactGroupData, loading: contactGroupIdLoading } = useGetUserDefaultContactGroupQuery({
        onError: (error: any) => console.log(error)
    })

    const contactGroupId = getContactGroupData?.getUserDefaultContactGroup.defaultContactGroupId

    const { data: getCalendarData, loading: calendarIdLoading } = useGetUserDefaultCalendarQuery({
        onError: (error) => console.log(error)
    })
    const calendarId = getCalendarData?.getUserDefaultCalendar.defaultCalendarId

    const [calendarInfo, setCalendarInfo] = useState<any>()


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
                                    ) : <Skeleton containerClassName="dashboard-card-skeleton" height='100%' width='100%' count={1} circle={true} />}
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
                                            calendarEvents?.length && calendarId && !calendarInfo ?
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
                                                            <Calendars />
                                                        </>
                                                        : calendarEvents?.length === 0 && calendarId && !calendarInfo ?
                                                            <div className="calendar-events-empty">
                                                                <span>
                                                                    <h6>Looks like there are no appointments yet...</h6>
                                                                    <button className="btn-primary" onClick={() => navigate('/appointments')}>
                                                                        Create a new appointment
                                                                    </button>
                                                                </span>
                                                            </div>
                                                            : <Skeleton containerClassName="dashboard-card-skeleton" height='30px' width='100%' count={10} />
                                        )
                                            : isGLoggedIn === false ?
                                                <>
                                                    <div className="dashboard-g-login">
                                                        <p>Connect your Google Account to access Calendars</p>
                                                        <motion.button className="g-login-btn" onClick={googleAuth}><FaGoogle color='white' size='18px' />Sign in with Google</motion.button>
                                                    </div>
                                                </> : <Skeleton containerClassName="dashboard-card-skeleton" height='30px' width='100%' count={10} />
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
                                                    {contacts.sort((a: { firstName: string }, b: { firstName: string }) => a.firstName.localeCompare(b.firstName)).map((contact: any) => {
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
                                                : contacts === null ? (
                                                    <div className='clients-list-empty'>
                                                        <span>
                                                            <h6>It looks like there are no clients yet...</h6>
                                                            <button className="btn-primary" onClick={() => navigate('/clients')}>
                                                                Add a new client
                                                            </button>
                                                        </span>
                                                    </div>
                                                ) : <Skeleton containerClassName="dashboard-card-skeleton" height='30px' width='100%' count={10} />
                                    )
                                        : isGLoggedIn === false ? (
                                            <>
                                                <div className="dashboard-g-login">
                                                    <p>Connect your Google Account to access Contacts</p>
                                                    <motion.button className="g-login-btn" onClick={googleAuth}><FaGoogle color='white' size='18px' />Sign in with Google</motion.button>
                                                </div>
                                            </>
                                        ) : <Skeleton containerClassName="dashboard-card-skeleton" height='30px' width='100%' count={10} />
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
                                {dashboardListings ?
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
                                    </> : <Skeleton containerClassName="dashboard-card-skeleton" height='55px' width='100%' count={3} />
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