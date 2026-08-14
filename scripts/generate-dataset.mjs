// Deterministic 500-record speaker dataset generator.
// Seed fixed -> reproducible. Bands: 300 Jaipur / 75 belt / 100 NCR / 25 stretch.
// Output: public/data/speakers.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mulberry32, NAMES, ORGS, TOPICS, BIO_FRAGMENTS, RISK_FLAGS, APPROACH, SIGNATURES, seededName } from "./banks.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const domains = JSON.parse(fs.readFileSync(path.join(root, "data/domains.json"), "utf8"));
const DOMAIN_IDS = domains.map((d) => d.id);

// Campus (BIT Mesra, Jaipur Campus) — Chitrakoot, Vaishali Nagar, Jaipur.
const CAMPUS = { lat: 26.9001, lng: 75.7813 };

const BANDS = {
  jaipur: 300,
  belt: 75,
  ncr: 100,
  stretch: 25,
};

const CITIES = {
  jaipur: { name: "Jaipur", lat: 26.9124, lng: 75.7873, state: "Rajasthan", cost: 0 },
  ajmer: { name: "Ajmer", lat: 26.4499, lng: 74.6399, state: "Rajasthan", cost: 700 },
  kota: { name: "Kota", lat: 25.2138, lng: 75.8648, state: "Rajasthan", cost: 900 },
  udaipur: { name: "Udaipur", lat: 24.5854, lng: 73.7125, state: "Rajasthan", cost: 1100 },
  jodhpur: { name: "Jodhpur", lat: 26.2389, lng: 73.0243, state: "Rajasthan", cost: 1000 },
  bikaner: { name: "Bikaner", lat: 28.0229, lng: 73.3119, state: "Rajasthan", cost: 1050 },
  alwar: { name: "Alwar", lat: 27.553, lng: 76.6346, state: "Rajasthan", cost: 800 },
  sikar: { name: "Sikar", lat: 27.6094, lng: 75.1399, state: "Rajasthan", cost: 600 },
  bharatpur: { name: "Bharatpur", lat: 27.2173, lng: 77.4901, state: "Rajasthan", cost: 900 },
  tonk: { name: "Tonk", lat: 26.1664, lng: 75.7902, state: "Rajasthan", cost: 500 },
  barmer: { name: "Barmer", lat: 25.744, lng: 71.3927, state: "Rajasthan", cost: 1200 },
  delhi: { name: "Delhi", lat: 28.7041, lng: 77.1025, state: "Delhi", cost: 2200 },
  gurugram: { name: "Gurugram", lat: 28.4595, lng: 77.0266, state: "Haryana", cost: 2200 },
  noida: { name: "Noida", lat: 28.5355, lng: 77.391, state: "UP", cost: 2100 },
  ghaziabad: { name: "Ghaziabad", lat: 28.6692, lng: 77.4538, state: "UP", cost: 2100 },
  faridabad: { name: "Faridabad", lat: 28.4089, lng: 77.3178, state: "Haryana", cost: 2000 },
  mumbai: { name: "Mumbai", lat: 19.076, lng: 72.8777, state: "Maharashtra", cost: 4500 },
  bengaluru: { name: "Bengaluru", lat: 12.9716, lng: 77.5946, state: "Karnataka", cost: 4800 },
  hyderabad: { name: "Hyderabad", lat: 17.385, lng: 78.4867, state: "Telangana", cost: 4400 },
  pune: { name: "Pune", lat: 18.5204, lng: 73.8567, state: "Maharashtra", cost: 4400 },
  ahmedabad: { name: "Ahmedabad", lat: 23.0225, lng: 72.5714, state: "Gujarat", cost: 3600 },
};

const BELT_CITIES = ["ajmer", "kota", "udaipur", "jodhpur", "bikaner", "alwar", "sikar", "bharatpur", "tonk", "barmer"];
const NCR_CITIES = ["delhi", "gurugram", "noida", "ghaziabad", "faridabad"];
const STRETCH_CITIES = ["mumbai", "bengaluru", "hyderabad", "pune", "ahmedabad"];

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const PRONOUNS = ["she/her", "he/him", "they/them"];
const LANG = ["Hindi", "English", "Rajasthani"];

