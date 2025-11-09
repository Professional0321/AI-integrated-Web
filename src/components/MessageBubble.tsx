import React from "react";

export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`bubble ${isUser ? "user" : "assistant"}`}>
      <div style={{ whiteSpace: "pre-wrap" }}>{message.content}</div>
      <div
        className="small"
        style={{ marginTop: 6, textAlign: isUser ? "right" : "left" }}
      >
        {new Date(message.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
