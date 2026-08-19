'use client';

import React, { useState, useEffect } from 'react';
import { SOCHeader } from '../../components/SOCHeader';
import { LiveAlertStream } from '../../components/LiveAlertStream';
import { AlertTriageModal } from '../../components/AlertTriageModal';
import { AIChatAssistant } from '../../components/AIChatAssistant';
import { useAlertWebSocket } from '../../hooks/useAlertWebSocket';
import { fetchAlerts, fetchSystemStatus, updateAlertStatus } from '../../lib/api';
import { Alert, SystemStatus, DetectionEvent } from '../../lib/types';
import { Bell, ShieldAlert, Filter, Search } from 'lucide-react';

export default function AlertCenterPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [activeModalAlert, setActiveModalAlert] = useState<Alert | DetectionEvent | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { isConnected } = useAlertWebSocket(
    (newAlert) => setAlerts((prev) => [newAlert, ...prev])
  );

  const loadData = async () => {
    const [aData, sData] = await Promise.all([fetchAlerts(), fetchSystemStatus()]);
    setAlerts(aData);
    setSystemStatus(sData);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = async (alertId: string, status: string, notes?: string) => {
    await updateAlertStatus(alertId, status, notes);
    loadData();
    setActiveModalAlert(null);
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const matchesSeverity = filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesSearch = (a.entity_label || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (a.camera_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  const activeCount = alerts.filter((a) => ['NEW', 'ACTIVE', 'ACKNOWLEDGED', 'INVESTIGATING'].includes(a.status)).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <SOCHeader
        systemStatus={systemStatus}
        isConnected={isConnected}
        activeAlertCount={activeCount}
      />

      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-800/80 text-rose-400">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide text-slate-100">
                Security Alert Center & Operational Triage
              </h2>
              <p className="text-xs text-slate-400">
                Review, investigate, and resolve explainable computer-vision security risk events.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search alert by label, track ID or camera..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">STATUS:</span>
            {['ALL', 'NEW', 'ACTIVE', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                  filterStatus === st ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">SEVERITY:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                  filterSeverity === sev ? 'bg-amber-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Split: Alerts List + Live Alert Stream Component */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setActiveModalAlert(alert)}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-blue-500/80 rounded-2xl cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-lg"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 group-hover:text-blue-400 transition-colors">
                      {alert.entity_label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      alert.risk_score >= 80 ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      alert.risk_score >= 60 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      RISK SCORE: {alert.risk_score}/100
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 font-bold">
                      {alert.severity || alert.risk_level}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    {alert.action_protocol?.what || `Detected on ${alert.camera_id} with dwell time ${alert.dwell_time_seconds}s.`}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(alert.risk_reasons || []).map((r, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800 font-mono">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    alert.status === 'NEW' || alert.status === 'ACTIVE' ? 'bg-rose-600 text-white animate-pulse' :
                    alert.status === 'INVESTIGATING' ? 'bg-amber-600 text-white' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {alert.status}
                  </span>
                  <span className="text-xs text-blue-400 font-semibold group-hover:underline">
                    Inspect 5s Protocol →
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <LiveAlertStream
              alerts={alerts}
              onSelectAlert={(a) => setActiveModalAlert(a)}
            />
          </div>

        </div>

      </main>

      {/* 5-Second UX Alert Triage Modal */}
      {activeModalAlert && (
        <AlertTriageModal
          alert={activeModalAlert}
          onClose={() => setActiveModalAlert(null)}
          onAction={handleResolveAlert}
        />
      )}

      {/* Floating Gemini AI Assistant */}
      <AIChatAssistant />
    </div>
  );
}
