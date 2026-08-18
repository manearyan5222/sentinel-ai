'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, QrCode, Shield, CheckCircle } from 'lucide-react';

export function LandingVisitorSection() {
  return (
    <section className="py-24 md:py-36 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-950/80 border border-blue-800 text-blue-400 text-xs font-mono font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>07 // VISITOR INTELLIGENCE & ACCESS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Pre-registered access. <br />
              <span className="text-blue-400">Zero false intruder flags.</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Residents pre-register guests, contractors, and delivery drivers in seconds. When expected visitors arrive at the main gate, SentinelAI cross-references their unit clearance pass to avoid unnecessary guard dispatch.
            </p>

            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant QR pass validation for unit hosts</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Resident Face Embedding Whitelist</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>License plate & vehicle registration tracking</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-mono">
                <span className="font-bold text-white uppercase">PRE-REGISTERED VISITOR PASS</span>
                <span className="text-emerald-400 font-bold">STATUS: CHECKED_IN</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">Robert Chen</div>
                    <div className="text-slate-400 text-[11px] font-mono">Host: Dr. Sarah Jenkins (Unit A-402)</div>
                  </div>
                  <div className="p-2 bg-blue-950 rounded-lg border border-blue-800 text-blue-400">
                    <QrCode className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block">LICENSE PLATE</span>
                    <span className="font-bold text-slate-100">NY-4591</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">PASS DURATION</span>
                    <span className="font-bold text-emerald-400">VALID 24 HOURS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
