'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Sparkles } from 'lucide-react';

export function LandingCTASection() {
  return (
    <section className="py-28 md:py-40 bg-[#07090e] border-t border-white/[0.06] relative overflow-hidden">
      
      {/* Soft Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[350px] bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 relative z-10 text-center space-y-8">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 font-mono text-xs shadow-sm">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>READY FOR DEPLOYMENT</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Make every camera <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-slate-200 bg-clip-text text-transparent">smarter.</span>
        </h2>

        <p className="text-slate-300 text-base sm:text-xl leading-relaxed max-w-2xl mx-auto">
          Turn passive CCTV footage into actionable security awareness with real-time risk scoring, 5-second triage, and human-in-the-loop control.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="https://github.com/manearyan5222/sentinel-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-colors"
          >
            <span>View Source on GitHub</span>
          </a>
        </div>

      </div>
    </section>
  );
}
