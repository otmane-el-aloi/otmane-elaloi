import { useMemo, useState } from "react";
import { AlertTriangle, Calendar, Gift, Lock, Sparkles, Unlock } from "lucide-react";
import type { AdventProblem } from "../../../types";

const ADVENT_YEAR = 2025;
const ADVENT_MONTH_INDEX = 10; // 0-based (11 = December)
const days = Array.from({ length: 25 }, (_, i) => i + 1);

const toIso = (day: number) => new Date(Date.UTC(ADVENT_YEAR, ADVENT_MONTH_INDEX, day)).toISOString().slice(0, 10);
const isLocked = (day: number) => new Date() < new Date(Date.UTC(ADVENT_YEAR, ADVENT_MONTH_INDEX, day));
const todayIsoUTC = () => new Date().toISOString().slice(0, 10);

export default function AdventCalendar({
  problems,
  onOpenDay,
}: {
  problems: AdventProblem[];
  onOpenDay: (day: number) => void;
}) {
  const [shakingId, setShakingId] = useState<number | null>(null);

  const totalUnlocked = useMemo(() => days.filter((d) => !isLocked(d)).length, []);
  const todayIndex = useMemo(() => days.find((d) => toIso(d) === todayIsoUTC()), []);
  const progress = (totalUnlocked / days.length) * 100;

  const handleLockedClick = (day: number) => {
    setShakingId(day);
    setTimeout(() => setShakingId(null), 500);
  };

  return (
    <section id="calendar" className="relative z-10 mb-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className=" flex items-center gap-2 text-xl font-semibold">
          <Calendar /> Calendar
        </h2>
        <div className="flex gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="rounded-full border px-2 py-1">
            <Gift className="inline h-4 w-4 text-emerald-500" /> Unlocked: {totalUnlocked}/{days.length}
          </span>
          {todayIndex ? (
            <span className="rounded-full border px-2 py-1">
              <Calendar className="inline h-4 w-4 text-emerald-500" /> Today: Day {todayIndex}
            </span>
          ) : null}
        </div>
      </div>

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
              onClick={() => (locked ? handleLockedClick(d) : undefined)}
              className={`relative rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm transition 
                  dark:border-neutral-800 dark:bg-neutral-900/60
                  ${
                    locked ? "cursor-not-allowed active:scale-95" : "hover:-translate-y-1 hover:shadow-md"
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
                    {locked ? <Lock className="h-4 w-4 text-neutral-400" /> : <Unlock className="h-4 w-4 text-emerald-500" />}
                  </span>
                  <span>Day {d}</span>
                </div>
                <div className="text-xs text-neutral-500">{iso}</div>
              </div>

              {locked ? (
                <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="mb-1 font-medium">
                    {isShaking ? "Don't peek!" : "Wrapped and waiting under the tree..."}
                  </div>
                </div>
              ) : meta ? (
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="font-medium">{meta.title}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDay(d);
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
    </section>
  );
}
