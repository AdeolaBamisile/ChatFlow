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
  START_CALL_MUTATION,
  UNBLOCK_USER_MUTATION,
  UPDATE_CHAT_MUTATION,
  MARK_MESSAGES_SEEN_MUTATION,
} from "../services/graphql";

import UserButton from "../Components/ChatsSpecific/UserButton";
import FilterButtons from "../Components/ChatsSpecific/FilterButtons";
import { MessageBubble } from "../Components/ChatsSpecific/MessageBubble";
import Spinner from "../Components/Spinner";

import { useAppStore, useCurrentUser } from "../store";
import { useMediaUpload } from "../services/media";

import type {
  Chat,
  Message,
  ChatFilterOptions,
  MessageAttachment,
  GeminiMessage,
  CallInfo,
} from "../types";

const GeminiIcon =
  "https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/Gemini-Icon.png";

type ChatQueryData = { chats: Chat[] };
type MessagesData = { messages: Message[] };
type MediaData = { chatMedia: MessageAttachment[] };
type SendGeminiMessageData = {
  sendGeminiMessage: GeminiMessage;
};

type SendMessageData = {
  sendMessage: Message;
};

type SendMessageVariables = {
  chatId: string;
  content: string;
  type: string;
  replyToId?: string | null;
  attachmentId?: string | null;
};

