import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ActionSimulator from './pages/ActionSimulator';
import AgentManagement from './pages/AgentManagement';
import ApprovalQueue from './pages/ApprovalQueue';
import GatewayInspector from './pages/GatewayInspector';
import AuditLogs from './pages/AuditLogs';
import { fetchHealth, fetchApprovals } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [health, setHealth] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const loadStatus = async () => {
    try {
      const hData = await fetchHealth();
      setHealth(hData);

      const apprData = await fetchApprovals(true);
      if (apprData.success) {
        setPendingCount(apprData.approvals?.length || 0);
      }
    } catch (err) {
      console.warn('Backend server offline or loading...', err);
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      <Navbar
        health={health}
        pendingCount={pendingCount}
        onNavigateToApprovals={() => setActiveTab('approvals')}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingApprovalsCount={pendingCount}
        />

        <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigateToSimulator={() => setActiveTab('simulator')}
              onNavigateToApprovals={() => setActiveTab('approvals')}
            />
          )}

          {activeTab === 'simulator' && <ActionSimulator />}
          {activeTab === 'agents' && <AgentManagement />}
          {activeTab === 'approvals' && <ApprovalQueue />}
          {activeTab === 'inspector' && <GatewayInspector />}
          {activeTab === 'logs' && <AuditLogs />}
        </main>
      </div>
    </div>
  );
}
