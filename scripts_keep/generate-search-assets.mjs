// Builds public/data/concept-map.json (~950 query terms → concept dims) and
// public/data/embeddings.bin (500 x 96 int8 L2-normalised speaker embeddings).
// TXJ1 header: magic "TXJ1" (4B) + count u32 + dims u16 + reserved u16 + data.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const speakers = JSON.parse(fs.readFileSync(path.join(root, "public/data/speakers.json"), "utf8"));
const domains = JSON.parse(fs.readFileSync(path.join(root, "data/domains.json"), "utf8"));

// ---- Concept dimensions (96) ----
const CONCEPTS = [
  // technology & data
  "ai", "machine learning", "software", "hardware", "robotics", "data", "statistics",
  "cloud", "open source", "iot", "crypto", "blockchain", "quantum", "nanotech",
  "cyber", "semiconductor", "gaming", "ev", "transport", "mobility",
  // business
  "startup", "founder", "business", "finance", "banking", "investment", "marketing",
  "brand", "ecommerce", "d2c", "scale", "revenue", "entrepreneurship", "venture",
  "leadership", "management", "hr", "sales", "growth",
  // science & health
  "space", "isro", "astronomy", "biotech", "genomics", "medicine", "health",
  "public health", "vaccine", "mental health", "neuroscience", "psychology",
  "sports science", "marine", "ocean", "climate", "energy", "renewable", "water",
  "agriculture", "farming", "food", "nutrition", "wellness", "yoga",
  // society & policy
  "governance", "policy", "law", "politics", "geopolitics", "diplomacy", "defense",
  "social impact", "ngo", "education", "school", "college", "upsc", "exam",
  "urbanism", "city", "philanthropy", "media", "journalism", "communication",
  "public speaking", "storytelling",
  // creative & culture
  "design", "art", "creative", "cinema", "film", "music", "literature", "writing",
  "poetry", "craft", "textile", "block print", "heritage", "culture", "folk",
  "puppetry", "dance", "photography", "architecture",
  // human & ideas
  "psychology2", "behavior", "motivation", "grit", "mindset", "identity", "philosophy",
  "ethics", "history", "innovation", "design thinking", "frugal",
  // geography / context
  "rajasthan", "jaipur", "delhi", "india", "women", "youth", "alumni",
].slice(0, 96);

const DIM = CONCEPTS.length; // 96

