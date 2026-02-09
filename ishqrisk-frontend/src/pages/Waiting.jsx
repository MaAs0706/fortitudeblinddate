import { useEffect, useRef } from "react";

export default function Waiting() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const snowflakes = [];
    const SNOW_COUNT = 260; // ↑ more snow

    // Wind system
    let wind = 0;
    let windTarget = 0;

    // Slow zone around text (invisible calm area)
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

    for (let i = 0; i < SNOW_COUNT; i++) {
      snowflakes.push(createSnowflake());
    }

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

      // Smooth wind
      wind += (windTarget - wind) * 0.002;
      if (Math.random() < 0.002) {
        windTarget = rand(-0.5, 0.5);
      }

      for (const f of snowflakes) {
        const slowFactor = inSlowZone(f) ? 0.35 : 1;

        f.y += f.speed * slowFactor;
        f.x += (f.drift + wind) * slowFactor;

        if (f.y > height) {
          f.y = -10;
          f.x = rand(0, width);
        }

        if (f.x < -10) f.x = width + 10;
        if (f.x > width + 10) f.x = -10;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    animate();

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      SLOW_ZONE.x = width * 0.25;
      SLOW_ZONE.y = height * 0.35;
      SLOW_ZONE.w = width * 0.5;
    }

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-xs tracking-[0.3em] text-white/40">
          WAITING
        </p>

        <h1
          className="max-w-xl text-3xl md:text-4xl leading-tight text-white/90"
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

        {/* Heart pulse */}
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
          animation: pulse 3s ease-in-out infinite;
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
          50% { transform: rotate(-45deg) scale(1.18); opacity: 1; }
          100% { transform: rotate(-45deg) scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
