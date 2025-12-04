import AdventComments from "./AdventComments";

export default function AdventDiscussion({
  day,
  anchorId,
  theme = "dark",
}: {
  day: number;
  anchorId: string;
  theme?: "light" | "dark";
}) {
  return (
    <section
      id={anchorId}
      className="mt-12 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Discussion</h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
        Share your approach, optimizations, and any gotchas you met while solving this day.
      </p>
      <AdventComments term={`advent-day-${day}`} theme={theme} />
    </section>
  );
}
