const express = require('express');
const router = express.Router();
const { ApprovalRequestStore } = require('../models/ApprovalRequest');
const { AuditLogStore } = require('../models/AuditLog');
const { executeBusinessAction } = require('../services/mockBusinessServices');

// GET /api/approvals - List pending or all approval requests
router.get('/', async (req, res) => {
  try {
    const { pendingOnly } = req.query;
    const items = pendingOnly === 'true' 
      ? await ApprovalRequestStore.getPending()
      : await ApprovalRequestStore.getAll();

    res.json({ success: true, count: items.length, approvals: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/approvals/:id/approve - Approve pending action
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.body;

    const requestItem = await ApprovalRequestStore.findById(id);
    if (!requestItem) {
      return res.status(404).json({ success: false, error: 'Approval request not found.' });
    }

    if (requestItem.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: `Approval request is already ${requestItem.status}.` });
    }

    // Mark request as APPROVED
    const updatedApproval = await ApprovalRequestStore.resolve(id, 'APPROVED', user || 'Sarvesh');

    // Execute Mock Business Action upon manual approval
    const executionResult = await executeBusinessAction(requestItem.requestedAction, requestItem.parameters);

    // Record Audit Log for manual approval execution
    const auditLog = await AuditLogStore.create({
      user: user || 'Sarvesh (Human Security Admin)',
      agentId: requestItem.agentId,
      agentName: requestItem.agentName,
      requestedAction: requestItem.requestedAction,
      targetResource: requestItem.targetResource,
      parameters: requestItem.parameters,
      permissionResult: { status: 'MANUALLY_APPROVED' },
      promptInjectionResult: { threatDetected: false },
      dataSecurityResult: { sensitiveDataDetected: false },
      riskScore: requestItem.riskScore,
      finalDecision: 'ALLOW',
      reason: `Human Approval granted by Security Admin. Overrode initial APPROVAL_REQUIRED recommendation.`,
      executionResult
    });

    res.json({
      success: true,
      approval: updatedApproval,
      executionResult,
      auditLogId: auditLog._id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/approvals/:id/reject - Reject pending action
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { user, reason } = req.body;

    const requestItem = await ApprovalRequestStore.findById(id);
    if (!requestItem) {
      return res.status(404).json({ success: false, error: 'Approval request not found.' });
    }

    if (requestItem.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: `Approval request is already ${requestItem.status}.` });
    }

    // Mark request as REJECTED
    const updatedApproval = await ApprovalRequestStore.resolve(id, 'REJECTED', user || 'Sarvesh');

    // Record Audit Log for manual rejection
    const auditLog = await AuditLogStore.create({
      user: user || 'Sarvesh (Human Security Admin)',
      agentId: requestItem.agentId,
      agentName: requestItem.agentName,
      requestedAction: requestItem.requestedAction,
      targetResource: requestItem.targetResource,
      parameters: requestItem.parameters,
      permissionResult: { status: 'MANUALLY_REJECTED' },
      riskScore: requestItem.riskScore,
      finalDecision: 'BLOCK',
      reason: `Human Approval REJECTED by Security Admin: ${reason || 'Denied authorization.'}`,
      executionResult: { status: 'REJECTED_BY_ADMIN' }
    });

    res.json({
      success: true,
      approval: updatedApproval,
      auditLogId: auditLog._id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
