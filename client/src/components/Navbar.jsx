import React from 'react';
import { Shield, Cpu, Database, Bell } from 'lucide-react';

export default function Navbar({ health, pendingCount = 0, onNavigateToApprovals }) {
  const storeMode = health?.storeMode === 'mongodb' ? 'MongoDB Atlas' : 'In-Memory DB';
  const aiProvider = health?.aiProvider || 'Heuristic Rules';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg glow-cyan">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight text-white font-sans">AgentShield</h1>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20 font-mono">MVP</span>
            </div>
            <p className="text-xs text-slate-400">AI Agent Security Gateway</p>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="hidden md:flex items-center gap-3">
          {/* Gateway Status */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 px-3 py-1.5 border border-slate-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">Gateway Active</span>
          </div>

          {/* Database Mode */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 px-3 py-1.5 border border-slate-800 text-xs">
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-400">DB:</span>
            <span className="text-slate-200 font-mono font-medium">{storeMode}</span>
          </div>

          {/* AI Provider */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 px-3 py-1.5 border border-slate-800 text-xs">
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-slate-400">AI:</span>
            <span className="text-slate-200 font-mono font-medium">{aiProvider}</span>
          </div>
        </div>

        {/* Action / Notification Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToApprovals}
            className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
              pendingCount > 0
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20 glow-amber'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Approvals Queue</span>
            {pendingCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-slate-950">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
