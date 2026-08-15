import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, ShieldAlert, Edit2, Key, CheckCircle2, XCircle } from 'lucide-react';
import { fetchAgents, toggleAgentStatus, updateAgentLimits, createAgent } from '../services/api';
import Modal from '../components/Modal';

export default function AgentManagement() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit limits modal
  const [editingAgent, setEditingAgent] = useState(null);
  const [editMaxRefund, setEditMaxRefund] = useState(5000);

  // Create Agent modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newActions, setNewActions] = useState('READ_CUSTOMER, CREATE_TICKET');
  const [newMaxRefund, setNewMaxRefund] = useState(5000);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const res = await fetchAgents();
      if (res.success) {
        setAgents(res.agents || []);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleToggleStatus = async (agentId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await toggleAgentStatus(agentId, nextStatus);
      loadAgents();
    } catch (err) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const handleSaveLimits = async () => {
    if (!editingAgent) return;
    try {
      await updateAgentLimits(editingAgent.agentId, { MAX_REFUND: Number(editMaxRefund) });
      setEditingAgent(null);
      loadAgents();
    } catch (err) {
      alert('Failed to update limits: ' + err.message);
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      const actionsList = newActions.split(',').map(a => a.trim()).filter(Boolean);
      await createAgent({
        agentId: newId,
        name: newName,
        role: newRole,
        allowedActions: actionsList,
        permissionLimits: { MAX_REFUND: Number(newMaxRefund) }
      });
      setShowCreateModal(false);
      setNewId('');
      setNewName('');
      setNewRole('');
      loadAgents();
    } catch (err) {
      alert('Failed to create agent: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Agent Management & Permissions</h2>
          <p className="text-slate-400 text-sm">
            Configure agent identity, allowed business actions, permission limits, and active status
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg glow-cyan transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Agent
        </button>
      </div>

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const isActive = agent.status === 'ACTIVE';
          const limits = agent.permissionLimits instanceof Map 
            ? Object.fromEntries(agent.permissionLimits)
            : (agent.permissionLimits || {});

          return (
            <div key={agent.agentId} className="p-6 rounded-2xl glass-panel space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Agent Title & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{agent.name}</h3>
                      <p className="text-xs font-mono text-cyan-400">{agent.agentId}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(agent.agentId, agent.status)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                  >
                    {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {agent.status}
                  </button>
                </div>

                {/* Role */}
                <div className="text-xs text-slate-400">
                  Role: <span className="text-slate-200 font-medium">{agent.role}</span>
                </div>

                {/* Allowed Actions Pills */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase text-slate-500 font-bold">Allowed Actions</span>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.allowedActions?.map((act, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                        {act}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Permission Limits */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-400">MAX_REFUND Limit:</span>{' '}
                    <span className="text-amber-400 font-bold">
                      {limits.MAX_REFUND !== undefined ? `₹${Number(limits.MAX_REFUND).toLocaleString()}` : 'Unlimited / N/A'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAgent(agent);
                      setEditMaxRefund(limits.MAX_REFUND || 5000);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                Created: {new Date(agent.createdAt).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Limits Modal */}
      <Modal
        isOpen={!!editingAgent}
        onClose={() => setEditingAgent(null)}
        title={`Edit Permission Limits for ${editingAgent?.name}`}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400">MAX_REFUND Financial Limit (₹)</label>
            <input
              type="number"
              value={editMaxRefund}
              onChange={(e) => setEditMaxRefund(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-sm text-cyan-400 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSaveLimits}
            className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-all glow-cyan"
          >
            Save Updated Limits
          </button>
        </div>
      </Modal>

      {/* Create Agent Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Register New AI Agent"
      >
        <form onSubmit={handleCreateAgent} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400">agentId</label>
            <input
              type="text"
              required
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="e.g. AnalyticsAgent"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-sm text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400">Agent Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. BI Analytics Bot"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400">Role</label>
            <input
              type="text"
              required
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="e.g. Business Intelligence"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400">Allowed Actions (comma-separated)</label>
            <input
              type="text"
              value={newActions}
              onChange={(e) => setNewActions(e.target.value)}
              placeholder="READ_CUSTOMER, CREATE_TICKET, REFUND"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-sm text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400">Max Refund Limit (₹)</label>
            <input
              type="number"
              value={newMaxRefund}
              onChange={(e) => setNewMaxRefund(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-sm text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-all glow-cyan"
          >
            Create & Register Agent
          </button>
        </form>
      </Modal>
    </div>
  );
}
