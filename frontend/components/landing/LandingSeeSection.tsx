'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Shield, Video, Layers, CheckCircle2, Scan } from 'lucide-react';

export function LandingSeeSection() {
  return (
    <section id="see-threats" className="py-28 md:py-40 bg-[#07090e] border-t border-white/[0.06] relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-xs font-mono tracking-wide shadow-sm">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>01 // CONTINUOUS MULTI-STREAM VISION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Your cameras see everything. <br />
            <span className="text-blue-400 font-extrabold">SentinelAI helps you understand it.</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Existing residential security systems record terabytes of unread video. SentinelAI turns raw CCTV camera feeds into real-time, structured spatial intelligence without changing your existing cameras.
          </p>
        </div>

        {/* Product Feature Visual Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Vision Feature Cards */}
          <div className="lg:col-span-5 space-y-5">
            
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.06] hover:border-white/15 transition-all space-y-3 glass-card">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Video className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Camera Simultaneous Analysis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect RTSP, webcam, or video feeds. SentinelAI tracks entities simultaneously across perimeter fences, main gates, lobbies, and amenity zones.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.06] hover:border-white/15 transition-all space-y-3 glass-card">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Scan className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Centroid Multi-Person Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assigns persistent track IDs (`Track #0104`) to people across frames, calculating exact loitering duration and trajectory.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.06] hover:border-white/15 transition-all space-y-3 glass-card">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Restricted Zone Boundaries</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Define restricted polygon zones. SentinelAI instantly flags unauthorized boundary crossings while ignoring normal traffic in authorized sectors.
              </p>
            </div>

          </div>

          {/* Right Column: Grid Showcase Visualizer */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-xl space-y-4 glass-card">
              
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/[0.06] pb-3">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>MONITORING GRID :: 4 STREAMS ACTIVE</span>
                </span>
                <span className="text-blue-400 font-semibold">YOLO REALTIME STREAM</span>
              </div>

              {/* 2x2 Grid Visualization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div className="relative rounded-xl overflow-hidden bg-[#0a0d14] border border-white/10 aspect-[16/9] p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-black/60 text-white border border-white/10">Cam 01: Main Gate</span>
                    <span className="text-emerald-400 font-semibold">RISK: 25 (LOW)</span>
                  </div>
                  <div className="self-center p-3 border border-emerald-500/40 rounded-lg bg-emerald-950/20 text-center">
                    <span className="text-[10px] font-mono text-emerald-300 font-bold block">Track #0102 [Resident]</span>
                    <span className="text-[9px] font-mono text-slate-400">Pass Validated</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">RESIDENT MATCH :: DR. SARAH JENKINS</div>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-[#0a0d14] border border-rose-500/40 aspect-[16/9] p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700/60 font-bold">Cam 02: Fence South</span>
                    <span className="text-rose-400 font-bold">RISK: 85 (HIGH)</span>
                  </div>
                  <div className="self-center p-3 border border-rose-500/80 rounded-lg bg-rose-950/30 text-center">
                    <span className="text-[10px] font-mono text-white font-bold block">Track #0104 [UNRECOGNIZED]</span>
                    <span className="text-[9px] font-mono text-rose-300">Dwell: 24s (Restricted)</span>
                  </div>
                  <div className="text-[9px] font-mono text-rose-400 font-semibold">RESTRICTED BOUNDARY BREACH</div>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-[#0a0d14] border border-white/10 aspect-[16/9] p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-black/60 text-white border border-white/10">Cam 03: Lobby</span>
                    <span className="text-slate-400">RISK: 20 (LOW)</span>
                  </div>
                  <div className="self-center p-3 border border-slate-700/60 rounded-lg bg-slate-900 text-center">
                    <span className="text-[10px] font-mono text-slate-200 block">Track #0108 [Visitor Pass]</span>
                    <span className="text-[9px] font-mono text-slate-400">Reception Check-in</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">EXPECTED VISITOR :: COURIER</div>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-[#0a0d14] border border-amber-500/30 aspect-[16/9] p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">Cam 04: Pool Area</span>
                    <span className="text-amber-400 font-bold">RISK: 40 (MODERATE)</span>
                  </div>
                  <div className="self-center p-3 border border-amber-500/50 rounded-lg bg-amber-950/20 text-center">
                    <span className="text-[10px] font-mono text-amber-300 font-bold block">Track #0110 [Unknown]</span>
                    <span className="text-[9px] font-mono text-slate-400">Dwell: 18s</span>
                  </div>
                  <div className="text-[9px] font-mono text-amber-400">EXTENDED DWELL TIME DETECTED</div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
