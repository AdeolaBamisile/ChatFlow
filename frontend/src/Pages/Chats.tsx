import { useEffect, useMemo, useRef, useState } from "react";

import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from "@apollo/client/react";

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
  Phone,
  Video,
  ArrowLeft,
  X,
  ChevronDown,
  ChevronUp,
  SearchIcon,
} from "lucide-react";

import {
  BLOCK_USER_MUTATION,
  CHAT_MESSAGE_SUBSCRIPTION,
  CHAT_UPDATED_SUBSCRIPTION,
  CHATS_QUERY,
  DELETE_MESSAGE_MUTATION,
  MEDIA_QUERY,
  MESSAGES_QUERY,
  REACT_MESSAGE_MUTATION,
  SEND_GEMINI_MESSAGE_MUTATION,
  SEND_MESSAGE_MUTATION,
  UPDATE_CHAT_MUTATION,
} from "../services/graphql";

import UserButton from "../Components/ChatsSpecific/UserButton";
import FilterButtons from "../Components/ChatsSpecific/FilterButtons";
import { MessageBubble } from "../Components/ChatsSpecific/MessageBubble";

import { useCurrentUser } from "../store";
import { useMediaUpload } from "../services/media";

import type {
  Chat,
  Message,
  ChatFilterOptions,
  MessageAttachment,
  GeminiMessage,
} from "../types";

const GeminiIcon =
  "https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/Gemini-Icon.png";

type ChatQueryData = { chats: Chat[] };
type MessagesData = { messages: Message[] };
type MediaData = { chatMedia: MessageAttachment[] };
type SendGeminiMessageData = {
  sendGeminiMessage: GeminiMessage;
};

