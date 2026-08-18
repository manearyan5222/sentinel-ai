import cv2
import time
import os
import numpy as np
from app.ai.detector import person_detector
from app.ai.tracker import CentroidTracker
from app.ai.identity import identity_matcher
from app.ai.risk_engine import risk_engine

class CameraStreamProcessor:
    def __init__(self, camera_id, name, source_path, is_restricted=False, stream_type="DEMO"):
        self.camera_id = camera_id
        self.name = name
        self.source_path = source_path
        self.is_restricted = is_restricted
        self.stream_type = stream_type
        self.tracker = CentroidTracker()
        self.active_tracks = {}

    def generate_frames(self):
        # Open OpenCV video source
        cap = None
        if self.stream_type == "WEBCAM":
            try:
                cap = cv2.VideoCapture(int(self.source_path))
            except:
                cap = cv2.VideoCapture(0)
        else:
            if os.path.exists(self.source_path):
                cap = cv2.VideoCapture(self.source_path)

        # Fallback generator if video file cap is missing or empty
        frame_idx = 0
        while True:
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

            # Run Computer Vision Pipeline on Frame
            detections = person_detector.detect_persons(frame)
            bboxes = [d['bbox'] for d in detections]
            tracked_boxes, dwell_times = self.tracker.update(bboxes)

            # Draw AI bounding boxes, track IDs, identity match & risk overlays
            for track_id, bbox in tracked_boxes.items():
                x, y, w, h = bbox
                dwell = dwell_times.get(track_id, 1)

                identity_res = identity_matcher.match_identity(track_id, self.is_restricted)
                risk_res = risk_engine.compute_risk(
                    identity_res["identity_type"],
                    self.is_restricted,
                    dwell
                )

                score = risk_res["risk_score"]
                level = risk_res["risk_level"]

                # Determine box color based on risk score
                if score >= 75:
                    box_color = (94, 63, 244) # Rose Red BGR
                elif score >= 50:
                    box_color = (11, 158, 245) # Amber BGR
                else:
                    box_color = (129, 185, 16) # Emerald Green BGR

                # Draw bounding box
                cv2.rectangle(frame, (x, y), (x + w, y + h), box_color, 2)

                # Draw header label box
                label_text = f"{identity_res['person_name']} [{score}]"
                cv2.rectangle(frame, (x, max(0, y - 24)), (x + len(label_text) * 9, max(24, y)), box_color, -1)
                cv2.putText(frame, label_text, (x + 4, max(16, y - 7)), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)

                # Draw Track ID footer
                cv2.putText(frame, f"{track_id} (Dwell: {dwell}s)", (x, y + h + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)

            # Draw Camera Banner
            cv2.putText(frame, f"CAM: {self.name} | AI ACTIVE", (15, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 180), 2)

            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

            time.sleep(0.033) # ~30 FPS

    def _draw_fallback_frame(self, frame_idx):
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
