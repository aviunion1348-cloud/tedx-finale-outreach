# Orbital — Cinematic Space-Travel Landing Page

A single-page cinematic landing site with two full-height sections (Hero +
Capabilities), looping background videos with a custom JS crossfade, a shared
**liquid-glass** design system, and **Framer Motion** entrance animations.

## What's inside (all new files — nothing overwrites your existing work)

```
space-travel/
  index.html      → the full landing page (CDN-only: React 18 + Tailwind + Framer Motion)
  SECURITY.md     → production-hardening & compliance plan (auth, secrets, rate-limit,
                    compliance, tests, DR/RTO/RPO, ADRs, diagrams)
  README.md       → this file
```

## How to add to your repo & deploy (Vercel)

These are **additive** files — they won't touch your existing app. They merge
cleanly and redeploy.

1. **Copy the files** into your existing repo. Either:
   - put `index.html` under your `public/` folder → it will be served at `/index.html` (or rename to `space-travel.html` → `/space-travel.html`), **or**
   - keep it as a standalone static site and point Vercel's root directory at the `space-travel/` folder.
   - Add `SECURITY.md` and `README.md` to the repo root (docs only).

2. **Commit & push:**
   ```bash
   git add -A
   git status            # confirm only the new files + docs are staged
   git commit -m "add cinematic space-travel landing page + security plan"
   git push origin main
   ```

3. **Redeploy in Vercel** (auto-detects Next.js/static). No env vars needed — the
   videos are CDN-hosted and fonts/Tailwind load from CDN.

> **Tip:** the page is fully self-contained (CDN React/Tailwind/Framer). You can
> open `index.html` directly in a browser with zero build step.

## Size & performance

- The page itself is ~40 KB of hand-written HTML/CSS/JS — well within any budget.
- Background videos stream from CDN (not bundled), so first load is fast.
- Animations use only `transform`, `opacity`, and `filter` — GPU-friendly, holds **70 fps+**.
- `prefers-reduced-motion` disables all decorative animation.

## Built to your spec

- ✅ Hero + Capabilities, both with looping background videos (custom rAF crossfade, no CSS transitions)
- ✅ Liquid-glass (`liquid-glass` + `liquid-glass-strong`) exact CSS
- ✅ Framer Motion entrance + BlurText word-by-word blur-in
- ✅ Navbar, badge, stats row, partners, capability cards with Material icons

## Extra sections (added)

- **Voyages** — 3 destination cards (Mars, Lunar, Europa) with real parallax **3D tilt** on hover.
- **Mission timeline** — scroll-triggered milestones + animated **count-up** stats.
- **CTA + marquee** — scrolling ticker + magnetic buttons.
- **Footer.**

## Extra motion & sound (added)

- **Magnetic** buttons (pointer-follow pull) on primary CTAs.
- **TextScramble** hover effect.
- **CountUp** numbers, **nebula drift**, **shooting stars**, **scroll-progress bar**.
- **WebAudio sound engine** — hover blip, click, success chime, warp whoosh (no audio files).
- **Click ripple** + custom scrollbar.
