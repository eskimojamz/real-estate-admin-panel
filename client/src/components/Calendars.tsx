import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useContext, useEffect, useState } from 'react'
import { ScaleLoader } from 'react-spinners';
import { GlobalContext } from '../App';
import { GetUserDefaultCalendarDocument, useDisplayUserQuery, useGetUserDefaultCalendarQuery, useSetDefaultCalendarMutation } from '../generated/graphql';


function Calendars() {
    const { isGLoggedIn, setIsGLoggedIn } = useContext(GlobalContext)
    const [loadingCalendars, setLoadingCalendars] = useState<boolean>(true)
    const [loadingCreate, setLoadingCreate] = useState<boolean>()
    const { data: userData } = useDisplayUserQuery({
        onError: (error) => console.log(error)
    })

    const [newCalendarName, setNewCalendarName] = useState<string>("Horizon Appointments")
    const [calendars, setCalendars] = useState<any>()
    const [calendarId, setCalendarId] = useState<string | null>()
    const [calendarName, setCalendarName] = useState<string | null>()
    console.log(calendars)
    const { } = useGetUserDefaultCalendarQuery({
        onError: (error) => console.log(error),
        onCompleted: (data) => {
            setCalendarId(data.getUserDefaultCalendar.defaultCalendarId)
            setCalendarName(data.getUserDefaultCalendar.defaultCalendarName)
        }
    })

    const axiosInstance = axios.create()

    const getGCalendarsList = async () => {
        try {
            await axiosInstance.get('https://www.googleapis.com/calendar/v3/users/me/calendarList')
                .then(res => {
                    if (res.status === 200) {
                        const calendarsRef: any[] = []
                        res.data.items.map((cal: { id: string, summary: string, backgroundColor: string }) => {
                            calendarsRef.push({
                                id: cal.id,
                                name: cal.summary,
                                color: cal.backgroundColor
                            })
                        })
                        calendarsRef.length > 0 && (
                            setCalendars(calendarsRef)
                        )
                        setLoadingCalendars(false)
                    }
                    return
                })
        } catch (error: any) {
            setLoadingCalendars(false)
            return error.message;
        }
    };

    // if Calendar fetch fails, get new gAccessToken and retry
    axiosInstance.interceptors.response.use((response) => {
        return response
    }, async function (error) {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            // originalRequest._retry = true;
            axios.post('http://localhost:4000/auth/google/silent-refresh', {}, {
                withCredentials: true
            }).then((res) => {
                const { gAccessToken } = res.data
                console.log(gAccessToken)
                if (gAccessToken) {
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${gAccessToken}`
                    return axiosInstance.request(originalRequest);
                } else {
                    setIsGLoggedIn(false)
                }
            })
        }
        return Promise.reject(error);
    });

    const [setDefaultCalendar] = useSetDefaultCalendarMutation({
        onError: (error) => {
            console.log(error)
        }
    })

    // choose default calendar on first usage
    const chooseCalendar = async (calId: string, calName: string) => {
        await setDefaultCalendar({
            variables: {
                calendarId: calId,
                calendarName: calName,
                userId: userData?.displayUser?.id!
            },
            refetchQueries: [{ query: GetUserDefaultCalendarDocument }],
            awaitRefetchQueries: true,
        })
    }

    const createGCalendar = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setLoadingCreate(true)
        axiosInstance.post('https://www.googleapis.com/calendar/v3/calendars', {
            summary: newCalendarName,
        }).then((res) => {
            if (res.status === 200) {
                setCalendarId(res.data.id)
                setCalendarName(res.data.summary)
                chooseCalendar(res.data.id, res.data.summary)
                setLoadingCreate(false)
            }
        }).catch((err) => {
            setLoadingCreate(false)
            throw new Error(err)
        })
    }

    // after login success, get Calendars Lists, if there is no default Calendar
    useEffect(() => {
        if (isGLoggedIn) {
            getGCalendarsList()
        }
    }, [isGLoggedIn, calendarId])

    return (
        <>
            {loadingCalendars === false && !loadingCreate && calendars ? (
                <>
                    <motion.div className="calendar-list"
                        key='cal-list'
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                    >
                        {calendarId && (
                            <>
                                <div className='calendars-current'>
                                    <h6>Default Contact Group</h6>
                                    <span>
                                        {calendarName}
                                    </span>
                                </div>
                            </>
                        )}
                        <form>
                            <h6>Create a new Google Calendar:</h6>
                            <input placeholder="Horizon Appointments"
                                value={newCalendarName}
                                onChange={(e) => setNewCalendarName(e.target.value)}
                            />
                            <button className="btn-primary" onClick={(e) => createGCalendar(e)}>Create Calendar</button>
                        </form>
                        <div className="calendar-list-existing">
                            <h6>Or choose an existing account calendar:</h6>
                            <ul>
                                {calendars?.filter((cal: { id: string }) => cal.id !== calendarId).map((cal: { id: string, name: string, color: string }) => {
                                    return <li onClick={() => chooseCalendar(cal.id, cal.name)}><span style={{ backgroundColor: `${cal.color}` }}></span>{cal.name}</li>
                                })}
                            </ul>
                        </div>
                    </motion.div>
                </>
            ) : (
                <>
                    <div className="calendars-loading">
                        <ScaleLoader color='#2c5990' />
                        {loadingCalendars ? (
                            <p>Loading Google Calendars</p>
                        ) : loadingCreate ? (
                            <p>Creating Google Calendar</p>
                        ) : null}
                    </div>
                </>
            )
            }
        </>
    )
}

export default Calendars