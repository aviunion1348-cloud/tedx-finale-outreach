"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Speaker } from "@/types/speaker";
import SearchResultCard from "./SearchResultCard";
import { Avatar } from "@/components/ui/Avatar";
import DomainTag from "@/components/ui/DomainTag";
import { useStore, type ViewMode } from "@/lib/store";
import { fx } from "@/lib/audio";

type SortKey = "fit" | "distance" | "cost" | "followers" | "name";

export default function ExploreView({ speakers }: { speakers: Speaker[] }) {
  const viewMode = useStore((s) => s.viewMode);
  const setViewMode = useStore((s) => s.setViewMode);
  const [sort, setSort] = useState<SortKey>("fit");
  const [q, setQ] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(() => {
    const arr = [...speakers];
    const f = q.toLowerCase();
    const filtered = f
      ? arr.filter((s) =>
          [s.name, s.headline, s.org, s.role, s.city, ...s.topics, ...s.keywords, s.primaryDomain]
            .join(" ")
            .toLowerCase()
            .includes(f)
        )
      : arr;
    switch (sort) {
      case "fit":
        filtered.sort((a, b) => b.scores.overallFit - a.scores.overallFit);
        break;
      case "distance":
        filtered.sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      case "cost":
        filtered.sort((a, b) => a.fee.totalEstCostINR - b.fee.totalEstCostINR);
        break;
      case "followers":
        filtered.sort((a, b) => b.audience.followers - a.audience.followers);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return filtered;
  }, [speakers, q, sort]);

  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 12,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pt-24">
      <div className="label-cap mb-2 text-[#ff6b81]">001_FIELD</div>
      <h1 className="font-display text-3xl font-black text-white">Explore the field</h1>
      <p className="mt-1 text-white/55">
        {speakers.length} candidates · all within practical reach · grid or table.
      </p>

      {/* controls */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by name, topic, domain…"
          className="flex-1 min-w-[220px] rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#eb0028]/50 focus:outline-none"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-xl border border-white/10 bg-[#101014] px-3 py-2.5 text-sm text-white/80 focus:outline-none"
        >
          <option value="fit">Sort: Fit</option>
          <option value="distance">Sort: Distance</option>
          <option value="cost">Sort: Cost</option>
          <option value="followers">Sort: Followers</option>
          <option value="name">Sort: A–Z</option>
        </select>
        <div className="flex rounded-xl border border-white/10">
          {(["grid", "table"] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                fx.play("tick");
                setViewMode(m);
              }}
              className={`px-4 py-2.5 text-sm capitalize ${viewMode === m ? "bg-[#eb0028] text-white" : "text-white/50"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-white/40">
        Showing {sorted.length} of {speakers.length} candidates
      </div>

      {/* grid mode */}
      {viewMode === "grid" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((s) => (
            <SearchResultCard key={s.id} speaker={s} />
          ))}
        </div>
      )}

      {/* table mode */}
      {viewMode === "table" && (
        <div ref={parentRef} className="mt-4 h-[70vh] overflow-auto rounded-2xl border border-white/10 bg-black/20">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#0c0c12] text-xs text-white/50">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Km</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Fit</th>
                <th className="px-4 py-3">Tier</th>
              </tr>
            </thead>
            <tbody style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
              {virtualizer.getVirtualItems().map((row) => {
                const s = sorted[row.index];
                return (
                  <tr
                    key={s.id}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${row.start}px)` }}
                    className="border-t border-white/5 hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-2 font-mono text-xs text-white/40">{s.id.replace("TXJ-", "")}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Avatar id={s.id} accent={s.accentColor} size={24} />
                        <span className="text-white">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2"><DomainTag id={s.primaryDomain} small /></td>
                    <td className="px-4 py-2 text-white/70">{s.city}</td>
                    <td className="px-4 py-2 font-mono text-white/70">{Math.round(s.distanceKm)}</td>
                    <td className="px-4 py-2 font-mono text-white/70">₹{s.fee.totalEstCostINR.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2 font-display font-bold text-[#ff3b55]">{s.scores.overallFit}</td>
                    <td className="px-4 py-2 font-mono text-white/50">{s.outreach.priorityTier}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
