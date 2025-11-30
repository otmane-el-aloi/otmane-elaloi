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
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <article className="prose max-w-none dark:prose-invert">
        <button
          onClick={() => navigate("/advent")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ChevronLeft className="h-4 w-4" /> Back to calendar
        </button>

        <h1 className="mb-2 text-3xl font-bold">
          Day {problem.day} -  {problem.title}
        </h1>

        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          {displayDate && (
            <time className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {displayDate}
            </time>
          )}
          {problem.difficulty && (
            <>
              <span className="text-xs rounded-full border border-neutral-300 px-2 py-0.5 uppercase tracking-wide dark:border-neutral-700">
                Difficulty: {problem.difficulty}
              </span>
            </>
          )}
          {problem.tags?.length ? (
            <>
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    <TagIcon className="h-3 w-3" /> {t}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>

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

      <section id={commentAnchorId} className="mt-10">
        <AdventComments term={`advent-day-${problem.day}`} theme="dark" />
      </section>
    </main>
  );
}
