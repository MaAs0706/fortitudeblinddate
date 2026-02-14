import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Denied() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleReturnToPool = async () => {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        onboarding_step: "waiting",
        ismatched: false
      })
      .eq("id", user.id);

    if (error) throw error;

    navigate("/waiting", { replace: true });
  } catch (err) {
    console.error("Error returning to pool:", err);
  }
};



    return (
        <div className="h-screen bg-[#0c111f] text-white flex flex-col items-center justify-center px-8 text-center overflow-hidden relative">

            {/* 🌌 Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2d1f44]/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ed9e6f]/5 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-sm z-10"
            >
                {/* 🌑 Icon */}
                <div className="text-6xl mb-8 flex justify-center">
                    <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        🌑
                    </motion.span>
                </div>

                <h1
                    className="text-3xl font-bold text-[#ed9e6f] mb-4"
                    style={{ fontFamily: 'Satisfy, cursive' }}
                >
                    Back to the Shadows
                </h1>

                <p className="text-white/50 text-sm leading-relaxed mb-12">
                    The connection has faded, and your identity remains a secret.
                    Not every star is meant to align forever.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleReturnToPool}
                        className="w-full py-4 bg-[#ed9e6f] text-[#0c111f] font-bold rounded-2xl active:scale-95 transition-all shadow-lg shadow-[#ed9e6f]/10"
                    >
                        ✦ LOOK FOR A NEW MATCH
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white/40 text-xs uppercase tracking-widest rounded-2xl hover:text-white transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </motion.div>

            {/* ✦ Footer Detail */}
            <footer className="absolute bottom-10">
                <p className="text-[10px] text-white/20 uppercase tracking-[0.5em]">
                    ✦ Identity Secured ✦
                </p>
            </footer>
        </div>
    );
}