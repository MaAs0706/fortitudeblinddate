import Navbar from "../components/layout/Navbar";
import { Heart } from "lucide-react";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-reference">
      <Navbar />

      {/* Left ambient spine (desktop only) */}
      <div className="pointer-events-none absolute left-8 top-0 h-full w-px bg-white/10 hidden lg:block" />

      {/* Decorative hearts (desktop only) */}
      <div className="pointer-events-none absolute top-1/2 left-6 hidden -translate-y-1/2 flex-col items-center gap-6 lg:flex xl:left-16">
        <Heart className="heart-lg" />
        <Heart className="heart-sm" />

        <div className="h-24 w-px rose-line" />

        <Heart className="heart-md" />
        <Heart className="heart-xs" />
      </div>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-3xl text-center mt-24 relative z-10">

          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 rounded-full border border-white/15 text-sm text-white/70">
            💬 Where real connections begin
          </div>

          {/* Headline */}
          <h1 className="text-[2.2rem] leading-tight sm:text-4xl md:text-6xl font-semibold mb-6 font-[Playfair Display]">
            Love Starts with a{" "}
            <span className="text-[#D8A7B1]">Conversation</span>
          </h1>

          {/* Subtext */}
          <p className="text-white/70 text-base sm:text-lg mb-10 px-2 sm:px-0">
            No photos. No superficial judgments.
            <br />
            Just two people talking — and seeing where it goes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#D8A7B1] text-black font-semibold px-8 py-4 sm:py-3 rounded-full hover:scale-[1.04] hover:shadow-xl hover:shadow-[#D8A7B1]/30 transition-all duration-300">
              Start a Blind Date →
            </button>

            <button className="border border-white/20 text-white px-8 py-4 sm:py-3 rounded-full hover:bg-white/5 hover:scale-[1.02] transition-all duration-300">
              See How It Works
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}
