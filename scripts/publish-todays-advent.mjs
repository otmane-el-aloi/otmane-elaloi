import fs from "node:fs";
import path from "node:path";

// Simple “which day of December is it in UTC?”
const now = new Date();
const year = now.getUTCFullYear();
const month = now.getUTCMonth(); // 0-based
const date = now.getUTCDate();

// if (month !== 11) {
//   console.log("Not December in UTC — skipping.");
//   process.exit(0);
// }

const day = 2; // For testing

// const day = date; // 1–31
// if (day < 1 || day > 25) {
//   console.log("Outside advent range — skipping.");
//   process.exit(0);
// }

const dayStr = String(day).padStart(2, "0");

// Paths
const contentFile = path.join("content", `day-${dayStr}.md`);
const publicDir = path.join("advent");
const publicFile = path.join(publicDir, `day-${dayStr}.md`);
const manifestFile = path.join(publicDir, "index.json");

// 1) copy markdown from private repo into public repo
if (!fs.existsSync(contentFile)) {
  console.log("No content for today:", contentFile);
  process.exit(0);
}

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const fileContent = fs.readFileSync(contentFile, "utf8");
fs.writeFileSync(publicFile, fileContent, "utf8");
console.log("Copied problem for day", day, "to", publicFile);

// 2) update manifest
let manifest = [];
if (fs.existsSync(manifestFile)) {
  manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
}

const exists = manifest.some((item) => item.day === day);
if (!exists) {
  manifest.push({
    path: `advent/day-${dayStr}.md`,
  });
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  console.log("Updated manifest", manifestFile);
} else {
  console.log("Day already present in manifest.");
}
