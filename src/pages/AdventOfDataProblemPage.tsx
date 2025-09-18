/// <reference types="vite/client" />
import { useParams } from "react-router-dom";
import problems from "../data/advent/problems.json";

export default function AdventProblemPage() {
  const { day } = useParams();
  const d = parseInt(day || "", 10);
  const p = (problems as any[]).find((x) => x.day === d);
  const unlocked =
    !Number.isNaN(d) && new Date(Date.UTC(2025, 10, d)) <= new Date();

  if (!p)
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        Problem not found.
      </main>
    );
  if (!unlocked)
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        🔒 This day is not unlocked yet.
      </main>
    );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2">
        Day {p.day} — {p.title}
      </h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        Difficulty: {p.difficulty} · Tags: {p.tags.join(", ")}
      </p>
      <section className="prose dark:prose-invert max-w-none">
        <h2>Problem Statement</h2>
        <p>{p.statement}</p>
        <h2>Data</h2>
        <p>{p.data}</p>
        <h2>Expected Deliverables</h2>
        <p>{p.deliverables}</p>
        <h2>Submit</h2>
        <p>
          Day discussion:{" "}
          <a
            className="underline"
            href={`https://github.com/otmane-el-aloi/otmane-elaloi/discussions/categories/advent-of-data-2025`}
            target="_blank"
            rel="noreferrer"
          >
            view
          </a>
        </p>
      </section>
    </main>
  );
}
