import cv2
import time
import os
import numpy as np
from typing import List, Dict, Any, Optional
from app.ai.detector import person_detector
from app.ai.tracker import CentroidTracker
from app.ai.identity import identity_matcher
from app.ai.risk_engine import risk_engine
from app.ai.zone_engine import zone_engine

class CameraStreamProcessor:
    def __init__(
        self,
        camera_id: str,
        name: str,
        source_path: str,
        is_restricted: bool = False,
        stream_type: str = "DEMO",
        zones: Optional[List[Dict[str, Any]]] = None
    ):
        self.camera_id = camera_id
        self.name = name
        self.source_path = source_path
        self.is_restricted = is_restricted
        self.stream_type = stream_type
        self.zones = zones or []
        self.tracker = CentroidTracker()
        self.active_tracks: Dict[str, Any] = {}
        self.measured_fps = 30.0
        self.frame_count = 0
        self.last_fps_time = time.time()

    def update_zones(self, zones: List[Dict[str, Any]]):
        self.zones = zones

    def generate_frames(self):
        # Open OpenCV video source
        cap = None
        if self.stream_type == "WEBCAM":
            try:
                cap = cv2.VideoCapture(int(self.source_path))
            except Exception:
                cap = cv2.VideoCapture(0)
        else:
            if os.path.exists(self.source_path):
                cap = cv2.VideoCapture(self.source_path)

        frame_idx = 0
        fps_start = time.time()
        fps_frames = 0

        while True:
            t0 = time.time()
            if cap is not None and cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0) # Loop video
                    ret, frame = cap.read()
                    if not ret:
                        frame = self._draw_fallback_frame(frame_idx)
            else:
                frame = self._draw_fallback_frame(frame_idx)

            frame_idx += 1
            fps_frames += 1

            # Measure real FPS every 15 frames
            if fps_frames >= 15:
                now = time.time()
                elapsed = now - fps_start
                if elapsed > 0:
                    self.measured_fps = round(fps_frames / elapsed, 1)
                fps_start = now
                fps_frames = 0

            h_frame, w_frame = frame.shape[:2]

            # 1. Draw Defined Polygon Zones
            for z in self.zones:
                coords = z.get("polygon_coordinates") or []
                if len(coords) >= 3:
                    pts = []
                    for c in coords:
                        px = int(c[0] * w_frame) if c[0] <= 1.0 else int(c[0])
                        py = int(c[1] * h_frame) if c[1] <= 1.0 else int(c[1])
                        pts.append([px, py])
                    pts_np = np.array(pts, np.int32).reshape((-1, 1, 2))
                    
                    z_sev = z.get("severity", "HIGH")
                    poly_color = (0, 0, 220) if z_sev == "CRITICAL" else (0, 140, 255) if z_sev == "HIGH" else (0, 200, 0)
                    
                    # Draw semi-transparent zone boundary
                    cv2.polylines(frame, [pts_np], isClosed=True, color=poly_color, thickness=2)
                    cv2.putText(frame, f"ZONE: {z.get('name', 'Restricted')}", (pts[0][0] + 5, max(20, pts[0][1] - 5)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.45, poly_color, 1)

            # 2. Run Computer Vision Pipeline on Frame
            detections = person_detector.detect_persons(frame)
            bboxes = [d['bbox'] for d in detections]
            tracked_boxes, dwell_times = self.tracker.update(bboxes)

            # 3. Draw AI bounding boxes, track IDs, identity match & risk overlays
            for track_id, bbox in tracked_boxes.items():
                x, y, w, h = bbox
                dwell = dwell_times.get(track_id, 1)

                # Check if subject is inside any defined polygon zone
                matched_zone = zone_engine.check_zone_membership(bbox, self.zones, w_frame, h_frame)
                in_restricted = self.is_restricted or (matched_zone is not None and matched_zone.get("is_restricted", True))
                z_name = matched_zone.get("name") if matched_zone else None

                identity_res = identity_matcher.match_identity(track_id, in_restricted, zone_name=z_name)
                
                risk_res = risk_engine.compute_risk(
                    identity_type=identity_res["identity_type"],
                    is_restricted_zone=in_restricted,
                    dwell_time_seconds=dwell,
                    has_expected_pass=identity_res.get("has_valid_pass", False),
                    zone_type=matched_zone.get("zone_type", "RESTRICTED") if matched_zone else ("RESTRICTED" if in_restricted else "PUBLIC"),
                    zone_severity=matched_zone.get("severity", "HIGH") if matched_zone else ("HIGH" if in_restricted else "LOW")
                )

                score = risk_res["risk_score"]
                level = risk_res["risk_level"]

                # Determine box color based on risk score
                if score >= 80:
                    box_color = (0, 0, 230)      # Crimson Red (CRITICAL)
                elif score >= 60:
                    box_color = (60, 60, 240)    # Amber Rose (HIGH)
                elif score >= 30:
                    box_color = (0, 165, 255)    # Warning Amber (MEDIUM)
                else:
                    box_color = (80, 200, 40)    # Emerald Green (LOW)

                # Draw bounding box
                cv2.rectangle(frame, (x, y), (x + w, y + h), box_color, 2)

                # Draw header label box
                label_text = f"{identity_res['person_name']} [{score} - {level}]"
                cv2.rectangle(frame, (x, max(0, y - 24)), (x + len(label_text) * 9, max(24, y)), box_color, -1)
                cv2.putText(frame, label_text, (x + 4, max(16, y - 7)), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1)

                # Draw Track ID footer
                cv2.putText(frame, f"{track_id} (Dwell: {dwell}s)", (x, y + h + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)

            # Draw Camera Banner with Real Measured FPS
            cv2.putText(frame, f"CAM: {self.name} | FPS: {self.measured_fps} | TRACKS: {len(tracked_boxes)}", (15, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 180), 2)

            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

            # Sleep slightly to maintain steady frame pacing
            dt = time.time() - t0
            sleep_time = max(0.005, 0.033 - dt)
            time.sleep(sleep_time)

    def _draw_fallback_frame(self, frame_idx: int) -> np.ndarray:
        height, width = 720, 1280
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[:] = (18, 24, 38)
        # Synthetic grid lines
        for y in range(0, height, 60):
            cv2.line(frame, (0, y), (width, y), (30, 40, 55), 1)
        for x in range(0, width, 60):
            cv2.line(frame, (x, 0), (x, height), (30, 40, 55), 1)

        cv2.putText(frame, f"SIMULATED FEED: {self.name} #{frame_idx:04d}", (40, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 220, 255), 2)
        return frame
