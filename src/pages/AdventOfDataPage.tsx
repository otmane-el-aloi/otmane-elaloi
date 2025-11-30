/// <reference types="vite/client" />
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowUpRight,
  Crown,
  Lock,
  Unlock,
  Gift,
  Calendar,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import type { AdventLoaderData } from "../routes/advent";
import { fetchJSON } from "../lib/helpers";
import { toAssetUrl } from "../lib/paths";

const month = 10;
const days = Array.from({ length: 25 }, (_, i) => i + 1);

const toIso = (day: number) =>
  new Date(Date.UTC(2025, month, day)).toISOString().slice(0, 10);

const isLocked = (day: number) =>
  new Date() < new Date(Date.UTC(2025, month, day));

const todayIsoUTC = () => new Date().toISOString().slice(0, 10);

type Commenter = {
  login: string;
  comments: number;
  avatarUrl?: string;
  profileUrl?: string;
  lastCommentedAt?: string;
};

type CommenterLeaderboard = {
  updatedAt?: string;
  items?: Commenter[];
};

export default function AdventPage() {
  const { problems } = useOutletContext<AdventLoaderData>();
  const [shakingId, setShakingId] = useState<number | null>(null); // Track which card is shaking
  const [commenters, setCommenters] = useState<Commenter[]>([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [leaderboardUpdatedAt, setLeaderboardUpdatedAt] = useState<string | null>(null);
  const navigate = useNavigate();

  const totalUnlocked = useMemo(
    () => days.filter((d) => !isLocked(d)).length,
    []
  );

  const todayIndex = useMemo(() => {
    const isoToday = todayIsoUTC();
    return days.find((d) => toIso(d) === isoToday);
  }, []);

  const featuredCommenters = useMemo(() => commenters.slice(0, 3), [commenters]);

  const progress = (totalUnlocked / days.length) * 100;

  const handleNavigateToProblem = (day: number) => {
    navigate(`/advent/${day}`);
  };

  // Feature: Shake interaction for locked items
  const handleLockedClick = (day: number) => {
    setShakingId(day);
    setTimeout(() => setShakingId(null), 500); // Reset after animation
  };

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      try {
        const data = await fetchJSON<CommenterLeaderboard>(
          toAssetUrl("advent-content/commenters.json")
        );
        if (cancelled) return;

        if (data?.items?.length) {
          const normalized = data.items
            .map((item) => ({
              ...item,
              comments: Number((item as any).comments) || 0,
            }))
            .sort((a, b) => b.comments - a.comments);

          setCommenters(normalized);
          setLeaderboardUpdatedAt(data.updatedAt ?? null);
          setLeaderboardStatus("ready");
        } else {
          setLeaderboardStatus("error");
        }
      } catch {
        if (!cancelled) setLeaderboardStatus("error");
      }
    }

    loadLeaderboard();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-10">
      {/* Banner */}
      <div className="relative z-10 mb-6 rounded-3xl border border-pink-200/70 bg-gradient-to-r from-pink-100 via-amber-100 to-sky-100 p-4 text-sm text-neutral-800 shadow-sm dark:from-pink-900/40 dark:via-amber-900/40 dark:to-sky-900/40 dark:border-neutral-700 dark:text-neutral-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-pink-600" />
            <div>
              <div className="font-semibold">
                Advent of Data — 2025
              </div>
              <div>
                A daily data engineering challenge from December 1st to 25th{" "}
                <Gift className="inline h-4 w-4 text-emerald-500" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs">
            {/* 2. Live Countdown Component */}
            <NextUnlockCountdown />
            <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
              Tip: nothing to see here yet? Check back on December 1st!
            </span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <header className="relative z-10 mb-6">
        <h1 className="mb-2 flex items-center gap-2 text-2xl font-semibold">
          <span>Advent of Data — 2025</span>
        </h1>
      </header>

      {/* About */}
      <section id="about" className="relative z-10 mb-10">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Hi there — glad you're here! I hope you'll enjoy this Advent calendar
          of data engineering challenges. Each day unlocks a new problem
          touching on real-world topics: performance tuning, modeling
          trade-offs, lakehouse patterns... and other things that make your
          query optimizer cry 😉. Since it’s hard to design problems where the
          “correct” solution is just a single number, there are no submissions.
          Instead, you’re encouraged to share SQL queries, Code Snippets, or
          even architecture notes — and discuss them openly in GitHub
          Discussions dedicated to each problem.
        </p>
      </section>

      {/* Leaderboard */}
      <section id="leaderboard" className="relative z-10 mb-10">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-semibold">Top commenters </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Spotlighting the top 3 voices across Advent discussions.
              </p>
            </div>
          </div>
          {leaderboardUpdatedAt ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 shadow-sm dark:border-neutral-700 dark:text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Updated {formatShortDate(leaderboardUpdatedAt)}
            </span>
          ) : null}
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white/80 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
          {leaderboardStatus === "loading" ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-gradient-to-r from-pink-50 via-white to-amber-50 px-4 py-5 text-sm text-neutral-700 shadow-sm dark:border-neutral-800 dark:from-pink-900/30 dark:via-neutral-900 dark:to-amber-900/30 dark:text-neutral-200">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-600" />
                <span>Loading the freshest discussion activity...</span>
              </div>
              <span className="animate-pulse rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700">
                Live
              </span>
            </div>
          ) : leaderboardStatus === "error" ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-6 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              We will surface the leaderboard as soon as the GitHub Discussions sync finishes.
              Drop a comment on a challenge to climb the board.
            </div>
          ) : (
            <>
              {featuredCommenters.length ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {featuredCommenters.map((person, idx) => (
                    <FeaturedCommenterCard key={person.login} rank={idx + 1} commenter={person} />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      {/* Calendar */}
      <section id="calendar" className="relative z-10 mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className=" flex items-center gap-2 text-xl font-semibold">
            {" "}
            <Calendar /> Calendar
          </h2>
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
            const isShaking = shakingId === d;

            return (
              <div
                key={d}
                // Added onClick to trigger shake if locked
                onClick={() => (locked ? handleLockedClick(d) : undefined)}
                className={`relative rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm transition 
                  dark:border-neutral-800 dark:bg-neutral-900/60
                  ${
                    locked
                      ? "cursor-not-allowed active:scale-95"
                      : "hover:-translate-y-1 hover:shadow-md"
                  }
                  ${isShaking ? "animate-shake border-red-300 ring-2 ring-red-200 dark:ring-red-900" : ""}
                `}
              >
                {isNew && (
                  <span
                    aria-label="New problem"
                    className="absolute -right-2 -top-2 z-10 animate-bounce select-none rounded-full bg-pink-600 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg ring-2 ring-white/60 dark:ring-black/40"
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
                      {/* Changes text slightly when shaking */}
                      {isShaking
                        ? "Don't peek! 🎁"
                        : "Wrapped and waiting under the tree…"}
                    </div>
                  </div>
                ) : meta ? (
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <div className="font-medium">{meta.title}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleNavigateToProblem(d);
                      }}
                      className="mt-2 inline-flex items-center justify-center gap-2 rounded-full 
                                bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm 
                                ring-1 ring-green-600/70 transition 
                                hover:bg-green-700 hover:shadow-md 
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400
                                dark:bg-green-500 dark:hover:bg-green-400 dark:ring-green-500/70"
                    >
                      <span>Go to Challenge</span>
                    </button>
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
      <section id="faq" className="relative z-10 mb-10">
        <h2 className="mb-2 text-xl font-semibold">FAQ</h2>
        <div className="space-y-3">
          <Faq
            q="When do problems unlock?"
            a="At 00:00 UTC each day. Times on the calendar are shown in UTC so everyone’s clusters are on the same page."
          />
          <Faq
            q="How do I submit?"
            a="There are no submissions for this event. Please share your thoughts in the conversation in GitHub Discussions."
          />
          <Faq
            q="What formats are accepted?"
            a="SQL, Spark jobs, notebooks, or architecture notes. Anything that’s reproducible, explained, and teaches someone else is perfect."
          />
          <Faq
            q="Do I need 'perfect' solutions?"
            a="Nope! The goal is deliberate practice and discussion. Sketches, trade-off notes, and partially-optimized solutions are all welcome."
          />
        </div>
      </section>

      {/* Tailwind Custom Keyframe for Shake (Inline Style Injection) */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          75% { transform: translateX(5px) rotate(5deg); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </main>
  );
}

function formatShortDate(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatTimestamp(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AvatarBubble({
  commenter,
  size = "md",
}: {
  commenter: Commenter;
  size?: "sm" | "md" | "lg";
}) {
  const dimensions =
    size === "lg" ? "h-14 w-14" : size === "sm" ? "h-9 w-9" : "h-11 w-11";

  if (commenter.avatarUrl) {
    return (
      <img
        src={commenter.avatarUrl}
        alt={`${commenter.login} avatar`}
        className={`${dimensions} rounded-full border border-white/80 object-cover shadow-sm dark:border-neutral-800`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${dimensions} rounded-full bg-gradient-to-br from-neutral-200 to-neutral-50 text-sm font-semibold uppercase text-neutral-700 ring-1 ring-neutral-300 shadow-sm dark:from-neutral-800 dark:to-neutral-700 dark:text-neutral-200 dark:ring-neutral-600`}
    >
      <span className="flex h-full items-center justify-center">
        {(commenter.login || "?").slice(0, 1)}
      </span>
    </div>
  );
}

function FeaturedCommenterCard({
  commenter,
  rank,
}: {
  commenter: Commenter;
  rank: number;
}) {
  const gradient =
    rank === 1
      ? "from-amber-400/70 via-pink-400/70 to-emerald-400/70"
      : rank === 2
      ? "from-sky-200/80 via-white to-pink-200/80"
      : "from-emerald-200/70 via-white to-amber-200/70";

  const badgeCopy =
    rank === 1 ? "Leading the pack" : rank === 2 ? "Runner up" : "On the podium";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/70">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-70 dark:opacity-25`} />
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-neutral-700 ring-1 ring-neutral-200 backdrop-blur-sm dark:bg-neutral-950/70 dark:text-neutral-200 dark:ring-neutral-800">
          <Crown className="h-4 w-4 text-amber-500" />
          <span>#{rank}</span>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          {badgeCopy}
        </span>
      </div>
      <div className="relative mt-4 flex items-center gap-3">
        <AvatarBubble commenter={commenter} size="lg" />
        <div className="min-w-0">
          <a
            href={commenter.profileUrl ?? `https://github.com/${commenter.login}`}
            target="_blank"
            rel="noreferrer"
            className="text-base font-semibold text-neutral-900 underline-offset-4 hover:underline dark:text-white"
          >
            {commenter.login}
          </a>
          <p className="text-xs text-neutral-700 dark:text-neutral-300">
            {commenter.comments} comment{commenter.comments === 1 ? "" : "s"}
          </p>
          {commenter.lastCommentedAt ? (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Last comment {formatTimestamp(commenter.lastCommentedAt)}
            </p>
          ) : null}
        </div>
      </div>
      <div className="relative mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 font-semibold text-neutral-800 ring-1 ring-neutral-200 backdrop-blur-sm dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700">
          <MessageSquare className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          <span className="tabular-nums">{commenter.comments}</span>
        </div>
        <a
          href={commenter.profileUrl ?? `https://github.com/${commenter.login}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-pink-700 underline-offset-4 hover:underline dark:text-pink-300"
        >
          View profile <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

/* --- Feature: Live Countdown Timer --- */
function NextUnlockCountdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const nowUtc = new Date(
        now.toLocaleString("en-US", { timeZone: "UTC" })
      );

      const nextUnlock = new Date(nowUtc);
      if (nextUnlock.getUTCMonth() === 11) { // If it's already December
        nextUnlock.setUTCDate(nextUnlock.getUTCDate() + 1);
      } else {
        nextUnlock.setUTCMonth(11, 1); // Set to December 1st
      }
      nextUnlock.setUTCHours(0, 0, 0, 0);

      const diff = nextUnlock.getTime() - nowUtc.getTime();
      if (diff <= 0) return "00:00:00";

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${hours.toString().padStart(2, "0")}h ${minutes
        .toString()
        .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-1 shadow-sm dark:bg-neutral-900/60">
      <Clock className="h-3 w-3 text-pink-600 dark:text-pink-400" />
      <span>
        Next unlock in <strong className="tabular-nums">{timeLeft}</strong>
      </span>
    </span>
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
      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
        {a}
      </p>
    </details>
  );
}
