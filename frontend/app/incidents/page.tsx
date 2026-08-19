'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  UserCheck,
  FileText,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { SOCHeader } from '../../components/SOCHeader';
import { AIChatAssistant } from '../../components/AIChatAssistant';
import { fetchIncidents, fetchIncidentTimeline, updateIncidentStatus, fetchSystemStatus } from '../../lib/api';
import { Incident, IncidentTimelineEvent, SystemStatus } from '../../lib/types';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<IncidentTimelineEvent[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [guardNotes, setGuardNotes] = useState<string>('');

  const loadIncidents = async () => {
    try {
      const [incData, sysData] = await Promise.all([
        fetchIncidents(),
        fetchSystemStatus()
      ]);
      setIncidents(incData);
      setSystemStatus(sysData);
      if (selectedIncident) {
        const updated = incData.find(i => i.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      }
    } catch (e) {
      console.error('Failed to load incidents:', e);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleSelectIncident = async (inc: Incident) => {
    setSelectedIncident(inc);
    setGuardNotes(inc.guard_notes || '');
    const timelineData = await fetchIncidentTimeline(inc.id);
    setTimeline(timelineData);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedIncident) return;
    await updateIncidentStatus(selectedIncident.id, newStatus, guardNotes);
    loadIncidents();
    const updatedTimeline = await fetchIncidentTimeline(selectedIncident.id);
    setTimeline(updatedTimeline);
  };

  const filteredIncidents = incidents.filter(inc => {
    const matchesStatus = filterStatus === 'ALL' || inc.status === filterStatus;
    const matchesSeverity = filterSeverity === 'ALL' || inc.severity === filterSeverity;
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.camera_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <SOCHeader systemStatus={systemStatus} />

      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Security Incident Management & Audit Timelines
              </h2>
              <p className="text-xs text-slate-400">
                End-to-end incident lifecycle: Detection → Zone Breach → Risk Evaluation → Guard Investigation → Resolution.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, summary, or camera ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">STATUS:</span>
            {['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                  filterStatus === st ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">SEVERITY:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                  filterSeverity === sev ? 'bg-amber-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Main 2-Column Split: Incidents Table & Incident Detail Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Incidents List */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between font-mono text-xs text-slate-400">
              <span>RECORDED INCIDENTS ({filteredIncidents.length})</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => handleSelectIncident(inc)}
                  className={`p-4 cursor-pointer transition-all space-y-2 hover:bg-slate-800/40 ${
                    selectedIncident?.id === inc.id ? 'bg-blue-950/30 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{inc.title}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        inc.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        inc.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-300">
                        {inc.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{inc.summary}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>Cam: {inc.camera_id}</span>
                    <span>Risk: {inc.risk_score}/100</span>
                    <span>{new Date(inc.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Selected Incident Detail & Interactive Step-by-Step Timeline */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-xl">
            {selectedIncident ? (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="space-y-2 border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-blue-400 font-bold">{selectedIncident.id.toUpperCase()}</span>
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-800 text-white">
                      Status: {selectedIncident.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">{selectedIncident.title}</h3>
                  <p className="text-xs text-slate-300">{selectedIncident.summary}</p>
                </div>

                {/* Gemini AI Incident Summary Box */}
                {selectedIncident.ai_summary && (
                  <div className="p-3.5 bg-purple-950/30 border border-purple-800/40 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-purple-400 font-bold font-mono text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>GEMINI AI INCIDENT BRIEF</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{selectedIncident.ai_summary}</p>
                  </div>
                )}

                {/* Step-by-Step Timeline Visualizer (Requirement 12) */}
                <div className="space-y-3">
                  <span className="font-bold text-xs font-mono text-slate-300 uppercase tracking-wider block">
                    CHRONOLOGICAL AUDIT TIMELINE
                  </span>

                  <div className="relative pl-6 space-y-4 border-l-2 border-slate-800">
                    {timeline.map((event, idx) => (
                      <div key={event.id || idx} className="relative group">
                        {/* Dot indicator */}
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900 group-hover:scale-125 transition-transform" />
                        
                        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                          <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                            {event.event_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 mt-0.5">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guard Investigation Notes Input */}
                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <label className="text-xs font-mono text-slate-400 block font-bold">
                    OFFICER TRIAGE NOTES & RESOLUTION ACTION:
                  </label>
                  <textarea
                    rows={2}
                    value={guardNotes}
                    onChange={(e) => setGuardNotes(e.target.value)}
                    placeholder="Enter security officer verification notes..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Status Transition Action Buttons */}
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    onClick={() => handleStatusUpdate('INVESTIGATING')}
                    className="py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" />
                    <span>INVESTIGATE</span>
                  </button>

                  <button
                    onClick={() => handleStatusUpdate('RESOLVED')}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>RESOLVE</span>
                  </button>

                  <button
                    onClick={() => handleStatusUpdate('FALSE_POSITIVE')}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 col-span-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>MARK FALSE POSITIVE</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-xs">
                <FileText className="w-10 h-10 mb-2 opacity-40" />
                <span>Select an incident on the left to inspect its timeline & audit history.</span>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Floating Gemini AI Assistant */}
      <AIChatAssistant />
    </div>
  );
}
