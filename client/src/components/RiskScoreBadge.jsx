import React from 'react';

export default function RiskScoreBadge({ score = 0, showLevel = true }) {
  let colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let levelText = 'LOW';

  if (score >= 70) {
    colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    levelText = 'CRITICAL';
  } else if (score >= 40) {
    colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    levelText = 'ELEVATED';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border font-mono text-xs font-semibold ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {score}/100 {showLevel && `(${levelText})`}
    </span>
  );
}
