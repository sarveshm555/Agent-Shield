const mongoose = require('mongoose');
const { getStoreMode, memoryStore } = require('../config/db');

const Schema = mongoose.Schema;

const agentSchema = new Schema({
  agentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'DISABLED'], default: 'ACTIVE' },
  allowedActions: [{ type: String }],
  permissionLimits: { type: Map, of: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const AgentModel = mongoose.models.Agent || mongoose.model('Agent', agentSchema);

const DEFAULT_AGENTS = [
  {
    agentId: 'SupportAgent',
    name: 'Tier 1 Support Agent',
    role: 'Customer Support',
    status: 'ACTIVE',
    allowedActions: ['READ_CUSTOMER', 'CREATE_TICKET', 'REFUND'],
    permissionLimits: { MAX_REFUND: 5000 }
  },
  {
    agentId: 'SalesAgent',
    name: 'Enterprise Sales Agent',
    role: 'Sales Representative',
    status: 'ACTIVE',
    allowedActions: ['READ_CUSTOMER', 'CREATE_DEAL', 'SEND_EMAIL'],
    permissionLimits: { MAX_EMAIL_RECIPIENTS: 10 }
  },
  {
    agentId: 'AdminAgent',
    name: 'System Admin Agent',
    role: 'System Administrator',
    status: 'ACTIVE',
    allowedActions: ['*'],
    permissionLimits: { MAX_REFUND: 100000 }
  },
  {
    agentId: 'LegacyAgent',
    name: 'Deprecated Support Agent',
    role: 'Legacy Bot',
    status: 'DISABLED',
    allowedActions: ['READ_CUSTOMER'],
    permissionLimits: {}
  }
];

class AgentStore {
  static async seedDefaultAgents() {
    if (getStoreMode() === 'mongodb') {
      const count = await AgentModel.countDocuments();
      if (count === 0) {
        await AgentModel.insertMany(DEFAULT_AGENTS);
        console.log('🌱 Default agents seeded into MongoDB Atlas.');
      }
    }
  }

  static async findByAgentId(agentId) {
    if (getStoreMode() === 'mongodb') {
      await this.seedDefaultAgents();
      return await AgentModel.findOne({ agentId });
    } else {
      return memoryStore.agents.find(a => a.agentId === agentId) || null;
    }
  }

  static async getAll() {
    if (getStoreMode() === 'mongodb') {
      await this.seedDefaultAgents();
      return await AgentModel.find({}).sort({ createdAt: -1 });
    } else {
      return memoryStore.agents;
    }
  }

  static async create(data) {
    if (getStoreMode() === 'mongodb') {
      return await AgentModel.create(data);
    } else {
      const newAgent = {
        _id: 'ag_' + Date.now(),
        ...data,
        createdAt: new Date()
      };
      memoryStore.agents.push(newAgent);
      return newAgent;
    }
  }

  static async updateStatus(agentId, status) {
    if (getStoreMode() === 'mongodb') {
      return await AgentModel.findOneAndUpdate(
        { agentId },
        { status },
        { new: true }
      );
    } else {
      const agent = memoryStore.agents.find(a => a.agentId === agentId);
      if (agent) {
        agent.status = status;
      }
      return agent;
    }
  }

  static async updateLimits(agentId, limits) {
    if (getStoreMode() === 'mongodb') {
      return await AgentModel.findOneAndUpdate(
        { agentId },
        { permissionLimits: limits },
        { new: true }
      );
    } else {
      const agent = memoryStore.agents.find(a => a.agentId === agentId);
      if (agent) {
        agent.permissionLimits = limits;
      }
      return agent;
    }
  }
}

module.exports = { AgentModel, AgentStore };
