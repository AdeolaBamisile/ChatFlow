import { useState } from "react";
import {
  MessageCircle,
  Send,
  UserPlus,
  Users,
  Moon,
  Settings,
  Search,
  MoreVertical,
  Mic,
  Paperclip,
  CheckCheck,
  Check,
  Bell,
  Pin,
  Ban,
  Folder,
  BellOff,
} from "lucide-react";

type Chat = {
  id: number;
  name: string;
  username?: string;
  avatar: string;
  preview: string;
  time: string;
  unread?: number;
  muted?: boolean;
  online?: boolean;
  pinned?: boolean;
};

const chats: Chat[] = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=AlexJohnson",
    preview: "Sounds good! Let's do it",
    time: "10:30 AM",
    unread: 2,
    online: true,
    pinned: true,
    muted: true,
  },
  {
    id: 2,
    name: "Feyi Grace",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=FeyiGrace",
    preview: "You: Okay perfect 👌",
    time: "9:45 AM",
    unread: 1,
    online: true,
  },
  {
    id: 3,
    name: "MarvelTheAbstract",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=MarvelAbstract",
    preview: "I sent you the file",
    time: "9:15 AM",
    online: true,
  },
  {
    id: 4,
    name: "Okeowo Tofunmi",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Okeowo",
    preview: "You: See you there!",
    time: "8:50 AM",
    unread: 3,
    online: true,
  },
  {
    id: 5,
    name: "Bassey - Marvin",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=BasseyMarvin",
    preview: "React is awesome!",
    time: "Yesterday",
    online: true,
  },
  {
    id: 6,
    name: "One's and Two's",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=OneAndTwos",
    preview: "You: Haha true",
    time: "Yesterday",
    online: true,
  },
  {
    id: 7,
    name: "Justjack_12",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Justjack",
    preview: "Attachment",
    time: "Yesterday",
  },
  {
    id: 8,
    name: "King Daystar",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=KingDaystar",
    preview: "You: Appreciate it!",
    time: "Mon",
    online: true,
  },
  {
    id: 9,
    name: "Creatives Hub",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=CreativesHub",
    preview: "Tosin: Great work team 🔥",
    time: "Mon",
    muted: true,
  },
  {
    id: 10,
    name: "Design Squad",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=DesignSquad",
    preview: "Jane: Nice one!",
    time: "Sun",
    online: true,
  },
];

