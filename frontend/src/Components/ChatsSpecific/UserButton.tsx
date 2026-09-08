import { useNavigate } from "react-router-dom";
import { Pin, BellOff } from "lucide-react";
import type { Chat } from "../../types";

interface UserButtonProps {
  chat: Chat;
  activeChat: Chat | null;
  onSelect?: (chat: Chat) => void;
}

const UserButton = ({ chat, activeChat, onSelect }: UserButtonProps) => {
  const navigate = useNavigate();
  return (
    <button
      className={activeChat?.id === chat.id ? "chat-item active" : "chat-item"}
      onClick={() => {
        onSelect?.(chat);
        navigate(`/chat/${chat.id}`);
      }}
    >
      <div className="chat-avatar-wrapper">
        <img className="chat-avatar" src={chat.friend.avatar} alt={chat.friend.name} />
        {chat.friend.online && <span className="chat-online-dot" />}
      </div>
      <div className="chat-information">
        <div className="chat-name-row">
          <span className="chat-name">{chat.friend.name}</span>
          <span className="chat-time">
            {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="chat-preview-row">
          <span className="chat-preview">{chat.preview}</span>
          {chat.pinned && <span className="muted-icon"><Pin size={15} /></span>}
          {chat.muted && <span className="muted-icon"><BellOff size={15} /></span>}
          {chat.unreadCount > 0 && <span className="unread-count">{chat.unreadCount}</span>}
        </div>
      </div>
    </button>
  );
};

export default UserButton;
