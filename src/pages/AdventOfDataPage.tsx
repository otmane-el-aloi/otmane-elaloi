/// <reference types="vite/client" />
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import problems from "../data/advent/problems.json";

const days = Array.from({ length: 25 }, (_, i) => i + 1);
const toIso = (day: number) =>
  new Date(Date.UTC(2025, 10, day)).toISOString().slice(0, 10);
const isLocked = (day: number) => new Date() < new Date(Date.UTC(2025, 10, day));
const todayIsoUTC = () => new Date().toISOString().slice(0, 10);

type LeaderboardEntry = {
  user: string;
  solved: number;
  points?: number;
  avatar_url?: string;
};

function TopContributors({
  data,
  limit = 3,
}: {
  data?: { user: string; points?: number; solved?: number; avatar_url?: string }[] | null;
  limit?: number;
}) {
  if (!data || data.length === 0) return null;
  const top = [...data]
    .sort((a, b) => (b.points ?? b.solved ?? 0) - (a.points ?? a.solved ?? 0))
    .slice(0, limit);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
      <span className="font-medium text-neutral-700 dark:text-neutral-300">
        Top contributors this week:
      </span>
      {top.map((u) => (
        <a
          key={u.user}
          href={`https://github.com/${u.user}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-2 py-1 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          title={`${u.user} • ${u.points ?? u.solved ?? 0} pts`}
        >
          {u.avatar_url ? (
            <img
              src={u.avatar_url}
              alt=""
              className="h-5 w-5 rounded-full ring-2 ring-white dark:ring-black"
              loading="lazy"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          )}
          <span className="font-medium">{u.user}</span>
          <span className="text-neutral-500">{(u.points ?? u.solved ?? 0)} pts</span>
        </a>
      ))}
    </div>
  );
}

export default function AdventPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    fetch("/data/advent/leaderboard.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setLeaderboard(j))
      .catch(() => {});
  }, []);

  const totalUnlocked = useMemo(() => days.filter((d) => !isLocked(d)).length, []);
  const todayIndex = useMemo(() => {
    const isoToday = todayIsoUTC();
    return days.find((d) => toIso(d) === isoToday);
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
       {/* Subnav */}
      <nav
        className="sticky top-[56px] z-10 -mx-4 mb-6 border-y bg-white/75 backdrop-blur dark:bg-neutral-950/60 dark:border-neutral-900"
        aria-label="Advent sub navigation"
      >
        <ul className="mx-auto max-w-6xl px-4 flex flex-wrap gap-4 py-2 text-sm">
          <li>
            <a href="#about" className="hover:underline">
              About
            </a>
          </li>
          <li>
            <a href="#calendar" className="hover:underline">
              Calendar
            </a>
          </li>
          <li>
            <a href="#leaderboard" className="hover:underline">
              Leaderboard
            </a>
          </li>
          <li>
            <a href="#faq" className="hover:underline">
              FAQ
            </a>
          </li>
        </ul>
      </nav>
      
      {/* Hero */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Advent of Data Engineering — 2025</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          New problem unlocks at <strong>00:00 UTC</strong> daily.
        </p>
        <TopContributors data={leaderboard ?? undefined} />
      </header>

     

      {/* About */}
      <section id="about" className="mb-10">
        <h2 className="text-xl font-semibold mb-2">About</h2>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Hi there — glad you're here! I hope you'll enjoy this Advent calendar of
          data engineering challenges. Each day unlocks a new problem touching on
          real-world topics: performance tuning, modeling trade-offs, governance,
          lakehouse patterns... and many more surprises 😉.
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
          experienced data engineers. Since it’s hard to design problems where the
          “correct” solution is just a single number, submissions here aren’t
          automatically verified. Instead, you’re encouraged to share SQL queries,
          Code Snippets, or even architecture notes — and discuss them openly with
          the community on GitHub Discussions.
        </p>
      </section>

      {/* Calendar */}
      <section id="calendar" className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Calendar</h2>
          <div className="flex gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="rounded-full border px-2 py-1">
              Unlocked: {totalUnlocked}/{days.length}
            </span>
            {todayIndex ? (
              <span className="rounded-full border px-2 py-1">Today: Day {todayIndex}</span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {days.map((d) => {
            const meta = (problems as any[]).find((x) => x.day === d);
            const locked = isLocked(d);
            const iso = toIso(d);
            const isNew = !locked && iso === todayIsoUTC();
            return (
              <div
                key={d}
                className="relative rounded-2xl border p-4 border-neutral-200 dark:border-neutral-800"
              >
                {isNew && (
                  <span
                    aria-label="New problem"
                    className="absolute -top-2 -right-2 z-10 select-none rounded-full bg-pink-600 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg ring-2 ring-white/60 dark:ring-black/40"
                  >
                    New
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Day {d}</div>
                  <div className="text-xs text-neutral-500">{iso}</div>
                </div>

                {locked ? (
                  <div className="mt-3 text-sm italic text-neutral-500">🔒 Coming soon</div>
                ) : meta ? (
                  <div className="mt-3">
                    <div className="font-medium">{meta.title}</div>
                    <div className="text-xs text-neutral-500">Difficulty: {meta.difficulty}</div>
                    <Link
                      to={`/advent/${d}`}
                      className="inline-block mt-2 text-blue-700 dark:text-blue-400 underline"
                    >
                      Open problem →
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 text-sm">Problem unavailable.</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Leaderboard */}
      <section id="leaderboard" className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
        {leaderboard && leaderboard.length > 0 ? (
          <ol className="divide-y divide-neutral-200 dark:divide-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            {leaderboard.map((row, i) => (
              <li key={row.user + i} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs">{i + 1}</span>
                  {row.avatar_url ? (
                    <img src={row.avatar_url} alt="" className="h-6 w-6 rounded-full" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  )}
                  <span className="font-medium">{row.user}</span>
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  Solved: {row.solved}
                  {row.points ? ` · ${row.points} pts` : ""}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            <code>/data/advent/leaderboard.json</code>:
            <br />
            <code>[&#123;"user":"alice","solved":14,"points":210&#125;, ...]</code>
          </p>
        )}
      </section>

      {/* FAQ */}
      <section id="faq" className="mb-10">
        <h2 className="text-xl font-semibold mb-2">FAQ</h2>
        <div className="space-y-3">
          <Faq
            q="When do problems unlock?"
            a="At 00:00 UTC each day. Times are shown in UTC on the calendar."
          />
          <Faq
            q="How do I submit?"
            a="Use the Issue form for a summary and links; open a PR under solutions/day-XX/ if sharing code; discuss in GitHub Discussions."
          />
          <Faq
            q="What formats are accepted?"
            a="SQL, Code Snippets, or Architecture notes in Markdown. Keep it reproducible and documented."
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
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4"
    >
      <summary className="cursor-pointer font-medium">{q}</summary>
      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{a}</p>
    </details>
  );
}
