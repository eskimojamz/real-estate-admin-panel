import { AnimatePresence } from "framer-motion";
import jwtDecode from "jwt-decode";
import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate, useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { GlobalContext } from "./App";
import Sidebar from "./components/Sidebar";
import { useDisplayUserQuery } from "./generated/graphql";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";
import Listings from "./pages/Listings";
import ListingView from "./pages/ListingView";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import { getAccessToken } from "./utils/accessToken";

function RequireAuth({ children }: { children: any }) {
  // check if authenticated, accesstoken not expired
  const isAuth = () => {
    const token = getAccessToken()
    try {
      const { exp }: any = jwtDecode(token)
      if (Date.now() >= exp * 1000) {
        return false;
      } else {
        return true;
      }
    } catch (err) {
      return false;
    }
  };
  // redirect to login if not authed
  if (isAuth()) {
    return children
  } else if (isAuth() === false) {
    return <Navigate to='/login' replace />
  } else {
    return null
  }
}

export const Router: React.FC = () => {

  return (
    <AnimatePresence exitBeforeEnter>
      <div className="container">
        <BrowserRouter>
          <Routes>
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

