import React from "react";
import { useState } from "react";
import Chat from "./components/Chat";

export default function App() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="container">
      <h1 style={{ margin: 0 , marginBottom: 16 }}>AI-integrated Web App for SERVIMATT</h1>
      <Chat />
    </div>
  );
}
