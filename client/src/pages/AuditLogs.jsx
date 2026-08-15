import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Trash2, Eye, RefreshCw } from 'lucide-react';
import { fetchLogs, clearLogs } from '../services/api';
import DecisionBadge from '../components/DecisionBadge';
import RiskScoreBadge from '../components/RiskScoreBadge';
import Modal from '../components/Modal';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDecision, setSelectedDecision] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectLog, setInspectLog] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetchLogs({ decision: selectedDecision || undefined });
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedDecision]);

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all audit logs for demo reset?')) return;
    try {
      await clearLogs();
      loadLogs();
    } catch (err) {
      alert('Failed to clear logs: ' + err.message);
    }
  };

  const filteredLogs = logs.filter(l => {
    const search = searchTerm.toLowerCase();
    return (
      (l.agentName && l.agentName.toLowerCase().includes(search)) ||
      (l.agentId && l.agentId.toLowerCase().includes(search)) ||
      (l.requestedAction && l.requestedAction.toLowerCase().includes(search)) ||
      (l.reason && l.reason.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Security Audit Trail</h2>
          <p className="text-slate-400 text-sm">
            Immutable log record of every security decision, risk score, prompt injection analysis, and action execution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Logs
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by agent, action, or reason..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedDecision}
            onChange={(e) => setSelectedDecision(e.target.value)}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
          >
            <option value="">All Decisions (ALL)</option>
            <option value="ALLOW">ALLOW</option>
            <option value="APPROVAL_REQUIRED">APPROVAL_REQUIRED</option>
            <option value="BLOCK">BLOCK</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl glass-panel overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No audit log entries match the current query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">Timestamp</th>
                  <th className="px-4 py-3.5 font-semibold">Agent</th>
                  <th className="px-4 py-3.5 font-semibold">Action</th>
                  <th className="px-4 py-3.5 font-semibold">Risk Score</th>
                  <th className="px-4 py-3.5 font-semibold">Decision</th>
                  <th className="px-4 py-3.5 font-semibold">Reason</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans text-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      <div>{log.agentName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{log.agentId}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan-400 font-medium">
                      {log.requestedAction}
                    </td>
                    <td className="px-4 py-3">
                      <RiskScoreBadge score={log.riskScore} />
                    </td>
                    <td className="px-4 py-3">
                      <DecisionBadge decision={log.finalDecision} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-slate-300 max-w-xs truncate" title={log.reason}>
                      {log.reason}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 transition-colors"
                        title="View Full Event Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail JSON Inspector Modal */}
      <Modal
        isOpen={!!inspectLog}
        onClose={() => setInspectLog(null)}
        title="Audit Log Event Inspection"
      >
        {inspectLog && (
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-500">Log ID:</span> <span className="text-cyan-400">{inspectLog._id}</span>
              </div>
              <DecisionBadge decision={inspectLog.finalDecision} />
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase">Event Payload Breakdown</span>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(inspectLog, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
