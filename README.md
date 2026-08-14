# TEDx BIT Jaipur — Outreach Engine

A red-and-black, slashy-liquid speaker-intelligence platform for the TEDx Club at
Birla Institute of Technology, Mesra — Jaipur Campus. It holds **500 synthetic
speaker candidates** (all within practical travel distance), and solves last
season's outreach failures: wrong speakers invited, generic invites, no tracking,
scattered ₹5,000 marketing spend.

**One-line pitch:** type `donald trump` → geopolitics speakers; type `promt
engineeng` → AI/LLM (typo survives); it never returns empty; one-click
personalised invite letters; a built-in ₹5,000 zero-waste playbook.

## v4 highlights

- **Full-screen morphing dossier** — click any tabloid card and it expands into a
  complete, scrollable profile of the person (identity → scores → why-they-fit →
  logistics → track record → BIT link → reach → cost vs budget → talk proposal →
  outreach plan → similar speakers), so you can decide whether to call before you
  pick up the phone.
- **Drifting mist + liquid backdrop** — a premium red/black field with displaced
  watery slashes, ink blobs, a light streak, and layered moving *mist* puffs.
- **Personalised prewritten invite letters** — Email / LinkedIn / Instagram /
  WhatsApp / phone variants, each interpolating the speaker's specific detail, a
  travel truth, a warm intro, and a P.S. Copy, PDF export, and "mark as sent".
- **Warp search** — type → Interstellar-style warp transition with sound → results.
  Hybrid engine (lexical + concept-bridge + semantic embeddings, RRF fusion),
  never empty. Sound is on by default.
- **₹5,000 playbook**, shortlist kanban with budget/diversity meters, insights
  dashboard, and CSV / ZIP / plate exports.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · MiniSearch ·
Zustand · Lenis · Framer Motion · recharts · pdf-lib. Self-hosted fonts
(Clash Display, Satoshi, JetBrains Mono). Zero audio/image assets — all sound is
WebAudio, all portraits are canvas-generated.

## Commands

```bash
npm install
npm run dev            # local dev (http://localhost:3000)
npm run build          # production build (SSG 509 pages)
npm start              # serve production build
npm run typecheck      # tsc --noEmit
npm run lint:copy      # banned-word lint
npm run audit          # size audit (≤ 50 MB / 2,500 files)
npm run gen            # regenerate dataset + search assets + validate
npm run test:search    # 15 acceptance queries
python3 scripts/generate-tabloids.py --size 1345x1670 --grain 0   # re-render plates
```

## Deliverable

`tedx-bitjaipur-outreach-engine.zip` (store-mode, so it stays large) is the
single file to hand over / upload.

> All 500 profiles are **synthetic**. See `DATA-NOTICE.md`. Emails are masked.
