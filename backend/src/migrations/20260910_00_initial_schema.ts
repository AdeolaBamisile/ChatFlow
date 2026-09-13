import { DataTypes, QueryInterface } from "sequelize";

interface Context {
  context: QueryInterface;
}

const id = { type: DataTypes.UUID, allowNull: false };

export const up = async ({ context: q }: Context): Promise<void> => {
  await q.addColumn("users", "password_hash", {
    type: DataTypes.STRING,
    allowNull: false,
  });

  await q.addColumn("users", "created_at", {
    type: DataTypes.DATE,
    allowNull: true,
  });

  await q.addColumn("users", "updated_at", {
    type: DataTypes.DATE,
    allowNull: true,
  });

  await q.addColumn("users", "deleted_at", {
    type: DataTypes.DATE,
    allowNull: true,
  });

  await q.changeColumn("users", "online", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  await q.changeColumn("users", "mutual_friends", {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  });

  await q.createTable("friend_requests", {
    id: {
      ...id,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    sender_id: id,
    receiver_id: id,
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "PENDING",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await q.addIndex("friend_requests", ["sender_id", "receiver_id", "status"], {
    unique: true,
  });

  await q.createTable("friendships", {
    id: {
      ...id,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: id,
    friend_id: id,
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await q.addIndex("friendships", ["user_id", "friend_id"], { unique: true });

  await q.createTable("blocks", {
    id: {
      ...id,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    blocker_id: id,
    blocked_id: id,
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await q.addIndex("blocks", ["blocker_id", "blocked_id"], { unique: true });

  await q.createTable("chats", {
    id: {
      ...id,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    created_by_id: id,
    preview: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: "",
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await q.createTable("chat_members", {
    id: {
      ...id,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    chat_id: id,
    user_id: id,
    muted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    pinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    unread_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await q.addIndex("chat_members", ["chat_id", "user_id"], { unique: true });

  await q.createTable("messages", {
    id: {
      ...id,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    chat_id: id,
    sender_id: id,
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "TEXT",
    },
    seen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    reaction: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    reply_to_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await q.createTable("files", {
    id: {
      ...id,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    public_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: id,
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await q.createTable("attachments", {
    id: {
      ...id,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    message_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    user_id: id,
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await q.createTable("gemini_messages", {
    id: {
      ...id,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: id,
    chat_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    sender: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await q.addIndex("messages", ["chat_id", "created_at"]);

  await q.addIndex("gemini_messages", ["user_id", "chat_id", "created_at"]);
};

export const down = async ({ context: q }: Context): Promise<void> => {
  await q.dropTable("gemini_messages");
  await q.dropTable("attachments");
  await q.dropTable("files");
  await q.dropTable("messages");
  await q.dropTable("chat_members");
  await q.dropTable("chats");
  await q.dropTable("blocks");
  await q.dropTable("friendships");
  await q.dropTable("friend_requests");
  await q.removeColumn("users", "password_hash");
  await q.removeColumn("users", "created_at");
  await q.removeColumn("users", "updated_at");
  await q.removeColumn("users", "deleted_at");
};
