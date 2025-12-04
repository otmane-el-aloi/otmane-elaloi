/// <reference types="vite/client" />
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdventBanner from "../components/AdventBanner";
import AdventLeaderboard from "../components/AdventLeaderboard";
import AdventCalendar from "../components/AdventCalendar";
import AdventFaq from "../components/AdventFaq";
import type { Commenter, LeaderboardStatus } from "../components/AdventLeaderboard";
import type { AdventLoaderData } from "../../../routes/advent";
import { fetchJSON } from "../../../lib/helpers";
import { toAssetUrl } from "../../../lib/paths";

export default function AdventPage() {
  const { problems } = useOutletContext<AdventLoaderData>();
  const navigate = useNavigate();
  const [commenters, setCommenters] = useState<Commenter[]>([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState<LeaderboardStatus>("loading");
  const [leaderboardUpdatedAt, setLeaderboardUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      try {
        const data = await fetchJSON<{ updatedAt?: string; items?: Commenter[] }>(
          toAssetUrl("advent-content/commenters.json")
        );
        if (cancelled) return;

        if (data?.items?.length) {
          const normalized = data.items
            .map((item) => ({
              ...item,
              comments: Number((item as any).comments) || 0,
            }))
            .sort((a, b) => b.comments - a.comments);

          setCommenters(normalized);
          setLeaderboardUpdatedAt(data.updatedAt ?? null);
          setLeaderboardStatus("ready");
        } else {
          setLeaderboardStatus("error");
        }
      } catch {
        if (!cancelled) setLeaderboardStatus("error");
      }
    }

    loadLeaderboard();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-10">
      <AdventBanner />

      <header className="relative z-10 mb-6">
        <h1 className="mb-2 flex items-center gap-2 text-2xl font-semibold">
          <span>Advent of Data - 2025</span>
        </h1>
      </header>

      <section id="about" className="relative z-10 mb-10">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Hi there - glad you're here! I hope you'll enjoy this Advent calendar of data engineering challenges. Each day
          unlocks a new problem touching on real-world topics: performance tuning, modeling trade-offs, lakehouse
          patterns, and other things that make your query optimizer cry. Since it's hard to design problems where the
          "correct" solution is just a single number, there are no submissions. Instead, you're encouraged to share SQL
          queries, code snippets, or even architecture notes - and discuss them openly in GitHub Discussions dedicated to
          each problem.
        </p>
      </section>

      <AdventLeaderboard commenters={commenters} status={leaderboardStatus} updatedAt={leaderboardUpdatedAt} />

      <AdventCalendar problems={problems} onOpenDay={(day) => navigate(`/advent/${day}`)} />

      <AdventFaq />
    </main>
  );
}
