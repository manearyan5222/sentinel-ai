'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, RiskLevel, DetectionEvent } from '../lib/types';
import { AlertOctagon, Eye, Maximize2, ShieldAlert, CheckCircle, Shield } from 'lucide-react';

interface CameraFeedCardProps {
  camera: Camera;
  onSelectAlert?: (detection: DetectionEvent) => void;
}

export function CameraFeedCard({ camera, onSelectAlert }: CameraFeedCardProps) {
  const [streamError, setStreamError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [simulatedRisk, setSimulatedRisk] = useState<number>(camera.is_restricted_zone ? 85 : 20);
  const [simulatedTrackId, setSimulatedTrackId] = useState<string>('TRACK-#0104');
  const [simulatedLabel, setSimulatedLabel] = useState<string>(camera.is_restricted_zone ? 'UNRECOGNIZED' : 'RESIDENT');

  // Interactive simulated CV bounding box canvas animation when stream loading / standalone
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let boxX = 60;
    let boxY = 80;
    let dx = 1.2;
    let dy = 0.8;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark CCTV grid background pattern
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Move detection bounding box
      boxX += dx;
      boxY += dy;
      if (boxX < 40 || boxX > canvas.width - 120) dx = -dx;
      if (boxY < 40 || boxY > canvas.height - 140) dy = -dy;

      // Draw bounding box based on risk level
      const isHighRisk = simulatedRisk >= 75;
      const isElevated = simulatedRisk >= 50;
      const boxColor = isHighRisk ? '#f43f5e' : isElevated ? '#f59e0b' : '#10b981';

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(boxX, boxY, 80, 120);

      // Bounding box corners styling
      const cornerLength = 12;
      ctx.lineWidth = 3.5;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + cornerLength); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + cornerLength, boxY); ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(boxX + 80 - cornerLength, boxY); ctx.lineTo(boxX + 80, boxY); ctx.lineTo(boxX + 80, boxY + cornerLength); ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + 120 - cornerLength); ctx.lineTo(boxX, boxY + 120); ctx.lineTo(boxX + cornerLength, boxY + 120); ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(boxX + 80 - cornerLength, boxY + 120); ctx.lineTo(boxX + 80, boxY + 120); ctx.lineTo(boxX + 80, boxY + 120 - cornerLength); ctx.stroke();

      // Bounding box label header
      ctx.fillStyle = boxColor;
      ctx.fillRect(boxX, boxY - 24, 110, 24);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${simulatedLabel} [${simulatedRisk}]`, boxX + 4, boxY - 7);

      // Draw Track ID badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(boxX, boxY + 124, 80, 18);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(simulatedTrackId, boxX + 4, boxY + 137);

      // Timestamp overlay on camera feed
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(10, 10, 160, 22);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '11px monospace';
      ctx.fillText(`REC • ${camera.name}`, 16, 25);

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animFrameId);
  }, [simulatedRisk, simulatedLabel, camera.name]);

  const getRiskBadgeColor = (score: number) => {
    if (score >= 75) return 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse';
    if (score >= 50) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    if (score >= 30) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  };

  const handleSimulateIncident = () => {
    const mockDetection: DetectionEvent = {
      id: `evt-${Date.now()}`,
      camera_id: camera.id,
      camera_name: camera.name,
      location_zone: camera.location_zone,
      timestamp: new Date().toISOString(),
      track_id: simulatedTrackId,
      identity_type: 'UNRECOGNIZED',
      confidence: 0.94,
      risk_score: 85,
      risk_level: 'HIGH',
      risk_reasons: [
        'Unrecognized Person (+25)',
        camera.is_restricted_zone ? 'Restricted Zone Violation (+30)' : 'Unexpected Entrance (+20)',
        'Extended Dwell Time 28s (+15)',
        'No Visitor Pre-Registration (+15)',
      ],
      bounding_box: { x: 120, y: 80, width: 80, height: 120 },
      dwell_time_seconds: 28,
    };
    if (onSelectAlert) {
      onSelectAlert(mockDetection);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col group hover:border-slate-700 transition-all">
      
      {/* Feed Header */}
      <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-xs text-slate-200 tracking-wide">{camera.name}</span>
          {camera.is_restricted_zone && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold uppercase">
              RESTRICTED ZONE
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-mono">{camera.location_zone}</span>
      </div>

      {/* Video Feed Screen Area */}
      <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
        
        {/* MJPEG Stream Endpoint or Dynamic Canvas Simulation */}
        <img
          src={`/api/cameras/${camera.id}/stream`}
          alt={camera.name}
          className={`w-full h-full object-cover ${streamError ? 'hidden' : 'block'}`}
          onError={() => setStreamError(true)}
        />

        {streamError && (
          <canvas
            ref={canvasRef}
            width={480}
            height={270}
            className="w-full h-full object-cover"
          />
        )}

        {/* Live CV Stats Overlay Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${getRiskBadgeColor(simulatedRisk)}`}>
            RISK SCORE: {simulatedRisk}/100
          </span>
        </div>

        {/* Restricted Zone Warning Banner Overlay */}
        {camera.is_restricted_zone && simulatedRisk >= 75 && (
          <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-rose-950/90 border border-rose-600 rounded flex items-center justify-between text-[11px] text-rose-200 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
              <span className="font-bold">ELEVATED RISK FLAG</span>
            </div>
            <button
              onClick={handleSimulateIncident}
              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-semibold tracking-wider uppercase transition-colors"
            >
              Inspect Alert
            </button>
          </div>
        )}

      </div>

      {/* Footer Controls & Live Detections Bar */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>Active Tracks: <strong className="text-slate-200">{camera.active_tracks_count || 1}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateIncident}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white transition-all text-[11px] font-semibold flex items-center gap-1 border border-slate-700 hover:border-blue-500"
          >
            <AlertOctagon className="w-3 h-3" />
            <span>Triage Demo Alert</span>
          </button>
        </div>
      </div>

    </div>
  );
}
