import type { User } from "../../../types";
import DiscoverButtons from "./DiscoverButtons";
import UserPictureName from "./UserPictuteName";
type DiscoverUser = User & {
  mutualFriends: number;
  request?: "sent" | "received";
};
interface DiscoverIndexProps {
  user: DiscoverUser;
  handleAddFriend: (user: DiscoverUser) => void;
}
const DiscoverIndex = ({ user, handleAddFriend }: DiscoverIndexProps) => (
  <article className="user-card">
    <UserPictureName user={user} />
    <p className="user-bio">{user.bio}</p>
    <div className="card-divider" />
    <DiscoverButtons user={user} handleAddFriend={handleAddFriend} />
  </article>
);
export default DiscoverIndex;
