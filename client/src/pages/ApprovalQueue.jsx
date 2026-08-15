import React, { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { fetchApprovals, approveAction, rejectAction } from '../services/api';
import RiskScoreBadge from '../components/RiskScoreBadge';

export default function ApprovalQueue() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetchApprovals(false);
      if (res.success) {
        setApprovals(res.approvals || []);
      }
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveAction(id, 'Sarvesh (Human Security Admin)');
      loadApprovals();
    } catch (err) {
      alert('Approval failed: ' + err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:', 'Security Policy Violation');
    if (reason === null) return;
    try {
      await rejectAction(id, 'Sarvesh (Human Security Admin)', reason);
      loadApprovals();
    } catch (err) {
      alert('Rejection failed: ' + err.message);
    }
  };

  const pendingItems = approvals.filter(a => a.status === 'PENDING');
  const resolvedItems = approvals.filter(a => a.status !== 'PENDING');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Human Approval Queue</h2>
          <p className="text-slate-400 text-sm">
            Controlled Autonomy — Review actions flagged as APPROVAL_REQUIRED before business system execution
          </p>
        </div>
        <button
          onClick={loadApprovals}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* Pending Approvals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending Action Approvals ({pendingItems.length})
          </h3>
        </div>

        {pendingItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
            No pending approval requests. Medium-risk actions requiring approval will appear here.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <div key={item._id} className="p-6 rounded-2xl glass-panel border-amber-500/30 glow-amber space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-base">{item.agentName}</span>
                      <span className="text-xs font-mono text-cyan-400 font-semibold px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {item.requestedAction}
                      </span>
                      <RiskScoreBadge score={item.riskScore} />
                    </div>
                    <p className="text-xs text-amber-300/90 font-medium">{item.reason}</p>
                  </div>

                  {/* Approve / Reject Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(item._id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg glow-emerald transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      APPROVE & EXECUTE
                    </button>
                    <button
                      onClick={() => handleReject(item._id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      REJECT
                    </button>
                  </div>
                </div>

                {/* Parameters Preview */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-1">
                  <span className="text-slate-500 text-[10px]">Action Parameters:</span>
                  <pre className="text-cyan-300 text-[11px] overflow-x-auto">
                    {JSON.stringify(item.parameters, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Resolved Approvals */}
      {resolvedItems.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Approval Resolution History ({resolvedItems.length})
          </h3>

          <div className="divide-y divide-slate-800/60 glass-panel rounded-2xl p-4">
            {resolvedItems.map((item) => (
              <div key={item._id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{item.agentName}</span>
                    <span className="text-cyan-400 font-mono">{item.requestedAction}</span>
                  </div>
                  <p className="text-slate-400">{item.reason}</p>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Resolved by {item.resolvedBy || 'Admin'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
