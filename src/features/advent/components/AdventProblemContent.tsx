import { ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toAssetUrl } from "../../../lib/paths";

export default function AdventProblemContent({
  markdown,
  onBack,
}: {
  markdown: string;
  onBack: () => void;
}) {
  return (
    <article className="prose max-w-none rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:prose-invert dark:border-neutral-800 dark:bg-neutral-900">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <ChevronLeft className="h-4 w-4" /> Back to calendar
      </button>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => (
            <a {...props} className="underline underline-offset-4" target="_blank" rel="noreferrer" />
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
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
