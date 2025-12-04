import { ArrowUpRight, Crown, MessageSquare, Sparkles } from "lucide-react";
import type { PropsWithChildren } from "react";

export type Commenter = {
  login: string;
  comments: number;
  avatarUrl?: string;
  profileUrl?: string;
  lastCommentedAt?: string;
};

export type LeaderboardStatus = "loading" | "ready" | "error";

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

function AvatarBubble({ commenter, size = "md" }: { commenter: Commenter; size?: "sm" | "md" | "lg" }) {
  const dimensions = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-9 w-9" : "h-11 w-11";

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
      <span className="flex h-full items-center justify-center">{(commenter.login || "?").slice(0, 1)}</span>
    </div>
  );
}

function LeaderboardCard({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white/80 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
      {children}
    </div>
  );
}

function FeaturedCommenterCard({ commenter, rank }: { commenter: Commenter; rank: number }) {
  const gradient =
    rank === 1
      ? "from-amber-400/70 via-pink-400/70 to-emerald-400/70"
      : rank === 2
      ? "from-sky-200/80 via-white to-pink-200/80"
      : "from-emerald-200/70 via-white to-amber-200/70";

  const badgeCopy = rank === 1 ? "Leading the pack" : rank === 2 ? "Runner up" : "On the podium";

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

export default function AdventLeaderboard({
  commenters,
  status,
  updatedAt,
}: {
  commenters: Commenter[];
  status: LeaderboardStatus;
  updatedAt: string | null;
}) {
  const featured = commenters.slice(0, 3);

  return (
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
        {updatedAt ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 shadow-sm dark:border-neutral-700 dark:text-neutral-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Updated {formatShortDate(updatedAt)}
          </span>
        ) : null}
      </div>

      <LeaderboardCard title="Top commenters">
        {status === "loading" ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-gradient-to-r from-pink-50 via-white to-amber-50 px-4 py-5 text-sm text-neutral-700 shadow-sm dark:border-neutral-800 dark:from-pink-900/30 dark:via-neutral-900 dark:to-amber-900/30 dark:text-neutral-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-600" />
              <span>Loading the freshest discussion activity...</span>
            </div>
            <span className="animate-pulse rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700">
              Live
            </span>
          </div>
        ) : status === "error" ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-6 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
            We will surface the leaderboard as soon as the GitHub Discussions sync finishes. Drop a comment on a challenge
            to climb the board.
          </div>
        ) : featured.length ? (
          <div className="grid gap-3 md:grid-cols-3">
            {featured.map((person, idx) => (
              <FeaturedCommenterCard key={person.login} rank={idx + 1} commenter={person} />
            ))}
          </div>
        ) : null}
      </LeaderboardCard>
    </section>
  );
}
