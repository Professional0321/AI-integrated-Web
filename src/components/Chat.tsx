import React, { useEffect, useRef, useState } from "react";
import MessageBubble, { Message } from "./MessageBubble";
import ChatInput from "./ChatInput";
import { askOpenAIStream } from "../services/openai";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function cancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }

  async function send(prompt: string) {
    setError(null);
    const user: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      createdAt: Date.now(),
    };
    setMessages((m) => [...m, user]);

    const botId = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      { id: botId, role: "assistant", content: "", createdAt: Date.now() },
    ]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);

    try {
      await askOpenAIStream(prompt, {
        onToken: (chunk) => {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === botId ? { ...msg, content: msg.content + chunk } : msg
            )
          );
        },
      });
    } catch (e: any) {
      console.log(e.message);

      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function clearHistory() {
    if (confirm("Clear chat history?")) {
      setMessages([]);
      setError(null);
    }
  }

  return (
    <div className="card">
      <div className="header">
        <div className="small">
          Provider: <span className="badge">openai</span>
        </div>
        <div className="row">
          <button
            className="ghost"
            onClick={clearHistory}
            disabled={!messages.length}
          >
            Clear history
          </button>
          {loading ? (
            <button className="danger" onClick={cancel}>
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      <div ref={listRef} className="list" aria-live="polite">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      {error && (
        <div role="alert" className="small" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      )}
      <ChatInput disabled={loading} onSend={send} loading={loading} />
    </div>
  );
}
