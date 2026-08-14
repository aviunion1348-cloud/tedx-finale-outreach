"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { fx } from "@/lib/audio";

const LINKS = [
  { href: "/explore", label: "001_FIELD" },
  { href: "/playbook", label: "002_PLAYBOOK" },
  { href: "/shortlist", label: "003_SHORTLIST" },
  { href: "/insights", label: "004_INSIGHTS" },
  { href: "/about", label: "005_ABOUT" },
];

export default function Nav() {
  const shortlist = useStore((s) => s.shortlist);
  const audioEnabled = useStore((s) => s.audioEnabled);
  const setAudioEnabled = useStore((s) => s.setAudioEnabled);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openPalette = () => {
    fx.play("open");
    document.dispatchEvent(new CustomEvent("txj:palette", { detail: { open: true } }));
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[900] transition-all ${
        scrolled ? "bg-[#07070b]/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-0.5 font-display text-lg font-black tracking-tight">
          <span className="text-white">TED</span>
          <span className="text-[#eb0028]">x</span>
          <span className="ml-1 text-white/90">BIT</span>
          <span className="ml-1 text-sm text-white/60">JAIPUR</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-4 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="label-cap text-white/55 transition hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={openPalette}
            className="btn btn-ghost hidden !py-1.5 !text-[11px] sm:inline-flex"
            title="Search (⌘K)"
          >
            <span className="text-white/50">⌘K</span> Search
          </button>

          <Link href="/shortlist" className="relative">
            <button className="btn btn-ghost !py-1.5 text-[11px]">★</button>
            {shortlist.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#eb0028] px-1 font-mono text-[10px] text-white">
                {shortlist.length}
              </span>
            )}
          </Link>

          <button
            onClick={() => {
              const v = !audioEnabled;
              setAudioEnabled(v);
              fx.setEnabled(v);
              if (v) fx.play("chime");
            }}
            className="btn btn-ghost !py-1.5 text-[11px]"
            title="Toggle sound"
          >
            {audioEnabled ? "🔊" : "🔇"}
          </button>

          <Link href="/explore" className="btn btn-primary hidden !py-1.5 text-[11px] sm:inline-flex">
            Explore
          </Link>
        </div>
      </div>
    </header>
  );
}
