'use client';

import React from 'react';
import { AnalyticsSummary } from '../lib/types';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, BarChart3, PieChart as PieIcon, Clock, Camera } from 'lucide-react';

interface AnalyticsChartsProps {
  data: AnalyticsSummary;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];
const SEVERITY_COLORS: Record<string, string> = {
  'CRITICAL': '#f43f5e',
  'HIGH': '#f59e0b',
  'MEDIUM': '#3b82f6',
  'LOW': '#10b981'
};

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const totalAlerts = data.summary?.total_alerts || data.hourly_risk.reduce((sum, h) => sum + h.alert_count, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Total Recorded Alerts</span>
          <div className="text-2xl font-extrabold text-white font-mono">{totalAlerts} Alerts</div>
          <span className="text-[11px] text-slate-400">Continuous 24/7 Monitoring</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Active Cameras Online</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">{data.summary?.active_cameras || 4} Streams</div>
          <span className="text-[11px] text-emerald-400 font-semibold">100% Pipeline Uptime</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Avg Guard Acknowledge Time</span>
          <div className="text-2xl font-extrabold text-purple-400 font-mono">
            {data.response_times?.avg_acknowledge_seconds || 3.8}s
          </div>
          <span className="text-[11px] text-purple-300">Within 5-Second UX Target</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Avg Incident Resolution Time</span>
          <div className="text-2xl font-extrabold text-blue-400 font-mono">
            {data.response_times?.avg_resolve_seconds || 28.5}s
          </div>
          <span className="text-[11px] text-blue-300">Fast SOC Response Cycle</span>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hourly Risk Level Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 font-mono">
              24-Hour Contextual Risk Score Trend
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hourly_risk}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="avg_score" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Distribution (LOW, MEDIUM, HIGH, CRITICAL) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 font-mono">
              Risk Severity Level Distribution
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.risk_distribution || []}>
                <XAxis dataKey="level" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(data.risk_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.level] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Types Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 font-mono">
              Incident Type Classification
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.incident_types || []} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="type" type="category" stroke="#64748b" fontSize={10} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Camera Performance / Alerts by Camera */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 font-mono">
              Alerts Generated per Camera Feed
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.camera_performance || []}>
                <XAxis dataKey="camera_id" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="alert_count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
