import type { RequestUser } from "../../../types";

interface RequestsButtonsProps {
  user: RequestUser;
  handleAddFriend: (user: RequestUser) => void;
}

const RequestsButtons = ({ user, handleAddFriend }: RequestsButtonsProps) => {
  return (
    <div className="user-card-bottom">
      {user.request === "recieved" && (
        <>
          <button
            className="response-button ignore"
            onClick={() => handleAddFriend(user)}
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
      )}
      {user.request === "sent" && (
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
};

export default RequestsButtons;
