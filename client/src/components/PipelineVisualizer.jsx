import React from 'react';
import { UserCheck, Key, ShieldAlert, FileSearch, Scale, Zap, ArrowRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import DecisionBadge from './DecisionBadge';
import RiskScoreBadge from './RiskScoreBadge';

export default function PipelineVisualizer({ evaluation }) {
  if (!evaluation) {
    return (
      <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
        Run an action in the Action Simulator to inspect live security gateway pipeline execution.
      </div>
    );
  }

  const {
    agentId,
    agentName,
    requestedAction,
    permissionResult,
    promptInjectionResult,
    dataSecurityResult,
    riskScore,
    decision,
    reason,
    riskFactors,
    executionResult
  } = evaluation;

  const steps = [
    {
      id: 1,
      name: 'Agent Identity',
      icon: UserCheck,
      status: permissionResult?.agent ? 'PASS' : 'FAIL',
      detail: permissionResult?.agent ? `${agentName} (${agentId})` : 'Unknown / Rejected Agent'
    },
    {
      id: 2,
      name: 'Permissions',
      icon: Key,
      status: permissionResult?.authorized ? 'PASS' : (permissionResult?.exceedsLimit ? 'WARN' : 'FAIL'),
      detail: permissionResult?.reason || 'Permission check complete'
    },
    {
      id: 3,
      name: 'Prompt Injection',
      icon: ShieldAlert,
      status: promptInjectionResult?.threatDetected ? 'FAIL' : 'PASS',
      detail: promptInjectionResult?.threatDetected 
        ? `Threat: ${promptInjectionResult.reason}`
        : 'Clean (No Injection Detected)'
    },
    {
      id: 4,
      name: 'Data Leakage',
      icon: FileSearch,
      status: dataSecurityResult?.sensitiveDataDetected 
        ? (dataSecurityResult.suggestedAction === 'BLOCK' ? 'FAIL' : 'WARN')
        : 'PASS',
      detail: dataSecurityResult?.sensitiveDataDetected
        ? `Sensitive data: ${dataSecurityResult.detectedTypes?.join(', ')}`
        : 'Clean (No Secrets Found)'
    },
    {
      id: 5,
      name: 'Risk Engine',
      icon: Scale,
      status: riskScore >= 70 ? 'FAIL' : (riskScore >= 40 ? 'WARN' : 'PASS'),
      detail: `Risk Score: ${riskScore}/100`
    },
    {
      id: 6,
      name: 'Business API',
      icon: Zap,
      status: decision === 'ALLOW' ? 'PASS' : (decision === 'APPROVAL_REQUIRED' ? 'WARN' : 'FAIL'),
      detail: decision === 'ALLOW' ? 'Action Executed' : (decision === 'APPROVAL_REQUIRED' ? 'Pending Approval' : 'Execution Blocked')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Result Banner */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        decision === 'ALLOW' 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : decision === 'APPROVAL_REQUIRED'
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-rose-500/10 border-rose-500/30'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Gateway Decision</span>
            <DecisionBadge decision={decision} />
            <RiskScoreBadge score={riskScore} />
          </div>
          <p className="text-sm font-medium text-slate-200">{reason}</p>
        </div>

        <div className="text-right shrink-0 font-mono text-xs text-slate-400">
          <div>Agent: <span className="text-white font-semibold">{agentName}</span></div>
          <div>Action: <span className="text-cyan-400 font-semibold">{requestedAction}</span></div>
        </div>
      </div>

      {/* Step-by-step Execution Pipeline */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Security Gateway Pipeline Trace
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            let statusColor = 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
            let StatusIcon = CheckCircle2;

            if (step.status === 'FAIL') {
              statusColor = 'border-rose-500/30 bg-rose-500/5 text-rose-400';
              StatusIcon = XCircle;
            } else if (step.status === 'WARN') {
              statusColor = 'border-amber-500/30 bg-amber-500/5 text-amber-400';
              StatusIcon = AlertTriangle;
            }

            return (
              <div key={step.id} className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 ${statusColor}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">0{step.id}</span>
                  <StatusIcon className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{step.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight line-clamp-2" title={step.detail}>
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Factor Breakdown */}
      {riskFactors && riskFactors.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
          <h5 className="text-xs font-bold text-slate-300 font-mono uppercase">Detected Risk Vectors (+{riskScore} pts)</h5>
          <div className="space-y-1.5">
            {riskFactors.map((rf, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="font-mono text-cyan-400">{rf.factor}</span>
                <span className="text-slate-300 ml-2">{rf.detail}</span>
                <span className="font-mono font-bold text-amber-400 ml-2 shrink-0">+{rf.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mock Business Execution Result */}
      {executionResult && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>Mock Business System Response</span>
            <span className="text-emerald-400 font-semibold">{executionResult.status || 'EXECUTED'}</span>
          </div>
          <pre className="text-slate-300 overflow-x-auto p-2.5 rounded bg-slate-900 border border-slate-800/80 text-[11px]">
            {JSON.stringify(executionResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
