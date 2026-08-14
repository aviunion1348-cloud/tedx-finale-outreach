// Hybrid client-side search engine.
// 3 layers (lexical → concept-bridge → semantic) fused via Reciprocal Rank
// Fusion, then re-ranked with the mixer. Never returns empty.
import MiniSearch from "minisearch";
import type { Speaker } from "@/types/speaker";
import type { RankingMixer } from "@/lib/store";
import { parseQuery, type ParseResult } from "./parser";
import {
  fetchEmbeddings,
  queryConceptVector,
  cosine,
  getEmbedding,
  l2Normalise,
  dimsCount,
} from "./lexicon";
import { rrf, rerank } from "./rrf";

let mini: MiniSearch | null = null;
let speakerList: Speaker[] = [];
let byId = new Map<string, Speaker>();
let embeddingsReady = false;

export async function initSearch(speakers: Speaker[]): Promise<void> {
  speakerList = speakers;
  byId = new Map(speakers.map((s) => [s.id, s]));
  if (!mini) {
    mini = new MiniSearch({
      fields: ["name", "headline", "org", "role", "city", "state", "topics", "keywords", "primaryDomain", "secondaryDomains", "bioShort"],
      storeFields: [],
      idField: "id",
      searchOptions: {
        prefix: true,
        fuzzy: 0.25,
        boost: { name: 5, topics: 4, primaryDomain: 4, keywords: 3, headline: 2, bioShort: 1, org: 1 },
      },
    });
    mini.addAll(
      speakers.map((s) => ({
        id: s.id,
        name: s.name,
        headline: s.headline,
        org: s.org,
        role: s.role,
        city: s.city,
        state: s.state,
        topics: s.topics.join(" "),
        keywords: s.keywords.join(" "),
        primaryDomain: s.primaryDomain,
        secondaryDomains: s.secondaryDomains.join(" "),
        bioShort: s.bioShort,
      }))
    );
  }
  if (!embeddingsReady) {
    try {
      await fetchEmbeddings("/data/embeddings.bin");
      embeddingsReady = true;
    } catch {
      embeddingsReady = false;
    }
  }
}

export interface SearchOutcome {
  results: Speaker[];
  interpreted: ParseResult;
  emptyFallback: boolean;
}

export async function search(query: string, mixer: RankingMixer): Promise<SearchOutcome> {
  await initSearch(speakerList.length ? speakerList : await ensureSpeakers());
  const q = query.trim();
  if (!q) {
    return {
      results: [...speakerList].sort((a, b) => b.scores.overallFit - a.scores.overallFit).slice(0, 24),
      interpreted: parseQuery(q),
      emptyFallback: false,
    };
  }

  const parsed = parseQuery(q);
  const residual = parsed.residual || q;
  const needFilters = applyFiltersNeeded(parsed);

  // ---- layer 1: lexical ----
  const lexHits = mini!.search(residual);
  const lexIds = lexHits.map((h) => h.id as string);

  // ---- layer 2+3: semantic — query concepts (dim-indexed) vs speaker embeddings ----
  const qVec = queryConceptVector(residual);
  const semIds: string[] = [];
  if (embeddingsReady && qVec.size > 0) {
    const { dims, count } = dimsCount();
    const qEmbed = l2Normalise(dimVector(qVec, dims));
    const scored: { id: string; c: number }[] = [];
    for (let i = 0; i < Math.min(count, speakerList.length); i++) {
      const emb = getEmbedding(i);
      if (emb) {
        const c = cosine(qEmbed, emb);
        if (c > 0.02) scored.push({ id: speakerList[i].id, c });
      }
    }
    scored.sort((a, b) => b.c - a.c);
    semIds.push(...scored.map((x) => x.id));
  }

  // ---- fuse ----
  const fused = rrf([lexIds, semIds]);
  let ranked = rerank(fused, byId, mixer);

  // ---- apply parsed filters ----
  if (needFilters) ranked = applyFilters(ranked, parsed);

  let emptyFallback = false;
  if (ranked.length === 0) {
    emptyFallback = true;
    ranked = [...speakerList].sort((a, b) => b.scores.overallFit - a.scores.overallFit);
    if (needFilters) ranked = applyFilters(ranked, parsed);
  }

  return { results: ranked.slice(0, 30), interpreted: parsed, emptyFallback };
}

// Convert the dim-indexed concept vector to a dense vector over embedding dims.
function dimVector(qVec: Map<number, number>, dims: number): Float32Array {
  const v = new Float32Array(dims);
  qVec.forEach((w, dim) => {
    if (dim >= 0 && dim < dims) v[dim] += w;
  });
  return v;
}

function applyFiltersNeeded(p: ParseResult): boolean {
  return (
    p.distanceMaxKm > 0 ||
    p.costMaxINR > 0 ||
    p.languages.length > 0 ||
    p.tiers.length > 0 ||
    p.domains.length > 0 ||
    p.genders.length > 0 ||
    p.hasTedx === true ||
    p.isAlumnus === true ||
    p.willingVirtual === true
  );
}

function applyFilters(list: Speaker[], p: ParseResult): Speaker[] {
  return list.filter((s) => {
    if (p.distanceMaxKm > 0 && s.distanceKm > p.distanceMaxKm) return false;
    if (p.costMaxINR === 1 && s.fee.totalEstCostINR > 500) return false;
    if (p.languages.length && !p.languages.every((l) => s.languages.includes(l))) return false;
    if (p.tiers.length && !p.tiers.includes(s.outreach.priorityTier)) return false;
    if (p.domains.length && !p.domains.includes(s.primaryDomain) && !s.secondaryDomains.some((d) => p.domains.includes(d))) return false;
    if (p.genders.length && !p.genders.includes(s.pronouns)) return false;
    if (p.hasTedx === true && s.speakingExperience.tedxTalks.length === 0) return false;
    if (p.isAlumnus === true && !s.bitConnection.isAlumnus) return false;
    if (p.willingVirtual === true && !s.willingVirtual) return false;
    return true;
  });
}

// Similar speakers by embedding cosine.
export async function similarSpeakers(id: string, k = 6): Promise<Speaker[]> {
  await initSearch(speakerList.length ? speakerList : await ensureSpeakers());
  const idx = speakerList.findIndex((s) => s.id === id);
  if (idx < 0 || !embeddingsReady) {
    const base = speakerList.find((s) => s.id === id);
    if (!base) return [];
    return speakerList
      .filter((s) => s.id !== id && s.primaryDomain === base.primaryDomain)
      .slice(0, k);
  }
  const q = getEmbedding(idx)!;
  const scored: { id: string; c: number }[] = [];
  for (let i = 0; i < speakerList.length; i++) {
    if (i === idx) continue;
    const emb = getEmbedding(i);
    if (emb) scored.push({ id: speakerList[i].id, c: cosine(q, emb) });
  }
  scored.sort((a, b) => b.c - a.c);
  return scored.slice(0, k).map((x) => byId.get(x.id)!).filter(Boolean);
}

async function ensureSpeakers(): Promise<Speaker[]> {
  // if no speakers injected (e.g. from a page that didn't pass them),
  // fetch the runtime JSON.
  if (!speakerList.length && typeof window !== "undefined") {
    const res = await fetch("/data/speakers.json");
    speakerList = await res.json();
    byId = new Map(speakerList.map((s) => [s.id, s]));
  }
  return speakerList;
}
