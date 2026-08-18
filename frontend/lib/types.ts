export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';

export type CameraStatus = 'ACTIVE' | 'OFFLINE' | 'WARNING';
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
  created_at: string;
}

export type IdentityType = 'RESIDENT' | 'EXPECTED_VISITOR' | 'CONTRACTOR' | 'UNRECOGNIZED';

export interface AuthorizedPerson {
  id: string;
  full_name: string;
  identity_type: IdentityType;
  unit_number?: string;
  photo_url?: string;
  access_level: string;
  notes?: string;
  created_at: string;
}

export interface ExpectedVisitor {
  id: string;
  visitor_name: string;
  resident_host_name: string;
  unit_number: string;
  vehicle_number?: string;
  valid_from: string;
  valid_until: string;
  status: 'PENDING' | 'CHECKED_IN' | 'EXPIRED';
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
  camera_name: string;
  location_zone: string;
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

export type AlertStatus = 'ACTIVE' | 'LEGITIMATE' | 'ESCALATED' | 'RESOLVED';

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
  camera_name: string;
  location_zone: string;
  risk_score: number;
  risk_level: RiskLevel;
  risk_reasons: string[];
  entity_label: string;
  identity_type: IdentityType;
  dwell_time_seconds: number;
  status: AlertStatus;
  guard_notes?: string;
  created_at: string;
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
  ai_explanation?: AIExplanation;
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
}

export interface AnalyticsSummary {
  hourly_risk: { hour: string; avg_score: number; alert_count: number }[];
  zone_breakdown: { zone: string; count: number }[];
  identity_distribution: { type: string; count: number }[];
  resolution_stats: { status: string; count: number }[];
}
