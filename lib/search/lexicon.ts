// Concept-map loader, tokeniser, query embedding (3-gram fuzzy), and decode of
// embeddings.bin (TXJ1 header: magic 4B + count u32 + dims u16 + reserved u16,
// then count * dims int8 L2-normalised rows).
import conceptRaw from "@/public/data/concept-map.json";

export type ConceptMap = Record<string, number[]>;

export const CONCEPT_MAP = conceptRaw as ConceptMap;

let EMBEDDINGS: Float32Array | null = null;
let EMBED_DIMS = 0;
let EMBED_COUNT = 0;

export function initEmbeddings(): boolean {
  if (EMBEDDINGS) return true;
  // Note: embeddings.bin is fetched at runtime by search/index.ts via fetch;
  // this module keeps the parsed matrix in a module-level cache.
  return EMBEDDINGS !== null;
}

export function setEmbeddings(arr: Float32Array, dims: number, count: number) {
  EMBEDDINGS = arr;
  EMBED_DIMS = dims;
  EMBED_COUNT = count;
}

export function getEmbedding(idIndex: number): Float32Array | null {
  if (!EMBEDDINGS) return null;
  const off = idIndex * EMBED_DIMS;
  return EMBEDDINGS.subarray(off, off + EMBED_DIMS);
}

export function dimsCount() {
  return { dims: EMBED_DIMS, count: EMBED_COUNT };
}

// Parse the TXJ1 binary into a Float32Array (int8 rows → float).
export async function fetchEmbeddings(url = "/data/embeddings.bin"): Promise<{ dims: number; count: number }> {
  if (EMBEDDINGS) return { dims: EMBED_DIMS, count: EMBED_COUNT };
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const dv = new DataView(buf);
  const magic = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
  if (magic !== "TXJ1") throw new Error("bad embeddings magic");
  const count = dv.getUint32(4, true);
  const dims = dv.getUint16(8, true);
  const int8 = new Int8Array(buf, 12);
  const f = new Float32Array(count * dims);
  for (let i = 0; i < f.length; i++) f[i] = int8[i] / 127;
  setEmbeddings(f, dims, count);
  EMBED_COUNT = count;
  EMBED_DIMS = dims;
  return { dims, count };
}

// tokenise + lowercase, keep alphanumerics and common symbols
export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+&#.-]+/)
    .filter((t) => t.length > 1);
}

// map a query string to a sparse vector over embedding DIMENSION indices.
export function queryConceptVector(query: string): Map<number, number> {
  const vec = new Map<number, number>();
  const q = query.toLowerCase().trim();
  // exact + prefix phrase matches first
  for (const [term, dims] of Object.entries(CONCEPT_MAP)) {
    if (q === term || q.includes(term) || term.includes(q)) {
      dims.forEach((d) => vec.set(d, (vec.get(d) || 0) + 1));
    }
  }
  // token-level
  const tokens = tokenise(q);
  for (const tok of tokens) {
    for (const [term, dims] of Object.entries(CONCEPT_MAP)) {
      // 3-gram fuzzy for typo tolerance
      if (term === tok || term.includes(tok) || tok.includes(term) || fuzzy3(tok, term)) {
        dims.forEach((d) => vec.set(d, (vec.get(d) || 0) + 0.8));
      }
    }
  }
  return vec;
}

// 3-gram overlap similarity for typo tolerance
function fuzzy3(a: string, b: string): boolean {
  if (a.length < 4 || b.length < 4) return a === b || a.startsWith(b) || b.startsWith(a);
  const grams = new Set<string>();
  for (let i = 0; i + 3 <= a.length; i++) grams.add(a.slice(i, i + 3));
  let hits = 0;
  for (let i = 0; i + 3 <= b.length; i++) if (grams.has(b.slice(i, i + 3))) hits++;
  const denom = Math.max(grams.size, b.length - 2);
  return hits / denom >= 0.5;
}

// L2-normalise a Float32Array in place
export function l2Normalise(vec: Float32Array | number[]): Float32Array {
  const out = vec instanceof Float32Array ? vec : Float32Array.from(vec);
  let norm = 0;
  for (let i = 0; i < out.length; i++) norm += out[i] * out[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < out.length; i++) out[i] /= norm;
  return out;
}

// Cosine of two equal-length arrays.
export function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return dot;
}
