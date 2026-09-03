import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Send,
  Search,
  MoreVertical,
  Mic,
  Paperclip,
  Bell,
  Pin,
  Ban,
  Folder,
  Phone,
  Video,
  ArrowLeft,
  X,
  Reply,
} from "lucide-react";
import type {
  Chat,
  Message,
  ChatFilterOptions as FilterOptions,
  SentMessage as NewSentMessage,
} from "../types";
import UserButton from "../Components/ChatsSpecific/UserButton";
import FilterButtons from "../Components/ChatsSpecific/FilterButtons";

import {
  RecievedMessage,
  SentMessage,
} from "../Components/ChatsSpecific/MessageBubble";

const chats: Chat[] = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=AlexJohnson",
    preview: "Sounds good! Let's do it",
    time: "10:30 AM",
    unread: 1,
    online: true,
    pinned: true,
    muted: true,
  },
  {
    id: 2,
    name: "Feyi Grace",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=FeyiGrace",
    preview: "You: Okay perfect 👏",
    time: "9:45 AM",
    unread: 1,
    online: false,
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
    online: false,
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
    preview: "Tosin: Great work team 👏",
    time: "Mon",
    muted: true,
    online: false,
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

const Messages: Message[] = [
  {
    id: 1,
    message: "Hey! 👋",
    time: "10.02 AM",
    type: "recieved",
    reply: null,
  },
  {
    id: 2,
    message: "How are you doing?",
    time: "10.02 AM",
    type: "recieved",
    reply: null,
  },
  {
    id: 3,
    message: "Hi Alex! I'm good, thanks 🚀",
    time: "10.03 AM",
    type: "sent",
    seen: true,
    reply: null,
  },
  {
    id: 4,
    message: "How about you?",
    time: "10.03 AM",
    type: "sent",
    seen: true,
    reply: null,
  },
  {
    id: 5,
    message:
      "I'm doing great, Just working on the new project. Will share the updates soon",
    time: "10.05 AM",
    type: "recieved",
    reply: null,
  },
  {
    id: 6,
    message: "Awesome, can't wait to see it. Let me know if you need anything.",
    time: "10.07 AM",
    type: "sent",
    seen: true,
    reply: null,
  },
  {
    id: 7,
    message: "Thanks, will do👍",
    time: "10.08 AM",
    type: "recieved",
    reply: null,
  },
];

const Chats = () => {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();

  const isChatRoute = Boolean(chatId);

  const [activeChat, setActiveChat] = useState<Chat>(() => {
    const id = Number(chatId);
    return chats.find((chat) => chat.id === id) ?? chats[0];
  });

  const [messages, setMessages] = useState<Message[]>(Messages);
  const [message, setMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterOptions>("All");
  const [showDetails, setShowDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [activeMessageId, setActiveMessageId] = useState<number | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const filterOptions: FilterOptions[] = ["All", "Unread", "Pinned", "Muted"];

  const searchedChat = chats.filter((chat) => {
    const searched = search.toLocaleLowerCase().trim();
    return chat.name.toLocaleLowerCase().includes(searched);
  });

  const ChatsToShow: Chat[] = searchedChat.filter((chat) => {
    if (activeFilter === "Unread") return (chat.unread ?? 0) > 0;
    else if (activeFilter === "Pinned") return chat.pinned;
    else if (activeFilter === "Muted") return chat.muted;
    return chat;
  });

  useEffect(() => {
    if (!chatId) return;

    const id = Number(chatId);
    const selectedChat = chats.find((chat) => chat.id === id);

    if (selectedChat) {
      setActiveChat(selectedChat);
    }
  }, [chatId]);

  const toggleMessageActions = (id: number) => {
    setActiveMessageId((prev) => (prev === id ? null : id));
  };

  // Keep the conversation anchored to the newest message. This also runs
  // when a new reply/message is added so the latest content is always visible.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage: NewSentMessage = {
      id: messages.length + 1,
      message,
      time,
      reply,
      type: "sent",
      seen: false,
    };

    console.log(newMessage);

    setMessages(messages.concat(newMessage));
    setMessage("");
    setReply(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;

    // Phones/tablets in portrait should use Enter for a new line because
    // their keyboards do not provide a Shift+Enter equivalent.
    const isSmallScreen = window.matchMedia("(max-width: 800px)").matches;

    if (isSmallScreen) return;

    // Desktop/laptop: Enter sends, Shift+Enter creates a new line.
    if (!event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className={`messaging-page ${
        isChatRoute ? "chat-route" : "list-route"
      } ${showDetails ? "details-open" : "details-closed"}`}
    >
      <section className="chat-list-panel">
        <h1 className="chat-list-header">Chats</h1>

        {/* Search */}
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
          />
        </div>

        {/* Filters */}
        <div className="chat-filters">
          {filterOptions.map((filter) => (
            <FilterButtons
              key={filter}
              filter={filter}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          ))}
        </div>

        {/* Chat Items */}
        <div className="chat-items">
          {ChatsToShow.map((chat) => (
            <UserButton
              key={chat.id}
              chat={chat}
              activeChat={activeChat}
              setActiveChat={setActiveChat}
            />
          ))}
        </div>
      </section>

      {/* =====================================================
    MAIN CHAT AREA
====================================================== */}

      <main className="conversation-panel">
        {/* Telegram-style Header Bubble */}
        <header className="conversation-header">
          {isChatRoute && (
            <button
              className="mobile-back-button"
              title="Back to chats"
              aria-label="Back to chats"
              onClick={() => {
                setShowDetails(false);
                navigate("/");
              }}
            >
              <ArrowLeft size={23} />
            </button>
          )}

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
            <button title="Audio call" aria-label="Audio call">
              <Phone size={23} />
            </button>

            <button title="Video call" aria-label="Video call">
              <Video size={23} />
            </button>

            <button
              title={showDetails ? "Hide information" : "Show information"}
              aria-label={showDetails ? "Hide information" : "Show information"}
              className={
                showDetails ? "details-toggle active" : "details-toggle"
              }
              onClick={() => setShowDetails((value) => !value)}
            >
              <MoreVertical size={24} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="messages-container">
          <div className="date-divider">
            <span>
              {new Date().toLocaleDateString("en-US", { weekday: "long" })}
            </span>
          </div>
          {messages.map((message) =>
            message.type === "recieved" ? (
              <RecievedMessage
                key={message.id}
                toggleMessageActions={toggleMessageActions}
                activeMessageId={activeMessageId}
                message={message.message}
                time={message.time}
                id={message.id}
                setReply={setReply}
                reply={message.reply}
              />
            ) : (
              <SentMessage
                key={message.id}
                toggleMessageActions={toggleMessageActions}
                activeMessageId={activeMessageId}
                message={message.message}
                time={message.time}
                id={message.id}
                seen={message.seen}
                setReply={setReply}
                reply={message.reply}
              />
            ),
          )}
          <div
            ref={messagesEndRef}
            className="messages-end"
            aria-hidden="true"
          />
        </div>

        {/* Message Composer */}
        <div className={`message-composer ${reply ? "replying" : ""}`}>
          {reply && (
            <div className="reply-preview">
              <div className="reply-preview-content">
                <Reply size={17} />
                <div>
                  <span>Replying to message</span>
                  <p>{reply}</p>
                </div>
              </div>

              <button
                className="reply-cancel-button"
                title="Cancel reply"
                aria-label="Cancel reply"
                onClick={() => setReply(null)}
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="composer-input-row">
            <button className="composer-button" title="Attach file">
              <Paperclip size={24} />
            </button>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
            />

            <div className="composer-actions">
              <button title="Voice message">
                <Mic size={24} />
              </button>
            </div>

            {message.trim() && (
              <button
                className="send-button"
                onClick={sendMessage}
                title="Send message"
              >
                <Send size={19} />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* =====================================================
    RIGHT PROFILE PANEL
====================================================== */}

      {showDetails && (
        <div
          className="details-backdrop"
          aria-hidden="true"
          onClick={() => setShowDetails(false)}
        />
      )}

      <aside
        className="details-panel"
        onClick={(event) => event.stopPropagation()}
      >
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

export default Chats;
