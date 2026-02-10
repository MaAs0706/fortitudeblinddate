import { useState, useEffect, useRef } from "react";

export default function Chat() {
  // Mock current user (replace with Supabase user.id)
  const currentUserId = "user_123";

  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: "user_456",
      text: "Hey.",
    },
    {
      id: 2,
      senderId: "user_123",
      text: "Hi 🙂",
    },
    {
      id: 3,
      senderId: "user_456",
      text: "This feels… different.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(true); // mock typing
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        senderId: currentUserId,
        text: input,
      },
    ]);

    setInput("");

    // fake typing response (remove later)
    setTimeout(() => setIsTyping(true), 500);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          senderId: "user_456",
          text: "Yeah… I was thinking the same.",
        },
      ]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/70 backdrop-blur border-b border-white/10 px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm">@moonlitSoul</p>
            <p className="text-xs text-white/40">Blind chat</p>
          </div>
          <p className="text-xs text-white/50">07:42 left</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${
                    isMine
                      ? "bg-[#D8A7B1] text-black rounded-br-md"
                      : "bg-white/10 backdrop-blur text-white rounded-bl-md"
                  }
                `}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-white/10 text-sm text-white/60">
              typing…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-black/70 backdrop-blur px-4 py-4">
        <div className="flex gap-3 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Say something…"
            className="flex-1 rounded-full bg-white/10 px-5 py-3 text-sm outline-none placeholder:text-white/40 focus:ring-1 focus:ring-[#D8A7B1]"
          />
          <button
            onClick={sendMessage}
            className="px-5 py-2 rounded-full bg-[#D8A7B1] text-black font-medium hover:scale-105 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
