import { useEffect, useRef } from "react";

function WelcomeScreen({ config, products }) {
  return (
    <div className="flex-1 overflow-y-auto chat-scroll px-8 py-7 flex flex-col gap-6">

      {/* Welcome text */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-gray-800">
          আসসালামু আলাইকুম! 👋
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          আমরা <span className="font-semibold text-indigo-600">{config?.name || "এই শপ"}</span> থেকে আপনাকে স্বাগত জানাই। আপনার পছন্দের পণ্য অর্ডার করুন, দাম জানুন বা যেকোনো প্রশ্ন করুন।
        </p>
      </div>

      {/* Products list */}
      {products && products.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            আমাদের পণ্যসমূহ
          </p>
          <div className="flex flex-col gap-2">
            {products.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-3.5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">👗</span>
                  <span className="text-sm font-semibold text-gray-700">{p.product}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-indigo-600">{p.price}tk</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold
                    ${p.stock?.toUpperCase() === "YES"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                    }`}>
                    {p.stock?.toUpperCase() === "YES" ? "আছে" : "নেই"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hint + suggestion chips */}
      <div className="flex flex-col gap-3">
        <p className="text-xs text-center text-gray-400 animate-bounce">
          নিচে লিখুন বা একটি প্রশ্ন বেছে নিন ↓
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "অর্ডার কিভাবে দিব?",
            "ছবি আছে?",
            "ডেলিভারি চার্জ কত?",
            "দাম কমবে?",
            "স্টক আছে?",
            "পেমেন্ট কিভাবে করব?",
          ].map((q) => (
            <button
              key={q}
              onClick={() => {
                const input = document.getElementById("chat-input");
                if (input) {
                  input.value = q;
                  input.focus();
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                }
              }}
              className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full px-4 py-2 font-medium hover:bg-indigo-100 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-base shrink-0">
        👩‍💼
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          <div className="typing-dot" />
          <div className="typing-dot" style={{ animationDelay: "150ms" }} />
          <div className="typing-dot" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function MessageContent({ content }) {
  const lines = content.split("\n");
  const fullText = content;

  if (fullText.includes("ORDER_SUMMARY:")) {
    const match = fullText.match(
      /ORDER_SUMMARY:\s*\nProduct:\s*(.+)\nQuantity:\s*(.+)\nName:\s*(.+)\nPhone:\s*(.+)\nAddress:\s*(.+)\nTotal:\s*(.+)/
    );
    const beforeSummary = fullText.split("ORDER_SUMMARY:")[0].trim();

    return (
      <div className="flex flex-col gap-3">
        {beforeSummary && <span>{beforeSummary}</span>}
        {match && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col gap-2 text-xs">
            <p className="font-bold text-indigo-700 text-sm mb-1">🛒 Order Summary</p>
            {[
              { label: "Product",  value: match[1] },
              { label: "Quantity", value: match[2] },
              { label: "Name",     value: match[3] },
              { label: "Phone",    value: match[4] },
              { label: "Address",  value: match[5] },
              { label: "Total",    value: match[6] + "tk" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between gap-2">
                <span className="text-gray-500 font-medium">{item.label}</span>
                <span className="text-gray-800 font-semibold text-right">{item.value}</span>
              </div>
            ))}
            <p className="text-indigo-600 font-medium mt-1 text-center">
              confirm করতে হ্যাঁ লিখুন ✅
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        const photoMatch = trimmed.match(/PH[OT]{1,2}O?:\s*(https?:\/\/\S+)/i);
        if (photoMatch) {
          return (
            <img
              key={i}
              src={photoMatch[1].trim()}
              alt="Product photo"
              className="rounded-xl max-w-full max-h-60 object-cover border border-gray-100 shadow-sm mt-1"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          );
        }

        if (trimmed.startsWith("http") && trimmed.includes("cloudinary")) {
          return (
            <img
              key={i}
              src={trimmed}
              alt="Product photo"
              className="rounded-xl max-w-full max-h-60 object-cover border border-gray-100 shadow-sm mt-1"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          );
        }

        return <span key={i}>{trimmed}</span>;
      })}
    </div>
  );
}

function Message({ msg }) {
  if (msg.role === "system") {
    return (
      <div className="flex justify-center my-2 mb-4">
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-4 py-1">
          {msg.content}
        </span>
      </div>
    );
  }

  const isUser = msg.role === "user";

  return (
    <div className={`flex items-center gap-3 mb-5 ${isUser ? "flex-row-reverse pl-14" : "flex-row pr-14"}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0
        ${isUser ? "bg-gray-200" : "bg-gradient-to-br from-indigo-600 to-violet-600"}`}>
        {isUser ? "👤" : "👩‍💼"}
      </div>
      <div className={`px-5 py-4 text-sm leading-loose break-words rounded-2xl
        ${isUser
          ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm shadow-lg shadow-indigo-200"
          : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"
        }`}>
        <MessageContent content={msg.content} />
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, isTyping, config, products }) {
  const bottomRef = useRef(null);
  const realMessages = messages.filter((m) => m.role !== "system");
  const isEmpty = realMessages.length === 0 && !isTyping;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto chat-scroll bg-gray-50 flex flex-col min-h-0">
      {isEmpty ? (
        <WelcomeScreen config={config} products={products} />
      ) : (
        <div className="px-8 pt-6 pb-4 flex flex-col gap-2">
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {isTyping && <TypingIndicator />}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}