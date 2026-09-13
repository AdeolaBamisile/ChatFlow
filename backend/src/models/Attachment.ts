import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db.js";

export class Attachment extends Model {
  declare id: string;
  declare type: string;
  declare url: string;
  declare path: string;
  declare name: string | null;
  declare mimeType: string;
  declare size: number;
  declare duration: number | null;
  declare messageId: string | null;
  declare userId: string;
  declare createdAt: Date;
}

Attachment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
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
    mimeType: {
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
    messageId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "attachment",
    tableName: "attachments",
    underscored: true,
    timestamps: true,
  },
);
