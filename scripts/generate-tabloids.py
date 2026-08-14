#!/usr/bin/env python3
"""
Render the 500 tabloid plates (1345x1670 red/black PNG) with Pillow.
Deterministic per speaker id. grain=0 keeps PNGs small (~90 KB each).
Flags: --size WxH  --grain 0..100  --limit N  --out DIR
Reads fonts from /tmp/fonts-ttf/ (Clash Display, Satoshi, JetBrains Mono).
"""
import argparse, json, math, os, random, sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FONT_DIR = os.environ.get("FONT_DIR", "/tmp/fonts-ttf")
TED = (235, 0, 40)
TED_HOT = (255, 59, 85)
WHITE = (243, 243, 245)
MUTED = (150, 150, 160)
DIM = (100, 100, 112)

COLORS = [TED, TED_HOT, (255, 122, 0), (229, 57, 53), (194, 24, 91), (123, 31, 162), (92, 107, 192)]


def font(name, size):
    return ImageFont.truetype(os.path.join(FONT_DIR, name + ".ttf"), size)


def fnv1a(s):
    h = 0x811C9DC5
    for ch in s:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h


def mulberry(seed):
    a = seed & 0xFFFFFFFF
    def rnd():
        nonlocal a
        a = (a + 0x6D2B79F5) & 0xFFFFFFFF
        t = a
        t = ((t << 15) & 0xFFFFFFFF) ^ (t >> 1) if False else t
        t = ((t ^ (t >> 30)) * 0xBF58476D1CE4E5B9) & 0xFFFFFFFF
        t = ((t ^ (t >> 27)) * 0x94D049BB133111EB) & 0xFFFFFFFF
        return ((t ^ (t >> 31)) & 0xFFFFFFFF) / 4294967296
    return rnd


def draw_sigil(draw, cx, cy, R, accent, seed):
    rnd = mulberry(seed)
    # outer ring
    draw.ellipse([cx - R, cy - R, cx + R, cy + R], outline=accent, width=max(3, int(R * 0.03)))
    # spokes
    spokes = 3 + int(rnd() * 7)
    for i in range(spokes):
        a = (i / spokes) * math.tau + rnd() * 0.4
        r1 = R * (0.2 + rnd() * 0.1)
        r2 = R * (0.6 + rnd() * 0.3)
        x1, y1 = cx + math.cos(a) * r1, cy + math.sin(a) * r1
        x2, y2 = cx + math.cos(a) * r2, cy + math.sin(a) * r2
        draw.line([x1, y1, x2, y2], fill=accent, width=max(2, int(R * 0.02)))
    # concentric rings
    for i in range(3):
        r = R * (0.3 + i * 0.2)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=COLORS[int(rnd() * len(COLORS)) % len(COLORS)], width=max(1, int(R * 0.015)))
    # central sigil
    sig = int(rnd() * 4)
    s = R * 0.18
    if sig == 0:
        draw.polygon([(cx, cy - s), (cx + s, cy), (cx, cy + s), (cx - s, cy)], fill=accent)
    elif sig == 1:
        draw.ellipse([cx - s, cy - s, cx + s, cy + s], fill=accent)
    elif sig == 2:
        draw.polygon([(cx, cy - s), (cx + s * 0.9, cy + s * 0.9), (cx - s * 0.9, cy + s * 0.9)], fill=accent)
    else:
        o = R * 0.08
        for dx, dy in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
            draw.ellipse([cx + dx * o - s * 0.3, cy + dy * o - s * 0.3, cx + dx * o + s * 0.3, cy + dy * o + s * 0.3], fill=accent)


def add_grain(img, amount):
    if amount <= 0:
        return
    px = img.load()
    rnd = random.Random(2026)
    w, h = img.size
    for _ in range(int(w * h * amount / 300)):
        x, y = rnd.randrange(w), rnd.randrange(h)
        r, g, b = px[x, y][:3]
        n = rnd.randint(-30, 30)
        px[x, y] = (max(0, min(255, r + n)), max(0, min(255, g + n)), max(0, min(255, b + n)))


def wrap_text(text, font, maxw, draw):
    words = text.split()
    lines, line = [], ""
    for w in words:
        t = (line + " " + w).strip()
        if draw.textlength(t, font=font) > maxw and line:
            lines.append(line)
            line = w
        else:
            line = t
    if line:
        lines.append(line)
    return lines


