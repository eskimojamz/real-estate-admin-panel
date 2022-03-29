import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { useAllListingsQuery } from "../generated/graphql"
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
    
    const [isGLoggedIn, setIsGLoggedIn] = useState(false) 
    
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
    
    const signOut = () => {
        localStorage.removeItem("gAccessToken")
        localStorage.removeItem("gRefreshToken")
        localStorage.removeItem("gExpirationDate")
        navigate("/dashboard")
    };

    const [calendars, setCalendars] = useState<any[] | null>()
    const [calendarId, setCalendarId] = useState<string | null>()
    const [calendarEvents, setCalendarEvents] = useState<any[] | null>()

    const getGCalendarsList = async () => {
        try {
            await axios.get('https://www.googleapis.com/calendar/v3/users/me/calendarList')
                .then(res => {
                    console.log(res.data.items)
                    const calendarsRef: any[] = []
                    res.data.items.map((cal: { id: string, summary: string }) => {
                        calendarsRef.push({id: cal.id, name: cal.summary})
                    })
                    setCalendars(calendarsRef)
                })
        } catch (error:any) {
            console.log("Error getting calendar data", error);
            return error.message;
        }
    };

    const chooseCalendar = async (id: string) => {
        try {
            // const date = new Date()
            // const minDate = new Date(date.setMonth(date.getMonth() - 6)).toISOString()
            // const maxDate = new Date(date.setMonth(date.getMonth() + 6)).toISOString()
            const minDate = new Date()
            minDate.setDate(minDate.getDate() - 180)
            const maxDate = new Date()
            maxDate.setDate(maxDate.getDate() + 180)

            await axios.get(`https://www.googleapis.com/calendar/v3/calendars/${id}/events`, {
                params: {
                    orderBy: 'startTime',
                    singleEvents: true,
                    timeMin: minDate.toISOString(),
                    timeMax: maxDate.toISOString(),
                }
            }).then(res => {
                console.log(res.data.items)
                const gCalItems = res.data.items
                const calItemsRef: { id: any; title: any; start: any; end: any; startTime: any; endTime: any; extendedProps: { description: any; location: any; }; url: any; }[] = []
                gCalItems.map((item:any) => {
                    calItemsRef.push({
                        id: item.id,
                        title: item.summary,
                        start: item.start.date,
                        end: item.start.date,
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
    
    useEffect(() => {
        axios.post('http://localhost:4000/auth/google/silent-refresh', {}, {
            withCredentials:true
        }).then((res) => {
            const {gAccessToken} = res.data
            console.log(gAccessToken)
            axios.defaults.headers.common['Authorization'] = `Bearer ${gAccessToken}`;    
        }).then(() => {
            getGCalendarsList()
        }).then(() => {
            setIsGLoggedIn(true)
        })
    }, [])

    // useMemo(() => {
    //     if (localStorage.getItem("accessToken")) {
    //         getGCalendarsList().then((data) => {
    //             console.log(data)
    //         }) 
    //     }
    // }, [accessToken])

    return (
        <>
        <div className="wrapper">
            <motion.div className="dashboard-wrapper">
                <motion.div className="dashboard-header">
                    <h3>Dashboard</h3>
                </motion.div>
                <motion.div className="dashboard-body">
                    <motion.div className="dashboard-row-top">
                        <motion.div className="dashboard-info-card">
                            <AnimatePresence>
                            <div className="piechart-title">
                                <h5>ACTIVE LISTINGS</h5>
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

                        <motion.div className="dashboard-info-card">
                        {isGLoggedIn ? (
                            <>
                            
                            {calendarEvents ?
                                
                            <>
                                <div className="calendar-events-header">
                                    <h5>Calendar Events</h5>
                                </div>
                                <FullCalendar 
                                    plugins={[ listPlugin, dayGridPlugin ]}
                                    initialView="list"
                                    events={calendarEvents}
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
                                        if (info.event.url) {
                                          window.open(info.event.url);
                                        }
                                      }
                                    }
                                />
                            </>
                            :
                            <>
                            <h6>Choose a calendar:</h6>
                            <ul>
                                {calendars?.map((cal: { id: string, name: string }) => {
                                    return <li><button onClick={() => chooseCalendar(cal.id)}>{cal.name}</button></li>
                                })}
                            </ul>
                            </>
                            }
                            </>
                        ): 
                        <button onClick={googleAuth}>Sign In</button>
                        }
                        </motion.div>

                        <motion.div className="dashboard-info-card">

                        </motion.div>
                    </motion.div>
                    <motion.div className="dashboard-row-bottom">
                        <motion.div className="dashboard-info-card">
                            {dashboardListings && 
                            <>
                            <div className="recent-listings-header">
                                <div className="recent-listings-header-hidden" />
                                <h5>RECENT LISTINGS</h5>
                                <button className="recent-listings-header-btn">
                                    View All
                                </button>
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
                        <motion.div className="dashboard-info-card">
                                
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
        </>
    )
}

export default Dashboard