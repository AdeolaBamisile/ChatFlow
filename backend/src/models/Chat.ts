import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db.js";

export class Chat extends Model {
  declare id: string;
  declare createdById: string;
  declare preview: string;
  declare lastMessageAt: Date | null;
}

Chat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    preview: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: "",
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "chat",
    tableName: "chats",
    underscored: true,
    timestamps: true,
  },
);
