from typing import List, Tuple, Dict, Any, Optional

def is_point_in_polygon(point: Tuple[float, float], polygon: List[List[float]]) -> bool:
    """
    Ray-casting algorithm to determine if a point (x, y) is inside a polygon.
    Polygon coordinates can be normalized [0, 1] or pixel coordinates.
    """
    if len(polygon) < 3:
        return False

    x, y = point
    n = len(polygon)
    inside = False

    p1x, p1y = polygon[0]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y

    return inside

class SpatialZoneEngine:
    def __init__(self):
        pass

    def check_zone_membership(
        self,
        bbox: List[int],
        zones: List[Dict[str, Any]],
        frame_width: int = 1280,
        frame_height: int = 720
    ) -> Optional[Dict[str, Any]]:
        """
        Determines which zone a bounding box belongs to based on bottom-center feet location.
        """
        if not zones or len(bbox) < 4:
            return None

        bx, by, bw, bh = bbox
        # Feet contact point / ground centroid is the most accurate spatial indicator
        foot_x = bx + bw / 2.0
        foot_y = by + bh

        # Normalized coordinates [0.0, 1.0]
        norm_x = foot_x / frame_width
        norm_y = foot_y / frame_height

        for zone in zones:
            coords = zone.get("polygon_coordinates") or []
            if len(coords) >= 3:
                # Check if coordinates are normalized (< 2.0) or pixel values
                is_normalized = all(c[0] <= 1.0 and c[1] <= 1.0 for c in coords)
                test_point = (norm_x, norm_y) if is_normalized else (foot_x, foot_y)
                
                if is_point_in_polygon(test_point, coords):
                    return zone

        return None

zone_engine = SpatialZoneEngine()
