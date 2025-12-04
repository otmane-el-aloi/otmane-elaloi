import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "When do problems unlock?",
    a: "At 00:00 UTC each day. Times on the calendar are shown in UTC so everyone's clusters are on the same page.",
  },
  {
    q: "How do I submit?",
    a: "There are no submissions for this event. Please share your thoughts in the conversation in GitHub Discussions.",
  },
  {
    q: "What formats are accepted?",
    a: "SQL, Spark jobs, notebooks, or architecture notes. Anything that's reproducible, explained, and teaches someone else is perfect.",
  },
  {
    q: "Do I need 'perfect' solutions?",
    a: "Nope! The goal is deliberate practice and discussion. Sketches, trade-off notes, and partially-optimized solutions are all welcome.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
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
          {open ? <ChevronUp className="h-4 w-4 text-neutral-500" /> : <ChevronDown className="h-4 w-4 text-neutral-500" />}
        </span>
      </summary>
      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{a}</p>
    </details>
  );
}

export default function AdventFaq() {
  return (
    <section id="faq" className="relative z-10 mb-10">
      <h2 className="mb-2 text-xl font-semibold">FAQ</h2>
      <div className="space-y-3">
        {FAQ_ITEMS.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </section>
  );
}
