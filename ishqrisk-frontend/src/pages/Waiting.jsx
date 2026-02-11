import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Waiting() {
  const canvasRef = useRef(null);
  const navigate = useNavigate() ;
    const handleChat = ()=>(
        navigate("/test-chat")
    )
  // Possible values: "waiting" | "no_match" | "matched"
  const [status, setStatus] = useState("waiting");

  /* ---------------- SNOW SYSTEM (ONLY WHILE WAITING) ---------------- */
  useEffect(() => {
    if (status !== "waiting") return;


    const canvas = canvasRef.current;
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

      {/* ---------------- SOFT BLOOMS (MATCH FOUND ONLY) ---------------- */}
      {status === "matched" && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="bloom bloom-1" />
          <div className="bloom bloom-2" />
          <div className="bloom bloom-3" />
        </div>
      )}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 text-center">
        {/* ---------------- WAITING ---------------- */}
        {status === "waiting" && (
          <div>
            <p className="mb-3 text-xs tracking-[0.3em] text-white/40">
              SEARCHING
            </p>

            <h1
              className="max-w-xl text-3xl md:text-4xl text-white/90 leading-tight"
              style={{ fontFamily: "Satisfy, cursive" }}
            >
              We’re finding someone
              <br />
              who feels right for you
            </h1>

            <p className="mt-5 text-sm text-white/60">
              Take a breath. These things take time.
            </p>

            <div className="mt-14 heart-pulse" />
          </div>
        )}

        {/* ---------------- NO MATCH ---------------- */}
        {status === "no_match" && (
          <div>
            <p className="mb-3 text-xs tracking-widest text-white/40">
              NOT YET
            </p>

            <h1
              className="max-w-xl text-3xl md:text-4xl text-white/90 leading-tight"
              style={{ fontFamily: "Satisfy, cursive" }}
            >
              Nothing right now —
              <br />
              and that’s okay
            </h1>

            <p className="mt-5 text-sm text-white/60 max-w-md mx-auto">
              Some connections take time.
              You’ll be notified when someone new arrives.
            </p>
          </div>
        )}

        {/* ---------------- MATCH FOUND ---------------- */}
        {status === "matched" && (
          <div className="floating-card">
            <p className="mb-3 text-xs tracking-widest text-white/50">
              MATCH FOUND
            </p>

            <div className="card-glass">
              <div className="illustration" />

              <h2
                className="mt-7 text-3xl"
                style={{ fontFamily: "Satisfy, cursive" }}
              >
                @moonlitSoul
              </h2>

              <p className="mt-3 text-sm text-white/60">
                A quiet presence.
                <br />
                A soft conversation.
              </p>
              <button onClick={handleChat}> Test for chat page </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- STYLES ---------------- */}
      <style>{`
        .heart-pulse {
          width: 22px;
          height: 22px;
          background: #f3b6c0;
          transform: rotate(-45deg);
          margin: 0 auto;
          animation: pulse 3s ease-in-out infinite;
        }
        .heart-pulse::before,
        .heart-pulse::after {
          content: "";
          position: absolute;
          width: 22px;
          height: 22px;
          background: #f3b6c0;
          border-radius: 50%;
        }
        .heart-pulse::before { top: -11px; left: 0; }
        .heart-pulse::after { left: 11px; top: 0; }

        .floating-card {
          animation: float 7s ease-in-out infinite;
        }

        .card-glass {
          width: 360px;
          padding: 36px 32px;
          border-radius: 28px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(22px);
        }

        .illustration {
          height: 180px;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            rgba(243,182,192,0.45),
            rgba(255,255,255,0.06)
          );
        }

        .bloom {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.35;
          animation: bloom 12s ease-in-out infinite;
        }

        .bloom-1 {
          width: 520px;
          height: 520px;
          background: rgba(243,182,192,0.6);
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
        }

        .bloom-2 {
          width: 420px;
          height: 420px;
          background: rgba(255,240,220,0.45);
          bottom: 25%;
          left: 25%;
          animation-delay: 4s;
        }

        .bloom-3 {
          width: 360px;
          height: 360px;
          background: rgba(243,182,192,0.35);
          bottom: 20%;
          right: 20%;
          animation-delay: 7s;
        }

        @keyframes pulse {
          0% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(1.15); }
          100% { transform: rotate(-45deg) scale(1); }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
          100% { transform: translateY(0px); }
        }

        @keyframes bloom {
          0% { transform: scale(0.95); opacity: 0.25; }
          50% { transform: scale(1.05); opacity: 0.45; }
          100% { transform: scale(0.95); opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}
