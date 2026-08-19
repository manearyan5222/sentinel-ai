export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CameraStatus = 'ACTIVE' | 'ONLINE' | 'OFFLINE' | 'DEGRADED';
export type CameraStreamType = 'DEMO' | 'WEBCAM' | 'RTSP';

export interface Camera {
  id: string;
  name: string;
  location_zone: string;
  stream_type: CameraStreamType;
  source_path: string;
  status: CameraStatus;
  is_restricted_zone: boolean;
  active_tracks_count: number;
  fps: number;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  is_enabled: boolean;
  description?: string;
  created_at: string;
}

export type ZoneType = 'PUBLIC' | 'LOBBY' | 'RESTRICTED' | 'SERVER_ROOM' | 'PARKING' | 'STAFF_ONLY';

export interface Zone {
  id: string;
  camera_id: string;
  name: string;
  zone_type: ZoneType;
  severity: Severity;
  is_restricted: boolean;
  polygon_coordinates: number[][]; // normalized [x, y] coordinates
  max_dwell_seconds: number;
  rules?: Record<string, any>;
  created_at: string;
}

export type IdentityType = 'RESIDENT' | 'EXPECTED_VISITOR' | 'CONTRACTOR' | 'STAFF' | 'VIP' | 'UNRECOGNIZED' | 'UNAUTHORIZED_ZONE' | 'EXPIRED_PASS';

export interface AuthorizedPerson {
  id: string;
  full_name: string;
  identity_type: IdentityType;
  unit_number?: string;
  photo_url?: string;
  access_level: string;
  allowed_zones?: string[];
  notes?: string;
  created_at: string;
}

export type VisitorStatus = 'PENDING' | 'ACTIVE' | 'CHECKED_IN' | 'EXPIRED' | 'REVOKED';

export interface ExpectedVisitor {
  id: string;
  pass_id?: string;
  visitor_name: string;
  resident_host_name: string;
  unit_number: string;
  purpose: string;
  vehicle_number?: string;
  allowed_zones?: string[];
  valid_from: string;
  valid_until: string;
  status: VisitorStatus;
  qr_code_data?: string;
  created_at: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionEvent {
  id: string;
  camera_id: string;
  camera_name?: string;
  location_zone?: string;
  timestamp: string;
  track_id: string;
  person_id?: string;
  person_name?: string;
  identity_type: IdentityType;
  confidence: number;
  risk_score: number;
  risk_level: RiskLevel;
  risk_reasons: string[];
  bounding_box: BoundingBox;
  snapshot_url?: string;
  dwell_time_seconds: number;
}

export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE' | 'LEGITIMATE' | 'ESCALATED';

export interface AIExplanation {
  summary: string;
  risk_explanation: string;
  recommended_action: string;
  verification_steps: string[];
  uncertainty: string;
  cached?: boolean;
}

export interface Alert {
  id: string;
  event_id: string;
  camera_id: string;
  camera_name?: string;
  location_zone?: string;
  risk_score: number;
  risk_level: RiskLevel;
  severity: Severity;
  risk_reasons: string[];
  entity_label: string;
  identity_type: IdentityType;
  dwell_time_seconds: number;
  status: AlertStatus;
  assigned_user_id?: string;
  guard_notes?: string;
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  action_protocol: {
    who: string;
    where: string;
    when: string;
    what: string;
    why: string[];
    recommended_action: string;
  };
  snapshot_url?: string;
  ai_summary?: string;
  ai_risk_explanation?: string;
  ai_recommended_action?: string;
  ai_verification_steps?: string[];
  ai_uncertainty?: string;
  ai_explanation?: AIExplanation;
}

export type IncidentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface IncidentTimelineEvent {
  id: string;
  incident_id: string;
  timestamp: string;
  event_type: string;
  description: string;
  data?: Record<string, any>;
}

export interface Incident {
  id: string;
  title: string;
  camera_id: string;
  alert_id?: string;
  severity: Severity;
  status: IncidentStatus;
  assigned_to?: string;
  risk_score: number;
  incident_type: string;
  summary: string;
  ai_summary?: string;
  root_cause?: string;
  guard_notes?: string;
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  timeline?: IncidentTimelineEvent[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id?: string;
  username: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'GUARD' | 'SUPERVISOR' | 'ADMIN';
  badge_number?: string;
  created_at: string;
  last_login?: string;
}

export interface AIStatus {
  status: 'ONLINE' | 'DISABLED' | 'ERROR' | 'RATE_LIMITED';
  message: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  referencedAlerts?: string[];
  timestamp: string;
}

export interface SystemStatus {
  ai_device: 'CUDA_GPU' | 'CPU';
  device_name: string;
  active_cameras: number;
  total_cameras: number;
  active_alerts: number;
  today_detections: number;
  fps: number;
  cpu_usage_percent?: number;
  ram_usage_percent?: number;
  server_time?: string;
}

export interface AnalyticsSummary {
  hourly_risk: { hour: string; avg_score: number; alert_count: number }[];
  risk_distribution: { level: string; count: number }[];
  camera_performance: { camera_id: string; alert_count: number }[];
  incident_types: { type: string; count: number }[];
  response_times: {
    avg_acknowledge_seconds: number;
    avg_resolve_seconds: number;
  };
  resolution_stats: { status: string; count: number }[];
  summary?: {
    total_alerts: number;
    total_incidents: number;
    active_cameras: number;
    registered_residents: number;
    expected_visitors: number;
  };
}
