import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db.js";

export class FriendRequest extends Model {
  declare id: string;
  declare senderId: string;
  declare receiverId: string;
  declare status: string;
  declare createdAt: Date;
}

FriendRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "PENDING",
    },
  },
  {
    sequelize,
    modelName: "friendRequest",
    tableName: "friend_requests",
    underscored: true,
    timestamps: true,
    indexes: [{ unique: true, fields: ["sender_id", "receiver_id", "status"] }],
  },
);
