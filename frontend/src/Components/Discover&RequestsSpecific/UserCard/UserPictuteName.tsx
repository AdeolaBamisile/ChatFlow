import type { RequestUser } from "../../../types";

interface UserPictureNameProps {
  user: RequestUser;
}

const UserPictureName = ({ user }: UserPictureNameProps) => {
  return (
    <div className="user-main">
      <img className="user-avatar" src={user.avatar} alt={user.name} />

      <div className="user-identity">
        <h2>{user.name}</h2>

        <span>{user.username}</span>
      </div>
    </div>
  );
};

export default UserPictureName;
