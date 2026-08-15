const { validateAgentPermissions } = require('./agentService');
const { analyzePromptInjection } = require('./promptInjectionService');
const { inspectSensitiveData } = require('./sensitiveDataService');
const { calculateRiskScore } = require('./riskEngine');
const { executeBusinessAction } = require('./mockBusinessServices');
const { AuditLogStore } = require('../models/AuditLog');
const { ApprovalRequestStore } = require('../models/ApprovalRequest');

/**
 * AgentShield Central Gateway Pipeline.
 * Evaluates requested agent actions before execution.
 */
const evaluateAndExecuteAction = async ({
  agentId,
  action,
  parameters = {},
  prompt = '',
  user = 'Sarvesh'
}) => {
  const startTime = Date.now();
  const contentToScan = prompt || parameters.prompt || parameters.content || parameters.subject || JSON.stringify(parameters);

  // STEP 1 & 2: Agent Identity & Permission Check (Fail-Closed)
  const permissionResult = await validateAgentPermissions(agentId, action, parameters);

  // STEP 3: Prompt Injection Analysis
  const promptInjectionResult = await analyzePromptInjection(contentToScan);

  // STEP 4: Sensitive Data Leakage Analysis
  const dataSecurityResult = await inspectSensitiveData(parameters);

  // STEP 5: Risk Engine Calculation
  const riskAssessment = calculateRiskScore({
    permissionValidation: permissionResult,
    promptInjectionResult,
    sensitiveDataResult: dataSecurityResult,
    requestedAction: action,
    parameters
  });

  const { riskScore, decision, reason, riskFactors } = riskAssessment;

  let executionResult = null;
  let approvalRequestId = null;

  // STEP 6: Execute Decision Policy
  if (decision === 'ALLOW') {
    // If data leak scanner suggested redaction, use redacted content
    const sanitizedParams = dataSecurityResult.sensitiveDataDetected && dataSecurityResult.suggestedAction === 'REDACT'
      ? { ...parameters, sanitizedContent: dataSecurityResult.redactedContent }
      : parameters;

    executionResult = await executeBusinessAction(action, sanitizedParams);
  } else if (decision === 'APPROVAL_REQUIRED') {
    // Queue for Human Approval in Dashboard
    const pendingReq = await ApprovalRequestStore.create({
      agentId,
      agentName: permissionResult.agent ? permissionResult.agent.name : agentId,
      requestedAction: action,
      targetResource: getTargetResourceName(action),
      parameters,
      riskScore,
      reason
    });
    approvalRequestId = pendingReq._id;
  } else if (decision === 'BLOCK') {
    executionResult = {
      status: 'BLOCKED_BY_GATEWAY',
      error: reason,
      blockedAt: new Date().toISOString()
    };
  }

  // STEP 7: Save Audit Log
  const auditLog = await AuditLogStore.create({
    user,
    agentId,
    agentName: permissionResult.agent ? permissionResult.agent.name : agentId,
    requestedAction: action,
    targetResource: getTargetResourceName(action),
    parameters,
    permissionResult: {
      authorized: permissionResult.authorized,
      status: permissionResult.status,
      reason: permissionResult.reason,
      exceedsLimit: permissionResult.exceedsLimit || false
    },
    promptInjectionResult,
    dataSecurityResult,
    riskScore,
    finalDecision: decision,
    reason,
    executionResult
  });

  const durationMs = Date.now() - startTime;

  return {
    success: decision === 'ALLOW',
    decision,
    riskScore,
    reason,
    riskFactors,
    agentId,
    agentName: permissionResult.agent ? permissionResult.agent.name : agentId,
    requestedAction: action,
    permissionResult,
    promptInjectionResult,
    dataSecurityResult,
    executionResult,
    approvalRequestId,
    auditLogId: auditLog._id,
    durationMs
  };
};

const getTargetResourceName = (action) => {
  if (['READ_CUSTOMER', 'CREATE_TICKET', 'DELETE_CUSTOMER'].includes(action)) return 'CRM API';
  if (['GET_TRANSACTION', 'REFUND'].includes(action)) return 'Payment API';
  if (['CREATE_EMAIL', 'SEND_EMAIL'].includes(action)) return 'Email API';
  return 'Business Service API';
};

module.exports = {
  evaluateAndExecuteAction
};
