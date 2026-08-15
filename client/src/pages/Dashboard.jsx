import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ShieldX, 
  Activity, 
  ArrowUpRight, 
  Play, 
  RefreshCw 
} from 'lucide-react';
import { fetchLogs, fetchApprovals } from '../services/api';
import DecisionBadge from '../components/DecisionBadge';
import RiskScoreBadge from '../components/RiskScoreBadge';

export default function Dashboard({ onNavigateToSimulator, onNavigateToApprovals }) {
  const [logs, setLogs] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const logsRes = await fetchLogs();
      if (logsRes.success) {
        setLogs(logsRes.logs || []);
      }
      const apprRes = await fetchApprovals(true);
      if (apprRes.success) {
        setPendingApprovals(apprRes.approvals || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalActions = logs.length;
  const allowedCount = logs.filter(l => l.finalDecision === 'ALLOW').length;
  const approvalCount = logs.filter(l => l.finalDecision === 'APPROVAL_REQUIRED').length;
  const blockedCount = logs.filter(l => l.finalDecision === 'BLOCK').length;
  const highRiskCount = logs.filter(l => l.riskScore >= 70).length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Security Gateway Dashboard</h2>
          <p className="text-slate-400 text-sm">Real-time evaluation metrics for AI Agent business system access</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <button
            onClick={onNavigateToSimulator}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg glow-cyan hover:opacity-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Launch Simulator
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Actions */}
        <div className="p-5 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase font-mono">Total Evaluated</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalActions}</div>
          <p className="text-[11px] text-slate-500">Evaluated through gateway</p>
        </div>

        {/* Allowed */}
        <div className="p-5 rounded-2xl glass-panel border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-medium uppercase font-mono">Allowed</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{allowedCount}</div>
          <p className="text-[11px] text-slate-500">Passed safety evaluation</p>
        </div>

        {/* Approval Required */}
        <div className="p-5 rounded-2xl glass-panel border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-medium uppercase font-mono">Approval Req.</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{approvalCount}</div>
          <p className="text-[11px] text-slate-500">Flagged for human review</p>
        </div>

        {/* Blocked */}
        <div className="p-5 rounded-2xl glass-panel border-rose-500/20 space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-medium uppercase font-mono">Blocked</span>
            <ShieldX className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono">{blockedCount}</div>
          <p className="text-[11px] text-slate-500">Denied by policy engine</p>
        </div>

        {/* High Risk Events */}
        <div className="p-5 rounded-2xl glass-panel border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-medium uppercase font-mono">High Risk (70+)</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">{highRiskCount}</div>
          <p className="text-[11px] text-slate-500">Score &ge; 70 risk threshold</p>
        </div>
      </div>

      {/* Pending Approvals Alert Banner */}
      {pendingApprovals.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 glow-amber">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-amber-200 text-sm">
                {pendingApprovals.length} Action{pendingApprovals.length > 1 ? 's' : ''} Awaiting Human Security Approval
              </h4>
              <p className="text-xs text-amber-300/80">
                Controlled Autonomy paused execution until a human administrator reviews the request.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToApprovals}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shrink-0"
          >
            Review Queue
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recent Security Activity Stream */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Recent Gateway Security Stream</h3>
          <span className="text-xs font-mono text-slate-400">Showing latest events</span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No gateway security events logged yet. Use the Action Simulator to trigger test actions.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 overflow-hidden">
            {logs.slice(0, 8).map((log) => (
              <div key={log._id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{log.agentName}</span>
                    <span className="text-slate-500 font-mono text-xs">({log.agentId})</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 font-mono text-cyan-400">
                      {log.requestedAction}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{log.reason}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <RiskScoreBadge score={log.riskScore} />
                  <DecisionBadge decision={log.finalDecision} />
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
