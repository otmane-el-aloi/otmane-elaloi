/// <reference types="vite/client" />
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { findAdventProblemByDay } from "../../../lib/advent";
import type { AdventLoaderData } from "../../../routes/advent";
import AdventProblemLocked from "../components/AdventProblemLocked";
import AdventProblemNotFound from "../components/AdventProblemNotFound";
import AdventProblemHeader from "../components/AdventProblemHeader";
import AdventProblemContent from "../components/AdventProblemContent";
import AdventDiscussion from "../components/AdventDiscussion";

const ADVENT_YEAR = 2025;
const ADVENT_MONTH = 10; // 0-based: 11 = December

export default function AdventProblemPage() {
  const { day } = useParams();
  const navigate = useNavigate();
  const { problems } = useOutletContext<AdventLoaderData>();

  const parsedDay = parseInt(day || "", 10);
  const problem = findAdventProblemByDay(problems, parsedDay);

  const unlockDate =
    !Number.isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 25
      ? new Date(Date.UTC(ADVENT_YEAR, ADVENT_MONTH, parsedDay))
      : null;

  const unlocked = !!unlockDate && unlockDate <= new Date();
  const handleBack = () => navigate("/advent");

  if (!problem) {
    return <AdventProblemNotFound onBack={handleBack} />;
  }

  if (!unlocked) {
    return <AdventProblemLocked day={parsedDay} unlockDate={unlockDate} onBack={handleBack} />;
  }

  const displayDate = unlockDate
    ? unlockDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const markdownContent = (problem as any).markdown ?? (problem as any).content ?? "";
  const commentAnchorId = `advent-comments-day-${problem.day}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <AdventProblemHeader problem={problem} displayDate={displayDate} year={ADVENT_YEAR} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr,0.9fr]">
        <AdventProblemContent markdown={markdownContent} onBack={handleBack} />
      </div>

      <AdventDiscussion day={problem.day} anchorId={commentAnchorId} theme="dark" />
    </main>
  );
}
