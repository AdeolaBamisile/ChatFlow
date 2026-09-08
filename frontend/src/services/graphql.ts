import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      username
      email
      avatar
      bio
      online
      onlineStatusVisible
      allowFriendRequests
    }
  }
`;

export const CHATS_QUERY = gql`
  query Chats {
    chats {
      id
      preview
      lastMessageAt
      unreadCount
      muted
      pinned
      friend {
        id
        name
        username
        avatar
        bio
        online
      }
    }
  }
`;

export const MESSAGES_QUERY = gql`
  query Messages($chatId: ID!) {
    messages(chatId: $chatId) {
      id
      chatId
      senderId
      content
      type
      createdAt
      seen
      reaction
      deleted
      replyTo {
        id
        chatId
        senderId
        content
        type
        createdAt
      }
      attachment {
        id
        type
        url
        name
        mimeType
        size
        duration
      }
    }
  }
`;

export const DISCOVER_USERS_QUERY = gql`
  query DiscoverUsers($search: String, $category: String) {
    discoverUsers(search: $search, category: $category) {
      id
      name
      username
      avatar
      bio
      online
      mutualFriends
    }
  }
`;

export const FRIEND_REQUESTS_QUERY = gql`
  query FriendRequests($status: String) {
    friendRequests(status: $status) {
      id
      name
      username
      avatar
      bio
      online
      mutualFriends
      status
      createdAt
    }
  }
`;

export const BLOCKED_USERS_QUERY = gql`
  query BlockedUsers {
    blockedUsers {
      id
      name
      username
      avatar
      bio
      online
      blockedAt
    }
  }
`;

export const MEDIA_QUERY = gql`
  query ChatMedia($chatId: ID!) {
    chatMedia(chatId: $chatId) {
      id
      type
      url
      name
      mimeType
      size
      duration
      messageId
      createdAt
    }
  }
`;

export const GEMINI_MESSAGES_QUERY = gql`
  query GeminiMessages {
    geminiMessages {
      id
      sender
      content
      createdAt
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        username
        email
        avatar
        bio
        online
        onlineStatusVisible
        allowFriendRequests
      }
    }
  }
