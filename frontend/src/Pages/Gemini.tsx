import { useEffect, useRef, useState } from "react";

import { useMutation, useQuery, useSubscription } from "@apollo/client/react";

import { Send } from "lucide-react";

import {
  GEMINI_MESSAGE_SUBSCRIPTION,
  GEMINI_MESSAGES_QUERY,
  SEND_GEMINI_MESSAGE_MUTATION,
} from "../services/graphql";

import type { GeminiMessage } from "../types";

const Gemini = () => {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<GeminiMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery<{ geminiMessages: GeminiMessage[] }>(
    GEMINI_MESSAGES_QUERY,
  );

  const [sendGemini] = useMutation<{ sendGeminiMessage: GeminiMessage }>(
    SEND_GEMINI_MESSAGE_MUTATION,
  );

  useEffect(() => {
    if (data?.geminiMessages) setMessages(data.geminiMessages);
  }, [data]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useSubscription<{ geminiMessageAdded: GeminiMessage }>(
    GEMINI_MESSAGE_SUBSCRIPTION,
    {
      onData: ({ data: subscriptionData }) => {
        const incoming = subscriptionData.data?.geminiMessageAdded;

        if (!incoming) return;
        setMessages((current) =>
          current.some((item) => item.id === incoming.id)
            ? current
            : [...current, incoming],
        );
      },
    },
  );

  const sendMessage = async () => {
    const content = input.trim();

    if (!content || isSending) return;

    setInput("");
    setIsSending(true);
    try {
      const result = await sendGemini({ variables: { content, chatId: null } });
      if (result.data?.sendGeminiMessage)
        setMessages((current) =>
          current.some((item) => item.id === result.data!.sendGeminiMessage.id)
            ? current
            : [...current, result.data!.sendGeminiMessage],
        );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="gemini-page">
      <main className="gemini-main">
        <section className="gemini-chat">
          <header className="gemini-header visible">
            <div className="gemini-title">
              <div className="gemini-heading-row">
                <img
                  className="geminiIcon"
                  src="https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/Gemini-Icon.png"
                  alt="Gemini"
                />
                <h1>Gemini</h1>
                <span className="ai-badge">AI</span>
              </div>
            </div>
          </header>

          <div className="chat-content">
            <div className="date-divider">
              <span>Today</span>
            </div>

            {!messages.length && (
              <div className="gemini-empty-state">
                <div className="gemini-avatar">
                  <img
                    className="chatGeminiIcon"
                    src="https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/Gemini-Icon.png"
                    alt="Gemini"
                  />
                </div>
                <h2>Ask Gemini anything</h2>
                <p>Your messages and Gemini's responses will appear here.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`gemini-message-row ${msg.sender === "user" ? "sent" : "received"}`}
              >
                {msg.sender === "gemini" && (
                  <div className="gemini-avatar">
                    <img
                      className="chatGeminiIcon"
                      src="https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/Gemini-Icon.png"
                      alt="Gemini"
                    />
                  </div>
                )}

                <div
                  className={`gemini-bubble ${msg.sender === "user" ? "gemini-bubble-user" : "gemini-bubble-bot"}`}
                >
                  <p>{msg.content}</p>
                  <div className="message-meta">
                    <small>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        </section>

        <div className="gemini-composer-wrapper">
          {isSending && (
            <div className="sending-indicator">
              <span className="sending-dot" />
              <span>Sending message...</span>
            </div>
          )}

          <div className="gemini-composer">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder={
                messages.length
                  ? "Chat with Gemini..."
                  : "Start Chatting with Gemini..."
              }
              disabled={isSending}
            />

            <button
              type="button"
              className="gemini-send-button"
              onClick={() => void sendMessage()}
              disabled={!input.trim() || isSending}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Gemini;
