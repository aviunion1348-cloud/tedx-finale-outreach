// Client-safe natural-language filter parser. Detects clauses like
// "under 15km", "free", "hindi", "has done tedx", "alumnus", "tier S",
// "women", "jaipur" and strips them into structured filters + readable pills.
import { DOMAINS } from "@/lib/domains";

export interface ParseResult {
  residual: string;
  distanceMaxKm: number;
  costMaxINR: number;
  languages: string[];
  tiers: string[];
  domains: string[];
  genders: string[];
  hasTedx: boolean | null;
  isAlumnus: boolean | null;
  willingVirtual: boolean | null;
  pills: string[];
}

const empty = (): ParseResult => ({
  residual: "",
  distanceMaxKm: 0,
  costMaxINR: 0,
  languages: [],
  tiers: [],
  domains: [],
  genders: [],
  hasTedx: null,
  isAlumnus: null,
  willingVirtual: null,
  pills: [],
});

const TIER_MAP: Record<string, string> = {
  "tier s": "S",
  "tier s+": "S",
  "s tier": "S",
  "tier a": "A",
  "a tier": "A",
  "tier b": "B",
  "b tier": "B",
  "tier c": "C",
  c: "C",
};

export function parseQuery(raw: string): ParseResult {
  const r = empty();
  let q = raw.toLowerCase().trim();

  const domainById = new Map(DOMAINS.map((d) => [d.id, d.label]));
  const domainByLabel = new Map(DOMAINS.map((d) => [d.label.toLowerCase(), d.id]));

  const strip = (re: RegExp, pill: string) => {
    if (re.test(q)) {
      q = q.replace(re, " ").replace(/\s+/g, " ").trim();
      r.pills.push(pill);
    }
  };

  // distance: under/within/less than X km
  const distMatch = q.match(/(?:under|within|less than|below|<|<\s*)?\s*(\d{1,3})\s*km/);
  if (distMatch) {
    const n = parseInt(distMatch[1], 10);
    if (q.includes("over") || q.includes("more than") || q.includes("above")) {
      // "over X km" is uncommon; treat as minimum — ignore distance max
    } else {
      r.distanceMaxKm = n;
    }
    q = q.replace(distMatch[0], " ").replace(/\s+/g, " ").trim();
    r.pills.push(`within ${n} km`);
  }

  // cost: free / zero cost / no fee / budget
  if (/(free|zero cost|no fee|no honorarium|waives? fee|₹0|rs ?0|budget friendly)/.test(q)) {
    r.costMaxINR = 1; // signal "free-ish"
    strip(/(free|zero cost|no fee|no honorarium|waives? fee|₹0|rs ?0)/g, "free");
  }

  // languages
  if (/\bhindi\b/.test(q)) {
    r.languages.push("Hindi");
    strip(/\bhindi\b/g, "Hindi");
  }
  if (/\benglish\b/.test(q)) {
    r.languages.push("English");
    strip(/\benglish\b/g, "English");
  }
  if (/\brajasthani\b/.test(q)) {
    r.languages.push("Rajasthani");
    strip(/\brajasthani\b/g, "Rajasthani");
  }

  // tedx experience
  if (/(has done tedx|did tedx|tedx experience|has given tedx|done a tedx|has tedx)/.test(q)) {
    r.hasTedx = true;
    strip(/(has done tedx|did tedx|tedx experience|has given tedx|done a tedx|has tedx)/g, "TEDx veteran");
  }

  // alumnus
  if (/(alumnus|alumni|bit alumn|from bit|bit grad)/.test(q)) {
    r.isAlumnus = true;
    strip(/(alumnus|alumni|bit alumn|from bit|bit grad)/g, "BIT alumnus");
  }

  // virtual
  if (/(virtual|online|remote)/.test(q)) {
    r.willingVirtual = true;
    strip(/(virtual|online|remote)/g, "virtual");
  }

  // tier
  for (const [phrase, tier] of Object.entries(TIER_MAP)) {
    if (q.includes(phrase)) {
      r.tiers.push(tier);
      q = q.replace(phrase, " ").replace(/\s+/g, " ").trim();
      r.pills.push(`tier ${tier}`);
      break;
    }
  }

  // gender
  if (/(^|\s)(women|woman|female|her she|ladies)(\s|$)/.test(q) || /women founders|female/.test(q)) {
    r.genders.push("she/her");
    strip(/(^|\s)(women|woman|female|ladies)(\s|$)/g, "women");
  }
  if (/non-binary|nonbinary/.test(q)) {
    r.genders.push("they/them");
    strip(/(non-binary|nonbinary)/g, "non-binary");
  }

  // geography
  if (/\bjaipur\b/.test(q)) {
    strip(/\bjaipur\b/g, "Jaipur");
    if (r.distanceMaxKm === 0) r.distanceMaxKm = 25;
  }
  if (/\bdelhi\b|\bncr\b/.test(q)) {
    strip(/\bdelhi\b|\bncr\b/g, "Delhi/NCR");
    r.pills.push("Delhi/NCR");
  }

  // match domains by label substrings (longest first)
  const sorted = [...DOMAINS].sort((a, b) => b.label.length - a.label.length);
  for (const d of sorted) {
    const label = d.label.toLowerCase();
    if (q.includes(label)) {
      r.domains.push(d.id);
      q = q.replace(label, " ").replace(/\s+/g, " ").trim();
      r.pills.push(label);
    }
  }
  // also by id
  for (const d of DOMAINS) {
    const id = d.id;
    if (new RegExp(`(^|\\s)${escapeRe(id)}(\\s|$)`).test(q) && !r.domains.includes(id)) {
      r.domains.push(id);
      q = q.replace(new RegExp(`(^|\\s)${escapeRe(id)}(\\s|$)`), " ").replace(/\s+/g, " ").trim();
      r.pills.push(d.label);
    }
  }

  r.residual = q.replace(/\s+/g, " ").trim();
  return r;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
