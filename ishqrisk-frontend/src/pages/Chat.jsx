import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useSession } from "../context/SessionContext";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const navigate = useNavigate();

  const { session } = useSession();
  const { user, profile } = useAuth();
  console.log(session)
  const scrollRef = useRef(null);
  const typingChannelRef = useRef(null);
  const lastTypingSent = useRef(0);

  const [localMessageCount, setLocalMessageCount] = useState(0);

  console.log(profile);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [viewportHeight, setViewportHeight] = useState("100dvh");

  const [messages, setMessages] = useState([]);
  const MAX_MESSAGES = 100;

  const messagesLeft =
    localMessageCount != null
      ? Math.max(MAX_MESSAGES - localMessageCount, 0)
      : null;

  useEffect(() => {
    if (!session?.id) return;

      // If more than an hour left, show HH:MM:SS, else just MM:SS
      const display = hours > 0
        ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      setTimeLeft(display);
    };

  useEffect(() => {
    if (session?.message_count != null) {
      setLocalMessageCount(session.message_count);
    }
  }, [session?.message_count]);

  // --- 3. Supabase Message Loading & Realtime ---
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`messages-${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          const msg = payload.new;

          // ⭐ IMPORTANT: Ignore own messages
          if (msg.sender_id === user.id) return;

          setMessages((prev) => [
            ...prev,
            {
              id: msg.id,
              sender: "other",
              text: payload.new.text
            }]);
          }
        } else if (payload.eventType === "DELETE") {
          // payload.old.id is only available if Replica Identity is FULL
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      })
      // Listen for Session Updates (The Message Count)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "sessions",
        filter: `id=eq.${session.id}`
      }, (payload) => {
        // Sync the local count with the DB (including the reset to 25)
        setLocalMessageCount(payload.new.message_count);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id, user?.id]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!session || !user) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed loading messages:", error);
        setLoadingMessages(false);
        return;
      }

      const formatted = data.map((msg) => ({
        id: msg.id,
        sender: msg.sender_id === user.id ? "me" : "other",
        text: msg.text,
      }));

      setMessages(formatted);
      setLoadingMessages(false);
    };

    loadMessages();
  }, [session?.id]);

  useEffect(() => {
    if (!session || !user) return;

    typingChannelRef.current = supabase.channel(`typing-${session.id}`);
    typingChannelRef.current
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.sender_id !== user.id) {
          setIsTyping(payload.isTyping);
          if (payload.isTyping) setTimeout(() => setIsTyping(false), 3000);
        }
      }).subscribe();
    return () => supabase.removeChannel(typingChannelRef.current);
  }, [session?.id, user?.id]);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || !session) return;
    const textToSend = input;
    const tempId = Date.now();

    const newMessage = {
      session_id: session.id,
      sender_id: user.id,
      text: input,
    };

    // ⭐ Update UI instantly (optimistic update)
    setMessages((prev) => [
      ...prev,
      {
        sender: "me",
        text: input,
      },
    ]);

    setInput("");

    // ⭐ Insert ONLY this message
    const { error } = await supabase.from("messages").insert(newMessage);

    if (error) console.error("Send error:", error);
  };

  if (loadingMessages) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0c111f] overflow-hidden">
        {/* Nebula glow */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] rounded-full opacity-40 blur-[120px]"
            style={{
              background: "radial-gradient(circle, #512f5c 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-1/4 left-[5%] w-[70%] h-[70%] rounded-full opacity-30 blur-[100px] animate-pulse"
            style={{
              background: "radial-gradient(circle, #ed9e6f 0%, transparent 60%)",
              animationDuration: "10s",
            }}
          />
        </div>

        {/* Loader */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-2">
            <span className="w-3 h-3 bg-[#ed9e6f] rounded-full animate-bounce" />
            <span className="w-3 h-3 bg-[#b66570] rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-3 h-3 bg-[#80466e] rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
          <p className="text-[#ed9e6f] font-mono tracking-widest text-xs uppercase animate-pulse">
            ✦ Connecting souls...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full text-white flex flex-col overflow-hidden bg-[#0c111f]">
      {/* 🌌 CSS NEBULA GENERATOR */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#0c111f]" />
        <div
          className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] rounded-full opacity-40 blur-[120px]"
          style={{
            background: "radial-gradient(circle, #512f5c 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-1/4 left-[5%] w-[70%] h-[70%] rounded-full opacity-30 blur-[100px] animate-pulse"
          style={{
            background: "radial-gradient(circle, #ed9e6f 0%, transparent 60%)",
            animationDuration: "10s",
          }}
        />
        <div
          className="absolute top-[20%] -right-1/4 w-[60%] h-[60%] rounded-full opacity-20 blur-[110px]"
          style={{
            background: "radial-gradient(circle, #b66570 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-[30%] left-[20%] w-[50%] h-[50%] rounded-full opacity-25 blur-[130px]"
          style={{
            background: "radial-gradient(circle, #2d1f44 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Header Progress Section */}
      <div className="flex-none bg-[#0c111f]/60 backdrop-blur-xl border-b border-white/10 px-6 py-4 z-20">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-[#ed9e6f] uppercase tracking-widest">
              {user?.id === session?.user_a ? session?.nickname_b : session?.nickname_a}
            </p>
            <p className="text-[10px] text-white/40 uppercase">✦ Anonymous Match</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-mono font-bold text-[#b66570]">{timeLeft}</p>
            <p className="text-[9px] text-white/30 uppercase">Time Remaining</p>
          </div>
          <p className="text-xs text-[#b66570] font-mono">07:42 LEFT</p>
        </div>
      </div>

      {messagesLeft !== null && (
        <p className="text-[10px] text-white/40 tracking-wide mt-1 px-6">
          ✦ {messagesLeft} messages until older whispers fade…
        </p>
      )}

      {/* 💬 Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 w-full scrollbar-hide">
        {messages.map((msg, index) => {
          const isMine = msg.sender === "me";

          return (
            <div
              key={msg.id || index}
              className={`flex ${
                isMine ? "justify-end" : "justify-start"
              } animate-fadeIn`}
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
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 💡 STABLE TYPING INDICATOR CONTAINER */}
        <div className="min-h-[40px] flex items-center">
          <div
            className={`transition-all duration-300 ease-in-out ${
              isTyping ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            }`}
          >
            <div className="px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#80466e] rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-[#80466e] rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-[#80466e] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 pb-8 flex-none bg-[#0c111f]">
        <motion.div layout className="flex gap-2 items-center bg-[#2d1f44]/90 border border-white/10 rounded-full p-1.5 shadow-2xl">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);

              typingChannelRef.current?.send({
                type: "broadcast",
                event: "typing",
                payload: {
                  sender_id: user.id,
                  isTyping: true,
                },
              });
            }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Whisper to the stars..."
            className="flex-1 bg-transparent px-5 py-2 text-sm outline-none placeholder:text-white/20"
          />
          <button
            onClick={sendMessage}
            className="bg-[#ed9e6f] text-[#0c111f] p-2.5 rounded-full active:scale-90 transition-all"
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