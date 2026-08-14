// Validate the generated dataset against the schema + business rules.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const speakers = JSON.parse(fs.readFileSync(path.join(root, "public/data/speakers.json"), "utf8"));

let ok = true;
const fail = (m) => {
  ok = false;
  console.log("✗", m);
};

if (speakers.length !== 500) fail(`expected 500, got ${speakers.length}`);

const ids = new Set();
const slugs = new Set();
let women = 0,
  nonBinary = 0,
  alumni = 0;
const bands = { jaipur: 0, belt: 0, ncr: 0, stretch: 0 };

for (const s of speakers) {
  if (!s.id || !/^TXJ-\d{4}$/.test(s.id)) fail(`${s.id}: bad id`);
  if (ids.has(s.id)) fail(`${s.id}: duplicate id`);
  ids.add(s.id);
  if (slugs.has(s.slug)) fail(`${s.slug}: duplicate slug`);
  slugs.add(s.slug);
  if (s.pronouns === "she/her") women++;
  if (s.pronouns === "they/them") nonBinary++;
  if (s.bitConnection.isAlumnus) alumni++;
  if (s.distanceKm <= 25) bands.jaipur++;
  else if (s.distanceKm <= 400) bands.belt++;
  else bands.stretch++;
  if (s.scores.overallFit < 0 || s.scores.overallFit > 100) fail(`${s.id}: fit out of range`);
  if (s.fee.totalEstCostINR < 0) fail(`${s.id}: negative cost`);
  if (!s.topics.length || !s.keywords.length) fail(`${s.id}: missing topics/keywords`);
  if (!s.contact.email.includes("•••••")) fail(`${s.id}: email not masked`);
}

const womenPct = (women / speakers.length) * 100;
if (womenPct < 40 || womenPct > 55) fail(`women ratio ${womenPct.toFixed(1)}% outside 40-55%`);

console.log(`validate: ${speakers.length} records`);
console.log(`  women ${womenPct.toFixed(1)}% · non-binary ${nonBinary} · alumni ${alumni}`);
console.log(`  bands: jaipur(≤25km) ${bands.jaipur} · belt/ncr ${bands.belt} · stretch ${bands.stretch}`);
console.log(ok ? "✓ dataset valid" : "✗ dataset has issues");
process.exit(ok ? 0 : 1);
