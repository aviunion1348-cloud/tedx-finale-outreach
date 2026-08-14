"use client";

import { useEffect, useState } from "react";

// Interstellar-style warp shown for ~1.4s on search submit.
const LINES = [0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88];

export default function WarpOverlay() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const on = () => {
      setActive(false); // reset
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setActive(true));
      });
      const t = setTimeout(() => setActive(false), 1450);
      return t;
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handler = () => {
      if (timer) clearTimeout(timer);
      timer = on();
    };
    document.addEventListener("txj:warp", handler);
    return () => {
      document.removeEventListener("txj:warp", handler);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!active) return null;
  return (
    <div className="warp-overlay" aria-hidden>
      <div className="warp-flash" />
      {LINES.map((a) => (
        <div
          key={a}
          className="warp-line"
          style={{ transform: `translateX(-50%) rotate(${a - 44}deg)`, animationDelay: `${(a / 88) * 0.12}s` }}
        />
      ))}
      <div className="warp-vignette" />
    </div>
  );
}