def render(s, size, grain):
    W, H = size
    img = Image.new("RGB", (W, H), (8, 8, 13))
    draw = ImageDraw.Draw(img, "RGBA")
    accent = tuple(int(s["accentColor"].lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))

    # subtle radial glow
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    r = int(W * 0.7)
    gd.ellipse([W - r, -r, W, 0], fill=(accent[0], accent[1], accent[2], 40))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(img)

    # top-left diagonal slash
    draw.polygon([(0, 0), (int(W * 0.55), 0), (int(W * 0.42), int(H * 0.16)), (0, int(H * 0.13))], fill=(accent[0], accent[1], accent[2], 90))
    # thin red rule
    draw.rectangle([0, int(H * 0.17), W, int(H * 0.17) + 4], fill=(accent[0], accent[1], accent[2], 200))

    f_display_bold = font("ClashDisplay-Bold", int(W * 0.05))
    f_display_semi = font("ClashDisplay-Semibold", int(W * 0.032))
    f_body = font("Satoshi-Regular", int(W * 0.028))
    f_body_bold = font("Satoshi-Bold", int(W * 0.028))
    f_mono = font("JetBrainsMono-Regular", int(W * 0.026))

    # header
    draw.text((int(W * 0.06), int(H * 0.035)), "TED", font=f_display_bold, fill=WHITE)
    draw.text((int(W * 0.06) + f_display_bold.getlength("TED"), int(H * 0.035)), "x", font=f_display_bold, fill=TED)
    draw.text((int(W * 0.06) + f_display_bold.getlength("TEDx"), int(H * 0.035)), "  BIT JAIPUR", font=f_display_semi, fill=(220, 220, 225))
    idw = f_mono.getlength(s["id"])
    draw.text((W - int(W * 0.06) - idw, int(H * 0.045)), s["id"], font=f_mono, fill=MUTED)
    # header rule
    draw.line([int(W * 0.06), int(H * 0.115), W - int(W * 0.06), int(H * 0.115)], fill=(60, 60, 72), width=2)

    # sigil
    cx, cy = int(W * 0.30), int(H * 0.42)
    R = int(W * 0.16)
    draw_sigil(draw, cx, cy, R, accent, fnv1a(s["id"]))

    # name / role (right of sigil)
    nx = int(W * 0.52)
    name_lines = wrap_text(s["name"], f_display_bold, W * 0.42, draw)
    yy = int(H * 0.30)
    for line in name_lines[:2]:
        draw.text((nx, yy), line, font=f_display_bold, fill=WHITE)
        yy += int(W * 0.062)
    yy += int(W * 0.01)
    draw.text((nx, yy), s["role"], font=f_body_bold, fill=TED_HOT)
    yy += int(W * 0.048)
    draw.text((nx, yy), s["org"], font=f_body, fill=MUTED)
    yy += int(W * 0.048)
    draw.text((nx, yy), f"{s['city']}, {s['state']} · {s['pronouns']}", font=f_mono, fill=DIM)

    # fit score big
    draw.text((int(W * 0.06), int(H * 0.56)), f"{s['scores']['overallFit']}", font=font("ClashDisplay-Bold", int(W * 0.14)), fill=TED)
    draw.text((int(W * 0.06) + f_display_bold.getlength(str(s['scores']['overallFit'])), int(H * 0.615)), "/100", font=f_display_semi, fill=MUTED)
    draw.text((int(W * 0.06), int(H * 0.70)), "FIT SCORE", font=f_mono, fill=MUTED)

    # domain chips
    dx = int(W * 0.06)
    dy = int(H * 0.76)
    draw.text((dx, dy), "DOMAINS", font=f_mono, fill=DIM)
    cy2 = dy + int(W * 0.045)
    for dom in [s["primaryDomain"]] + s["secondaryDomains"][:2]:
        txt = dom.replace("-", " ").upper()
        wdt = f_mono.getlength(txt) + int(W * 0.03)
        draw.rounded_rectangle([dx, cy2, dx + wdt, cy2 + int(W * 0.05)], radius=int(W * 0.012), fill=(accent[0], accent[1], accent[2], 40), outline=(accent[0], accent[1], accent[2], 120))
        draw.text((dx + int(W * 0.015), cy2 + int(W * 0.008)), txt, font=f_mono, fill=TED_HOT)
        dx += wdt + int(W * 0.015)
        if dx > W * 0.94:
            dx = int(W * 0.06)
            cy2 += int(W * 0.065)

    # divider
    draw.line([int(W * 0.06), int(H * 0.845), W - int(W * 0.06), int(H * 0.845)], fill=(50, 50, 62), width=2)

    # logistics strip
    logs = [
        ("DISTANCE", f"{round(s['distanceKm'])} km"),
        ("COST", f"₹{s['fee']['totalEstCostINR']:,}"),
        ("FEASIBILITY", s["feasibility"].upper()),
        ("TEDx TALKS", str(len(s["speakingExperience"]["tedxTalks"]))),
    ]
    lx = int(W * 0.06)
    colw = W * 0.21
    for label, val in logs:
        draw.text((lx, int(H * 0.885)), label, font=f_mono, fill=DIM)
        draw.text((lx, int(H * 0.925)), val, font=f_body_bold, fill=WHITE)
        lx += int(colw)

    # bottom bar
    draw.rectangle([0, int(H * 0.975), W, H], fill=(15, 15, 22))
    draw.text((int(W * 0.06), int(H * 0.985)), "SYNTHETIC DATASET · TEDx BIT JAIPUR 2026", font=f_mono, fill=(200, 160, 40))
    dl = f_display_semi.getlength(s["proposedTalkTitle"][:34])
    draw.text((W - int(W * 0.06) - dl, int(H * 0.985)), s["proposedTalkTitle"][:34], font=f_display_semi, fill=MUTED)

    if grain > 0:
        add_grain(img, grain)
    return img


def render_plate(s, size, grain, colors):
    img = render(s, size, grain)
    if colors:
        # Quantize to a small palette — flat red/black graphics shrink ~2.5x.
        img = img.quantize(colors=colors, method=Image.MEDIANCUT)
    return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--size", default="1200x1490")
    ap.add_argument("--grain", type=int, default=0)
    ap.add_argument("--colors", type=int, default=64)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--out", default=os.path.join(ROOT, "public/tabloids"))
    args = ap.parse_args()
    w, h = map(int, args.size.split("x"))
    speakers = json.load(open(os.path.join(ROOT, "public/data/speakers.json")))
    if args.limit:
        speakers = speakers[: args.limit]
    os.makedirs(args.out, exist_ok=True)
    for i, s in enumerate(speakers):
        img = render_plate(s, (w, h), args.grain, args.colors)
        img.save(os.path.join(args.out, f"{s['id']}.png"), optimize=True)
        if (i + 1) % 100 == 0:
            print(f"{i+1}/{len(speakers)}")
    print(f"done: {len(speakers)} plates → {args.out}")


if __name__ == "__main__":
    main()
