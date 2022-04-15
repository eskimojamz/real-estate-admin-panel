import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useContext, useEffect, useState } from 'react'
import { ScaleLoader } from 'react-spinners';
import { GlobalContext } from '../App';
import { GetUserDefaultCalendarDocument, useDisplayUserQuery, useGetUserDefaultCalendarQuery, useSetDefaultCalendarMutation } from '../generated/graphql';

function Calendars() {
    const { isGLoggedIn } = useContext(GlobalContext)
    const { data: userData } = useDisplayUserQuery({
        onError: (error) => console.log(error)
    })

    const [calendarInput, setCalendarInput] = useState<string>("Horizon Appointments")
    const [calendars, setCalendars] = useState<any>()
    const [calendarId, setCalendarId] = useState<string>()

    const { data: getCalendarData, loading: calendarIdLoading } = useGetUserDefaultCalendarQuery({
        onError: (error) => console.log(error),
        onCompleted: (data) => setCalendarId(data.getUserDefaultCalendar.defaultCalendarId)
    })

    const getGCalendarsList = async () => {
        try {
            await axios.get('https://www.googleapis.com/calendar/v3/users/me/calendarList')
                .then(res => {
                    console.log(res.data.items)
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
                })
        } catch (error: any) {
            console.log("Error getting calendar data", error);
            return error.message;
        }
    };

    const [setDefaultCalendar] = useSetDefaultCalendarMutation({
        onError: (error) => {
            console.log(error)
        }
    })

    // choose default calendar on first usage
    const chooseCalendar = async (calId: string) => {
        await setDefaultCalendar({
            variables: {
                calendarId: calId,
                userId: userData?.displayUser?.id!
            },
            refetchQueries: [{ query: GetUserDefaultCalendarDocument }]
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
            {calendars ? (
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
                                        {calendarId}
                                    </span>
                                </div>
                            </>
                        )}
                        <form>
                            <h6>Create a new Google Calendar:</h6>
                            <input placeholder="Horizon Appointments"
                                value={calendarInput}
                                onChange={(e) => setCalendarInput(e.target.value)}
                            />
                            <button className="btn-primary">Create Calendar</button>
                        </form>
                        <div className="calendar-list-existing">
                            <h6>Or choose an existing account calendar:</h6>
                            <ul>
                                {calendars?.filter((cal: { id: string }) => cal.id !== calendarId).map((cal: { id: string, name: string, color: string }) => {
                                    return <li onClick={() => chooseCalendar(cal.id)}><span style={{ backgroundColor: `${cal.color}` }}></span>{cal.name}</li>
                                })}
                            </ul>
                        </div>
                    </motion.div>
                </>
            ) : (
                <>
                    <div className="calendars-loading">
                        <ScaleLoader color='#2c5990' />
                        <p>Loading Google Calendars</p>
                    </div>
                </>
            )
            }
        </>
    )
}

export default Calendars