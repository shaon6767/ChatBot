import { useState, useEffect } from "react";
import Head from "next/head";
import SetupPanel from "../components/SetupPanel";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";

const DEFAULT_CONFIG = {
  name: "Dhaka Fashion House",
  lang: "Bangla + English mixed",
  rules: `I sell sarees and salwar kameez.
Saree price: 1500tk, minimum I can go: 1200tk.
Salwar kameez: 900tk, minimum: 750tk.
Free delivery above 2000tk. Below that: 60tk delivery charge.
Payment via bKash: 01700000000.
No returns after 3 days. Dhaka delivery 1-2 days, outside 3-5 days.`,
};

const INITIAL_MESSAGES = [
  { role: "system", content: "👋 Agent connected — try sending a message below" },
];

export default function Home() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.products) setProducts(data.products);
      } catch (err) {}
    }
    loadProducts();
  }, []);

  const handleSend = async (text) => {
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    const newHistory = [...chatHistory, { role: "user", content: text }];
    setChatHistory(newHistory);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          businessName: config.name,
          businessLang: config.lang,
          businessRules: config.rules,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { role: "system", content: "⚠️ Error: " + data.error }]);
      } else {
        if (data.orderData) setPendingOrder(data.orderData);

        if (data.isConfirmed && pendingOrder) {
          try {
            await fetch("/api/order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(pendingOrder),
            });
          } catch (err) {}
          setPendingOrder(null);
        }

        const aiMsg = { role: "assistant", content: data.reply };
        setMessages((prev) => [...prev, aiMsg]);
        setChatHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "system", content: "⚠️ Connection error. Try again." }]);
    }

    setIsTyping(false);
  };

  return (
    <>
      <Head>
        <title>AI DM Agent — {config.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5">

        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-4">
          AI-Powered Customer Agent
        </p>

        <div
          className="w-full max-w-lg flex flex-col rounded-3xl overflow-hidden shadow-2xl bg-white"
          style={{ height: "90vh", maxHeight: "860px" }}
        >

          {/* Header */}
          <div className="flex items-center gap-4 px-8 py-5 bg-gradient-to-r from-indigo-600 to-violet-600">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl shrink-0">
              👩‍💼
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base leading-tight truncate">
                {config.name || "AI DM Agent"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block status-pulse shrink-0" />
                <span className="text-white/70 text-xs">Online · Replies instantly</span>
              </div>
            </div>
            <button
              onClick={() => {
                setMessages(INITIAL_MESSAGES);
                setChatHistory([]);
                setPendingOrder(null);
              }}
              className="bg-white/15 hover:bg-white/25 transition-colors text-white text-xs font-medium px-4 py-2 rounded-xl border border-white/10 shrink-0"
            >
              Clear
            </button>
          </div>

          <SetupPanel config={config} onChange={setConfig} />
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            config={config}
            products={products}
          />
          <MessageInput onSend={handleSend} disabled={isTyping} />

        </div>

        <p className="mt-4 text-xs text-gray-300">
          Powered by AI · Built for Bangladeshi businesses
        </p>

      </main>
    </>
  );
}