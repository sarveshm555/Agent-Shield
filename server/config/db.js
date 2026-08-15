const mongoose = require('mongoose');

let isConnected = false;
let useMemoryFallback = true; // Default to memory store fallback unless MongoDB URI connects

// Memory Fallback Store if MongoDB Atlas URI is not provided or fails to connect
const memoryStore = {
  agents: [
    {
      _id: 'ag_support_01',
      agentId: 'SupportAgent',
      name: 'Tier 1 Support Agent',
      role: 'Customer Support',
      status: 'ACTIVE',
      allowedActions: ['READ_CUSTOMER', 'CREATE_TICKET', 'REFUND'],
      permissionLimits: { MAX_REFUND: 5000 },
      createdAt: new Date()
    },
    {
      _id: 'ag_sales_01',
      agentId: 'SalesAgent',
      name: 'Enterprise Sales Agent',
      role: 'Sales Representative',
      status: 'ACTIVE',
      allowedActions: ['READ_CUSTOMER', 'CREATE_DEAL', 'SEND_EMAIL'],
      permissionLimits: { MAX_EMAIL_RECIPIENTS: 10 },
      createdAt: new Date()
    },
    {
      _id: 'ag_admin_01',
      agentId: 'AdminAgent',
      name: 'System Admin Agent',
      role: 'System Administrator',
      status: 'ACTIVE',
      allowedActions: ['*'],
      permissionLimits: { MAX_REFUND: 100000 },
      createdAt: new Date()
    },
    {
      _id: 'ag_disabled_01',
      agentId: 'LegacyAgent',
      name: 'Deprecated Support Agent',
      role: 'Legacy Bot',
      status: 'DISABLED',
      allowedActions: ['READ_CUSTOMER'],
      permissionLimits: {},
      createdAt: new Date()
    }
  ],
  auditLogs: [],
  approvalRequests: []
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '' || uri.includes('YOUR_MONGODB_URI')) {
    console.log('ℹ️ MONGODB_URI not set. Operating with In-Memory Storage Engine.');
    useMemoryFallback = true;
    return;
  }

  try {
    // Disable buffering so un-connected operations fail fast to memory fallback
    mongoose.set('bufferCommands', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    useMemoryFallback = false;
    console.log('🟢 Connected to MongoDB Atlas successfully.');
  } catch (error) {
    console.warn('⚠️ MongoDB Atlas connection failed:', error.message);
    console.log('🔄 Operating with In-Memory Storage Engine for uninterrupted MVP functionality.');
    useMemoryFallback = true;
  }
};

const getStoreMode = () => (useMemoryFallback ? 'memory' : 'mongodb');

module.exports = {
  connectDB,
  getStoreMode,
  memoryStore
};
