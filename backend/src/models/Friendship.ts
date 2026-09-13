import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db.js";

export class Friendship extends Model {
  declare id: string;
  declare userId: string;
  declare friendId: string;
}

Friendship.init(
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
    friendId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "friendship",
    tableName: "friendships",
    underscored: true,
    timestamps: true,
    indexes: [{ unique: true, fields: ["user_id", "friend_id"] }],
  },
);
