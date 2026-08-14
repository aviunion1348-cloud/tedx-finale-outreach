"use client";

import { CountUp } from "@/components/effects/Effects";

const STATS = [
  { value: 500, suffix: "", label: "CANDIDATES" },
  { value: 300, suffix: "", label: "WITHIN 25 KM" },
  { value: 5000, suffix: "", label: "₹ BUDGET" },
  { value: 1, suffix: "", label: "STAGE" },
];

export default function StatStrip() {
  return (
    <section className="mx-auto max-w-5xl px-4">
      <div className="glass grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 bg-black/30 px-4 py-6 text-center">
            <div className="font-display text-3xl font-black text-[#ff3b55] sm:text-4xl">
              ₹<CountUp to={s.value} />
            </div>
            <div className="label-cap text-[10px] text-white/50">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
