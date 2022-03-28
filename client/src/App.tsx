import React, { useState, useEffect } from "react";
import { Router } from "./Router";
import { setAccessToken } from "./utils/accessToken";
import "./App.css"
import { GApiProvider } from 'react-gapi-auth2';

interface Props {}

export const App: React.FC<Props> = () => {
  
  const [loading, setLoading] = useState(true);
  
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CALENDAR_CLIENT_ID
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY
  const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
  const SCOPES = "https://www.googleapis.com/auth/calendar"

  const clientConfig = {
    client_id: CLIENT_ID,
    api_key: API_KEY,
    scope: SCOPES,
    // etc...
  };

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
    <GApiProvider clientConfig={clientConfig}>
    {loading ? null : <Router />}
    </GApiProvider>
  )
}