const Chats = () => {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState<ChatFilterOptions>("All");
  const [showDetails, setShowDetails] = useState(false);
  const [chatListSearch, setChatListSearch] = useState("");
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [reply, setReply] = useState<Message | null>(null);
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [searchMatches, setSearchMatches] = useState<string[]>([]);
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [showMediaOverlay, setShowMediaOverlay] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MessageAttachment | null>(
    null,
  );
  const [geminiInput, setGeminiInput] = useState("");
  const [geminiMessages, setGeminiMessages] = useState<GeminiMessage[]>([]);
  const [isGeminiSending, setIsGeminiSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const { chatId } = useParams<{ chatId: string }>();
  const currentUser = useCurrentUser();
  const client = useApolloClient();
  const isChatRoute = Boolean(chatId);

  const navigate = useNavigate();

  const {
    data: chatsData,
    loading: chatsLoading,
    error: chatsError,
  } = useQuery<ChatQueryData>(CHATS_QUERY);

  const chats = chatsData?.chats ?? [];

  const selectedChat = useMemo(
    () =>
      chatId
        ? (chats.find((chat) => chat.id === chatId) ?? activeChat)
        : activeChat,
    [activeChat, chatId, chats],
  );

  const { data: messagesData } = useQuery<MessagesData>(MESSAGES_QUERY, {
    variables: { chatId: selectedChat?.id ?? "" },
    skip: !selectedChat,
    fetchPolicy: "cache-and-network",
  });

  const { data: mediaData } = useQuery<MediaData>(MEDIA_QUERY, {
    variables: { chatId: selectedChat?.id ?? "" },
    skip: !selectedChat,
  });

  const [updateChat] = useMutation(UPDATE_CHAT_MUTATION, {
    refetchQueries: [{ query: CHATS_QUERY }],
  });

  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION);
  const [deleteMessage] = useMutation(DELETE_MESSAGE_MUTATION);
  const [reactMessage] = useMutation(REACT_MESSAGE_MUTATION);
  const [blockUser] = useMutation(BLOCK_USER_MUTATION, {
    refetchQueries: [{ query: CHATS_QUERY }],
  });

  const [sendGemini] = useMutation<SendGeminiMessageData>(
    SEND_GEMINI_MESSAGE_MUTATION,
  );

  const { upload } = useMediaUpload();

  const messages = messagesData?.messages ?? [];

  const media =
    mediaData?.chatMedia ??
    messages.flatMap((item) =>
      item.attachment
        ? [
            {
              ...item.attachment,
              messageId: item.id,
              createdAt: item.createdAt,
            },
          ]
        : [],
    );

  useSubscription(CHAT_MESSAGE_SUBSCRIPTION, {
    variables: { chatId: selectedChat?.id ?? "" },
    skip: !selectedChat,
    onData: () => {
      void client.refetchQueries({
        include: [MESSAGES_QUERY, MEDIA_QUERY, CHATS_QUERY],
      });
    },
  });

  useSubscription(CHAT_UPDATED_SUBSCRIPTION, {
    onData: () => {
      void client.refetchQueries({ include: [CHATS_QUERY] });
    },
  });

  useEffect(() => {
    if (selectedChat) setActiveChat(selectedChat);
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "instant",
      block: "end",
    });
  }, [messages.length]);

  useEffect(
    () => () => {
      if (recordingTimerRef.current)
        window.clearInterval(recordingTimerRef.current);
      mediaRecorderRef.current?.stream
        .getTracks()
        .forEach((track) => track.stop());
    },
    [],
  );

  const filteredChats = useMemo(() => {
    const term = chatListSearch.trim().toLowerCase();

    return [...chats]
      .filter((chat) => {
        if (
          term &&
          !chat.friend.name.toLowerCase().includes(term) &&
          !chat.friend.username.toLowerCase().includes(term)
        )
          return false;
        if (activeFilter === "Unread") return chat.unreadCount > 0;
        if (activeFilter === "Pinned") return chat.pinned;
        if (activeFilter === "Muted") return chat.muted;
        return true;
      })
      .sort(
        (a, b) =>
          Number(b.pinned) - Number(a.pinned) ||
          new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime(),
      );
  }, [activeFilter, chatListSearch, chats]);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });

  const toggleChatSetting = async (field: "muted" | "pinned") => {
    if (!selectedChat) return;
    await updateChat({
      variables: { chatId: selectedChat.id, [field]: !selectedChat[field] },
    });
    if (window.matchMedia("(max-width: 800px)").matches) setShowDetails(false);
  };

  const runMessageSearch = () => {
    const term = chatSearch.trim().toLowerCase();

    const matches = term
      ? messages
          .filter((item) => item.content.toLowerCase().includes(term))
          .map((item) => item.id)
      : [];

    setSearchMatches(matches);
    setSearchMatchIndex(0);
    if (matches[0])
      document
        .querySelector(`[data-message-id="${matches[0]}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const moveSearchMatch = (direction: "next" | "previous") => {
    if (!searchMatches.length) return;
    const next =
      direction === "next"
        ? (searchMatchIndex + 1) % searchMatches.length
        : (searchMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setSearchMatchIndex(next);
    document
      .querySelector(`[data-message-id="${searchMatches[next]}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const closeChatSearch = () => {
    setShowChatSearch(false);
    setChatSearch("");
    setSearchMatches([]);
    setSearchMatchIndex(0);
  };

  const sendTextMessage = async () => {
    if (
      !selectedChat ||
      !message.trim() ||
      selectedChat.blockedByFriend ||
      recording
    )
      return;

    const content = message.trim();
    setMessage("");
    const replyId = reply?.id ?? null;
    setReply(null);
    await sendMessage({
      variables: {
        chatId: selectedChat.id,
        content,
        type: "text",
        replyToId: replyId,
        attachmentId: null,
      },
      refetchQueries: [
        { query: MESSAGES_QUERY, variables: { chatId: selectedChat.id } },
        { query: CHATS_QUERY },
      ],
    });
  };

  const sendAttachment = async (file: File) => {
    if (
      !selectedChat ||
      selectedChat.blockedByFriend ||
      !(file.type.startsWith("image/") || file.type.startsWith("video/"))
    )
      return;

    const attachmentId = await upload(selectedChat.id, file);
    const type = file.type.startsWith("image/") ? "image" : "video";
    const replyId = reply?.id ?? null;
    await sendMessage({
      variables: {
        chatId: selectedChat.id,
        content: "",
        type,
        replyToId: replyId,
        attachmentId,
      },
      refetchQueries: [
        { query: MESSAGES_QUERY, variables: { chatId: selectedChat.id } },
        { query: MEDIA_QUERY, variables: { chatId: selectedChat.id } },
        { query: CHATS_QUERY },
      ],
    });
    setReply(null);
  };

  const startRecording = async () => {
    if (
      !selectedChat ||
      selectedChat.blockedByFriend ||
      recording ||
      !navigator.mediaDevices?.getUserMedia
    )
      return;

    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setRecording(false);
      return;
    }

    let recorder: MediaRecorder;

    try {
      const preferredType = MediaRecorder.isTypeSupported(
        "audio/webm;codecs=opus",
      )
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      recorder = new MediaRecorder(stream, { mimeType: preferredType });
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    recordingChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size) recordingChunksRef.current.push(event.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      if (!recordingChunksRef.current.length) {
        setRecording(false);
        return;
      }

      const blob = new Blob(recordingChunksRef.current, {
        type: recorder.mimeType || "audio/webm",
      });

      const file = new File([blob], `voice-${Date.now()}.webm`, {
        type: blob.type,
      });

      try {
        const attachmentId = await upload(selectedChat.id, file);
        await sendMessage({
          variables: {
            chatId: selectedChat.id,
            content: "",
            type: "voice",
            replyToId: reply?.id ?? null,
            attachmentId,
          },
          refetchQueries: [
            { query: MESSAGES_QUERY, variables: { chatId: selectedChat.id } },
            { query: CHATS_QUERY },
          ],
        });
        setReply(null);
      } finally {
        setRecording(false);
      }
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = window.setInterval(
      () => setRecordingSeconds((seconds) => seconds + 1),
      1000,
    );
  };

  const stopRecording = () => {
    if (recordingTimerRef.current)
      window.clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;
    mediaRecorderRef.current?.stop();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;
    if (window.matchMedia("(max-width: 800px)").matches) return;
    if (!event.shiftKey) {
      event.preventDefault();
      void sendTextMessage();
    }
  };

  const sendGeminiMessage = async () => {
    if (!geminiInput.trim() || isGeminiSending) return;
    const content = geminiInput.trim();
    setGeminiInput("");
    setIsGeminiSending(true);
    try {
      const result = await sendGemini({
        variables: { content, chatId: selectedChat?.id ?? null },
      });
      const message = result.data?.sendGeminiMessage;

      if (message) setGeminiMessages((current) => [...current, message]);
    } finally {
      setIsGeminiSending(false);
    }
  };

  const isBlocked = (chat: Chat) => Boolean(chat.blockedByFriend);

  return (
    <div
      className={`messaging-page ${isChatRoute ? "chat-route" : "list-route"} ${showDetails ? "details-open" : "details-closed"}`}
    >
      <section className="chat-list-panel">
        <h1 className="chat-list-header">Chats</h1>
        <div className="search-box">
          <Search size={20} />
          <input
            value={chatListSearch}
            onChange={(event) => setChatListSearch(event.target.value)}
            placeholder="Search people..."
          />
        </div>

        <div className="chat-filters">
          {(["All", "Unread", "Pinned", "Muted"] as ChatFilterOptions[]).map(
            (filterOption) => (
              <FilterButtons
                key={filterOption}
                filter={filterOption}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />
            ),
          )}
        </div>

        <div className="chat-items">
          {chatsLoading && <p className="chat-empty-state">Loading chats...</p>}
          {chatsError && (
            <p className="chat-empty-state">Unable to load chats.</p>
          )}
          {!chatsLoading && !filteredChats.length && (
            <p className="chat-empty-state">No chats found.</p>
          )}
          {filteredChats.map((chat) => (
            <UserButton
              key={chat.id}
              chat={chat}
              activeChat={selectedChat}
              onSelect={setActiveChat}
            />
          ))}
        </div>
      </section>

      <main className="conversation-panel">
        {selectedChat ? (
          <>
            <header className="conversation-header">
              {isChatRoute && (
                <button
                  className="mobile-back-button"
                  title="Back to chats"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft size={23} />
                </button>
              )}

              <div className="conversation-user">
                <div className="conversation-avatar-wrapper">
                  <img
                    src={selectedChat.friend.avatar}
                    alt={selectedChat.friend.name}
                  />
                </div>
                <div className="conversation-user-info">
                  <h2>{selectedChat.friend.name}</h2>
                  <span>
                    {selectedChat.friend.online ? (
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
                <button title="Audio call">
                  <Phone size={23} />
                </button>
                <button title="Video call">
                  <Video size={23} />
                </button>
                <button
                  className={
                    showDetails ? "details-toggle active" : "details-toggle"
                  }
                  onClick={() => setShowDetails((value) => !value)}
                  title="More"
                >
                  <MoreVertical size={24} />
                </button>
              </div>
            </header>

            {showChatSearch && (
              <div className="chat-message-search">
                <Search size={18} />
                <input
                  autoFocus
                  value={chatSearch}
                  onChange={(event) => setChatSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") runMessageSearch();
                    if (event.key === "Escape") closeChatSearch();
                  }}
                  placeholder="Search messages..."
                />
                <span className="search-result-count">
                  {searchMatches.length
                    ? `${searchMatchIndex + 1}/${searchMatches.length}`
                    : "0/0"}
                </span>
                <button onClick={runMessageSearch} title="Search">
                  <Search size={17} />
                </button>
                <button
                  onClick={() => moveSearchMatch("previous")}
                  title="Previous"
                >
                  <ChevronUp size={18} />
                </button>
                <button onClick={() => moveSearchMatch("next")} title="Next">
                  <ChevronDown size={18} />
                </button>
                <button onClick={closeChatSearch} title="Cancel">
                  <X size={18} />
                </button>
              </div>
            )}

            <div
              className="messages-container"
              onScroll={(event) => {
                const element = event.currentTarget;
                setShowScrollToBottom(
                  element.scrollHeight -
                    element.scrollTop -
                    element.clientHeight >
                    120,
                );
              }}
            >
              <div className="date-divider">
                <span>Today</span>
              </div>
              {messages
                .filter((item) => !item.deleted)
                .map((item) => (
                  <MessageBubble
                    key={item.id}
                    message={item}
                    isMine={item.senderId === currentUser?.id}
                    active={activeMessageId === item.id}
                    onToggleActions={(id) =>
                      setActiveMessageId((current) =>
                        current === id ? null : id,
                      )
                    }
                    onReply={(value) => {
                      setReply(value);
                      setActiveMessageId(null);
                    }}
                    onReact={async (id, emoji) => {
                      await reactMessage({
                        variables: { messageId: id, emoji },
                        refetchQueries: [
                          {
                            query: MESSAGES_QUERY,
                            variables: { chatId: selectedChat.id },
                          },
                        ],
                      });
                      setActiveMessageId(null);
                    }}
                    onDelete={async (id) => {
                      await deleteMessage({
                        variables: { messageId: id },
                        refetchQueries: [
                          {
                            query: MESSAGES_QUERY,
                            variables: { chatId: selectedChat.id },
                          },
                        ],
                      });
                      setActiveMessageId(null);
                    }}
                  />
                ))}

              <div ref={messagesEndRef} />

              {showScrollToBottom && (
                <button
                  className="scroll-to-bottom-button"
                  onClick={scrollToBottom}
                  title="Scroll to newest message"
                >
                  <ChevronDown size={21} />
                </button>
              )}
            </div>

            <div className={`message-composer ${reply ? "replying" : ""}`}>
              {reply && (
                <div className="reply-preview">
                  <div className="reply-preview-content">
                    <span>Replying to</span>
                    <p>{reply.content || "Attachment"}</p>
                  </div>
                  <button
                    className="reply-cancel-button"
                    onClick={() => setReply(null)}
                    title="Cancel reply"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              <div className="composer-input-row">
                <button
                  className="composer-button"
                  title="Attach image or video"
                  disabled={isBlocked(selectedChat) || recording}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip size={24} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void sendAttachment(file);
                    event.target.value = "";
                  }}
                />

                <textarea
                  value={
                    recording
                      ? `Recording ${Math.floor(recordingSeconds / 60)
                          .toString()
                          .padStart(
                            2,
                            "0",
                          )}:${(recordingSeconds % 60).toString().padStart(2, "0")}`
                      : message
                  }
                  onChange={(event) =>
                    !recording && setMessage(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isBlocked(selectedChat)
                      ? "You cannot message this user"
                      : "Type a message..."
                  }
                  rows={1}
                  readOnly={recording || isBlocked(selectedChat)}
                />

                <div className="composer-actions">
                  <button
                    title={recording ? "Stop recording" : "Voice message"}
                    onClick={
                      recording ? stopRecording : () => void startRecording()
                    }
                    disabled={isBlocked(selectedChat)}
                  >
                    {recording ? (
                      <span className="recording-dot" />
                    ) : (
                      <Mic size={24} />
                    )}
                  </button>
                </div>

                {!recording && message.trim() && (
                  <button
                    className="send-button"
                    onClick={() => void sendTextMessage()}
                    title="Send"
                  >
                    <Send size={19} />
                  </button>
                )}
              </div>

              {isBlocked(selectedChat) && (
                <div className="blocked-chat-notice">
                  This user has blocked you. Sending messages and media is
                  disabled.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-conversation">
            <h2>Select a chat</h2>
            <p>Choose a friend from your chats to start messaging.</p>
          </div>
        )}
      </main>

      {showDetails && (
        <div
          className="details-backdrop"
          onClick={() => setShowDetails(false)}
        />
      )}

      <aside
        className="details-panel"
        onClick={(event) => event.stopPropagation()}
      >
        {selectedChat && (
          <>
            <section className="details-bubble profile-bubble">
              <div className="large-profile-avatar-wrapper">
                <img
                  src={selectedChat.friend.avatar}
                  alt={selectedChat.friend.name}
                />
              </div>
              <h2>{selectedChat.friend.name}</h2>
              <span className="username">{selectedChat.friend.username}</span>
              <span className="profile-online">
                {selectedChat.friend.online ? (
                  <>
                    <i />
                    Online
                  </>
                ) : (
                  "Offline"
                )}
              </span>
            </section>

            <section className="details-bubble action-bubble">
              <button className="profile-action">
                <Phone size={25} />
                <span>Audio Call</span>
              </button>

              <button className="profile-action">
                <Video size={25} />
                <span>Video Call</span>
              </button>

              <button
                className="profile-action"
                onClick={() => {
                  setShowChatSearch(true);
                  if (window.matchMedia("(max-width: 1100px)").matches)
                    setShowDetails(false);
                }}
              >
                <SearchIcon size={25} />
                <span>Search</span>
              </button>

              <button
                className="profile-action"
                onClick={() => {
                  setShowGemini(true);
                  setShowDetails(false);
                }}
              >
                <img className="gemini" src={GeminiIcon} alt="Gemini" />
                <span>Gemini</span>
              </button>
            </section>

            <section className="details-bubble about-bubble">
              <h3>About</h3>
              <p>{selectedChat.friend.bio || "No information available."}</p>
            </section>

            <section className="details-bubble media-bubble">
              <div className="bubble-title-row">
                <h3>Pictures & Videos</h3>
                <button
                  onClick={() => {
                    setShowMediaOverlay(true);
                    setShowDetails(false);
                  }}
                >
                  See all
                </button>
              </div>

              <div className="media-grid">
                {media.slice(0, 4).map((item) => (
                  <div className="media-item image-preview" key={item.id}>
                    {item.type === "video" ? (
                      <video src={item.url} muted />
                    ) : (
                      <img src={item.url} alt={item.name ?? "Shared media"} />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="details-bubble settings-bubble">
              <h3>Settings</h3>
              <div className="setting-row">
                <div className="setting-left">
                  <Bell size={22} />
                  <span>Mute notifications</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={selectedChat.muted}
                    onChange={() => void toggleChatSetting("muted")}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="setting-row">
                <div className="setting-left">
                  <Pin size={22} />
                  <span>Pin chat</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={selectedChat.pinned}
                    onChange={() => void toggleChatSetting("pinned")}
                  />
                  <span className="slider" />
                </label>
              </div>

              <button
                className="block-button"
                onClick={async () => {
                  await blockUser({
                    variables: { userId: selectedChat.friend.id },
                  });
                  setShowDetails(false);
                }}
              >
                <Ban size={22} />
                <span>Block Friend</span>
              </button>
            </section>
          </>
        )}
      </aside>

      {showMediaOverlay && (
        <div
          className="media-overlay"
          onClick={() => {
            setShowMediaOverlay(false);
            setSelectedMedia(null);
          }}
        >
          <section
            className="media-overlay-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="media-overlay-header">
              <div>
                <h2>{selectedMedia ? "Media" : "Pictures & Videos"}</h2>
                <span>
                  {selectedMedia
                    ? "Shared in this conversation"
                    : `${media.length} shared items`}
                </span>
              </div>
              <button
                onClick={() => {
                  if (selectedMedia) setSelectedMedia(null);
                  else setShowMediaOverlay(false);
                }}
                title={selectedMedia ? "Back" : "Close"}
              >
                {selectedMedia ? <ArrowLeft size={22} /> : <X size={22} />}
              </button>
            </header>

            {selectedMedia ? (
              <div className="media-single-view">
                {selectedMedia.type === "video" ? (
                  <video src={selectedMedia.url} controls autoPlay />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.name ?? "Shared media"}
                  />
                )}
              </div>
            ) : (
              <div className="media-overlay-grid">
                {media.length ? (
                  media.map((item) => (
                    <button
                      key={item.id}
                      className="media-overlay-item"
                      onClick={() => setSelectedMedia(item)}
                    >
                      {item.type === "video" ? (
                        <video src={item.url} muted />
                      ) : (
                        <img src={item.url} alt={item.name ?? "Shared media"} />
                      )}
                      {item.type === "video" && <span>Video</span>}
                    </button>
                  ))
                ) : (
                  <p>No pictures or videos have been shared yet.</p>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {showGemini && (
        <div className="gemini-overlay" onClick={() => setShowGemini(false)}>
          <section
            className="gemini-chat-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="gemini-chat-header">
              <div className="gemini-modal-title">
                <div className="gemini-icon">
                  <img className="gemini" src={GeminiIcon} alt="Gemini" />
                </div>
                <div className="gemini-modal-title-text">
                  <h2>Gemini</h2>
                  <span>Chat about this conversation</span>
                </div>
              </div>
              <button onClick={() => setShowGemini(false)} title="Close Gemini">
                <X size={21} />
              </button>
            </header>

            <div className="gemini-chat-body">
              {!geminiMessages.length && (
                <div className="gemini-welcome">
                  <div className="gemini-large-icon">
                    <img className="gemini" src={GeminiIcon} alt="Gemini" />
                  </div>
                  <h3>Ask Gemini about this chat</h3>
                  <p>
                    Discuss messages or ask questions about this conversation.
                  </p>
                </div>
              )}

              {geminiMessages.map((item) => (
                <div
                  key={item.id}
                  className={`gemini-inline-message ${item.sender === "user" ? "sent" : "received"}`}
                >
                  <p>{item.content}</p>
                </div>
              ))}
            </div>

            <div className="gemini-modal-footer">
              {isGeminiSending && (
                <div className="sending-indicator">
                  <span className="sending-dot" />
                  <span>Sending message...</span>
                </div>
              )}

              <div className="gemini-composer">
                <input
                  value={geminiInput}
                  onChange={(event) => setGeminiInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void sendGeminiMessage();
                    }
                  }}
                  placeholder="Ask Gemini about this conversation..."
                  disabled={isGeminiSending}
                />
                <button
                  onClick={() => void sendGeminiMessage()}
                  disabled={!geminiInput.trim() || isGeminiSending}
                  title="Send"
                >
                  <Send size={19} />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Chats;
