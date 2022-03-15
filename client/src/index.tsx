import ReactDOM from "react-dom";
import { getAccessToken, setAccessToken } from "./utils/accessToken";
import { App } from "./App";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  Observable, 
} from '@apollo/client'
import { setContext } from "@apollo/client/link/context"
import { onError } from "@apollo/client/link/error";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import jwtDecode from "jwt-decode";

// define cache
const cache = new InMemoryCache({});

// Apollo Link to set the accessToken 
// to http authorization header for every request
const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable(observer => {
      let handle: any;
      Promise.resolve(operation)
        .then(operation => {
          const accessToken = getAccessToken();
          if (accessToken) {
            operation.setContext({
              headers: {
                authorization: `bearer ${accessToken}`
              }
            });
          }
        })
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer)
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) handle.unsubscribe();
      };
    })
);
// const authLink = new ApolloLink((operation, forward) => {
//   const accessToken = getAccessToken();
//   console.log("called auth link")
//   console.log(accessToken)
//   const authorizationHeader = accessToken ? `Bearer ${accessToken}` : null
//   operation.setContext({
//     headers: {
//       authorization: authorizationHeader,
//     },
//   });

//   return forward(operation);
//  });


// Check for expired tokens; link to get and set new refresh token and access token
const tokenRefreshLink: any = new TokenRefreshLink({
  accessTokenField: "accessToken",
  // check if token is valid or undefined
  isTokenValidOrUndefined: () => {
    // get token
    const token = getAccessToken();
    // if no token, then undefined so true
    if (!token) {
      return true;
    }
    // is token expired?
    try {
      // decode the token, get its expiration
      const { expiration }: any = jwtDecode(token) as {
        expiration: number;
      };
      // compare to current date, if greater, then it's expired
      if (Date.now() >= expiration * 1000) {
        console.log("invalid")
        return false;
      } else {
        return true;
      }
    } catch {
      return false;
    }
  },
  // method to fetch access token, get and set refresh token to cookies
  fetchAccessToken: () => {
    return fetch("http://localhost:4000/refresh_token", {
      method: "POST",
      credentials: "include"
    });
  },
  // after fetch, set the accessToken
  handleFetch: accessToken => {
    setAccessToken(accessToken);
  },
  // error handler
  handleError: err => {
    console.warn("Your refresh token is invalid. Try to relogin");
    console.error(err);
  }
});

// ApolloClient parameters (link, cache)
const client = new ApolloClient({
  // links to GraphQL server for req, res
  link: ApolloLink.from([
    tokenRefreshLink,
    onError(({ graphQLErrors, networkError }) => {
      console.log(graphQLErrors);
      console.log(networkError);
    }),
    requestLink,
    new HttpLink({
      uri: "http://localhost:4000/graphql",
      credentials: "include"
    }),
  ]),
  // GraphQL InMemoryCache
  cache
});

// render Virtual DOM to DOM
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);