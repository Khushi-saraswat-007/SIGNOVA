from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from app.database import engine, Base
from app.routers import auth, detection, history, settings
from app.services.detection_service import DetectionService
from collections import deque, Counter
import base64
import numpy as np
import cv2
import json

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Signova API",
    description="AI-Based Sign Language Recognition System",
    version="2.0.0"
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://signova-vert.vercel.app",
    "https://*.vercel.app",
]

# ── CORS Middleware ───────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://signova-vert.vercel.app",
    "https://*.vercel.app",
]

class CORSMiddlewareCustom(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")
        allow_origin = origin if any(
            origin == o or (o.startswith("https://*.") and origin.endswith(o[8:]))
            for o in ALLOWED_ORIGINS
        ) else "http://localhost:5173"

        if request.method == "OPTIONS":
            return Response(
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin":      allow_origin,
                    "Access-Control-Allow-Methods":     "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                    "Access-Control-Allow-Headers":     "Content-Type, Authorization, Accept, Origin",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age":           "3600",
                }
            )
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"]      = allow_origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

app.add_middleware(CORSMiddlewareCustom)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/api/auth",      tags=["Authentication"])
app.include_router(detection.router, prefix="/api/detection", tags=["Detection"])
app.include_router(history.router,   prefix="/api/history",   tags=["History"])
app.include_router(settings.router,  prefix="/api/settings",  tags=["Settings"])

# ── Load AI models once on startup ────────────────────────────────────────────
detector = DetectionService()

# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "Welcome to Signova API v2.0",
        "status":  "running",
        "docs":    "/docs",
        "models":  {
            "signs":     detector.model_loaded,
            "sentences": detector.lstm_loaded
        }
    }

# ── Model status endpoint ─────────────────────────────────────────────────────
@app.get("/api/status")
def status():
    return {
        "rf_model_loaded":   detector.model_loaded,
        "lstm_model_loaded": detector.lstm_loaded,
        "mediapipe_loaded":  detector.landmarker is not None
    }

# ── WebSocket — supports both sign and sentence mode ─────────────────────────
@app.websocket("/ws/detect")
async def websocket_detect(websocket: WebSocket):
    await websocket.accept()

    # Per-connection state
    last_sign     = None
    no_hand_count = 0
    vote_buffer   = deque(maxlen=12)
    current_mode  = "sign"   # default mode — switch via message

    print("✅ WebSocket client connected")

    try:
        while True:
            try:
                data = await websocket.receive_text()
            except Exception:
                break

            try:
                # ── Check if this is a MODE SWITCH message ────────────
                # Frontend sends: { "type": "mode", "mode": "sentence" }
                # or just base64 frame string as usual
                if data.startswith("{"):
                    try:
                        msg = json.loads(data)
                        if msg.get("type") == "mode":
                            new_mode = msg.get("mode", "sign")
                            if new_mode != current_mode:
                                current_mode  = new_mode
                                last_sign     = None
                                no_hand_count = 0
                                vote_buffer.clear()
                                detector.reset_sequence()
                                print(f"🔄 Mode switched to: {current_mode}")
                            await websocket.send_json({
                                "type": "mode_confirmed",
                                "mode": current_mode
                            })
                        continue
                    except json.JSONDecodeError:
                        pass

                # ── Process frame ─────────────────────────────────────
                header, encoded = data.split(",", 1)
                img_bytes = base64.b64decode(encoded)
                nparr     = np.frombuffer(img_bytes, np.uint8)
                frame     = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if frame is None:
                    continue

                # ── Predict based on current mode ─────────────────────
                result = detector.predict(frame, mode=current_mode)

                # ── SENTENCE MODE — LSTM ──────────────────────────────
                if current_mode == "sentence":
                    if result:
                        no_hand_count = 0
                        is_new = result["sign"] != last_sign
                        if is_new:
                            last_sign = result["sign"]
                        await websocket.send_json({
                            "sign":       result["sign"],
                            "confidence": result["confidence"],
                            "is_new":     is_new,
                            "mode":       "sentence"
                        })
                    else:
                        no_hand_count += 1
                        if no_hand_count >= 10:  # more patience for sentences
                            last_sign = None
                            await websocket.send_json({
                                "sign": "", "confidence": 0,
                                "is_new": False, "mode": "sentence"
                            })
                        else:
                            await websocket.send_json({
                                "sign": "", "confidence": 0,
                                "is_new": False, "mode": "sentence"
                            })
                    continue

                # ── SIGN MODE — Random Forest with vote buffer ────────
                if result:
                    no_hand_count = 0
                    vote_buffer.append(result["sign"])
                else:
                    no_hand_count += 1
                    vote_buffer.append(None)

                    if no_hand_count >= 5:
                        vote_buffer.clear()
                        last_sign = None
                        await websocket.send_json({
                            "sign": "", "confidence": 0,
                            "is_new": False, "mode": "sign"
                        })
                        continue

                valid = [v for v in vote_buffer if v is not None]

                if len(valid) < 6:
                    await websocket.send_json({
                        "sign": "", "confidence": 0,
                        "is_new": False, "mode": "sign"
                    })
                    continue

                counts              = Counter(valid)
                top_sign, top_count = counts.most_common(1)[0]

                if top_count >= int(len(valid) * 0.75):
                    is_new = top_sign != last_sign
                    if is_new:
                        last_sign = top_sign
                    await websocket.send_json({
                        "sign":       top_sign,
                        "confidence": result["confidence"] if result else 0,
                        "is_new":     is_new,
                        "mode":       "sign"
                    })
                else:
                    last_sign = None
                    await websocket.send_json({
                        "sign": "", "confidence": 0,
                        "is_new": False, "mode": "sign"
                    })

            except Exception as e:
                if "disconnect" in str(e).lower() or "closed" in str(e).lower():
                    break
                print(f"Frame error: {e}")
                continue

    except WebSocketDisconnect:
        print("❌ Client disconnected")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
    finally:
        vote_buffer.clear()
        detector.reset_sequence()
        print("❌ WebSocket closed")