function pick(rnd, arr) {
  return arr[(rnd() * arr.length) | 0];
}
function pickN(rnd, arr, n) {
  const copy = arr.slice();
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice((rnd() * copy.length) | 0, 1)[0]);
  }
  return out;
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function round1(n) {
  return Math.round(n * 10) / 10;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function genderForName(name) {
  const f = name.split(" ")[0];
  const femFirst = [
    "Ananya", "Aadhya", "Ira", "Saanvi", "Diya", "Myra", "Riya", "Anika", "Navya",
    "Paridhi", "Aishwarya", "Prisha", "Avni", "Meera", "Kiara", "Tanvi", "Ishita",
    "Ritika", "Kavya", "Meghna", "Ritu", "Sara", "Bhoomi", "Sangeeta", "Laxmi",
    "Meenakshi", "Divya", "Tanvi", "Suman", "Ganga", "Zoya", "Priyanka", "Amrita",
    "Sunita", "Parvati", "Meera", "Kavita", "Ishita", "Ananya",
  ];
  const mascFirst = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Kabir",
    "Ishaan", "Reyansh", "Krishna", "Shaurya", "Pranav", "Aryan", "Dhruv", "Rohan",
    "Raghav", "Dev", "Yash", "Om", "Kartik", "Manav", "Siddharth", "Rahul", "Rajat",
    "Nikhil", "Shubham", "Harsh", "Abhishek", "Sachin", "Mohan", "Raj", "Vikram",
    "Karan", "Suresh", "Ramesh", "Deepak", "Sunil", "Anil", "Mahesh", "Gaurav",
    "Varun", "Sanjay", "Mangilal", "Rohit", "Bhavesh", "Col.", "Devraj", "Ankit",
    "Faisal", "Tarun", "Dr.", "Vijay", "Prateek", "Anirudh", "Vikram", "Harsh",
    "Ashok", "Rakesh",
  ];
  if (femFirst.includes(f)) return "she/her";
  if (mascFirst.includes(f)) return "he/him";
  return Math.random() < 0.45 ? "she/her" : "he/him";
}

