import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import Table from "../components/Table"
import Map from "../components/Map";
import { useAllListingsQuery } from "../generated/graphql";

import searchLogo from "../assets/search.svg"

function Home(){
  const navigate = useNavigate()

  const {data, loading}:any = useAllListingsQuery()
  const [listings, setListings] = useState([] as any)

  const [view, setView] = useState<string>("table")
  
  useEffect(() => {
    data && setListings(data?.allListings)
    console.log(data)
  }, [data])

  return (
    <>
    <div className="wrapper">
      <motion.div className="dashboard-wrapper"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <span className="dashboard-header-left-text">
              <h3>All Listings</h3>
              <h4>{listings?.length}</h4>
            </span>
            <span>
              <AnimatePresence>
              <motion.div className="dashboard-view">
                <motion.span layout className={`dashboard-view-background ${view === "table" ? "view-left" : "view-right"}`} ></motion.span>
                <motion.span className={`dashboard-view-label ${view === "table" ? "view-label-active" : "view-label-inactive"}`} onClick={() => setView("table")}>Table</motion.span>
                <motion.span className={`dashboard-view-label ${view === "map" ? "view-label-active" : "view-label-inactive"}`} onClick={() => setView("map")}>Map</motion.span>
              </motion.div>
              </AnimatePresence>
            </span>
          </div>
          <div className="dashboard-header-buttons-wrapper">
            <div className="search">
              <input className="search-input"></input>
              <span className="search-icon"><img src={searchLogo}/></span>
            </div>
            <button className="create-btn" onClick={() => navigate("/listings/create")}>Create Listing</button>
          </div>
        </div>
        { loading 
        ? null
        : view === "table" ? 
          <Table listings={listings}/>
        : view === "map" ? 
          <Map listings={listings} setListings={setListings} />
        : null
        }
      </motion.div>
    </div>
    </>
  );
};
 
export default Home