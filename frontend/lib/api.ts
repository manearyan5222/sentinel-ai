import { Camera, Alert, AuthorizedPerson, ExpectedVisitor, SystemStatus, AnalyticsSummary, AIStatus, AIExplanation } from './types';

const API_BASE = '/api';

export async function fetchSystemStatus(): Promise<SystemStatus> {
  try {
    const res = await fetch(`${API_BASE}/system/status`);
    if (!res.ok) throw new Error('Failed to fetch system status');
    return await res.json();
  } catch {
    return {
      ai_device: 'CPU',
      device_name: 'Intel(R) Core(TM) / Generic CPU',
      active_cameras: 4,
      total_cameras: 4,
      active_alerts: 2,
      today_detections: 148,
      fps: 28,
    };
  }
}

export async function fetchAIStatus(): Promise<AIStatus> {
  try {
    const res = await fetch(`${API_BASE}/ai/status`);
    if (!res.ok) throw new Error('Failed to fetch AI status');
    return await res.json();
  } catch {
    return {
      status: 'DISABLED',
      message: 'Gemini AI service running in standalone mode.',
    };
  }
}

export async function explainAlert(alertId: string, forceRefresh = false): Promise<AIExplanation> {
  try {
    const res = await fetch(`${API_BASE}/ai/explain-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert_id: alertId, force_refresh: forceRefresh }),
    });
    if (!res.ok) throw new Error('Failed to generate AI explanation');
    return await res.json();
  } catch {
    return {
      summary: 'Alert triggered by automated 0-100 risk scoring engine.',
      risk_explanation: 'High/Elevated risk condition recorded by computer vision sensor.',
      recommended_action: 'Perform visual verification of camera stream and check visitor log.',
      verification_steps: [
        'Inspect live camera feed',
        'Check resident and visitor directory for expected arrivals',
        'Dispatch security guard if loitering persists'
      ],
      uncertainty: 'Standalone mode fallback (Gemini API offline or disabled).'
    };
  }
}

export async function sendAIChat(message: string): Promise<{ answer: string; referenced_alerts: string[]; confidence_note: string }> {
  try {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Failed to send AI chat message');
    return await res.json();
  } catch {
    return {
      answer: 'The AI Security Assistant is currently in standalone mode. All active alerts remain recorded in your SOC log.',
      referenced_alerts: [],
      confidence_note: 'Fallback mode'
    };
  }
}

export async function fetchCameras(): Promise<Camera[]> {
  try {
    const res = await fetch(`${API_BASE}/cameras`);
    if (!res.ok) throw new Error('Failed to fetch cameras');
    return await res.json();
  } catch {
    return [
      {
        id: 'cam-01',
        name: 'Main Gate & Entry',
        location_zone: 'North Gate Access',
        stream_type: 'DEMO',
        source_path: 'sample_data/demo_security.mp4',
        status: 'ACTIVE',
        is_restricted_zone: false,
        active_tracks_count: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cam-02',
        name: 'Perimeter Fence South',
        location_zone: 'Restricted Boundary',
        stream_type: 'DEMO',
        source_path: 'sample_data/demo_security.mp4',
        status: 'ACTIVE',
        is_restricted_zone: true,
        active_tracks_count: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cam-03',
        name: 'Lobby Entrance',
        location_zone: 'Building A Reception',
        stream_type: 'DEMO',
        source_path: 'sample_data/demo_security.mp4',
        status: 'ACTIVE',
        is_restricted_zone: false,
        active_tracks_count: 3,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cam-04',
        name: 'Pool & Garden Area',
        location_zone: 'Amenities Area',
        stream_type: 'DEMO',
        source_path: 'sample_data/demo_security.mp4',
        status: 'ACTIVE',
        is_restricted_zone: false,
        active_tracks_count: 0,
        created_at: new Date().toISOString(),
      },
    ];
  }
}

export async function fetchAlerts(): Promise<Alert[]> {
  try {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return await res.json();
  } catch {
    return [
      {
        id: 'alt-101',
        event_id: 'evt-801',
        camera_id: 'cam-02',
        camera_name: 'Perimeter Fence South',
        location_zone: 'Restricted Boundary',
        risk_score: 85,
        risk_level: 'HIGH',
        risk_reasons: [
          'Unrecognized Person (+25)',
          'Restricted Zone Violation (+30)',
          'Extended Dwell Time 24s (+15)',
          'No Active Visitor Reg (+15)',
        ],
        entity_label: 'Track #0104 (Unrecognized)',
        identity_type: 'UNRECOGNIZED',
        dwell_time_seconds: 24,
        status: 'ACTIVE',
        created_at: new Date(Date.now() - 1000 * 120).toISOString(),
        action_protocol: {
          who: 'Unrecognized Subject (Track #0104)',
          where: 'Perimeter Fence South (Restricted Zone)',
          when: '2 minutes ago',
          what: 'Person loitering near restricted fence boundary for 24s',
          why: [
            'No matching face/embedding in Resident DB',
            'Boundary zone marked strict restricted',
            'Extended dwell duration exceeds threshold',
          ],
          recommended_action: 'Dispatch patrol guard to verify identity or escort off premises.',
        },
      },
      {
        id: 'alt-102',
        event_id: 'evt-802',
        camera_id: 'cam-01',
        camera_name: 'Main Gate & Entry',
        location_zone: 'North Gate Access',
        risk_score: 60,
        risk_level: 'ELEVATED',
        risk_reasons: ['Unrecognized Person (+25)', 'No Active Visitor Reg (+20)', 'Night Access (+15)'],
        entity_label: 'Track #0109 (Delivery Driver)',
        identity_type: 'UNRECOGNIZED',
        dwell_time_seconds: 12,
        status: 'ACTIVE',
        created_at: new Date(Date.now() - 1000 * 300).toISOString(),
        action_protocol: {
          who: 'Unrecognized Individual',
          where: 'Main Gate Access',
          when: '5 minutes ago',
          what: 'Individual approaching intercom without pre-registered QR code',
          why: ['Unrecognized face ID', 'No expected visitor pass for Unit 402'],
          recommended_action: 'Verify driver ID over intercom before granting gate open.',
        },
      },
    ];
  }
}

export async function updateAlertStatus(alertId: string, status: Alert['status'], notes?: string): Promise<Alert> {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, guard_notes: notes }),
  });
  if (!res.ok) {
    throw new Error('Failed to update alert status');
  }
  return await res.json();
}

export async function fetchAuthorizedPersons(): Promise<AuthorizedPerson[]> {
  try {
    const res = await fetch(`${API_BASE}/visitors/authorized`);
    if (!res.ok) throw new Error('Failed to fetch authorized persons');
    return await res.json();
  } catch {
    return [
      {
        id: 'p-01',
        full_name: 'Dr. Sarah Jenkins',
        identity_type: 'RESIDENT',
        unit_number: 'A-402',
        access_level: 'FULL_RESIDENT',
        notes: 'Primary owner, vehicle #CA-9801',
        created_at: new Date().toISOString(),
      },
      {
        id: 'p-02',
        full_name: 'Marcus Vance',
        identity_type: 'RESIDENT',
        unit_number: 'B-104',
        access_level: 'FULL_RESIDENT',
        notes: 'HOA Board Member',
        created_at: new Date().toISOString(),
      },
      {
        id: 'p-03',
        full_name: 'Elena Rostova',
        identity_type: 'CONTRACTOR',
        unit_number: 'FACILITIES',
        access_level: 'RESTRICTED_DAYTIME',
        notes: 'Landscape maintenance head',
        created_at: new Date().toISOString(),
      },
    ];
  }
}

export async function fetchExpectedVisitors(): Promise<ExpectedVisitor[]> {
  try {
    const res = await fetch(`${API_BASE}/visitors/expected`);
    if (!res.ok) throw new Error('Failed to fetch expected visitors');
    return await res.json();
  } catch {
    return [
      {
        id: 'v-01',
        visitor_name: 'Robert Chen',
        resident_host_name: 'Dr. Sarah Jenkins (A-402)',
        unit_number: 'A-402',
        vehicle_number: 'NY-4591',
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 86400000).toISOString(),
        status: 'PENDING',
      },
      {
        id: 'v-02',
        visitor_name: 'FedEx Express Courier',
        resident_host_name: 'Building Reception',
        unit_number: 'LOBBY',
        vehicle_number: 'US-8812',
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 14400000).toISOString(),
        status: 'CHECKED_IN',
      },
    ];
  }
}

export async function createExpectedVisitor(data: Omit<ExpectedVisitor, 'id' | 'status'>): Promise<ExpectedVisitor> {
  const res = await fetch(`${API_BASE}/visitors/expected`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to create expected visitor');
  }
  return await res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return await res.json();
  } catch {
    return {
      hourly_risk: [
        { hour: '00:00', avg_score: 12, alert_count: 0 },
        { hour: '04:00', avg_score: 18, alert_count: 1 },
        { hour: '08:00', avg_score: 45, alert_count: 4 },
        { hour: '12:00', avg_score: 30, alert_count: 2 },
        { hour: '16:00', avg_score: 55, alert_count: 6 },
        { hour: '20:00', avg_score: 72, alert_count: 8 },
      ],
      zone_breakdown: [
        { zone: 'Restricted Boundary', count: 18 },
        { zone: 'North Gate Access', count: 12 },
        { zone: 'Building A Reception', count: 5 },
        { zone: 'Amenities Area', count: 3 },
      ],
      identity_distribution: [
        { type: 'RESIDENT', count: 85 },
        { type: 'EXPECTED_VISITOR', count: 34 },
        { type: 'CONTRACTOR', count: 14 },
        { type: 'UNRECOGNIZED', count: 22 },
      ],
      resolution_stats: [
        { status: 'LEGITIMATE', count: 24 },
        { status: 'ESCALATED', count: 5 },
        { status: 'RESOLVED', count: 11 },
      ],
    };
  }
}