const MainPage = () => {
  const [activeChat, setActiveChat] = useState<Chat>(chats[0]);
  const [message, setMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const sendMessage = () => {
    if (!message.trim()) return;

    console.log("Message sent:", message);
    setMessage("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className={`${theme === "light" ? "light-mode" : ""}`}>
      {/* =====================================================
          CHAT LIST
      ====================================================== */}

      <section className="chat-list-panel">
        <h1 className="chat-list-header">Chats</h1>

        {/* Search */}
        <div className="search-box">
          <Search size={20} />

          <input type="text" placeholder="Search people..." />
        </div>

        {/* Filters */}
        <div className="chat-filters">
          {["All", "Unread", "Pinned"].map((filter) => (
            <button
              key={filter}
              className={
                activeFilter === filter
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Chat Items */}
        <div className="chat-items">
          {chats.map((chat) => (
            <button
              key={chat.id}
              className={
                activeChat.id === chat.id ? "chat-item active" : "chat-item"
              }
              onClick={() => setActiveChat(chat)}
            >
              <div className="chat-avatar-wrapper">
                <img
                  className="chat-avatar"
                  src={chat.avatar}
                  alt={chat.name}
                />

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

                  {chat.unread && (
                    <span className="unread-count">{chat.unread}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* =====================================================
          MAIN CHAT AREA
      ====================================================== */}

      <main className="conversation-panel">
        {/* Telegram-style Header Bubble */}
        <header className="conversation-header">
          <div className="conversation-user">
            <div className="conversation-avatar-wrapper">
              <img src={activeChat.avatar} alt={activeChat.name} />
            </div>

            <div className="conversation-user-info">
              <h2>{activeChat.name}</h2>

              <span>
                {activeChat.online ? (
                  <div>
                    <i />
                    Online
                  </div>
                ) : (
                  <div>Offline</div>
                )}
              </span>
            </div>
          </div>

          <div className="conversation-actions">
            <button title="Search">
              <Search size={25} />
            </button>

            <button title="More">
              <MoreVertical size={24} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="messages-container">
          <div className="date-divider">
            <span>Today</span>
          </div>

          {/* Received message */}
          <div className="message-row received">
            <img
              className="message-avatar"
              src={activeChat.avatar}
              alt={activeChat.name}
            />

            <div className="message-stack">
              <div className="message-bubble received-bubble">
                <span>Hey! 👋</span>
                <small>10:02 AM</small>
              </div>

              <div className="message-bubble received-bubble">
                <span>How are you doing?</span>
                <small>10:02 AM</small>
              </div>
            </div>
          </div>

          {/* Sent messages */}
          <div className="message-row sent">
            <div className="message-stack">
              <div className="message-bubble sent-bubble">
                <span>Hi Alex! I'm good, thanks 😊</span>

                <small>
                  10:03 AM <Check size={14} />
                </small>
              </div>

              <div className="message-bubble sent-bubble">
                <span>How about you?</span>

                <small>
                  10:03 AM <CheckCheck size={14} />
                </small>
              </div>
            </div>
          </div>

          {/* Received */}
          <div className="message-row received">
            <img
              className="message-avatar"
              src={activeChat.avatar}
              alt={activeChat.name}
            />

            <div className="message-stack">
              <div className="message-bubble received-bubble large">
                <span>
                  I'm doing great!
                  <br />
                  Just working on the new project.
                  <br />
                  Will share the updates soon.
                </span>

                <small>10:05 AM</small>
              </div>
            </div>
          </div>

          {/* Sent */}
          <div className="message-row sent">
            <div className="message-stack">
              <div className="message-bubble sent-bubble large">
                <span>
                  Awesome! Can't wait to see it.
                  <br />
                  Let me know if you need anything.
                </span>

                <small>
                  10:07 AM <CheckCheck size={14} />
                </small>
              </div>
            </div>
          </div>

          {/* Last received */}
          <div className="message-row received">
            <img
              className="message-avatar"
              src={activeChat.avatar}
              alt={activeChat.name}
            />

            <div className="message-stack">
              <div className="message-bubble received-bubble">
                <span>Thanks! Will do 🙌</span>
                <small>10:08 AM</small>
              </div>
            </div>
          </div>
        </div>

        {/* Message Composer */}
        <div className="message-composer">
          <button className="composer-button" title="Attach file">
            <Paperclip size={24} />
          </button>

          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
          />

          <div className="composer-actions">
            <button title="Voice message">
              <Mic size={24} />
            </button>
          </div>

          {message.trim() && (
            <button className="send-button" onClick={sendMessage}>
              <Send size={19} />
            </button>
          )}
        </div>
      </main>

      {/* =====================================================
          RIGHT PROFILE PANEL
      ====================================================== */}

      <aside className="details-panel">
        {/* Profile Bubble */}
        <section className="details-bubble profile-bubble">
          <div className="large-profile-avatar-wrapper">
            <img src={activeChat.avatar} alt={activeChat.name} />
          </div>

          <h2>{activeChat.name}</h2>

          <span className="username">@alex.johnson</span>

          <span className="profile-online">
            <i />
            Online
          </span>
        </section>

        {/* Action Bubble */}
        {/* <section className="details-bubble action-bubble">
          <button className="profile-action">
            <Phone size={25} />

            <span>Audio Call</span>
          </button>

          <button className="profile-action">
            <Video size={25} />

            <span>Video Call</span>
          </button>

          <button className="profile-action">
            <UserPlus size={25} />

            <span>Profile</span>
          </button>

          <button className="profile-action">
            <MoreVertical size={25} />

            <span>More</span>
          </button>
        </section> */}

        {/* About Bubble */}
        <section className="details-bubble about-bubble">
          <h3>About</h3>

          <p>Information aboout the User</p>
        </section>

        {/* Media Bubble */}
        <section className="details-bubble media-bubble">
          <div className="bubble-title-row">
            <h3>Pictures & Images</h3>

            <button>See all</button>
          </div>

          <div className="media-grid">
            <div className="media-item image-preview">
              <img
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300"
                alt="Shared media"
              />
            </div>

            <div className="media-item purple-preview">
              <div className="fake-project">
                <div />
                <div />
                <div />
              </div>
            </div>

            <div className="media-item project-preview">
              <span>Project.</span>

              <div className="project-lines">
                <i />
                <i />
                <i />
              </div>
            </div>

            <div className="media-item folder-preview">
              <Folder size={35} />
            </div>
          </div>
        </section>

        {/* Settings Bubble */}
        <section className="details-bubble settings-bubble">
          <h3>Settings</h3>

          <div className="setting-row">
            <div className="setting-left">
              <Bell size={22} />

              <span>Mute notifications</span>
            </div>

            <label className="switch">
              <input type="checkbox" />

              <span className="slider" />
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-left">
              <Pin size={22} />

              <span>Pin chat</span>
            </div>

            <label className="switch">
              <input type="checkbox" defaultChecked />

              <span className="slider" />
            </label>
          </div>

          <button className="block-button">
            <Ban size={22} />

            <span>Remove Friend</span>
          </button>
        </section>
      </aside>
    </div>
  );
};

export default MainPage;