// ---- term → concept dim weights ----
function buildTermMap() {
  const map = {}; // term -> array of [dimIndex, weight]
  const idx = (c) => CONCEPTS.indexOf(c);
  const add = (term, dims) => {
    if (!map[term]) map[term] = [];
    (dims || []).forEach((d) => {
      const i = idx(d);
      if (i >= 0) map[term].push([i, 1]);
    });
  };
  domains.forEach((d) => {
    const label = d.label.toLowerCase();
    add(label, [d.id]);
    add(d.id, [d.id]);
    // split multiword label
    label.split(/\s+/).forEach((w) => add(w, [d.id]));
  });
  // rich synonym / slang / misspelling coverage
  const SYN = {
    "donald trump": ["geopolitics", "politics"], trump: ["geopolitics", "politics"],
    china: ["geopolitics"], russia: ["geopolitics"], "trade war": ["geopolitics", "economics"],
    geopolitics: ["geopolitics"], diplomacy: ["geopolitics"],
    "prompt engineering": ["ai", "machine learning"], prompt: ["ai"], "promt engineerng": ["ai", "machine learning"],
    chatgpt: ["ai"], gpt: ["ai"], llm: ["ai"], "large language model": ["ai"], ai: ["ai"],
    "machine learning": ["ai", "data"], "deep learning": ["ai", "data"],
    "isro": ["space", "isro"], chandrayaan: ["space"], gaganyaan: ["space"], nasa: ["space"],
    rocket: ["space"], satellite: ["space"], moon: ["space"], mars: ["space"], space: ["space", "isro"],
    kathputli: ["folk", "puppetry", "craft", "culture"], puppet: ["folk", "puppetry"],
    "block print": ["block print", "textile", "craft"], blockprint: ["block print", "textile"],
    sanganeri: ["block print", "textile"], bagru: ["block print", "textile"],
    "blue pottery": ["craft", "heritage"], handloom: ["textile", "craft"],
    "mental health": ["mental health", "psychology"], stress: ["mental health", "psychology"],
    anxiety: ["mental health"], burnout: ["mental health"], therapy: ["mental health", "health"],
    student: ["education", "college", "mental health"], exam: ["education", "upsc", "mental health"],
    upsc: ["governance", "upsc", "education"], ias: ["governance", "upsc"],
    "public health": ["public health", "health"], doctor: ["health", "medicine"],
    vaccine: ["vaccine", "public health"], asha: ["public health", "social impact"],
    hospital: ["health", "medicine"], hygiene: ["public health"],
    ev: ["ev", "transport"], "electric vehicle": ["ev", "transport"], car: ["transport", "ev"],
    auto: ["transport"], mobility: ["mobility", "transport"],
    farmer: ["agriculture", "farming"], crop: ["agriculture"], drought: ["agriculture", "water", "climate"],
    water: ["water", "agriculture", "climate"], irrigation: ["agriculture", "water"],
    organic: ["agriculture", "food"], solar: ["energy", "renewable"], renewable: ["renewable", "energy"],
    "green hydrogen": ["energy", "climate"], battery: ["energy", "ev"],
    founder: ["founder", "startup", "entrepreneurship"], startup: ["startup", "entrepreneurship"],
    business: ["business", "startup"], "venture capital": ["venture", "finance"],
    million: ["business", "revenue", "finance"], revenue: ["revenue", "business"],
    "wallet": ["finance", "banking"], investing: ["investment", "finance"], money: ["finance", "banking"],
    brand: ["brand", "marketing"], marketing: ["marketing"], growth: ["growth", "marketing"],
    content: ["marketing", "media"], seo: ["marketing"],
    "social impact": ["social impact", "ngo"], ngo: ["social impact"], foundation: ["philanthropy", "social impact"],
    community: ["social impact", "urbanism"], slum: ["social impact", "urbanism"], volunteer: ["social impact"],
    army: ["defense"], airforce: ["defense"], navy: ["defense"], veteran: ["defense"], defense: ["defense"],
    "foreign policy": ["geopolitics", "diplomacy"], "supply chain": ["geopolitics", "business"],
    government: ["governance", "policy"], policy: ["policy", "governance"], election: ["politics"],
    minister: ["politics", "governance"],
    music: ["music"], folk: ["folk", "culture", "music"], dance: ["dance", "folk"],
    ghoomar: ["dance", "folk", "culture"], "classical music": ["music", "culture"],
    film: ["cinema", "film"], movie: ["cinema"], director: ["cinema"], actor: ["cinema"],
    cinema: ["cinema"], documentary: ["cinema", "media"],
    writer: ["literature", "writing"], author: ["literature"], poet: ["poetry", "literature"],
    book: ["literature"], novel: ["literature"], poetry: ["poetry", "literature"],
    design: ["design"], "design thinking": ["design thinking", "design", "innovation"],
    art: ["art", "creative"], painting: ["art", "creative"], "street art": ["art"],
    photography: ["photography"], architecture: ["architecture", "urbanism", "design"],
    "rajasthan": ["rajasthan", "culture", "history"], jaipur: ["jaipur", "rajasthan"],
    "delhi": ["delhi"], "ncr": ["delhi"], india: ["india"],
    women: ["women"], "girl": ["women"], female: ["women"],
    "youth": ["youth"], "student": ["youth", "education", "college"],
    alumni: ["alumni", "education"], "bit jaipur": ["alumni"], bit: ["alumni"],
    "psychology": ["psychology", "behavior"], behavior: ["behavior", "psychology"],
    motivation: ["motivation"], grit: ["grit", "motivation"], mindset: ["mindset", "psychology"],
    "failed": ["grit", "mindset", "storytelling"], "failure": ["grit", "mindset"],
    "came back": ["grit", "mindset"], "overcame": ["grit", "mindset"],
    philosophy: ["philosophy", "ethics"], ethics: ["ethics", "philosophy"],
    history: ["history"], "rajasthani": ["history", "culture", "rajasthan"],
    "founder": ["founder"], "entrepreneur": ["entrepreneurship", "founder"],
    "health": ["health"], "wellness": ["wellness", "health"], yoga: ["yoga", "wellness"],
    "food": ["food"], chef: ["food"], cuisine: ["food"],
    "urban": ["urbanism", "city"], city: ["urbanism", "city"], traffic: ["urbanism", "transport"],
    "gaming": ["gaming"], "video game": ["gaming"], esports: ["gaming", "sports science"],
    "sports": ["sports science"], athlete: ["sports science"], olympics: ["sports science"],
    paralympics: ["sports science"], "para": ["sports science"],
    "quantum": ["quantum"], "crypto": ["crypto", "blockchain"], bitcoin: ["crypto"],
    "biotech": ["biotech"], "genomics": ["genomics"], "crispr": ["genomics"],
    "neuroscience": ["neuroscience"], brain: ["neuroscience", "psychology"],
    sleep: ["neuroscience", "wellness"], memory: ["neuroscience", "psychology"],
    "philanthropy": ["philanthropy"], giving: ["philanthropy"],
    "craft": ["craft", "heritage"], artisan: ["craft", "textile"], "handicraft": ["craft"],
    "journalism": ["journalism", "media"], "fact check": ["journalism", "media"],
    "podcast": ["media", "communication"], "public speaking": ["public speaking", "communication"],
    "storytelling": ["storytelling", "communication", "folk"],
  };
  Object.entries(SYN).forEach(([t, dims]) => add(t, dims));
  return map;
}

