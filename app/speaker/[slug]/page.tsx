import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSpeakers, getSpeakerBySlug } from "@/lib/data";
import { domainLabel, domainAccent } from "@/lib/domains";
import OpenDossier from "@/components/dossier/OpenDossier";

// Async params (Next 15.5 style).
interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSpeakers().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getSpeakerBySlug(slug);
  if (!s) return { title: "Not found" };
  return {
    title: `${s.name} · TEDx BIT Jaipur`,
    description: s.headline,
  };
}

export default async function SpeakerPage({ params }: Props) {
  const { slug } = await params;
  const s = getSpeakerBySlug(slug);
  if (!s) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-16">
      <div className="label-cap mb-2 text-[#ff6b81]">{s.id} · {s.pronouns}</div>
      <div className="flex flex-wrap items-start gap-5">
        <div
          className="flex h-32 w-32 items-center justify-center rounded-2xl border-2 font-display text-3xl font-black"
          style={{ borderColor: domainAccent(s.primaryDomain), color: domainAccent(s.primaryDomain), background: `${domainAccent(s.primaryDomain)}11` }}
        >
          {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-4xl font-black text-white">{s.name}</h1>
          <p className="mt-1 text-lg text-white/70">{s.role}</p>
          <p className="text-sm text-white/50">{s.org} · {s.city}, {s.state}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">{domainLabel(s.primaryDomain)}</span>
            {s.secondaryDomains.map((d) => (
              <span key={d} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">{domainLabel(d)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* score + cost strip */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="glass p-4 text-center">
          <div className="font-display text-3xl font-black text-[#ff3b55]">{s.scores.overallFit}</div>
          <div className="label-cap mt-1 text-white/50">OVERALL FIT</div>
        </div>
        <div className="glass p-4 text-center">
          <div className="font-display text-3xl font-black text-white">{Math.round(s.distanceKm)} km</div>
          <div className="label-cap mt-1 text-white/50">FROM CAMPUS</div>
        </div>
        <div className="glass p-4 text-center">
          <div className="font-display text-3xl font-black text-white">₹{s.fee.totalEstCostINR.toLocaleString("en-IN")}</div>
          <div className="label-cap mt-1 text-white/50">EST. COST</div>
        </div>
      </div>

      <div className="mt-6 glass p-6">
        <h2 className="label-cap mb-2 text-white/50">Bio</h2>
        <p className="leading-relaxed text-white/75">{s.bioLong}</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="glass p-6">
          <h2 className="label-cap mb-2 text-white/50">Proposed talk</h2>
          <p className="font-display text-lg font-semibold text-white">{s.proposedTalkTitle}</p>
          <p className="mt-2 text-sm text-white/60">{s.talkAngle}</p>
        </div>
        <div className="glass p-6">
          <h2 className="label-cap mb-2 text-white/50">Feasibility</h2>
          <div className="flex flex-wrap gap-2">
            {s.riskFlags.map((f, i) => (
              <span key={i} className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200">⚠ {f}</span>
            ))}
          </div>
          <p className="mt-3 text-sm text-white/60">
            {s.feasibility} · {s.speakingExperience.tedxTalks.length} prior TEDx talks ·{" "}
            {s.speakingExperience.hasRecordedTalk ? "recorded talk available" : "no recording yet"}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <OpenDossier speaker={s} />
        <a href={`/tabloids/${s.id}.png`} download={`${s.id}-plate.png`} className="btn btn-ghost">Plate ↓</a>
        <a href="/explore" className="btn btn-ghost">Back to field</a>
      </div>
    </div>
  );
}
