const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getStoreMode } = require('./config/db');
const { getActiveProvider } = require('./services/aiProvider');

const gatewayRoutes = require('./routes/gateway');
const agentRoutes = require('./routes/agents');
const approvalRoutes = require('./routes/approvals');
const logRoutes = require('./routes/logs');
const demoRoutes = require('./routes/demo');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Connection
connectDB();

// API Routes
app.use('/api/agent', gatewayRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/demo', demoRoutes);

// Gateway Health & System Status Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'AgentShield Security Gateway MVP',
    timestamp: new Date().toISOString(),
    storeMode: getStoreMode(),
    aiProvider: getActiveProvider(),
    version: '1.0.0'
  });
});

// Serve Vite Static Production Build if available (for Vercel or single-host deployment)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('AgentShield API Gateway Service Running. (Frontend client build pending)');
    }
  });
});

// Export Express App for Vercel Serverless Function compatibility
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
🛡️  ======================================================
    AGENTSHIELD - AI Agent Security Gateway MVP
    Running on: http://localhost:${PORT}
    Database Mode: ${getStoreMode()}
    AI Provider: ${getActiveProvider()}
====================================================== 🛡️
    `);
  });
}
