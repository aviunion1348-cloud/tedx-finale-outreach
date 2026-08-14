"use client";

import { useEffect, useState } from "react";

// Slim red scroll-progress bar pinned under the nav.
export default function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[950] h-[2px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-[#eb0028] to-[#ff3b55] transition-[width] duration-75"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}
