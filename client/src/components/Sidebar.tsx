import { useState } from "react"
import { MdHomeFilled, MdOutlineCalendarToday, MdOutlineHomeWork, MdOutlinePermContactCalendar, MdOutlineSpaceDashboard } from "react-icons/md"
import { RiHome8Line } from "react-icons/ri"
import { Link } from "react-router-dom"
import { NavLink } from "react-router-dom"
import logo from "../assets/logo.svg"
import { useDisplayUserQuery } from "../generated/graphql"

function Sidebar() {
    const { data: loggedIn } = useDisplayUserQuery()
    console.log(loggedIn)

    return (
        <>
            <div className="sidebar-wrapper">
                <div className="sidebar-logo">
                    <img className="sidebar-logo-img" src={logo} />
                </div>
                <div className="sidebar-grid">
                    <div className="sidebar-top">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                isActive ? "active-navlink" : "navlink"
                            }
                        >
                            <MdOutlineSpaceDashboard size='20px' />
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/listings"
                            className={({ isActive }) =>
                                isActive ? "active-navlink" : "navlink"
                            }
                        >
                            <RiHome8Line size='20px' />
                            Listings
                        </NavLink>
                        <NavLink
                            to="/appointments"
                            className={({ isActive }) =>
                                isActive ? "active-navlink" : "navlink"
                            }
                        >
                            <MdOutlineCalendarToday size='20px' />
                            Appointments
                        </NavLink>
                        <NavLink
                            to="/clients"
                            className={({ isActive }) =>
                                isActive ? "active-navlink" : "navlink"
                            }
                        >
                            <MdOutlinePermContactCalendar size='20px' />
                            Clients
                        </NavLink>
                    </div>
                    <div className="sidebar-bottom">
                        <button className="site-preview-btn" onClick={() => window.open('http://horizon-development.plasmic.site/', '_blank')}>
                            Site Preview
                        </button>
                        <div className="sidebar-profile">
                            {loggedIn ?
                                <>
                                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80" />
                                    <div className="sidebar-profile-text">
                                        <span>
                                            <h5>Joelle</h5>
                                            <h6>View Settings</h6>
                                        </span>
                                    </div>
                                </>
                                : null}
                        </div>

                        {/* <button
                            className="logout-btn"
                        >
                            Logout
                        </button> */}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sidebar