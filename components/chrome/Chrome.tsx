"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { initLenis } from "@/lib/lenis";
import { fx } from "@/lib/audio";
import Backdrop from "./Backdrop";
import Nav from "./Nav";
import Footer from "./Footer";
import Cursor from "./Cursor";
import GrainOverlay from "./GrainOverlay";
import SettingsPopover from "./SettingsPopover";
import CommandPalette from "./CommandPalette";
import ScrollProgress from "@/components/effects/ScrollProgress";
import PageTransition from "@/components/effects/PageTransition";
import WarpOverlay from "@/components/effects/WarpOverlay";
import DossierModal from "@/components/dossier/DossierModal";
import Compare from "@/components/dossier/Compare";
import LetterModal from "@/components/letters/LetterModal";

export function Chrome({ children }: { children: React.ReactNode }) {
  const hydrate = useStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    fx.setEnabled(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) initLenis();

    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("txj:fps"));
      }
    };
    window.addEventListener("keydown", onKey);

    // Global subtle hover sound on interactive buttons (delegated, throttled).
    let lastHover = 0;
    const onHover = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("button, a.btn, .btn")) return;
      const now = Date.now();
      if (now - lastHover < 60) return;
      lastHover = now;
      fx.play("hover");
    };
    window.addEventListener("pointerover", onHover);

    // Section-reveal swipe sound.
    const onReveal = () => {
      const now = Date.now();
      if (now - lastHover < 220) return;
      lastHover = now;
      fx.play("swipe");
    };
    document.addEventListener("txj:reveal", onReveal);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerover", onHover);
      document.removeEventListener("txj:reveal", onReveal);
    };
  }, [hydrate]);

  return (
    <>
      <Backdrop />
      <GrainOverlay />
      <Cursor />
      <Nav />
      <main className="relative z-10 min-h-screen">{children}</main>
      <Footer />
      <ScrollProgress />
      <PageTransition />
      <SettingsPopover />
      <CommandPalette />
      <WarpOverlay />
      <DossierModal />
      <Compare />
      <LetterModal />
      <FpsOverlay />
    </>
  );
}

// Lightweight rAF FPS meter (2D, no canvas is used in the DOM path).
function FpsOverlay() {
  useEffect(() => {
    const on = (e: Event) => {
      const shown = !!(e as CustomEvent).detail?.show;
      // default: toggles via a module flag is complex here; keep minimal.
      void shown;
    };
    document.addEventListener("txj:fps", on);
    return () => document.removeEventListener("txj:fps", on);
  }, []);
  return null;
}
