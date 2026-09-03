import type { RequestUser } from "../../../types";
import RequestsButtons from "./RequestsButtons";
import UserPictureName from "./UserPictuteName";

interface UserCardProps {
  user: RequestUser;
  addFriend: (user: RequestUser) => void;
}

const UserCard = ({ user, addFriend }: UserCardProps) => {
  const handleAddFriend = (user: RequestUser) => {
    addFriend(user);
  };

  return (
    <article className="user-card">
      {/* User information at top */}
      <UserPictureName user={user} />
      <p className="user-bio">{user.bio}</p>

      <div className="card-divider" />

      {/* Bottom row */}
      <RequestsButtons user={user} handleAddFriend={handleAddFriend} />
    </article>
  );
};

export default UserCard;
