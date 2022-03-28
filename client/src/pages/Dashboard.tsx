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

    let {search} = useLocation()
    
    const query = useMemo(() => new URLSearchParams(search), [search])
    const accessToken = query.get("accessToken");
    const refreshToken = query.get("refreshToken");
    console.log(accessToken)
    console.log(refreshToken)
    
    const handleTokenFromQueryParams = () => {
        console.log(query)
        const expirationDate = newExpirationDate();
        console.log("App.js 30 | expiration Date", expirationDate);
        console.log(accessToken)
        console.log(refreshToken)
        if (accessToken && refreshToken) {
            storeTokenData(accessToken, refreshToken, expirationDate)
        }
    }

    const newExpirationDate = () => {
        var expiration = new Date();
        expiration.setHours(expiration.getHours() + 1);
        return expiration;
    };
    
    const storeTokenData = (accessToken: string, refreshToken: string, expirationDate: Date) => {
        localStorage.setItem("gAccessToken", accessToken);
        localStorage.setItem("gRefreshToken", refreshToken);
        localStorage.setItem("gExpirationDate", expirationDate.toDateString());
        console.log(accessToken, refreshToken)
    };
    
    const signOut = () => {
        localStorage.removeItem("gAccessToken")
        localStorage.removeItem("gRefreshToken")
        localStorage.removeItem("gExpirationDate")
        navigate("/dashboard")
    };

    const getGCalendarsList = async () => {
        try {
            const token = await getGToken();
            const request = await fetch(
                `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
      
            const data = await request.json();
            console.log("googleCalendar.js 24 | got calendar events", data);
            return data;
        } catch (error:any) {
            console.log("googleCalendar.js 35 | error getting calendar data", error);
            return error.message;
        }
    };

    const tokensLoaded = useRef(false)
    
    useEffect(() => {
        axios.post('http://localhost:4000/auth/google/silent-refresh', {}, {
            withCredentials:true
        }).then(res => {
            console.log(res);
            const {gAccessToken} = res.data;
            console.log(gAccessToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            setIsGLoggedIn(true)
        });
    }, []);

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
                            <button onClick={() => getGCalendarsList()}>Get Calendars</button>
                            <button onClick={signOut}>Sign Out</button>
                            </>
                        ): 
                        <button onClick={googleAuth}>Sign In</button>
                        }
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