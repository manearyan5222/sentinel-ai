'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Sparkles, ArrowRight, ShieldAlert, Cpu, Activity, Video, CheckCircle2, ChevronRight, Eye } from 'lucide-react';

export function LandingHero() {
  const [activeCam, setActiveCam] = useState<number>(0);
  const [alertTriggered, setAlertTriggered] = useState<boolean>(true);

  const cameraNames = [
    { name: 'Perimeter Fence South', zone: 'Restricted Boundary', risk: 85, level: 'HIGH RISK', track: 'Track #0104 (Unrecognized)', dwell: '24s', conf: '98.4%' },
    { name: 'Main Gate & Entry', zone: 'Access Intercom', risk: 60, level: 'ELEVATED', track: 'Track #0109 (Delivery Driver)', dwell: '12s', conf: '99.1%' },
    { name: 'Lobby Entrance', zone: 'Building A Reception', risk: 25, level: 'LOW RISK', track: 'Track #0102 (Resident Pass)', dwell: '4s', conf: '99.8%' },
    { name: 'Pool & Courtyard', zone: 'Amenities Area', risk: 40, level: 'MODERATE', track: 'Track #0110 (Guest Pass)', dwell: '18s', conf: '97.6%' },
  ];

  const currentCam = cameraNames[activeCam];

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-[#07090e]">
      
      {/* Soft, Restrained Background Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Editorial Subtitle Pill Badge */}
        <div className="flex justify-center mb-5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-xs font-mono tracking-wide shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>INTELLIGENT CCTV SECURITY LAYER</span>
          </motion.div>
        </div>

        {/* Hero Headline & Editorial Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.06]"
          >
            See threats before <br className="hidden sm:inline" />
            they become <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-slate-200 bg-clip-text text-transparent">incidents.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto"
          >
            SentinelAI turns everyday CCTV into intelligent security awareness — detecting unusual activity, understanding context, and helping teams respond faster.
          </motion.p>

          {/* Action CTAs - Primary CTA Visually Dominant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] border border-blue-500/40"
            >
              <span>Explore Security Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#see-threats"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 rounded-xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4 text-slate-400" />
              <span>How SentinelAI Works</span>
            </a>
          </motion.div>
        </div>

        {/* HERO PRODUCT VISUALIZER (Prominent Main Product Showcase) */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 md:mt-14 max-w-5xl xl:max-w-6xl mx-auto"
        >
          <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 p-3.5 sm:p-5 shadow-2xl backdrop-blur-xl overflow-hidden glass-card">
            
            {/* Visualizer Header Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] mb-3.5 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="ml-2 text-slate-300 font-semibold hidden sm:inline">
                  SENTINELAI :: LIVE RECOGNITION CANVAS
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10 font-medium hidden sm:inline">
                  YOLOv8 + CENTROID TRACKER
                </span>
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE VISION STREAM • 28 FPS
                </span>
              </div>
            </div>

            {/* Main CCTV Feed Representation */}
            <div className="relative rounded-xl overflow-hidden bg-[#0a0d14] aspect-[16/9] border border-white/10 flex flex-col justify-between p-4 sm:p-6">
              
              {/* Overlay Top Bar: Camera & Risk Score Indicator */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2 bg-slate-950/80 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="font-bold text-white uppercase">{currentCam.name}</span>
                  <span className="text-slate-400 hidden sm:inline">({currentCam.zone})</span>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs border font-bold transition-all backdrop-blur-md ${
                  currentCam.risk >= 75
                    ? 'bg-rose-950/80 text-rose-300 border-rose-600/80'
                    : currentCam.risk >= 50
                    ? 'bg-amber-950/80 text-amber-300 border-amber-600/80'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80'
                }`}>
                  <Activity className="w-3.5 h-3.5" />
                  <span>RISK SCORE: {currentCam.risk}/100 [{currentCam.level}]</span>
                </div>
              </div>

              {/* Central AI Object Bounding Box Frame */}
              <div className="relative my-auto flex items-center justify-center">
                <motion.div
                  key={activeCam}
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className={`relative p-8 sm:p-12 border rounded-xl backdrop-blur-sm ${
                    currentCam.risk >= 75
                      ? 'border-rose-500/80 bg-rose-950/15'
                      : currentCam.risk >= 50
                      ? 'border-amber-500/80 bg-amber-950/15'
                      : 'border-emerald-500/80 bg-emerald-950/15'
                  }`}
                >
                  {/* Subtle Reticle Corners */}
                  <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white/60" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white/60" />
                  <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white/60" />
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white/60" />

                  {/* Top Tag Box */}
                  <div className="absolute -top-7 left-0 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-white bg-slate-900 border border-slate-700">
                    {currentCam.track}
                  </div>

                  <div className="text-center space-y-1 font-mono text-xs">
                    <p className="text-slate-300">
                      DWELL: <span className="text-white font-bold">{currentCam.dwell}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      CONFIDENCE: <span className="text-emerald-400 font-semibold">{currentCam.conf}</span>
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Context Alert Banner */}
              {alertTriggered && (
                <motion.div
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="z-10 bg-slate-900/95 border border-white/10 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl backdrop-blur-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-950/90 border border-rose-700/60 text-rose-400">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-white uppercase tracking-wide block">
                        CONTEXT ALERT :: UNRECOGNIZED LOITERING DETECTED
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Subject loitering near restricted fence line for {currentCam.dwell}.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 whitespace-nowrap shadow-md transition-all hover:scale-[1.01]"
                  >
                    <span>View 5s Triage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              )}

            </div>

            {/* Interactive Camera Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5">
              {cameraNames.map((cam, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveCam(idx);
                    setAlertTriggered(true);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all font-mono text-xs ${
                    activeCam === idx
                      ? 'bg-slate-800/90 border-blue-500/80 text-white shadow-md'
                      : 'bg-[#0a0d14] border-white/[0.05] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>CAM 0{idx + 1}</span>
                    <span className={cam.risk >= 75 ? 'text-rose-400 font-bold' : cam.risk >= 50 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {cam.risk}/100
                    </span>
                  </div>
                  <span className="font-semibold block truncate">{cam.name}</span>
                </button>
              ))}
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
