"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Speaker } from "@/types/speaker";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import DomainTag from "@/components/ui/DomainTag";
import { morphSource } from "./morph";
import { similarSpeakers } from "@/lib/search";
import { fx } from "@/lib/audio";
import { dossierPdf, downloadBytes, downloadUrl } from "@/lib/pdf";
import { domainLabel } from "@/lib/domains";
import { buildLetter, linkedinUrl } from "@/lib/letters";

const SUB_SCORES: { key: keyof Speaker["scores"]; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "feasibility", label: "Feasibility" },
  { key: "novelty", label: "Novelty" },
  { key: "reach", label: "Reach" },
  { key: "reliability", label: "Reliability" },
  { key: "costEff", label: "Cost Efficiency" },
  { key: "diversity", label: "Diversity" },
];

export default function DossierModal() {
  const speaker = useStore((s) => s.activeSpeaker);
  const setActiveSpeaker = useStore((s) => s.setActiveSpeaker);
  const toggleShortlist = useStore((s) => s.toggleShortlist);
  const setActiveLetterSpeaker = useStore((s) => s.setActiveLetterSpeaker);
  const addCompare = useStore((s) => s.addCompare);
  const shortlisted = useStore((s) => (speaker ? s.shortlist.includes(speaker.id) : false));
  const [sims, setSims] = useState<Speaker[]>([]);

  useEffect(() => {
    if (!speaker) return;
    setSims([]);
    let alive = true;
    similarSpeakers(speaker.id, 5).then((r) => {
      if (alive) setSims(r);
    });
    return () => {
      alive = false;
    };
  }, [speaker]);

  const from = morphSource.rect;

  const exportPdf = async () => {
    if (!speaker) return;
    const bytes = await dossierPdf(speaker);
    downloadBytes(bytes, `${speaker.id}-dossier.pdf`);
  };

  useEffect(() => {
    if (!speaker) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [speaker]);

  if (!speaker) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1200] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* mist + liquid backdrop inside the modal */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#050508]">
          <div className="mist-puff" style={{ width: 700, height: 700, top: "-10%", left: "-10%" }} />
          <div className="mist-puff soft" style={{ width: 520, height: 520, top: "40%", right: "-10%", animationDelay: "4s" }} />
          <div className="ink-blob" style={{ width: "50vw", height: "50vw", top: "30%", left: "50%" }} />
        </div>

        {/* morphing panel */}
        <motion.div
          className="glass-strong relative flex h-full w-full flex-col overflow-hidden rounded-none md:my-4 md:mx-auto md:h-[94vh] md:max-w-5xl md:rounded-[26px]"
          initial={
            from
              ? { x: from.x, y: from.y, width: from.width, height: from.height, borderRadius: 20 }
              : { scale: 0.9, opacity: 0 }
          }
          animate={{ x: 0, y: 0, width: "100%", height: "100%", borderRadius: 0, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%" }}
        >
          {/* top bar */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <button
              onClick={() => {
                fx.play("thunk");
                setActiveSpeaker(null);
              }}
              className="btn btn-ghost !py-1.5 text-xs"
            >
              ← Back
            </button>
            <div className="label-cap hidden text-white/40 sm:block">
              {speaker.id} · {speaker.primaryDomain}
            </div>
            <button
              onClick={() => downloadUrl(`/tabloids/${speaker.id}.png`, `${speaker.id}-plate.png`)}
              className="btn btn-ghost !py-1.5 text-xs"
            >
              Plate ↓
            </button>
          </div>

          {/* scrollable dossier — top to bottom */}
          <div className="dossier-scroll relative flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
              {/* 1 · identity */}
              <Section index={0}>
                <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                  <Avatar id={speaker.id} accent={speaker.accentColor} size={120} className="ring-2 ring-[#eb0028]/50" />
                  <div className="min-w-0">
                    <div className="label-cap mb-2">
                      {speaker.id} · {speaker.pronouns}
                      {speaker.isReal && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                          ✓ Verified real speaker
                        </span>
                      )}
                    </div>
                    <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">{speaker.name}</h2>
                    <p className="mt-2 text-white/70">{speaker.headline}</p>
                    <p className="mt-1 text-sm text-white/50">
                      {speaker.role} · {speaker.org} · {speaker.yearsExperience} yrs
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                      <DomainTag id={speaker.primaryDomain} />
                      {speaker.secondaryDomains.map((d) => (
                        <DomainTag key={d} id={d} />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-white/40">
                      {speaker.languages.join(" · ")}
                    </p>
                    <a
                      href={linkedinUrl(speaker)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => fx.play("open")}
                      className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#0a66c2]/50 bg-[#0a66c2]/10 px-2.5 py-1 text-[11px] text-[#7fc1ff] transition hover:bg-[#0a66c2]/25"
                    >
                      in /in/{speaker.linkedin}
                    </a>
                  </div>
                </div>
              </Section>

              {/* 2 · fit dial + 3 · sub-scores */}
              <Section index={1}>
                <ModuleTitle>Fit Assessment</ModuleTitle>
                <div className="grid gap-5 md:grid-cols-[auto_1fr]">
                  <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border-4 border-[#eb0028]/40">
                    <div className="text-center">
                      <div className="font-display text-5xl font-black text-white">{speaker.scores.overallFit}</div>
                      <div className="label-cap text-[10px]">/ 100 FIT</div>
                    </div>
                  </div>
                  <div className="grid gap-2.5">
                    {SUB_SCORES.map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-32 shrink-0 text-xs text-white/55">{label}</div>
                        <div className="bar flex-1">
                          <i style={{ width: `${speaker.scores[key]}%` }} />
                        </div>
                        <div className="w-7 text-right font-mono text-xs text-white/80">{speaker.scores[key]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              {/* 4 · why they fit */}
              <Section index={2}>
                <ModuleTitle>Why they fit</ModuleTitle>
                <ul className="space-y-2">
                  {speaker.fitReasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/75">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#eb0028]" />
                      {r}
                    </li>
                  ))}
                </ul>
              </Section>

              {/* 5 · logistics */}
              <Section index={3}>
                <ModuleTitle>Logistics & Travel</ModuleTitle>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Stat label="Distance" value={`${Math.round(speaker.distanceKm)} km`} />
                  <Stat label="Travel time" value={`~${speaker.travelTimeHrs} hrs`} />
                  <Stat label="Feasibility" value={speaker.feasibility} accent />
                  <Stat label="Est. cost" value={`₹${speaker.fee.totalEstCostINR.toLocaleString("en-IN")}`} />
                  <Stat label="Notice" value={`${speaker.typicalNoticeWeeks} weeks`} />
                  <Stat label="Best window" value={speaker.bestContactWindow} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {speaker.riskFlags.map((f, i) => (
                    <span key={i} className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200">
                      ⚠ {f}
                    </span>
                  ))}
                </div>
              </Section>

              {/* 6 · track record */}
              <Section index={4}>
                <ModuleTitle>Track Record</ModuleTitle>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Total talks" value={`${speaker.speakingExperience.totalTalks}`} />
                  <Stat label="TEDx talks" value={`${speaker.speakingExperience.tedxTalks.length}`} />
                  <Stat label="Avg length" value={`${speaker.speakingExperience.avgTalkLengthMin} min`} />
                  <Stat label="Recorded" value={speaker.speakingExperience.hasRecordedTalk ? "Yes" : "No"} />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <MiniBar label="Stage presence" val={speaker.speakingExperience.stagePresenceScore} />
                  <MiniBar label="Idea clarity" val={speaker.speakingExperience.idIdeaClarityScore} />
                </div>
                {speaker.speakingExperience.tedxTalks.length > 0 && (
                  <p className="mt-3 text-xs text-white/50">
                    Prior TEDx: {speaker.speakingExperience.tedxTalks.map((t) => t.venue).join(", ")}
                  </p>
                )}
              </Section>

              {/* 7 · BIT link */}
              <Section index={5}>
                <ModuleTitle>Connection to BIT Jaipur</ModuleTitle>
                <ul className="space-y-1.5 text-sm text-white/75">
                  <li>• {speaker.bitConnection.isAlumnus ? "BIT alumnus" : "External to BIT"}</li>
                  <li>• {speaker.bitConnection.hasVisited ? "Has visited campus before" : "Has not visited campus"}</li>
                  <li>• Warm intro: {speaker.bitConnection.warmIntroPath}</li>
                  <li>• {speaker.bitConnection.previouslyInvited ? "Previously invited" : "Fresh outreach"}</li>
                </ul>
              </Section>

              {/* 8 · reach */}
              <Section index={6}>
                <ModuleTitle>Reach</ModuleTitle>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Followers" value={speaker.verifiedFollowers ? fmt(speaker.verifiedFollowers) : "Verified on request"} />
                  <Stat label="Media mentions" value={`${speaker.audience.mediaMentions}`} />
                  <Stat label="Draw (students)" value={speaker.audience.estimatedDrawStudents ? fmt(speaker.audience.estimatedDrawStudents) : "On request"} />
                  <Stat label="Press-worthiness" value={`${speaker.audience.pressWorthiness}/100`} />
                </div>
              </Section>

              {/* 9 · cost vs ₹5k */}
              <Section index={7}>
                <ModuleTitle>Cost vs ₹5,000 budget</ModuleTitle>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-2 flex items-center justify-between font-mono text-xs">
                    <span className="text-white/50">ENGAGEMENT</span>
                    <span className="text-white">₹{speaker.fee.totalEstCostINR.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${Math.min(100, (speaker.fee.totalEstCostINR / 5000) * 100)}%` }} />
                  </div>
                  <div className="mt-2 text-[11px] text-white/45">
                    {speaker.fee.willWaiveFee ? "Honorarium waived — highly cost-effective pick." : `Honorarium ₹${speaker.fee.honorarium.toLocaleString("en-IN")} + travel.`}
                  </div>
                </div>
              </Section>

              {/* 10 · talk proposal */}
              <Section index={8}>
                <ModuleTitle>Talk Proposal</ModuleTitle>
                <div className="rounded-2xl border border-[#eb0028]/30 bg-[#eb0028]/5 p-4">
                  <p className="font-display text-lg font-semibold text-white">{speaker.proposedTalkTitle}</p>
                  <p className="mt-2 text-sm text-white/70">{speaker.talkAngle}</p>
                </div>
              </Section>

              {/* 11 · outreach plan */}
              <Section index={9}>
                <ModuleTitle>Outreach Plan</ModuleTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="label-cap mb-2">Priority Tier</div>
                    <div className="font-display text-3xl font-black text-[#ff3b55]">{speaker.outreach.priorityTier}</div>
                    <div className="mt-2 text-xs text-white/50">Suggested approach</div>
                    <p className="mt-1 text-sm text-white/75">{speaker.outreach.suggestedApproach}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="label-cap mb-2">Follow-up cadence</div>
                    <div className="font-display text-2xl font-bold text-white">{speaker.outreach.followUpCadenceDays} days</div>
                    <div className="mt-2 text-xs text-white/50">Best outreach month</div>
                    <p className="mt-1 text-sm text-white/75">{MONTHS[speaker.outreach.bestOutreachMonth - 1]}</p>
                    <div className="mt-2 text-xs text-white/40">Contact: {speaker.contact.email}</div>
                  </div>
                </div>
              </Section>

              {/* 12 · similar speakers */}
              <Section index={10}>
                <ModuleTitle>Similar Speakers</ModuleTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  {sims.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveSpeaker(s);
                        window.scrollTo({ top: 0 });
                      }}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-[#eb0028]/50"
                    >
                      <Avatar id={s.id} accent={s.accentColor} size={40} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">{s.name}</div>
                        <div className="truncate text-xs text-white/50">{domainLabel(s.primaryDomain)} · {s.distanceKm} km</div>
                      </div>
                    </button>
                  ))}
                  {sims.length === 0 && <div className="text-sm text-white/40">Loading similar speakers…</div>}
                </div>
              </Section>

              <div className="h-24" />
            </div>
          </div>

          {/* action bar */}
          <div className="border-t border-white/10 bg-black/40 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  fx.play("open");
                  setActiveLetterSpeaker(speaker);
                }}
                className="btn btn-primary flex-1 text-xs"
              >
                ✉ Invite
              </button>
              <button
                onClick={() => {
                  fx.play("tick");
                  toggleShortlist(speaker.id);
                }}
                className="btn btn-ghost text-xs"
              >
                {shortlisted ? "★ Shortlisted" : "☆ Shortlist"}
              </button>
              <button
                onClick={() => {
                  fx.play("chime");
                  addCompare(speaker.id);
                  setActiveSpeaker(null);
                }}
                className="btn btn-ghost text-xs"
              >
                ⟷ Compare
              </button>
              <a
                href={linkedinUrl(speaker)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => fx.play("open")}
                className="btn btn-ghost text-xs"
              >
                in LinkedIn
              </a>
              <button onClick={() => copyDM(speaker)} className="btn btn-ghost text-xs">
                Copy DM
              </button>
              <button onClick={exportPdf} className="btn btn-ghost text-xs">
                Export PDF
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmt(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "k";
  return String(n);
}

function copyDM(s: Speaker) {
  const txt = buildLetter(s, "linkedin").dm;
  navigator.clipboard?.writeText(txt).catch(() => {});
}

function Section({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
      className="mb-9"
    >
      {children}
    </motion.section>
  );
}

function ModuleTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="label-cap mb-3 border-b border-white/10 pb-2 text-[#ff6b81]">{children}</h3>;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="label-cap text-[10px]">{label}</div>
      <div className={`mt-1 font-display text-base font-semibold ${accent ? "text-[#ff6b81]" : "text-white"}`}>{value}</div>
    </div>
  );
}

function MiniBar({ label, val }: { label: string; val: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-white/55">
        <span>{label}</span>
        <span className="font-mono">{val}/100</span>
      </div>
      <div className="bar">
        <i style={{ width: `${val}%` }} />
      </div>
    </div>
  );
}
