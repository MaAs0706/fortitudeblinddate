import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Heart, Sparkles, Users, Calendar, ArrowRight } from "lucide-react";

/**
 * Ambient Background Component
 * Creates the drifting hearts/orbs in the background
 */
const AmbientBackground = () => {
  const elements = useMemo(() => 
    Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 40 + 20,
      delay: Math.random() * -20,
      duration: Math.random() * 20 + 25,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {elements.map((el) => (
        <div
          key={el.id}
          className="animate-float-slow absolute opacity-20"
          style={{
            left: el.left,
            top: el.top,
            animationDelay: `${el.delay}s`,
            animationDuration: `${el.duration}s`,
          }}
        >
          {el.id % 2 === 0 ? (
            <Heart 
              size={el.size} 
              className="text-[#f3b6c0] fill-[#f3b6c0]/10 blur-[1px]" 
              strokeWidth={1}
            />
          ) : (
            <div 
              style={{ width: el.size, height: el.size }}
              className="rounded-full bg-[#f3b6c0]/20 blur-[40px]"
            />
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Main Preferences Component
 */
export default function Preferences() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [openTo, setOpenTo] = useState("");
  const [agePreference, setAgePreference] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const [yearPreference, setYearPreference] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isWarping, setIsWarping] = useState(false);

  // Validation
  const isFormValid = openTo && agePreference && genderPreference && yearPreference.length > 0;

  const toggleYear = (value) => {
    setYearPreference((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleContinue = async () => {
    if (!user || saving || !isFormValid) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          opento: openTo,
          age_preference: agePreference,
          gender_preference: genderPreference,
          year_preference: yearPreference,
          onboarding_step: "qna",
        })
        .eq("id", user.id);

      if (error) throw error;

      // Trigger Warp Animation
      setIsWarping(true);

      // Navigate after transition completes
      setTimeout(() => {
        navigate("/qna");
      }, 850);

    } catch (err) {
      console.error("Save error:", err);
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0b0c] overflow-hidden selection:bg-[#f3b6c0]/30">
      
      {/* 1. Warp Speed Overlay */}
      {isWarping && (
        <div className="warp-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="star-line"
              style={{
                '--rotation': `${i * 7.2}deg`,
                animationDelay: `${Math.random() * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 2. Ambient Layer */}
      <AmbientBackground />

      {/* 3. Content Wrapper */}
      <div 
        className={`relative z-10 mx-auto max-w-4xl px-6 py-24 text-white transition-all duration-[800ms] ease-in-out ${
          isWarping ? "scale-50 blur-2xl opacity-0" : "scale-100 blur-0 opacity-100"
        }`}
      >
        {/* Header */}
        <div className="mb-20 text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-[#f3b6c0] mb-4">
            <Sparkles size={12} /> Personalized Matching
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Your preferences
          </h1>
          <p className="text-white/40 text-lg font-light italic font-serif">
            This helps us match you better. Nothing here is public.
          </p>
        </div>

        <div className="space-y-24">
          {/* OPEN TO */}
          <section className="animate-slide-up delay-1">
            <h2 className="text-xl font-medium mb-8 flex items-center gap-3">
              <Heart size={20} className="text-[#f3b6c0]" /> What are you open to?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Dating", "Friendship", "Open"].map((item) => (
                <button
                  key={item}
                  onClick={() => setOpenTo(item)}
                  className={`relative overflow-hidden rounded-3xl border p-8 text-left transition-all duration-500 backdrop-blur-md
                    ${openTo === item
                      ? "border-[#f3b6c0] bg-[#f3b6c0]/15 shadow-[0_0_40px_rgba(243,182,192,0.2)] scale-[1.02]"
                      : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                    }`}
                >
                  <span className={`text-xl font-medium transition-colors ${openTo === item ? "text-[#f3b6c0]" : "text-white/60"}`}>
                    {item}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* GENDER PREFERENCE */}
          <section className="animate-slide-up delay-2">
            <h2 className="text-xl font-medium mb-8 flex items-center gap-3">
              <Users size={20} className="text-[#f3b6c0]" /> Preferred gender
            </h2>
            <div className="flex flex-wrap gap-3">
              {["Male", "Female", "Non-binary", "Open to all"].map((item) => (
                <PillButton 
                  key={item} 
                  label={item} 
                  isSelected={genderPreference === item} 
                  onClick={() => setGenderPreference(item)} 
                />
              ))}
            </div>
          </section>

          {/* AGE PREFERENCE */}
          <section className="animate-slide-up delay-3">
            <h2 className="text-white/50 text-xs uppercase tracking-widest font-bold mb-6 ml-1">Relative Age</h2>
            <div className="flex flex-wrap gap-3">
              {["Older", "Younger", "Any", "Same or Older", "Same or Younger"].map((item) => (
                <PillButton 
                  key={item} 
                  label={item} 
                  isSelected={agePreference === item} 
                  onClick={() => setAgePreference(item)} 
                />
              ))}
            </div>
          </section>

          {/* YEAR PREFERENCE */}
          <section className="animate-slide-up delay-4">
            <h2 className="text-xl font-medium mb-8 flex items-center gap-3">
              <Calendar size={20} className="text-[#f3b6c0]" /> Preferred year
            </h2>
            <div className="flex flex-wrap gap-3">
              {["1st year", "2nd year", "3rd year", "4th year", "Any year"].map((item) => (
                <PillButton 
                  key={item} 
                  label={item} 
                  isSelected={yearPreference.includes(item)} 
                  onClick={() => toggleYear(item)} 
                />
              ))}
            </div>
          </section>

          {/* CONTINUE BUTTON */}
          <div className="text-center pt-10 pb-20 animate-slide-up delay-5">
            <button
              onClick={handleContinue}
              disabled={saving || !isFormValid}
              className={`group relative rounded-full px-16 py-5 font-bold text-lg transition-all duration-500
                ${!isFormValid || saving
                  ? "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed"
                  : "bg-[#f3b6c0] text-black hover:scale-105 hover:shadow-[0_0_50px_rgba(243,182,192,0.4)]"
                }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {saving ? "Syncing..." : "Launch into Questions"}
                {!saving && <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
            {!isFormValid && !saving && (
              <p className="mt-4 text-[10px] uppercase tracking-widest text-[#f3b6c0]/50 font-bold animate-pulse">
                Selection required to proceed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable Pill Button
 */
function PillButton({ label, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-8 py-3 text-sm font-medium transition-all duration-300 border backdrop-blur-sm
        ${isSelected
          ? "bg-[#f3b6c0] text-black border-[#f3b6c0] shadow-[0_0_20px_rgba(243,182,192,0.2)]"
          : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white"
        }`}
    >
      {label}
    </button>
  );
}