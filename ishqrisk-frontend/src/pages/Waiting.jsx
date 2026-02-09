import { useEffect, useRef } from "react";

export default function Waiting() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const snowflakes = [];
    const piles = [];
    const SNOW_COUNT = 150;

    let wind = 0;
    let windTarget = 0;

    const STICK_ZONE = {
      x: width * 0.25,
      y: height * 0.36,
      w: width * 0.5,
      h: 170,
    };

    const rand = (min, max) => Math.random() * (max - min) + min;

    for (let i = 0; i < SNOW_COUNT; i++) {
      snowflakes.push({
        x: rand(0, width),
        y: rand(-height, 0),
        r: rand(0.8, 2),
        speed: rand(0.5, 1.2),
        drift: rand(-0.2, 0.2),
        opacity: rand(0.4, 0.9),
      });
    }

    const inStickZone = (f) =>
      f.x > STICK_ZONE.x &&
      f.x < STICK_ZONE.x + STICK_ZONE.w &&
      f.y > STICK_ZONE.y &&
      f.y < STICK_ZONE.y + STICK_ZONE.h;

    function animate() {
      ctx.clearRect(0, 0, width, height);

      wind += (windTarget - wind) * 0.002;
      if (Math.random() < 0.002) windTarget = rand(-0.6, 0.6);

      for (const f of snowflakes) {
        f.y += f.speed;
        f.x += f.drift + wind;

        if (inStickZone(f) && Math.random() < 0.02) {
          piles.push({
            x: f.x,
            y: f.y,
            w: rand(18, 32),
            h: rand(4, 7),
            life: 0.6,
          });
          f.y = -10;
          f.x = rand(0, width);
          continue;
        }

        if (f.y > height) f.y = -10;
        if (f.x < -10) f.x = width + 10;
        if (f.x > width + 10) f.x = -10;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
        ctx.fill();
      }

      for (const p of piles) {
        p.life = Math.min(p.life + 0.0004, 0.85);
        p.w += Math.abs(wind) * 0.01;
        p.x += wind * 0.15;

        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.w, p.h, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.life})`;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-xs tracking-[0.3em] text-white/40">
          WAITING
        </p>

        <h1
          className="max-w-xl text-3xl md:text-4xl font-semibold leading-tight"
          style={{
  fontFamily: "Satisfy, cursive",
  letterSpacing: "0.02em",
}}

        >
          We’re finding someone<br />who feels right for you
        </h1>

        <p className="mt-5 max-w-md text-sm text-white/60">
          No photos. No pressure.  
          Just a quiet moment before something new begins.
        </p>

        {/* HEART ORB */}
        <div className="mt-14 relative">
          <div className="heart-pulse" />
        </div>

        <p className="mt-8 text-xs text-white/30">
          This may take a moment.
        </p>
      </div>

      {/* Heart styles */}
      <style>{`
        .heart-pulse {
          position: relative;
          width: 22px;
          height: 22px;
          background: #f3b6c0;
          transform: rotate(-45deg);
          animation: pulse 2.8s ease-in-out infinite;
          box-shadow: 0 0 30px rgba(243,182,192,0.45);
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

        .heart-pulse::before {
          top: -11px;
          left: 0;
        }

        .heart-pulse::after {
          left: 11px;
          top: 0;
        }

        @keyframes pulse {
          0% { transform: rotate(-45deg) scale(1); opacity: 0.8; }
          50% { transform: rotate(-45deg) scale(1.15); opacity: 1; }
          100% { transform: rotate(-45deg) scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
