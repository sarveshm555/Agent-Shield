/**
 * Deterministic Risk Score & Policy Decision Engine.
 * Combines Permission Checks, Prompt Injection, Sensitive Data Leakage, and Action Severity.
 * 
 * Score Thresholds:
 *   0  - 39 : ALLOW
 *   40 - 69 : APPROVAL_REQUIRED
 *   70 - 100: BLOCK
 */
const calculateRiskScore = ({
  permissionValidation,
  promptInjectionResult,
  sensitiveDataResult,
  requestedAction,
  parameters = {}
}) => {
  let score = 0;
  const riskFactors = [];

  // Factor 1: Agent Status & Authorization
  if (!permissionValidation.authorized) {
    if (permissionValidation.status === 'REJECTED' || permissionValidation.status === 'DISABLED') {
      score += 100;
      riskFactors.push({ factor: 'UNAUTHORIZED_OR_DISABLED_AGENT', points: 100, detail: permissionValidation.reason });
    } else if (permissionValidation.status === 'LIMIT_EXCEEDED') {
      score += 55;
      riskFactors.push({ factor: 'PERMISSION_LIMIT_EXCEEDED', points: 55, detail: permissionValidation.reason });
    } else if (permissionValidation.status === 'ACTION_NOT_ALLOWED') {
      score += 75;
      riskFactors.push({ factor: 'ACTION_NOT_PERMITTED_FOR_ROLE', points: 75, detail: permissionValidation.reason });
    }
  }

  // Factor 2: High-Impact / Sensitive Operations
  const CRITICAL_ACTIONS = ['DELETE_CUSTOMER', 'EXPORT_DATABASE', 'ACCESS_PAYROLL', 'PURGE_SYSTEM'];
  const SENSITIVE_ACTIONS = ['REFUND', 'SEND_EMAIL', 'UPDATE_CUSTOMER', 'TRANSFER_FUNDS'];

  if (CRITICAL_ACTIONS.includes(requestedAction)) {
    score += 50;
    riskFactors.push({ factor: 'CRITICAL_SYSTEM_OPERATION', points: 50, detail: `Action "${requestedAction}" is classified as a critical operational risk.` });
  } else if (SENSITIVE_ACTIONS.includes(requestedAction)) {
    score += 15;
    riskFactors.push({ factor: 'SENSITIVE_BUSINESS_OPERATION', points: 15, detail: `Action "${requestedAction}" modifies sensitive business state.` });
  }

  // Factor 3: Financial Value & Limit Proximity
  if (parameters.amount !== undefined) {
    const amount = Number(parameters.amount);
    const maxLimit = permissionValidation.agent?.permissionLimits?.MAX_REFUND || 5000;

    if (amount > 50000) {
      score += 45;
      riskFactors.push({ factor: 'HIGH_FINANCIAL_VALUE', points: 45, detail: `Financial transaction of ₹${amount.toLocaleString()} is very high value.` });
    } else if (amount > 10000) {
      score += 35;
      riskFactors.push({ factor: 'MODERATE_FINANCIAL_VALUE', points: 35, detail: `Financial transaction of ₹${amount.toLocaleString()} requires elevated security.` });
    } else if (amount >= 0.7 * maxLimit) {
      // Near-Limit Financial Operation (e.g. ₹4,000 out of ₹5,000)
      score += 30;
      riskFactors.push({ factor: 'NEAR_LIMIT_FINANCIAL_REFUND', points: 30, detail: `Refund of ₹${amount.toLocaleString()} is near the maximum authorized threshold (₹${maxLimit.toLocaleString()}).` });
    } else if (amount > 1000) {
      score += 10;
      riskFactors.push({ factor: 'LOW_FINANCIAL_VALUE', points: 10, detail: `Financial transaction of ₹${amount.toLocaleString()}.` });
    }
  }

  // Factor 4: Prompt Injection Analysis
  if (promptInjectionResult && promptInjectionResult.threatDetected) {
    const injectionPoints = Math.round((promptInjectionResult.confidence || 0.9) * 80);
    score += injectionPoints;
    riskFactors.push({ factor: 'PROMPT_INJECTION_DETECTED', points: injectionPoints, detail: promptInjectionResult.reason });
  }

  // Factor 5: Data Leakage & Sensitive PII Inspection
  if (sensitiveDataResult && sensitiveDataResult.sensitiveDataDetected) {
    if (sensitiveDataResult.suggestedAction === 'BLOCK') {
      score += 75;
      riskFactors.push({ factor: 'HIGH_RISK_DATA_LEAKAGE', points: 75, detail: sensitiveDataResult.reason });
    } else if (sensitiveDataResult.suggestedAction === 'REDACT') {
      score += 30;
      riskFactors.push({ factor: 'PII_DETECTED_FOR_REDACTION', points: 30, detail: sensitiveDataResult.reason });
    }
  }

  // Factor 6: External Destination / High Recipient / Manual Approval Flag
  if (parameters.requiresApproval || parameters.externalDestination || (parameters.recipientCount && parameters.recipientCount > 5)) {
    score += 20;
    riskFactors.push({ factor: 'ELEVATED_APPROVAL_PARAMETER', points: 20, detail: 'Action parameters require elevated security verification.' });
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine Policy Decision
  let decision = 'ALLOW';
  let primaryReason = 'Action passed security evaluation with acceptable risk level.';

  if (finalScore >= 70) {
    decision = 'BLOCK';
    primaryReason = riskFactors.length > 0 
      ? `Blocked due to critical security risk (${riskFactors[0].detail})`
      : 'Blocked due to elevated risk score exceeding 70.';
  } else if (finalScore >= 40) {
    decision = 'APPROVAL_REQUIRED';
    primaryReason = `Action requires human security approval (Risk score: ${finalScore}). ${riskFactors[0] ? riskFactors[0].detail : ''}`;
  } else {
    decision = 'ALLOW';
    if (!permissionValidation.authorized) {
      // Hard Fail-Closed override if permission check failed
      decision = 'BLOCK';
      primaryReason = permissionValidation.reason;
    }
  }

  return {
    riskScore: finalScore,
    decision,
    reason: primaryReason,
    riskFactors
  };
};

module.exports = {
  calculateRiskScore
};
