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
import { onError } from "@apollo/client/link/error";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import jwtDecode from "jwt-decode";

const url = 'https://horizon-admin-panel.netlify.app/api'

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
      const { exp }: any = jwtDecode(token)
      // compare to current date, if greater, then it's expired
      if (Date.now() >= exp * 1000) {
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
    return fetch(`${url}/refresh_token`, {
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
    onError(({ graphQLErrors }) => {
      if (graphQLErrors) {
        for (let err of graphQLErrors) {
          if (err.message.includes('Not Authenticated')) {
            setAccessToken("")
            return
          }
        }
      }
    }),
    requestLink,
    new HttpLink({
      uri: `${url}/graphql`,
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