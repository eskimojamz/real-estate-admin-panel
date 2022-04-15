import React, { useState, useEffect, createContext, useMemo } from "react";
import { Router } from "./Router";
import { setAccessToken } from "./utils/accessToken";
import "./App.css"
import axios from "axios";
import { useGetUserDefaultCalendarQuery, useGetUserDefaultContactGroupQuery } from "./generated/graphql";

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

  const { data: getCalendarData, loading: calendarIdLoading } = useGetUserDefaultCalendarQuery({
    onError: (error) => console.log(error)
  })
  const calendarId = getCalendarData?.getUserDefaultCalendar.defaultCalendarId

  // onload, onGlogin & onCalIdSet, get calendar events if no calendars events
  useMemo(() => {
    if (isGLoggedIn && calendarId && !calendarEvents) {
      try {

        const calItemsRef: { id: any; title: any; start: any; end: any; extendedProps: { description: any; location: any; }; url: any; allDay: boolean }[] = []

        // set time range for g calendar events fetch
        const minDate = new Date()
        minDate.setDate(minDate.getDate() - 180)
        const maxDate = new Date()
        maxDate.setDate(maxDate.getDate() + 180)

        axios.get(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
          params: {
            orderBy: 'startTime',
            singleEvents: true,
            timeMin: minDate.toISOString(),
            timeMax: maxDate.toISOString(),
          }
        }).then(res => {
          console.log(res.data.items)
          const gCalItems = res.data.items
          gCalItems.map((item: any) => {
            calItemsRef.push({
              id: item.id,
              title: item.summary,
              start: item.start.dateTime || item.start.date,
              end: item.end.dateTime || item.end.date,
              // startStr: item.start.dateTime,
              // endStr: item.end.dateTime,
              extendedProps: {
                description: item.description,
                location: item.location
              },
              url: item.htmlLink,
              allDay: item.start.dateTime ? false : true
            })
          })
          console.log(calItemsRef)
          setCalendarEvents(calItemsRef)
        })
      } catch (error: any) {
        console.log("Error getting calendar events")
        return error.message
      }
    }
  }, [isGLoggedIn, calendarId])

  const { data: getContactGroupData } = useGetUserDefaultContactGroupQuery({
    onError: (error: any) => console.log(error)
  })
  const contactGroupId = getContactGroupData?.getUserDefaultContactGroup.defaultContactGroupId

  useMemo(() => {
    if (isGLoggedIn && contactGroupId) {
      const contactsRef: string[] = []
      axios.get(`https://people.googleapis.com/v1/${contactGroupId}`, {
        params: {
          maxMembers: 200
        }
      }).then((res) => {
        console.log(res.data)
        const gContactItems = res.data.memberResourceNames
        gContactItems.map((cId: string) => {
          contactsRef.push(cId)
        })
      }).then(() => {
        const paramsRef = new URLSearchParams()
        contactsRef.map(c => {
          paramsRef.append("resourceNames", c)
        })
        paramsRef.append("personFields", 'names,phoneNumbers,emailAddresses,photos')

        axios.get('https://people.googleapis.com/v1/people:batchGet', {
          params: paramsRef
        }).then(res => {
          const contactItemsRef: { id: string; lastName: string; firstName: string; phoneNumber: string; photo: string; }[] = []
          const gContactsData = res.data.responses
          gContactsData.forEach((obj: { person: { resourceName: string, names: { givenName: string, familyName: string }[]; phoneNumbers: { canonicalForm: string; }[]; photos: { url: string; }[]; }; }) => {
            contactItemsRef.push({
              id: obj.person.resourceName,
              lastName: obj.person.names[0].familyName,
              firstName: obj.person.names[0].givenName,
              phoneNumber: obj.person.phoneNumbers[0].canonicalForm,
              photo: obj.person.photos[0].url
            })
          })
          setContacts(contactItemsRef)
        })
      }).catch(err => console.log(err))
    }
  }, [isGLoggedIn, contactGroupId])

  return (
    <>
      <GlobalContext.Provider value={globalState}>
        {loading ? null : <Router />}
      </GlobalContext.Provider>
    </>
  )
}