// ---- build a single speaker record ----
function buildSpeaker(rnd, idx, band, cityKey, domain, sig, gender) {
  const city = CITIES[cityKey];
  const id = `TXJ-${String(idx + 1).padStart(4, "0")}`;
  const name = sig ? sig.name : seededName(rnd, gender);
  const g = gender || (name ? genderForName(name) : "he/him");
  const isWoman = g === "she/her";
  const domainId = domain || pick(rnd, DOMAIN_IDS);
  const domainLabel = domains.find((d) => d.id === domainId)?.label || domainId;
  const topics = TOPICS[domainId] || ["craft"];
  const topic = pick(rnd, topics);
  const secDomain = pickN(rnd, DOMAIN_IDS.filter((d) => d !== domainId), 1 + ((rnd() * 2) | 0));

  const distance = round1(haversine(CAMPUS.lat, CAMPUS.lng, city.lat, city.lng));
  const baseCost = city.cost;
  const willWaive = rnd() < (band === "jaipur" ? 0.55 : band === "belt" ? 0.4 : 0.3);
  const honorarium = willWaive ? 0 : Math.round((2000 + rnd() * 8000) / 100) * 100;
  const needsTravel = distance > 5;
  const needsAccommodation = distance > 30;
  const travelCost = needsTravel ? baseCost + (needsAccommodation ? 900 : 0) : 0;
  const totalEstCostINR = honorarium + travelCost;

  const feasibility =
    distance <= 15
      ? "walk-in"
      : distance <= 30
        ? "same-day"
        : distance <= 120
          ? "day-trip"
          : distance <= 400
            ? "overnight"
            : "virtual-only";
  const travelRisk =
    distance <= 30 ? "low" : distance <= 400 ? (rnd() < 0.7 ? "low" : "medium") : rnd() < 0.6 ? "medium" : "high";
  const willingVirtual = distance > 300 || rnd() < 0.5;

  const overallScores = {};
  overallScores.relevance = clamp(Math.round(55 + rnd() * 40 + (sig ? 8 : 0)), 0, 100);
  overallScores.feasibility = clamp(Math.round(92 - (distance > 30 ? distance / 60 : distance / 10)), 0, 100);
  overallScores.novelty = clamp(Math.round(45 + rnd() * 45), 0, 100);
  overallScores.reach = clamp(Math.round(20 + rnd() * 70 + (city.followers || 0)), 0, 100);
  overallScores.reliability = clamp(Math.round(50 + rnd() * 45), 0, 100);
  overallScores.costEff = clamp(Math.round(totalEstCostINR === 0 ? 100 : 100 - Math.min(90, totalEstCostINR / 80)), 0, 100);
  overallScores.diversity = clamp(Math.round(30 + rnd() * 60 + (isWoman ? 15 : 0) + (domainId === "folk" || domainId === "craft" ? 10 : 0)), 0, 100);
  const overallFit = Math.round(
    0.22 * overallScores.relevance +
      0.18 * overallScores.feasibility +
      0.14 * overallScores.novelty +
      0.12 * overallScores.reach +
      0.14 * overallScores.reliability +
      0.12 * overallScores.costEff +
      0.08 * overallScores.diversity
  );
  overallScores.overallFit = clamp(overallFit, 0, 100);

  const yearsExp = sig ? sig.yoe : 3 + ((rnd() * 20) | 0);
  const followers = Math.round((sig ? 5000 + rnd() * 80000 : 2000 + rnd() * 50000) / 100) * 100;
  const tedxCount = (rnd() < 0.45 ? 1 : 0) + (rnd() < 0.2 ? 1 : 0);
  const tedxTalks = [];
  for (let i = 0; i < tedxCount; i++) {
    tedxTalks.push({
      year: 2022 + i,
      venue: ["TEDxJaipur", "TEDxPinkCity", "TEDxKota", "TEDxDelhi", "TEDxJodhpur"][(rnd() * 5) | 0],
      title: pick(rnd, TOPICS[domainId]),
    });
  }

  const isAlumnus = rnd() < (domainId === "technology" || domainId === "ai" ? 0.25 : 0.1);
  const bioShort = sig
    ? sig.line
    : `${name} ${pick(rnd, BIO_FRAGMENTS)}. Works on ${topic} as a ${pick(rnd, ["practitioner", "founder", "researcher", "artist", "advocate"])}.`;
  const bioLong = `${bioShort} Now based in ${city.name}, ${city.state}, they bring ${yearsExp}+ years of hands-on experience. Their talk — "${sig ? sig.line.slice(0, 40) : "No title"}" — blends a lived story with a concrete, borrowable idea.`;

  const record = {
    id,
    slug: slugify(name) + "-" + id.toLowerCase().replace("txj-", ""),
    name,
    pronouns: g,
    headline: sig ? sig.role : `${domainLabel} · ${pick(rnd, ["practitioner", "founder", "researcher", "artist", "advocate"])} · ${city.name}`,
    bioShort,
    bioLong,
    photoUrl: `proc:${id}`,
    accentColor: domains.find((d) => d.id === domainId)?.accent || "#EB0028",
    org: sig ? sig.role : pick(rnd, ORGS),
    role: sig ? sig.role : `${pick(rnd, ["Founder", "Lead", "Principal", "Director", "Head"])} of ${pick(rnd, ORGS)}`,
    yearsExperience: yearsExp,
    city: city.name,
    locality: city.name,
    state: city.state,
    lat: round1(city.lat + (rnd() - 0.5) * 0.6),
    lng: round1(city.lng + (rnd() - 0.5) * 0.6),
    distanceKm: distance,
    travelTimeHrs: round1(distance / 55),
    estTravelCostINR: travelCost,
    feasibility,
    travelRisk,
    willingVirtual,
    typicalNoticeWeeks: 3 + ((rnd() * 6) | 0),
    bestContactWindow: pick(rnd, ["Mon–Thu mornings", "Tue & Thu evenings", "Weekends", "Mon–Wed afternoons"]),
    primaryDomain: domainId,
    secondaryDomains: secDomain,
    topics: pickN(rnd, topics, 3),
    keywords: [topic, domainLabel.toLowerCase(), topic.split(" ")[0]],
    proposedTalkTitle: `"${pick(rnd, ["The Hidden Economics of", "Reclaiming", "What We Lose When We Ignore", "The Quiet Revolution of", "A Field Guide to", "The Second Life of"])} ${topic}"`,
    talkAngle: pick(rnd, [
      "A personal failure reframed as a system design problem.",
      "Live demo of the craft, then the model behind it.",
      "A myth-busting takedown of the obvious answer.",
      "From one village to a thousand — how the idea scaled.",
      "The uncomfortable truth no one on stage will say.",
    ]),
    languages: pickN(rnd, LANG, 1 + ((rnd() * 2) | 0)),
    speakingExperience: {
      totalTalks: yearsExp + ((rnd() * 40) | 0),
      tedxTalks,
      otherStages: pickN(rnd, ["Company all-hands", "College fest", "District panchayat", "Startup demo day", "Radio interview", "Podcast"], 2 + ((rnd() * 2) | 0)),
      avgTalkLengthMin: 14 + ((rnd() * 10) | 0),
      hasRecordedTalk: rnd() < 0.5,
      stagePresenceScore: clamp(Math.round(50 + rnd() * 45), 0, 100),
      idIdeaClarityScore: clamp(Math.round(55 + rnd() * 40), 0, 100),
    },
    bitConnection: {
      isAlumnus,
      hasVisited: isAlumnus || rnd() < 0.2,
      warmIntroPath: isAlumnus
        ? "Alumni office / CSE dept professor"
        : rnd() < 0.5
          ? "Prior TEDx attendee (has visited campus)"
          : "Cold pitch via masked email",
      previouslyInvited: rnd() < 0.08,
    },
    audience: {
      followers,
      mediaMentions: (rnd() * 40) | 0,
      estimatedDrawStudents: Math.round((sig ? 250 + rnd() * 350 : 120 + rnd() * 280) / 10) * 10,
      pressWorthiness: clamp(Math.round(20 + rnd() * 70), 0, 100),
    },
    fee: {
      honorarium,
      willWaiveFee: willWaive,
      needsTravel,
      needsAccommodation,
      totalEstCostINR,
    },
    scores: overallScores,
    fitReasons: [
      `${domainLabel} fit for "${topic}"`,
      totalEstCostINR === 0 ? "Zero cost — will waive honorarium" : `Budget-viable at ₹${totalEstCostINR.toLocaleString("en-IN")}`,
      feasibility === "walk-in" ? "Walks-in — no travel risk" : `${feasibility} feasibility from ${city.name}`,
      isWoman ? "Diversity add (women-in-field)" : "Strong stage presence",
    ].slice(0, 4),
    riskFlags: riskFor(city.name, distance, totalEstCostINR, willingVirtual),
    contact: {
      email: maskedEmail(name),
      phone: "••••••••••",
    },
    linkedin: linkedinHandle(name),
    outreach: {
      status: "untouched",
      priorityTier: overallFit >= 82 ? "S" : overallFit >= 70 ? "A" : overallFit >= 55 ? "B" : "C",
      suggestedApproach: pick(rnd, APPROACH),
      followUpCadenceDays: 4 + ((rnd() * 7) | 0),
      bestOutreachMonth: 1 + ((rnd() * 12) | 0),
    },
    tags: [domainId, "synthetic", isAlumnus ? "alumnus" : "external", feasibility],
    addedOn: "2026-08-01",
    lastVerified: "2026-08-10",
  };
  return record;
}

