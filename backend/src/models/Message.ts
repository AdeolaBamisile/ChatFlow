import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db.js";

export class Message extends Model {
  declare id: string;
  declare chatId: string;
  declare senderId: string;
  declare content: string;
  declare type: string;
  declare seen: boolean;
  declare reaction: string | null;
  declare deleted: boolean;
  declare replyToId: string | null;
  declare createdAt: Date;
}

Message.init(
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
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
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
    replyToId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "message",
    tableName: "messages",
    underscored: true,
    timestamps: true,
  },
);
