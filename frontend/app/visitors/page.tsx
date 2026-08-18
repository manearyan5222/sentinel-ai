'use client';

import React, { useState, useEffect } from 'react';
import { SOCHeader } from '../../components/SOCHeader';
import { VisitorTrackerTable } from '../../components/VisitorTrackerTable';
import { fetchAuthorizedPersons, fetchExpectedVisitors, createExpectedVisitor, fetchSystemStatus } from '../../lib/api';
import { AuthorizedPerson, ExpectedVisitor, SystemStatus } from '../../lib/types';
import { Users } from 'lucide-react';

export default function VisitorDirectoryPage() {
  const [authorizedPersons, setAuthorizedPersons] = useState<AuthorizedPerson[]>([]);
  const [expectedVisitors, setExpectedVisitors] = useState<ExpectedVisitor[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    async function load() {
      const [pData, vData, sData] = await Promise.all([
        fetchAuthorizedPersons(),
        fetchExpectedVisitors(),
        fetchSystemStatus(),
      ]);
      setAuthorizedPersons(pData);
      setExpectedVisitors(vData);
      setSystemStatus(sData);
    }
    load();
  }, []);

  const handleAddVisitor = async (vData: Omit<ExpectedVisitor, 'id' | 'status'>) => {
    try {
      const newVisitor = await createExpectedVisitor(vData);
      setExpectedVisitors((prev) => [newVisitor, ...prev]);
    } catch {
      const mockVisitor: ExpectedVisitor = {
        ...vData,
        id: `v-${Date.now()}`,
        status: 'PENDING',
      };
      setExpectedVisitors((prev) => [mockVisitor, ...prev]);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      <SOCHeader systemStatus={systemStatus} isConnected={true} activeAlertCount={0} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-100">
              AUTHORIZED RESIDENT & VISITOR DIRECTORY
            </h2>
            <p className="text-xs text-slate-400">
              Manage whitelisted identities and expected visitor pre-registration passes for AI matching.
            </p>
          </div>
        </div>

        <VisitorTrackerTable
          authorizedPersons={authorizedPersons}
          expectedVisitors={expectedVisitors}
          onAddVisitor={handleAddVisitor}
        />
      </main>
    </div>
  );
}
