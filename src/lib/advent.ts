
import type { AdventProblem } from "../types";
import { toAssetUrl } from "./paths";
import {
  parseFrontMatter,
  fetchText,
  fetchJSON,
} from "./helpers";

function normalizeAdventProblem(p: any): AdventProblem {
  const day =
    typeof p.day === "number"
      ? p.day
      : parseInt(String(p.day ?? 0), 10);

  const id = p.id || `day-${String(day || 0).padStart(2, "0")}`;
  const title = p.title || `Day ${day || "?"}`;
  const difficulty = p.difficulty || "Unrated";
  const tags = Array.isArray(p.tags) ? p.tags : [];

  return {
    id,
    day,
    title,
    difficulty,
    tags,
    content: p.content || "",
  };
}

export async function loadAdventProblems(): Promise<AdventProblem[]> {
  // 1) Pre-injected global (like posts)
  const globalProblems = (window as any).__ADVENT_PROBLEMS__;
  if (Array.isArray(globalProblems)) {
    return globalProblems
      .map(normalizeAdventProblem)
      .sort((a, b) => a.day - b.day);
  }

  // 2) Manifest-based loading
  const manifest = await fetchJSON<any[]>(toAssetUrl("advent-content/index.json"));
  if (Array.isArray(manifest) && manifest.length) {
    const out: AdventProblem[] = [];

    for (const item of manifest) {
      if (item.content) {
        // inline content in manifest
        out.push(normalizeAdventProblem(item));
      } else if (item.path) {
        // markdown file with frontmatter
        const raw = await fetchText(toAssetUrl(item.path));
        if (raw) {
          const { data, content } = parseFrontMatter(raw);
          out.push(
            normalizeAdventProblem({
              ...data,
              ...item, // allow manifest to override e.g. day / difficulty
              content,
            })
          );
        }
      }
    }

    const sorted = out.sort((a, b) => a.day - b.day);
    console.log("Loaded Advent problems:", sorted);
    return sorted;
  }

  // 3) Fallback example problem
  return [
    normalizeAdventProblem({
      day: 1,
      title: "Sample Advent Problem",
      difficulty: "Easy",
      tags: ["demo"],
      content: `# Welcome

This is a sample Advent problem written in **Markdown**.

- Put your real problems under \`/advent\`
- Add an \`advent-content/index.json\` manifest to control order.`,
    }),
  ];
}

export function findAdventProblemByDay(
  problems: AdventProblem[],
  day: number
): AdventProblem | undefined {
  return problems.find((p) => p.day === day);
}