`;

export const CREATE_ACCOUNT_MUTATION = gql`
  mutation CreateAccount(
    $name: String!
    $username: String!
    $email: String!
    $password: String!
  ) {
    createAccount(
      name: $name
      username: $username
      email: $email
      password: $password
    ) {
      token
      user {
        id
        name
        username
        email
        avatar
        bio
        online
        onlineStatusVisible
        allowFriendRequests
      }
    }
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage(
    $chatId: ID!
    $content: String!
    $type: String!
    $replyToId: ID
    $attachmentId: ID
  ) {
    sendMessage(
      chatId: $chatId
      content: $content
      type: $type
      replyToId: $replyToId
      attachmentId: $attachmentId
    ) {
      id
      chatId
      senderId
      content
      type
      createdAt
      seen
      reaction
      deleted
      replyTo {
        id
        chatId
        senderId
        content
        type
        createdAt
      }
      attachment {
        id
        type
        url
        name
        mimeType
        size
        duration
      }
    }
  }
`;

export const DELETE_MESSAGE_MUTATION = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
  }
`;

export const REACT_MESSAGE_MUTATION = gql`
  mutation ReactToMessage($messageId: ID!, $emoji: String!) {
    reactToMessage(messageId: $messageId, emoji: $emoji) {
      messageId
      emoji
    }
  }
`;

export const UPDATE_CHAT_MUTATION = gql`
  mutation UpdateChat($chatId: ID!, $pinned: Boolean, $muted: Boolean) {
    updateChat(chatId: $chatId, pinned: $pinned, muted: $muted) {
      id
      preview
      lastMessageAt
      unreadCount
      muted
      pinned
      friend {
        id
        name
        username
        avatar
        bio
        online
      }
    }
  }
`;

export const BLOCK_USER_MUTATION = gql`
  mutation BlockUser($userId: ID!) {
    blockUser(userId: $userId)
  }
`;

export const UNBLOCK_USER_MUTATION = gql`
  mutation UnblockUser($userId: ID!) {
    unblockUser(userId: $userId)
  }
`;

export const SEND_FRIEND_REQUEST_MUTATION = gql`
  mutation SendFriendRequest($userId: ID!) {
    sendFriendRequest(userId: $userId) {
      id
      status
    }
  }
`;

export const ACCEPT_FRIEND_REQUEST_MUTATION = gql`
  mutation AcceptFriendRequest($requestId: ID!) {
    acceptFriendRequest(requestId: $requestId)
  }
`;

export const IGNORE_FRIEND_REQUEST_MUTATION = gql`
  mutation IgnoreFriendRequest($requestId: ID!) {
    ignoreFriendRequest(requestId: $requestId)
  }
`;

export const REMOVE_FRIEND_REQUEST_MUTATION = gql`
  mutation RemoveFriendRequest($requestId: ID!) {
    removeFriendRequest(requestId: $requestId)
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: ProfileUpdateInput!) {
    updateProfile(input: $input) {
      id
      name
      username
      email
      avatar
      bio
      online
      onlineStatusVisible
      allowFriendRequests
    }
  }
`;

export const UPDATE_PRIVACY_MUTATION = gql`
  mutation UpdatePrivacy(
    $onlineStatusVisible: Boolean!
    $allowFriendRequests: Boolean!
  ) {
    updatePrivacy(
      onlineStatusVisible: $onlineStatusVisible
      allowFriendRequests: $allowFriendRequests
    ) {
      id
      onlineStatusVisible
      allowFriendRequests
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

export const CHANGE_EMAIL_MUTATION = gql`
  mutation ChangeEmail($email: String!, $password: String!) {
    changeEmail(email: $email, password: $password) {
      id
      email
    }
  }
`;

export const DELETE_ACCOUNT_MUTATION = gql`
  mutation DeleteAccount {
    deleteAccount
  }
`;

export const SEND_GEMINI_MESSAGE_MUTATION = gql`
  mutation SendGeminiMessage($content: String!, $chatId: ID) {
    sendGeminiMessage(content: $content, chatId: $chatId) {
      id
      sender
      content
      createdAt
    }
  }
`;

export const PREPARE_MEDIA_UPLOAD_MUTATION = gql`
  mutation PrepareMediaUpload(
    $chatId: ID!
    $fileName: String!
    $mimeType: String!
    $size: Int!
  ) {
    prepareMediaUpload(
      chatId: $chatId
      fileName: $fileName
      mimeType: $mimeType
      size: $size
    ) {
      uploadUrl
      fileId
    }
  }
`;

export const CHAT_MESSAGE_SUBSCRIPTION = gql`
  subscription ChatMessageAdded($chatId: ID!) {
    chatMessageAdded(chatId: $chatId) {
      id
      chatId
      senderId
      content
      type
      createdAt
      seen
      reaction
      deleted
      replyTo {
        id
        chatId
        senderId
        content
        type
        createdAt
      }
      attachment {
        id
        type
        url
        name
        mimeType
        size
        duration
      }
    }
  }
`;

export const CHAT_UPDATED_SUBSCRIPTION = gql`
  subscription ChatUpdated {
    chatUpdated {
      id
      preview
      lastMessageAt
      unreadCount
      muted
      pinned
      friend {
        id
        name
        username
        avatar
        bio
        online
      }
    }
  }
`;

export const FRIEND_REQUEST_SUBSCRIPTION = gql`
  subscription FriendRequestChanged {
    friendRequestChanged {
      id
      name
      username
      avatar
      bio
      online
      mutualFriends
      status
      createdAt
    }
  }
`;

export const GEMINI_MESSAGE_SUBSCRIPTION = gql`
  subscription GeminiMessageAdded {
    geminiMessageAdded {
      id
      sender
      content
      createdAt
    }
  }
`;

export const PREPARE_PROFILE_UPLOAD_MUTATION = gql`
  mutation PrepareProfileUpload(
    $fileName: String!
    $mimeType: String!
    $size: Int!
  ) {
    prepareProfileUpload(
      fileName: $fileName
      mimeType: $mimeType
      size: $size
    ) {
      uploadUrl
      fileId
      publicUrl
    }
  }
`;
