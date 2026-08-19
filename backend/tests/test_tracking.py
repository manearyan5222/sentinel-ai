import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.ai.tracker import CentroidTracker
from app.ai.zone_engine import is_point_in_polygon, zone_engine

def test_centroid_tracker_registration():
    tracker = CentroidTracker()
    rects = [[100, 100, 50, 100], [300, 200, 60, 120]]
    bboxes, dwell = tracker.update(rects)
    assert len(bboxes) == 2
    assert len(tracker.objects) == 2

def test_centroid_tracker_persistence():
    tracker = CentroidTracker()
    rects1 = [[100, 100, 50, 100]]
    bboxes1, _ = tracker.update(rects1)
    track_id = list(bboxes1.keys())[0]

    # Slight movement
    rects2 = [[105, 102, 50, 100]]
    bboxes2, _ = tracker.update(rects2)
    assert track_id in bboxes2

def test_polygon_intersection():
    # Square polygon from (0,0) to (10,10)
    polygon = [[0.0, 0.0], [10.0, 0.0], [10.0, 10.0], [0.0, 10.0]]
    assert is_point_in_polygon((5.0, 5.0), polygon) is True
    assert is_point_in_polygon((15.0, 5.0), polygon) is False

def test_zone_membership_evaluation():
    zones = [{
        "name": "Restricted Sector",
        "polygon_coordinates": [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]],
        "severity": "HIGH",
        "is_restricted": True
    }]
    # Bounding box inside 1280x720 frame
    bbox = [100, 100, 50, 100]
    matched = zone_engine.check_zone_membership(bbox, zones, frame_width=1280, frame_height=720)
    assert matched is not None
    assert matched["name"] == "Restricted Sector"
