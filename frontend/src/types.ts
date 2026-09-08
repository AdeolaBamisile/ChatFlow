export type Theme = "dark" | "light";
export type AccentColor =
  | "blue"
  | "purple"
  | "pink"
  | "green"
  | "orange"
  | "cyan";

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar: string;
  bio: string;
  online: boolean;
  allowFriendRequests?: boolean;
}

export interface CurrentUser extends User {
  onlineStatusVisible: boolean;
  allowFriendRequests: boolean;
}

export type FriendRequestStatus = "sent" | "received";

export interface FriendRequest extends User {
  mutualFriends: number;
  status: FriendRequestStatus;
  createdAt: string;
}

export type ChatFilterOptions = "All" | "Unread" | "Pinned" | "Muted";

export interface Chat {
  id: string;
  friend: User;
  preview: string;
  lastMessageAt: string;
  unreadCount: number;
  muted: boolean;
  pinned: boolean;
  blockedByFriend?: boolean;
}

export type MessageType = "text" | "image" | "video" | "voice";

export interface MessageAttachment {
  id: string;
  type: "image" | "video" | "voice";
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
  duration?: number;
}

export interface BaseMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: MessageType;
  createdAt: string;
  replyTo?: Message | null;
  attachment?: MessageAttachment | null;
  reaction?: string | null;
  deleted?: boolean;
}

export interface SentMessage extends BaseMessage {
  senderId: string;
  seen: boolean;
}

export type Message = BaseMessage & {
  seen?: boolean;
};

export interface BlockedUser extends User {
  blockedAt: string;
}

export interface MediaItem extends MessageAttachment {
  messageId: string;
  createdAt: string;
}

export interface GeminiMessage {
  id: string;
  sender: "user" | "gemini";
  content: string;
  createdAt: string;
}

export interface ProfileUpdateInput {
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailInput {
  email: string;
  password: string;
}

export interface AppSettings {
  theme: Theme;
  accentColor: AccentColor;
  onlineStatusVisible: boolean;
  allowFriendRequests: boolean;
}

export interface PaginationInput {
  limit?: number;
  offset?: number;
}
