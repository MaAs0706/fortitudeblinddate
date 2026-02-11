import { useState, useMemo } from "react";
import { Heart, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase"; // Assuming you have this
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    question: "If your personality had a warning label, it would say:",
    options: ["Overthinks everything", "Emotionally soft, acts cool", "Random chaos", "Too honest", "Gets attached to good vibes"],
  },
  {
    question: "Be honest. You fall for someone when they:",
    options: ["Match your intellect", "Make you laugh effortlessly", "Make you feel safe", "Challenge you", "Grow with you"],
  },
  {
    question: "Someone eats the last slice of your food without asking. You:",
    options: ["Remember this forever", "Laugh but judge internally", "Say nothing, feel everything", "Don’t care, food is food", "Start a fake argument"],
  },
  {
    question: "When you're emotionally drained, you prefer:",
    options: ["Being alone", "Being around your people", "Music + silence", "Talking it out", "Sleeping it off"],
  },
  {
    question: "Your idea of flirting is mostly:",
    options: ["Subtle teasing", "Deep conversations", "Dumb jokes", "Eye contact and silence", "Texting something risky"],
  },
  {
    question: "What scares you more?",
    options: ["Being misunderstood", "Losing your freedom", "Wasting time", "Getting too attached", "Ending up alone"],
  },
  {
    question: "Pick a very serious life philosophy:",
    options: ["It is what it is", "Everything happens for a reason", "Nothing matters, have fun", "Feel deeply, live fully", "Peace over everything"],
  },
  {
    question: "You feel closest to someone when:",
    options: ["You talk about real stuff", "You laugh till it hurts", "Silence feels comfortable", "You build something together", "You share late-night thoughts"],
  },
  {
    question: "Your red flag (self-aware version):",
    options: ["I overthink", "I shut down emotionally", "I avoid confrontation", "I feel things intensely", "I disappear when overwhelmed"],
  },
  {
    question: "Dating you would feel like:",
    options: ["Safe and grounding", "Fun and unpredictable", "Emotionally deep", "Motivating", "Light but meaningful"],
  },
];

export default function Questionnaire() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isTurning, setIsTurning] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [answers, setAnswers] = useState([]);

  const isLastQuestion = step === questions.length - 1;
  const current = questions[step];

  const handleNext = () => {
    if (selectedOption === null || isTurning) return;

    setIsTurning(true);
    const newAnswer = { 
      question: current.question, 
      answer: current.options[selectedOption] 
    };

    setTimeout(() => {
      setAnswers(prev => [...prev, newAnswer]);
      setStep(prev => prev + 1);
      setSelectedOption(null);
      setIsTurning(false);
    }, 700);
  };

  const handleFinalSubmit = async () => {
    setIsWarping(true); // Trigger Petal Bloom
    
    try {
        const { error } = await supabase
          .from("users")
          .update({ 
            qna_responses: answers,
            onboarding_step: "waiting" 
          })
          .eq("id", user.id);

        if (error) throw error;
        
        setTimeout(() => {
            navigate("/waiting-room");
        }, 1200);
    } catch (err) {
        console.error(err);
        setIsWarping(false);
    }
  };

  const ambientIcons = useMemo(() => 
    Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 95}%`,
      top: `${Math.random() * 95}%`,
      delay: `${Math.random() * -8}s`,
      size: Math.random() * 25 + 15,
      type: i % 2 === 0 ? 'heart' : 'sparkle'
    })), []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 text-white overflow-hidden bg-[#0b0b0c]">
      
      {/* Bloom Transition Overlay */}
      {isWarping && (
        <div className="bloom-container">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="bloom-petal"
              style={{
                '--rev': `${i * 9}deg`,
                width: `${Math.random() * 15 + 10}px`,
                height: `${Math.random() * 15 + 10}px`,
                animationDelay: `${Math.random() * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Ambient Deco */}
      {ambientIcons.map((icon) => (
        <div 
          key={icon.id}
          className="absolute animate-float-ethereal ambient-glow pointer-events-none text-[#f3b6c0]"
          style={{ left: icon.left, top: icon.top, animationDelay: icon.delay }}
        >
          {icon.type === 'heart' ? <Heart size={icon.size} fill="currentColor" fillOpacity={0.2} /> : <Sparkles size={icon.size} />}
        </div>
      ))}

      <div className="w-full max-w-2xl perspective-container">
        {step < questions.length ? (
          <div className={`transition-all duration-700 ${isTurning ? "page-exit" : "page-enter-active"}`}>
            
            {/* QUESTION NUMBER */}
            <div className="mb-6 flex items-center gap-4">
                <span className="text-[#f3b6c0] font-serif italic text-2xl">0{step + 1}</span>
                <div className="h-[1px] w-12 bg-[#f3b6c0]/30" />
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Questionnaire</span>
            </div>

            <h2 className="mb-12 text-3xl md:text-4xl font-bold leading-tight min-h-[120px]">
              {current.question}
            </h2>

            <div className="flex flex-col gap-4 mb-12">
              {current.options.map((option, idx) => (
                <button
                  key={option}
                  onClick={() => setSelectedOption(idx)}
                  className={`group relative rounded-2xl border px-8 py-5 text-left transition-all duration-500
                    ${selectedOption === idx 
                      ? "border-[#f3b6c0] bg-[#f3b6c0]/10 text-[#f3b6c0] translate-x-2" 
                      : "border-white/5 bg-white/[0.02] text-white/50 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">{option}</span>
                    <div className={`h-5 w-5 rounded-full border-2 transition-all duration-500
                      ${selectedOption === idx ? "border-[#f3b6c0] bg-[#f3b6c0]" : "border-white/10"}`} 
                    />
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={selectedOption === null || isTurning}
                className={`flex items-center gap-3 px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-500
                  ${selectedOption === null 
                    ? "bg-white/5 text-white/10" 
                    : "bg-[#f3b6c0] text-black hover:shadow-[0_0_30px_rgba(243,182,192,0.4)]"}`}
              >
                {isLastQuestion ? "Finish" : "Next"} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="inline-block p-4 rounded-full bg-[#f3b6c0]/10 text-[#f3b6c0] mb-2">
              <CheckCircle2 size={50} strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-bold tracking-tight">Vibe Captured.</h2>
            <p className="text-white/40 text-lg max-w-xs mx-auto mb-10">
              Your profile is now being woven into our universe.
            </p>

            <button 
              onClick={handleFinalSubmit}
              className="px-12 py-4 rounded-full bg-[#f3b6c0] text-black font-bold text-sm uppercase tracking-widest transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(243,182,192,0.5)]"
            >
              Enter Waiting Area →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}