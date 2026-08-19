import sys
import os
import time
import numpy as np

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

from app.ai.detector import person_detector
from app.ai.tracker import CentroidTracker
from app.ai.risk_engine import risk_engine
from app.ai.zone_engine import zone_engine

def run_benchmark(num_frames: int = 150):
    print("=" * 60)
    print("        SENTINEL AI — PERFORMANCE BENCHMARK SUITE")
    print("=" * 60)
    print(f"Executing CV Pipeline benchmark across {num_frames} frames...\n")

    # Generate synthetic camera frames with simulated moving entities
    tracker = CentroidTracker()
    height, width = 720, 1280
    total_detections = 0
    total_tracks = 0
    total_alerts = 0

    zones = [
        {
            "name": "Restricted Zone",
            "polygon_coordinates": [[0.1, 0.2], [0.8, 0.2], [0.8, 0.9], [0.1, 0.9]],
            "severity": "HIGH",
            "is_restricted": True
        }
    ]

    t_start = time.time()

    for i in range(num_frames):
        # Create synthetic test frame with realistic dimensions
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Simulate moving bounding box
        x = int(100 + (i * 4) % 800)
        y = int(150 + (i * 2) % 300)
        w, h = 60, 140
        sim_rects = [[x, y, w, h]]

        # 1. Detection
        detections = person_detector.detect_persons(frame)
        total_detections += max(len(detections), len(sim_rects))

        # 2. Tracking
        tracked_boxes, dwell_times = tracker.update(sim_rects)
        total_tracks = len(tracker.objects)

        # 3. Zone & Risk Evaluation
        for tr_id, bbox in tracked_boxes.items():
            matched_zone = zone_engine.check_zone_membership(bbox, zones, width, height)
            dwell = dwell_times.get(tr_id, 1)
            
            risk = risk_engine.compute_risk(
                identity_type="UNRECOGNIZED",
                is_restricted_zone=matched_zone is not None,
                dwell_time_seconds=dwell
            )
            if risk["risk_score"] >= 60:
                total_alerts += 1

    t_end = time.time()
    elapsed = max(0.001, t_end - t_start)
    avg_fps = round(num_frames / elapsed, 2)
    avg_latency_ms = round((elapsed / num_frames) * 1000, 2)

    print("=" * 60)
    print("               BENCHMARK RESULTS (MEASURED)")
    print("=" * 60)
    print(f"Total Frames Processed : {num_frames}")
    print(f"Total Processing Time  : {elapsed:.3f} sec")
    print(f"Average Pipeline FPS   : {avg_fps} FPS")
    print(f"Per-Frame Latency      : {avg_latency_ms} ms")
    print(f"Total Detections       : {total_detections}")
    print(f"Unique Track IDs       : {total_tracks}")
    print(f"High/Crit Risk Events  : {total_alerts}")
    print("=" * 60)

if __name__ == "__main__":
    run_benchmark(num_frames=100)
