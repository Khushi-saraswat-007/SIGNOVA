from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class DetectionHistory(Base):
    __tablename__ = "detection_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_name = Column(String, default="Untitled Session")
    detected_signs = Column(Text, default="")
    session_type = Column(String, default="detection")
    duration = Column(String, default="0 mins")
    created_at = Column(DateTime, server_default=func.now())