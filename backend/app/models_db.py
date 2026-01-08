from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from sqlalchemy.sql import func
from .database import Base

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filename = Column(String, index=True)
    # total_amount was for currency, not needed for masks but we can keep it as num_detections for utility?
    # Let's remove it to be clean.
    detections_data = Column(JSON)  # Store detailed bounding boxes/classes as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())
