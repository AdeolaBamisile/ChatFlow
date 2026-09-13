# Frontend connection

The frontend can use the same-origin GraphQL paths when the backend serves the built frontend:

```ts
const httpLink = new HttpLink({
  uri: "/graphql",
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/graphql`,
    connectionParams: () => ({
      authorization: getToken() ? `bearer ${getToken()}` : "",
    }),
  }),
);
```

For local Vite development, point the HTTP link at the backend URL or configure a Vite proxy. The production setup can use `/graphql` exactly as above.
