import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const questions = [
    {
        question: "If your personality had a warning label, it would say:",
        options: [
            "Overthinks everything",
            "Emotionally soft, acts cool",
            "Random chaos",
            "Too honest",
            "Gets attached to good vibes",
        ],
    },
    {
        question: "Be honest. You fall for someone when they:",
        options: [
            "Match your intellect",
            "Make you laugh effortlessly",
            "Make you feel safe",
            "Challenge you",
            "Grow with you",
        ],
    },
    {
        question: "Someone eats the last slice of your food without asking. You:",
        options: [
            "Remember this forever",
            "Laugh but judge internally",
            "Say nothing, feel everything",
            "Don’t care, food is food",
            "Start a fake argument",
        ],
    },
    {
        question: "When you're emotionally drained, you prefer:",
        options: [
            "Being alone",
            "Being around your people",
            "Music + silence",
            "Talking it out",
            "Sleeping it off",
        ],
    },
    {
        question: "Your idea of flirting is mostly:",
        options: [
            "Subtle teasing",
            "Deep conversations",
            "Dumb jokes",
            "Eye contact and silence",
            "Texting something risky",
        ],
    },
    {
        question: "What scares you more?",
        options: [
            "Being misunderstood",
            "Losing your freedom",
            "Wasting time",
            "Getting too attached",
            "Ending up alone",
        ],
    },
    {
        question: "Pick a very serious life philosophy:",
        options: [
            "It is what it is",
            "Everything happens for a reason",
            "Nothing matters, have fun",
            "Feel deeply, live fully",
            "Peace over everything",
        ],
    },
    {
        question: "You feel closest to someone when:",
        options: [
            "You talk about real stuff",
            "You laugh till it hurts",
            "Silence feels comfortable",
            "You build something together",
            "You share late-night thoughts",
        ],
    },
    {
        question: "Your red flag (self-aware version):",
        options: [
            "I overthink",
            "I shut down emotionally",
            "I avoid confrontation",
            "I feel things intensely",
            "I disappear when overwhelmed",
        ],
    },
    {
        question: "Dating you would feel like:",
        options: [
            "Safe and grounding",
            "Fun and unpredictable",
            "Emotionally deep",
            "Motivating",
            "Light but meaningful",
        ],
    },
];

export default function Questionnaire() {
    const { user } = useAuth();

    const [step, setStep] = useState(0);
    const [isTurning, setIsTurning] = useState(false);
    const [answers, setAnswers] = useState({});
    const [saving, setSaving] = useState(false);

    const current = questions[step];

    // ⭐ Convert option index → A/B/C/D/E
    const getLetter = (index) =>
        ["A", "B", "C", "D", "E"][index];

    const handleSelect = async (optionIndex) => {
        const newAnswers = {
            ...answers,
            [step + 1]: getLetter(optionIndex),
        };

        setAnswers(newAnswers);
        setIsTurning(true);

        setTimeout(async () => {
            // ⭐ LAST QUESTION → SAVE TO DB
            if (step + 1 === questions.length) {
                setSaving(true);

                try {
                    // ⭐ FINAL SAVE
                    const formattedAnswers = Object.fromEntries(
                        Object.entries(newAnswers).map(([k, v]) => [String(k), v])
                    );

                    await supabase
                        .from("users")
                        .update({
                            interests: JSON.stringify(formattedAnswers),
                            approved: true,
                            onboarding_step: "waiting",
                        })
                        .eq("id", user.id);
                } catch (err) {
                    console.error(err);
                } finally {
                    setSaving(false);
                }
            }

            setStep((prev) => prev + 1);
            setIsTurning(false);
        }, 500);
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-6 text-white overflow-hidden">

            {/* ===== CINEMATIC BACKGROUND ===== */}
            <div
                className="absolute inset-0 -z-10"
                style={{
                    background:
                        "radial-gradient(900px 450px at 50% -10%, rgba(243,182,192,0.22), transparent 60%), linear-gradient(180deg, #0b0b0c 0%, #070707 100%)",
                }}
            />

            <div className="w-full max-w-2xl perspective">

                {step < questions.length ? (
                    <div className={`page ${isTurning ? "page-turn" : "page-enter"}`}>

                        {/* ⭐ QUESTION NUMBER */}
                        <h2 className="mb-12 text-2xl md:text-3xl font-medium leading-snug">
                            <span className="text-[#f3b6c0] mr-3">
                                Q{step + 1}.
                            </span>
                            {current.question}
                        </h2>

                        {/* ⭐ OPTIONS */}
                        <div className="flex flex-col gap-4">
                            {current.options.map((option, i) => (
                                <button
                                    key={option}
                                    onClick={() => handleSelect(i)}
                                    className="
                    rounded-2xl border border-white/10 bg-white/5
                    px-6 py-4 text-left text-white/80
                    transition-all duration-200
                    hover:bg-white/10 hover:-translate-y-1
                    active:scale-[0.97]
                    flex items-center gap-4
                  "
                                >
                                    {/* OPTION LETTER */}
                                    <span className="
                    h-8 w-8 flex items-center justify-center
                    rounded-full bg-[#f3b6c0]/20 text-[#f3b6c0]
                    font-semibold text-sm
                  ">
                                        {getLetter(i)}
                                    </span>

                                    {/* OPTION TEXT */}
                                    <span>{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="page page-enter text-center">
                        <h2 className="text-3xl font-medium mb-4">
                            You’re all set ✨
                        </h2>

                        <p className="text-white/60 mb-10">
                            {saving
                                ? "Saving your vibe..."
                                : "We’re finding someone who matches your vibe."}
                        </p>

                        <button className="rounded-full bg-[#f3b6c0] px-12 py-3 font-semibold text-black breathe">
                            Continue →
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
