'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, Eye, Cpu, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function LandingHumanReviewSection() {
  const steps = [
    { title: '1. CCTV Stream Input', desc: 'Continuous RTSP camera stream ingested locally.', icon: Eye, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { title: '2. Local AI Analysis', desc: 'YOLOv8 + Centroid Tracker + 0-100 Risk Engine.', icon: Cpu, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { title: '3. Alert Dispatch', desc: 'Real-time WebSocket push to SOC guard dashboard.', icon: ShieldAlert, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { title: '4. Human Triage', desc: 'Guard reviews 5s protocol & Gemini AI summary.', icon: UserCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { title: '5. Action Execution', desc: 'Mark Legitimate or Escalate to security patrol.', icon: CheckCircle2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  ];

  return (
    <section id="human-review" className="py-28 md:py-40 bg-[#07090e] border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-xs font-mono tracking-wide shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>05 // HUMAN-IN-THE-LOOP ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            AI detects. <br />
            <span className="text-emerald-400 font-extrabold">Humans decide.</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            SentinelAI is an assistance layer, not an autonomous judge. It never determines guilt. AI prioritizes elevated risk events so human guards can make informed decisions in seconds.
          </p>
        </div>

        {/* 5-Step Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.06] hover:border-white/15 transition-all flex flex-col justify-between space-y-4 relative group glass-card"
              >
                <div className="space-y-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${step.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust Manifesto Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs glass-card">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-slate-300 leading-relaxed">
              <strong>SentinelAI Core Guarantee:</strong> Zero autonomous law-enforcement dispatch. All alerts require human verification.
            </span>
          </div>
          <span className="px-3 py-1 bg-[#0a0d14] rounded-lg border border-white/10 text-blue-400 font-semibold whitespace-nowrap">
            100% GUARD CONTROL
          </span>
        </div>

      </div>
    </section>
  );
}
