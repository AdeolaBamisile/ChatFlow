import { useState, useRef } from "react";
import {
  Smile,
  Reply,
  CheckCheck,
  Check,
  Trash,
  Play,
  Pause,
} from "lucide-react";
import type { Message } from "../../types";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  active: boolean;
  onToggleActions: (id: string) => void;
  onReply: (message: Message) => void;
  onReact: (id: string, emoji: string) => void;
  onDelete: (id: string) => void;
}

const emojis = ["❤️", "😂", "👍", "🔥", "😮", "😢", "👏", "🎉", "🙏", "😍"];

const ReplyPreview = ({ reply }: { reply?: Message | null }) => {
  if (!reply) return null;
  return (
    <div className="message-reply-preview">
      <div className="message-reply-bar" />
      <div className="message-reply-content">
        <span>Replying to</span>
        <p>{reply.content}</p>
      </div>
    </div>
  );
};

const VoicePlayer = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration || 1;
    setProgress((current / total) * 100);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * (audioRef.current.duration || 0);
    audioRef.current.currentTime = newTime;
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="custom-voice-note">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      <button
        type="button"
        className="voice-play-button"
        onClick={togglePlay}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause size={17} />
        ) : (
          <Play size={17} fill="currentColor" />
        )}
      </button>

      <div className="voice-timeline-container" onClick={handleSeek}>
        <div className="voice-timeline-bar">
          <div
            className="voice-timeline-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <span className="voice-duration">
        {isPlaying
          ? formatSeconds(audioRef.current?.currentTime ?? 0)
          : formatSeconds(duration)}
      </span>
    </div>
  );
};

const Attachment = ({ message }: { message: Message }) => {
  if (!message.attachment) return null;
  const { type, url, name } = message.attachment;

  if (type === "IMAGE")
    return (
      <img className="message-media" src={url} alt={name ?? "Shared image"} />
    );

  if (type === "VIDEO")
    return (
      <video className="message-media" src={url} controls preload="metadata" />
    );

  return <VoicePlayer url={url} />;
};

export const MessageBubble = ({
  message,
  isMine,
  active,
  onToggleActions,
  onReply,
  onReact,
  onDelete,
}: MessageBubbleProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReact = (emoji: string) => {
    onReact(message.id, emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div
      className={`message-row ${isMine ? "sent" : "received"}`}
      data-message-id={message.id}
    >
      <div className="message-stack">
        <div className="message-bubble-wrapper">
          <div
            className={`bubble-actions ${active ? "show" : ""}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="bubble-action-btn"
              title="Reply"
              onClick={() => {
                onReply(message);
                setShowEmojiPicker(false);
              }}
            >
              <Reply size={15} />
            </button>
            <button
              className="bubble-action-btn"
              title="React"
              onClick={() => setShowEmojiPicker((value) => !value)}
            >
              <Smile size={15} />
            </button>

            <button
              className="bubble-action-btn delete-action"
              title="Delete"
              onClick={() => {
                onDelete(message.id);
                setShowEmojiPicker(false);
              }}
            >
              <Trash size={15} />
            </button>
          </div>
          {showEmojiPicker && (
            <div
              className="message-emoji-picker"
              onClick={(event) => event.stopPropagation()}
            >
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReact(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div
            className={`message-bubble ${isMine ? "sent-bubble" : "received-bubble"}`}
            onClick={() => onToggleActions(message.id)}
          >
            <ReplyPreview reply={message.replyTo} />
            <Attachment message={message} />
            {message.content && (
              <span className="message-text">{message.content}</span>
            )}
            <small>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {isMine &&
                (message.seen ? <CheckCheck size={14} /> : <Check size={14} />)}
            </small>
            {message.reaction && (
              <div className="message-reaction">{message.reaction}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const RecievedMessage = ({
  message,
  active,
  onToggleActions,
  onReply,
  onReact,
  onDelete,
}: Omit<MessageBubbleProps, "isMine">) => (
  <MessageBubble
    message={message}
    isMine={false}
    active={active}
    onToggleActions={onToggleActions}
    onReply={onReply}
    onReact={onReact}
    onDelete={onDelete}
  />
);

export const SentMessage = ({
  message,
  active,
  onToggleActions,
  onReply,
  onReact,
  onDelete,
}: Omit<MessageBubbleProps, "isMine">) => (
  <MessageBubble
    message={message}
    isMine
    active={active}
    onToggleActions={onToggleActions}
    onReply={onReply}
    onReact={onReact}
    onDelete={onDelete}
  />
);
