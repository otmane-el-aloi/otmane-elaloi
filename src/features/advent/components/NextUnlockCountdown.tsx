import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function NextUnlockCountdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const nowUtc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));

      const nextUnlock = new Date(nowUtc);
      if (nextUnlock.getUTCMonth() === 11) {
        nextUnlock.setUTCDate(nextUnlock.getUTCDate() + 1);
      } else {
        nextUnlock.setUTCMonth(11, 1);
      }
      nextUnlock.setUTCHours(0, 0, 0, 0);

      const diff = nextUnlock.getTime() - nowUtc.getTime();
      if (diff <= 0) return "00:00:00";

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${hours.toString().padStart(2, "0")}h ${minutes
        .toString()
        .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-1 shadow-sm dark:bg-neutral-900/60">
      <Clock className="h-3 w-3 text-pink-600 dark:text-pink-400" />
      <span>
        Next unlock in <strong className="tabular-nums">{timeLeft}</strong>
      </span>
    </span>
  );
}
