import { useState } from "react"
import { Link } from "react-router-dom"
import { NavLink } from "react-router-dom"
import logoSmall from "../assets/logo-small.svg"
import { useDisplayUserQuery } from "../generated/graphql"

function Sidebar() {
    const {data: loggedIn} = useDisplayUserQuery()
    console.log(loggedIn)
    
    return (
        <>
        <div className="sidebar-wrapper">
            <div className="sidebar-logo">
                <img className="sidebar-logo-img" src={logoSmall} />
            </div>
            <div className="sidebar-grid">
                <div className="sidebar-top">
                    <NavLink 
                        to="/dashboard"
                        className={({ isActive }) => 
                        isActive ? "active-navlink" : "navlink"
                    }
                    >
                        Dashboard
                    </NavLink>
                    <NavLink 
                        to="/listings" 
                        className={({ isActive }) => 
                            isActive ? "active-navlink" : "navlink"
                        }
                    >
                        Listings
                    </NavLink>
                    <NavLink 
                        to="/appointments" 
                        className={({ isActive }) => 
                            isActive ? "active-navlink" : "navlink"
                        }
                    >
                        Appointments
                    </NavLink>
                    <NavLink 
                        to="/clients" 
                        className={({ isActive }) => 
                            isActive ? "active-navlink" : "navlink"
                        }
                    >
                        Clients
                    </NavLink>
                </div>
                <div className="sidebar-bottom">
                    <div className="sidebar-profile">
                        {loggedIn ?
                        <>
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80" />
                        <div className="sidebar-profile-text">
                            <span><h4>Welcome,</h4><h4>Joelle</h4></span>
                            <em>joelle@horizon.com</em>
                        </div>
                        </>
                        : null }
                    </div>
                    <button className="site-preview-btn">
                        <Link to="google.com">
                            Site Preview
                        </Link>
                    </button> 
                    <button
                        className="logout-btn"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
        </>
    )
}

export default Sidebar