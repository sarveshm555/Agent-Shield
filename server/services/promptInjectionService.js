const { analyzeSecurityContent, getActiveProvider } = require('./aiProvider');

// Heuristic regex patterns for deterministic prompt injection analysis
const INJECTION_PATTERNS = [
  {
    pattern: /ignore (all )?(previous|prior|above) (instructions|directions|rules)/i,
    reason: 'Attempts to override previous instructions or security guidelines.'
  },
  {
    pattern: /disregard (your |all )?(security|safety|system) (rules|constraints|policies)/i,
    reason: 'Attempts to disregard system security rules and constraints.'
  },
  {
    pattern: /reveal (your |the )?(system prompt|system instructions|initial instructions)/i,
    reason: 'Attempts to exfiltrate or reveal internal system instructions.'
  },
  {
    pattern: /(export|dump|send|transfer) (the entire|all|customer) (database|data|records)/i,
    reason: 'Unsanctioned data exfiltration pattern detected.'
  },
  {
    pattern: /(pretend|act like|you are now) (an unrestricted|a system admin|DAN|root)/i,
    reason: 'Role-play or persona override attempt detected.'
  },
  {
    pattern: /bypass (security|permission|auth|authorization|gateway)/i,
    reason: 'Direct security gateway bypass phrase detected.'
  }
];

const analyzePromptInjection = async (text) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return {
      threatDetected: false,
      threatType: 'NONE',
      confidence: 0,
      reason: 'No text input provided for injection analysis.',
      provider: getActiveProvider()
    };
  }

  const activeProvider = getActiveProvider();
  let aiResult = null;

  // Step 1: Try LLM semantic security analysis if OpenAI or Gemini API is configured
  if (activeProvider !== 'HEURISTIC') {
    try {
      aiResult = await analyzeSecurityContent({ text, analysisType: 'PROMPT_INJECTION' });
    } catch (err) {
      console.warn(`AI prompt injection check failed (${err.message}), using heuristic rules.`);
    }
  }

  // Check heuristic regex patterns for deterministic backup/fallback
  let heuristicMatch = null;
  for (const item of INJECTION_PATTERNS) {
    if (item.pattern.test(text)) {
      heuristicMatch = item;
      break;
    }
  }

  // If AI provider returned a valid security classification
  if (aiResult && typeof aiResult.threatDetected === 'boolean') {
    const isThreat = aiResult.threatDetected || !!heuristicMatch;
    return {
      threatDetected: isThreat,
      threatType: isThreat ? 'PROMPT_INJECTION' : 'NONE',
      confidence: aiResult.confidence || (isThreat ? 0.95 : 0.05),
      reason: aiResult.reason || (heuristicMatch ? heuristicMatch.reason : 'Semantic security analysis completed by AI provider.'),
      provider: activeProvider,
      aiEvaluated: true
    };
  }

  // Fallback to Heuristic rules if AI was unavailable or turned off
  if (heuristicMatch) {
    return {
      threatDetected: true,
      threatType: 'PROMPT_INJECTION',
      confidence: 0.95,
      reason: heuristicMatch.reason,
      matchedPattern: heuristicMatch.pattern.toString(),
      provider: 'HEURISTIC'
    };
  }

  return {
    threatDetected: false,
    threatType: 'NONE',
    confidence: 0.05,
    reason: 'No prompt injection indicators detected.',
    provider: activeProvider
  };
};

module.exports = {
  analyzePromptInjection
};
