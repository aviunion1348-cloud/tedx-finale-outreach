"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setInView(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-32 pb-10 text-center sm:pt-40">
      <div
        className="mx-auto mb-5 inline-block rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 label-cap text-[#ff8ba0]"
        style={{ opacity: inView ? 1 : 0, transition: "opacity .7s ease" }}
      >
        SPEAKER INTELLIGENCE · 2026 SEASON
      </div>

      <h1
        className="mx-auto max-w-4xl font-display text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl md:text-7xl"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translateY(12px)",
          transition: "opacity .9s ease, transform .9s cubic-bezier(.22,1,.36,1)",
        }}
      >
        Five hundred ideas.
        <br />
        Four kilometres away.
        <br />
        <span className="ted-glow text-[#ff3b55]">One stage.</span>
      </h1>

      <p
        className="mx-auto mt-6 max-w-xl text-white/60"
        style={{
          opacity: inView ? 1 : 0,
          transition: "opacity 1s ease .2s",
        }}
      >
        Every candidate is within practical reach of campus. Type an idea — any idea —
        and the engine hands you the people who should be on the TEDx BIT Jaipur stage.
      </p>

      <div
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
        style={{ opacity: inView ? 1 : 0, transition: "opacity 1s ease .3s" }}
      >
        <Link href="#search" className="btn btn-primary">
          Find speakers ↓
        </Link>
        <Link href="/playbook" className="btn btn-ghost">
          ₹5,000 playbook
        </Link>
      </div>

      {/* red rule */}
      <div
        className="mx-auto mt-12 h-px w-40 bg-gradient-to-r from-transparent via-[#eb0028] to-transparent"
        style={{ opacity: inView ? 1 : 0, transition: "opacity 1s ease .4s" }}
      />
    </section>
  );
}
