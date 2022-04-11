import React, { useState, useEffect, createContext } from "react";
import { Router } from "./Router";
import { setAccessToken } from "./utils/accessToken";
import "./App.css"
import axios from "axios";

interface GlobalStateTypes {
  gAccountInfo: { email: any, photo: any } | undefined
  setGAccountInfo: React.Dispatch<React.SetStateAction<any>>
  isGLoggedIn: boolean | undefined;
  setIsGLoggedIn: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  calendarEvents: any;
  setCalendarEvents: React.Dispatch<React.SetStateAction<any>>;
  contacts: any;
  setContacts: React.Dispatch<React.SetStateAction<any>>;
}

export const GlobalContext: React.Context<any> = createContext(null)

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [isGLoggedIn, setIsGLoggedIn] = useState<boolean>()
  const [gAccountInfo, setGAccountInfo] = useState<any>()
  const [calendarEvents, setCalendarEvents] = useState<any | null>()
  const [contacts, setContacts] = useState<any | null>()

  const globalState: GlobalStateTypes = {
    gAccountInfo,
    setGAccountInfo,
    isGLoggedIn,
    setIsGLoggedIn,
    calendarEvents,
    setCalendarEvents,
    contacts,
    setContacts,
  }

  useEffect(() => {
    fetch("http://localhost:4000/refresh_token", {
      method: "POST",
      credentials: "include"
    }).then(async x => {
      const { accessToken } = await x.json();
      setAccessToken(accessToken);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let gLoginRef = false
    axios.post('http://localhost:4000/auth/google/silent-refresh', {}, {
      withCredentials: true
    }).then((res) => {
      const { gAccessToken } = res.data
      console.log(gAccessToken)
      if (gAccessToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${gAccessToken}`
        gLoginRef = true
      }
    }).then(() => {
      if (gLoginRef) {
        axios.get('https://people.googleapis.com/v1/people/me', {
          params: {
            personFields: 'emailAddresses,photos',
          }
        }).then((res) => {
          setGAccountInfo({
            email: res.data.emailAddresses[0].value,
            photo: res.data.photos[0].url
          })
        })
      }

    }).then(() => {
      if (gLoginRef) {
        setIsGLoggedIn(true)
      } else {
        setIsGLoggedIn(false)
      }
    })
  }, [])

  return (
    <>
      <GlobalContext.Provider value={globalState}>
        {loading ? null : <Router />}
      </GlobalContext.Provider>
    </>
  )
}