function riskFor(cityName, distance, cost, virtual) {
  const flags = [];
  if (distance > 120) flags.push("Overnight travel from " + cityName);
  if (cost > 3000) flags.push("Highest budget tier; bundle or virtual-first");
  if (virtual && distance > 300) flags.push("Prefer virtual — verify in-person comfort");
  if (flags.length === 0) flags.push("Low risk");
  return flags;
}

function maskedEmail(name) {
  const domain = pick(mulberry32(name.length * 31), ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]);
  const first = name.toLowerCase().replace(/[^a-z]/g, "")[0] || "a";
  return `${first}•••••@${domain}`;
}

// Deterministic, plausible LinkedIn handle. NOTE: synthetic — a real handle
// must be supplied to be a "working" profile link.
function linkedinHandle(name) {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const suffix = (mulberry32(name.length * 17 + 3)() * 9000 | 0) + 1000;
  return `${clean}${suffix}`;
}

// ---- driver ----
const rnd = mulberry32(20260814);
export function generateAll() {
  const speakers = [];
  let idx = 0;

  // 40 signatures get priority placement (balanced across cities).
  const sigCities = [
    "jaipur", "jodhpur", "jaipur", "tonk", "jaipur", "kota", "udaipur", "jaipur", "jaipur", "jaipur",
    "jaipur", "jaipur", "jaipur", "jaipur", "barmer", "delhi", "jaipur", "jaipur", "ajmer", "jaipur",
    "jaipur", "delhi", "jaipur", "bikaner", "jaipur", "jaipur", "jaipur", "delhi", "jaipur", "delhi",
    "jaipur", "jaipur", "bikaner", "jaipur", "delhi", "jaipur", "jaipur", "delhi", "jaipur", "delhi",
  ];
  sigCities.forEach((c, i) => {
    const sig = SIGNATURES[i];
    speakers.push(buildSpeaker(rnd, idx, c === "jaipur" || c === "tonk" ? "jaipur" : "belt", c, sig.domain, sig));
    idx++;
  });

  // Fill remaining per band.
  const bandPlan = [];
  for (let i = 0; i < BANDS.jaipur - 30; i++) bandPlan.push({ band: "jaipur", city: "jaipur" });
  for (let i = 0; i < BANDS.belt - 10; i++) bandPlan.push({ band: "belt", city: pick(rnd, BELT_CITIES) });
  for (let i = 0; i < BANDS.ncr; i++) bandPlan.push({ band: "ncr", city: pick(rnd, NCR_CITIES) });
  for (let i = 0; i < BANDS.stretch; i++) bandPlan.push({ band: "stretch", city: pick(rnd, STRETCH_CITIES) });
  // shuffle deterministically
  for (let i = bandPlan.length - 1; i > 0; i--) {
    const j = (rnd() * (i + 1)) | 0;
    [bandPlan[i], bandPlan[j]] = [bandPlan[j], bandPlan[i]];
  }
  for (const p of bandPlan) {
    const gender = rnd() < 0.49 ? "she/her" : rnd() < 0.055 ? "they/them" : "he/him";
    speakers.push(buildSpeaker(rnd, idx, p.band, p.city, null, null, gender));
    idx++;
  }

  return speakers;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const speakers = generateAll();
  // sort by id
  speakers.sort((a, b) => a.id.localeCompare(b.id));
  const outPath = path.join(root, "public/data/speakers.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(speakers));
  const women = speakers.filter((s) => s.pronouns === "she/her").length;
  const bands = speakers.reduce((acc, s) => {
    acc[s.distanceKm <= 25 ? "jaipur(≤25km)" : s.distanceKm <= 400 ? "belt/ncr" : "stretch"] = (acc[s.distanceKm <= 25 ? "jaipur(≤25km)" : s.distanceKm <= 400 ? "belt/ncr" : "stretch"] || 0) + 1;
    return acc;
  }, {});
  console.log(`Generated ${speakers.length} speakers → ${outPath}`);
  console.log(`Women: ${women} (${((women / speakers.length) * 100).toFixed(1)}%)`);
  console.log("Bands:", bands);
  console.log("File size:", (fs.statSync(outPath).size / 1024 / 1024).toFixed(2), "MB");
}
