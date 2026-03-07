from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.history import DetectionHistory
from app.schemas.detection import HistoryCreate
from typing import List

router = APIRouter()

@router.post("/save")
def save_history(data: HistoryCreate, user_id: int, db: Session = Depends(get_db)):
    history = DetectionHistory(
        user_id=user_id,
        session_name=data.session_name,
        detected_signs=data.detected_signs,
        session_type=data.session_type,
        duration=data.duration
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    return {"message": "Session saved", "id": history.id}

@router.get("/user/{user_id}")
def get_history(user_id: int, db: Session = Depends(get_db)):
    history = db.query(DetectionHistory).filter(
        DetectionHistory.user_id == user_id
    ).order_by(DetectionHistory.created_at.desc()).all()
    return history

@router.delete("/{history_id}")
def delete_history(history_id: int, db: Session = Depends(get_db)):
    item = db.query(DetectionHistory).filter(DetectionHistory.id == history_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(item)
    db.commit()
    return {"message": "Session deleted"}