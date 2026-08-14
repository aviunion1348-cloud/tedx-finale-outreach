"use client";

import { useEffect, useRef, useState } from "react";
import { useStore, type PerfTier } from "@/lib/store";
import { fx } from "@/lib/audio";

const TIERS: { id: PerfTier; label: string; hint: string }[] = [
  { id: "low", label: "Low", hint: "No animations" },
  { id: "balanced", label: "Balanced", hint: "Default" },
  { id: "high", label: "High", hint: "Max effect" },
];

export default function SettingsPopover() {
  const [shown, setShown] = useState(false);
  const perfTier = useStore((s) => s.perfTier);
  const setPerfTier = useStore((s) => s.setPerfTier);
  const audioEnabled = useStore((s) => s.audioEnabled);
  const setAudioEnabled = useStore((s) => s.setAudioEnabled);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = () => setShown((v) => !v);
    document.addEventListener("txj:settings", on);
    return () => document.removeEventListener("txj:settings", on);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShown(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  if (!shown) return null;
  return (
    <div ref={ref} className="glass-strong fixed right-4 top-16 z-[950] w-64 p-4">
      <div className="label-cap mb-3">Settings</div>
      <div className="mb-3">
        <div className="mb-1.5 text-xs text-white/60">Performance</div>
        <div className="grid grid-cols-3 gap-1.5">
          {TIERS.map((t) => (
            <button
              key={t.id}
              onClick={() => setPerfTier(t.id)}
              className={`rounded-lg border px-2 py-1.5 text-[11px] ${
                perfTier === t.id ? "border-[#eb0028] bg-[#eb0028]/20 text-white" : "border-white/10 text-white/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          const v = !audioEnabled;
          setAudioEnabled(v);
          fx.setEnabled(v);
        }}
        className="mb-3 flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70"
      >
        <span>Sound</span>
        <span>{audioEnabled ? "On" : "Off"}</span>
      </button>
      <div className="text-[11px] leading-relaxed text-white/40">
        <span className="kbd">⌘K</span> search · <span className="kbd">Shift F</span> FPS ·{" "}
        <span className="kbd">Esc</span> close
      </div>
    </div>
  );
}
