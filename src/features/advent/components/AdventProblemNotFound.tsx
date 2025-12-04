import { ChevronLeft } from "lucide-react";

export default function AdventProblemNotFound({ onBack }: { onBack: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to calendar
      </button>
      <h1 className="text-xl font-semibold">Problem not found</h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        The challenge you are looking for does not exist or has not been published yet.
      </p>
    </main>
  );
}
