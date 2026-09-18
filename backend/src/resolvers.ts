import { GraphQLError } from "graphql";
import { Op, Transaction } from "sequelize";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuid } from "uuid";

import { sequelize } from "./utils/db.js";
import { pubsub } from "./utils/pubsub.js";

import {
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
} from "./models/index.js";

import {
  requireUser,
  hashPassword,
  comparePassword,
  createToken,
} from "./utils/auth.js";

import {
  GEMINI_KEY,
  GEMINI_MODEL,
  SUPABASE_BUCKET,
  SUPABASE_KEY,
  SUPABASE_URL,
  // SUPABASE_UPLOAD_EXPIRES,
} from "./utils/config.js";

import type { Context } from "./types.js";

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const DEFAULT_AVATAR = `https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/default_profile_picture.png`;

const cleanUser = (user: User) => ({
  id: user.id,
  name: user.deletedAt ? "Deleted User" : user.name,
  username: user.deletedAt ? "deleted-user" : user.username,
  email: user.deletedAt ? "" : user.email,
  avatar: user.deletedAt ? null : user.avatar,
  bio: user.deletedAt ? null : user.bio,
  online: user.online,
  onlineStatusVisible: user.onlineStatusVisible,
  allowFriendRequests: user.allowFriendRequests,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const getFriendIds = async (userId: string): Promise<string[]> => {
  const rows = await Friendship.findAll({
    where: { userId },
    attributes: ["friendId"],
  });

  return rows.map((row) => row.friendId);
};

const areFriends = async (a: string, b: string): Promise<boolean> =>
  Boolean(await Friendship.findOne({ where: { userId: a, friendId: b } }));

const isBlockedEitherWay = async (a: string, b: string): Promise<boolean> =>
  Boolean(
    await Block.findOne({
      where: {
        [Op.or]: [
          { blockerId: a, blockedId: b },
          { blockerId: b, blockedId: a },
        ],
      },
    }),
  );

const mutualCount = async (a: string, b: string): Promise<number> => {
  const [first, second] = await Promise.all([getFriendIds(a), getFriendIds(b)]);
  const set = new Set(first);

  return second.filter((id) => set.has(id)).length;
};

const getChatForUser = async (
  chatId: string,
  userId: string,
): Promise<Chat> => {
  const member = await ChatMember.findOne({ where: { chatId, userId } });
  if (!member) throw new GraphQLError("Chat not found");

  const chat = await Chat.findByPk(chatId);
  if (!chat) throw new GraphQLError("Chat not found");

  return chat;
};

const getFriendFromChat = async (
  chatId: string,
  userId: string,
): Promise<User> => {
  const member = await ChatMember.findOne({ where: { chatId, userId } });
  if (!member) throw new GraphQLError("Chat not found");

  const other = await ChatMember.findOne({
    where: { chatId, userId: { [Op.ne]: userId } },
  });

  if (!other) throw new GraphQLError("Friend not found");

  const user = await User.findByPk(other.userId);
  if (!user) throw new GraphQLError("Friend not found");

  return user;
};

const chatView = async (chat: Chat, userId: string) => {
  const member = await ChatMember.findOne({
    where: { chatId: chat.id, userId },
  });

  const friend = await getFriendFromChat(chat.id, userId);

  const blockedByFriend = Boolean(
    await Block.findOne({ where: { blockerId: friend.id, blockedId: userId } }),
  );

  const blockedByMe = Boolean(
    await Block.findOne({ where: { blockerId: userId, blockedId: friend.id } }),
  );

  return {
    id: chat.id,
    friend: cleanUser(friend),
    preview: chat.preview,
    lastMessageAt: chat.lastMessageAt?.toISOString() ?? null,
    unreadCount: member?.unreadCount ?? 0,
    muted: member?.muted ?? false,
    pinned: member?.pinned ?? false,
    blockedByFriend,
    blockedByMe,
  };
};

const messageView = async (message: Message) => {
  const attachment = await Attachment.findOne({
    where: { messageId: message.id },
  });

  return {
    ...message.get(),
    createdAt: message.createdAt.toISOString(),
    attachment: attachment
      ? { ...attachment.get(), createdAt: attachment.createdAt.toISOString() }
      : null,
  };
};

const createChatIfNeeded = async (
  a: string,
  b: string,
  transaction?: Transaction,
): Promise<Chat> => {
  const memberships = await ChatMember.findAll({
    where: { userId: { [Op.in]: [a, b] } },
    transaction,
  });

  const chatIds = new Map<string, number>();

  for (const member of memberships)
    chatIds.set(member.chatId, (chatIds.get(member.chatId) ?? 0) + 1);

  const existingId = [...chatIds.entries()].find(
    ([, count]) => count === 2,
  )?.[0];

  if (existingId) {
    const existing = await Chat.findByPk(existingId, { transaction });
    if (existing) return existing;
  }

  const chat = await Chat.create(
    { id: uuid(), createdById: a, preview: "", lastMessageAt: null },
    { transaction },
  );

  await ChatMember.bulkCreate(
    [
      { id: uuid(), chatId: chat.id, userId: a },
      { id: uuid(), chatId: chat.id, userId: b },
    ],
    { transaction },
  );

  return chat;
};

const publishChat = async (
  chatId: string,
  userIds: string[],
): Promise<void> => {
  for (const userId of userIds) {
    const chat = await Chat.findByPk(chatId);

    if (!chat) continue;

    await pubsub.publish(`CHAT_UPDATED_${userId}`, {
      chatUpdated: await chatView(chat, userId),
    });
  }
};

const resolver = {
  User: {
    mutualFriends: async (user: User, _args: unknown, context: Context) => {
      return context.currentUser
        ? mutualCount(context.currentUser.id, user.id)
        : 0;
    },

    online: (user: User) => (user.onlineStatusVisible ? user.online : false),
  },

  FriendRequest: {
    name: async (
      request: FriendRequest,
      _args: unknown,
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const otherId =
        request.senderId === user.id ? request.receiverId : request.senderId;

      const other = await User.findByPk(otherId);

      return other?.deletedAt
        ? "Deleted User"
        : (other?.name ?? "Unknown User");
    },

    username: async (
      request: FriendRequest,
      _args: unknown,
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const otherId =
        request.senderId === user.id ? request.receiverId : request.senderId;

      const other = await User.findByPk(otherId);

      return other?.deletedAt
        ? "deleted-user"
        : (other?.username ?? "deleted-user");
    },

    avatar: async (
      request: FriendRequest,
      _args: unknown,
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const otherId =
        request.senderId === user.id ? request.receiverId : request.senderId;

      return (await User.findByPk(otherId))?.avatar ?? null;
    },

    bio: async (
      request: FriendRequest,
      _args: unknown,
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const otherId =
        request.senderId === user.id ? request.receiverId : request.senderId;

      return (await User.findByPk(otherId))?.bio ?? null;
    },

    online: async (
      request: FriendRequest,
      _args: unknown,
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const otherId =
        request.senderId === user.id ? request.receiverId : request.senderId;

      const other = await User.findByPk(otherId);

      return Boolean(other?.onlineStatusVisible && other.online);
    },

    mutualFriends: async (
      request: FriendRequest,
      _args: unknown,
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const otherId =
        request.senderId === user.id ? request.receiverId : request.senderId;

      return mutualCount(user.id, otherId);
    },

    createdAt: (request: FriendRequest) =>
      request.createdAt instanceof Date
        ? request.createdAt.toISOString()
        : new Date(request.createdAt).toISOString(),
  },

  Message: {
    createdAt: (message: Message) => message.createdAt.toISOString(),

    replyTo: async (message: Message) =>
      message.replyToId ? Message.findByPk(message.replyToId) : null,

    attachment: async (message: Message) =>
      Attachment.findOne({ where: { messageId: message.id } }),
  },

  Attachment: {
    createdAt: (attachment: Attachment) => attachment.createdAt.toISOString(),
  },

  GeminiMessage: {
    createdAt: (message: GeminiMessage) => message.createdAt.toISOString(),
  },

  Query: {
    me: async (_root: unknown, _args: unknown, { currentUser }: Context) =>
      cleanUser(requireUser(currentUser)),

    chats: async (_root: unknown, _args: unknown, { currentUser }: Context) => {
      const user = requireUser(currentUser);

      const members = await ChatMember.findAll({
        where: { userId: user.id },
        include: [{ model: Chat, as: "chat" }],
      });

      const result = await Promise.all(
        members.map((member) => chatView(member.get("chat") as Chat, user.id)),
      );

      return result.sort(
        (a, b) =>
          Number(b.pinned) - Number(a.pinned) ||
          new Date(b.lastMessageAt ?? 0).getTime() -
            new Date(a.lastMessageAt ?? 0).getTime(),
      );
    },

    messages: async (
      _root: unknown,
      { chatId }: { chatId: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      await getChatForUser(chatId, user.id);

      const messages = await Message.findAll({
        where: { chatId, deleted: false },
        order: [["createdAt", "ASC"]],
      });

      return Promise.all(messages.map(messageView));
    },

    discoverUsers: async (
      _root: unknown,
      { search }: { search?: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const friendIds = await getFriendIds(user.id);

      const requests = await FriendRequest.findAll({
        where: {
          [Op.or]: [{ senderId: user.id }, { receiverId: user.id }],
          status: "PENDING",
        },
      });

      const requestIds = requests.map((request) =>
        request.senderId === user.id ? request.receiverId : request.senderId,
      );

      const excluded = [user.id, ...friendIds, ...requestIds];

      const users = await User.findAll({
        where: {
          id: { [Op.notIn]: excluded },
          deletedAt: null,
          allowFriendRequests: true,
          ...(search
            ? {
                [Op.or]: [
                  { username: { [Op.iLike]: `%${search}%` } },
                  { name: { [Op.iLike]: `%${search}%` } },
                  { bio: { [Op.iLike]: `%${search}%` } },
                ],
              }
            : {}),
        },
        limit: 50,
      });
      return users.map(cleanUser);
    },

    friendRequests: async (
      _root: unknown,
      { status }: { status?: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const where = {
        status: "PENDING",
        ...(status === "sent"
          ? { senderId: user.id }
          : status === "received"
            ? { receiverId: user.id }
            : {
                [Op.or]: [{ senderId: user.id }, { receiverId: user.id }],
              }),
      };

      const rows = await FriendRequest.findAll({
        where,
        order: [["createdAt", "DESC"]],
      });

      return Promise.all(
        rows.map(async (request) => {
          const isSent = request.senderId === user.id;

          const otherId =
            request.senderId === user.id
              ? request.receiverId
              : request.senderId;

          const other = await User.findByPk(otherId);

          if (!other) throw new GraphQLError("User not found");

          return {
            id: request.id,
            name: other.deletedAt ? "Deleted User" : other.name,
            username: other.deletedAt ? "deleted-user" : other.username,
            avatar: other.avatar,
            bio: other.bio,
            online: other.onlineStatusVisible ? other.online : false,
            mutualFriends: await mutualCount(user.id, other.id),
            status: isSent ? "sent" : "received",
            createdAt:
              request.createdAt instanceof Date
                ? request.createdAt.toISOString()
                : new Date(request.createdAt).toISOString(),
            senderId: request.senderId,
            receiverId: request.receiverId,
          };
        }),
      );
    },

    blockedUsers: async (
      _root: unknown,
      _args: unknown,
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const rows = await Block.findAll({
        where: { blockerId: user.id },
        order: [["createdAt", "DESC"]],
      });

      return Promise.all(
        rows.map(async (row) => {
          const blocked = await User.findByPk(row.blockedId);
          if (!blocked) throw new GraphQLError("User not found");

          return {
            ...cleanUser(blocked),
            blockedAt: row.createdAt.toISOString(),
          };
        }),
      );
    },

    chatMedia: async (
      _: unknown,
      { chatId }: { chatId: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      await getChatForUser(chatId, user.id);

      const messages = await Message.findAll({
        where: { chatId },
        attributes: ["id"],
      });

      return Attachment.findAll({
        where: { messageId: { [Op.in]: messages.map((m) => m.id) } },
        order: [["createdAt", "DESC"]],
      });
    },

    geminiMessages: async (
      _: unknown,
      { chatId }: { chatId?: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      return GeminiMessage.findAll({
        where: { userId: user.id, ...(chatId ? { chatId } : { chatId: null }) },
        order: [["createdAt", "ASC"]],
      });
    },
  },

  Mutation: {
    createAccount: async (
      _root: unknown,
      args: { name: string; username: string; email: string; password: string },
    ) => {
      if (args.password.length < 8)
        throw new GraphQLError("Password must be at least 8 characters");

      const exists = await User.findOne({
        where: {
          [Op.or]: [
            { email: args.email.toLowerCase() },
            { username: args.username.toLowerCase() },
          ],
        },
      });

      if (exists) throw new GraphQLError("Email or username is already in use");

      const user = await User.create({
        id: uuid(),
        name: args.name.trim(),
        username: args.username.trim(),
        email: args.email.toLowerCase().trim(),
        passwordHash: await hashPassword(args.password),
        avatar: DEFAULT_AVATAR,
        bio: "",
        online: true,
      });

      return { token: createToken(user.id), user: cleanUser(user) };
    },

    login: async (
      _root: unknown,
      args: { email: string; password: string },
    ) => {
      const user = await User.findOne({
        where: { email: args.email.toLowerCase().trim() },
      });

      if (
        !user ||
        user.deletedAt ||
        !(await comparePassword(args.password, user.passwordHash))
      )
        throw new GraphQLError("Invalid email or password");

      await user.update({ online: true });

      return { token: createToken(user.id), user: cleanUser(user) };
    },

    sendFriendRequest: async (
      _root: unknown,
      { userId }: { userId: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const receiver = await User.findByPk(userId);

      if (!receiver || receiver.deletedAt)
        throw new GraphQLError("User not found");

      if (receiver.id === user.id || !receiver.allowFriendRequests)
        throw new GraphQLError("Friend requests are not allowed");

      if (await areFriends(user.id, receiver.id))
        throw new GraphQLError("You are already friends");

      if (await isBlockedEitherWay(user.id, receiver.id))
        throw new GraphQLError("This user cannot receive a request");

      const existing = await FriendRequest.findOne({
        where: {
          senderId: user.id,
          receiverId: receiver.id,
          status: "PENDING",
        },
      });

      if (existing) return existing;

      const reverse = await FriendRequest.findOne({
        where: {
          senderId: receiver.id,
          receiverId: user.id,
          status: "PENDING",
        },
      });

      if (reverse)
        throw new GraphQLError("This user has already sent you a request");

      const request = await FriendRequest.create({
        id: uuid(),
        senderId: user.id,
        receiverId: receiver.id,
        status: "PENDING",
      });

      await pubsub.publish(`FRIEND_REQUEST_${receiver.id}`, {
        friendRequestChanged: request,
      });

      return request;
    },

    acceptFriendRequest: async (
      _root: unknown,
      { requestId }: { requestId: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const request = await FriendRequest.findOne({
        where: { id: requestId, receiverId: user.id, status: "PENDING" },
      });

      if (!request) throw new GraphQLError("Request not found");

      const transaction = await sequelize.transaction();

      try {
        await request.update({ status: "ACCEPTED" }, { transaction });
        await Friendship.bulkCreate(
          [
            { id: uuid(), userId: user.id, friendId: request.senderId },
            { id: uuid(), userId: request.senderId, friendId: user.id },
          ],
          { transaction },
        );

        const chat = await createChatIfNeeded(
          user.id,
          request.senderId,
          transaction,
        );

        await transaction.commit();

        await pubsub.publish(`FRIEND_REQUEST_${user.id}`, {
          friendRequestChanged: request,
        });

        await pubsub.publish(`FRIEND_REQUEST_${request.senderId}`, {
          friendRequestChanged: request,
        });

        await publishChat(chat.id, [user.id, request.senderId]);
        return true;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    },

    ignoreFriendRequest: async (
      _root: unknown,
      { requestId }: { requestId: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const request = await FriendRequest.findOne({
        where: { id: requestId, receiverId: user.id, status: "PENDING" },
      });

      if (!request) throw new GraphQLError("Request not found");

      await request.destroy();

      await pubsub.publish(`FRIEND_REQUEST_${request.senderId}`, {
        friendRequestChanged: request,
      });

      await pubsub.publish(`FRIEND_REQUEST_${user.id}`, {
        friendRequestChanged: request,
      });
      return true;
    },

    removeFriendRequest: async (
      _root: unknown,
      { requestId }: { requestId: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const request = await FriendRequest.findOne({
        where: { id: requestId, senderId: user.id, status: "PENDING" },
      });

      if (!request) throw new GraphQLError("Request not found");

      await request.destroy();

      await pubsub.publish(`FRIEND_REQUEST_${request.receiverId}`, {
        friendRequestChanged: request,
      });

      await pubsub.publish(`FRIEND_REQUEST_${user.id}`, {
        friendRequestChanged: request,
      });

      return true;
    },

    updateChat: async (
      _root: unknown,
      args: { chatId: string; pinned?: boolean; muted?: boolean },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const member = await ChatMember.findOne({
        where: { chatId: args.chatId, userId: user.id },
      });

      if (!member) throw new GraphQLError("Chat not found");

      if (args.pinned !== undefined) member.pinned = args.pinned;
      if (args.muted !== undefined) member.muted = args.muted;

      await member.save();

      const chat = await Chat.findByPk(args.chatId);
      if (!chat) throw new GraphQLError("Chat not found");

      await publishChat(chat.id, [user.id]);

      return chatView(chat, user.id);
    },

    sendMessage: async (
      _root: unknown,
      args: {
        chatId: string;
        content: string;
        type: string;
        replyToId?: string;
        attachmentId?: string;
      },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const chat = await getChatForUser(args.chatId, user.id);
      const friend = await getFriendFromChat(chat.id, user.id);

      if (await isBlockedEitherWay(user.id, friend.id))
        throw new GraphQLError(
          "Messaging is unavailable because one of you has blocked the other",
        );

      if (!["TEXT", "IMAGE", "VIDEO", "AUDIO"].includes(args.type))
        throw new GraphQLError("Invalid message type");

      if (args.type === "TEXT" && !args.content.trim())
        throw new GraphQLError("Message cannot be empty");

      if (args.replyToId) {
        const reply = await Message.findOne({
          where: { id: args.replyToId, chatId: chat.id },
        });

        if (!reply) throw new GraphQLError("Reply message not found");
      }

      if (args.attachmentId) {
        const attachment = await Attachment.findOne({
          where: { id: args.attachmentId, userId: user.id },
        });

        if (!attachment) throw new GraphQLError("Attachment not found");
      }

      const message = await Message.create({
        id: uuid(),
        chatId: chat.id,
        senderId: user.id,
        content: args.content,
        type: args.type,
        replyToId: args.replyToId ?? null,
      });

      if (args.attachmentId)
        await Attachment.update(
          { messageId: message.id },
          { where: { id: args.attachmentId } },
        );

      await chat.update({
        preview: args.type === "TEXT" ? args.content : args.type.toLowerCase(),
        lastMessageAt: new Date(),
      });

      await ChatMember.update(
        { unreadCount: sequelize.literal('"unread_count" + 1') },
        { where: { chatId: chat.id, userId: friend.id } },
      );

      const view = await messageView(message);

      await pubsub.publish(`CHAT_MESSAGE_${chat.id}`, {
        chatMessageAdded: view,
      });

      await publishChat(chat.id, [user.id, friend.id]);

      return view;
    },

    deleteMessage: async (
      _root: unknown,
      { messageId }: { messageId: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      const message = await Message.findByPk(messageId);

      if (!message || message.senderId !== user.id)
        throw new GraphQLError("Message not found");

      await message.update({ deleted: true, content: "", reaction: null });

      await pubsub.publish(`CHAT_MESSAGE_${message.chatId}`, {
        chatMessageAdded: await messageView(message),
      });

      return true;
    },

    reactToMessage: async (
      _root: unknown,
      { messageId, emoji }: { messageId: string; emoji: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);
      const message = await Message.findByPk(messageId);

      if (!message) throw new GraphQLError("Message not found");

      await getChatForUser(message.chatId, user.id);
      await message.update({ reaction: emoji });

      await pubsub.publish(`CHAT_MESSAGE_${message.chatId}`, {
        chatMessageAdded: await messageView(message),
      });

      return { messageId, emoji };
    },

    blockUser: async (
      _root: unknown,
      { userId }: { userId: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      if (user.id === userId)
        throw new GraphQLError("You cannot block yourself");

      const target = await User.findByPk(userId);
      if (!target) throw new GraphQLError("User not found");

      await Block.findOrCreate({
        where: { blockerId: user.id, blockedId: userId },
        defaults: { id: uuid(), blockerId: user.id, blockedId: userId },
      });

      return true;
    },

    unblockUser: async (
      _root: unknown,
      { userId }: { userId: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      await Block.destroy({ where: { blockerId: user.id, blockedId: userId } });
      return true;
    },

    updateProfile: async (
      _root: unknown,
      {
        input,
      }: {
        input: {
          name?: string;
          username?: string;
          bio?: string;
          avatar?: string;
        };
      },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      if (input.username && input.username !== user.username) {
        const exists = await User.findOne({
          where: { username: input.username },
          attributes: ["id"],
        });

        if (exists) throw new GraphQLError("Username is already in use");
      }

      await user.update(input);
      return cleanUser(user);
    },

    updatePrivacy: async (
      _root: unknown,
      args: { onlineStatusVisible: boolean; allowFriendRequests: boolean },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);
      await user.update(args);
      return cleanUser(user);
    },

    changePassword: async (
      _root: unknown,
      args: { currentPassword: string; newPassword: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      if (!(await comparePassword(args.currentPassword, user.passwordHash)))
        throw new GraphQLError("Current password is incorrect");

      if (args.newPassword.length < 8)
        throw new GraphQLError("Password must be at least 8 characters");

      await user.update({ passwordHash: await hashPassword(args.newPassword) });
      return true;
    },

    changeEmail: async (
      _root: unknown,
      args: { email: string; password: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      if (!(await comparePassword(args.password, user.passwordHash)))
        throw new GraphQLError("Password is incorrect");

      const exists = await User.findOne({
        where: {
          email: args.email.toLowerCase().trim(),
          id: { [Op.ne]: user.id },
        },
      });

      if (exists) throw new GraphQLError("Email is already in use");

      await user.update({ email: args.email.toLowerCase().trim() });
      return cleanUser(user);
    },

    deleteAccount: async (
      _root: unknown,
      _args: unknown,
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      await user.update({
        deletedAt: new Date(),
        online: false,
        name: "Deleted User",
        username: `deleted-${user.id.slice(0, 8)}`,
        email: `deleted-${user.id}@deleted.local`,
        avatar: null,
        bio: null,
      });

      return true;
    },

    prepareMediaUpload: async (
      _root: unknown,
      args: { fileName: string; mimeType: string; size: number; kind: string },
      { currentUser }: Context,
    ) =>
      prepareUpload(
        requireUser(currentUser),
        args.fileName,
        args.mimeType,
        args.size,
        args.kind,
      ),

    prepareProfileUpload: async (
      _root: unknown,
      args: { fileName: string; mimeType: string; size: number },
      { currentUser }: Context,
    ) =>
      prepareUpload(
        requireUser(currentUser),
        args.fileName,
        args.mimeType,
        args.size,
        "profile",
      ),

    createAttachment: async (
      _root: unknown,
      args: {
        fileId: string;
        type: string;
        mimeType: string;
        size: number;
        name?: string;
        duration?: number;
      },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      if (!["IMAGE", "VIDEO", "AUDIO"].includes(args.type))
        throw new GraphQLError("Invalid attachment type");

      const file = await File.findOne({
        where: { id: args.fileId, userId: user.id },
      });

      if (!file) throw new GraphQLError("File not found");

      return Attachment.create({
        id: uuid(),
        type: args.type,
        url: file.publicUrl,
        path: file.path,
        name: args.name ?? null,
        mimeType: args.mimeType,
        size: args.size,
        duration: args.duration ?? null,
        messageId: null,
        userId: user.id,
      });
    },

    sendGeminiMessage: async (
      _root: unknown,
      { content, chatId }: { content: string; chatId?: string },
      { currentUser }: Context,
    ) => {
      const user = requireUser(currentUser);

      if (!content.trim()) throw new GraphQLError("Message cannot be empty");

      if (chatId) await getChatForUser(chatId, user.id);

      const userMessage = await GeminiMessage.create({
        id: uuid(),
        userId: user.id,
        chatId: chatId ?? null,
        sender: "user",
        content: content.trim(),
      });

      const history = await GeminiMessage.findAll({
        where: { userId: user.id, ...(chatId ? { chatId } : { chatId: null }) },
        order: [["createdAt", "ASC"]],
        limit: 100,
      });

      let systemInstruction =
        "You are the AI assistant for this chatting website. Keep answers helpful and concise.";

      let contents = history.map((item) => ({
        role: item.sender === "gemini" ? "model" : "user",
        parts: [{ text: item.content }],
      }));

      if (chatId) {
        const messages = await Message.findAll({
          where: { chatId, deleted: false },
          order: [["createdAt", "ASC"]],
          limit: 200,
        });

        const transcript = messages
          .map(
            (m) =>
              `${m.senderId === user.id ? "User" : "Friend"}: ${m.content}`,
          )
          .join("\n");

        systemInstruction = `You are the AI assistant for this chatting 
        website. Here is a live inventory from our database: ${transcript}
        
        Rules:
        - Answer questions about the chat history
        - Never invent new chat history that does not exist
        - Keep answers helpful and concise`;

        contents = [{ role: "user", parts: [{ text: content.trim() }] }];
      }

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: { systemInstruction },
      });

      const answer =
        response.text?.trim() || "I could not generate a response.";

      const geminiMessage = await GeminiMessage.create({
        id: uuid(),
        userId: user.id,
        chatId: chatId ?? null,
        sender: "gemini",
        content: answer,
      });

      await pubsub.publish(`GEMINI_MESSAGE_${user.id}_${chatId ?? "global"}`, {
        geminiMessageAdded: geminiMessage,
      });

      void userMessage;
      return geminiMessage;
    },
  },

  Subscription: {
    chatMessageAdded: {
      subscribe: async (
        _root: unknown,
        { chatId }: { chatId: string },
        { currentUser }: Context,
      ) => {
        const user = requireUser(currentUser);

        await getChatForUser(chatId, user.id);
        return pubsub.asyncIterableIterator(`CHAT_MESSAGE_${chatId}`);
      },
    },

    chatUpdated: {
      subscribe: (_root: unknown, _args: unknown, { currentUser }: Context) => {
        if (!currentUser) throw new GraphQLError("You must be logged in");

        return pubsub.asyncIterableIterator(`CHAT_UPDATED_${currentUser.id}`);
      },
    },

    friendRequestChanged: {
      subscribe: (_root: unknown, _args: unknown, { currentUser }: Context) => {
        if (!currentUser) throw new GraphQLError("You must be logged in");

        return pubsub.asyncIterableIterator(`FRIEND_REQUEST_${currentUser.id}`);
      },
    },

    geminiMessageAdded: {
      subscribe: async (
        _root: unknown,
        { chatId }: { chatId?: string },
        { currentUser }: Context,
      ) => {
        const user = requireUser(currentUser);
        if (chatId) await getChatForUser(chatId, user.id);

        return pubsub.asyncIterableIterator(
          `GEMINI_MESSAGE_${user.id}_${chatId ?? "global"}`,
        );
      },
    },

    userPresenceChanged: {
      subscribe: (_root: unknown, _args: unknown, { currentUser }: Context) => {
        if (!currentUser) throw new GraphQLError("You must be logged in");

        return pubsub.asyncIterableIterator(`PRESENCE_${currentUser.id}`);
      },
    },
  },
};

async function prepareUpload(
  user: User,
  fileName: string,
  mimeType: string,
  size: number,
  kind: string,
) {
  const allowed =
    kind === "profile"
      ? ["image/jpeg", "image/png", "image/webp"]
      : [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
          "video/webm",
          "audio/webm",
          "audio/mpeg",
          "audio/ogg",
        ];

  if (!allowed.includes(mimeType))
    throw new GraphQLError("Unsupported file type");

  if (size > 50 * 1024 * 1024) throw new GraphQLError("File is too large");

  const path = `${kind}/${user.id}/${cryptoSafeName(fileName)}`;

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .createSignedUploadUrl(path, { upsert: false });

  if (error || !data)
    throw new GraphQLError(error?.message ?? "Could not prepare upload");

  const publicUrl = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path)
    .data.publicUrl;

  const file = await File.create({
    id: uuid(),
    path,
    publicUrl,
    userId: user.id,
  });

  return {
    fileId: file.id,
    uploadUrl: data.signedUrl,
    publicUrl,
    path,
    token: data.token,
  };
}

const cryptoSafeName = (name: string): string =>
  `${uuid()}-${name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

export default resolver;
