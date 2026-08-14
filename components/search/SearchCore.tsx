"use client";

import { useEffect, useRef, useState } from "react";
import type { Speaker } from "@/types/speaker";
import { useStore } from "@/lib/store";
import { search, type SearchOutcome } from "@/lib/search";
import { loadSpeakers } from "@/lib/speakers-client";
import { fx } from "@/lib/audio";
import SearchResultCard from "./SearchResultCard";

const PLACEHOLDERS = [
  "donald trump",
  "promt engineerng",
  "ai speaker under 15km",
  "someone who failed and came back",
  "kathputli",
  "block print jaipur",
  "women founders free",
  "space isro chandrayaan",
];

interface Props {
  autofocus?: boolean;
  onNavigate?: () => void;
  placeholderOverride?: string;
}

export default function SearchCore({ autofocus, onNavigate, placeholderOverride }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [outcome, setOutcome] = useState<SearchOutcome | null>(null);
  const [loading, setLoading] = useState(false);
  const [phIdx, setPhIdx] = useState(0);
  const setActiveSpeaker = useStore((s) => s.setActiveSpeaker);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 90);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!debounced) {
      setOutcome(null);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    loadSpeakers()
      .then((speakers) => initAndSearch(speakers, debounced))
      .then((o) => {
        if (alive) {
          setOutcome(o);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    const iv = setInterval(() => setPhIdx((i) => (i + 1) % PLACEHOLDERS.length), 2600);
    return () => clearInterval(iv);
  }, []);

  const submit = () => {
    if (!q.trim()) return;
    fx.play("warp");
    setDebounced(q);
    onNavigate?.();
  };

  const placeholder = placeholderOverride ?? PLACEHOLDERS[phIdx];

  return (
    <div className="w-full">
      {/* input */}
      <div className="relative">
        <input
          ref={inputRef}
          autoFocus={autofocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={`Try "${placeholder}"…`}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 pl-12 pr-16 font-display text-lg text-white placeholder:text-white/30 focus:border-[#eb0028]/60 focus:outline-none"
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white/30">⌕</span>
        <button
          onClick={submit}
          className="btn btn-primary absolute right-2 top-1/2 -translate-y-1/2 !py-2 text-xs"
        >
          {loading ? "…" : "Warp"}
        </button>
      </div>

      {/* interpreted line */}
      {outcome && outcome.results.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/50">
          {outcome.interpreted.pills.length > 0 ? (
            <>
              <span className="label-cap text-[10px] text-white/40">Interpreted:</span>
              {outcome.interpreted.pills.map((p, i) => (
                <span key={i} className="rounded-full border border-[#eb0028]/40 bg-[#eb0028]/10 px-2 py-0.5 text-[#ff8ba0]">
                  {p}
                </span>
              ))}
            </>
          ) : (
            <span className="text-white/40">Searching 500 candidate profiles…</span>
          )}
          {outcome.emptyFallback && (
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-amber-200">
              No exact match — closest ideas:
            </span>
          )}
        </div>
      )}

      {/* results */}
      {outcome && outcome.results.length > 0 && (
        <div className="scroll3d mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" id="results">
          {outcome.results.map((s) => (
            <SearchResultCard key={s.id} speaker={s} />
          ))}
        </div>
      )}
    </div>
  );
}

async function initAndSearch(speakers: Speaker[], query: string): Promise<SearchOutcome> {
  const { initSearch } = await import("@/lib/search");
  await initSearch(speakers);
  return search(query, { relevance: 0.55, fit: 0.25, feasibility: 0.2 });
}
