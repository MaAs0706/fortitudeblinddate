import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useSession } from "../context/SessionContext";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { session } = useSession();
  const { user, profile } = useAuth();
  const scrollRef = useRef(null);
  const typingChannelRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [viewportHeight, setViewportHeight] = useState("100dvh");
  
  // --- Timer & Count State ---
  const [timeLeft, setTimeLeft] = useState("");
  const [localMessageCount, setLocalMessageCount] = useState(session?.message_count || 0);
  const MAX_MESSAGES = 100;

  // 1. Live Countdown Logic
  useEffect(() => {
    if (!session?.created_at) return;

    const calculateTime = () => {
      const startTime = new Date(session.created_at).getTime();
      const duration = 15 * 60 * 1000; // 15 Minutes in ms (Adjust as needed)
      const endTime = startTime + duration;
      const now = new Date().getTime();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        return;
      }

      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime(); // Initial call

    return () => clearInterval(timer);
  }, [session?.created_at]);

  // 2. Real-time Message Count Sync
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`session-stats-${session.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "sessions",
        filter: `id=eq.${session.id}`,
      }, (payload) => {
        setLocalMessageCount(payload.new.message_count);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [session?.id]);

  // 3. Viewport & Keyboard Handling
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) setViewportHeight(`${window.visualViewport.height}px`);
    };
    window.visualViewport?.addEventListener("resize", handleResize);
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  /* ... Keep your existing Message Load & Realtime Subscription Logic ... */

  return (
    <div 
      className="relative w-full text-white flex flex-col overflow-hidden bg-[#0c111f]"
      style={{ height: viewportHeight }}
    >
      {/* 🌙 Enhanced Header */}
      <div className="flex-none bg-[#0c111f]/60 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-[#ed9e6f] tracking-widest uppercase">
              {profile?.nickname || "Soul"}
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">Connected</p>
            </div>
          </div>

          <div className="text-right">
            <p className={`text-sm font-mono font-bold ${timeLeft === "00:00" ? "text-red-500" : "text-[#b66570]"}`}>
              {timeLeft}
            </p>
            <p className="text-[9px] text-white/30 uppercase">Time Remaining</p>
          </div>
        </div>

        {/* 📊 Message Count Progress Bar */}
        <div className="mt-3 w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(localMessageCount / MAX_MESSAGES) * 100}%` }}
            className="h-full bg-gradient-to-r from-[#ed9e6f] to-[#b66570]"
          />
        </div>
        <p className="text-[9px] text-white/20 mt-1 text-center uppercase tracking-widest">
          {localMessageCount} / {MAX_MESSAGES} Whispers Shared
        </p>
      </div>

      {/* 💬 Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[15px] leading-snug shadow-xl ${
                  msg.sender === "me" 
                    ? "bg-[#ed9e6f] text-[#0c111f] rounded-tr-none font-medium" 
                    : "bg-[#2d1f44]/80 border border-white/10 text-white rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing Bubble (Omitted for brevity, keep your motion.div version) */}
      </div>

      {/* 💌 Dynamic Input Area */}
      <div className="p-4 pb-8 bg-gradient-to-t from-[#0c111f] via-[#0c111f] to-transparent">
        <motion.div layout className="flex gap-2 items-center bg-[#2d1f44]/90 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 shadow-2xl">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Whisper to the stars..."
            className="flex-1 bg-transparent px-5 py-2 text-sm outline-none placeholder:text-white/20"
          />
          <button 
            onClick={sendMessage}
            className="bg-[#ed9e6f] text-[#0c111f] p-2.5 rounded-full hover:brightness-110 active:scale-90 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </motion.div>
      </div>
    </div>
  );
}