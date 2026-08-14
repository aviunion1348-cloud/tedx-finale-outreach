// Lenis smooth-scroll singleton.
import Lenis from "lenis";

let lenis: Lenis | null = null;

export function initLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (lenis) return lenis;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  lenis = new Lenis({
    duration: 1.1,
    smoothWheel: !prefersReduced,
    touchMultiplier: 1.4,
  });
  const raf = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  return lenis;
}

export function scrollTo(target: string | number, opts?: { offset?: number; duration?: number }) {
  lenis?.scrollTo(target as never, opts as never);
}

export function stopLenis() {
  lenis?.stop();
}

export function startLenis() {
  lenis?.start();
}

export function destroyLenis() {
  lenis?.destroy();
  lenis = null;
}
