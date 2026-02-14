import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { onInstallStateChange, promptInstall } from "../../public/pws";

export default function Waiting() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Possible values: "waiting" | "no_match" | "matched"
  const [status, setStatus] = useState("waiting");

  // --- PWA State ---
  const [installState, setInstallState] = useState({
    canInstall: false,
    isStandalone: false
  });

  useEffect(() => {
    // Listen for the browser's install availability
    const unsubscribe = onInstallStateChange((state) => {
      setInstallState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result.outcome === "accepted") {
      console.log("PWA Installed from Waiting area");
    }
  };

  const handleChat = () => {
    navigate("/chat");
  };

  /* ---------------- SNOW SYSTEM (ONLY WHILE WAITING) ---------------- */
  useEffect(() => {
    if (status !== "waiting") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const snowflakes = [];
    const BASE_SNOW = 220;
    const MAX_SNOW = 380;

    let wind = 0;
    let windTarget = 0;
    let surge = 0;
    let surgeTarget = 0;
    let surgeTimer = 0;

    const SLOW_ZONE = {
      x: width * 0.25,
      y: height * 0.35,
      w: width * 0.5,
      h: 200,
    };

    const rand = (min, max) => Math.random() * (max - min) + min;

    function createSnowflake() {
      return {
        x: rand(0, width),
        y: rand(-height, 0),
        r: rand(0.7, 2.2),
        speed: rand(0.6, 1.6),
        drift: rand(-0.3, 0.3),
        opacity: rand(0.35, 0.9),
      };
    }

    for (let i = 0; i < BASE_SNOW; i++) snowflakes.push(createSnowflake());

    function inSlowZone(f) {
      return (
        f.x > SLOW_ZONE.x &&
        f.x < SLOW_ZONE.x + SLOW_ZONE.w &&
        f.y > SLOW_ZONE.y &&
        f.y < SLOW_ZONE.y + SLOW_ZONE.h
      );
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      surgeTimer++;
      if (surgeTimer > rand(1500, 2600)) {
        surgeTarget = 1;
        surgeTimer = 0;
      }
      if (surge > 0.95) surgeTarget = 0;
      surge += (surgeTarget - surge) * 0.002;

      windTarget = surge * rand(-0.6, 0.6);
      wind += (windTarget - wind) * 0.01;

      const desiredCount =
        BASE_SNOW + Math.floor((MAX_SNOW - BASE_SNOW) * surge);

      while (snowflakes.length < desiredCount)
        snowflakes.push(createSnowflake());
      while (snowflakes.length > desiredCount) snowflakes.pop();

      for (const f of snowflakes) {
        const slowFactor = inSlowZone(f) ? 0.35 : 1;
        const speedBoost = 1 + surge * 0.6;

        f.y += f.speed * speedBoost * slowFactor;
        f.x += (f.drift + wind) * slowFactor;

        if (f.y > height) {
          f.y = -10;
          f.x = rand(0, width);
        }

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    animate();
  }, [status]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {status === "waiting" && (
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      )}

      {/* --- PWA Install UI --- */}
      {status === "waiting" && installState.canInstall && !installState.isStandalone && (
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] tracking-widest uppercase hover:bg-white/20 transition-all"
          >
            ✦ Install App
          </button>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 text-center">
        {status === "waiting" && (
          <div>
            <p className="mb-3 text-xs tracking-[0.3em] text-white/40">
              SESSION ENDED
            </p>

            <h1
              className="max-w-xl text-3xl md:text-4xl text-white/90 leading-tight"
              style={{ fontFamily: "Satisfy, cursive" }}
            >
              Your current matching session<br />
              has come to an end
            </h1>

            <p className="mt-5 text-sm text-white/60">
              The stars have drifted apart for now.
              You’ll be placed back into the pool next time.
            </p>

            <div className="mt-14 heart-pulse opacity-40" />
          </div>
        )}


        {/* --- OTHER STATES (no_match / matched) --- */}
        {status === "matched" && (
          <div className="floating-card">
            <p className="mb-3 text-xs tracking-widest text-white/50">MATCH FOUND</p>
            <div className="card-glass">
              <div className="illustration" />
              <h2 className="mt-7 text-3xl" style={{ fontFamily: "Satisfy, cursive" }}>@moonlitSoul</h2>
              <button
                onClick={handleChat}
                className="mt-6 w-full py-3 bg-[#f3b6c0] text-black rounded-xl font-bold hover:scale-105 transition-transform"
              >
                Enter Chat
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* ... existing styles ... */
      `}</style>
    </div>
  );
}