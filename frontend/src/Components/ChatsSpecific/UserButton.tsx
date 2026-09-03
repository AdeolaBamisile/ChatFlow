import { useNavigate } from "react-router-dom";
import { Pin, BellOff } from "lucide-react";
import type { Chat } from "../../types";

interface UserButtonProps {
  chat: Chat;
  activeChat: Chat;
  setActiveChat: React.Dispatch<React.SetStateAction<Chat>>;
}

const UserButton = ({ chat, activeChat, setActiveChat }: UserButtonProps) => {
  const navigate = useNavigate();
  return (
    <button
      className={activeChat.id === chat.id ? "chat-item active" : "chat-item"}
      onClick={() => {
        setActiveChat(chat);
        navigate(`/chat/${chat.id}`);
      }}
    >
      <div className="chat-avatar-wrapper">
        <img className="chat-avatar" src={chat.avatar} alt={chat.name} />

        {chat.online && <span className="chat-online-dot" />}
      </div>

      <div className="chat-information">
        <div className="chat-name-row">
          <span className="chat-name">{chat.name}</span>

          <span className="chat-time">{chat.time}</span>
        </div>

        <div className="chat-preview-row">
          <span className="chat-preview">{chat.preview}</span>

          {chat.pinned && (
            <span className="muted-icon">
              <Pin size={15} />
            </span>
          )}

          {chat.muted && (
            <span className="muted-icon">
              <BellOff size={15} />
            </span>
          )}

          {chat.unread && <span className="unread-count">{chat.unread}</span>}
        </div>
      </div>
    </button>
  );
};

export default UserButton;
