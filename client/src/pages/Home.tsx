
import { useState, useEffect } from "react";
import Table from "../components/Table"
import { useAllListingsQuery } from "../generated/graphql";

export const Home: React.FC = () => {
  const {data}:any = useAllListingsQuery()
  const [listings, setListings] = useState([] as any)

  useEffect(() => {
    data && setListings(data?.allListings)
    console.log(data)
  }, [data])

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h2>All Listings</h2>
          <h3>{listings?.length}</h3>
        </div>
        <div className="dashboard-header-buttons-wrapper">
          <button className="filter-btn">Filter</button>
          <button className="create-btn">Create Listing</button>
        </div>
      </div>
      { data 
      ? <Table listings={listings}/>
      : null
      }
      
    </div>
  );
};
