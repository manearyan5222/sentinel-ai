import {
  Camera,
  Zone,
  Alert,
  Incident,
  IncidentTimelineEvent,
  AuthorizedPerson,
  ExpectedVisitor,
  AnalyticsSummary,
  SystemStatus,
  AIStatus,
  AIExplanation,
  AuditLog,
  User
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// --- CAMERAS ---
export async function fetchCameras(): Promise<Camera[]> {
  try {
    const res = await fetch(`${API_BASE}/cameras`);
    if (!res.ok) throw new Error('Failed to fetch cameras');
    return await res.json();
  } catch (error) {
    console.error('fetchCameras error:', error);
    return [];
  }
}

export async function createCamera(data: Partial<Camera>): Promise<Camera | null> {
  try {
    const res = await fetch(`${API_BASE}/cameras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create camera');
    return await res.json();
  } catch (error) {
    console.error('createCamera error:', error);
    return null;
  }
}

export async function updateCamera(id: string, data: Partial<Camera>): Promise<Camera | null> {
  try {
    const res = await fetch(`${API_BASE}/cameras/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update camera');
    return await res.json();
  } catch (error) {
    console.error('updateCamera error:', error);
    return null;
  }
}

export async function deleteCamera(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/cameras/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (error) {
    console.error('deleteCamera error:', error);
    return false;
  }
}

export async function testCameraConnection(id: string): Promise<{ status: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/cameras/${id}/test`, { method: 'POST' });
    return await res.json();
  } catch (error) {
    return { status: 'UNREACHABLE', message: 'Failed to reach camera test endpoint' };
  }
}

// --- SPATIAL ZONES ---
export async function fetchZones(cameraId?: string): Promise<Zone[]> {
  try {
    const url = cameraId ? `${API_BASE}/zones?camera_id=${cameraId}` : `${API_BASE}/zones`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch zones');
    return await res.json();
  } catch (error) {
    console.error('fetchZones error:', error);
    return [];
  }
}

export async function createZone(data: Partial<Zone>): Promise<Zone | null> {
  try {
    const res = await fetch(`${API_BASE}/zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create zone');
    return await res.json();
  } catch (error) {
    console.error('createZone error:', error);
    return null;
  }
}

export async function deleteZone(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/zones/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (error) {
    return false;
  }
}

// --- ALERTS ---
export async function fetchAlerts(status?: string, severity?: string): Promise<Alert[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (severity) params.append('severity', severity);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/alerts${query}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return await res.json();
  } catch (error) {
    console.error('fetchAlerts error:', error);
    return [];
  }
}

export async function updateAlertStatus(
  alertId: string,
  status: string,
  guardNotes?: string,
  assignedUserId?: string
): Promise<Alert | null> {
  try {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, guard_notes: guardNotes, assigned_user_id: assignedUserId })
    });
    if (!res.ok) throw new Error('Failed to update alert status');
    return await res.json();
  } catch (error) {
    console.error('updateAlertStatus error:', error);
    return null;
  }
}

// --- INCIDENTS & TIMELINE ---
export async function fetchIncidents(status?: string, severity?: string): Promise<Incident[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (severity) params.append('severity', severity);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/incidents${query}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return await res.json();
  } catch (error) {
    console.error('fetchIncidents error:', error);
    return [];
  }
}

export async function fetchIncident(id: string): Promise<Incident | null> {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch incident');
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function fetchIncidentTimeline(id: string): Promise<IncidentTimelineEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}/timeline`);
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return await res.json();
  } catch (error) {
    return [];
  }
}

export async function updateIncidentStatus(
  incidentId: string,
  status: string,
  guardNotes?: string,
  rootCause?: string,
  assignedTo?: string
): Promise<Incident | null> {
  try {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, guard_notes: guardNotes, root_cause: rootCause, assigned_to: assignedTo })
    });
    if (!res.ok) throw new Error('Failed to update incident status');
    return await res.json();
  } catch (error) {
    return null;
  }
}

// --- VISITORS & RESIDENTS ---
export async function fetchAuthorizedPersons(): Promise<AuthorizedPerson[]> {
  try {
    const res = await fetch(`${API_BASE}/visitors/authorized`);
    if (!res.ok) throw new Error('Failed to fetch authorized persons');
    return await res.json();
  } catch (error) {
    return [];
  }
}

export async function fetchExpectedVisitors(): Promise<ExpectedVisitor[]> {
  try {
    const res = await fetch(`${API_BASE}/visitors/expected`);
    if (!res.ok) throw new Error('Failed to fetch expected visitors');
    return await res.json();
  } catch (error) {
    return [];
  }
}

export async function createExpectedVisitor(data: {
  visitor_name: string;
  resident_host_name: string;
  unit_number: string;
  purpose?: string;
  vehicle_number?: string;
  allowed_zones?: string[];
  valid_hours?: number;
}): Promise<ExpectedVisitor | null> {
  try {
    const res = await fetch(`${API_BASE}/visitors/expected`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create visitor pass');
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function updateVisitorStatus(visitorId: string, status: string): Promise<ExpectedVisitor | null> {
  try {
    const res = await fetch(`${API_BASE}/visitors/expected/${visitorId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update visitor status');
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function deleteExpectedVisitor(visitorId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/visitors/expected/${visitorId}`, { method: 'DELETE' });
    return res.ok;
  } catch (error) {
    return false;
  }
}

// --- ANALYTICS & AUDIT ---
export async function fetchAnalytics(): Promise<AnalyticsSummary | null> {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function fetchAuditLogs(limit: number = 50, offset: number = 0): Promise<AuditLog[]> {
  try {
    const res = await fetch(`${API_BASE}/audit-logs?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return await res.json();
  } catch (error) {
    return [];
  }
}

export async function fetchSystemStatus(): Promise<SystemStatus | null> {
  try {
    const res = await fetch(`${API_BASE}/system/status`);
    if (!res.ok) throw new Error('Failed to fetch system status');
    return await res.json();
  } catch (error) {
    return null;
  }
}

// --- GEMINI AI LAYER ---
export async function fetchAIStatus(): Promise<AIStatus> {
  try {
    const res = await fetch(`${API_BASE}/ai/status`);
    if (!res.ok) return { status: 'DISABLED', message: 'AI endpoint offline.' };
    return await res.json();
  } catch (error) {
    return { status: 'DISABLED', message: 'Backend unreachable.' };
  }
}

export async function explainAlertAI(alertId: string, forceRefresh: boolean = false): Promise<AIExplanation | null> {
  try {
    const res = await fetch(`${API_BASE}/ai/explain-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert_id: alertId, force_refresh: forceRefresh })
    });
    if (!res.ok) throw new Error('AI analysis error');
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function queryAIChat(message: string): Promise<{ answer: string; referenced_alerts?: string[]; confidence_note?: string }> {
  try {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error('AI chat error');
    return await res.json();
  } catch (error) {
    return {
      answer: "I am unable to query security event logs right now. Please verify your backend server connection.",
      confidence_note: "Fallback offline response."
    };
  }
}

// Aliases for component imports
export const sendAIChat = queryAIChat;
export const explainAlert = explainAlertAI;

