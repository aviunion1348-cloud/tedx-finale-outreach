"use client";

import type { Speaker } from "@/types/speaker";
import Hero from "./Hero";
import HomeSearch from "@/components/search/HomeSearch";
import StatStrip from "./StatStrip";
import { Reveal } from "@/components/effects/Effects";
import Link from "next/link";

export default function HomeView({ speakers }: { speakers: Speaker[] }) {
  const women = speakers.filter((s) => s.pronouns === "she/her").length;
  const free = speakers.filter((s) => s.fee.totalEstCostINR === 0).length;
  const walkIn = speakers.filter((s) => s.feasibility === "walk-in").length;

  return (
    <div className="pb-10">
      <Hero />
      <StatStrip />
      <HomeSearch />

      {/* stats bento */}
      <section className="mx-auto mt-4 max-w-5xl px-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Reveal delay={0}>
            <div className="glass p-6">
              <div className="font-display text-3xl font-black text-white">{women}</div>
              <div className="label-cap mt-1 text-white/50">Women candidates</div>
              <div className="mt-2 text-sm text-white/55">A stage should look like the audience. We balance the field accordingly.</div>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div className="glass p-6">
              <div className="font-display text-3xl font-black text-[#ff3b55]">{free}</div>
              <div className="label-cap mt-1 text-white/50">Will waive honorarium</div>
              <div className="mt-2 text-sm text-white/55">Zero-cost talent — the backbone of a ₹5,000 budget.</div>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div className="glass p-6">
              <div className="font-display text-3xl font-black text-white">{walkIn}</div>
              <div className="label-cap mt-1 text-white/50">Walk-in candidates</div>
              <div className="mt-2 text-sm text-white/55">Within 15 km — no travel, no risk, no excuses.</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* last season post-mortem */}
      <section className="mx-auto mt-4 max-w-5xl px-4">
        <Reveal>
          <div className="glass-strong p-6 sm:p-8">
            <div className="label-cap mb-2 text-[#ff6b81]">LAST SEASON · POST-MORTEM</div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Why last season under-delivered — and what changed.
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#eb0028]/25 bg-[#eb0028]/5 p-4">
                <div className="label-cap mb-1 text-[#ff8ba0]">BEFORE</div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">
                  <li>Wrong speakers invited — no feasibility check</li>
                  <li>Generic invites that read as copy-paste</li>
                  <li>No tracking, no follow-up cadence</li>
                  <li>₹5,000 scattered across blind outreach</li>
                </ul>
              </div>
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                <div className="label-cap mb-1 text-emerald-300">NOW</div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">
                  <li>500 pre-vetted, travel-feasible candidates</li>
                  <li>One-click personalized invite letters</li>
                  <li>Full dossier to decide before you call</li>
                  <li>A built-in zero-waste ₹5,000 playbook</li>
                </ul>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/explore" className="btn btn-primary">
                Explore the field
              </Link>
              <Link href="/playbook" className="btn btn-ghost">
                Read the playbook
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
