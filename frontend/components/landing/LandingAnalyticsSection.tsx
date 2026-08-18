'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, ShieldCheck, Clock } from 'lucide-react';

export function LandingAnalyticsSection() {
  return (
    <section className="py-24 md:py-36 bg-slate-950/80 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-950/80 border border-purple-800 text-purple-400 text-xs font-mono font-semibold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>08 // INCIDENT ANALYTICS & METRICS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Turn video streams into <br />
            <span className="text-purple-400">actionable security analytics.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Understand peak activity hours, track false alarm reductions, and audit security team response speeds across all monitored perimeter zones.
          </p>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-white font-mono">3.8 Seconds</div>
            <div className="text-xs font-bold text-slate-200">Average Guard Triage Speed</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              5-Second UX Protocol reduces alert response time by 84% compared to scrubbing raw video timelines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-white font-mono">92% Reduction</div>
            <div className="text-xs font-bold text-slate-200">False Alarm Suppression</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spatial zone rules and dwell thresholds prevent false alerts triggered by animals or weather.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-white font-mono">100% Audit Log</div>
            <div className="text-xs font-bold text-slate-200">Persistent Triage Record</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every alert resolution (Legitimate vs Escalated) is stored in SQLite for security compliance audits.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
