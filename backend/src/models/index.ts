import { User } from "./User.js";
import { FriendRequest } from "./FriendRequest.js";
import { Friendship } from "./Friendship.js";
import { Block } from "./Block.js";
import { Chat } from "./Chat.js";
import { ChatMember } from "./ChatMember.js";
import { Message } from "./Message.js";
import { Attachment } from "./Attachment.js";
import { File } from "./File.js";
import { GeminiMessage } from "./GeminiMessage.js";

User.hasMany(FriendRequest, { foreignKey: "senderId", as: "sentRequests" });
User.hasMany(FriendRequest, {
  foreignKey: "receiverId",
  as: "receivedRequests",
});
FriendRequest.belongsTo(User, { foreignKey: "senderId", as: "sender" });
FriendRequest.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });

User.hasMany(Friendship, { foreignKey: "userId", as: "friendships" });
User.hasMany(Friendship, { foreignKey: "friendId", as: "friendOf" });
Friendship.belongsTo(User, { foreignKey: "userId", as: "user" });
Friendship.belongsTo(User, { foreignKey: "friendId", as: "friend" });

User.hasMany(Block, { foreignKey: "blockerId", as: "blocks" });
User.hasMany(Block, { foreignKey: "blockedId", as: "blockedBy" });
Block.belongsTo(User, { foreignKey: "blockerId", as: "blocker" });
Block.belongsTo(User, { foreignKey: "blockedId", as: "blocked" });

Chat.belongsTo(User, { foreignKey: "createdById", as: "creator" });
Chat.hasMany(ChatMember, { foreignKey: "chatId", as: "members" });
ChatMember.belongsTo(Chat, { foreignKey: "chatId", as: "chat" });
ChatMember.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(ChatMember, { foreignKey: "userId", as: "chatMemberships" });

Chat.hasMany(Message, { foreignKey: "chatId", as: "messages" });
Message.belongsTo(Chat, { foreignKey: "chatId", as: "chat" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
User.hasMany(Message, { foreignKey: "senderId", as: "messages" });
Message.belongsTo(Message, { foreignKey: "replyToId", as: "replyTo" });
Message.hasMany(Message, { foreignKey: "replyToId", as: "replies" });

Message.hasMany(Attachment, { foreignKey: "messageId", as: "attachments" });
Attachment.belongsTo(Message, { foreignKey: "messageId", as: "message" });
Attachment.belongsTo(User, { foreignKey: "userId", as: "owner" });
User.hasMany(Attachment, { foreignKey: "userId", as: "attachments" });

File.belongsTo(User, { foreignKey: "userId", as: "owner" });
User.hasMany(File, { foreignKey: "userId", as: "files" });

GeminiMessage.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(GeminiMessage, { foreignKey: "userId", as: "geminiMessages" });
GeminiMessage.belongsTo(Chat, { foreignKey: "chatId", as: "chat" });
Chat.hasMany(GeminiMessage, { foreignKey: "chatId", as: "geminiMessages" });

export {
  User,
  FriendRequest,
  Friendship,
  Block,
  Chat,
  ChatMember,
  Message,
  Attachment,
  File,
  GeminiMessage,
};
