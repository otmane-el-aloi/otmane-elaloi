/// <reference types="vite/client" />
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  Unlock,
  Gift,
  Calendar,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { loadAdventProblems } from "../lib/advent";
import type { AdventProblem } from "../types";

const month = 10;
const days = Array.from({ length: 25 }, (_, i) => i + 1);

const toIso = (day: number) =>
  new Date(Date.UTC(2025, month, day)).toISOString().slice(0, 10);

const isLocked = (day: number) =>
  new Date() < new Date(Date.UTC(2025, month, day));

const todayIsoUTC = () => new Date().toISOString().slice(0, 10);

export default function AdventPage() {
  const [problems, setProblems] = useState<AdventProblem[]>([]);

  // Load problems once on mount
  useEffect(() => {
    loadAdventProblems().then(setProblems);
  }, []);

  const totalUnlocked = useMemo(
    () => days.filter((d) => !isLocked(d)).length,
    []
  );

  const todayIndex = useMemo(() => {
    const isoToday = todayIsoUTC();
    return days.find((d) => toIso(d) === isoToday);
  }, []);

  const progress = (totalUnlocked / days.length) * 100;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Banner */}
      <div className="mb-6 rounded-3xl border border-pink-200/70 bg-gradient-to-r from-pink-100 via-amber-100 to-sky-100 p-4 text-sm text-neutral-800 shadow-sm dark:from-pink-900/40 dark:via-amber-900/40 dark:to-sky-900/40 dark:text-neutral-100 dark:border-neutral-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-pink-600" />
            <div>
              <div className="font-semibold">
                Advent of Data Engineering — 2025
              </div>
              <div>
                A daily data engineering challenge from December 1st to 25th{" "}
                <Gift className="inline h-4 w-4 text-emerald-500" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs">
            <span className="rounded-full border border-white/60 bg-white/70 px-3 py-1 shadow-sm dark:bg-neutral-900/60">
              New problem unlocks at <strong>00:00 UTC</strong>
            </span>
            <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
              Tip: nothing to see here yet? Check back on December 1st!
            </span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <header className="mb-6">
        <h1 className="mb-2 flex items-center gap-2 text-2xl font-semibold">
          <span>Advent of Data Engineering — 2025</span>
        </h1>
      </header>

      {/* About */}
      <section id="about" className="mb-10">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Hi there — glad you're here! I hope you'll enjoy this Advent calendar
          of data engineering challenges. Each day unlocks a new problem
          touching on real-world topics: performance tuning, modeling
          trade-offs, governance, lakehouse patterns... and many more surprises
          😉.
          <br />
          <br />
          I took inspiration from{" "}
          <a
            href="https://adventofcode.com/"
            target="_blank"
            rel="noreferrer"
            className="underline text-blue-700 dark:text-blue-400"
          >
            Advent of Code
          </a>
          , but instead of general programming puzzles this project is aimed at
          experienced data engineers. Since it’s hard to design problems where
          the “correct” solution is just a single number, submissions here
          aren’t automatically verified. Instead, you’re encouraged to share SQL
          queries, Code Snippets, or even architecture notes — and discuss them
          openly with the community on GitHub Discussions.
        </p>
      </section>

      {/* Calendar */}
      <section id="calendar" className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className=" flex items-center gap-2 text-xl font-semibold"> <Calendar />  Calendar</h2>
          <div className="flex gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="rounded-full border px-2 py-1">
              <Gift className="inline h-4 w-4 text-emerald-500" /> Unlocked:{" "}
              {totalUnlocked}/{days.length}
            </span>
            {todayIndex ? (
              <span className="rounded-full border px-2 py-1">
                <Calendar className="inline h-4 w-4 text-emerald-500" /> Today:
                Day {todayIndex}
              </span>
            ) : null}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>Progress through Advent</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {days.map((d) => {
            const meta = problems.find((x) => x.day === d);
            const locked = isLocked(d);
            const iso = toIso(d);
            const isNew = !locked && iso === todayIsoUTC();

            return (
              <div
                key={d}
                className="relative rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60"
              >
                {isNew && (
                  <span
                    aria-label="New problem"
                    className="absolute -top-2 -right-2 z-10 select-none rounded-full bg-pink-600 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg ring-2 ring-white/60 animate-bounce dark:ring-black/40"
                  >
                    New <Sparkles className="inline h-4 w-4 text-white" />
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 font-semibold">
                    <span className="text-lg">
                      {locked ? (
                        <Lock className="h-4 w-4 text-neutral-400" />
                      ) : (
                        <Unlock className="h-4 w-4 text-emerald-500" />
                      )}
                    </span>
                    <span>Day {d}</span>
                  </div>
                  <div className="text-xs text-neutral-500">{iso}</div>
                </div>

                {locked ? (
                  <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="mb-1 font-medium">
                      Wrapped and waiting under the tree…
                    </div>
                  </div>
                ) : meta ? (
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <div className="font-medium">{meta.title}</div>
                    </div>
                    <Link
                      to={`/advent/${d}`}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full 
                                bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm 
                                ring-1 ring-blue-600/70 transition 
                                hover:bg-blue-700 hover:shadow-md 
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                                dark:bg-blue-500 dark:hover:bg-blue-400 dark:ring-blue-500/70"
                    >
                      <span>Open problem</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span>Problem unavailable. Check back soon.</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mb-10">
        <h2 className="mb-2 text-xl font-semibold">FAQ</h2>
        <div className="space-y-3">
          <Faq
            q="When do problems unlock?"
            a="At 00:00 UTC each day. Times on the calendar are shown in UTC so everyone’s clusters are on the same page."
          />
          <Faq
            q="How do I submit?"
            a="Use the Issue form for a summary and links. Open a PR under solutions/day-XX/ if you’re sharing code, and continue the conversation in GitHub Discussions."
          />
          <Faq
            q="What formats are accepted?"
            a="SQL, Spark jobs, notebooks, or architecture notes in Markdown. Anything that’s reproducible, explained, and teaches someone else is perfect."
          />
          <Faq
            q="Do I need 'perfect' solutions?"
            a="Nope! The goal is deliberate practice and discussion. Sketches, trade-off notes, and partially-optimized solutions are all welcome."
          />
        </div>
      </section>
    </main>
  );
}

/* --- Helpers --- */
function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="rounded-2xl border border-neutral-200 p-4 transition hover:border-pink-300 dark:border-neutral-800 dark:hover:border-pink-500/60"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
        <span>{q}</span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {open ? (
            <ChevronUp className="h-4 w-4 text-neutral-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          )}
        </span>
      </summary>
      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{a}</p>
    </details>
  );
}
