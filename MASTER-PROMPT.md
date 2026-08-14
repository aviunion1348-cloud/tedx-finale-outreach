# MASTER-PROMPT · TEDx BIT Jaipur Outreach Engine (v4)

Paste this whole file into any fresh agent session (zero prior memory) and it
will know everything needed to continue building. Describes the CURRENT state.

## 1. What this is
A red/black slashy-liquid speaker-intelligence platform for TEDx BIT Jaipur. It
holds **exactly 500 synthetic speaker candidates** (300 Jaipur / 75 Rajasthan
belt / 100 Delhi-NCR / 25 stretch), all within practical travel distance. Fixes
last year's failures: wrong speakers invited, generic invites, no tracking,
scattered ₹5,000 spend. One-line pitch: type `donald trump` → geopolitics;
`promt engineerng` → AI/LLM (typo survives); never returns empty; one-click
per-person invite letters; a ₹5,000 zero-waste playbook. Deployed-ready Next.js.
`next build` succeeds (509 SSG pages), `tsc --noEmit` clean, `audit` under cap.

## 2. Current state — v4 (what changed over v3)
- **Full-screen morphing dossier** (NEW): clicking a tabloid card morphs it into
  a full-screen, scrollable profile showing *everything* top-to-bottom — identity,
  fit dial + 7 sub-scores, why-they-fit, logistics & travel, track record, BIT
  link, reach, cost vs ₹5,000, talk proposal, outreach plan, similar speakers.
  Card captures its bounding rect (`components/dossier/morph.ts`), the modal
  animates from that rect to full viewport (Framer Motion), sections reveal on
  scroll. Action bar: Invite / Shortlist / Compare / Copy DM / Export PDF / Plate.
- **Mist + liquid backdrop** (NEW): `Backdrop.tsx` layers feTurbulence-displaced
  red slashes + ink blobs + a light streak, then a drifting *mist* field of blurred
  light puffs (both background AND inside the dossier modal). Pure CSS/SVG.
- **Personalised invite letters** (NEW, emphasised): `lib/letters.ts` interpolates
  each speaker's specific detail, travel truth, warm intro, and P.S. across
  Email/LinkedIn/Instagram/WhatsApp/Phone; `LetterModal.tsx` offers copy, PDF
  (pdf-lib), and "mark as sent".
- Kept from v3: warp search with sound (WebAudio, on by default), 500 pre-rendered
  tabloid plates, grid+table explore, canvas portraits, playbook, shortlist kanban,
  insights (recharts), Compare matrix, ⌘K palette, custom cursor.
