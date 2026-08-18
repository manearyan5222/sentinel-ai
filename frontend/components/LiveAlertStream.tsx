'use client';

import React from 'react';
import { Alert } from '../lib/types';
import { ShieldAlert, AlertTriangle, Clock, ChevronRight, CheckCircle, ShieldX } from 'lucide-react';

interface LiveAlertStreamProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
}

export function LiveAlertStream({ alerts, onSelectAlert }: LiveAlertStreamProps) {
  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'ELEVATED': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'MODERATE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const getStatusBadge = (status: Alert['status']) => {
    switch (status) {
      case 'ACTIVE': return <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold uppercase animate-pulse">ACTIVE</span>;
      case 'LEGITIMATE': return <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold uppercase">LEGITIMATE</span>;
      case 'ESCALATED': return <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 font-bold uppercase">ESCALATED</span>;
      default: return <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold uppercase">RESOLVED</span>;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Real-Time Alert Feed
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 font-bold">
          {alerts.filter(a => a.status === 'ACTIVE').length} PENDING
        </span>
      </div>

      <div className="mt-3 space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No active security alerts recorded.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectAlert(alert)}
              className="p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold ${getBadgeStyle(alert.risk_level)}`}>
                  {alert.risk_level} ({alert.risk_score})
                </span>
                {getStatusBadge(alert.status)}
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-200 group-hover:text-blue-400 transition-colors">
                  {alert.entity_label}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {alert.camera_name} • {alert.location_zone}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {new Date(alert.created_at).toLocaleTimeString()}
                </span>
                <span className="text-blue-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-sans font-semibold">
                  Triage <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
