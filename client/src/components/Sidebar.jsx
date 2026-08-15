import React from 'react';
import { 
  LayoutDashboard, 
  PlayCircle, 
  Users, 
  CheckSquare, 
  Activity, 
  FileText, 
  Lock 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, pendingApprovalsCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'simulator', label: 'Action Simulator', icon: PlayCircle, badge: 'Demo Ready' },
    { id: 'agents', label: 'Agent Management', icon: Users },
    { id: 'approvals', label: 'Approval Queue', icon: CheckSquare, count: pendingApprovalsCount },
    { id: 'inspector', label: 'Gateway Inspector', icon: Activity },
    { id: 'logs', label: 'Audit Logs', icon: FileText }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0B0F19] flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          Security Control Center
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-400 border border-cyan-500/30 font-semibold glow-cyan'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.count > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950 font-mono">
                    {item.count}
                  </span>
                )}

                {item.badge && !isActive && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Security Gateway Footer Card */}
      <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Controlled Autonomy</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Evaluating sensitive AI agent actions deterministically before business execution.
        </p>
      </div>
    </aside>
  );
}
