import React, { useEffect, useRef, useState } from "react";

export default function ChatInput({
  disabled,
  loading,
  onSend,
}: {
  disabled?: boolean;
  loading: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit() {
    if (loading) return;
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  }

  return (
    <div>
      <textarea
        ref={inputRef}
        rows={3}
        placeholder="Type your prompt..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <footer>
        <span className="small">Shift+Enter for newline</span>
        <div className="row">
          <button
            className="ghost"
            onClick={() => setText("")}
            disabled={disabled || !text}
          >
            Clear input
          </button>
          <button
            className={loading ? "loading" : ""}
            onClick={submit}
            disabled={disabled || !text}
          >
            Send
            {loading ? <span className="spinner-inline" /> : ""}
          </button>
        </div>
      </footer>
    </div>
  );
}
