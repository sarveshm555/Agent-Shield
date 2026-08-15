const express = require('express');
const router = express.Router();
const { AgentStore } = require('../models/Agent');

// GET /api/agents - List all configured agents
router.get('/', async (req, res) => {
  try {
    const agents = await AgentStore.getAll();
    res.json({ success: true, count: agents.length, agents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/agents - Create new agent
router.post('/', async (req, res) => {
  try {
    const { agentId, name, role, allowedActions, permissionLimits } = req.body;
    if (!agentId || !name || !role) {
      return res.status(400).json({ success: false, error: 'agentId, name, and role are required' });
    }

    const existing = await AgentStore.findByAgentId(agentId);
    if (existing) {
      return res.status(400).json({ success: false, error: `Agent with ID "${agentId}" already exists.` });
    }

    const newAgent = await AgentStore.create({
      agentId,
      name,
      role,
      status: 'ACTIVE',
      allowedActions: allowedActions || ['READ_CUSTOMER'],
      permissionLimits: permissionLimits || {}
    });

    res.status(201).json({ success: true, agent: newAgent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/agents/:agentId/status - Toggle ACTIVE / DISABLED
router.patch('/:agentId/status', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'DISABLED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be ACTIVE or DISABLED' });
    }

    const updated = await AgentStore.updateStatus(agentId, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    res.json({ success: true, agent: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/agents/:agentId/limits - Update permission limits
router.put('/:agentId/limits', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { permissionLimits } = req.body;

    const updated = await AgentStore.updateLimits(agentId, permissionLimits);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    res.json({ success: true, agent: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
