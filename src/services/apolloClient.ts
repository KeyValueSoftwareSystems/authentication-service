import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const link = createHttpLink({
  uri: process.env.REACT_APP_API_URL,
  // credentials: "include",
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
  link: from([authLink.concat(link)]),
  cache: new InMemoryCache(),
});

export default client;
