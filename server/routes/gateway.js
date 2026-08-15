const express = require('express');
const router = express.Router();
const { evaluateAndExecuteAction } = require('../services/gatewayPipeline');

/**
 * POST /api/agent/action
 * Intercepts AI agent requests and executes AgentShield security evaluation pipeline.
 */
router.post('/action', async (req, res) => {
  try {
    const { agentId, action, parameters, prompt, user } = req.body;

    if (!agentId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: agentId and action are required.'
      });
    }

    const evaluation = await evaluateAndExecuteAction({
      agentId,
      action,
      parameters: parameters || {},
      prompt: prompt || '',
      user: user || 'Sarvesh'
    });

    return res.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Error in Gateway /action pipeline:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Gateway Error',
      message: error.message
    });
  }
});

module.exports = router;
