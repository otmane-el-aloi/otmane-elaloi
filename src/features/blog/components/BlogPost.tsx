import React from "react";
import { Calendar, ChevronLeft, Tag as TagIcon } from "lucide-react";
import type { Post } from "../../../types";
import Badge from "../../../components/ui/Badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toAssetUrl } from "../../../lib/paths";


export default function BlogPost({ post, onBack }: { post: Post; onBack: () => void }) {
  return (
    <article className="prose max-w-none dark:prose-invert">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm">
        <ChevronLeft className="h-4 w-4" /> Back to blog
      </button>
      <h1 className="mb-2 text-3xl font-bold">{post.title}</h1>
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
        <time className="inline-flex items-center gap-1">
          <Calendar className="h-4 w-4" /> {new Date(post.dateISO).toLocaleDateString()}
        </time>
        <span>·</span>
        <div className="flex flex-wrap gap-2">
          {(post.tags || []).map((t) => (
            <Badge key={t}>
              <TagIcon className="mr-1 h-3 w-3" /> {t}
            </Badge>
          ))}
        </div>
      </div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
            const src = toAssetUrl(props.src || "");
            return (
              <img
                {...props}
                src={src}
                className="my-4 w-full rounded-xl border dark:border-neutral-800"
                loading="lazy"
              />
            );
          },
          a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
            <a {...props} className="underline underline-offset-4" target="_blank" rel="noreferrer" />
          ),
        } as any}
      >
        {post.content}
      </ReactMarkdown>
    </article>
  );
}
