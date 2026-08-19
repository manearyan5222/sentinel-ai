'use client';

import React, { useState, useEffect } from 'react';
import { SOCHeader } from '../../components/SOCHeader';
import { AnalyticsCharts } from '../../components/AnalyticsCharts';
import { AIChatAssistant } from '../../components/AIChatAssistant';
import { fetchAnalytics, fetchSystemStatus } from '../../lib/api';
import { AnalyticsSummary, SystemStatus } from '../../lib/types';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    async function load() {
      const [aData, sData] = await Promise.all([fetchAnalytics(), fetchSystemStatus()]);
      setAnalytics(aData);
      setSystemStatus(sData);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <SOCHeader systemStatus={systemStatus} />

      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-wide text-slate-100">
              Security Operations Analytics & Risk Intelligence
            </h2>
            <p className="text-xs text-slate-400">
              Real-time statistical breakdown of alert frequency, risk distributions, camera performance, and guard response speeds.
            </p>
          </div>
        </div>

        {analytics ? (
          <AnalyticsCharts data={analytics} />
        ) : (
          <div className="h-96 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
            <span>Loading security analytics dataset...</span>
          </div>
        )}
      </main>

      {/* Floating Gemini AI Assistant */}
      <AIChatAssistant />
    </div>
  );
}
