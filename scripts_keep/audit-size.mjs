// Size audit. Cap: 50 MB and 2,500 files for the *project* (unzipped source,
// excluding deps/build/caches and zips). The deliverable zip is built separately.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const CAP_MB = 50;
const CAP_FILES = 2500;
const EXCLUDE = [
  "node_modules", ".next", ".git", ".npm", ".cache", ".config", "uploads", ".venv",
  "__pycache__", ".DS_Store",
];
const EXCLUDE_EXT = [".zip", ".log", ".tsbuildinfo"];

let total = 0;
let files = 0;

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (EXCLUDE.includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else {
      if (EXCLUDE_EXT.includes(path.extname(e.name).toLowerCase())) continue;
      total += fs.statSync(full).size;
      files++;
    }
  }
}

walk(root);
const mb = total / 1024 / 1024;
console.log(`audit-size: ${files} files, ${mb.toFixed(2)} MB (cap ${CAP_MB} MB / ${CAP_FILES} files)`);
const ok = files <= CAP_FILES && mb <= CAP_MB;
if (!ok) {
  console.log(`✗ OVER CAP (${ok ? "" : "size "}${files > CAP_FILES ? "files" : "size"})`);
  process.exit(1);
}
console.log("✓ within budget");
