import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db.js";

export class ChatMember extends Model {
  declare id: string;
  declare chatId: string;
  declare userId: string;
  declare muted: boolean;
  declare pinned: boolean;
  declare unreadCount: number;
}

ChatMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
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
    unreadCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "chatMember",
    tableName: "chat_members",
    underscored: true,
    timestamps: true,
    indexes: [{ unique: true, fields: ["chat_id", "user_id"] }],
  },
);
