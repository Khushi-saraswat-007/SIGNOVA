from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, detection, history, settings
from app.services.detection_service import DetectionService
import base64
import numpy as np
import cv2

# Create all database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Signova API",
    description="AI-Based Sign Language Recognition System",
    version="1.0.0"
)

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include all routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(detection.router, prefix="/api/detection", tags=["Detection"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])

# Load AI model once when server starts
detector = DetectionService()

# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Welcome to Signova API",
        "status": "running",
        "docs": "/docs"
    }

# WebSocket for live sign detection
@app.websocket("/ws/detect")
async def websocket_detect(websocket: WebSocket):
    await websocket.accept()
    last_sign = None
    print("✅ WebSocket client connected")

    try:
        while True:
            try:
                data = await websocket.receive_text()
            except Exception:
                break

            try:
                header, encoded = data.split(",", 1)
                img_bytes = base64.b64decode(encoded)
                nparr = np.frombuffer(img_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if frame is None:
                    continue

                result = detector.predict(frame)

                if result:
                    is_new = result["sign"] != last_sign
                    if is_new:
                        last_sign = result["sign"]
                    await websocket.send_json({
                        "sign": result["sign"],
                        "confidence": result["confidence"],
                        "is_new": is_new
                    })
                else:
                    last_sign = None
                    await websocket.send_json({
                        "sign": "",
                        "confidence": 0,
                        "is_new": False
                    })

            except Exception as e:
                print(f"Frame error: {e}")
                continue

    except WebSocketDisconnect:
        print("❌ WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        print("❌ WebSocket closed")