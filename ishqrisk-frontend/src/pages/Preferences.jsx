import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Preferences() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [openTo, setOpenTo] = useState("");
  const [agePreference, setAgePreference] = useState("");
  const [genderPreference, setGenderPreference] = useState(""); // ⭐ NEW
  const [yearPreference, setYearPreference] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggle = (value) => {
    setYearPreference((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  // ⭐ SAVE TO DB
  const handleContinue = async () => {
    if (!user || saving) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          opento: openTo,
          age_preference: agePreference,
          gender_preference: genderPreference, // ⭐ ADDED
          year_preference: yearPreference,
          onboarding_step: "qna",
        })
        .eq("id", user.id);

      if (error) {
        console.error(error);
        setSaving(false);
        return; // ⛔ stop navigation if save failed
      }
      navigate("/qna")

    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-24 text-white">

      {/* ===== BACKGROUND ===== */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1000px 500px at 50% -10%, rgba(243,182,192,0.22), transparent 60%), linear-gradient(180deg, #0b0b0c 0%, #070707 100%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[20%] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#f3b6c0]/12 blur-[220px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[380px] w-[380px] rounded-full bg-[#d8a0aa]/10 blur-[200px]" />
      </div>

      <div className="mx-auto max-w-3xl animate-fade-in">

        {/* TITLE */}
        <div className="mb-20 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            Your preferences
          </h1>
          <p className="text-white/60">
            This helps us match you better. Nothing here is public.
          </p>
        </div>

        {/* ===== OPEN TO ===== */}
        <section className="mb-24">
          <h2 className="mb-6 text-lg font-medium">What are you open to?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Dating", "Friendship", "Open"].map((item) => (
              <button
                key={item}
                onClick={() => setOpenTo(item)}
                className={`rounded-2xl border px-6 py-6 text-left transition-all duration-300
                  ${openTo === item
                    ? "border-[#f3b6c0] bg-[#f3b6c0]/15 shadow-lg shadow-[#f3b6c0]/30"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                  }
                  hover:-translate-y-1`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* ===== AGE PREFERENCE ===== */}
        <section className="mb-24">
          <h2 className="mb-6 text-lg font-medium">Age preference</h2>

          <div className="flex flex-wrap gap-3">
            {["older", "younger", "any", "same or older", "same or younger"].map((item) => (
              <button
                key={item}
                onClick={() => setAgePreference(item)}
                className={`rounded-full px-5 py-2 text-sm transition-all duration-200
                  ${agePreference === item
                    ? "bg-[#f3b6c0]/25 text-[#f3b6c0] shadow shadow-[#f3b6c0]/30"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* ===== GENDER PREFERENCE ⭐ NEW ===== */}
        <section className="mb-24">
          <h2 className="mb-6 text-lg font-medium">
            Preferred gender
          </h2>

          <div className="flex flex-wrap gap-3">
            {["Male", "Female", "Non-binary", "Open to all"].map((item) => (
              <button
                key={item}
                onClick={() => setGenderPreference(item)}
                className={`rounded-full px-5 py-2 text-sm transition-all duration-200
                  ${genderPreference === item
                    ? "bg-[#f3b6c0]/25 text-[#f3b6c0] shadow shadow-[#f3b6c0]/30"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* ===== YEAR PREFERENCE ===== */}
        <section className="mb-28">
          <h2 className="mb-6 text-lg font-medium">
            Preferred year / class
          </h2>

          <div className="flex flex-wrap gap-3">
            {[
              "1st year",
              "2nd year",
              "3rd year",
              "4th year",
              "Any year",
            ].map((item) => (
              <button
                key={item}
                onClick={() => toggle(item)}
                className={`rounded-full px-5 py-2 text-sm transition-all duration-200
                  ${yearPreference.includes(item)
                    ? "bg-[#f3b6c0]/25 text-[#f3b6c0] shadow shadow-[#f3b6c0]/30"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* ===== CONTINUE BUTTON ===== */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={saving}
            className={`rounded-full px-12 py-3 font-semibold text-black transition-all duration-300
              ${saving
                ? "bg-[#f3b6c0]/60 cursor-not-allowed"
                : "bg-[#f3b6c0] hover:scale-105 hover:shadow-xl hover:shadow-[#f3b6c0]/40"
              }`}
          >
            {saving ? "Saving..." : "Continue →"}
          </button>
        </div>

      </div>
    </div>
  );
}
