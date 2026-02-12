import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";

export default function Match() {
  const { session, loadingSession } = useSession();
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0c111f] text-white p-6 relative overflow-hidden">
      {/* Background Styling (Matching your Chat theme) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#ed9e6f]/20 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 text-center space-y-8 max-w-md">
        <h1 className="text-4xl font-bold tracking-tighter text-[#ed9e6f]">
          {session ? "IT'S A MATCH!" : "SEARCHING..."}
        </h1>

        {loadingSession ? (
          <p className="animate-pulse text-white/50">Consulting the stars...</p>
        ) : session ? (
          <div className="space-y-6 animate-fadeIn">
            <p className="text-lg text-white/80">
              A connection has been formed. Are you ready to whisper to the stars?
            </p>
            <button
              onClick={() => navigate("/chat")}
              className="w-full bg-[#ed9e6f] text-[#0c111f] font-bold py-4 rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              ENTER CHAT
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/40">No connection found yet. Please wait in the shadows...</p>
            <div className="flex justify-center gap-2">
               <span className="w-2 h-2 bg-[#ed9e6f] rounded-full animate-bounce" />
               <span className="w-2 h-2 bg-[#ed9e6f] rounded-full animate-bounce [animation-delay:0.2s]" />
               <span className="w-2 h-2 bg-[#ed9e6f] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}