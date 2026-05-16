import { useState } from "react";

const QUICK_PROMPTS = [
  "Saree er daam koto?",
  "Kom hobe? 1000tk nibo",
  "Delivery free ache?",
  "2 sarees er daam?",
];

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="bg-white border-t border-gray-100 px-8 pt-3 pb-5">

      {/* Quick prompts */}
      <div className="flex gap-2 flex-wrap mb-3">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onSend(p)}
            disabled={disabled}
            className="text-xs bg-violet-100 text-violet-700 rounded-full px-3.5 py-1.5 font-medium disabled:opacity-40 hover:bg-violet-200 transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-center gap-3">
        <input
          id="chat-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={disabled}
          placeholder="Type a message..."
          className="flex-1 border border-gray-200 rounded-full px-5 py-3 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:border-indigo-400 disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-200
            ${disabled || !text.trim()
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200 hover:opacity-90 cursor-pointer"
            }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>

    </div>
  );
}