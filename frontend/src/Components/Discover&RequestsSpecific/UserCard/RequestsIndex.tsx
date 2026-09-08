import type { FriendRequest } from "../../../types";
import RequestsButtons from "./RequestsButtons";
import UserPictureName from "./UserPictuteName";

interface UserCardProps {
  user: FriendRequest;
  addFriend: (user: FriendRequest) => void;
  onIgnore?: (user: FriendRequest) => void;
}

const UserCard = ({ user, addFriend, onIgnore }: UserCardProps) => (
  <article className="user-card">
    <UserPictureName user={user} />

    <p className="user-bio">{user.bio}</p>
    <div className="card-divider" />

    <RequestsButtons
      user={user}
      handleAddFriend={addFriend}
      onIgnore={onIgnore}
    />
  </article>
);

export default UserCard;
