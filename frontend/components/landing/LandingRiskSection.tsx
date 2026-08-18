'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, CheckSquare, Plus, AlertTriangle, Lock } from 'lucide-react';

export function LandingRiskSection() {
  const [selectedFactors, setSelectedFactors] = useState<{ [key: string]: boolean }>({
    unrecognized: true,
    restrictedZone: true,
    dwellTime: true,
    noVisitorPass: false,
  });

  const factors = [
    { key: 'unrecognized', label: 'Unrecognized Person (No Resident Face Match)', points: 25, color: 'text-amber-400' },
    { key: 'restrictedZone', label: 'Restricted Perimeter Zone Breach', points: 30, color: 'text-rose-400' },
    { key: 'dwellTime', label: 'Extended Dwell Duration (>15 Seconds)', points: 15, color: 'text-amber-400' },
    { key: 'noVisitorPass', label: 'No Active Pre-Registered Visitor Pass', points: 20, color: 'text-blue-400' },
  ];

  const totalScore = factors.reduce((sum, f) => sum + (selectedFactors[f.key] ? f.points : 0), 0);

  const getRiskLevel = (score: number) => {
    if (score >= 75) return { level: 'HIGH', color: 'text-rose-300 border-rose-600/80 bg-rose-950/50' };
    if (score >= 50) return { level: 'ELEVATED', color: 'text-amber-300 border-amber-600/80 bg-amber-950/50' };
    if (score >= 30) return { level: 'MODERATE', color: 'text-yellow-300 border-yellow-600/80 bg-yellow-950/50' };
    return { level: 'LOW', color: 'text-emerald-300 border-emerald-600/80 bg-emerald-950/50' };
  };

  const riskInfo = getRiskLevel(totalScore);

  return (
    <section id="risk-analysis" className="py-28 md:py-40 bg-[#07090e] border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-xs font-mono tracking-wide shadow-sm">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>03 // DETERMINISTIC RISK SCORING</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Transparent 0–100 <br />
            <span className="text-blue-400 font-extrabold">Contextual Risk Engine.</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            SentinelAI does not use black-box magic. Every alert risk score is computed deterministically from transparent spatial, temporal, and credential rules.
          </p>
        </div>

        {/* Interactive Risk Score Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Rule Factor Checkboxes */}
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              Toggle Rule Factors to Simulate Risk Calculation:
            </p>

            {factors.map((f) => {
              const isChecked = selectedFactors[f.key];
              return (
                <div
                  key={f.key}
                  onClick={() =>
                    setSelectedFactors((prev) => ({ ...prev, [f.key]: !prev[f.key] }))
                  }
                  className={`p-4.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between font-mono text-xs ${
                    isChecked
                      ? 'bg-slate-900 border-white/15 text-white glass-card'
                      : 'bg-[#0a0d14] border-white/[0.06] text-slate-400 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      isChecked ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 bg-slate-950'
                    }`}>
                      {isChecked && <CheckSquare className="w-3.5 h-3.5" />}
                    </div>
                    <span className={isChecked ? 'text-slate-100 font-semibold' : 'text-slate-400'}>
                      {f.label}
                    </span>
                  </div>
                  <span className={`font-bold ${f.color}`}>+{f.points} PTS</span>
                </div>
              );
            })}

            <div className="pt-2 text-[11px] text-slate-400 font-mono italic">
              * Note: Risk scores serve strictly as decision support metrics for human guard triage.
            </div>
          </div>

          {/* Right Column: Computed Output Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 space-y-6 text-center shadow-2xl backdrop-blur-xl glass-card">
              
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">
                INCIDENT RISK SCORE
              </span>

              <div className="space-y-3">
                <div className="text-6xl sm:text-7xl font-black text-white font-mono tracking-tight">
                  {totalScore}<span className="text-2xl text-slate-400">/100</span>
                </div>
                <div className={`inline-block px-4 py-1.5 rounded-full border font-mono font-bold text-xs tracking-wider ${riskInfo.color}`}>
                  PRIORITY: {riskInfo.level}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] text-left text-xs space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Triggered Protocol Recommendation:</span>
                <p className="text-slate-200 leading-relaxed font-semibold">
                  {totalScore >= 75
                    ? 'Dispatch security guard immediately for visual verification at Perimeter Fence South.'
                    : totalScore >= 50
                    ? 'Check camera feed and verify resident directory for expected visitor check-ins.'
                    : 'Log event for routine audit. No immediate dispatch required.'}
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
