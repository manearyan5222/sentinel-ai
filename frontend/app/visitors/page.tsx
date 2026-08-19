'use client';

import React, { useState, useEffect } from 'react';
import { SOCHeader } from '../../components/SOCHeader';
import { VisitorTrackerTable } from '../../components/VisitorTrackerTable';
import { AIChatAssistant } from '../../components/AIChatAssistant';
import {
  fetchAuthorizedPersons,
  fetchExpectedVisitors,
  createExpectedVisitor,
  updateVisitorStatus,
  fetchSystemStatus
} from '../../lib/api';
import { AuthorizedPerson, ExpectedVisitor, SystemStatus } from '../../lib/types';
import { Users } from 'lucide-react';

export default function VisitorDirectoryPage() {
  const [authorizedPersons, setAuthorizedPersons] = useState<AuthorizedPerson[]>([]);
  const [expectedVisitors, setExpectedVisitors] = useState<ExpectedVisitor[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  const loadData = async () => {
    const [pData, vData, sData] = await Promise.all([
      fetchAuthorizedPersons(),
      fetchExpectedVisitors(),
      fetchSystemStatus(),
    ]);
    setAuthorizedPersons(pData);
    setExpectedVisitors(vData);
    setSystemStatus(sData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddVisitor = async (vData: any) => {
    await createExpectedVisitor(vData);
    loadData();
  };

  const handleUpdateStatus = async (visitorId: string, status: string) => {
    await updateVisitorStatus(visitorId, status);
    loadData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <SOCHeader systemStatus={systemStatus} />

      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-wide text-slate-100">
              Resident Access Whitelist & Visitor Pass Directory
            </h2>
            <p className="text-xs text-slate-400">
              Manage authorized resident embeddings and issue digital QR pre-registration passes for AI authorization matching.
            </p>
          </div>
        </div>

        <VisitorTrackerTable
          authorizedPersons={authorizedPersons}
          expectedVisitors={expectedVisitors}
          onAddVisitor={handleAddVisitor}
          onUpdateStatus={handleUpdateStatus}
        />
      </main>

      {/* Floating Gemini AI Assistant */}
      <AIChatAssistant />
    </div>
  );
}
