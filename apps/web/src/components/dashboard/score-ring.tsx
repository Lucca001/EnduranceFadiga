"use client";

import { motion } from "framer-motion";

/** Animated 0–100 score ring (Whoop/Oura style). */
export function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const tone = score >= 70 ? "hsl(160 84% 45%)" : score >= 45 ? "hsl(38 95% 58%)" : "hsl(0 78% 60%)";

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="hsl(228 12% 16%)" strokeWidth="9" />
        <motion.circle
          cx="64" cy="64" r={r} fill="none"
          stroke={tone} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          style={{ filter: `drop-shadow(0 0 10px ${tone})` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-4xl font-semibold">{score}</div>
        <div className="text-[11px] uppercase tracking-widest text-muted">{label}</div>
      </div>
    </div>
  );
}
