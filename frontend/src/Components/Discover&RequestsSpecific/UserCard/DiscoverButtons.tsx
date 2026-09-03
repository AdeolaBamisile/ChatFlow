import type { RequestUser } from "../../../types";

interface DiscoverButtonsProps {
  user: RequestUser;
  handleAddFriend: (user: RequestUser) => void;
}

const DiscoverButtons = ({ user, handleAddFriend }: DiscoverButtonsProps) => {
  return (
    <div className="user-card-bottom">
      <span className="mutual-friends">
        {user.mutualFriends} mutual friends
      </span>

      <button
        className="add-friend-button"
        onClick={() => handleAddFriend(user)}
      >
        Add Friend
      </button>
    </div>
  );
};

export default DiscoverButtons;
