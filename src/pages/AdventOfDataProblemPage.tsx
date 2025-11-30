/// <reference types="vite/client" />
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { findAdventProblemByDay } from "../lib/advent";
import { toAssetUrl } from "../lib/paths";
import type { AdventLoaderData } from "../routes/advent";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Calendar,
  ChevronLeft,
  Tag as TagIcon,
  Lock as LockIcon,
} from "lucide-react";
import AdventComments from "../components/advent/AdventComments";

const ADVENT_YEAR = 2025;
const ADVENT_MONTH = 11; // 0-based: 11 = December

export default function AdventProblemPage() {
  const { day } = useParams();
  const navigate = useNavigate();
  const { problems } = useOutletContext<AdventLoaderData>();

  const d = parseInt(day || "", 10);
  const problem = findAdventProblemByDay(problems, d);

  const unlockDate =
    !Number.isNaN(d) && d >= 1 && d <= 25
      ? new Date(Date.UTC(ADVENT_YEAR, ADVENT_MONTH, d))
      : null;

  const unlocked = !!unlockDate && unlockDate <= new Date();

  if (!problem) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <button
          onClick={() => navigate("/advent")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to calendar
        </button>
        <h1 className="text-xl font-semibold">Problem not found</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          The challenge you�?Tre looking for doesn�?Tt exist or hasn�?Tt been
          published yet.
        </p>
      </main>
    );
  }

  if (!unlocked) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 flex flex-col items-center text-center">
        <button
          onClick={() => navigate("/advent")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to calendar
        </button>

        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <LockIcon className="h-7 w-7 text-neutral-500" />
        </div>

        <h1 className="mt-5 text-xl font-semibold">
          This problem is still locked
        </h1>

        <p className="mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
          Day {d} unlocks at <strong>00:00 UTC</strong> on{" "}
          {unlockDate?.toUTCString().slice(0, 16)}.{" "}
          Check back then to unwrap this challenge.
        </p>
      </main>
    );
  }

  const displayDate = unlockDate
    ? unlockDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const markdownContent = (problem as any).markdown ?? (problem as any).content ?? "";
  const commentAnchorId = `advent-comments-day-${problem.day}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 p-6 shadow-sm dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-900/70 dark:to-neutral-950 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.04),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(0,0,0,0.04),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="relative flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-300">
          <span>Advent of Data {ADVENT_YEAR}</span>
          <span className="h-px flex-1 min-w-[60px] bg-neutral-300/60 dark:bg-neutral-700/80" />
          <span className="rounded-full bg-neutral-900 text-white px-3 py-1 text-[11px] dark:bg-white dark:text-neutral-900">
            Day {problem.day}
          </span>
        </div>
        <div className="relative mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              {problem.title}
            </h1>
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

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr,0.9fr]">
        <article className="prose max-w-none rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:prose-invert dark:border-neutral-800 dark:bg-neutral-900">
          <button
            onClick={() => navigate("/advent")}
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <ChevronLeft className="h-4 w-4" /> Back to calendar
          </button>

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: (props) => (
                <a
                  {...props}
                  className="underline underline-offset-4"
                  target="_blank"
                  rel="noreferrer"
                />
              ),
              img: (props) => (
                <img
                  {...props}
                  src={props.src ? toAssetUrl(props.src) : undefined}
                  className="my-4 w-full rounded-xl border dark:border-neutral-800"
                  loading="lazy"
                />
              ),
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </article>
      </div>

      <section id={commentAnchorId} className="mt-12 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Discussion</h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          Share your approach, optimizations, and any gotchas you met while solving this day.
        </p>
        <AdventComments term={`advent-day-${problem.day}`} theme="dark" />
      </section>
    </main>
  );
}
