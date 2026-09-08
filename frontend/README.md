# ChatFlow frontend

Server-ready React + TypeScript frontend for ChatFlow.

## Run

```bash
npm install
npm run dev
```

`npm run start` is also available and starts Vite.

Create `.env` from `.env.example` and point `VITE_GRAPHQL_URL` and `VITE_GRAPHQL_WS_URL` at your backend.

## Architecture

- React + TypeScript
- React Router
- Zustand for client-side settings/session state
- Apollo Client for GraphQL queries and mutations
- graphql-ws for real-time subscriptions
- CSS modules are not used; the existing page stylesheet structure is retained so the UI remains easy to follow
- Server data is fetched through GraphQL; production source contains no dummy users/messages

## Backend contract

See `BACKEND_CONTRACT.md`. It lists the GraphQL operations and the expected entity shapes used by the frontend.
