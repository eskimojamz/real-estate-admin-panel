import React, { useState, useEffect, createContext } from "react";
import { Router } from "./Router";
import { setAccessToken } from "./utils/accessToken";
import "./App.css"

interface GlobalStateTypes {
  calendarEvents: any;
  setCalendarEvents: React.Dispatch<React.SetStateAction<any>>;
  contacts: any;
  setContacts: React.Dispatch<React.SetStateAction<any>>;
}

export const GlobalContext:React.Context<any> = createContext(null)

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [calendarEvents, setCalendarEvents] = useState<any | null>()
  const [contacts, setContacts] = useState<any | null>()
  
  const globalState: GlobalStateTypes = {
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

  return (
    <>
    <GlobalContext.Provider value={globalState}>
    {loading ? null : <Router />}
    </GlobalContext.Provider>
    </>
  )
}
