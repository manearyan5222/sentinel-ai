'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Server, Wifi, Database, Sparkles, Layout } from 'lucide-react';

export function LandingSystemSection() {
  const techComponents = [
    { title: 'Local Camera Stream', desc: 'RTSP / Webcam / Video MP4', icon: Server, color: 'text-blue-400' },
    { title: 'Python FastAPI Core', desc: 'OpenCV + Ultralytics YOLOv8', icon: Cpu, color: 'text-purple-400' },
    { title: 'SQLite + WebSockets', desc: 'Real-Time Alert Broadcast', icon: Wifi, color: 'text-emerald-400' },
    { title: 'Google Gemini AI', desc: 'Non-blocking AI Decision Layer', icon: Sparkles, color: 'text-amber-400' },
    { title: 'Next.js 14 SOC UI', desc: 'Guard Triage & Dashboard', icon: Layout, color: 'text-blue-400' },
  ];

  return (
    <section className="py-24 md:py-36 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-950/80 border border-blue-800 text-blue-400 text-xs font-mono font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>09 // WINDOWS-NATIVE HIGH PERFORMANCE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Built for speed, privacy, <br />
            <span className="text-blue-400">and zero container overhead.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            SentinelAI runs natively on Windows 10/11 with zero Docker overhead. Automatically detects NVIDIA CUDA GPUs with CPU fallback.
          </p>
        </div>

        {/* Technical Pipeline Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {techComponents.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 font-mono text-xs hover:border-slate-700 transition-all"
              >
                <div className={`w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-bold text-white leading-tight">{c.title}</div>
                <div className="text-[11px] text-slate-400">{c.desc}</div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
