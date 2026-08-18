'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Video, Bell, Users, BarChart3, ArrowRight, Shield, Cpu, Activity, Sparkles } from 'lucide-react';

export function LandingDashboardShowcase() {
  const [activeTab, setActiveTab] = useState<'grid' | 'alerts' | 'visitors' | 'analytics'>('grid');

  return (
    <section id="dashboard-showcase" className="py-28 md:py-40 bg-[#07090e] border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-xs font-mono tracking-wide shadow-sm">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>06 // UNIFIED SOC PLATFORM</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Built for modern <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent font-extrabold">
              Security Operations Centers.
            </span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            From multi-stream live monitoring to pre-registered visitor access passes and incident analytics, SentinelAI provides a unified SOC workspace.
          </p>
        </div>

        {/* Product Showcase Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-white/10 text-xs font-medium">
            <button
              onClick={() => setActiveTab('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'grid'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Live Grid</span>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'alerts'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Alert Center</span>
            </button>
            <button
              onClick={() => setActiveTab('visitors')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'visitors'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Visitors</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* Showcase Canvas Frame */}
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl glass-card">
            
            {/* Active Tab Showcase View */}
            {activeTab === 'grid' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-3 border-b border-white/[0.06]">
                  <span className="text-white font-semibold">SOC LIVE MONITORING GRID</span>
                  <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    REALTIME STREAM ACTIVE
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#0a0d14] border border-white/10 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white font-semibold">Main Gate & Entry</span>
                      <span className="text-emerald-400">Cam 01</span>
                    </div>
                    <div className="h-28 bg-slate-900/80 rounded-lg flex items-center justify-center text-xs font-mono text-slate-400 border border-white/[0.06]">
                      [LIVE STREAM 01 :: TRACK #0102]
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0a0d14] border border-rose-500/40 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-rose-400 font-semibold">Perimeter Fence South</span>
                      <span className="text-rose-400 font-bold">RISK: 85</span>
                    </div>
                    <div className="h-28 bg-rose-950/20 rounded-lg flex items-center justify-center text-xs font-mono text-rose-300 border border-rose-800/40">
                      [UNRECOGNIZED LOITERING 24s]
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'alerts' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 pb-3 border-b border-white/[0.06]">
                  <span className="text-white font-semibold">SECURITY ALERT CENTER & LOGS</span>
                  <span>FILTER: ALL INCIDENTS</span>
                </div>
                <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">Track #0104 (Unrecognized Person)</div>
                    <div className="text-slate-400 text-[11px]">Perimeter Fence South • Risk Score: 85 (HIGH)</div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-[10px]">ACTIVE</span>
                </div>
                <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">Track #0109 (Delivery Driver)</div>
                    <div className="text-slate-400 text-[11px]">Main Gate Intercom • Risk Score: 60 (ELEVATED)</div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold text-[10px]">LEGITIMATE</span>
                </div>
              </motion.div>
            )}

            {activeTab === 'visitors' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400 pb-3 border-b border-white/[0.06]">
                  <span className="text-white font-semibold">AUTHORIZED RESIDENT & VISITOR DIRECTORY</span>
                  <span className="text-blue-400">3 RESIDENTS • 2 VISITORS</span>
                </div>
                <div className="p-3 bg-[#0a0d14] rounded-xl border border-white/10 space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span>Dr. Sarah Jenkins</span>
                    <span className="text-blue-400">RESIDENT (Unit A-402)</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">Full Access Clearance • Vehicle #CA-9801</div>
                </div>
                <div className="p-3 bg-[#0a0d14] rounded-xl border border-white/10 space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span>Robert Chen</span>
                    <span className="text-amber-300">EXPECTED VISITOR</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">Host: Dr. Sarah Jenkins • Vehicle #NY-4591</div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400 pb-3 border-b border-white/[0.06]">
                  <span className="text-white font-semibold">SECURITY OPERATIONS ANALYTICS</span>
                  <span className="text-emerald-400">AVG TRIAGE TIME: 3.8s</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">AVG RISK SCORE</span>
                    <span className="text-lg font-bold text-amber-300">42.5 / 100</span>
                  </div>
                  <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">TODAY EVENTS</span>
                    <span className="text-lg font-bold text-blue-400">155 DETECTED</span>
                  </div>
                  <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">HIGH FLAGS</span>
                    <span className="text-lg font-bold text-rose-400">8 INCIDENTS</span>
                  </div>
                  <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">AUTO TRACKING</span>
                    <span className="text-lg font-bold text-emerald-400">98.2% ACCURACY</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CTA Bar below showcase */}
            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Live interactive data populated directly from SQLite & FastAPI engine.
              </span>
              <Link
                href="/dashboard"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all hover:scale-[1.01] ml-auto"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
