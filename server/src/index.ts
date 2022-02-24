const express = require("express");
const { graphqlHTTP } = require("express-graphql");
import { schema } from "./Schema";
const cors = require("cors");
const { createConnection } = require("typeorm");
import { Users } from "./Entities/Users";

const main = async() => {
    await createConnection({
        type: "mysql",
        database: "Horizon",
        username: "admin",
        password: "password",
        logging: true,
        synchronize: false,
        entities: [Users],
    })

    const app = express()
    app.use(cors())
    app.use(express.json())
    app.use("/graphql", graphqlHTTP({
        schema, 
        graphiql: true
    }))

    app.listen(3001, () => {
        console.log("Server running on port 3001")
    })
}

main().catch((err) => {
    console.log(err)
})