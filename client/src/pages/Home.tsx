
import { useState, useEffect } from "react";
import Table from "../components/Table"
import { useAllListingsQuery } from "../generated/graphql";

export const Home: React.FC = () => {
  const {data}:any = useAllListingsQuery()
  const [listings, setListings] = useState()

  useEffect(() => {
    setListings(data?.allListings)
  }, [data])

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h3>All Listings</h3>
          <h3>33</h3>
        </div>
        <div className="dashboard-header-buttons-wrapper">
          <button className="filter-btn">Filter</button>
          <button className="create-btn">Create Listing</button>
        </div>
      </div>
      { listings 
      ? <Table />
      : null
      }
      
    </div>
  );
};
