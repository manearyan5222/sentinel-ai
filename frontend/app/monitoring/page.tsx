'use client';

import React, { useState, useEffect } from 'react';
import {
  Video,
  Maximize2,
  Minimize2,
  Shield,
  Users,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Layers,
  Settings,
  Sparkles
} from 'lucide-react';
import { SOCHeader } from '../../components/SOCHeader';
import { AIChatAssistant } from '../../components/AIChatAssistant';
import { AlertTriageModal } from '../../components/AlertTriageModal';
import { fetchCameras, fetchAlerts, fetchSystemStatus, updateAlertStatus } from '../../lib/api';
import { Camera, Alert, SystemStatus } from '../../lib/types';

export default function LiveMonitoringPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [fullscreenCam, setFullscreenCam] = useState<Camera | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isPaused, setIsPaused] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    try {
      const [camsData, alertsData, sysData] = await Promise.all([
        fetchCameras(),
        fetchAlerts(),
        fetchSystemStatus()
      ]);
      setCameras(camsData);
      setAlerts(alertsData);
      setSystemStatus(sysData);
    } catch (e) {
      console.error('Monitoring load error:', e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const togglePause = (camId: string) => {
    setIsPaused(prev => ({ ...prev, [camId]: !prev[camId] }));
  };

  const handleTriageAction = async (alertId: string, status: string, notes?: string) => {
    await updateAlertStatus(alertId, status, notes);
    setSelectedAlert(null);
    loadData();
  };

  const activeAlerts = alerts.filter(a => ['NEW', 'ACTIVE', 'ACKNOWLEDGED', 'INVESTIGATING'].includes(a.status));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <SOCHeader
        systemStatus={systemStatus}
        isConnected={true}
        activeAlertCount={activeAlertCount(activeAlerts)}
      />

      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <Video className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Live CCTV Monitoring Grid
              </h2>
              <p className="text-xs text-slate-400">
                Multi-stream AI vision inference, spatial zone overlays & real-time track metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{cameras.length} STREAMS ACTIVE</span>
            </span>
          </div>
        </div>

        {/* Camera Monitoring Grid (2x2 / 3x2 Responsive) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {cameras.map((cam) => {
            const camAlerts = alerts.filter(a => a.camera_id === cam.id && a.status === 'NEW');
            const hasCritical = camAlerts.some(a => a.risk_score >= 80);
            const highestRisk = camAlerts.length > 0 ? Math.max(...camAlerts.map(a => a.risk_score)) : (cam.is_restricted_zone ? 85 : 20);

            return (
              <div
                key={cam.id}
                className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all shadow-xl flex flex-col ${
                  hasCritical ? 'border-rose-500/80 shadow-rose-950/30' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Camera Card Top Telemetry Bar */}
                <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white tracking-wide">{cam.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                          {cam.id.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{cam.location_zone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Measured FPS */}
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
                      {cam.fps || 30} FPS
                    </span>

                    {/* Tracked People */}
                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>{cam.active_tracks_count || 1} People</span>
                    </div>

                    {/* Risk Badge */}
                    <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                      highestRisk >= 80 ? 'bg-rose-950 text-rose-400 border border-rose-800' : highestRisk >= 50 ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      RISK {highestRisk}
                    </span>

                    {/* Fullscreen Button */}
                    <button
                      onClick={() => setFullscreenCam(cam)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Fullscreen Camera"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Video Stream Container */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  {!isPaused[cam.id] ? (
                    <img
                      src={`http://localhost:8000/api/cameras/${cam.id}/stream`}
                      alt={cam.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-slate-400 font-mono text-xs">
                      <Pause className="w-8 h-8 text-amber-400 mb-2" />
                      <span>STREAM PAUSED BY OPERATOR</span>
                    </div>
                  )}

                  {/* Zone Tag Overlay */}
                  {cam.is_restricted_zone && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-rose-600/90 text-white font-mono text-[10px] font-bold tracking-wider uppercase shadow-lg backdrop-blur-sm">
                      RESTRICTED SECTOR
                    </div>
                  )}

                  {/* Stream Control Overlay */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => togglePause(cam.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-white text-[11px] font-mono flex items-center gap-1.5 backdrop-blur-sm transition-all"
                    >
                      {isPaused[cam.id] ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                      <span>{isPaused[cam.id] ? 'RESUME' : 'PAUSE'}</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Event Log Strip */}
                <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 truncate max-w-sm">
                    {camAlerts.length > 0 ? `Alert: ${camAlerts[0].action_protocol?.what || camAlerts[0].entity_label}` : 'Monitoring active. No boundary violations.'}
                  </span>
                  {camAlerts.length > 0 && (
                    <button
                      onClick={() => setSelectedAlert(camAlerts[0])}
                      className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                    >
                      <span>Triage Alert →</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Fullscreen Camera Modal */}
      {fullscreenCam && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-4 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-lg text-white font-mono">{fullscreenCam.name} (FULLSCREEN STREAM)</span>
            </div>
            <button
              onClick={() => setFullscreenCam(null)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 relative flex items-center justify-center overflow-hidden my-4">
            <img
              src={`http://localhost:8000/api/cameras/${fullscreenCam.id}/stream`}
              alt={fullscreenCam.name}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-800"
            />
          </div>
        </div>
      )}

      {/* Floating Gemini AI Security Assistant */}
      <AIChatAssistant />

      {/* Alert Triage Modal */}
      {selectedAlert && (
        <AlertTriageModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAction={handleTriageAction}
        />
      )}
    </div>
  );
}

function activeAlertCount(alerts: Alert[]) {
  return alerts.length;
}