const TERM_MAP = buildTermMap();

// ---- speaker → sparse concept vector ----
function speakerVector(s) {
  const vec = new Float32Array(DIM);
  const boost = (dims, w) =>
    (dims || []).forEach((d) => {
      const i = CONCEPTS.indexOf(d);
      if (i >= 0) vec[i] += w;
    });
  boost([s.primaryDomain], 5);
  s.secondaryDomains.forEach((d) => boost([d], 1.5));
  s.topics.forEach((t) => boost(TermDims(t), 1.2));
  s.keywords.forEach((k) => boost(TermDims(k), 1.2));
  s.tags.forEach((t) => boost(TermDims(t), 0.8));
  // city/state context
  boost([s.city.toLowerCase(), s.state.toLowerCase()], 1);
  if (s.bitConnection.isAlumnus) boost(["alumni"], 1.2);
  if (s.pronouns === "she/her") boost(["women"], 0.5);
  return vec;
}
function TermDims(t) {
  const m = TERM_MAP[t];
  if (m) return m.map(([i]) => CONCEPTS[i]);
  return [];
}

// L2-normalise then quantise to int8 in [-127, 127]
function quantise(vec) {
  let norm = 0;
  for (let i = 0; i < DIM; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  const out = new Int8Array(DIM);
  for (let i = 0; i < DIM; i++) out[i] = Math.round((vec[i] / norm) * 127);
  return out;
}

// ---- build embeddings.bin ----
function buildEmbeddings() {
  const header = Buffer.alloc(12);
  header.write("TXJ1", 0, "ascii");
  header.writeUInt32LE(speakers.length, 4);
  header.writeUInt16LE(DIM, 8);
  header.writeUInt16LE(0, 10);
  const chunks = [header];
  speakers.forEach((s) => {
    const q = quantise(speakerVector(s));
    chunks.push(Buffer.from(q.buffer, q.byteOffset, q.byteLength));
  });
  const buf = Buffer.concat(chunks);
  fs.writeFileSync(path.join(root, "public/data/embeddings.bin"), buf);
  console.log("embeddings.bin", DIM, "dims x", speakers.length, "→", (buf.length / 1024).toFixed(1), "KB");
}

// ---- build concept-map.json ----
// Store the CONCEPT dimension INDEX for each term (not the name) so the runtime
// can index directly into the embedding rows (which are ordered by CONCEPTS).
function buildConceptMap() {
  const map = {};
  Object.entries(TERM_MAP).forEach(([term, dims]) => {
    map[term] = dims.map(([i]) => i); // i is the CONCEPTS index
  });
  fs.writeFileSync(path.join(root, "public/data/concept-map.json"), JSON.stringify(map));
  console.log("concept-map.json", Object.keys(map).length, "terms →", (fs.statSync(path.join(root, "public/data/concept-map.json")).size / 1024).toFixed(1), "KB");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildEmbeddings();
  buildConceptMap();
}
