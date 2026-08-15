const express = require('express');
const router = express.Router();
const { AuditLogStore } = require('../models/AuditLog');

// GET /api/logs - Fetch audit logs with optional filter parameters
router.get('/', async (req, res) => {
  try {
    const { decision, agentId } = req.query;
    const logs = await AuditLogStore.getAll({ decision, agentId });
    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/logs/clear - Clear audit history for demo resets
router.delete('/clear', async (req, res) => {
  try {
    const result = await AuditLogStore.clearAll();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
