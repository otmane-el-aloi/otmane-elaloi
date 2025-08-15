import React from "react";
import type { Post } from "../../types";

export default function BlogCinemaBanner({
  posts,
  onPick,
  show = true,
}: {
  posts: Post[];
  onPick: (slug: string) => void;
  show?: boolean;
}) {
  if (!show || !posts?.length) return null;

  return (
    <>
      <style>{`
        @keyframes ticker-rtl {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .ticker:hover .ticker-content { animation-play-state: paused; }
      `}</style>

      <div
        className="
          ticker fixed inset-x-0 bottom-0 z-50
          w-full border-t border-neutral-800
          bg-black text-white
          shadow-[0_-6px_20px_rgba(0,0,0,0.4)]
          overflow-hidden flex items-center
        "
        style={{ height: "40px" }}
      >
        <div
          className="ticker-content flex items-center gap-4"
          style={{ width: "max-content", animation: "ticker-rtl 30s linear infinite" }}
        >
          {posts.map((p) => (
            <React.Fragment key={p.id}>
              <button
                onClick={() => onPick(p.slug)}
                className="px-4 py-1 uppercase font-mono tracking-[0.18em] text-[11px] md:text-[12px] text-white/90 hover:text-white transition-colors"
              >
                {p.title.toUpperCase()}
              </button>
              <span aria-hidden="true" className="select-none text-white/40">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
