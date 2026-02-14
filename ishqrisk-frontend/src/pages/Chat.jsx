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
  const scrollRef = useRef(null);
  const typingChannelRef = useRef(null);
  const lastTypingSent = useRef(0);

  const [decisionMade, setDecisionMade] = useState(false);


  // States
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [viewportHeight, setViewportHeight] = useState("100dvh");
  const [isExpired, setIsExpired] = useState(false);
  const [instagramId, setInstagramId] = useState("");

  // Timer & Stats States
  const [timeLeft, setTimeLeft] = useState("--:--");
  const [localMessageCount, setLocalMessageCount] = useState(session?.message_count || 0);
  const MAX_MESSAGES = 100;




  const handleRevealDecision = async (choiceType) => {
    if (decisionMade) return; // ⭐ block multiple clicks

    const isUserA = user.id === session.user_a;

    const myChoice = isUserA
      ? session.reveal_a
      : session.reveal_b;

    // ⭐ already answered → do nothing
    if (myChoice !== null) {
      navigate("/reveal", { state: { session } });
      return;
    }

    setDecisionMade(true);
    // ⭐ Save Instagram if provided
    if (instagramId && instagramId.trim().length > 0) {
      await supabase
        .from("users")
        .update({ instagram_id: instagramId.trim() })
        .eq("id", user.id);
    }


    const updates = isUserA
      ? {
        reveal_a: choiceType !== "deny",
        phone_reveal_a: choiceType === "full",
      }
      : {
        reveal_b: choiceType !== "deny",
        phone_reveal_b: choiceType === "full",
      };

    const { data, error } = await supabase
      .from("sessions")
      .update(updates)
      .eq("id", session.id)
      .select();

    console.log("Reveal update:", data, error);


    if (error) {
      setDecisionMade(false);
      return;
    }

    // ⭐ DO NOT NAVIGATE HERE
    // realtime listener will handle navigation
  };

  // --- 1. Viewport Height Fix (Keyboard Smoothing) ---
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) setViewportHeight(`${window.visualViewport.height}px`);
    };
    window.visualViewport?.addEventListener("resize", handleResize);
    handleResize();
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  // --- 2. Live Countdown Logic (Synchronized to end_time) ---
  useEffect(() => {
    if (!session?.end_time) return;

    const calculateTime = () => {
      if (!session?.end_time) return;

      // 1. Get the DB time (UTC)
      const dbDate = new Date(session.end_time);

      // 2. Get the Current Time in IST specifically
      // We use Date.now() + offset to ensure we are comparing apples to apples
      const now = new Date();
      const adjustedEndTime = dbDate.getTime()
      // Convert both to a common "Absolute" time

      const nowMs = now.getTime();

      const diff = adjustedEndTime - nowMs;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setIsExpired(true);
        return;
      }

      // Formatting logic remains the same
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const display = hours > 0
        ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      setTimeLeft(display);
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime(); // Run immediately on mount

    return () => clearInterval(timer);
  }, [session?.end_time]);

  // --- 3. Supabase Message Loading & Realtime ---
  useEffect(() => {


    if (!session?.id || !user?.id) return;

    const loadData = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true });

      if (data) setMessages(data.map(m => ({
        id: m.id,
        sender: m.sender_id === user.id ? "me" : "other",
        text: m.text
      })));
      setLoadingMessages(false);
    };
    loadData();

    // Create one channel for the session
    const channel = supabase.channel(`session-${session.id}`)
      // Listen for ALL message changes (INSERT and DELETE)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `session_id=eq.${session.id}`
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          if (payload.new.sender_id !== user.id) {
            setMessages(prev => [...prev, {
              id: payload.new.id,
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
        console.log("Session update received:", payload.new);

        const updated = payload.new;

        setLocalMessageCount(updated.message_count);

        const isUserA = user.id === updated.user_a;

        const myChoice = isUserA
          ? updated.reveal_a
          : updated.reveal_b;

        const bothAgreed =
          updated.reveal_a === true &&
          updated.reveal_b === true;

        const anyoneDenied =
          updated.reveal_a === false ||
          updated.reveal_b === false;

        // ⭐ realtime navigation control
        if (anyoneDenied) {
          navigate("/denied");
          return;
        }

        if (myChoice !== null) {
          navigate("/reveal", { state: { session: updated } });
          return;
        }


        // ⭐ If I already answered → go waiting screen
        if (isExpired && myChoice !== null) {
          navigate("/reveal", { state: { session: updated } });
        }
      }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id, user?.id]);
  // --- 4. Typing Broadcast Indicator ---
  useEffect(() => {
    if (!session?.id) return;
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // --- 5. Action Handlers ---
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    const now = Date.now();
    // Throttle typing events to once every 2 seconds to avoid REST fallback
    if (typingChannelRef.current?.state === 'joined' && now - lastTypingSent.current > 2000) {
      typingChannelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { sender_id: user.id, isTyping: true },
      });
      lastTypingSent.current = now;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !session) return;
    const textToSend = input;
    const tempId = Date.now();

    // Optimistic Update
    setMessages(prev => [...prev, { id: tempId, sender: "me", text: textToSend }]);
    setInput("");

    const { error } = await supabase
      .from("messages")
      .insert([{ session_id: session.id, sender_id: user.id, text: textToSend }]);

    if (error) console.error("Send error:", error);
  };
  const isUserA = user?.id === session?.user_a;
  const myRevealChoice = isUserA
    ? session?.reveal_a
    : session?.reveal_b;


  useEffect(() => {
    if (!session || !user) return;

    const isUserA = user.id === session.user_a;

    const myChoice = isUserA
      ? session.reveal_a
      : session.reveal_b;

    const bothAgreed =
      session.reveal_a === true &&
      session.reveal_b === true;

    const anyoneDenied =
      session.reveal_a === false ||
      session.reveal_b === false;

    if (anyoneDenied) {
      navigate("/denied", { replace: true });
      return;
    }

    if (bothAgreed || myChoice !== null) {
      navigate("/reveal", { state: { session }, replace: true });
    }
  }, [
    session?.reveal_a,
    session?.reveal_b,
    session?.id,
    user?.id
  ]);


  if (loadingMessages) return <div className="h-screen bg-[#0c111f] flex items-center justify-center text-[#ed9e6f]">✦ Initializing...</div>;



  return (
    <div className="relative w-full text-white flex flex-col overflow-hidden bg-[#0c111f]" style={{ height: viewportHeight }}>
      {/* Header */}


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
        </div>

        {/* 📊 Message Count Progress Bar */}
        <div className="mt-3 w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
          <motion.div
            animate={{
              width: `${(localMessageCount / MAX_MESSAGES) * 100}%`,
              backgroundColor: localMessageCount > 90 ? "#ef4444" : "#ed9e6f"
            }}
            className="h-full"
          />
        </div>

        <div className="flex justify-between mt-1">
          <p className={`text-[8px] uppercase tracking-widest ${localMessageCount > 90 ? "text-red-500 animate-pulse" : "text-white/20"}`}>
            {localMessageCount} / {MAX_MESSAGES} Whispers
          </p>
          {localMessageCount >= 100 && (
            <p className="text-[8px] text-[#ed9e6f] uppercase animate-bounce">Fading oldest whispers...</p>
          )}
        </div>
      </div>

      {/* Messages */}
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
        {/* Messages List */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[15px] shadow-xl ${msg.sender === "me"
                ? "bg-[#ed9e6f] text-[#0c111f] rounded-tr-none"
                : "bg-[#2d1f44]/80 border border-white/10 text-white rounded-tl-none"
                }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Smoother Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start"
            >
              <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 flex gap-1.5 items-center">
                {[0, 0.2, 0.4].map((delay) => (
                  <motion.span
                    key={delay}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: delay,
                      ease: "easeInOut"
                    }}
                    className="w-1.5 h-1.5 bg-[#ed9e6f] rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      {/* --- Modified Input Area --- */}
      <div className="p-4 pb-8 flex-none bg-[#0c111f]">
        <motion.div
          layout
          className={`flex gap-2 items-center bg-[#2d1f44]/90 border border-white/10 rounded-full p-1.5 shadow-2xl ${isExpired ? "opacity-50 pointer-events-none" : ""}`}
        >
          <input
            disabled={isExpired} // ⭐ Block typing when time is up
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && !isExpired && sendMessage()}
            placeholder={isExpired ? "The stars have faded..." : "Whisper to the stars..."}
            className="flex-1 bg-transparent px-5 py-2 text-sm outline-none placeholder:text-white/20"
          />
          <button
            disabled={isExpired}
            onClick={sendMessage}
            className="bg-[#ed9e6f] text-[#0c111f] p-2.5 rounded-full active:scale-90 transition-all disabled:grayscale"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </motion.div>
      </div>
      <AnimatePresence>
        {isExpired && myRevealChoice === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0c111f]/95 backdrop-blur-2xl px-6 text-center"
          >
            <div className="max-w-xs">
              <h2 className="text-2xl text-[#ed9e6f] font-bold mb-4" style={{ fontFamily: "Satisfy, cursive" }}>
                A Final Choice
              </h2>
              <p className="text-white/60 text-sm mb-10 leading-relaxed">
                Your time in the shadows is over. Will you reveal your true self?
              </p>

              <div className="flex flex-col gap-4">
                {/* ⭐ Instagram Optional Field */}
                <input
                  type="text"
                  onChange={(e) => setInstagramId(e.target.value.replace("@", ""))}
                  placeholder="Instagram ID without @ (optional)"
                  className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-4 rounded-2xl outline-none placeholder:text-white/30"
                />
                <button
                  onClick={() => handleRevealDecision('full')}
                  className="w-full bg-[#ed9e6f] text-[#0c111f] font-bold py-4 rounded-2xl active:scale-95 transition-all"
                >
                  ✦ REVEAL WITH PHONE NUMBER
                </button>
                <button
                  onClick={() => handleRevealDecision('name')}
                  className="w-full bg-white/10 border border-white/20 text-[#ed9e6f] font-bold py-4 rounded-2xl active:scale-95 transition-all"
                >
                  ✦ REVEAL NAME ONLY
                </button>



                <button
                  onClick={() => handleRevealDecision('deny')}
                  className="w-full bg-white/5 border border-white/10 text-white/40 py-4 rounded-2xl active:scale-95 transition-all"
                >
                  STAY ANONYMOUS & EXIT
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}