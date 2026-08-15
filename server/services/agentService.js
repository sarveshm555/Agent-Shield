const { AgentStore } = require('../models/Agent');

/**
 * Deterministic Agent Identity & Permission Validation Engine.
 * Does NOT rely on LLM for authorization decisions.
 */
const validateAgentPermissions = async (agentId, requestedAction, parameters = {}) => {
  if (!agentId || typeof agentId !== 'string') {
    return {
      authorized: false,
      status: 'REJECTED',
      reason: 'Missing or malformed agentId parameter.',
      agent: null
    };
  }

  const agent = await AgentStore.findByAgentId(agentId);

  if (!agent) {
    return {
      authorized: false,
      status: 'REJECTED',
      reason: `Unknown agent identifier: "${agentId}". Action rejected under fail-closed security.`,
      agent: null
    };
  }

  if (agent.status === 'DISABLED') {
    return {
      authorized: false,
      status: 'DISABLED',
      reason: `Agent "${agent.name}" (${agentId}) is currently DISABLED.`,
      agent
    };
  }

  // Check if action is explicitly allowed
  const hasWildcard = agent.allowedActions && agent.allowedActions.includes('*');
  const isAllowed = hasWildcard || (agent.allowedActions && agent.allowedActions.includes(requestedAction));

  if (!isAllowed) {
    return {
      authorized: false,
      status: 'ACTION_NOT_ALLOWED',
      reason: `Action "${requestedAction}" is not permitted for agent role "${agent.role}".`,
      agent
    };
  }

  // Check Permission Limits (e.g. Financial limits)
  const limits = agent.permissionLimits instanceof Map 
    ? Object.fromEntries(agent.permissionLimits)
    : (agent.permissionLimits || {});

  if (requestedAction === 'REFUND' && parameters.amount !== undefined) {
    const amount = Number(parameters.amount);
    const maxRefund = limits.MAX_REFUND !== undefined ? Number(limits.MAX_REFUND) : 0;

    if (amount > maxRefund) {
      return {
        authorized: false,
        status: 'LIMIT_EXCEEDED',
        reason: `Refund amount (₹${amount.toLocaleString()}) exceeds authorized agent limit of ₹${maxRefund.toLocaleString()}.`,
        agent,
        exceedsLimit: true,
        limitDetails: { requested: amount, allowed: maxRefund }
      };
    }
  }

  if (requestedAction === 'SEND_EMAIL' && parameters.recipientCount !== undefined) {
    const recipients = Number(parameters.recipientCount);
    const maxRecipients = limits.MAX_EMAIL_RECIPIENTS !== undefined ? Number(limits.MAX_EMAIL_RECIPIENTS) : 50;

    if (recipients > maxRecipients) {
      return {
        authorized: false,
        status: 'LIMIT_EXCEEDED',
        reason: `Email recipient count (${recipients}) exceeds agent limit of ${maxRecipients}.`,
        agent,
        exceedsLimit: true,
        limitDetails: { requested: recipients, allowed: maxRecipients }
      };
    }
  }

  return {
    authorized: true,
    status: 'AUTHORIZED',
    reason: `Agent "${agent.name}" is authorized to perform ${requestedAction}.`,
    agent
  };
};

module.exports = {
  validateAgentPermissions
};
