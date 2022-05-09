import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/UserResolver";
import { ListingResolver } from "./resolvers/ListingResolver";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser"
import { verify } from "jsonwebtoken"
import { User } from "./entity/User"
import { createAccessToken, createRefreshToken } from "./auth";
import cors from "cors"
import { google } from "googleapis"
import "dotenv/config"
import { getGToken } from "./utils/gTokens";
import fetch from "node-fetch"
import { clientURL, serverURL } from "./utils/urls";

// lambda fn, calling itself
(async() => {
    const app = express();

    app.use(
        cors({
          origin: [clientURL, 'http://localhost:3000'],
          credentials: true
        })
    );
    
    app.use(express.json())
    app.use(cookieParser())
    
    app.post("/refresh_token", async (req, res) => {
        // grab refresh token from cookies
        const token = req.body.refreshToken
        console.log(req)
        console.log('cookie token:', token)
        if (!token) {
            return res.send({ authorized: false, accessToken: "", refreshToken: "" })
        }

        let payload: any = null;
        try {
            // jsonwebtoken verify if refresh token is valid, get payload
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)
        } catch(err) {
            console.log(err)
            return res.send({ authorized: false, accessToken: "", refreshToken: "" })
        }

        // refresh token is valid 
        
        // get user and send back new refresh & access tokens
        const user = await User.findOne({ id: payload.userId })

        if (!user) {
            return res.send({ authorized: false, accessToken: "", refreshToken: "" })
        }

        // if tokenVersion doesn't match, don't send refresh or access token
        // used for blocking invalid logins
        if (user.tokenVersion !== payload.tokenVersion) {
            return res.send({ authorized: false, accessToken: "", refreshToken: "" })
        }

        // create new refresh token and set to cookies
        // sendRefreshToken(res, createRefreshToken(user));
        
        // create new access token and send to apollo client
        return res.send({
            authorized: true,
            accessToken: createAccessToken(user),
            refreshToken: createRefreshToken(user)
        })
    })

    app.post("/auth/google/silent-refresh", async (req, res) =>{
        const {gAccessToken, gRefreshToken, gExpirationDate} = req.body;
        console.log(gAccessToken, gRefreshToken, gExpirationDate, "credentials")
        
        // Refresh token was cleared (on logout), so no credentials get sent to client
        if (!gRefreshToken) {
            return res.send('G User must log in. Refresh token does not exist.')
        }

        // Access token expired with valid refresh token, grant new access token + exp date
        const checkTokenExpired = await getGToken(gRefreshToken, gExpirationDate)

        if(checkTokenExpired){ 
            const newGAccessToken = checkTokenExpired.access_token
            const newGExpirationDate = checkTokenExpired.newGExpirationDate

            res.send({
                gExpirationDate: newGExpirationDate,
                gAccessToken: newGAccessToken
            })
        }
        console.log("Token is not yet expired")
        return res.send({
            gAccessToken: gAccessToken
        })
      });

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${serverURL}/auth/google/callback` // server redirect url handler
    )

    app.post("/auth/google", (_req, res) => {
        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: ["profile", "email", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/contacts"],
            prompt: "consent",
        })
        res.send({ url })
    })

    app.get("/auth/google/callback", async (req, res) => {
        // get code from url 
        const code:any = req.query.code
        // get access token from google
        oauth2Client.getToken(code, (err, token) => {
            if (err) {
                console.log(err)
                throw new Error(err.message)
            }
            let expiration = new Date();
            res.send({
                gAccessToken: token!.access_token,
                gRefreshToken: token!.refresh_token,
                gExpirationDate: expiration.setHours(expiration.getHours() + 1)
            })
            console.log("New token credentials granted: ", token)
            res.redirect(clientURL)
        })
    })

    app.get("/auth/google/logout", (_req, res) => {
        res.redirect(`${clientURL}/dashboard/`)
    })

    app.post("/getValidToken", async(req, res) => {
        try {
            const request = await fetch("https://www.googleapis.com/oauth2/v4/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    refresh_token: req.body.gRefreshToken,
                    grant_type: "refresh_token",
                }),
            })

            const data:any = await request.json()
            console.log("Token Request:", data)

            res.json(data)
        } catch (error) {
            res.json({ error: error.message})
        }
    })

    await createConnection();

    const apolloServer = new ApolloServer({ 
        schema: await buildSchema({
            resolvers: [UserResolver, ListingResolver],
        }),
        context: ({ req, res }) => ({ req, res })
    })

    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(process.env.PORT || 4000, () => {
        console.log("express server started")
    })
})()