type UpdateChatData = {
  updateChat: Chat;
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
  const loadedMessageChatsRef = useRef<Set<string>>(new Set());

  const { chatId } = useParams<{ chatId: string }>();
  const currentUser = useCurrentUser();
  const setCall = useAppStore((state) => state.setCall);
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

  const { data: messagesData, loading: messagesLoading } =
    useQuery<MessagesData>(MESSAGES_QUERY, {
      variables: { chatId: selectedChat?.id ?? "" },
      skip: !selectedChat,
      fetchPolicy: "cache-and-network",
    });

  const { data: mediaData } = useQuery<MediaData>(MEDIA_QUERY, {
    variables: { chatId: selectedChat?.id ?? "" },
    skip: !selectedChat,
  });

  const [updateChat] = useMutation<UpdateChatData>(UPDATE_CHAT_MUTATION, {
    update: (cache, { data }) => {
      const updated = data?.updateChat;
      if (!updated) return;
      cache.updateQuery<ChatQueryData>({ query: CHATS_QUERY }, (existing) => {
        if (!existing) return existing;
        return {
          chats: existing.chats.map((chat) =>
            chat.id === updated.id ? updated : chat,
          ),
        };
      });
    },
  });

  const [sendMessage] = useMutation<SendMessageData, SendMessageVariables>(
    SEND_MESSAGE_MUTATION,
  );
  const [deleteMessage] = useMutation(DELETE_MESSAGE_MUTATION);
  const [reactMessage] = useMutation(REACT_MESSAGE_MUTATION);
  const [blockUser] = useMutation(BLOCK_USER_MUTATION);
  const [unblockUser] = useMutation(UNBLOCK_USER_MUTATION);
  const [startCall] = useMutation<{ startCall: CallInfo }>(START_CALL_MUTATION);
  const [markMessagesSeen] = useMutation<{ markMessagesSeen: boolean }>(
    MARK_MESSAGES_SEEN_MUTATION,
  );

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

  useSubscription<{ chatMessageAdded: Message }>(CHAT_MESSAGE_SUBSCRIPTION, {
    variables: { chatId: selectedChat?.id ?? "" },
    skip: !selectedChat?.id,
    onData: ({ data: subscriptionData }) => {
      const newMessage = subscriptionData.data?.chatMessageAdded;
      if (!newMessage || !selectedChat?.id) return;

      client.cache.updateQuery<MessagesData>(
        {
          query: MESSAGES_QUERY,
          variables: { chatId: selectedChat.id },
        },
        (existingData) => {
          if (!existingData) return { messages: [newMessage] };

          if (existingData.messages.some((m) => m.id === newMessage.id)) {
            return {
              ...existingData,
              messages: existingData.messages.map((m) =>
                m.id === newMessage.id ? newMessage : m,
              ),
            };
          }

          const filtered = existingData.messages.filter(
            (m) =>
              !(
                m.id.startsWith("temp-") &&
                m.senderId === newMessage.senderId &&
                m.content === newMessage.content
              ),
          );

          return {
            ...existingData,
            messages: [...filtered, newMessage],
          };
        },
      );
    },
  });

  useSubscription<{ chatUpdated: Chat }>(CHAT_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const updated = data.data?.chatUpdated;
      if (!updated) return;

      client.cache.updateQuery<ChatQueryData>(
        { query: CHATS_QUERY },
        (existing) => {
          if (!existing) return existing;
          const exists = existing.chats.some((chat) => chat.id === updated.id);
          return {
            chats: exists
              ? existing.chats.map((chat) =>
                  chat.id === updated.id ? updated : chat,
                )
              : [...existing.chats, updated],
          };
        },
      );


    },
  });

  useEffect(() => {
    if (selectedChat) setActiveChat(selectedChat);
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat?.id || !isChatRoute || !messagesData || messagesLoading) return;

    loadedMessageChatsRef.current.add(selectedChat.id);

    if (messages.some((item) => item.senderId !== currentUser?.id && !item.seen)) {
      void markMessagesSeen({ variables: { chatId: selectedChat.id } });
    }
  }, [currentUser?.id, isChatRoute, markMessagesSeen, messages, messagesData, messagesLoading, selectedChat?.id]);

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
        if (chat.blockedByMe) return false;
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
      isBlocked(selectedChat) ||
      recording ||
      !currentUser
    )
      return;

    const content = message.trim();
    const replyId = reply?.id ?? null;
    const currentReply = reply;

    setMessage("");
    setReply(null);

    const tempId = `temp-${Date.now()}`;

    await sendMessage({
      variables: {
        chatId: selectedChat.id,
        content,
        type: "TEXT",
        replyToId: replyId,
        attachmentId: null,
      },

      optimisticResponse: {
        sendMessage: {
          id: tempId,
          chatId: selectedChat.id,
          senderId: currentUser.id,
          content,
          type: "TEXT",
          createdAt: new Date().toISOString(),
          seen: false,
          reaction: null,
          deleted: false,
          replyTo: currentReply
            ? {
                id: currentReply.id,
                chatId: currentReply.chatId,
                senderId: currentReply.senderId,
                content: currentReply.content,
                type: currentReply.type,
                createdAt: currentReply.createdAt,
              }
            : null,
          attachment: null,
        },
      },

      update: (cache, { data }) => {
        const sentMsg = data?.sendMessage;
        if (!sentMsg) return;

        cache.updateQuery<MessagesData>(
          {
            query: MESSAGES_QUERY,
            variables: { chatId: selectedChat.id },
          },
          (existing) => {
            if (!existing) return { messages: [sentMsg] };
            if (existing.messages.some((m) => m.id === sentMsg.id))
              return existing;
            return { ...existing, messages: [...existing.messages, sentMsg] };
          },
        );

        cache.updateQuery<ChatQueryData>({ query: CHATS_QUERY }, (existing) => {
          if (!existing) return existing;
          return {
            chats: existing.chats.map((chat) =>
              chat.id === selectedChat.id
                ? {
                    ...chat,
                    preview: content,
                    lastMessageAt: sentMsg.createdAt,
                  }
                : chat,
            ),
          };
        });
      },
    });
  };

  const sendAttachment = async (file: File) => {
    if (
      !selectedChat ||
      isBlocked(selectedChat) ||
      !(file.type.startsWith("image/") || file.type.startsWith("video/"))
    )
      return;

    const attachmentId = await upload(selectedChat.id, file);
    const type = file.type.startsWith("image/") ? "IMAGE" : "VIDEO";
    const replyId = reply?.id ?? null;
    await sendMessage({
      variables: {
        chatId: selectedChat.id,
        content: "",
        type,
        replyToId: replyId,
        attachmentId,
      },
      update: (cache, { data }) => {
        const sentMsg = data?.sendMessage;
        if (!sentMsg) return;
        cache.updateQuery<MessagesData>(
          { query: MESSAGES_QUERY, variables: { chatId: selectedChat.id } },
          (existing) => {
            if (!existing) return { messages: [sentMsg] };
            if (existing.messages.some((item) => item.id === sentMsg.id)) return existing;
            return { messages: [...existing.messages, sentMsg] };
          },
        );
        cache.updateQuery<ChatQueryData>({ query: CHATS_QUERY }, (existing) => {
          if (!existing) return existing;
          return {
            chats: existing.chats.map((chat) =>
              chat.id === selectedChat.id
                ? { ...chat, preview: type.toLowerCase(), lastMessageAt: sentMsg.createdAt }
                : chat,
            ),
          };
        });
      },
    });
    setReply(null);
  };

  const startRecording = async () => {
    if (
      !selectedChat ||
      isBlocked(selectedChat) ||
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

      const cleanAudioType = recorder.mimeType.split(";")[0] || "audio/webm";

      const file = new File([blob], `voice-${Date.now()}.webm`, {
        type: cleanAudioType,
      });

      try {
        const attachmentId = await upload(selectedChat.id, file);
        await sendMessage({
          variables: {
            chatId: selectedChat.id,
            content: "",
            type: "AUDIO",
            replyToId: reply?.id ?? null,
            attachmentId,
          },
          update: (cache, { data }) => {
            const sentMsg = data?.sendMessage;
            if (!sentMsg) return;
            cache.updateQuery<MessagesData>(
              { query: MESSAGES_QUERY, variables: { chatId: selectedChat.id } },
              (existing) => {
                if (!existing) return { messages: [sentMsg] };
                if (existing.messages.some((item) => item.id === sentMsg.id)) return existing;
                return { messages: [...existing.messages, sentMsg] };
              },
            );
            cache.updateQuery<ChatQueryData>({ query: CHATS_QUERY }, (existing) => {
              if (!existing) return existing;
              return {
                chats: existing.chats.map((chat) =>
                  chat.id === selectedChat.id
                    ? { ...chat, preview: "audio", lastMessageAt: sentMsg.createdAt }
                    : chat,
                ),
              };
            });
          },
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

    const userMessage: GeminiMessage = {
      id: `temp-${Date.now()}`,
      sender: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setGeminiMessages((current) => [...current, userMessage]);

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

  const makeCall = async (type: "audio" | "video") => {
    if (!selectedChat || isBlocked(selectedChat)) return;
    const result = await startCall({
      variables: { userId: selectedChat.friend.id, type },
    });
    if (result.data?.startCall) setCall(result.data.startCall, false);
  };

  const isBlocked = (chat: Chat) =>
    Boolean(chat.blockedByFriend || chat.blockedByMe);

  const SKELETON_COUNT = 12;

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

        <div className={`chat-items ${chatsLoading ? "is-loading-chats" : ""}`}>
          {chatsLoading &&
            Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <div className="loading-chat-row" key={index}>
                <div className="loading-chat-avatar" />
                <div className="loading-chat-info">
                  <div className="loading-chat-title" />
                  <div className="loading-chat-preview" />
                </div>
                <div className="moving-chat-beam" />
              </div>
            ))}

          {!chatsLoading && chatsError && (
            <p className="chat-empty-state">Unable to load chats.</p>
          )}

          {!chatsLoading && !filteredChats.length && (
            <p className="chat-empty-state">No chats found.</p>
          )}

          {!chatsLoading &&
            filteredChats.map((chat) => (
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
                <button
                  title="Audio call"
                  onClick={() => void makeCall("audio")}
                  disabled={isBlocked(selectedChat)}
                >
                  <Phone size={23} />
                </button>
                <button
                  title="Video call"
                  onClick={() => void makeCall("video")}
                  disabled={isBlocked(selectedChat)}
                >
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

            {messagesLoading && selectedChat && !loadedMessageChatsRef.current.has(selectedChat.id) ? (
              <div className="messages-loading-state">
                <Spinner size={32} thickness={5} color="#dbdbdb" />
                Loading Conversations...
              </div>
            ) : (
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
            )}

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
                    selectedChat.blockedByMe
                      ? "You blocked this user"
                      : selectedChat.blockedByFriend
                        ? "This user blocked you"
                        : "Type a message..."
                  }
                  rows={1}
                  readOnly={recording || isBlocked(selectedChat)}
                  disabled={isBlocked(selectedChat)}
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
                  {selectedChat.blockedByMe
                    ? "You blocked this user."
                    : "This user blocked you."}
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
              <button
                className="profile-action"
                onClick={() => void makeCall("audio")}
                disabled={isBlocked(selectedChat)}
              >
                <Phone size={25} />
                <span>Audio Call</span>
              </button>

              <button
                className="profile-action"
                onClick={() => void makeCall("video")}
                disabled={isBlocked(selectedChat)}
              >
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
                    {item.type === "VIDEO" ? (
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
                  const userId = selectedChat.friend.id;
                  const blockedByMe = Boolean(selectedChat.blockedByMe);
                  if (blockedByMe) {
                    await unblockUser({ variables: { userId } });
                  } else {
                    await blockUser({ variables: { userId } });
                  }
                  client.cache.updateQuery<ChatQueryData>(
                    { query: CHATS_QUERY },
                    (existing) => {
                      if (!existing) return existing;
                      return {
                        chats: existing.chats.map((chat) =>
                          chat.id === selectedChat.id
                            ? { ...chat, blockedByMe: !blockedByMe }
                            : chat,
                        ),
                      };
                    },
                  );
                }}
              >
                {selectedChat.blockedByMe ? <X size={22} /> : <Ban size={22} />}
                <span>
                  {selectedChat.blockedByMe ? "Unblock" : "Block Friend"}
                </span>
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
                {selectedMedia.type === "VIDEO" ? (
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
                      {item.type === "VIDEO" ? (
                        <video src={item.url} muted />
                      ) : (
                        <img src={item.url} alt={item.name ?? "Shared media"} />
                      )}
                      {item.type === "VIDEO" && <span>Video</span>}
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
