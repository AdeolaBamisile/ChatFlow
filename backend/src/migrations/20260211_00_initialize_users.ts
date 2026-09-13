import { DataTypes, QueryInterface } from "sequelize";

interface Context {
  context: QueryInterface;
}

export const up = async ({ context: queryInterface }: Context) => {
  await queryInterface.createTable("users", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue:
        "https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/default_profile_picture.png",
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    online: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    mutual_friends: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    online_status_visible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    allow_friend_requests: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  });
};

export const down = async ({ context: queryInterface }: Context) => {
  await queryInterface.dropTable("users");
};
