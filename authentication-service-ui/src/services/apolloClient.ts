import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";

import { ErrorMessagesArray } from "./constants";
import { RoutePaths } from "./../routes/routePaths";

const link = createHttpLink({
  uri: process.env.REACT_APP_API_URL,
  // credentials: "include",
});

const ErrorCheck = (message: string) => {
  if (ErrorMessagesArray.includes(message)) {
    window.location.hash = RoutePaths.login;
  }
};

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => ErrorCheck(message));
  }
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("access_token");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token.replaceAll('"', "")}` : "",
    },
  };
});

const client = new ApolloClient({
  link: from([errorLink, authLink.concat(link)]),
  cache: new InMemoryCache(),
});

export default client;
