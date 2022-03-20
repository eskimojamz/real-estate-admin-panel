import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Table from "../components/Table"
import { useAllListingsQuery } from "../generated/graphql";

import searchLogo from "../assets/search.svg"

function Home(){
  const navigate = useNavigate()

  const {data, loading}:any = useAllListingsQuery()
  const [listings, setListings] = useState([] as any)

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
          <div className="dashboard-header-text">
            <h3>All Listings</h3>
            <h4>{listings?.length}</h4>
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
        : <Table listings={listings}/>
        }
      </motion.div>
    </div>
    </>
  );
};
 
export default Home