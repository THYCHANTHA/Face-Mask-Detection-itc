from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import crud, models_db, schemas, database, detection
import shutil
import os
import uuid
from datetime import datetime

models_db.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
RESULTS_DIR = "results"

for dir_path in [UPLOAD_DIR, RESULTS_DIR]:
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Face Mask Detection API is running"}

@app.post("/detect/", response_model=schemas.DetectionResult)
async def detect_mask(
    file: UploadFile = File(...), 
    store: bool = True, 
    db: Session = Depends(get_db)
):
    # 1. Save File
    file_ext = file.filename.split(".")[-1]
    unique_filename = f"itc_adv_group5_{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 2. Run Inference
    # Only save annotated result if we are storing the record
    target_output_dir = RESULTS_DIR if store else None
    
    detections, annotated_image_path = detection.run_inference(file_path, unique_filename, output_dir=target_output_dir)
    
    # 3. Save to DB (Optional) or Cleanup
    if store:
        db_record = crud.create_detection_record(db, unique_filename, detections)
        return {
            "id": db_record.id,
            "filename": unique_filename,
            "detections_data": detections,
            "created_at": db_record.created_at
        }
    else:
        # Cleanup uploaded file if not storing
        if os.path.exists(file_path):
            os.remove(file_path)
            
        # Return ephemeral result without DB ID
        return {
            "id": 0, # 0 indicates not saved to history
            "filename": unique_filename,
            "detections_data": detections,
            "created_at": datetime.now()
        }

@app.get("/history/", response_model=list[schemas.DetectionResult])
def read_history(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    history = crud.get_history(db, skip=skip, limit=limit)
    # Parse the JSON detections back if needed (though Pydantic handles it if defined right)
    return history
