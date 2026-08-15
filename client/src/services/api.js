import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const fetchAgents = async () => {
  const res = await api.get('/agents');
  return res.data;
};

export const createAgent = async (data) => {
  const res = await api.post('/agents', data);
  return res.data;
};

export const toggleAgentStatus = async (agentId, status) => {
  const res = await api.patch(`/agents/${agentId}/status`, { status });
  return res.data;
};

export const updateAgentLimits = async (agentId, limits) => {
  const res = await api.put(`/agents/${agentId}/limits`, { permissionLimits: limits });
  return res.data;
};

export const fetchApprovals = async (pendingOnly = false) => {
  const res = await api.get('/approvals', { params: { pendingOnly } });
  return res.data;
};

export const approveAction = async (id, user = 'Sarvesh') => {
  const res = await api.post(`/approvals/${id}/approve`, { user });
  return res.data;
};

export const rejectAction = async (id, user = 'Sarvesh', reason = 'Admin Rejected') => {
  const res = await api.post(`/approvals/${id}/reject`, { user, reason });
  return res.data;
};

export const fetchLogs = async (params = {}) => {
  const res = await api.get('/logs', { params });
  return res.data;
};

export const clearLogs = async () => {
  const res = await api.delete('/logs/clear');
  return res.data;
};

export const executeAction = async (payload) => {
  const res = await api.post('/agent/action', payload);
  return res.data;
};

export const fetchDemoScenarios = async () => {
  const res = await api.get('/demo/scenarios');
  return res.data;
};

export const triggerDemoScenario = async (scenarioId) => {
  const res = await api.post(`/demo/trigger/${scenarioId}`);
  return res.data;
};
