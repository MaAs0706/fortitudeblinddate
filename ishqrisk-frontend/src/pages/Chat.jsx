import { useState, useEffect, useRef } from "react";

export default function Chat() {
  const currentUserId = "user_123";
  const {session} = {id:"randomId1₹223345", user_a:"ranfomuserId", user_b:"randomuserId2", nickname_a:"randomNickName1", nickname_b:"randomNikname2"}; // ⭐ MOCK SESSION (Replace with useAuth().user.id in real app) 

  const [messages, setMessages] = useState([
    { id: 1, senderId: "user_456", text: "Hey." },
    { id: 2, senderId: "user_123", text: "Hi 🙂" },
    { id: 3, senderId: "user_456", text: "This feels… different." },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), senderId: currentUserId, text: input },
    ]);

    setInput("");
    setTimeout(() => setIsTyping(true), 500);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, senderId: "user_456", text: "Yeah… I was thinking the same." },
      ]);
    }, 2000);
  };

  return (
    <div className="relative h-screen w-full text-white flex flex-col overflow-hidden bg-[#0c111f]">

      {/* 🌌 CSS NEBULA GENERATOR (Replaces the Image Holder) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Deep Midnight Base */}
        <div className="absolute inset-0 bg-[#0c111f]" />
        
        {/* Large Plum Nebula (Top Left) */}
        <div 
          className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] rounded-full opacity-40 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #512f5c 0%, transparent 70%)' }}
        />
        
        {/* Golden Amber Glow (Bottom Center/Left) */}
        <div 
          className="absolute -bottom-1/4 left-[5%] w-[70%] h-[70%] rounded-full opacity-30 blur-[100px] animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, #ed9e6f 0%, transparent 60%)',
            animationDuration: '10s' 
          }}
        />

        {/* Muted Rose Accent (Right Side) */}
        <div 
          className="absolute top-[20%] -right-1/4 w-[60%] h-[60%] rounded-full opacity-20 blur-[110px]"
          style={{ background: 'radial-gradient(circle, #b66570 0%, transparent 70%)' }}
        />

        {/* Dark Purple Depth (Center) */}
        <div 
          className="absolute top-[30%] left-[20%] w-[50%] h-[50%] rounded-full opacity-25 blur-[130px]"
          style={{ background: 'radial-gradient(circle, #2d1f44 0%, transparent 70%)' }}
        />
      </div>

      {/* 🌙 Header */}
      <div className="sticky top-0 z-20 bg-[#0c111f]/40 backdrop-blur-md border-b border-white/10 px-6 py-5">
        <div className="flex justify-between items-center w-full">
          <div>
            <p className="text-sm font-bold text-[#ed9e6f] tracking-widest uppercase">
              @moonlitSoul
            </p>
            <p className="text-[10px] text-white/40 tracking-tighter uppercase">
              ✦ Anonymous Blind Date
            </p>
          </div>
          <p className="text-xs text-[#b66570] font-mono">
            07:42 LEFT
          </p>
        </div>
      </div>

      {/* 💬 Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 w-full scrollbar-hide">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-2xl transition-all
                  ${
                    isMine
                      ? "bg-[#ed9e6f] text-[#0c111f] font-medium rounded-tr-none shadow-[#ed9e6f]/10"
                      : "bg-[#2d1f44]/60 backdrop-blur-lg border border-white/10 text-white rounded-tl-none"
                  }
                `}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#80466e] rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-[#80466e] rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-[#80466e] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 💌 Input Area */}
      <div className="p-6 pb-10 w-full">
        <div className="flex gap-2 items-center bg-[#2d1f44]/80 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 shadow-2xl">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Whisper to the stars..."
            className="flex-1 bg-transparent px-5 py-2 text-sm outline-none placeholder:text-white/30"
          />
          <button
            onClick={sendMessage}
            className="bg-[#ed9e6f] text-[#0c111f] p-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}