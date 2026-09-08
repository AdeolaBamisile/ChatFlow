import type { FriendRequest } from "../../../types";

interface RequestsButtonsProps {
  user: FriendRequest;
  handleAddFriend: (user: FriendRequest) => void;
  onIgnore?: (user: FriendRequest) => void;
}

const RequestsButtons = ({
  user,
  handleAddFriend,
  onIgnore,
}: RequestsButtonsProps) => (
  <div className="user-card-bottom">
    {user.status === "received" ? (
      <>
        <button
          className="response-button ignore"
          onClick={() => onIgnore?.(user)}
        >
          Ignore
        </button>
        <button
          className="response-button accept"
          onClick={() => handleAddFriend(user)}
        >
          Accept
        </button>
      </>
    ) : (
      <>
        <span className="mutual-friends">
          {user.mutualFriends} mutual friends
        </span>
        <button
          className="response-button accept"
          onClick={() => handleAddFriend(user)}
        >
          Remove
        </button>
      </>
    )}
  </div>
);

export default RequestsButtons;
