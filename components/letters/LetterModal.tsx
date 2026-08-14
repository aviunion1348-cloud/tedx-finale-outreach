"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { GENRES, buildLetter, linkedinUrl, type Genre } from "@/lib/letters";
import { Avatar } from "@/components/ui/Avatar";
import { inviteLetterPdf, downloadBytes } from "@/lib/pdf";
import { fx } from "@/lib/audio";

const TABS: { id: Genre; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "phone", label: "Phone" },
];

export default function LetterModal() {
  const speaker = useStore((s) => s.activeLetterSpeaker);
  const setActive = useStore((s) => s.setActiveLetterSpeaker);
  const [tab, setTab] = useState<Genre>("email");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (speaker) setTab("email");
  }, [speaker]);

  if (!speaker) return null;
  const letter = buildLetter(speaker, tab);

  const copy = async () => {
    const text = tab === "email" ? letter.body : tab === "phone" ? letter.phone : tab === "whatsapp" ? letter.whatsapp : letter.dm;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const exportPdf = async () => {
    const bytes = await inviteLetterPdf(speaker);
    downloadBytes(bytes, `${speaker.id}-invite.pdf`);
  };

  const content = tab === "email" ? letter.body : tab === "phone" ? letter.phone : tab === "whatsapp" ? letter.whatsapp : letter.dm;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1300] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur" onClick={() => setActive(null)} />
        <motion.div
          className="glass-strong relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden"
          initial={{ y: 30, scale: 0.96, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.97, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* letterhead */}
          <div className="relative border-b border-white/10 bg-[#eb0028]/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="font-display text-lg font-black tracking-tight">
                TED<span className="text-[#eb0028]">x</span> <span className="text-white">BIT JAIPUR</span>
              </div>
              <div className="ml-auto text-right">
                <div className="label-cap text-[10px]">Invite Letter</div>
                <div className="font-mono text-[11px] text-white/60">{speaker.id}</div>
              </div>
            </div>
          </div>

          {/* tabs */}
          <div className="flex gap-1 border-b border-white/10 bg-black/20 px-3 py-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  fx.play("tick");
                  setTab(t.id);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  tab === t.id ? "bg-[#eb0028] text-white" : "text-white/60 hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* body */}
          <div className="flex items-center gap-3 px-5 pt-4">
            <Avatar id={speaker.id} accent={speaker.accentColor} size={40} />
            <div>
              <div className="text-sm font-semibold text-white">{speaker.name}</div>
              <div className="text-[11px] text-white/50">
                {tab === "email" && letter.subjectA}
                {tab === "email" && <span className="block text-white/35">Alt subject: {letter.subjectB}</span>}
              </div>
            </div>
          </div>

          <div className="dossier-scroll flex-1 overflow-y-auto px-5 py-4">
            <div className="whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/80">
              {content}
            </div>
          </div>

          {/* actions */}
          <div className="flex items-center gap-2 border-t border-white/10 bg-black/30 px-4 py-3">
            <a
              href={linkedinUrl(speaker)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => fx.play("open")}
              className="btn btn-ghost text-xs"
            >
              in LinkedIn
            </a>
            <button onClick={copy} className="btn btn-ghost flex-1 text-xs">
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <button onClick={exportPdf} className="btn btn-ghost flex-1 text-xs">
              Download PDF
            </button>
            <button
              onClick={() => {
                fx.play("chime");
                setActive(null);
              }}
              className="btn btn-primary flex-1 text-xs"
            >
              Mark as sent
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
