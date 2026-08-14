// Banned-word + banned-pattern lint over source files (excludes node_modules/.next).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const BANNED = [
  "lorem ipsum",
  "TODO: fix",
  "HACK:",
  "three.js",
  "@react-three",
  "gsap",
  "console.log",
];

const SKIP = ["node_modules", ".next", ".git", "uploads", "scripts"];

const EXT = [".ts", ".tsx", ".mjs", ".js", ".css"];

let files = 0;
let issues = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (EXT.includes(path.extname(entry.name))) {
      files++;
      const src = fs.readFileSync(full, "utf8");
      for (const word of BANNED) {
        if (src.toLowerCase().includes(word.toLowerCase())) {
          issues++;
          console.log(`✗ ${path.relative(root, full)}: banned "${word}"`);
        }
      }
    }
  }
}

walk(root);
console.log(`\nlint-copy: scanned ${files} files, ${issues} issue${issues === 1 ? "" : "s"}.`);
process.exit(issues > 0 ? 1 : 0);
