"use client";

import { useMemo, useState } from "react";
import type { Speaker } from "@/types/speaker";
import { Avatar } from "@/components/ui/Avatar";
import DomainTag from "@/components/ui/DomainTag";
import { useStore } from "@/lib/store";
import { buildLetter } from "@/lib/letters";
import { makeZip, downloadBlob } from "@/lib/zip";
import { fx } from "@/lib/audio";

type Column = "queued" | "confirmed";

export default function ShortlistView({ speakers }: { speakers: Speaker[] }) {
  const shortlist = useStore((s) => s.shortlist);
  const toggleShortlist = useStore((s) => s.toggleShortlist);
  const setActiveLetterSpeaker = useStore((s) => s.setActiveLetterSpeaker);
  const setActiveSpeaker = useStore((s) => s.setActiveSpeaker);
  const clearShortlist = useStore((s) => s.clearShortlist);
  const [cols, setCols] = useState<Record<string, Column>>({});

  const items = useMemo(
    () => shortlist.map((id) => speakers.find((s) => s.id === id)).filter(Boolean) as Speaker[],
    [shortlist, speakers]
  );

  const totalCost = items.reduce((a, s) => a + s.fee.totalEstCostINR, 0);
  const women = items.filter((s) => s.pronouns === "she/her").length;
  const diversity = items.length ? Math.round((women / items.length) * 100) : 0;

  const queued = items.filter((s) => cols[s.id] !== "confirmed");
  const confirmed = items.filter((s) => cols[s.id] === "confirmed");

  const move = (id: string, col: Column) => {
    fx.play("tick");
    setCols((c) => ({ ...c, [id]: col }));
  };

  const exportCsv = () => {
    const header = "ID,Name,Role,City,DistanceKm,CostINR,Fit,Tier,Status";
    const rows = items.map((s) =>
      [s.id, `"${s.name}"`, `"${s.role}"`, s.city, s.distanceKm, s.fee.totalEstCostINR, s.scores.overallFit, s.outreach.priorityTier, cols[s.id] || "queued"].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    downloadBlob(blob, "tedx-bit-shortlist.csv");
  };

  const exportZips = async () => {
    const files = items.map((s) => {
      const letter = buildLetter(s, "email");
      return { name: `${s.id}-${s.name.replace(/\s+/g, "-")}-invite.txt`, data: new TextEncoder().encode(letter.body) };
    });
    const zip = await makeZip(files);
    downloadBlob(zip, "tedx-bit-invite-letters.zip");
  };

  const renderCard = (s: Speaker) => (
    <div key={s.id} className="glass mb-3 p-3">
      <div className="flex items-center gap-3">
        <Avatar id={s.id} accent={s.accentColor} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{s.name}</div>
          <div className="truncate text-xs text-white/50">{s.role}</div>
        </div>
        <span className="font-display text-lg font-bold text-[#ff3b55]">{s.scores.overallFit}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <DomainTag id={s.primaryDomain} small />
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-white/50">
        <span>{Math.round(s.distanceKm)} km</span>
        <span>₹{s.fee.totalEstCostINR.toLocaleString("en-IN")}</span>
      </div>
      <div className="mt-2 flex gap-2">
        <button onClick={() => move(s.id, cols[s.id] === "confirmed" ? "queued" : "confirmed")} className="btn btn-ghost flex-1 !py-1.5 text-[11px]">
          {cols[s.id] === "confirmed" ? "→ Queue" : "✓ Confirm"}
        </button>
        <button onClick={() => setActiveLetterSpeaker(s)} className="btn btn-ghost !py-1.5 text-[11px]">✉</button>
        <button onClick={() => setActiveSpeaker(s)} className="btn btn-ghost !py-1.5 text-[11px]">⤢</button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-24">
      <div className="label-cap mb-2 text-[#ff6b81]">003_SHORTLIST</div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-white">Your shortlist</h1>
          <p className="mt-1 text-white/55">{items.length} candidate{items.length === 1 ? "" : "s"} · {confirmed.length} confirmed</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="btn btn-ghost !py-1.5 text-xs">CSV</button>
          <button onClick={exportZips} className="btn btn-ghost !py-1.5 text-xs">Letters.zip</button>
          {items.length > 0 && (
            <button onClick={clearShortlist} className="btn btn-ghost !py-1.5 text-xs text-[#ff8ba0]">Clear</button>
          )}
        </div>
      </div>

      {/* budget + diversity */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="glass p-5">
          <div className="label-cap mb-2 text-white/50">Estimated cost</div>
          <div className="font-display text-2xl font-black text-white">₹{totalCost.toLocaleString("en-IN")}</div>
          <div className="bar mt-3">
            <i style={{ width: `${Math.min(100, (totalCost / 5000) * 100)}%` }} />
          </div>
        </div>
        <div className="glass p-5">
          <div className="label-cap mb-2 text-white/50">Gender balance</div>
          <div className="font-display text-2xl font-black text-white">{women} / {items.length || 0}</div>
          <div className="bar mt-3">
            <i style={{ width: `${diversity}%`, background: "linear-gradient(90deg,#7b1fa2,#ff3b55)" }} />
          </div>
        </div>
        <div className="glass p-5">
          <div className="label-cap mb-2 text-white/50">Diversity score</div>
          <div className="font-display text-2xl font-black text-[#ff3b55]">{diversity}%</div>
          <div className="mt-2 text-xs text-white/45">Mix of domains, cities, backgrounds.</div>
        </div>
      </div>

      {/* kanban */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="label-cap mb-3 text-white/50">QUEUED ({queued.length})</div>
          {queued.map(renderCard)}
          {queued.length === 0 && <div className="py-8 text-center text-sm text-white/30">Nothing queued yet.</div>}
        </div>
        <div className="rounded-2xl border border-[#eb0028]/25 bg-[#eb0028]/5 p-4">
          <div className="label-cap mb-3 text-[#ff8ba0]">CONFIRMED ({confirmed.length})</div>
          {confirmed.map(renderCard)}
          {confirmed.length === 0 && <div className="py-8 text-center text-sm text-white/30">Confirm speakers to lock the lineup.</div>}
        </div>
      </div>
    </div>
  );
}
