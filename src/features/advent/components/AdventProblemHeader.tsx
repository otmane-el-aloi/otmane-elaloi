import { Calendar, Tag as TagIcon } from "lucide-react";
import type { AdventProblem } from "../../../types";

export default function AdventProblemHeader({
  problem,
  displayDate,
  year,
}: {
  problem: AdventProblem;
  displayDate: string;
  year: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 p-6 shadow-sm dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-900/70 dark:to-neutral-950 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.04),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(0,0,0,0.04),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_30%)]" />
      <div className="relative flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-300">
        <span>Advent of Data {year}</span>
        <span className="h-px flex-1 min-w-[60px] bg-neutral-300/60 dark:bg-neutral-700/80" />
        <span className="rounded-full bg-neutral-900 text-white px-3 py-1 text-[11px] dark:bg-white dark:text-neutral-900">
          Day {problem.day}
        </span>
      </div>
      <div className="relative mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{problem.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
            {displayDate && (
              <time className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
                <Calendar className="h-4 w-4" /> {displayDate}
              </time>
            )}
            {problem.difficulty && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs uppercase tracking-wide ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
                <span className="h-2 w-2 rounded-full bg-neutral-900 dark:bg-white" />
                {problem.difficulty}
              </span>
            )}
          </div>
        </div>
        {problem.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800"
              >
                <TagIcon className="h-3 w-3" /> {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
