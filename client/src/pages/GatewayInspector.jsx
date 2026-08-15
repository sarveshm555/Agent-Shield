import React from 'react';
import { Activity, ShieldCheck, Lock, Cpu, Eye, FileText, ArrowDown } from 'lucide-react';

export default function GatewayInspector() {
  const pipelineStages = [
    {
      step: '01',
      title: 'Agent Identity & Verification',
      subtitle: 'Deterministic Authorization Logic',
      icon: Lock,
      color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
      description: 'Intercepts incoming agentId, verifies agent exists and status is ACTIVE. Rejects unknown or disabled agents immediately (Fail-Closed).'
    },
    {
      step: '02',
      title: 'Permission & Limit Enforcement',
      subtitle: 'Role & Limit Validation',
      icon: ShieldCheck,
      color: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
      description: 'Checks allowedActions array and financial parameters against hardcoded or configured agent limits (e.g. MAX_REFUND = ₹5,000).'
    },
    {
      step: '03',
      title: 'Prompt Injection Detection',
      subtitle: 'Semantic LLM + Heuristic Regex',
      icon: Cpu,
      color: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
      description: 'Scans prompt strings for system overrides, rule disregard, exfiltration phrases, and roleplay jailbreaks using OpenAI/Gemini or Heuristic engine.'
    },
    {
      step: '04',
      title: 'Data Leakage Protection',
      subtitle: 'PII & Secrets Scanner',
      icon: Eye,
      color: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
      description: 'Inspects outgoing payloads for API keys (sk-...), credit cards, SSN, passwords, and bulk PII. Executes ALLOW, REDACT, or BLOCK.'
    },
    {
      step: '05',
      title: 'Action Risk Engine',
      subtitle: '0–100 Weighted Score Engine',
      icon: Activity,
      color: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
      description: 'Combines permission checks, injection threats, financial amount size, and operation impact into a weighted score (0–39 ALLOW, 40–69 APPROVAL_REQUIRED, 70–100 BLOCK).'
    },
    {
      step: '06',
      title: 'Mock Business Execution & Audit Log',
      subtitle: 'Controlled Autonomy Execution',
      icon: FileText,
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      description: 'If ALLOWED, forwards sanitized request to Mock CRM, Payment, or Email APIs. Saves comprehensive audit record to MongoDB Atlas.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Gateway Security Architecture Inspector</h2>
        <p className="text-slate-400 text-sm">
          Deep-dive visual architecture of the AgentShield multi-layered security evaluation pipeline
        </p>
      </div>

      {/* Architecture Architecture Diagram Card */}
      <div className="p-8 rounded-2xl glass-panel space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold">
            ARCHITECTURE FLOW
          </span>
          <h3 className="text-xl font-extrabold text-white">AI Agent &rarr; AgentShield Gateway &rarr; Business Systems</h3>
          <p className="text-xs text-slate-400">
            No agent action can bypass backend security checks. All decisions are evaluated deterministically with AI advisory intelligence.
          </p>
        </div>

        {/* Pipeline Sequence Cards */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <React.Fragment key={stage.step}>
                <div className="p-5 rounded-2xl glass-card border flex items-start gap-4 hover:scale-[1.01]">
                  <div className={`p-3 rounded-xl border shrink-0 ${stage.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">STAGE {stage.step}</span>
                      <h4 className="font-bold text-white text-base">{stage.title}</h4>
                    </div>
                    <p className="text-xs font-mono text-cyan-400">{stage.subtitle}</p>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">{stage.description}</p>
                  </div>
                </div>

                {idx < pipelineStages.length - 1 && (
                  <div className="flex justify-center my-1 text-slate-600">
                    <ArrowDown className="w-5 h-5 animate-pulse" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
