'use client';

import React, { useState, useEffect } from 'react';
import { Alert, DetectionEvent, AIExplanation } from '../lib/types';
import { explainAlert } from '../lib/api';
import { ShieldAlert, UserCheck, AlertTriangle, Clock, MapPin, ShieldX, HelpCircle, FileText, ChevronRight, X, Sparkles, RefreshCw, CheckSquare } from 'lucide-react';

interface AlertTriageModalProps {
  alert: Alert | DetectionEvent | null;
  onClose: () => void;
  onResolveAlert?: (alertId: string, status: 'LEGITIMATE' | 'ESCALATED', notes: string) => void;
  onAction?: (alertId: string, status: string, notes?: string) => void;
}

export function AlertTriageModal({ alert, onClose, onResolveAlert, onAction }: AlertTriageModalProps) {
  const [guardNotes, setGuardNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    setAiExplanation(null);
    setGuardNotes('');
    if (alert && 'ai_explanation' in alert && alert.ai_explanation) {
      setAiExplanation(alert.ai_explanation);
    }
  }, [alert]);

  if (!alert) return null;

  // Standardize alert vs detection fields
  const isAlertObj = 'action_protocol' in alert;
  const alertId = alert.id;
  const riskScore = alert.risk_score;
  const riskLevel = alert.risk_level;
  const cameraName = alert.camera_name;
  const locationZone = alert.location_zone;
  const rawTimestamp = 'timestamp' in alert ? alert.timestamp : alert.created_at;
  const timestamp = new Date(rawTimestamp).toLocaleTimeString();
  const identityType = alert.identity_type;
  const reasons = alert.risk_reasons || [];
  const trackId = 'track_id' in alert ? alert.track_id : alert.entity_label || 'Track #0104';
  const dwellSeconds = alert.dwell_time_seconds || 24;

  const protocol = isAlertObj ? alert.action_protocol : {
    who: `Unrecognized Person (${trackId})`,
    where: `${cameraName} (${locationZone})`,
    when: `${timestamp} (Dwell: ${dwellSeconds}s)`,
    what: 'Detected unrecognized subject loitering in monitored security zone.',
    why: reasons,
    recommended_action: 'Dispatch security patrol guard to check credentials and assist subject.',
  };

  const handleFetchAiExplanation = async (forceRefresh = false) => {
    setIsLoadingAi(true);
    try {
      const result = await explainAlert(alertId, forceRefresh);
      setAiExplanation(result);
    } catch (e) {
      console.error('Failed to generate AI explanation', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleAction = async (status: 'LEGITIMATE' | 'ESCALATED') => {
    setIsSubmitting(true);
    if (onResolveAlert) {
      await onResolveAlert(alertId, status, guardNotes);
    } else if (onAction) {
      await onAction(alertId, status, guardNotes);
    }
    setIsSubmitting(false);
    onClose();
  };


  const getRiskHeaderColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-rose-950/80 border-rose-600 text-rose-300';
      case 'ELEVATED': return 'bg-amber-950/80 border-amber-600 text-amber-300';
      case 'MODERATE': return 'bg-yellow-950/80 border-yellow-600 text-yellow-300';
      default: return 'bg-emerald-950/80 border-emerald-600 text-emerald-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Alert Ribbon */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${getRiskHeaderColor(riskLevel)}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-black/40 border border-white/10">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wide uppercase">
                  {riskLevel} RISK INCIDENT TRIAGE
                </span>
                <span className="px-2 py-0.5 rounded font-mono text-xs bg-black/50 border border-white/20 font-bold">
                  SCORE: {riskScore}/100
                </span>
              </div>
              <p className="text-xs opacity-80">
                Human-in-the-Loop Protocol • Flagged for Guard Inspection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/30 hover:bg-black/60 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-SECOND UX RULE CONTENT GRID */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          
          {/* Quick Context Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-slate-400 text-[10px] block">WHO</span>
                <span className="font-bold text-slate-100">{identityType}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-slate-400 text-[10px] block">WHERE</span>
                <span className="font-bold text-slate-100">{cameraName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-slate-400 text-[10px] block">WHEN / DWELL</span>
                <span className="font-bold text-slate-100">{timestamp} ({dwellSeconds}s)</span>
              </div>
            </div>
          </div>

          {/* Core 5-Second Breakdown Sections */}
          <div className="space-y-4 text-xs">
            
            {/* WHAT HAPPENED */}
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-blue-400 tracking-wider uppercase text-[11px]">
                <FileText className="w-4 h-4" />
                <span>WHAT HAPPENED</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-6">
                {protocol.what}
              </p>
            </div>

            {/* WHY FLAGGED (Scoring Factor Rules) */}
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400 tracking-wider uppercase text-[11px]">
                <AlertTriangle className="w-4 h-4" />
                <span>WHY FLAGGED (RISK SCORING FACTORS)</span>
              </div>
              <ul className="pl-6 space-y-1.5 font-mono text-[11px]">
                {reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-amber-200/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* WHAT TO DO (Recommended Guard Protocol) */}
            <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-400 tracking-wider uppercase text-[11px]">
                <ChevronRight className="w-4 h-4" />
                <span>RECOMMENDED ACTION PROTOCOL</span>
              </div>
              <p className="text-emerald-200 font-semibold leading-relaxed pl-6">
                {protocol.recommended_action}
              </p>
            </div>

            {/* GEMINI AI ANALYSIS SECTION */}
            <div className="p-4 bg-purple-950/20 border border-purple-800/50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-purple-300 tracking-wider uppercase text-[11px]">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span>GEMINI AI INTELLIGENCE ANALYSIS</span>
                </div>

                {!aiExplanation ? (
                  <button
                    disabled={isLoadingAi}
                    onClick={() => handleFetchAiExplanation(false)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                    <span>{isLoadingAi ? 'Analyzing...' : 'Generate AI Analysis'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {aiExplanation.cached && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-900/60 text-purple-200 border border-purple-700">
                        Cached DB Result
                      </span>
                    )}
                    <button
                      disabled={isLoadingAi}
                      onClick={() => handleFetchAiExplanation(true)}
                      className="text-[10px] text-purple-300 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingAi ? 'animate-spin' : ''}`} /> Refresh AI
                    </button>
                  </div>
                )}
              </div>

              {aiExplanation && (
                <div className="space-y-3 text-xs pl-2 border-l-2 border-purple-500/40">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 block uppercase font-bold">Summary</span>
                    <p className="text-slate-200 leading-relaxed">{aiExplanation.summary}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-amber-400 block uppercase font-bold">Risk Explanation</span>
                    <p className="text-slate-300 leading-relaxed">{aiExplanation.risk_explanation}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold">Recommended Action</span>
                    <p className="text-emerald-200 font-medium">{aiExplanation.recommended_action}</p>
                  </div>

                  {aiExplanation.verification_steps && aiExplanation.verification_steps.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono text-blue-400 block uppercase font-bold">Guard Verification Steps</span>
                      <ul className="mt-1 space-y-1">
                        {aiExplanation.verification_steps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5 text-slate-300">
                            <CheckSquare className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiExplanation.uncertainty && (
                    <div className="pt-1 text-[11px] text-slate-400 italic font-mono border-t border-purple-900/40">
                      Caveat: {aiExplanation.uncertainty}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Guard Dispatch Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Guard Incident Notes (Optional)
            </label>
            <input
              type="text"
              value={guardNotes}
              onChange={(e) => setGuardNotes(e.target.value)}
              placeholder="e.g., Verified Resident Dr. Sarah Jenkins - credentials checked OK"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* Action Buttons Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            disabled={isSubmitting}
            onClick={() => handleAction('LEGITIMATE')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            <UserCheck className="w-4 h-4" />
            <span>MARK LEGITIMATE</span>
          </button>

          <button
            disabled={isSubmitting}
            onClick={() => handleAction('ESCALATED')}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all uppercase tracking-wider"
          >
            <ShieldX className="w-4 h-4" />
            <span>ESCALATE INCIDENT</span>
          </button>
        </div>

      </div>
    </div>
  );
}
