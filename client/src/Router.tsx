import { AnimatePresence } from "framer-motion";
import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";
import Listings from "./pages/Listings";
import ListingView from "./pages/ListingView";
import Login from "./pages/Login";

export const Router: React.FC = () => {
  return (
    <AnimatePresence exitBeforeEnter>
      <div className="container">
        <BrowserRouter>
          <Routes>
            <Route element={<WithoutSidebar />} >
              <Route path="login" element={<Login />} />
            </Route>
            <Route element={<WithSidebar />} >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="listings" element={<Listings />} />
              <Route path="listings/create" element={<Create />} />
              <Route path="listings/:listingId" element={<ListingView />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="clients" element={<Clients />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </AnimatePresence>
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

