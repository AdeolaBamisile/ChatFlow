import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db.js";

export class Block extends Model {
  declare id: string;
  declare blockerId: string;
  declare blockedId: string;
  declare createdAt: Date;
}

Block.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    blockerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    blockedId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "block",
    tableName: "blocks",
    underscored: true,
    timestamps: true,
    indexes: [{ unique: true, fields: ["blocker_id", "blocked_id"] }],
  },
);
