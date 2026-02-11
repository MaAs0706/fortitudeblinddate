import React, { useMemo } from "react";
import Navbar from "../components/layout/Navbar";
import { Heart } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Landing() {
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/basic`
      }
    });
  };

  // Increased count and added blur/opacity variations
  const backgroundHearts = useMemo(() => 
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 30 + 12, // Larger range
      delay: Math.random() * 10,
      duration: Math.random() * 10 + 15, // Slightly faster to be noticed
      blur: Math.random() > 0.5 ? "blur(1px)" : "blur(0px)",
    })), []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-reference selection:bg-[#D8A7B1]/30">
      <Navbar />

      {/* --- AMBIENT FLOATING HEARTS LAYER --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {backgroundHearts.map((h) => (
          <div
            key={h.id}
            className="animate-float-slow absolute bottom-[-10%] opacity-0"
            style={{
              left: h.left,
              animationDelay: `${h.delay}s`,
              animationDuration: `${h.duration}s`,
              filter: h.blur,
            }}
          >
            {/* Added a drop-shadow glow to make them pop against the dark bg */}
            <Heart 
              size={h.size} 
              strokeWidth={1.5} 
              className="text-[#D8A7B1] fill-[#D8A7B1]/20 drop-shadow-[0_0_8px_rgba(216,167,177,0.8)]" 
            />
          </div>
        ))}
      </div>

      {/* Decorative grain/noise overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-screen" />

      {/* Hero Content */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-[#D8A7B1]/30 bg-[#D8A7B1]/5 text-sm font-medium text-[#D8A7B1] backdrop-blur-md animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#D8A7B1] animate-ping" />
            A quieter way to meet someone
          </div>

          <h1 className="text-6xl md:text-8xl font-medium mb-8 tracking-tight leading-[1.1] animate-slide-up">
            Love begins with a <br />
            <span className="italic font-serif text-[#D8A7B1] drop-shadow-sm">conversation</span>
          </h1>

          <p className="max-w-xl mx-auto text-white/70 text-lg md:text-2xl mb-12 leading-relaxed font-light animate-slide-up delay-1">
            No photos. No pressure. <br />
            Just two people talking.
          </p>

          <div className="animate-slide-up delay-2">
            <button
              onClick={signIn}
              className="group relative bg-[#D8A7B1] text-black font-bold px-12 py-6 rounded-full overflow-hidden transition-all duration-500 hover:scale-110 hover:shadow-[0_0_50px_rgba(216,167,177,0.5)]"
            >
              <span className="relative z-10 flex items-center gap-3 text-lg">
                Start a conversation 
                <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}