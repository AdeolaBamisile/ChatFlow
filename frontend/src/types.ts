export interface User {
  name: string;
  email: string;
  password: string;
}

export interface RequestUser {
  id: number;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  mutualFriends: number;
  request?: "recieved" | "sent";
}

export interface DiscoverUser {
  id: number;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  mutualFriends: number;
}

export interface Chat {
  id: number;
  name: string;
  username?: string;
  avatar: string;
  preview: string;
  time: string;
  unread?: number;
  muted?: boolean;
  online?: boolean;
  pinned?: boolean;
}

interface BaseMessage {
  id: number;
  message: string;
  time: string;
  reply: string | null;
}

export interface SentMessage extends BaseMessage {
  type: "sent";
  seen: boolean;
}

interface RecievedMessage extends BaseMessage {
  type: "recieved";
}

export type Message = SentMessage | RecievedMessage;

export type ChatFilterOptions = "All" | "Unread" | "Pinned" | "Muted";
