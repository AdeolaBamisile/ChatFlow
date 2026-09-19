const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
    username: String!
    email: String!
    avatar: String
    bio: String
    online: Boolean!
    mutualFriends: Int!
    onlineStatusVisible: Boolean!
    allowFriendRequests: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type FriendRequest {
    id: ID!
    name: String!
    username: String!
    avatar: String
    bio: String
    online: Boolean!
    mutualFriends: Int!
    status: String!
    createdAt: String!
    senderId: ID!
    receiverId: ID!
  }

  type BlockedUser {
    id: ID!
    name: String!
    username: String!
    avatar: String
    bio: String
    online: Boolean!
    blockedAt: String!
  }

  type Chat {
    id: ID!
    friend: User!
    preview: String!
    lastMessageAt: String
    unreadCount: Int!
    muted: Boolean!
    pinned: Boolean!
    blockedByFriend: Boolean!
    blockedByMe: Boolean!
  }

  type Attachment {
    id: ID!
    type: String!
    url: String!
    name: String
    mimeType: String!
    size: Int!
    duration: Int
    messageId: ID
    createdAt: String!
  }

  type Message {
    id: ID!
    chatId: ID!
    senderId: ID!
    content: String!
    type: String!
    createdAt: String!
    seen: Boolean!
    reaction: String
    deleted: Boolean!
    replyTo: Message
    attachment: Attachment
  }

  type GeminiMessage {
    id: ID!
    sender: String!
    content: String!
    createdAt: String!
    chatId: ID
  }

  type Token {
    token: String!
    user: User!
  }

  type Request {
    id: ID!
    status: String!
    senderId: ID!
    receiverId: ID!
  }

  type PreparedMedia {
    fileId: ID!
    attachmentId: ID
    uploadUrl: String!
    publicUrl: String!
    path: String!
    token: String!
  }


  type Call {
    id: ID!
    type: String!
    roomUrl: String!
    token: String!
    caller: User!
    receiver: User!
  }

  type Reaction {
    messageId: ID!
    emoji: String!
  }

  input ProfileUpdateInput {
    name: String
    username: String
    bio: String
    avatar: String
  }

  type Query {
    me: User!
    chats: [Chat!]!
    messages(chatId: ID!): [Message!]!
    discoverUsers(search: String, category: String): [User!]!
    friendRequests(status: String): [FriendRequest!]!
    blockedUsers: [BlockedUser!]!
    chatMedia(chatId: ID!): [Attachment!]!
    geminiMessages(chatId: ID): [GeminiMessage!]!
  }

  type Mutation {
    login(email: String!, password: String!): Token
    createAccount(
      name: String!
      username: String!
      email: String!
      password: String!
    ): Token
    sendMessage(
      chatId: ID!
      content: String!
      type: String!
      replyToId: ID
      attachmentId: ID
    ): Message!
    deleteMessage(messageId: ID!): Boolean!
    reactToMessage(messageId: ID!, emoji: String!): Reaction!
    updateChat(chatId: ID!, pinned: Boolean, muted: Boolean): Chat!
    blockUser(userId: ID!): Boolean!
    unblockUser(userId: ID!): Boolean!
    sendFriendRequest(userId: ID!): Request!
    acceptFriendRequest(requestId: ID!): Boolean!
    ignoreFriendRequest(requestId: ID!): Boolean!
    removeFriendRequest(requestId: ID!): Boolean!
    updateProfile(input: ProfileUpdateInput!): User!
    updatePrivacy(
      onlineStatusVisible: Boolean!
      allowFriendRequests: Boolean!
    ): User!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
    changeEmail(email: String!, password: String!): User!
    deleteAccount: Boolean!
    sendGeminiMessage(content: String!, chatId: ID): GeminiMessage!
    prepareMediaUpload(
      fileName: String!
      mimeType: String!
      size: Int!
      kind: String!
    ): PreparedMedia!
    prepareProfileUpload(
      fileName: String!
      mimeType: String!
      size: Int!
    ): PreparedMedia!
    startCall(userId: ID!, type: String!): Call!
    endCall(callId: ID!): Boolean!
  }

  type Subscription {
    chatMessageAdded(chatId: ID!): Message!
    chatUpdated: Chat!
    friendRequestChanged: FriendRequest!
    geminiMessageAdded(chatId: ID): GeminiMessage!
    userPresenceChanged: User!
    incomingCall: Call!
    callEnded: ID!
  }
`;

export default typeDefs;
