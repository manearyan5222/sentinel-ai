'use client';

import React, { useState } from 'react';
import { AuthorizedPerson, ExpectedVisitor } from '../lib/types';
import { UserCheck, UserPlus, Search, ShieldCheck, Clock, Car, QrCode, XCircle } from 'lucide-react';

interface VisitorTrackerTableProps {
  authorizedPersons: AuthorizedPerson[];
  expectedVisitors: ExpectedVisitor[];
  onAddVisitor: (visitor: any) => void;
  onUpdateStatus?: (visitorId: string, status: string) => void;
}

export function VisitorTrackerTable({
  authorizedPersons,
  expectedVisitors,
  onAddVisitor,
  onUpdateStatus
}: VisitorTrackerTableProps) {
  const [activeTab, setActiveTab] = useState<'RESIDENTS' | 'VISITORS'>('VISITORS');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState<ExpectedVisitor | null>(null);

  // Form states for new visitor registration
  const [visitorName, setVisitorName] = useState('');
  const [residentHost, setResidentHost] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [purpose, setPurpose] = useState('VISIT');

  const filteredResidents = authorizedPersons.filter(p =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.unit_number && p.unit_number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredVisitors = expectedVisitors.filter(v =>
    v.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.resident_host_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.unit_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.pass_id && v.pass_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !unitNumber) return;
    onAddVisitor({
      visitor_name: visitorName,
      resident_host_name: residentHost || `Unit ${unitNumber}`,
      unit_number: unitNumber,
      purpose: purpose,
      vehicle_number: vehicleNumber,
      allowed_zones: ["North Gate Access", "Building A Reception"],
      valid_hours: 24
    });
    setVisitorName('');
    setResidentHost('');
    setUnitNumber('');
    setVehicleNumber('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      
      {/* Table Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Tab Selection */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('VISITORS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'VISITORS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pre-Registered Visitor Passes ({expectedVisitors.length})
          </button>
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
        </div>

        {/* Search & Register Action */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, pass ID, unit..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Generate Visitor Pass</span>
          </button>
        </div>

      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
            {activeTab === 'RESIDENTS' ? (
              <tr>
                <th className="p-3.5">Resident Name & ID</th>
                <th className="p-3.5">Access Level</th>
                <th className="p-3.5">Unit Number</th>
                <th className="p-3.5">Allowed Sectors</th>
                <th className="p-3.5">Notes</th>
              </tr>
            ) : (
              <tr>
                <th className="p-3.5">Pass ID & Visitor</th>
                <th className="p-3.5">Host & Unit</th>
                <th className="p-3.5">Purpose</th>
                <th className="p-3.5">Vehicle</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Pass QR & Actions</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
            {activeTab === 'RESIDENTS' ? (
              filteredResidents.map((resident) => (
                <tr key={resident.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-700 flex items-center justify-center font-bold text-blue-300 text-xs">
                      {resident.full_name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-100 block">{resident.full_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{resident.id}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                      {resident.identity_type}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-slate-200">{resident.unit_number || 'N/A'}</td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                    {(resident.allowed_zones || []).join(', ') || 'All Sectors'}
                  </td>
                  <td className="p-3.5 text-slate-400 max-w-xs truncate">{resident.notes || '-'}</td>
                </tr>
              ))
            ) : (
              filteredVisitors.map((visitor) => (
                <tr key={visitor.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5">
                    <span className="font-bold text-slate-100 block">{visitor.visitor_name}</span>
                    <span className="font-mono text-[10px] text-blue-400 font-bold">
                      {visitor.pass_id || visitor.id.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-slate-200 font-semibold block">{visitor.resident_host_name}</span>
                    <span className="text-[10px] font-mono text-slate-500">Unit {visitor.unit_number}</span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">{visitor.purpose || 'VISIT'}</td>
                  <td className="p-3.5 font-mono text-slate-400">{visitor.vehicle_number || 'Pedestrian'}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      visitor.status === 'ACTIVE' || visitor.status === 'CHECKED_IN'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : visitor.status === 'REVOKED'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {visitor.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => setSelectedPass(visitor)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg font-mono text-[11px] inline-flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Pass</span>
                    </button>
                    {onUpdateStatus && visitor.status !== 'REVOKED' && (
                      <button
                        onClick={() => onUpdateStatus(visitor.id, 'REVOKED')}
                        className="px-2 py-1 bg-rose-950/40 hover:bg-rose-950 text-rose-400 rounded-lg font-mono text-[11px]"
                        title="Revoke Visitor Pass"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View QR Pass Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl inline-block">
              <QrCode className="w-8 h-8 text-blue-400" />
            </div>
            
            <div className="space-y-1">
              <span className="font-mono text-xs text-blue-400 font-bold tracking-widest uppercase">
                DIGITAL VISITOR ACCESS PASS
              </span>
              <h3 className="text-lg font-black text-white">{selectedPass.visitor_name}</h3>
              <p className="text-xs text-slate-400 font-mono">Pass Code: {selectedPass.pass_id || selectedPass.id}</p>
            </div>

            {/* Synthetic Pass Card */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Host:</span>
                <span className="text-slate-200">{selectedPass.resident_host_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit:</span>
                <span className="text-slate-200">{selectedPass.unit_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="text-slate-200">{selectedPass.vehicle_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 font-bold">{selectedPass.status}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPass(null)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

      {/* Modal for Registering Expected Visitor */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-slate-100 tracking-wide flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-400" />
              Pre-Register Visitor Pass
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Visitor Full Name:</label>
                <input
                  type="text"
                  required
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Destination Unit Number:</label>
                <input
                  type="text"
                  required
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  placeholder="e.g. A-402"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Resident Host Name:</label>
                <input
                  type="text"
                  value={residentHost}
                  onChange={(e) => setResidentHost(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Purpose of Visit:</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                >
                  <option value="VISIT">Personal Guest Visit</option>
                  <option value="DELIVERY">Package / Food Delivery</option>
                  <option value="MAINTENANCE">Maintenance / Repairs</option>
                  <option value="CONTRACTOR">Contractor Work</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Vehicle License Plate (Optional):</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. NY-4591"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold shadow-md shadow-blue-600/30"
                >
                  Generate Digital Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
