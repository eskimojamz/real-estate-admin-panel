import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Create from "./pages/Create";
import Home from "./pages/Home";
import ListingView from "./pages/ListingView";
import Login from "./pages/Login";

export const Router: React.FC = () => {
  return (
    <div className="container">
      <BrowserRouter>
        <Routes>
          <Route element={<WithoutSidebar />} >
            <Route path="login" element={<Login />} />
          </Route>
          <Route element={<WithSidebar />} >
            <Route path="/" element={<Home />} />
            <Route path="listings/create" element={<Create />} />
            <Route path="listings/:listingId" element={<ListingView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

const WithoutSidebar = () => <Outlet />

const WithSidebar = () => {
  return (
    <>
      <Sidebar />
      <Outlet />
    </>
  )
} 

