'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  Database,
  RefreshCw
} from 'lucide-react';
import { SOCHeader } from '../../components/SOCHeader';
import { AIChatAssistant } from '../../components/AIChatAssistant';
import { fetchAuditLogs, fetchSystemStatus } from '../../lib/api';
import { AuditLog, SystemStatus } from '../../lib/types';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = async () => {
    try {
      const [logsData, sysData] = await Promise.all([
        fetchAuditLogs(100, 0),
        fetchSystemStatus()
      ]);
      setLogs(logsData);
      setSystemStatus(sysData);
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const matchesSearch = log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.resource_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <SOCHeader systemStatus={systemStatus} />

      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Security Compliance & System Audit Trail
              </h2>
              <p className="text-xs text-slate-400">
                Immutable record of user logins, camera modifications, visitor registrations, and guard triage actions.
              </p>
            </div>
          </div>

          <button
            onClick={loadLogs}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by username, action, or resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">ACTION:</span>
            {['ALL', 'LOGIN', 'ALERT_STATUS_UPDATE', 'INCIDENT_UPDATE', 'CAMERA_CREATE', 'VISITOR_PASS_CREATE'].map((act) => (
              <button
                key={act}
                onClick={() => setFilterAction(act)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                  filterAction === act ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between font-mono text-xs text-slate-400">
            <span>AUDIT TRAIL RECORDS ({filteredLogs.length})</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 font-mono text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp (UTC)</th>
                  <th className="p-3.5">Actor / User</th>
                  <th className="p-3.5">Action Performed</th>
                  <th className="p-3.5">Resource</th>
                  <th className="p-3.5">Metadata & Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span>{log.username}</span>
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 text-[11px]">
                      {log.resource_type} {log.resource_id ? `(#${log.resource_id})` : ''}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      <span className="truncate max-w-md inline-block">
                        {JSON.stringify(log.details || {})}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Floating Gemini AI Assistant */}
      <AIChatAssistant />
    </div>
  );
}
