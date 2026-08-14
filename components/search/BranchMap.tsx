"use client";

// BIT Jaipur 2026 program/branch taxonomy. Clicking a program filters the field.
import { useStore } from "@/lib/store";

const PROGRAMS: { id: string; label: string; icon: string; desc: string }[] = [
  { id: "CSE", label: "CSE", icon: "⌘", desc: "Computer Science & Engineering" },
  { id: "CSE_AI_ML", label: "CSE AI & ML", icon: "◆", desc: "CS with AI & Machine Learning" },
  { id: "ECE", label: "ECE", icon: "▣", desc: "Electronics & Communication" },
  { id: "EEE", label: "EEE", icon: "⚡", desc: "Electrical & Electronics" },
  { id: "BCA", label: "BCA", icon: "⌨", desc: "Computer Applications" },
  { id: "BSC_AI_DS", label: "B.Sc AI & DS", icon: "◈", desc: "AI & Data Science" },
  { id: "BSC_BA", label: "B.Sc Business Analytics", icon: "▦", desc: "Business Analytics" },
  { id: "BSC_DESIGN", label: "B.Sc Design", icon: "✦", desc: "Design & Visual Comm" },
  { id: "BBA", label: "BBA", icon: "◆", desc: "Finance / Marketing / HR" },
  { id: "BHM", label: "BHM", icon: "♛", desc: "Hospitality & Hotel Mgmt" },
];

const LABEL: Record<string, string> = {
  CSE: "Computer Science & Engineering",
  CSE_AI_ML: "CSE (AI & ML)",
  ECE: "Electronics & Communication",
  EEE: "Electrical & Electronics",
  BCA: "Computer Applications",
  BSC_AI_DS: "B.Sc AI & Data Science",
  BSC_BA: "B.Sc Business Analytics",
  BSC_DESIGN: "B.Sc Design",
  BBA: "BBA",
  BHM: "BHM",
};

export function branchLabel(id: string): string {
  return LABEL[id] || "Interdisciplinary";
}

export default function BranchMap({ counts }: { counts: Record<string, number> }) {
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const active = filters.branches;
  const setBranch = (id: string) => {
    setFilters({ branches: active.includes(id) ? active.filter((b) => b !== id) : [id] });
  };

  return (
    <div className="mt-6">
      <div className="label-cap mb-3 text-[#ff6b81]">FIND BY BIT JAIPUR PROGRAM</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {PROGRAMS.map((p) => {
          const count = counts[p.id] || 0;
          const on = active.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => setBranch(p.id)}
              className={`group rounded-2xl border p-3 text-left transition ${
                on ? "border-[#eb0028] bg-[#eb0028]/15" : "border-white/10 bg-white/[0.03] hover:border-white/25"
              }`}
            >
              <div className={`text-xl ${on ? "text-[#ff6b81]" : "text-white/50"}`}>{p.icon}</div>
              <div className="mt-1 font-display text-sm font-semibold text-white">{p.label}</div>
              <div className="text-[11px] text-white/45">{p.desc}</div>
              <div className="mt-1 font-mono text-[10px] text-white/40">{count} speakers</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
