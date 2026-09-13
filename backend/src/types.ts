import type { User } from "./models/User.js";

export interface Context {
  currentUser: User | null;
}

export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO";
export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "IGNORED" | "REMOVED";
