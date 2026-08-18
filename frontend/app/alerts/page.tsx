'use client';

import React, { useState, useEffect } from 'react';
import { SOCHeader } from '../../components/SOCHeader';
import { LiveAlertStream } from '../../components/LiveAlertStream';
import { AlertTriageModal } from '../../components/AlertTriageModal';
import { useAlertWebSocket } from '../../hooks/useAlertWebSocket';
import { fetchAlerts, fetchSystemStatus, updateAlertStatus } from '../../lib/api';
import { Alert, SystemStatus, DetectionEvent } from '../../lib/types';
import { Bell, ShieldAlert, Filter } from 'lucide-react';

export default function AlertCenterPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [activeModalAlert, setActiveModalAlert] = useState<Alert | DetectionEvent | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const { isConnected } = useAlertWebSocket(
    (newAlert) => setAlerts((prev) => [newAlert, ...prev])
  );

  useEffect(() => {
    async function load() {
      const [aData, sData] = await Promise.all([fetchAlerts(), fetchSystemStatus()]);
      setAlerts(aData);
      setSystemStatus(sData);
    }
    load();
  }, []);

  const handleResolveAlert = async (alertId: string, status: 'LEGITIMATE' | 'ESCALATED', notes: string) => {
    try {
      await updateAlertStatus(alertId, status, notes);
    } catch (e) {
      console.log('Update fallback');
    }
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status, guard_notes: notes } : a))
    );
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      <SOCHeader
        systemStatus={systemStatus}
        isConnected={isConnected}
        activeAlertCount={alerts.filter((a) => a.status === 'ACTIVE').length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-950 border border-rose-800 text-rose-400">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-100">
                SECURITY ALERT CENTER & LOGS
              </h2>
              <p className="text-xs text-slate-400">
                Review, triage, and escalate flagged computer-vision risk events.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            {['ALL', 'ACTIVE', 'LEGITIMATE', 'ESCALATED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setActiveModalAlert(alert)}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 group-hover:text-blue-400">
                      {alert.entity_label}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                      RISK SCORE: {alert.risk_score}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {alert.camera_name} • {alert.location_zone} • {new Date(alert.created_at).toLocaleTimeString()}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {alert.risk_reasons.map((r, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800 font-mono">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                    alert.status === 'ACTIVE' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300'
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

      <AlertTriageModal
        alert={activeModalAlert}
        onClose={() => setActiveModalAlert(null)}
        onResolveAlert={handleResolveAlert}
      />
    </div>
  );
}
