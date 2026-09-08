import type { User } from "../../../types";

interface UserPictureNameProps {
  user: User;
}

const UserPictureName = ({ user }: UserPictureNameProps) => (
  <div className="user-main">
    <img className="user-avatar" src={user.avatar} alt={user.name} />
    <div className="user-identity">
      <h2>{user.name}</h2>
      <span>{user.username}</span>
    </div>
  </div>
);

export default UserPictureName;
