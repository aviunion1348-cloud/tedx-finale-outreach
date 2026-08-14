// Deterministic canvas portrait: FNV hash → concentric rings / spokes / a sigil,
// rendered to a data URL so no image assets are needed. Memoised per speaker id.

let memo = new Map<string, string>();

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLORS = ["#EB0028", "#FF3B55", "#FF7A00", "#E53935", "#C2185B", "#7B1FA2", "#5C6BC0"];

export function portraitDataURL(id: string, accent = "#EB0028", size = 320): string {
  if (memo.has(id)) return memo.get(id)!;
  const seed = fnv1a(id);
  const rnd = mulberry(seed);
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.42;

  // base disc
  const bg = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
  bg.addColorStop(0, "#1a0a0f");
  bg.addColorStop(1, "#000");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  // accent ring
  ctx.strokeStyle = accent;
  ctx.lineWidth = size * 0.012;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.96, 0, Math.PI * 2);
  ctx.stroke();

  // radiating spokes
  const spokes = 3 + ((rnd() * 7) | 0);
  ctx.strokeStyle = accent;
  ctx.lineWidth = size * 0.01;
  ctx.globalAlpha = 0.8;
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2 + rnd() * 0.4;
    const r1 = R * (0.2 + rnd() * 0.1);
    const r2 = R * (0.6 + rnd() * 0.3);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }

  // concentric rings
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = COLORS[(rnd() * COLORS.length) | 0];
  ctx.lineWidth = size * 0.008;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, R * (0.3 + i * 0.2), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // central sigil: stylized person glyph / burst
  const sigil = (rnd() * 4) | 0;
  ctx.fillStyle = accent;
  if (sigil === 0) {
    // diamond
    ctx.beginPath();
    ctx.moveTo(cx, cy - R * 0.18);
    ctx.lineTo(cx + R * 0.14, cy);
    ctx.lineTo(cx, cy + R * 0.18);
    ctx.lineTo(cx - R * 0.14, cy);
    ctx.closePath();
    ctx.fill();
  } else if (sigil === 1) {
    // circle burst
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (sigil === 2) {
    // triangle
    ctx.beginPath();
    ctx.moveTo(cx, cy - R * 0.16);
    ctx.lineTo(cx + R * 0.14, cy + R * 0.14);
    ctx.lineTo(cx - R * 0.14, cy + R * 0.14);
    ctx.closePath();
    ctx.fill();
  } else {
    // four dots
    const offs = R * 0.08;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.arc(cx + dx * offs, cy + dy * offs, R * 0.04, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // noise specks
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let i = 0; i < 40; i++) {
    const x = cx + (rnd() - 0.5) * 2 * R;
    const y = cy + (rnd() - 0.5) * 2 * R;
    if ((x - cx) ** 2 + (y - cy) ** 2 <= R * R) {
      ctx.beginPath();
      ctx.arc(x, y, rnd() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const url = c.toDataURL("image/png");
  memo.set(id, url);
  return url;
}
