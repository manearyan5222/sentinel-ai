'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ShieldAlert, Sparkles, HelpCircle, MapPin, Clock, FileText, ChevronRight, UserCheck, ShieldX } from 'lucide-react';

export function LandingAlertSection() {
  const [activeTab, setActiveTab] = useState<'standard' | 'gemini'>('standard');
  const [triageState, setTriageState] = useState<'pending' | 'legitimate' | 'escalated'>('pending');

  return (
    <section id="alerts-triage" className="py-28 md:py-40 bg-[#07090e] border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-xs font-mono tracking-wide shadow-sm">
            <Bell className="w-3.5 h-3.5 text-blue-400" />
            <span>04 // 5-SECOND UX TRIAGE PROTOCOL</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Designed for 5-second <br />
            <span className="text-blue-400 font-extrabold">guard decision response.</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            When an elevated risk is flagged, guards don&apos;t have time to scrub 10-minute video files. SentinelAI presents instant context: Who, Where, When, What, Why, and What To Do.
          </p>

        </div>

        {/* Triage Protocol Interactive Card Showcase */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl overflow-hidden glass-card">
            
            {/* Header Alert Ribbon */}
            <div className="px-6 py-4 bg-slate-950/90 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-700/60 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm tracking-wide uppercase text-white">
                      HIGH RISK INCIDENT TRIAGE
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono text-xs bg-slate-900 border border-white/10 font-bold text-rose-300">
                      SCORE: 85/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Human-in-the-Loop Protocol • Flagged for Guard Inspection
                  </p>
                </div>
              </div>

              {/* View Toggle Tabs */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('standard')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'standard' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  5-Sec Rule
                </button>
                <button
                  onClick={() => setActiveTab('gemini')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    activeTab === 'gemini' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Gemini AI</span>
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 space-y-6 text-slate-200">
              
              {/* Quick Context Summary Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#0a0d14] border border-white/[0.06] rounded-xl font-mono text-xs">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">WHO</span>
                    <span className="font-bold text-slate-100">UNRECOGNIZED</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">WHERE</span>
                    <span className="font-bold text-slate-100">Perimeter Fence South</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">WHEN / DWELL</span>
                    <span className="font-bold text-slate-100">10:42:15 PM (24s)</span>
                  </div>
                </div>
              </div>

              {activeTab === 'standard' ? (
                /* Standard 5-Sec Rule Content */
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 bg-[#0a0d14] border border-white/[0.06] rounded-xl space-y-1">
                    <div className="flex items-center gap-2 font-bold text-blue-400 tracking-wider uppercase text-[11px]">
                      <FileText className="w-4 h-4" />
                      <span>WHAT HAPPENED</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-6">
                      Person loitering near restricted fence boundary for 24s with no registered visitor clearance.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#0a0d14] border border-white/[0.06] rounded-xl space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-300 tracking-wider uppercase text-[11px]">
                      <ShieldAlert className="w-4 h-4" />
                      <span>WHY FLAGGED (RISK FACTORS)</span>
                    </div>
                    <ul className="pl-6 space-y-1 font-mono text-[11px] text-slate-300">
                      <li>• Unrecognized Person (+25)</li>
                      <li>• Restricted Zone Breach (+30)</li>
                      <li>• Extended Dwell Time 24s (+15)</li>
                      <li>• No Visitor Clearance (+15)</li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-blue-950/20 border border-blue-800/40 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 font-bold text-emerald-400 tracking-wider uppercase text-[11px]">
                      <ChevronRight className="w-4 h-4" />
                      <span>RECOMMENDED ACTION PROTOCOL</span>
                    </div>
                    <p className="text-emerald-200 font-semibold leading-relaxed pl-6">
                      Dispatch patrol guard to verify identity or escort off premises.
                    </p>
                  </div>
                </div>
              ) : (
                /* Gemini AI Intelligence Content */
                <div className="p-4 bg-indigo-950/20 border border-indigo-800/40 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>GEMINI AI INTELLIGENCE SUMMARY</span>
                  </div>
                  <div className="space-y-2 pl-6 text-slate-300">
                    <p><strong className="text-indigo-300 font-mono">Summary:</strong> Subject approached south boundary fence at 10:42 PM and hovered near restricted gate area for 24 seconds.</p>
                    <p><strong className="text-amber-300 font-mono">Risk Explanation:</strong> Automated score 85/100 due to restricted zone entry combined with loitering and lack of resident face match.</p>
                    <p><strong className="text-emerald-300 font-mono">Recommended Action:</strong> Radio boundary guard unit to inspect credentials.</p>
                    <p className="text-[11px] text-slate-400 italic font-mono pt-1">Caveat: Non-accusatory verification model; decision remains with human guard.</p>
                  </div>
                </div>
              )}

              {/* Triage Status Feedback Alert */}
              {triageState !== 'pending' && (
                <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between animate-fade-in ${
                  triageState === 'legitimate'
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-600 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {triageState === 'legitimate' ? <UserCheck className="w-4 h-4" /> : <ShieldX className="w-4 h-4" />}
                    <span>
                      {triageState === 'legitimate'
                        ? 'DECISION SAVED: LEGITIMATE ACTIVITY VERIFIED BY GUARD'
                        : 'DECISION SAVED: INCIDENT ESCALATED TO PATROL GUARD'}
                    </span>
                  </div>
                  <button
                    onClick={() => setTriageState('pending')}
                    className="text-[10px] underline font-bold"
                  >
                    Reset Simulator
                  </button>
                </div>
              )}

              {/* Action Buttons Footer Preview */}
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-slate-400">
                  Try clicking a decision button below to test triage workflow:
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTriageState('legitimate')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all hover:scale-[1.01]"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>MARK LEGITIMATE</span>
                  </button>
                  <button
                    onClick={() => setTriageState('escalated')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-md uppercase tracking-wider transition-all hover:scale-[1.01]"
                  >
                    <ShieldX className="w-4 h-4" />
                    <span>ESCALATE INCIDENT</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
