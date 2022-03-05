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

// lambda fn, calling itself
(async() => {
    const app = express();
    app.use(
        cors({
          origin: "http://localhost:3000",
          credentials: true
        })
      );
    app.use(cookieParser())
    app.get('/', (_req, res) => res.send('hello'));
    
    app.post("/refresh_token", async (req, res) => {
        // refresh token from cookies
        const token = req.cookies.jid
        if (!token) {
            return res.send({ ok: false, accessToken: "" })
        }

        let payload: any = null;
        try {
            // jsonwebtoken verify if token is valid, get payload
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)
        } catch(err) {
            console.log(err)
            return res.send({ ok: false, accessToken: "" })
        }

        // refresh token is valid 
        
        // get user and send back new refresh & access tokens
        const user = await User.findOne({ id: payload.userId })

        if (!user) {
            return res.send({ ok: false, accessToken: "" })
        }

        // if tokenVersion doesn't match, don't send refresh or access token
        if (user.tokenVersion !== payload.tokenVersion) {
            return res.send({ ok: false, accessToken: "" })
        }

        // create new refresh token
        res.cookie("jid", createRefreshToken(user), {
            httpOnly: true,
        })
        // create new access token
        return res.send({ ok: true, accessToken: createAccessToken(user) })
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

    app.listen(4000, () => {
        console.log("express server started")
    })
})()
