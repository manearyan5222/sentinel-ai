import math
import time
from typing import Dict, List, Tuple, Any

class CentroidTracker:
    def __init__(self, max_disappeared: int = 45, max_distance: float = 120.0):
        self.next_object_id = 100
        self.objects: Dict[str, Tuple[int, int]] = {} # object_id -> centroid (x, y)
        self.disappeared: Dict[str, int] = {} # object_id -> frame_count
        self.bboxes: Dict[str, List[int]] = {} # object_id -> [x, y, w, h]
        self.dwell_times: Dict[str, int] = {} # object_id -> seconds
        self.first_seen: Dict[str, float] = {} # object_id -> timestamp
        self.zone_history: Dict[str, List[str]] = {} # object_id -> list of zone names
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance

    def register(self, centroid: Tuple[int, int], bbox: List[int]) -> str:
        object_id = f"TRACK-#{self.next_object_id:04d}"
        self.objects[object_id] = centroid
        self.disappeared[object_id] = 0
        self.bboxes[object_id] = bbox
        self.dwell_times[object_id] = 1
        self.first_seen[object_id] = time.time()
        self.zone_history[object_id] = []
        self.next_object_id += 1
        return object_id

    def deregister(self, object_id: str):
        if object_id in self.objects:
            del self.objects[object_id]
        if object_id in self.disappeared:
            del self.disappeared[object_id]
        if object_id in self.bboxes:
            del self.bboxes[object_id]
        if object_id in self.dwell_times:
            del self.dwell_times[object_id]
        if object_id in self.first_seen:
            del self.first_seen[object_id]
        if object_id in self.zone_history:
            del self.zone_history[object_id]

    def update(self, rects: List[List[int]]) -> Tuple[Dict[str, List[int]], Dict[str, int]]:
        """
        Updates tracked objects given detection bounding boxes rects = [[x, y, w, h], ...]
        Returns: (bboxes_dict, dwell_times_dict)
        """
        now = time.time()

        if len(rects) == 0:
            for object_id in list(self.disappeared.keys()):
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    self.deregister(object_id)
            return self.bboxes, self.dwell_times

        input_centroids = []
        for (x, y, w, h) in rects:
            cX = int(x + w / 2.0)
            cY = int(y + h / 2.0)
            input_centroids.append((cX, cY))

        if len(self.objects) == 0:
            for i in range(len(input_centroids)):
                self.register(input_centroids[i], rects[i])
        else:
            object_ids = list(self.objects.keys())
            object_centroids = list(self.objects.values())

            # Distance matrix computation
            D = []
            for (cX, cY) in input_centroids:
                row = []
                for (oX, oY) in object_centroids:
                    dist = math.hypot(cX - oX, cY - oY)
                    row.append(dist)
                D.append(row)

            used_rows = set()
            used_cols = set()

            # Match greedily based on minimum centroid Euclidean distance
            for i in range(len(input_centroids)):
                min_dist = float('inf')
                min_row, min_col = -1, -1
                for r in range(len(input_centroids)):
                    if r in used_rows:
                        continue
                    for c in range(len(object_ids)):
                        if c in used_cols:
                            continue
                        if D[r][c] < min_dist:
                            min_dist = D[r][c]
                            min_row, min_col = r, c

                if min_dist < self.max_distance:
                    used_rows.add(min_row)
                    used_cols.add(min_col)
                    object_id = object_ids[min_col]
                    self.objects[object_id] = input_centroids[min_row]
                    self.bboxes[object_id] = rects[min_row]
                    self.disappeared[object_id] = 0
                    
                    # Update dwell time in seconds based on elapsed wall time
                    elapsed = max(1, int(now - self.first_seen.get(object_id, now)))
                    self.dwell_times[object_id] = elapsed

            # Register any unmatched new detections
            for r in range(len(input_centroids)):
                if r not in used_rows:
                    self.register(input_centroids[r], rects[r])

        return self.bboxes, self.dwell_times
