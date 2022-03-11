import logoSmall from "../assets/logo-small.svg"

function Sidebar() {
    
    
    return (
        <>
        <div className="sidebar-wrapper">
            <div className="sidebar-logo">
                <img src={logoSmall} />
            </div>
            <div className="sidebar-grid">
                <div className="sidebar-top">
                    <a>All</a>
                    <a>Active</a>
                    <a>Sold</a>
                </div>
                <div className="sidebar-bottom">
                    <a>Site Preview</a>
                    <a>Logout</a>
                </div>
            </div>
        </div>
        </>
    )
}

export default Sidebar