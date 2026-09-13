import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db.js";

export class File extends Model {
  declare id: string;
  declare path: string;
  declare publicUrl: string;
  declare userId: string;
}

File.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    publicUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "file",
    tableName: "files",
    underscored: true,
    timestamps: true,
  },
);
