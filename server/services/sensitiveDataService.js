const { analyzeSecurityContent, getActiveProvider } = require('./aiProvider');

// Regex patterns for sensitive data detection
const PATTERNS = {
  CREDIT_CARD: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g,
  GENERIC_CARD: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
  API_KEY: /\b(sk-[a-zA-Z0-9]{24,}|AIzaSy[a-zA-Z0-9_-]{33}|ghp_[a-zA-Z0-9]{36}|key-[a-zA-Z0-9]{32})\b/g,
  BEARER_TOKEN: /Bearer\s+[a-zA-Z0-9\-._~+/]+=*/g,
  PASSWORD_KEYWORD: /(?:password|secret|pwd|api_token)\s*[:=]\s*["']?([^\s"',}]+)["']?/gi,
  SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  PHONE_INDIA_US: /\b(?:\+?\d{1,3}[- .]?)?\(?\d{3}\)?[- .]?\d{3}[- .]?\d{4}\b/g
};

const inspectSensitiveData = async (payload) => {
  if (!payload) {
    return {
      sensitiveDataDetected: false,
      detectedTypes: [],
      suggestedAction: 'ALLOW',
      redactedContent: payload,
      reason: 'Empty payload provided.',
      provider: getActiveProvider()
    };
  }

  const textString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const detectedTypes = new Set();
  let redactedText = textString;
  const activeProvider = getActiveProvider();

  // Check API keys
  if (PATTERNS.API_KEY.test(textString)) {
    detectedTypes.add('API_KEY');
    redactedText = redactedText.replace(PATTERNS.API_KEY, '[REDACTED_API_KEY]');
  }

  // Check Bearer Tokens
  if (PATTERNS.BEARER_TOKEN.test(textString)) {
    detectedTypes.add('ACCESS_TOKEN');
    redactedText = redactedText.replace(PATTERNS.BEARER_TOKEN, 'Bearer [REDACTED_TOKEN]');
  }

  // Check Credit Cards
  if (PATTERNS.GENERIC_CARD.test(textString) || PATTERNS.CREDIT_CARD.test(textString)) {
    detectedTypes.add('CREDIT_CARD_NUMBER');
    redactedText = redactedText.replace(PATTERNS.GENERIC_CARD, 'XXXX-XXXX-XXXX-XXXX');
  }

  // Check Passwords
  if (PATTERNS.PASSWORD_KEYWORD.test(textString)) {
    detectedTypes.add('PASSWORD');
    redactedText = redactedText.replace(PATTERNS.PASSWORD_KEYWORD, (match, p1) => match.replace(p1, '********'));
  }

  // Check SSN
  if (PATTERNS.SSN.test(textString)) {
    detectedTypes.add('SSN');
    redactedText = redactedText.replace(PATTERNS.SSN, 'XXX-XX-XXXX');
  }

  // Check explicit exfiltration phrases
  if (/send (all |customer )?(credit cards|passwords|ssn|social security|secrets)/i.test(textString)) {
    detectedTypes.add('BULK_SENSITIVE_PII_EXFILTRATION');
  }

  let aiEvaluated = false;
  // Invoke AI analysis for semantic classification if OpenAI or Gemini is configured
  if (activeProvider !== 'HEURISTIC') {
    try {
      const aiResult = await analyzeSecurityContent({ text: textString, analysisType: 'SENSITIVE_DATA' });
      if (aiResult) {
        aiEvaluated = true;
        if (aiResult.sensitiveDataDetected && Array.isArray(aiResult.detectedTypes)) {
          aiResult.detectedTypes.forEach(t => detectedTypes.add(t));
        }
      }
    } catch (err) {
      console.warn(`AI sensitive data check failed (${err.message}), using regex detection.`);
    }
  }

  const uniqueTypes = Array.from(detectedTypes);
  const isDetected = uniqueTypes.length > 0;

  // Determine suggested policy action
  let suggestedAction = 'ALLOW';
  let reason = 'No sensitive data detected in request content.';

  if (isDetected) {
    const highRiskData = ['API_KEY', 'CREDIT_CARD_NUMBER', 'PASSWORD', 'ACCESS_TOKEN', 'SSN', 'BULK_SENSITIVE_PII_EXFILTRATION'];
    const hasHighRisk = uniqueTypes.some(t => highRiskData.includes(t));

    if (hasHighRisk) {
      suggestedAction = 'BLOCK';
      reason = `Sensitive high-risk data detected (${uniqueTypes.join(', ')}). Execution blocked under Data Leakage Protection.`;
    } else {
      suggestedAction = 'REDACT';
      reason = `Sensitive information detected (${uniqueTypes.join(', ')}). Content redacted before transmission.`;
    }
  }

  return {
    sensitiveDataDetected: isDetected,
    detectedTypes: uniqueTypes,
    suggestedAction,
    redactedContent: redactedText,
    reason,
    provider: activeProvider,
    aiEvaluated
  };
};

module.exports = {
  inspectSensitiveData
};
