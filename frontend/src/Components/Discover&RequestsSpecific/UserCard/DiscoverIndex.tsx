import type { RequestUser } from "../../../types";
import DiscoverButtons from "./DiscoverButtons";
import UserPictureName from "./UserPictuteName";

interface DiscoverIndexProps {
  user: RequestUser;
  handleAddFriend: (user: RequestUser) => void;
}

const DiscoverIndex = ({ user, handleAddFriend }: DiscoverIndexProps) => {
  return (
    <article className="user-card">
      {/* User information at top */}
      <UserPictureName user={user} />

      {/* About */}
      <p className="user-bio">{user.bio}</p>

      {/* Divider */}
      <div className="card-divider" />

      {/* Bottom row */}
      <DiscoverButtons user={user} handleAddFriend={handleAddFriend} />
    </article>
  );
};

export default DiscoverIndex;
