import type { User } from "../../../types";
type DiscoverUser = User & { mutualFriends: number };
interface DiscoverButtonsProps {
  user: DiscoverUser;
  handleAddFriend: (user: DiscoverUser) => void;
}
const DiscoverButtons = ({ user, handleAddFriend }: DiscoverButtonsProps) => (
  <div className="user-card-bottom">
    <span className="mutual-friends">{user.mutualFriends} mutual friends</span>
    <button className="add-friend-button" onClick={() => handleAddFriend(user)}>
      Add Friend
    </button>
  </div>
);
export default DiscoverButtons;
