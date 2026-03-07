from pydantic import BaseModel
from typing import List, Optional

class DetectionResult(BaseModel):
    sign: str
    confidence: float
    is_new: bool

class HistoryCreate(BaseModel):
    session_name: str
    detected_signs: str
    session_type: str
    duration: str

class HistoryResponse(BaseModel):
    id: int
    session_name: str
    detected_signs: str
    session_type: str
    duration: str
    created_at: str

    class Config:
        from_attributes = True