import React, { useState, useEffect } from "react";
import { Router } from "./Router";
import { setAccessToken } from "./utils/accessToken";
import "./App.css"
import { GApiProvider } from 'react-gapi-auth2';

interface Props {}

export const App: React.FC<Props> = () => {
  
  const [loading, setLoading] = useState(true);

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
    {loading ? null : <Router />}
    </>
  )
}
