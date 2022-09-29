import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";

const link = createHttpLink({
  uri: "http://localhost:4000/auth/api/graphql",
  // credentials: "include",
});

// to manage when graphQLErrors occurs.
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => alert(message));
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
