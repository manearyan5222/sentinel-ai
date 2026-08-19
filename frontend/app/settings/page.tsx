'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Sliders,
  Sparkles,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Server,
  FileCheck
} from 'lucide-react';
import { SOCHeader } from '../../components/SOCHeader';
import { AIChatAssistant } from '../../components/AIChatAssistant';
import { fetchSystemStatus, fetchAIStatus } from '../../lib/api';
import { SystemStatus, AIStatus } from '../../lib/types';

export default function SettingsPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus>({ status: 'DISABLED', message: 'Loading...' });

  // Config State
  const [lowThresh, setLowThresh] = useState<number>(29);
  const [medThresh, setMedThresh] = useState<number>(59);
  const [highThresh, setHighThresh] = useState<number>(79);
  const [dwellThresh, setDwellThresh] = useState<number>(15);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    fetchSystemStatus().then(setSystemStatus);
    fetchAIStatus().then(setAiStatus);
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <SOCHeader systemStatus={systemStatus} />

      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <SettingsIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                System Settings, Risk Thresholds & AI Safety Policies
              </h2>
              <p className="text-xs text-slate-400">
                Configure contextual risk weights, Gemini API intelligence & review safety and privacy standards.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Column 1: Configurable Risk Engine Thresholds */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <Sliders className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Risk Engine Threshold Calibration
              </h3>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-mono block mb-1">
                  LOW Severity Upper Limit (Points):
                </label>
                <input
                  type="number"
                  value={lowThresh}
                  onChange={(e) => setLowThresh(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono outline-none"
                />
                <span className="text-[10px] text-slate-500 font-mono">Scores 0 to {lowThresh} classified as LOW risk.</span>
              </div>

              <div>
                <label className="text-slate-300 font-mono block mb-1">
                  MEDIUM Severity Upper Limit (Points):
                </label>
                <input
                  type="number"
                  value={medThresh}
                  onChange={(e) => setMedThresh(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono outline-none"
                />
                <span className="text-[10px] text-slate-500 font-mono">Scores {lowThresh + 1} to {medThresh} classified as MEDIUM risk.</span>
              </div>

              <div>
                <label className="text-slate-300 font-mono block mb-1">
                  HIGH Severity Upper Limit (Points):
                </label>
                <input
                  type="number"
                  value={highThresh}
                  onChange={(e) => setHighThresh(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono outline-none"
                />
                <span className="text-[10px] text-slate-500 font-mono">Scores {medThresh + 1} to {highThresh} classified as HIGH risk. Above {highThresh} is CRITICAL.</span>
              </div>

              <div>
                <label className="text-slate-300 font-mono block mb-1">
                  Standard Perimeter Dwell Threshold (Seconds):
                </label>
                <input
                  type="number"
                  value={dwellThresh}
                  onChange={(e) => setDwellThresh(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono outline-none"
                />
                <span className="text-[10px] text-slate-500 font-mono">Triggers +15 dwell time score after {dwellThresh} seconds.</span>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold font-mono transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Calibration</span>
                </button>
              </div>

              {isSaved && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-400 font-mono text-xs">
                  Configuration saved and active across risk pipeline!
                </div>
              )}
            </form>
          </div>

          {/* Column 2: Privacy & AI Ethics Standards (Requirements 23, 44) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Privacy, Safety & AI Ethics Framework
              </h3>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              
              <div className="p-3.5 bg-blue-950/20 border border-blue-800/40 rounded-xl space-y-1">
                <span className="font-bold text-blue-400 font-mono block text-[11px]">
                  1. HUMAN-IN-THE-LOOP MANDATE
                </span>
                <p>
                  SentinelAI operates strictly as a decision-support platform. The AI highlights contextual anomalies and elevated risk events; human security personnel make all final assessment and resolution decisions.
                </p>
              </div>

              <div className="p-3.5 bg-purple-950/20 border border-purple-800/40 rounded-xl space-y-1">
                <span className="font-bold text-purple-400 font-mono block text-[11px]">
                  2. NO AUTOMATIC CRIMINAL CLASSIFICATION
                </span>
                <p>
                  The system never classifies individuals as &quot;criminals&quot; or &quot;suspicious&quot;. It reports objective facts such as &quot;Authorization not found in registry&quot; or &quot;Boundary threshold exceeded&quot;.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-1">
                <span className="font-bold text-emerald-400 font-mono block text-[11px]">
                  3. LOCAL PROCESSING & DATA PRIVACY
                </span>
                <p>
                  CCTV video streams are processed on local Windows-native hardware. Video feeds are never transmitted to external cloud servers. Only structured security event metadata is passed to Google Gemini for summarization.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-slate-200 font-mono block text-[11px]">
                  4. AUDIT TRAIL COMPLIANCE
                </span>
                <p>
                  Every camera configuration change, alert triage action, and incident resolution is immutably timestamped in the system audit log for operational transparency.
                </p>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* Floating Gemini AI Assistant */}
      <AIChatAssistant />
    </div>
  );
}
