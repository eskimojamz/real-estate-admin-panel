import { GraphQLObjectType, GraphQLSchema } from "graphql";

export const RootQuery = new GraphQLObjectType({
    name: "RootQuery",
    fields: {
        getAllUsers: ,
    }
})

export const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        createUser: , 
        deleteUser: ,
        updatePassword: ,
    },
})

export const schema = new GraphQLSchema({
    query: ,
    mutation,
})