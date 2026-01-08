from ultralytics import YOLO
import cv2
import os

# Load model once
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "best.pt")
model = YOLO(MODEL_PATH)

def run_inference(image_path, filename, output_dir=None):
    print(f"Running inference on: {image_path}")
    # Run inference with lower confidence threshold
    results = model(image_path, conf=0.15)[0]
    
    print(f"Raw results detected: {len(results.boxes)} boxes")
    
    detections = []
    
    for box in results.boxes:
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])
        name = model.names[cls_id]
        
        
        detections.append({
            "class": name,
            "confidence": conf,
            "box": box.xyxy[0].tolist()
        })
        
    # Save annotated image
    # Plot results on the image (BGR numpy array)
    im_array = results.plot()
    
    # Ensure output filename
    if output_dir:
        output_path = os.path.join(output_dir, filename)
        # Save image using OpenCV
        cv2.imwrite(output_path, im_array)
        return detections, output_path
    
    return detections, image_path
