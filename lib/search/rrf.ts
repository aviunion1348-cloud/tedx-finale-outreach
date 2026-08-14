// Reciprocal Rank Fusion + final weighted re-rank + normalise.
import type { Speaker } from "@/types/speaker";
import type { RankingMixer } from "@/lib/store";

const K = 60;

export interface RankedResult {
  id: string;
  rrf: number;
  relevance: number;
  fit: number;
  feasibility: number;
}

// Merge multiple ranked id-lists (each list's own order matters, rank = index).
export function rrf(lists: string[][]): Map<string, RankedResult> {
  const scores = new Map<string, RankedResult>();
  lists.forEach((list) => {
    list.forEach((id, rank) => {
      const cur = scores.get(id) || {
        id,
        rrf: 0,
        relevance: 0,
        fit: 0,
        feasibility: 0,
      };
      cur.rrf += 1 / (K + rank + 1);
      scores.set(id, cur);
    });
  });
  return scores;
}

// Final ranking: 0.55·relevance + 0.25·fit/100 + 0.20·feasibility/100 (or custom mixer).
export function rerank(
  scores: Map<string, RankedResult>,
  speakersById: Map<string, Speaker>,
  mixer?: RankingMixer
): Speaker[] {
  const wRel = mixer?.relevance ?? 0.55;
  const wFit = mixer?.fit ?? 0.25;
  const wFeas = mixer?.feasibility ?? 0.2;
  const norm = wRel + wFit + wFeas || 1;

  const arr: { speaker: Speaker; score: number }[] = [];
  for (const [id, r] of scores) {
    const sp = speakersById.get(id);
    if (!sp) continue;
    // relevance approximated by RRF fraction relative to top candidate
    const rel = r.rrf;
    const score =
      (wRel * rel) / norm +
      (wFit * (sp.scores.overallFit / 100)) / norm +
      (wFeas * (sp.scores.feasibility / 100)) / norm;
    arr.push({ speaker: sp, score });
  }
  arr.sort((a, b) => b.score - a.score);
  return arr.map((x) => x.speaker);
}
