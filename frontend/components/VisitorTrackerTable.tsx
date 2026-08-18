'use client';

import React, { useState } from 'react';
import { AuthorizedPerson, ExpectedVisitor } from '../lib/types';
import { UserCheck, UserPlus, Search, ShieldCheck, Clock, Car, Filter, Check } from 'lucide-react';

interface VisitorTrackerTableProps {
  authorizedPersons: AuthorizedPerson[];
  expectedVisitors: ExpectedVisitor[];
  onAddVisitor: (visitor: Omit<ExpectedVisitor, 'id' | 'status'>) => void;
}

export function VisitorTrackerTable({ authorizedPersons, expectedVisitors, onAddVisitor }: VisitorTrackerTableProps) {
  const [activeTab, setActiveTab] = useState<'RESIDENTS' | 'VISITORS'>('RESIDENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new visitor registration
  const [visitorName, setVisitorName] = useState('');
  const [residentHost, setResidentHost] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const filteredResidents = authorizedPersons.filter(p =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.unit_number && p.unit_number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredVisitors = expectedVisitors.filter(v =>
    v.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.resident_host_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.unit_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !unitNumber) return;
    onAddVisitor({
      visitor_name: visitorName,
      resident_host_name: residentHost || `Resident Unit ${unitNumber}`,
      unit_number: unitNumber,
      vehicle_number: vehicleNumber,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 86400000).toISOString(),
    });
    setVisitorName('');
    setResidentHost('');
    setUnitNumber('');
    setVehicleNumber('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      
      {/* Table Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Tab Selection */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('RESIDENTS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'RESIDENTS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Authorized Residents ({authorizedPersons.length})
          </button>
          <button
            onClick={() => setActiveTab('VISITORS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'VISITORS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expected Visitors ({expectedVisitors.length})
          </button>
        </div>

        {/* Search & Register Action */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, unit, vehicle..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Pre-Register Visitor</span>
          </button>
        </div>

      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
            {activeTab === 'RESIDENTS' ? (
              <tr>
                <th className="p-3">Full Name & ID</th>
                <th className="p-3">Identity Type</th>
                <th className="p-3">Unit Number</th>
                <th className="p-3">Access Level</th>
                <th className="p-3">Notes</th>
              </tr>
            ) : (
              <tr>
                <th className="p-3">Visitor Name</th>
                <th className="p-3">Resident Host</th>
                <th className="p-3">Unit Number</th>
                <th className="p-3">Vehicle Plate</th>
                <th className="p-3">Registration Status</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
            {activeTab === 'RESIDENTS' ? (
              filteredResidents.map((resident) => (
                <tr key={resident.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-700 flex items-center justify-center font-bold text-blue-300 text-xs">
                      {resident.full_name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-100 block">{resident.full_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{resident.id}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                      {resident.identity_type}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-200">{resident.unit_number || 'N/A'}</td>
                  <td className="p-3 text-slate-400">{resident.access_level}</td>
                  <td className="p-3 text-slate-400 max-w-xs truncate">{resident.notes || '-'}</td>
                </tr>
              ))
            ) : (
              filteredVisitors.map((visitor) => (
                <tr key={visitor.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-bold text-slate-100">{visitor.visitor_name}</td>
                  <td className="p-3 text-slate-300">{visitor.resident_host_name}</td>
                  <td className="p-3 font-mono font-bold text-slate-200">{visitor.unit_number}</td>
                  <td className="p-3 font-mono text-slate-400">{visitor.vehicle_number || 'Walking Pass'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      visitor.status === 'CHECKED_IN'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {visitor.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Registering Expected Visitor */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-slate-100 tracking-wide flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-400" />
              Pre-Register Visitor Pass
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  required
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Unit Number</label>
                <input
                  type="text"
                  required
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  placeholder="e.g. A-402"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Resident Host Name</label>
                <input
                  type="text"
                  value={residentHost}
                  onChange={(e) => setResidentHost(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Vehicle License Plate (Optional)</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. NY-4591"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold shadow-md shadow-blue-600/30"
                >
                  Register Visitor Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
