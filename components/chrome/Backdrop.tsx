"use client";

// The premium red/black background: watery displaced slashes + drifting ink
// blobs + a slow light streak, layered under (and over) the moving MIST puffs.

const SLASHES = [
  { x: "10%", y: "-10%", rot: 62, len: "90vw" },
  { x: "30%", y: "12%", rot: 74, len: "70vw" },
  { x: "-5%", y: "40%", rot: 58, len: "110vw" },
  { x: "55%", y: "55%", rot: 66, len: "80vw" },
  { x: "25%", y: "78%", rot: 71, len: "95vw" },
  { x: "70%", y: "90%", rot: 63, len: "75vw" },
];

const MIST = [
  { size: 480, top: "-6%", left: "-8%", delay: 0, dur: 17 },
  { size: 640, top: "12%", left: "58%", delay: 3, dur: 21 },
  { size: 420, top: "55%", left: "-10%", delay: 6, dur: 19, soft: true },
  { size: 700, top: "68%", left: "60%", delay: 9, dur: 23 },
  { size: 380, top: "30%", left: "34%", delay: 12, dur: 18, soft: true },
];

export default function Backdrop() {
  return (
    <>
      {/* liquid slash field */}
      <div className="liquid-field" aria-hidden>
        {[
          { w: "46vw", h: "46vw", t: "-18%", l: "-12%", d: "0s" },
          { w: "60vw", h: "60vw", t: "34%", l: "60%", d: "-12s" },
          { w: "34vw", h: "34vw", t: "70%", l: "-8%", d: "-6s" },
        ].map((b, i) => (
          <span
            key={i}
            className="ink-blob"
            style={{ width: b.w, height: b.h, top: b.t, left: b.l, animationDelay: b.d }}
          />
        ))}
        <svg viewBox="0 0 1200 1200" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="liquidGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff3b55" />
              <stop offset="0.5" stopColor="#eb0028" />
              <stop offset="1" stopColor="#5a0010" />
            </linearGradient>
            <filter id="liquidDisplace">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012 0.05"
                numOctaves="2"
                seed={7}
                result="n"
              />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="60" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          {SLASHES.map((s, i) => (
            <line
              key={i}
              className="slash-line"
              x1={0}
              y1={0}
              x2={1200}
              y2={1200}
              style={{
                transform: `translate(${s.x}, ${s.y}) rotate(${s.rot}deg)`,
                transformOrigin: "0 0",
              }}
            />
          ))}
        </svg>
        <span className="light-streak" style={{ top: "22%" }} />
        <span className="light-streak" style={{ top: "64%", animationDelay: "4.5s" }} />
      </div>

      {/* mist — the drifting luxury light layer */}
      <div className="mist-field" aria-hidden>
        {MIST.map((m, i) => (
          <span
            key={i}
            className={`mist-puff ${m.soft ? "soft" : ""}`}
            style={{
              width: m.size,
              height: m.size,
              top: m.top,
              left: m.left,
              animationDelay: `${m.delay}s`,
              animationDuration: `${m.dur}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
