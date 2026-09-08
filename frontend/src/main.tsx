import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App";

import "./Styles/App.css";
import "./Styles/Discover&Requests.css";
import "./Styles/Chats.css";
import "./Styles/LoginForm.css";
import "./Styles/Settings.css";
import "./Styles/Gemini.css";
import "./Styles/Theme.css";

import { ApolloProvider } from "@apollo/client/react";
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

import { SetContextLink } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

const getToken = () => window.localStorage.getItem("loggedInUser");

const authLink = new SetContextLink(({ headers }) => ({
  headers: {
    ...headers,
    authorization: getToken() ? `bearer ${getToken()}` : null,
  },
}));

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || "http://localhost:3001/graphql",
});

const getWsUrl = () => {
  const host = window.location.host;
  const protocol = window.location.protocol === "https" ? "wss" : "ws";

  console.log(`${protocol}//${host}/graphql`);
  return `${protocol}//${host}/graphql`;
};

const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_GRAPHQL_WS_URL || getWsUrl(),
    connectionParams: () => ({
      authorization: getToken() ? `bearer ${getToken()}` : "",
    }),
  }),
);

const splitLink = ApolloLink.split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <Router>
        <App />
      </Router>
    </ApolloProvider>
  </StrictMode>,
);
