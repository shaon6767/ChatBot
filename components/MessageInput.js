import { useState } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div style={{
      background: "#fff",
      borderTop: "1px solid #f0f0f0",
      padding: "12px 16px",
      flexShrink: 0,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <input
          id="chat-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={disabled}
          placeholder="Write something..."
          style={{
            flex: 1,
            height: "48px",
            border: "1.5px solid #e5e7eb",
            borderRadius: "50px",
            padding: "0 20px",
            fontSize: "14px",
            fontFamily: "inherit",
            background: "#f9fafb",
            color: "#111827",
            outline: "none",
            opacity: disabled ? 0.6 : 1,
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "none",
            background: disabled || !text.trim()
              ? "#e5e7eb"
              : "linear-gradient(135deg, #4f46e5, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            cursor: disabled || !text.trim() ? "not-allowed" : "pointer",
            boxShadow: disabled || !text.trim()
              ? "none"
              : "0 4px 12px rgba(79,70,229,0.35)",
            transition: "all 0.2s",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
}