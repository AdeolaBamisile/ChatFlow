# ChatFlow frontend/backend contract

The frontend uses Apollo Client for GraphQL queries/mutations and `graphql-ws` for subscriptions. The production build contains no user, chat, request, blocked-user, message or Gemini dummy data.

## Authentication

The frontend stores the access token in `localStorage` under `loggedInUser` and sends it as `Authorization: bearer <token>` over HTTP and WebSocket connections.

Required operations are declared in `src/services/graphql.ts`.

## Core entities

- `User`: id, name, username, email, avatar, bio, online
- `CurrentUser`: User + onlineStatusVisible + allowFriendRequests
- `Chat`: id, friend, preview, lastMessageAt, unreadCount, muted, pinned, blockedByFriend
- `Message`: id, chatId, senderId, content, type, createdAt, replyTo, attachment, reaction, deleted, seen
- `FriendRequest`: id, user fields, mutualFriends, status, createdAt
- `MessageAttachment`: id, type (`image | video | voice`), url, name, mimeType, size, duration

The frontend determines whether a message is sent or received by comparing `message.senderId` with the authenticated user's `id`. Do not store a UI-only `sent/received` value in the database.

## Media

For image/video/voice messages the frontend calls `prepareMediaUpload`, uploads the file to the returned signed URL, then calls `sendMessage` with the returned `attachmentId`. The backend should store the final Supabase object and expose its stable URL through the message attachment.

Profile pictures use the same signed-upload pattern through `prepareProfileUpload`.

## Real-time events

Implement these subscriptions:

- `chatMessageAdded(chatId)` — new text/media/voice message or message update
- `chatUpdated` — chat preview, pin/mute/unread changes
- `friendRequestChanged` — request sent/received/accepted/ignored/removed
- `geminiMessageAdded` — Gemini response (and optionally persisted user prompt)

## Blocking

`blockUser` and `unblockUser` should update both users' effective relationship. A chat returned to the blocked user should expose `blockedByFriend: true`, causing the frontend composer and media controls to be disabled.

When the blocker unblocks a user, the normal chat should be returned by `chats` again.

## Account deletion

After `deleteAccount`, the deleted user's friends should see the relationship/chat with a display user such as `Deleted user`. The frontend does not fabricate this state; it renders what the API returns.

## Friend-request rules

The backend should enforce:

1. Friends are absent from Discover.
2. Existing outgoing/incoming requests are absent from Discover.
3. Sending a request creates an outgoing request for the sender and an incoming request for the recipient.
4. Removing an outgoing request makes the target discoverable again.
5. Ignoring an incoming request removes it and makes the requester discoverable again.
6. Accepting creates a friendship and a chat for both users.
7. `allowFriendRequests=false` prevents new incoming requests.

## Privacy

`updatePrivacy` persists `onlineStatusVisible` and `allowFriendRequests`. The backend should also enforce these settings; the frontend toggle is not a security boundary.
