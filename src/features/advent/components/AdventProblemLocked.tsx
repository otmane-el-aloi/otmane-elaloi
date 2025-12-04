import { ChevronLeft, Lock as LockIcon } from "lucide-react";

export default function AdventProblemLocked({
  day,
  unlockDate,
  onBack,
}: {
  day: number;
  unlockDate: Date | null;
  onBack: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 flex flex-col items-center text-center">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to calendar
      </button>

      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <LockIcon className="h-7 w-7 text-neutral-500" />
      </div>

      <h1 className="mt-5 text-xl font-semibold">This problem is still locked</h1>

      <p className="mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
        Day {day} unlocks at <strong>00:00 UTC</strong> on {unlockDate?.toUTCString().slice(0, 16)}. Check back then to
        unwrap this challenge.
      </p>
    </main>
  );
}
