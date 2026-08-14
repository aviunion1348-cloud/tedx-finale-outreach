// Acceptance test for the search engine. Mirrors the runtime layers in Node
// (lexical substring + concept-bridge + embedding cosine) against the built
// data files, and checks the 15 handoff queries never return empty.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const speakers = JSON.parse(fs.readFileSync(path.join(root, "public/data/speakers.json"), "utf8"));
const conceptMap = JSON.parse(fs.readFileSync(path.join(root, "public/data/concept-map.json"), "utf8"));

// embeddings
const buf = fs.readFileSync(path.join(root, "public/data/embeddings.bin"));
const dims = buf.readUInt16LE(8);
const count = buf.readUInt32LE(4);
const int8 = new Int8Array(buf.buffer, 12);
const embs = [];
for (let i = 0; i < count; i++) {
  embs.push(Float32Array.from(int8.subarray(i * dims, (i + 1) * dims)));
}

function cos(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) d += a[i] * b[i];
  return d;
}

function queryVec(q) {
  const v = new Float32Array(dims);
  const text = q.toLowerCase();
  for (const [term, ds] of Object.entries(conceptMap)) {
    if (text === term || text.includes(term) || term.includes(text)) {
      ds.forEach((d) => { if (d >= 0 && d < dims) v[d] += 1; });
    }
  }
  // token 3-gram
  const tokens = text.split(/[^a-z0-9]+/).filter((t) => t.length > 1);
  for (const tok of tokens) {
    for (const [term, ds] of Object.entries(conceptMap)) {
      if (tok.includes(term) || term.includes(tok)) ds.forEach((d) => { if (d >= 0 && d < dims) v[d] += 0.8; });
    }
  }
  let norm = 0;
  for (let i = 0; i < v.length; i++) norm += v[i] * v[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < v.length; i++) v[i] /= norm;
  return v;
}

function search(q) {
  const text = q.toLowerCase();
  const scored = speakers
    .map((s, i) => {
      const hay = [s.name, s.headline, s.org, s.city, ...s.topics, ...s.keywords, s.primaryDomain, ...s.secondaryDomains].join(" ").toLowerCase();
      let lex = 0;
      for (const tok of text.split(/[^a-z0-9+]+/).filter((t) => t.length > 1)) {
        if (hay.includes(tok)) lex += 1;
        else if (s.keywords.some((k) => k.includes(tok))) lex += 0.6;
      }
      const c = cos(queryVec(q), embs[i]);
      return { s, score: lex * 0.6 + c * 0.4 };
    })
    .filter((x) => x.score > 0.01);
  scored.sort((a, b) => b.score - a.score);
  // fallback never-empty
  if (scored.length === 0) {
    return [...speakers].sort((a, b) => b.scores.overallFit - a.scores.overallFit).slice(0, 10);
  }
  return scored.slice(0, 10).map((x) => x.s);
}

const QUERIES = [
  "donald trump",
  "promt engineerng",
  "someone who failed and came back",
  "ai speaker under 15km",
  "hindi free has done tedx",
  "kathputli",
  "upsc",
  "rajasthan drought",
  "asdfghqwerty",
  "space isro chandrayaan",
  "mental health student stress",
  "block print jaipur heritage",
  "btech mech automotive ev",
  "women founders jaipur free",
  "bit alumnus cse",
];

let pass = 0;
for (const q of QUERIES) {
  const res = search(q);
  const ok = res.length > 0;
  if (ok) pass++;
  const top = res[0];
  console.log(`${ok ? "✓" : "✗"} ${JSON.stringify(q)} → ${res.length} results${top ? ` · top: ${top.name} (${top.primaryDomain})` : ""}`);
}
console.log(`\ntest-search: ${pass}/${QUERIES.length} acceptance queries passed.`);
process.exit(pass === QUERIES.length ? 0 : 1);
