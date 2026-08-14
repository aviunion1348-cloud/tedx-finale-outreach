"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import type { Speaker } from "@/types/speaker";
import { Avatar } from "@/components/ui/Avatar";
import { useStore } from "@/lib/store";

const PIE_COLORS = ["#eb0028", "#ff3b55", "#ff7a00", "#7b1fa2", "#00e5ff", "#ffc247", "#4caf50", "#5c6bc0"];

export default function InsightsView({ speakers }: { speakers: Speaker[] }) {
  const setActiveSpeaker = useStore((s) => s.setActiveSpeaker);
  const setActiveLetterSpeaker = useStore((s) => s.setActiveLetterSpeaker);

  const domainDist = useMemo(() => {
    const map = new Map<string, number>();
    speakers.forEach((s) => map.set(s.primaryDomain, (map.get(s.primaryDomain) || 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [speakers]);

  const costVsFit = useMemo(
    () => speakers.slice(0, 120).map((s) => ({ cost: s.fee.totalEstCostINR, fit: s.scores.overallFit, name: s.name, id: s.id })),
    [speakers]
  );

  const byBand = useMemo(() => {
    const b = { "≤25km": 0, "26–120": 0, "121–400": 0, ">400": 0 };
    speakers.forEach((s) => {
      if (s.distanceKm <= 25) b["≤25km"]++;
      else if (s.distanceKm <= 120) b["26–120"]++;
      else if (s.distanceKm <= 400) b["121–400"]++;
      else b[">400"]++;
    });
    return Object.entries(b).map(([name, value]) => ({ name, value }));
  }, [speakers]);

  const hiddenGems = useMemo(
    () =>
      speakers
        .filter((s) => s.fee.totalEstCostINR === 0 && s.scores.overallFit >= 78)
        .sort((a, b) => b.scores.overallFit - a.scores.overallFit)
        .slice(0, 8),
    [speakers]
  );

  const avgFit = Math.round(speakers.reduce((a, s) => a + s.scores.overallFit, 0) / speakers.length);
  const women = speakers.filter((s) => s.pronouns === "she/her").length;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-24">
      <div className="label-cap mb-2 text-[#ff6b81]">004_INSIGHTS</div>
      <h1 className="font-display text-3xl font-black text-white">Field intelligence</h1>
      <p className="mt-1 text-white/55">The whole 500-candidate field, sliced every way.</p>

      {/* stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card k="Avg fit" v={avgFit + "/100"} />
        <Card k="Women" v={`${women} (${Math.round((women / speakers.length) * 100)}%)`} />
        <Card k="Zero-cost" v={String(speakers.filter((s) => s.fee.totalEstCostINR === 0).length)} />
        <Card k="Walk-in" v={String(speakers.filter((s) => s.feasibility === "walk-in").length)} />
      </div>

      {/* charts */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="glass-strong p-5">
          <h3 className="label-cap mb-3 text-white/50">Top domains</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={domainDist}>
              <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: "#666", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#101014", border: "1px solid #ffffff22", borderRadius: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {domainDist.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-strong p-5">
          <h3 className="label-cap mb-3 text-white/50">Distance bands</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byBand} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {byBand.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#101014", border: "1px solid #ffffff22", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* cost vs fit scatter */}
      <div className="mt-5 glass-strong p-5">
        <h3 className="label-cap mb-3 text-white/50">Cost vs fit (first 120) — aim top-left</h3>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart>
            <CartesianGrid stroke="#ffffff11" />
            <XAxis type="number" dataKey="cost" name="Cost ₹" tick={{ fill: "#666", fontSize: 10 }} />
            <YAxis type="number" dataKey="fit" name="Fit" tick={{ fill: "#666", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#101014", border: "1px solid #ffffff22", borderRadius: 12 }} />
            <Scatter data={costVsFit} fill="#ff3b55" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* hidden gems */}
      <div className="mt-6">
        <h3 className="label-cap mb-3 text-[#ff8ba0]">HIDDEN GEMS — zero cost, high fit</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {hiddenGems.map((s) => (
            <div key={s.id} className="glass p-4">
              <div className="flex items-center gap-3">
                <Avatar id={s.id} accent={s.accentColor} size={44} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{s.name}</div>
                  <div className="truncate text-xs text-white/50">{s.role}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-[11px] text-emerald-300">₹0 cost</span>
                <span className="font-display font-bold text-[#ff3b55]">{s.scores.overallFit}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setActiveSpeaker(s)} className="btn btn-ghost flex-1 !py-1 text-[11px]">⤢</button>
                <button onClick={() => setActiveLetterSpeaker(s)} className="btn btn-primary flex-1 !py-1 text-[11px]">✉ Invite</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ k, v }: { k: string; v: string }) {
  return (
    <div className="glass p-5">
      <div className="font-display text-2xl font-black text-white">{v}</div>
      <div className="label-cap mt-1 text-white/50">{k}</div>
    </div>
  );
}
