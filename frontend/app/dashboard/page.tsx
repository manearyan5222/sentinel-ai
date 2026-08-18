'use client';

import React, { useState, useEffect } from 'react';
import { SOCHeader } from '../../components/SOCHeader';
import { CameraFeedCard } from '../../components/CameraFeedCard';
import { LiveAlertStream } from '../../components/LiveAlertStream';
import { AlertTriageModal } from '../../components/AlertTriageModal';
import { AIChatAssistant } from '../../components/AIChatAssistant';
import { useAlertWebSocket } from '../../hooks/useAlertWebSocket';
import { fetchCameras, fetchAlerts, fetchSystemStatus, updateAlertStatus } from '../../lib/api';
import { Camera, Alert, SystemStatus, DetectionEvent } from '../../lib/types';
import { RefreshCw } from 'lucide-react';

export default function SOCDashboardPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [activeModalAlert, setActiveModalAlert] = useState<Alert | DetectionEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // WebSocket for Real-Time Alert Push
  const { isConnected } = useAlertWebSocket(
    (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    },
    (detection) => {
      // High risk detection auto triggers triage review modal if high priority
      if (detection.risk_score >= 75 && !activeModalAlert) {
        setActiveModalAlert(detection);
      }
    }
  );

  const loadData = async () => {
    setIsLoading(true);
    const [cData, aData, sData] = await Promise.all([
      fetchCameras(),
      fetchAlerts(),
      fetchSystemStatus(),
    ]);
    setCameras(cData);
    setAlerts(aData);
    setSystemStatus(sData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveAlert = async (alertId: string, status: 'LEGITIMATE' | 'ESCALATED', notes: string) => {
    try {
      await updateAlertStatus(alertId, status, notes);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status, guard_notes: notes } : a))
      );
    } catch (e) {
      console.log('Update status local fallback');
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status, guard_notes: notes } : a))
      );
    }
  };

  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      <SOCHeader
        systemStatus={systemStatus}
        isConnected={isConnected}
        activeAlertCount={activeAlertsCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* SOC Live Operations Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl glass-panel">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-100">
                ACTIVE MONITORING GRID
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyzing 4 CCTV video streams for unauthorized access, extended dwell, and risk scoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Streams</span>
            </button>
          </div>
        </div>

        {/* Core Workspace Layout: Camera Grid + Sidebar Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main 2x2 Camera Feed Grid (2 Columns on Desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cameras.map((camera) => (
                <CameraFeedCard
                  key={camera.id}
                  camera={camera}
                  onSelectAlert={(detection) => setActiveModalAlert(detection)}
                />
              ))}
            </div>
          </div>

          {/* Real-time Alert Sidebar */}
          <div className="lg:col-span-1">
            <LiveAlertStream
              alerts={alerts}
              onSelectAlert={(alert) => setActiveModalAlert(alert)}
            />
          </div>

        </div>

      </main>

      {/* 5-Second UX Alert Triage Modal */}
      <AlertTriageModal
        alert={activeModalAlert}
        onClose={() => setActiveModalAlert(null)}
        onResolveAlert={handleResolveAlert}
      />

      {/* Floating AI Security Assistant Chat */}
      <AIChatAssistant />
    </div>
  );
}
