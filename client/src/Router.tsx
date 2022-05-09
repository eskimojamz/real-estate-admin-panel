import { AnimatePresence } from "framer-motion";
import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { GlobalContext } from "./App";
import Sidebar from "./components/Sidebar";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";
import Listings from "./pages/Listings";
import ListingView from "./pages/ListingView";
import Login from "./pages/Login";
import Settings from "./pages/Settings";

function RequireAuth({ children }: { children: any }) {
  // global isLoggedIn state from first app render, server fetch
  const { isLoggedIn } = useContext(GlobalContext)

  // redirect to login if not authed
  return (
    isLoggedIn ?
      children
      : isLoggedIn === false ?
        <Navigate to='/login' replace />
        : null
  )
}

export const Router: React.FC = () => {
  return (
    <AnimatePresence exitBeforeEnter>
      <div className="container">
        <BrowserRouter>
          <Routes>
            <Route
              path='/'
              element={
                <RequireAuth>
                  <Navigate to='/dashboard' replace />
                </RequireAuth>
              }
            />
            <Route element={<WithoutSidebar />} >
              <Route path="login"
                element={<Login />} />
            </Route>
            <Route
              element={
                <RequireAuth>
                  <WithSidebar />
                </RequireAuth>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="listings" element={<Listings />} />
              <Route path="listings/create" element={<Create />} />
              <Route path="listings/:listingId" element={<ListingView />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="clients" element={<Clients />} />
              <Route path="settings" element={<Settings />} />
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

