import { useState } from "react"
import logoSmall from "../assets/logo-small.svg"

function Sidebar() {
    const [currentLink, setCurrentLink] = useState()
    
    return (
        <>
        <div className="sidebar-wrapper">
            <div className="sidebar-logo">
                <img className="sidebar-logo-img" src={logoSmall} />
            </div>
            <div className="sidebar-grid">
                <div className="sidebar-top">
                    <a>All</a>
                    <a>Active</a>
                    <a>Sold</a>
                </div>
                <div className="sidebar-bottom">
                    <div className="sidebar-profile">
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80" />
                        <div className="sidebar-profile-text">
                            <span><h4>Welcome,</h4><h4>Joelle</h4></span>
                            <em>joelle@horizon.com</em>
                        </div>
                    </div>
                    <a>Site Preview</a>
                    <a>Logout</a>
                </div>
            </div>
        </div>
        </>
    )
}

export default Sidebar