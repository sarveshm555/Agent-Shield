import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldX } from 'lucide-react';

export default function DecisionBadge({ decision, showIcon = true, size = 'md' }) {
  if (decision === 'ALLOW') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs tracking-wider'
      }`}>
        {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
        ALLOW
      </span>
    );
  }

  if (decision === 'APPROVAL_REQUIRED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs tracking-wider'
      }`}>
        {showIcon && <AlertTriangle className="w-3.5 h-3.5" />}
        APPROVAL REQUIRED
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 ${
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs tracking-wider'
    }`}>
      {showIcon && <ShieldX className="w-3.5 h-3.5" />}
      BLOCK
    </span>
  );
}
