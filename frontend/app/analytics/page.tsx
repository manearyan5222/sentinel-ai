'use client';

import React, { useState, useEffect } from 'react';
import { SOCHeader } from '../../components/SOCHeader';
import { AnalyticsCharts } from '../../components/AnalyticsCharts';
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
    <div className="flex-1 flex flex-col bg-slate-950">
      <SOCHeader systemStatus={systemStatus} isConnected={true} activeAlertCount={0} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-100">
              SOC SECURITY OPERATIONS ANALYTICS
            </h2>
            <p className="text-xs text-slate-400">
              Historical computer vision detection metrics, risk score trends, and false alarm reduction stats.
            </p>
          </div>
        </div>

        {analytics && <AnalyticsCharts data={analytics} />}
      </main>
    </div>
  );
}
