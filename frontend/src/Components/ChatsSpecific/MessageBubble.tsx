import { Smile, Reply, CheckCheck, Check } from "lucide-react";

interface BaseMessageBubbleProps {
  toggleMessageActions: (message: number) => void;
  activeMessageId: any;
  message: string;
  time: string;
  id: number;
  setReply: React.Dispatch<React.SetStateAction<string | null>>;
}

interface SentMessageBubbleProps extends BaseMessageBubbleProps {
  seen: boolean;
}

export const RecievedMessage = ({
  toggleMessageActions,
  activeMessageId,
  message,
  time,
  id,
  setReply,
}: BaseMessageBubbleProps) => {
  return (
    <div className="message-row received">
      <div className="message-stack">
        <div className="message-bubble-wrapper">
          <div
            className={`message-bubble received-bubble`}
            onClick={() => toggleMessageActions(id)}
          >
            <span>{message}</span>
            <small>{time}</small>
          </div>

          <div
            className={`bubble-actions ${activeMessageId === id ? "show" : ""}`}
          >
            <button
              className="bubble-action-btn"
              title="Reply"
              onClick={() => setReply(message)}
            >
              <Reply size={15} />
            </button>
            <button
              className="bubble-action-btn"
              title="React"
              onClick={(e) => {
                e.stopPropagation();
                console.log(`React to ${id}`);
              }}
            >
              <Smile size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SentMessage = ({
  toggleMessageActions,
  activeMessageId,
  message,
  time,
  id,
  seen,
  setReply,
}: SentMessageBubbleProps) => {
  return (
    <div className="message-row sent">
      <div className="message-stack">
        <div className="message-bubble-wrapper">
          <div
            className={`bubble-actions ${activeMessageId === id ? "show" : ""}`}
          >
            <button
              className="bubble-action-btn"
              title="Reply"
              onClick={(e) => {
                e.stopPropagation();
                console.log(`Reply to ${id}`);
              }}
            >
              <Reply size={15} />
            </button>
            <button
              className="bubble-action-btn"
              title="React"
              onClick={() => setReply(message)}
            >
              <Smile size={15} />
            </button>
          </div>

          <div
            className="message-bubble sent-bubble"
            onClick={() => toggleMessageActions(id)}
          >
            <span>{message}</span>
            <small>
              {time} {seen ? <CheckCheck size={14} /> : <Check size={14} />}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};
