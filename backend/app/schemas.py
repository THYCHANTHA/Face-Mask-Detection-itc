from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

class DetectionItem(BaseModel):
    class_name: str
    confidence: float

class DetectionBase(BaseModel):
    filename: str

class DetectionCreate(DetectionBase):
    detections_data: List[Dict[str, Any]]

class DetectionResult(DetectionBase):
    id: int
    detections_data: List[Dict[str, Any]] = [] 
    created_at: datetime

    class Config:
        from_attributes = True
