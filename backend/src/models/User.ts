import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db.js";

export class User extends Model {
  declare id: string;
  declare username: string;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare avatar: string | null;
  declare bio: string | null;
  declare online: boolean;
  declare onlineStatusVisible: boolean;
  declare allowFriendRequests: boolean;
  declare deletedAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:
        "https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/default_profile_picture.png",
    },
    bio: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    online: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    onlineStatusVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    allowFriendRequests: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "user",
    tableName: "users",
    underscored: true,
    timestamps: true,
  },
);
