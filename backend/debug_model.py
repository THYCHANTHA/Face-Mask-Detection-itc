from ultralytics import YOLO
import os

model_path = r"d:\I5\advance_programming\Face-Mask-Detection\backend\app\models\best.pt"

if os.path.exists(model_path):
    try:
        model = YOLO(model_path)
        print("Model Classes:", model.names)
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print(f"Model file not found at {model_path}")
