"use client";

import { useRef } from "react";
import type { Speaker } from "@/types/speaker";
import { Avatar } from "@/components/ui/Avatar";
import DomainTag from "@/components/ui/DomainTag";
import { useStore } from "@/lib/store";
import { fx } from "@/lib/audio";
import { openFromEl } from "@/components/dossier/morph";

interface Props {
  speaker: Speaker;
}

// The "tabloid" card. Clicking it morphs into the full-screen dossier.
export default function SearchResultCard({ speaker: s }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const toggleShortlist = useStore((st) => st.toggleShortlist);
  const setActiveSpeaker = useStore((st) => st.setActiveSpeaker);
  const shortlisted = useStore((st) => st.shortlist.includes(s.id));
  const feat = s.feasibility;

  const open = () => {
    fx.play("open");
    openFromEl(ref.current);
    setActiveSpeaker(s);
  };

  return (
    <div ref={ref} className="tablo-card relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-4">
      {/* plate index */}
      <div className="label-cap absolute right-4 top-3 text-white/30">{s.id}</div>

      <div className="flex items-start gap-3">
        <Avatar id={s.id} accent={s.accentColor} size={72} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold leading-tight text-white">{s.name}</h3>
          <p className="mt-0.5 truncate text-xs text-white/55">{s.role}</p>
          <p className="truncate text-[11px] text-white/40">{s.city}, {s.state}</p>
        </div>
        <FitRing score={s.scores.overallFit} accent={s.accentColor} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <DomainTag id={s.primaryDomain} small />
        {s.secondaryDomains.slice(0, 2).map((d) => (
          <DomainTag key={d} id={d} small />
        ))}
      </div>

      {/* logistics strip */}
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-[11px]">
        <div>
          <div className="text-white/40">DIST</div>
          <div className="text-white">{Math.round(s.distanceKm)} km</div>
        </div>
        <div>
          <div className="text-white/40">COST</div>
          <div className="text-white">₹{(s.fee.totalEstCostINR || 0).toLocaleString("en-IN")}</div>
        </div>
        <div>
          <div className="text-white/40">FEAS</div>
          <div className="text-white">{feat}</div>
        </div>
      </div>

      {/* actions */}
      <div className="mt-3 flex items-center gap-2">
        <button onClick={open} className="btn btn-primary flex-1 !py-2 text-xs">
          Open Dossier
        </button>
        <button
          onClick={() => {
            fx.play("tick");
            toggleShortlist(s.id);
          }}
          className="btn btn-ghost !px-3 !py-2 text-xs"
          aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
          title={shortlisted ? "Shortlisted" : "Shortlist"}
        >
          {shortlisted ? "★" : "☆"}
        </button>
      </div>
    </div>
  );
}

function FitRing({ score, accent }: { score: number; accent: string }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div className="relative h-[46px] w-[46px] shrink-0">
      <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-white">
        {score}
      </div>
    </div>
  );
}
