'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, Sparkles, ArrowRight, Zap, Check, X } from 'lucide-react';

export function LandingDetectSection() {
  const [activeView, setActiveView] = React.useState<'comparison' | 'legacy' | 'sentinel'>('comparison');

  return (
    <section id="detection" className="py-28 md:py-40 bg-[#07090e] border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-xs font-mono tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>02 // SPATIAL & CONTEXTUAL RECOGNITION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Detection is only <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent font-extrabold">the beginning.</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Legacy AI motion sensors spam security teams every time a tree sways or a resident walks their dog. SentinelAI combines vision with real-time spatial, temporal, and identity context.
          </p>

          {/* Minimal Interactive View Selector */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono">
              <button
                onClick={() => setActiveView('comparison')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeView === 'comparison'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Side-by-Side
              </button>
              <button
                onClick={() => setActiveView('legacy')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeView === 'legacy'
                    ? 'bg-slate-800 text-slate-200 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw Motion Noise
              </button>
              <button
                onClick={() => setActiveView('sentinel')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeView === 'sentinel'
                    ? 'bg-blue-950 text-blue-200 border border-blue-800/60 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sentinel Context Engine
              </button>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Legacy Motion/AI Card */}
          {(activeView === 'comparison' || activeView === 'legacy') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-6 sm:p-8 space-y-6 relative overflow-hidden glass-card"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                  <X className="w-4 h-4 text-rose-400" />
                  <span>Legacy Motion Detection</span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-slate-950 text-rose-400 border border-white/10 font-medium">
                  HIGH NOISE
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs text-slate-400">
                <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/[0.06] flex items-center justify-between">
                  <span>Person Motion (Frame #1024)</span>
                  <span className="text-rose-400 font-semibold">ALERT #4801</span>
                </div>
                <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/[0.06] flex items-center justify-between">
                  <span>Person Motion (Frame #1025)</span>
                  <span className="text-rose-400 font-semibold">ALERT #4802</span>
                </div>
                <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/[0.06] flex items-center justify-between opacity-40">
                  <span>Shadow Motion (Tree Sway)</span>
                  <span className="text-rose-400 font-semibold">ALERT #4803</span>
                </div>
              </div>

              <div className="pt-3 text-xs text-slate-400 italic border-t border-white/[0.06]">
                Result: Guard fatigue from 100+ meaningless phone alerts daily.
              </div>
            </motion.div>
          )}

          {/* SentinelAI Contextual Intelligence Card */}
          {(activeView === 'comparison' || activeView === 'sentinel') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border border-blue-500/30 bg-slate-900/60 p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-xl glass-card ${
                activeView === 'sentinel' ? 'md:col-span-2 max-w-2xl mx-auto' : ''
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>SentinelAI Context Engine</span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-medium">
                  CONTEXTUAL ALERTING
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-4 bg-[#0a0d14] rounded-xl border border-white/10 space-y-3 shadow-md">
                  <div className="flex items-center justify-between text-blue-300 font-bold">
                    <span>UNRECOGNIZED SUBJECT DETECTED</span>
                    <span className="text-emerald-400">TRACK #0104</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-2 pt-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Identity Cross-Check:</span>
                      <span className="text-amber-300 font-medium">UNRECOGNIZED (+25)</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Spatial Zone Check:</span>
                      <span className="text-rose-400 font-medium">RESTRICTED FENCE (+30)</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Temporal Dwell Time:</span>
                      <span className="text-amber-300 font-medium">24 SECONDS (+15)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 text-xs text-slate-300 font-medium border-t border-white/[0.06] flex items-center justify-between">
                <span>Single Prioritized Guard Triage Event</span>
                <span className="font-mono text-emerald-400 font-bold">RISK: 85/100</span>
              </div>

            </motion.div>
          )}

        </div>

      </div>
    </section>
  );
}
