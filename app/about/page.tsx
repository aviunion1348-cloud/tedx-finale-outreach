import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About · TEDx BIT Jaipur Outreach Engine",
  description: "How the 500-candidate speaker intelligence platform works.",
};

const SCORING = [
  ["Relevance", "0.22"],
  ["Feasibility", "0.18"],
  ["Novelty", "0.14"],
  ["Reliability", "0.14"],
  ["Reach", "0.12"],
  ["Cost efficiency", "0.12"],
  ["Diversity", "0.08"],
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">
      <div className="label-cap mb-2 text-[#ff6b81]">005_ABOUT</div>
      <h1 className="font-display text-3xl font-black text-white sm:text-4xl">How the engine works</h1>

      <section className="mt-8 space-y-4 text-white/70">
        <p>
          The Outreach Engine is speaker intelligence for the TEDx Club at Birla Institute
          of Technology, Mesra — Jaipur Campus. It holds{" "}
          <span className="text-white">exactly 500 synthetic candidate profiles</span>, every one
          within practical travel distance of campus, and it exists to fix one failure from last
          season: <span className="text-white">the wrong speakers invited, with generic invites, and no tracking.</span>
        </p>
        <p>
          Type anything — <span className="font-mono text-[#ff8ba0]">&ldquo;donald trump&rdquo;</span>,{" "}
          <span className="font-mono text-[#ff8ba0]">&ldquo;promt engineerng&rdquo;</span> — the typo survives.
          The engine searches a lexical index, a concept bridge, and a semantic embedding space, then
          fuses them. It never returns empty.
        </p>
      </section>

      <section className="mt-8 glass-strong p-6">
        <h2 className="mb-3 font-display text-xl font-bold text-white">Scoring formula</h2>
        <div className="space-y-2">
          {SCORING.map(([label, w]) => (
            <div key={label} className="flex items-center justify-between border-b border-white/5 py-1.5 text-sm">
              <span className="text-white/70">{label}</span>
              <span className="font-mono text-[#ff3b55]">{w}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-white/45">
          Overall fit = 0.22·relevance + 0.18·feasibility + 0.14·novelty + 0.12·reach + 0.14·reliability + 0.12·costEff + 0.08·diversity
        </p>
      </section>

      <section className="mt-8 glass-strong p-6">
        <h2 className="mb-3 font-display text-xl font-bold text-white">Data & ethics</h2>
        <p className="text-sm text-white/60">
          All 500 profiles are <span className="text-amber-200">synthetic</span> — generated, fictional
          people built to exercise the outreach workflow. Emails are masked. No real speaker&rsquo;s contact
          is exposed. To go live with real talent, replace{" "}
          <span className="font-mono text-white/70">public/data/speakers.json</span> (same schema) and
          re-run <span className="font-mono text-white/70">node scripts/generate-search-assets.mjs</span>.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/explore" className="btn btn-primary">Explore the field</Link>
        <Link href="/playbook" className="btn btn-ghost">Read the playbook</Link>
      </div>
    </div>
  );
}
