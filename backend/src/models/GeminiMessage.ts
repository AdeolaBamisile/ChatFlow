import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db.js";

export class GeminiMessage extends Model {
  declare id: string;
  declare userId: string;
  declare chatId: string | null;
  declare sender: string;
  declare content: string;
  declare createdAt: Date;
}

GeminiMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    chatId: {
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
  },
  {
    sequelize,
    modelName: "geminiMessage",
    tableName: "gemini_messages",
    underscored: true,
    timestamps: true,
  },
);
