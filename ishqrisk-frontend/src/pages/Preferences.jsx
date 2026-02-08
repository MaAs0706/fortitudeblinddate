import { useState } from "react";

export default function Preferences() {
  const [matchType, setMatchType] = useState("");
  const [ageRange, setAgeRange] = useState([18, 22]);
  const [preferredGender, setPreferredGender] = useState([]);
  const [preferredYear, setPreferredYear] = useState([]);

  const toggle = (value, setter, state) => {
    setter(
      state.includes(value)
        ? state.filter((v) => v !== value)
        : [...state, value]
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-24 text-white">

      {/* ===== CINEMATIC BACKGROUND ===== */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1000px 500px at 50% -10%, rgba(243,182,192,0.22), transparent 60%), linear-gradient(180deg, #0b0b0c 0%, #070707 100%)",
        }}
      />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[20%] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#f3b6c0]/12 blur-[220px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[380px] w-[380px] rounded-full bg-[#d8a0aa]/10 blur-[200px]" />
      </div>

      {/* ===== CONTENT ===== */}
      <div className="mx-auto max-w-3xl animate-fade-in">

        {/* Title */}
        <div className="mb-20 text-center animate-slide-up delay-1">
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            Your preferences
          </h1>
          <p className="text-white/60">
            This helps us match you better. Nothing here is public.
          </p>
        </div>

        {/* Match Type */}
        <section className="mb-24 animate-slide-up delay-2">
          <h2 className="mb-6 text-lg font-medium">
            What are you here for?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Friendship", "Dating", "Open to either"].map((item) => (
              <button
                key={item}
                onClick={() => setMatchType(item)}
                className={`rounded-2xl border px-6 py-6 text-left transition-all duration-300
                  ${
                    matchType === item
                      ? "border-[#f3b6c0] bg-[#f3b6c0]/15 shadow-lg shadow-[#f3b6c0]/30"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }
                  hover:-translate-y-1
                `}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Age Range */}
        <section className="mb-24 animate-slide-up delay-3">
          <h2 className="mb-4 text-lg font-medium">
            Preferred age range
          </h2>

          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex justify-between text-sm mb-4 text-white/70">
              <span>{ageRange[0]}</span>
              <span>{ageRange[1]}</span>
            </div>

            <input
              type="range"
              min="18"
              max="30"
              value={ageRange[0]}
              onChange={(e) =>
                setAgeRange([+e.target.value, ageRange[1]])
              }
              className="w-full accent-[#f3b6c0]"
            />
            <input
              type="range"
              min="18"
              max="30"
              value={ageRange[1]}
              onChange={(e) =>
                setAgeRange([ageRange[0], +e.target.value])
              }
              className="w-full mt-3 accent-[#f3b6c0]"
            />
          </div>
        </section>

        {/* Preferred Gender */}
        <section className="mb-24 animate-slide-up delay-4">
          <h2 className="mb-6 text-lg font-medium">
            Preferred gender
          </h2>

          <div className="flex flex-wrap gap-3">
            {["Male", "Female", "Non-binary", "Open to all"].map((item) => (
              <button
                key={item}
                onClick={() =>
                  toggle(item, setPreferredGender, preferredGender)
                }
                className={`rounded-full px-5 py-2 text-sm transition-all duration-200
                  ${
                    preferredGender.includes(item)
                      ? "bg-[#f3b6c0]/25 text-[#f3b6c0] shadow shadow-[#f3b6c0]/30"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }
                  active:scale-95
                `}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Preferred Year */}
        <section className="mb-28 animate-slide-up delay-5">
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
                onClick={() =>
                  toggle(item, setPreferredYear, preferredYear)
                }
                className={`rounded-full px-5 py-2 text-sm transition-all duration-200
                  ${
                    preferredYear.includes(item)
                      ? "bg-[#f3b6c0]/25 text-[#f3b6c0] shadow shadow-[#f3b6c0]/30"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }
                  active:scale-95
                `}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Continue */}
        <div className="text-center animate-slide-up delay-6">
          <button className="rounded-full bg-[#f3b6c0] px-12 py-3 font-semibold text-black transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#f3b6c0]/40 breathe">
            Continue →
          </button>
        </div>

      </div>
    </div>
  );
}
