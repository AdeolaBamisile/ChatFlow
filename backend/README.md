# ChatFlow Backend

This is the backend for the ChatFlow messaging website.

The project intentionally uses a simple structure: Express, GraphQL, Sequelize/PostgreSQL, GraphQL subscriptions over WebSocket, Supabase Storage, JWT and bcrypt. There is no extra service layer or framework hiding the database work so the code stays easy to follow.

## Run locally

1. Copy the real values into `.env`.
2. Make sure PostgreSQL is reachable through `DATABASE`.
3. Make sure the Supabase bucket in `SUPABASE_BUCKET` exists.
4. Put your Gemini API key in `GEMINI_KEY`.
5. Run:

```bash
npm install
npm run dev
```

The GraphQL endpoint is:

```text
http://localhost:3001/graphql
```

The WebSocket endpoint is:

```text
ws://localhost:3001/graphql
```

The health check is:

```text
http://localhost:3001/health
```

## Production

Build the TypeScript files with:

```bash
npm run build
```

Then start with:

```bash
npm start
```

## Authentication

The frontend sends:

```text
Authorization: Bearer <token>
```

The token is signed with `SECRET`. The verified user is placed in GraphQL context as `currentUser`.

WebSocket connections use the same value through `connectionParams`:

```ts
connectionParams: {
  authorization: `bearer ${token}`,
}
```

## Gemini

There are two conversations:

- `chatId = null`: the normal Gemini page. The user's saved Gemini history is sent to Gemini on every request.
- `chatId = <chat id>`: Gemini for a particular conversation. The server loads the real chat messages and puts them into the system instruction so Gemini can answer questions about that conversation without inventing history.

The model is configured with `GEMINI_MODEL` and defaults to `gemini-3.5-flash`.

## Supabase media

The server does not put large image, video or audio files through GraphQL. It creates a signed upload URL, the frontend uploads the file to Supabase, then creates an attachment record. Messages reference that attachment.

Allowed message media types are images, videos and audio. Profile pictures only allow common image formats.

## Database

The important relationships are:

```text
User
 ├── FriendRequest
 ├── Friendship
 ├── Block
 ├── ChatMember ── Chat ── Message
 ├── Attachment
 └── GeminiMessage
```

Pin and mute are stored on `chat_members`, because they belong to one user in one chat.

## Existing database warning

The original project already had a users migration. The new migration adds the fields needed by the completed backend and creates the remaining tables. If an old development database already contains users, those old users do not have a password hash because the original schema did not store one. New accounts created through this backend have bcrypt password hashes. For a development database, recreating the database is the simplest clean start.
