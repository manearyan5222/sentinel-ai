import cv2
import numpy as np
from app.ai.device_manager import device_manager

class PersonDetector:
    def __init__(self):
        self.model = None
        self.is_yolo_loaded = False
        self._init_yolo()

    def _init_yolo(self):
        try:
            from ultralytics import YOLO
            # Load nano model, automatically uses CUDA if available, CPU otherwise
            self.model = YOLO('yolov8n.pt')
            device = 'cuda' if device_manager.has_cuda else 'cpu'
            self.model.to(device)
            self.is_yolo_loaded = True
            print(f"[SentinelAI Detector] YOLOv8 loaded successfully on {device.upper()}")
        except Exception as e:
            print(f"[SentinelAI Detector] YOLO loading notice ({e}). Using OpenCV HOG/mobile detector fallback.")
            self.is_yolo_loaded = False
            self.hog = cv2.HOGDescriptor()
            self.hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

    def detect_persons(self, frame):
        """
        Detects persons in the frame.
        Returns list of dicts: [{ 'bbox': [x, y, w, h], 'confidence': float }]
        """
        detections = []
        if frame is None:
            return detections

        if self.is_yolo_loaded and self.model:
            try:
                results = self.model(frame, verbose=False, classes=[0]) # 0 is person class in COCO
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        x1, y1, x2, y2 = box.xyxy[0].tolist()
                        conf = float(box.conf[0])
                        if conf > 0.35:
                            w = int(x2 - x1)
                            h = int(y2 - y1)
                            detections.append({
                                'bbox': [int(x1), int(y1), w, h],
                                'confidence': round(conf, 2)
                            })
                return detections
            except Exception as e:
                pass

        # Fallback to OpenCV HOG People Detector if YOLO model is offline
        try:
            boxes, weights = self.hog.detectMultiScale(frame, winStride=(8, 8), padding=(4, 4), scale=1.05)
            for (x, y, w, h), weight in zip(boxes, weights):
                if weight > 0.3:
                    detections.append({
                        'bbox': [int(x), int(y), int(w), int(h)],
                        'confidence': round(float(weight), 2)
                    })
        except Exception:
            pass

        return detections

person_detector = PersonDetector()
