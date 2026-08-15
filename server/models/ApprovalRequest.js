const mongoose = require('mongoose');
const { getStoreMode, memoryStore } = require('../config/db');

const Schema = mongoose.Schema;

const approvalRequestSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  agentId: { type: String, required: true },
  agentName: { type: String, required: true },
  requestedAction: { type: String, required: true },
  targetResource: { type: String, default: 'N/A' },
  parameters: { type: Schema.Types.Mixed, default: {} },
  riskScore: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  resolvedAt: { type: Date, default: null },
  resolvedBy: { type: String, default: null }
});

const ApprovalRequestModel = mongoose.models.ApprovalRequest || mongoose.model('ApprovalRequest', approvalRequestSchema);

class ApprovalRequestStore {
  static async create(data) {
    const entry = {
      timestamp: new Date(),
      agentId: data.agentId,
      agentName: data.agentName || data.agentId,
      requestedAction: data.requestedAction,
      targetResource: data.targetResource || 'Business API',
      parameters: data.parameters || {},
      riskScore: data.riskScore,
      reason: data.reason,
      status: 'PENDING',
      resolvedAt: null,
      resolvedBy: null
    };

    if (getStoreMode() === 'mongodb') {
      return await ApprovalRequestModel.create(entry);
    } else {
      const memoryEntry = {
        _id: 'appr_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        ...entry
      };
      memoryStore.approvalRequests.unshift(memoryEntry);
      return memoryEntry;
    }
  }

  static async getPending() {
    if (getStoreMode() === 'mongodb') {
      return await ApprovalRequestModel.find({ status: 'PENDING' }).sort({ timestamp: -1 });
    } else {
      return memoryStore.approvalRequests.filter(a => a.status === 'PENDING');
    }
  }

  static async getAll() {
    if (getStoreMode() === 'mongodb') {
      return await ApprovalRequestModel.find({}).sort({ timestamp: -1 });
    } else {
      return memoryStore.approvalRequests;
    }
  }

  static async findById(id) {
    if (getStoreMode() === 'mongodb') {
      return await ApprovalRequestModel.findById(id);
    } else {
      return memoryStore.approvalRequests.find(a => String(a._id) === String(id)) || null;
    }
  }

  static async resolve(id, status, resolvedBy = 'Security Admin') {
    if (getStoreMode() === 'mongodb') {
      return await ApprovalRequestModel.findByIdAndUpdate(
        id,
        {
          status,
          resolvedAt: new Date(),
          resolvedBy
        },
        { new: true }
      );
    } else {
      const item = memoryStore.approvalRequests.find(a => String(a._id) === String(id));
      if (item) {
        item.status = status;
        item.resolvedAt = new Date();
        item.resolvedBy = resolvedBy;
      }
      return item;
    }
  }
}

module.exports = { ApprovalRequestModel, ApprovalRequestStore };
