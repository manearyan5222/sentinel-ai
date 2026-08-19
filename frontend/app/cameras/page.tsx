'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera as CameraIcon,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Play,
  Layers,
  Shield,
  RefreshCw,
  Power
} from 'lucide-react';
import { SOCHeader } from '../../components/SOCHeader';
import { AIChatAssistant } from '../../components/AIChatAssistant';
import {
  fetchCameras,
  createCamera,
  updateCamera,
  deleteCamera,
  testCameraConnection,
  fetchZones,
  createZone,
  deleteZone,
  fetchSystemStatus
} from '../../lib/api';
import { Camera, Zone, SystemStatus } from '../../lib/types';

export default function CamerasPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState<boolean>(false);
  const [selectedCamForZone, setSelectedCamForZone] = useState<string>('cam-01');
  const [testResult, setTestResult] = useState<{ id: string; status: string; message: string } | null>(null);

  // New Camera Form State
  const [camName, setCamName] = useState<string>('');
  const [camZone, setCamZone] = useState<string>('');
  const [camType, setCamType] = useState<string>('DEMO');
  const [camSource, setCamSource] = useState<string>('../sample_data/demo_security.mp4');
  const [camRestricted, setCamRestricted] = useState<boolean>(false);

  // New Zone Form State
  const [zoneName, setZoneName] = useState<string>('');
  const [zoneType, setZoneType] = useState<string>('RESTRICTED');
  const [zoneSeverity, setZoneSeverity] = useState<string>('HIGH');
  const [zoneDwell, setZoneDwell] = useState<number>(15);

  const loadData = async () => {
    try {
      const [camsData, zonesData, sysData] = await Promise.all([
        fetchCameras(),
        fetchZones(),
        fetchSystemStatus()
      ]);
      setCameras(camsData);
      setZones(zonesData);
      setSystemStatus(sysData);
    } catch (e) {
      console.error('Failed to load cameras & zones:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!camName || !camZone) return;
    await createCamera({
      name: camName,
      location_zone: camZone,
      stream_type: camType as any,
      source_path: camSource,
      is_restricted_zone: camRestricted
    });
    setIsAddModalOpen(false);
    setCamName('');
    setCamZone('');
    loadData();
  };

  const handleDeleteCamera = async (id: string) => {
    if (confirm(`Are you sure you want to delete camera ${id}?`)) {
      await deleteCamera(id);
      loadData();
    }
  };

  const handleToggleEnable = async (cam: Camera) => {
    await updateCamera(cam.id, { is_enabled: !cam.is_enabled, status: !cam.is_enabled ? 'ACTIVE' : 'OFFLINE' });
    loadData();
  };

  const handleTestConnection = async (id: string) => {
    const res = await testCameraConnection(id);
    setTestResult({ id, status: res.status, message: res.message });
    setTimeout(() => setTestResult(null), 5000);
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName) return;
    await createZone({
      camera_id: selectedCamForZone,
      name: zoneName,
      zone_type: zoneType as any,
      severity: zoneSeverity as any,
      is_restricted: zoneType !== 'PUBLIC' && zoneType !== 'LOBBY',
      max_dwell_seconds: zoneDwell,
      polygon_coordinates: [[0.1, 0.2], [0.8, 0.2], [0.8, 0.9], [0.1, 0.9]]
    });
    setIsZoneModalOpen(false);
    setZoneName('');
    loadData();
  };

  const handleDeleteZone = async (id: string) => {
    await deleteZone(id);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <SOCHeader systemStatus={systemStatus} />

      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <CameraIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Camera Configuration & Spatial Zone Management
              </h2>
              <p className="text-xs text-slate-400">
                Configure RTSP / Webcam streams, define spatial polygon zones & enforce boundary security rules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsZoneModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Add Spatial Zone</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Camera Feed</span>
            </button>
          </div>
        </div>

        {/* Camera Feeds List Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between font-mono text-xs text-slate-400">
            <span>CONFIGURED CAMERAS ({cameras.length})</span>
            <span className="text-emerald-400">RTSP Credentials Masked in Responses</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 font-mono text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Camera ID & Name</th>
                  <th className="p-3.5">Zone & Sector</th>
                  <th className="p-3.5">Stream Source</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Sensitivity</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cameras.map((cam) => (
                  <tr key={cam.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-white block">{cam.name}</span>
                      <span className="font-mono text-[10px] text-slate-500">{cam.id.toUpperCase()}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-300 font-mono block">{cam.location_zone}</span>
                      {cam.is_restricted_zone && (
                        <span className="text-[10px] text-rose-400 font-bold font-mono">Restricted Sector</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 mr-2 text-[10px]">
                        {cam.stream_type}
                      </span>
                      <span className="text-[11px] truncate max-w-xs inline-block">{cam.source_path}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        cam.is_enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {cam.is_enabled ? 'ONLINE' : 'DISABLED'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      {cam.sensitivity || 'MEDIUM'}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleTestConnection(cam.id)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-mono"
                        title="Test Stream Connection"
                      >
                        Test Stream
                      </button>
                      <button
                        onClick={() => handleToggleEnable(cam)}
                        className={`p-1.5 rounded-lg text-[11px] font-mono ${
                          cam.is_enabled ? 'bg-amber-950 text-amber-400 hover:bg-amber-900' : 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
                        }`}
                        title={cam.is_enabled ? 'Disable Camera' : 'Enable Camera'}
                      >
                        <Power className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteCamera(cam.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950 rounded-lg"
                        title="Delete Camera"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Test Result Toast */}
        {testResult && (
          <div className="p-3.5 bg-slate-900 border border-blue-500/40 rounded-xl text-xs font-mono text-white flex items-center justify-between shadow-xl">
            <span>Camera {testResult.id}: {testResult.message} ({testResult.status})</span>
          </div>
        )}

        {/* Spatial Zones Table (Requirements 7 & 8) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between font-mono text-xs text-slate-400">
            <span>DEFINED SPATIAL POLYGON ZONES ({zones.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {zones.map((z) => (
              <div key={z.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{z.name}</span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    z.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    z.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}>
                    {z.severity}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono space-y-1">
                  <div>Cam: {z.camera_id}</div>
                  <div>Type: {z.zone_type}</div>
                  <div>Max Dwell: {z.max_dwell_seconds}s</div>
                  <div>Vertices: {z.polygon_coordinates?.length || 4} Points</div>
                </div>

                <button
                  onClick={() => handleDeleteZone(z.id)}
                  className="absolute bottom-3 right-3 text-rose-400 hover:text-rose-300 p-1"
                  title="Delete Zone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Add Camera Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white">Add New Camera Stream</h3>
            
            <form onSubmit={handleCreateCamera} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-mono block mb-1">Camera Name:</label>
                <input
                  type="text"
                  required
                  value={camName}
                  onChange={(e) => setCamName(e.target.value)}
                  placeholder="e.g. East Boundary CCTV"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Location Zone:</label>
                <input
                  type="text"
                  required
                  value={camZone}
                  onChange={(e) => setCamZone(e.target.value)}
                  placeholder="e.g. East Perimeter Gate"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Stream Type:</label>
                <select
                  value={camType}
                  onChange={(e) => setCamType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none"
                >
                  <option value="DEMO">DEMO Video Loop</option>
                  <option value="WEBCAM">Local USB Webcam</option>
                  <option value="RTSP">RTSP Security Stream</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Source Path / URL:</label>
                <input
                  type="text"
                  required
                  value={camSource}
                  onChange={(e) => setCamSource(e.target.value)}
                  placeholder="rtsp://admin:pass@192.168.1.100:554/stream or video.mp4"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="restricted"
                  checked={camRestricted}
                  onChange={(e) => setCamRestricted(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800"
                />
                <label htmlFor="restricted" className="text-slate-300 font-mono">Mark as Restricted Security Zone</label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  Save Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Zone Modal */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white">Define Spatial Polygon Zone</h3>
            
            <form onSubmit={handleCreateZone} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-mono block mb-1">Target Camera:</label>
                <select
                  value={selectedCamForZone}
                  onChange={(e) => setSelectedCamForZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none"
                >
                  {cameras.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Zone Name:</label>
                <input
                  type="text"
                  required
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="e.g. Server Room Vault"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Zone Type:</label>
                <select
                  value={zoneType}
                  onChange={(e) => setZoneType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none"
                >
                  <option value="RESTRICTED">Restricted Boundary</option>
                  <option value="SERVER_ROOM">Server Room / Critical</option>
                  <option value="STAFF_ONLY">Staff Only</option>
                  <option value="LOBBY">Lobby Reception</option>
                  <option value="PUBLIC">Public Area</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Severity Level:</label>
                <select
                  value={zoneSeverity}
                  onChange={(e) => setZoneSeverity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Max Allowed Dwell (seconds):</label>
                <input
                  type="number"
                  required
                  value={zoneDwell}
                  onChange={(e) => setZoneDwell(parseInt(e.target.value) || 15)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  Save Spatial Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Gemini AI Assistant */}
      <AIChatAssistant />
    </div>
  );
}