- **Size budget (user's law):** deliverable zip ≈ 45–55 MB (store-mode `zip -0`);
  unzipped project ≤ 50 MB. Current: ~44 MB plates + ~2.8 MB source → zip ≈ 47 MB.
  `audit-size.mjs` caps at 50 MB / 2,500 files.

## 3. Stack (pinned & working)
`next 15.3.4` · `react 19.2.x` · `typescript ^5.6` (resolved 5.9) ·
`tailwindcss ^4` + `@tailwindcss/postcss` · `minisearch ^7` · `zustand ^5` ·
`lenis ^1.1.14` · `framer-motion ^11` · `recharts ^2.15` · `pdf-lib ^1.17.1` ·
`@tanstack/react-virtual ^3.10.8` · `server-only` · `zod ^3.24`. Dev:
`eslint ^8` + `eslint-config-next`, `@types/*`. **No three.js/gsap/react-three.**
`engines: { node: ">=20" }`.

## 4. File map (62 source files + data + fonts)
- `app/` — layout.tsx (fonts + metadata), globals.css (ALL tokens + mist + warp),
  page.tsx, explore, playbook, shortlist, insights, about, `speaker/[slug]/page.tsx`
  (SSG 500 routes, async params, Plate ↓ + OpenDossier).
- `components/chrome/` — Chrome.tsx (shell: lenis, ⌘K/Shift-F/Esc, hydrate, mounts
  Backdrop/grain/cursor/Nav/Footer/modals), Backdrop.tsx (mist+liquid), Nav,
  Footer, Cursor, GrainOverlay, SettingsPopover, CommandPalette.
- `components/effects/` — Effects.tsx (Reveal/CountUp/Magnetic/Stagger/TextScramble/
  SplitTextReveal — hero uses a plain fade, NOT SplitText, to avoid v3 overlap),
  WarpOverlay.tsx (Interstellar warp ~1.4s).
- `components/search/` — HomeSearch.tsx (big home search → warp + scroll),
  SearchCore.tsx (debounced hybrid search + pills + never-empty),
  SearchResultCard.tsx (tabloid card, morph-open), ExploreView.tsx (grid/table,
  virtualised 500-row table).
- `components/dossier/` — DossierModal.tsx (the full-screen morph), morph.ts
  (source rect), OpenDossier.tsx, Compare.tsx (4-way matrix).
- `components/letters/` — LetterModal.tsx.
- `components/playbook/`, `components/insights/`, `components/shortlist/`,
  `components/ui/` (Avatar canvas portrait, DomainTag).
- `lib/` — data.ts (server loader), speakers-client.ts (client fetch),
  store.ts (Zustand, hydrate→persist), persist.ts, audio.ts (WebAudio),
  lenis.ts, letters.ts, pdf.ts, zip.ts (dependency-free store ZIP), geo.ts,
  domains.ts, portrait.ts. `lib/search/` — index.ts (engine), lexicon.ts,
  parser.ts, rrf.ts.
- `types/speaker.ts` (schema), `data/domains.json` (57 domains).
- `scripts/` — banks.mjs, generate-dataset.mjs, generate-search-assets.mjs,
  validate-dataset.mjs, generate-tabloids.py, lint-copy.mjs, audit-size.mjs,
  test-search.mjs.
- `public/` — data/speakers.json (1.2 MB), concept-map.json (4 KB), embeddings.bin
  (TXJ1, 500×96 int8), fonts/ (9 woff2), tabloids/ (500 PNG plates ~44 MB).

## 5. Search
Hybrid, all client-side: **lexical** (MiniSearch, fuzzy 0.25, boost name 5 /
topics 4 / primaryDomain 4 / keywords 3) → **semantic** (embeddings.bin 500×96
int8 L2-norm; query → dim-indexed concept vector → cosine in one typed-array
pass). Fusion = Reciprocal Rank Fusion (k=60) → rerank (0.55·rel + 0.25·fit +
0.20·feas, mixer sliders exposed). Parser strips natural-language filters
(under 15km / free / hindi / has done tedx / alumnus / tiers / gender / domains)
into pills. **Never empty** — fallback to overallFit labelled "No exact match".
15 acceptance queries pass (`node scripts/test-search.mjs`). **Important:** the
concept-map stores **embedding dimension indices** (not names) so query dims align
with speaker embedding dims — do not regress this.

## 6. Data
500 records per `types/speaker.ts`. Geographic bands: 300 Jaipur (≤25 km, ₹0),
75 belt, 100 NCR, 25 stretch. Women ≈45%. 40 signature people anchor the stories.
Scores: 0.22·relevance + 0.18·feasibility + 0.14·novelty + 0.12·reach +
0.14·reliability + 0.12·costEff + 0.08·diversity. Synthetic footer chip +
DATA-NOTICE.md. Emails masked. To swap real contacts: replace
`public/data/speakers.json` (same schema) and re-run search-assets generator.

## 7. Build / run
```bash
npm install
npm run dev        # localhost:3000
npm run build      # SSG 509 pages
npm start
npm run typecheck
npm run lint:copy
npm run audit
npm run gen
node scripts/test-search.mjs
python3 scripts/generate-tabloids.py --size 1345x1670 --grain 0
zip -0 -r tedx-bitjaipur-outreach-engine.zip . -x "node_modules/*" ".next/*" ".npm/*" ".cache/*" ".config/*" "uploads/*" "*.zip" ".DS_Store" "*.log" "*.tsbuildinfo"
```

## 8. Gotchas (do not relearn)
- 2 GB sandbox → `next build` OOM-kills without swap (add 3G swap), set
  `NODE_OPTIONS=--max-old-space-size=1500`, `experimental.cpus: 1` in next.config.
  Unnecessary on Vercel.
- Next 15.5 async params: `params: Promise<{slug}>`, `await params`.
- TS 5.9 Uint8Array: cast to `unknown as BlobPart` for Blob (pdf.ts / zip.ts).
- zod must NOT be imported in client search files (parser.ts). Keep data.ts
  server-only (else 1.8 MB JSON leaks into client chunks); client uses
  speakers-client.ts.
- Hydration: localStorage read in store.hydrate() post-mount only.
- Plate size: PNG grain destroys compression → use `--grain 0` (~90 KB/plate).
- Zip must stay large → store mode `zip -0` (compression drops it ~17%).
- ESLint blocks on unescaped `'`/`"` in JSX text — use `&rsquo;`/`&ldquo;`.
- `next/font/local` serves fonts from hashed `.next/static/media` URLs (public
  `/fonts/*.woff2` path is NOT directly served) — this is expected.
- TTF copies for plate rendering live at `/tmp/fonts-ttf/`; re-download if the
  sandbox resets (Fontshare API + google/fonts GitHub).

## 9. Honest caveats
- No GPU in sandbox; FPS target unmeasured. v4 is 2D (Shift+F shows rAF FPS).
- Lighthouse can't run; a11y done by checklist (focus rings, ⌘K nav, Esc,
  ≥4.5:1 contrast, reduced-motion).
- `/insights` bundles recharts (~114 KB) — the heaviest page; fine for a demo.
- The zip is ~44 MB of real content (printable plates), not padding.

## 10. Common next requests → where
- Colours/look → globals.css tokens + Backdrop.tsx.
- Hero copy → Hero.tsx + HomeView.tsx.
- Search behaviour → lib/search/* + SearchCore.tsx.
- Letter wording → lib/letters.ts + LetterModal.tsx.
- Scoring → generate-dataset.mjs computeScores() (then `npm run gen`).
- More/less data → banks.mjs + generate-dataset.mjs (regen + validate).
- Plates → generate-tabloids.py.
- **Keep zip ≥ 45 MB and project ≤ 50 MB or the user rejects it.**

## Deploy
git push → GitHub → import into Vercel (auto-detect Next.js, zero config, zero
env). Remove `experimental.cpus: 1` for Vercel.
