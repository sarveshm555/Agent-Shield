const mongoose = require('mongoose');
const { getStoreMode, memoryStore } = require('../config/db');

const Schema = mongoose.Schema;

const auditLogSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  user: { type: String, default: 'System User' },
  agentId: { type: String, required: true },
  agentName: { type: String, default: 'Unknown Agent' },
  requestedAction: { type: String, required: true },
  targetResource: { type: String, default: 'N/A' },
  parameters: { type: Schema.Types.Mixed, default: {} },
  permissionResult: { type: Schema.Types.Mixed, default: {} },
  promptInjectionResult: { type: Schema.Types.Mixed, default: {} },
  dataSecurityResult: { type: Schema.Types.Mixed, default: {} },
  riskScore: { type: Number, required: true },
  finalDecision: { type: String, enum: ['ALLOW', 'APPROVAL_REQUIRED', 'BLOCK'], required: true },
  reason: { type: String, required: true },
  executionResult: { type: Schema.Types.Mixed, default: null }
});

const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

class AuditLogStore {
  static async create(logData) {
    const entry = {
      timestamp: new Date(),
      user: logData.user || 'Sarvesh',
      agentId: logData.agentId,
      agentName: logData.agentName || logData.agentId,
      requestedAction: logData.requestedAction,
      targetResource: logData.targetResource || 'Business API',
      parameters: logData.parameters || {},
      permissionResult: logData.permissionResult || {},
      promptInjectionResult: logData.promptInjectionResult || {},
      dataSecurityResult: logData.dataSecurityResult || {},
      riskScore: logData.riskScore,
      finalDecision: logData.finalDecision,
      reason: logData.reason,
      executionResult: logData.executionResult || null
    };

    if (getStoreMode() === 'mongodb') {
      return await AuditLogModel.create(entry);
    } else {
      const memoryEntry = {
        _id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        ...entry
      };
      memoryStore.auditLogs.unshift(memoryEntry);
      return memoryEntry;
    }
  }

  static async getAll(filter = {}) {
    if (getStoreMode() === 'mongodb') {
      const query = {};
      if (filter.decision) query.finalDecision = filter.decision;
      if (filter.agentId) query.agentId = filter.agentId;
      return await AuditLogModel.find(query).sort({ timestamp: -1 }).limit(100);
    } else {
      let logs = [...memoryStore.auditLogs];
      if (filter.decision) {
        logs = logs.filter(l => l.finalDecision === filter.decision);
      }
      if (filter.agentId) {
        logs = logs.filter(l => l.agentId === filter.agentId);
      }
      return logs;
    }
  }

  static async clearAll() {
    if (getStoreMode() === 'mongodb') {
      return await AuditLogModel.deleteMany({});
    } else {
      memoryStore.auditLogs = [];
      return { deletedCount: memoryStore.auditLogs.length };
    }
  }
}

module.exports = { AuditLogModel, AuditLogStore };
