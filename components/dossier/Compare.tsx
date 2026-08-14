"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import { loadSpeakers, speakerById } from "@/lib/speakers-client";
import { useEffect, useState } from "react";
import type { Speaker } from "@/types/speaker";

const ROWS: { key: keyof Speaker["scores"]; label: string }[] = [
  { key: "overallFit", label: "Overall fit" },
  { key: "relevance", label: "Relevance" },
  { key: "feasibility", label: "Feasibility" },
  { key: "costEff", label: "Cost efficiency" },
  { key: "reach", label: "Reach" },
  { key: "novelty", label: "Novelty" },
];

export default function Compare() {
  const activeCompare = useStore((s) => s.activeCompare);
  const removeCompare = useStore((s) => s.removeCompare);
  const clearCompare = useStore((s) => s.clearCompare);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);

  useEffect(() => {
    if (activeCompare.length < 2) return;
    loadSpeakers().then(setSpeakers);
  }, [activeCompare]);

  const items = useMemo(
    () => activeCompare.map((id) => speakerById(speakers, id)).filter(Boolean) as Speaker[],
    [speakers, activeCompare]
  );

  if (items.length < 2) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1250] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/85 backdrop-blur" onClick={clearCompare} />
        <motion.div
          className="glass-strong relative max-h-[90vh] w-full max-w-4xl overflow-auto p-5"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 18, opacity: 0 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-white">Compare</h3>
            <button onClick={clearCompare} className="kbd">esc</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="w-40 py-2 pr-4 text-left" />
                {items.map((s) => (
                  <th key={s.id} className="px-2 py-2 text-center">
                    <div className="mx-auto mb-1 w-fit">
                      <Avatar id={s.id} accent={s.accentColor} size={40} />
                    </div>
                    <div className="text-xs text-white">{s.name}</div>
                    <button onClick={() => removeCompare(s.id)} className="mt-1 text-[10px] text-white/40 hover:text-white">remove</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(({ key, label }) => {
                const vals = items.map((s) => s.scores[key]);
                const best = Math.max(...vals);
                return (
                  <tr key={key} className="border-t border-white/5">
                    <td className="py-2.5 pr-4 text-white/60">{label}</td>
                    {items.map((s) => (
                      <td key={s.id} className="px-2 py-2.5 text-center">
                        <span className={`font-display font-bold ${s.scores[key] === best ? "text-[#ff3b55]" : "text-white/70"}`}>
                          {s.scores[key]}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="border-t border-white/5">
                <td className="py-2.5 pr-4 text-white/60">Cost</td>
                {items.map((s) => (
                  <td key={s.id} className="px-2 py-2.5 text-center text-white/80">₹{s.fee.totalEstCostINR.toLocaleString("en-IN")}</td>
                ))}
              </tr>
              <tr className="border-t border-white/5">
                <td className="py-2.5 pr-4 text-white/60">Distance</td>
                {items.map((s) => (
                  <td key={s.id} className="px-2 py-2.5 text-center text-white/80">{Math.round(s.distanceKm)} km</td>
                ))}
              </tr>
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
