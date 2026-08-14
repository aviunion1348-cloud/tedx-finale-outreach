# Data Notice

**All 500 speaker profiles in this project are synthetic (fictional).**

- They were deterministically generated from name/org/topic/bio fragment banks
  (seed `2026-08-14`) to exercise the outreach workflow realistically — 300 Jaipur /
  75 Rajasthan belt / 100 Delhi-NCR / 25 stretch cities, ≈45% women, sensible
  scores, travel costs, and feasibility labels.
- **Emails are masked** (e.g. `a•••••@gmail.com`). No real person's contact
  information is contained in this dataset.
- 40 "signature" people (puppeteer, rally driver, Paralympian, ASHA worker, IAS,
  etc.) are named archetypes written to illustrate the kinds of stories a real
  event would seek — they are **not** real individuals.
- Portraits shown in the UI are procedurally generated canvas sigils, not real
  photos. Plates in `public/tabloids/` are synthetic artwork.

## Going live with real speakers

To replace the synthetic pool with real talent:

1. Replace `public/data/speakers.json` with real records matching
   `types/speaker.ts` (the `speakerSchema`).
2. Re-run `node scripts/generate-search-assets.mjs` to rebuild the concept map
   and embeddings for search.
3. Optionally re-render plates with `generate-tabloids.py`.

## Geographic model

Campus is treated as BIT Mesra, Jaipur Campus (Chitrakoot). All travel costs,
feasibility labels (`walk-in → virtual-only`), and travel-risk flags derive from
a haversine distance model in `lib/geo.ts`.
