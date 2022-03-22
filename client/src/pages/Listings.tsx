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
  const [results, setResults] = useState([] as any)

  const [view, setView] = useState<string>("table")

  const [searchInput, setSearchInput] = useState<string>("")

  const submitSearch = (e:any) => {
    e.preventDefault()
    if (searchInput === "") {
      return setResults(data?.allListings)
    }
    const resultsRef = listings.filter((listing: { address1: string; address2: string; }) => (listing.address1 + listing.address2).toLowerCase().includes(searchInput.toLowerCase()))
    setResults(resultsRef)
  }
  
  useEffect(() => {
    data && setListings(data?.allListings)
    setResults(data?.allListings)
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
            <form className="search"
              onSubmit={(e) => submitSearch(e)}
            >
              <input className="search-input" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyUp={(e) => {
                  
                  submitSearch(e)
                }}
              >
              </input>
              <span className="search-icon" onClick={(e) => submitSearch(e)}><img src={searchLogo}/></span>
            </form>
            <button className="create-btn" onClick={() => navigate("/listings/create")}>Create Listing</button>
          </div>
        </div>
        { loading 
        ? null
        : view === "table" ? 
          <Table listings={results}/>
        : view === "map" ? 
          <Map listings={results} setView={setView}/>
        : null
        }
      </motion.div>
    </div>
    </>
  );
};
 
export default Home