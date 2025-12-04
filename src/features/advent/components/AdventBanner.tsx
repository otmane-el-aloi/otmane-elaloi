import { Gift } from "lucide-react";
import NextUnlockCountdown from "./NextUnlockCountdown";

export default function AdventBanner() {
  return (
    <div className="relative z-10 mb-6 rounded-3xl border border-pink-200/70 bg-gradient-to-r from-pink-100 via-amber-100 to-sky-100 p-4 text-sm text-neutral-800 shadow-sm dark:from-pink-900/40 dark:via-amber-900/40 dark:to-sky-900/40 dark:border-neutral-700 dark:text-neutral-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-pink-600" />
          <div>
            <div className="font-semibold">Advent of Data - 2025</div>
            <div>
              A daily data engineering challenge from December 1st to 25th{" "}
              <Gift className="inline h-4 w-4 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs">
          <NextUnlockCountdown />
          <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
            Tip: nothing to see here yet? Check back on December 1st!
          </span>
        </div>
      </div>
    </div>
  );
}
