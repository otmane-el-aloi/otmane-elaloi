import fs from "node:fs";
import path from "node:path";

// ---------- CONFIG ----------

// Set this to `true` when you want to test a specific day locally
const TEST_MODE = true;
const TEST_DAY = 1; // e.g. 2 for testing

// ---------- DAY SELECTION ----------

const now = new Date();
const month = now.getUTCMonth(); // 0-based: 11 = December
const date = now.getUTCDate();

let day;

if (TEST_MODE) {
  day = TEST_DAY;
  console.log("[TEST MODE] Forcing day =", day);
} else {
  if (month !== 11) {
    console.log("Not December in UTC — skipping.");
    process.exit(0);
  }

  day = date; // 1–31
  if (day < 1 || day > 25) {
    console.log("Outside advent range — skipping.");
    process.exit(0);
  }
}

const dayStr = String(day).padStart(2, "0");

// ---------- PATHS ----------

const contentFile = path.join("content", `day-${dayStr}.md`); // private repo
const publicDir = path.join("advent");
const publicFile = path.join(publicDir, `day-${dayStr}.md`);
const relManifestPath = `advent/day-${dayStr}.md`;
const manifestFile = path.join(publicDir, "index.json");

// ---------- COPY MARKDOWN ----------

if (!fs.existsSync(contentFile)) {
  console.log("No content for today:", contentFile);
  process.exit(0);
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const fileContent = fs.readFileSync(contentFile, "utf8");
fs.writeFileSync(publicFile, fileContent, "utf8");
console.log("Copied problem for day", day, "to", publicFile);

// ---------- UPDATE MANIFEST ----------

let manifest = [];

if (fs.existsSync(manifestFile)) {
  try {
    const raw = fs.readFileSync(manifestFile, "utf8");
    const parsed = JSON.parse(raw);

    // Normalize to [{ path: string }]
    if (Array.isArray(parsed)) {
      manifest = parsed
        .map((item) =>
          typeof item === "string"
            ? { path: item }
            : { path: item.path }
        )
        .filter((item) => item && typeof item.path === "string");
    }
  } catch (e) {
    console.warn("Could not parse existing manifest, starting fresh:", e);
    manifest = [];
  }
}

// Remove duplicates by path (in case they already exist)
const seen = new Set();
manifest = manifest.filter((item) => {
  if (seen.has(item.path)) return false;
  seen.add(item.path);
  return true;
});

// Add today's path if not already present
if (!seen.has(relManifestPath)) {
  manifest.push({ path: relManifestPath });
  console.log("Added to manifest:", relManifestPath);
} else {
  console.log("Day already present in manifest:", relManifestPath);
}

// Optional: sort by path or by day encoded in filename
manifest.sort((a, b) => a.path.localeCompare(b.path));

// Write back
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
console.log("Updated manifest", manifestFile);
