from sqlalchemy.orm import Session
from . import models_db, schemas

def create_detection_record(db: Session, filename: str, detections: list):
    db_detection = models_db.Detection(
        filename=filename,
        detections_data=detections
    )
    db.add(db_detection)
    db.commit()
    db.refresh(db_detection)
    return db_detection

def get_history(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models_db.Detection).order_by(models_db.Detection.created_at.desc()).offset(skip).limit(limit).all()
