"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Scroll-triggered reveal (IntersectionObserver). Not used in hero (was the
// overlap culprit in v3); used for sections that scroll into view.
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal-up ${inView ? "is-in" : ""} ${className || ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Animated count-up.
export function CountUp({ to, duration = 1.2 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);
  return <>{val.toLocaleString("en-IN")}</>;
}

// Magnetic hover pull.
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
      className="inline-block transition-transform duration-300"
      style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
    >
      {children}
    </div>
  );
}

// Stagger container + item.
export function StaggerList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
export function StaggerItem({ children, index = 0 }: { children: ReactNode; index?: number }) {
  return (
    <Reveal delay={index * 90} className="h-full">
      {children}
    </Reveal>
  );
}

// Placeholder-compatible effect exports (kept for API compat).
export function TextScramble({ text }: { text: string }) {
  return <span>{text}</span>;
}
export function SplitTextReveal({ text }: { text: string }) {
  // simple fade — NOT per-word (avoids the v3 overlap bug)
  return <span className="inline-block">{text}</span>;
}
export function Spotlight({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
export function Tilt3D({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
