import cv2
import numpy as np
import os

def create_demo_video(output_path="sample_data/demo_security.mp4", duration_sec=15, fps=30):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 1280, 720
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    total_frames = duration_sec * fps
    
    print(f"Generating synthetic security video at {output_path} ({total_frames} frames)...")

    for i in range(total_frames):
        # Create dark CCTV security background
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[:] = (20, 24, 33) # Dark Slate SOC color

        # Draw security grid floor
        for y in range(400, height, 40):
            cv2.line(frame, (0, y), (width, y), (35, 45, 60), 1)
        for x in range(0, width, 80):
            cv2.line(frame, (x, 400), (x, height), (35, 45, 60), 1)

        # Draw Restricted Zone Boundary Line
        cv2.rectangle(frame, (800, 150), (1200, 650), (30, 30, 90), 2)
        cv2.putText(frame, "RESTRICTED BOUNDARY ZONE", (810, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (50, 50, 220), 2)

        # Draw Walking Person 1 (Authorized Resident)
        p1_x = int(100 + (i * 3) % (width - 200))
        p1_y = int(350 + np.sin(i / 10) * 15)
        # Person silhouette: Head & body
        cv2.circle(frame, (p1_x, p1_y), 20, (180, 200, 220), -1)
        cv2.rectangle(frame, (p1_x - 22, p1_y + 20), (p1_x + 22, p1_y + 110), (160, 180, 200), -1)

        # Draw Walking Person 2 (Unrecognized in Restricted Zone)
        p2_x = int(950 + np.cos(i / 15) * 60)
        p2_y = int(380 + np.sin(i / 15) * 40)
        cv2.circle(frame, (p2_x, p2_y), 22, (100, 120, 240), -1)
        cv2.rectangle(frame, (p2_x - 25, p2_y + 22), (p2_x + 25, p2_y + 120), (80, 100, 220), -1)

        # On-screen CCTV timestamp & Watermark
        cv2.putText(frame, f"CAM-02 PERIMETER SOUTH | FRAME #{i:04d}", (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 200), 2)
        cv2.putText(frame, "SENTINEL-AI CV ENGINE DEMO FEED", (30, 680), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (120, 140, 160), 1)

        out.write(frame)

    out.release()
    print("Demo video created successfully!")

if __name__ == "__main__":
    create_demo_video()
