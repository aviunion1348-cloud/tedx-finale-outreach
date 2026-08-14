"use client";

import { useState } from "react";
import { Reveal } from "@/components/effects/Effects";

const BUCKETS = [
  { id: "honoraria", label: "Honoraria", max: 4000 },
  { id: "travel", label: "Travel & logistics", max: 1500 },
  { id: "hospitality", label: "Hospitality & refreshments", max: 1200 },
  { id: "production", label: "Stage / production upgrades", max: 1000 },
  { id: "misc", label: "Contingency", max: 800 },
];

const CHANNELS = [
  { name: "Alumni network", cost: 0, note: "BIT Jaipur alumni who already love the campus" },
  { name: "University partnerships", cost: 0, note: "Cross-promote with sister fests" },
  { name: "Faculty warm intros", cost: 0, note: "Your professors know everyone" },
  { name: "Campus guilds & clubs", cost: 0, note: "Each club brings its own audience" },
  { name: "Local press pitch", cost: 0, note: "A good story gets picked up free" },
  { name: "Student influencers", cost: 0, note: "Your 5k-instagram students ARE media" },
  { name: "Community WhatsApp groups", cost: 0, note: "Hyperlocal reach, zero spend" },
  { name: "CSR / sponsor in-kind", cost: 0, note: "Venue, AV, food — trade for visibility" },
  { name: "Volunteer army", cost: 0, note: "60 hands cost nothing and move everything" },
];

const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6"];
const GANTT = [
  { task: "Finalize shortlist & tiering", weeks: [1, 1, 1, 0, 0, 0] },
  { task: "Send personalized invites", weeks: [0, 1, 1, 1, 0, 0] },
  { task: "Confirm speakers + logistics", weeks: [0, 0, 1, 1, 1, 0] },
  { task: "Promote speakers to audience", weeks: [0, 0, 0, 1, 1, 1] },
  { task: "Rehearsal + stage check", weeks: [0, 0, 0, 0, 1, 1] },
];

export default function PlaybookView() {
  const [alloc, setAlloc] = useState<Record<string, number>>({
    honoraria: 2500,
    travel: 1000,
    hospitality: 600,
    production: 600,
    misc: 300,
  });
  const total = Object.values(alloc).reduce((a, b) => a + b, 0);

  const setBucket = (id: string, v: number) => {
    const val = Math.max(0, Math.min(BUCKETS.find((b) => b.id === id)!.max, v));
    setAlloc((a) => ({ ...a, [id]: val }));
  };

  const presets = [
    { name: "Zero-cost first", values: { honoraria: 3000, travel: 800, hospitality: 500, production: 400, misc: 300 } },
    { name: "Producing up", values: { honoraria: 2000, travel: 1200, hospitality: 800, production: 700, misc: 300 } },
  ];

  const applyPreset = (values: Record<string, number>) => {
    let budget = 5000;
    const next: Record<string, number> = {};
    for (const b of BUCKETS) {
      const share = Math.min(values[b.id], budget);
      next[b.id] = share;
      budget -= share;
    }
    setAlloc(next);
  };

  const costPerAttendee = 500 / 800;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-24">
      <div className="label-cap mb-2 text-[#ff6b81]">002_PLAYBOOK</div>
      <h1 className="font-display text-3xl font-black text-white sm:text-4xl">
        The ₹5,000 zero-waste outreach playbook
      </h1>
      <p className="mt-2 max-w-2xl text-white/60">
        Spend the whole budget on what moves the room. Every other channel is zero-rupee,
        and it all fits in six weeks.
      </p>

      {/* allocator */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <div className="glass-strong p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white">Budget allocator</h2>
              <div className="font-display text-2xl font-black text-white">
                ₹{total.toLocaleString("en-IN")}
                <span className="text-sm font-normal text-white/40"> / 5,000</span>
              </div>
            </div>
            <div className="bar mb-5">
              <i style={{ width: `${(total / 5000) * 100}%`, background: total > 5000 ? "linear-gradient(90deg,#eb0028,#ff7a00)" : undefined }} />
            </div>
            <div className="space-y-4">
              {BUCKETS.map((b) => (
                <div key={b.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-white/80">{b.label}</span>
                    <span className="font-mono text-white/70">₹{alloc[b.id].toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={b.max}
                    step={50}
                    value={alloc[b.id]}
                    onChange={(e) => setBucket(b.id, parseInt(e.target.value))}
                    className="w-full accent-[#eb0028]"
                  />
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              {presets.map((p) => (
                <button key={p.name} onClick={() => applyPreset(p.values)} className="btn btn-ghost !py-1.5 text-xs">
                  {p.name}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/45">
              Cost per attendee (target 800): <span className="text-white/80">₹{costPerAttendee.toFixed(0)}</span> — under a chai for a full TEDx talk.
            </p>
          </div>
        </Reveal>

        {/* zero-rupee channels */}
        <Reveal delay={90}>
          <div className="glass-strong p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-white">Zero-rupee channels</h2>
            <div className="space-y-2">
              {CHANNELS.map((c) => (
                <div key={c.name} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{c.name}</div>
                    <div className="text-xs text-white/50">{c.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* 6-week Gantt */}
      <Reveal>
        <div className="mt-6 glass-strong p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-white">Six-week plan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-white/50">
                  <th className="py-2 pr-4">Task</th>
                  {WEEKS.map((w) => (
                    <th key={w} className="w-10 py-2 text-center">{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GANTT.map((g) => (
                  <tr key={g.task} className="border-t border-white/5">
                    <td className="py-2 pr-4 text-white/80">{g.task}</td>
                    {g.weeks.map((on, i) => (
                      <td key={i} className="py-2 text-center">
                        <span
                          className={`inline-block h-3 w-3 rounded ${on ? "bg-[#eb0028]" : "bg-white/5"}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* measurement */}
      <Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { k: "Invites sent", v: "≥ 30" },
            { k: "Conversion target", v: "10 speakers" },
            { k: "Confirm ≥ 7 days out", v: "de-risk" },
          ].map((m) => (
            <div key={m.k} className="glass p-5 text-center">
              <div className="font-display text-2xl font-black text-[#ff3b55]">{m.v}</div>
              <div className="label-cap mt-1 text-white/50">{m.k}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
