import cv2
import csv
import os
import time
import numpy as np
import mediapipe as mp
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

# ─── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "ai_model", "hand_landmarker.task")
DATA_FILE  = os.path.join(BASE_DIR, "ai_model", "data", "gesture_data.csv")
os.makedirs(os.path.join(BASE_DIR, "ai_model", "data"), exist_ok=True)

# ─── Download model if needed ────────────────────────────────────────────────
if not os.path.exists(MODEL_PATH):
    print("📥 Downloading MediaPipe hand model...")
    urllib.request.urlretrieve(
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        MODEL_PATH
    )
    print("✅ Downloaded!")

# ─── Signs ───────────────────────────────────────────────────────────────────
SIGNS = [
    #"Good", , "Please", "Help", "Excuse Me",
    #"No", "Stop", "I Love You",
    "Bad","Yes"
]

SAMPLES_PER_SIGN = 500
CAPTURE_DELAY    = 0.08

GUIDES = {
    #"Good"      : "Thumbs UP — keep thumb clearly visible",
    "Bad"       : "Thumbs DOWN — flip hand downward",
    #"Please"    : "Flat hand closed fingers ON chest, circular",
    #"Help"      : "TIGHT FIST only — no open fingers, lift up",
    #"Excuse Me" : "Brush fingers across opposite palm",
    #"No"        : "Index + middle finger, wave side to side",
    "Yes"       : "Fist, nod hand up and down",
    #"Stop"      : "Flat palm SPREAD wide, facing camera",
    #"I Love You": "Thumb + index + pinky extended out",
}

TIPS = {
    #"Good"      : "Vary distance: close, medium, far from camera",
    "Bad"       : "Vary distance: close, medium, far from camera",
    #"Please"    : "Tilt wrist slightly different each round",
    # #"Help"      : "Keep all fingers fully closed — tight fist",
    # "Excuse Me" : "Brush 3-4 times for variety",
    # "No"        : "Keep wrist still, only fingers move side to side",
    "Yes"       : "Small firm nods, keep fist tight",
    #"Stop"      : "Fingers SPREAD wide — starfish shape",
    #"I Love You": "Hold steady, vary distance slightly",
}

# ─── MediaPipe VIDEO mode ─────────────────────────────────────────────────────
base_options = mp_python.BaseOptions(model_asset_path=MODEL_PATH)
options = mp_vision.HandLandmarkerOptions(
    base_options=base_options,
    running_mode=mp_vision.RunningMode.VIDEO,
    num_hands=1,
    min_hand_detection_confidence=0.4,
    min_hand_presence_confidence=0.4,
    min_tracking_confidence=0.4
)

CONNECTIONS = [
    (0,1),(1,2),(2,3),(3,4),
    (0,5),(5,6),(6,7),(7,8),
    (0,9),(9,10),(10,11),(11,12),
    (0,13),(13,14),(14,15),(15,16),
    (0,17),(17,18),(18,19),(19,20),
    (5,9),(9,13),(13,17)
]

executor = ThreadPoolExecutor(max_workers=os.cpu_count())

# ─── KEY CHANGE: Relative feature extraction ─────────────────────────────────
def extract_features(landmarks):
    """
    Extract RELATIVE features — invariant to:
    - Hand distance from camera
    - Hand position in frame
    - Minor scale differences

    Method:
    - All coords relative to wrist (landmark 0)
    - Normalized by hand size (wrist to middle finger base)
    - Model learns hand SHAPE not position
    """
    wrist_x = landmarks[0][0]
    wrist_y = landmarks[0][1]
    wrist_z = landmarks[0][2]

    # Hand size = distance from wrist to middle finger MCP (landmark 9)
    hand_size = np.sqrt(
        (landmarks[9][0] - wrist_x) ** 2 +
        (landmarks[9][1] - wrist_y) ** 2
    )
    if hand_size < 1e-6:
        hand_size = 1e-6

    features = []
    for lm in landmarks:
        features.append((lm[0] - wrist_x) / hand_size)
        features.append((lm[1] - wrist_y) / hand_size)
        features.append((lm[2] - wrist_z) / hand_size)

    return features

# ─── Preprocessing ───────────────────────────────────────────────────────────
def preprocess_frame(frame):
    lab     = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe   = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    l       = clahe.apply(l)
    enhanced = cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2BGR)
    kernel  = np.array([[0, -0.5, 0], [-0.5, 3, -0.5], [0, -0.5, 0]])
    return cv2.filter2D(enhanced, -1, kernel)

def letterbox_frame(frame, size=640):
    h, w     = frame.shape[:2]
    scale    = size / max(h, w)
    nh, nw   = int(h * scale), int(w * scale)
    resized  = cv2.resize(frame, (nw, nh), interpolation=cv2.INTER_LINEAR)
    square   = np.zeros((size, size, 3), dtype=np.uint8)
    pad_top  = (size - nh) // 2
    pad_left = (size - nw) // 2
    square[pad_top:pad_top+nh, pad_left:pad_left+nw] = resized
    return square, scale, pad_top, pad_left

def detect_hand(landmarker, frame, timestamp_ms):
    try:
        h, w      = frame.shape[:2]
        enhanced  = preprocess_frame(frame)
        sq, scale, pad_top, pad_left = letterbox_frame(enhanced, 640)
        rgb       = cv2.cvtColor(sq, cv2.COLOR_BGR2RGB)
        rgb       = np.ascontiguousarray(rgb)
        mp_img    = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result    = landmarker.detect_for_video(mp_img, timestamp_ms)

        if not result.hand_landmarks:
            return None, None

        adjusted = []
        for lm in result.hand_landmarks[0]:
            px = lm.x * 640
            py = lm.y * 640
            ox = (px - pad_left) / scale
            oy = (py - pad_top)  / scale
            adjusted.append((
                max(0.0, min(1.0, ox / w)),
                max(0.0, min(1.0, oy / h)),
                lm.z
            ))
        return adjusted, (w, h)

    except Exception:
        return None, None

# ─── Drawing ─────────────────────────────────────────────────────────────────
def draw_hand(frame, landmarks, scale_info):
    w, h = scale_info
    pts  = [(int(lm[0] * w), int(lm[1] * h)) for lm in landmarks]
    for a, b in CONNECTIONS:
        ax, ay = pts[a]
        bx, by = pts[b]
        if 0<=ax<w and 0<=ay<h and 0<=bx<w and 0<=by<h:
            cv2.line(frame, (ax, ay), (bx, by), (80, 180, 255), 2, cv2.LINE_AA)
    fingertips = {4, 8, 12, 16, 20}
    for i, pt in enumerate(pts):
        if 0 <= pt[0] < w and 0 <= pt[1] < h:
            size  = 8 if i in fingertips else 5
            color = (0, 255, 120) if i in fingertips else (0, 210, 90)
            cv2.circle(frame, pt, size, color, -1, cv2.LINE_AA)
            cv2.circle(frame, pt, size, (255, 255, 255), 1, cv2.LINE_AA)

def draw_progress_bar(frame, count, total, y=138):
    bx, bw, bh = 10, 440, 20
    filled = int((count / total) * bw)
    pct    = int((count / total) * 100)
    cv2.rectangle(frame, (bx, y), (bx+bw, y+bh), (30, 20, 60), -1)
    color = (0, 255, 100) if pct >= 80 else (0, 220, 80) if pct >= 50 else (0, 180, 60)
    if filled > 0:
        cv2.rectangle(frame, (bx, y), (bx+filled, y+bh), color, -1)
    cv2.rectangle(frame, (bx, y), (bx+bw, y+bh), (100, 80, 180), 2)
    cv2.putText(frame, f"{pct}%  ({count}/{total})",
                (bx+bw+12, y+15), cv2.FONT_HERSHEY_SIMPLEX,
                0.55, (200, 200, 220), 1, cv2.LINE_AA)

def draw_ui(frame, sign, count, collecting, hand_detected, fps, sign_idx, total_signs):
    h, w = frame.shape[:2]
    cv2.rectangle(frame, (0, 0), (w, 170), (12, 6, 32), -1)
    cv2.putText(frame, f"Sign  {sign_idx}/{total_signs}:  {sign}",
                (10, 38), cv2.FONT_HERSHEY_SIMPLEX,
                0.95, (140, 180, 255), 2, cv2.LINE_AA)
    fps_color = (0, 255, 120) if fps > 20 else (0, 165, 255)
    cv2.putText(frame, f"FPS {fps:.0f}",
                (w-90, 30), cv2.FONT_HERSHEY_SIMPLEX,
                0.6, fps_color, 1, cv2.LINE_AA)
    if collecting:
        sc = (0, 255, 120) if hand_detected else (0, 165, 255)
        st = "  COLLECTING" if hand_detected else "  NO HAND — show your hand!"
    else:
        sc = (120, 100, 220)
        st = "  PAUSED — Press SPACE to start"
    cv2.rectangle(frame, (8, 50), (8 + len(st)*12 + 10, 78), sc, -1)
    cv2.putText(frame, st, (14, 70),
                cv2.FONT_HERSHEY_SIMPLEX, 0.65, (10, 5, 20), 2, cv2.LINE_AA)
    cv2.putText(frame, f"Collected:  {count} / {SAMPLES_PER_SIGN}",
                (10, 108), cv2.FONT_HERSHEY_SIMPLEX,
                0.65, (200, 200, 220), 1, cv2.LINE_AA)
    draw_progress_bar(frame, count, SAMPLES_PER_SIGN)
    if collecting and not hand_detected:
        bx = w // 2 - 220
        by = h // 2 - 45
        cv2.rectangle(frame, (bx, by), (bx+440, by+90), (0, 30, 100), -1)
        cv2.rectangle(frame, (bx, by), (bx+440, by+90), (0, 165, 255), 2)
        cv2.putText(frame, "  Show your hand clearly!",
                    (bx+20, by+55),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 210, 255), 2, cv2.LINE_AA)
    cv2.rectangle(frame, (0, h-70), (w, h), (12, 6, 32), -1)
    cv2.putText(frame, f"How: {GUIDES.get(sign,'')}",
                (10, h-45), cv2.FONT_HERSHEY_SIMPLEX,
                0.52, (120, 200, 255), 1, cv2.LINE_AA)
    cv2.putText(frame, f"Tip: {TIPS.get(sign,'')}",
                (10, h-22), cv2.FONT_HERSHEY_SIMPLEX,
                0.48, (180, 255, 180), 1, cv2.LINE_AA)
    cv2.putText(frame, "SPACE: start/pause    Q: skip    ESC: quit",
                (w-345, h-8), cv2.FONT_HERSHEY_SIMPLEX,
                0.45, (100, 90, 150), 1, cv2.LINE_AA)
    dot = (0, 255, 150) if hand_detected else (60, 60, 140)
    cv2.circle(frame, (w-22, h-85), 13, dot, -1, cv2.LINE_AA)
    cv2.circle(frame, (w-22, h-85), 13, (255, 255, 255), 1, cv2.LINE_AA)

def countdown(cap, sign_name, landmarker, start_ms):
    for i in range(3, 0, -1):
        for _ in range(20):
            ret, frame = cap.read()
            if not ret: continue
            frame   = cv2.flip(frame, 1)
            h, w    = frame.shape[:2]
            ts      = int(time.time() * 1000) - start_ms
            lms, si = detect_hand(landmarker, frame, ts)
            if lms: draw_hand(frame, lms, si)
            overlay = frame.copy()
            cv2.rectangle(overlay, (0, 0), (w, h), (8, 4, 20), -1)
            cv2.addWeighted(overlay, 0.55, frame, 0.45, 0, frame)
            cv2.putText(frame, f"GET READY:  {sign_name}",
                        (w//2-220, h//2-75),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.0, (120, 180, 255), 2, cv2.LINE_AA)
            cv2.putText(frame, str(i),
                        (w//2-45, h//2+55),
                        cv2.FONT_HERSHEY_SIMPLEX, 4.5, (0, 255, 140), 5, cv2.LINE_AA)
            cv2.putText(frame, GUIDES.get(sign_name, ""),
                        (w//2-220, h//2+115),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.65, (180, 255, 180), 1, cv2.LINE_AA)
            cv2.putText(frame, f"Tip: {TIPS.get(sign_name, '')}",
                        (w//2-220, h//2+145),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 220, 120), 1, cv2.LINE_AA)
            cv2.imshow("Signova Data Collector", frame)
            cv2.waitKey(50)

# ─── Main ────────────────────────────────────────────────────────────────────
print("\n" + "="*58)
print("   SIGNOVA Data Collector — Relative Feature Mode")
print("="*58)
print(f"  CPU cores     : {os.cpu_count()}")
print(f"  Signs         : {SIGNS}")
print(f"  Samples/sign  : {SAMPLES_PER_SIGN}")
print(f"  Feature mode  : RELATIVE (distance+scale invariant)")
print("\n  SPACE = start/pause    Q = skip    ESC = quit")
print("="*58 + "\n")

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH,  640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
cap.set(cv2.CAP_PROP_FPS,          30)
cap.set(cv2.CAP_PROP_BUFFERSIZE,   1)

ret, test_frame = cap.read()
if not ret:
    print("❌ Camera not found! Close other apps using camera.")
    exit()
print(f"✅ Camera ready — {int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))}x{int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))}")
print(f"✅ Feature mode: RELATIVE (wrist-normalized)\n")

file_exists = os.path.exists(DATA_FILE)

with open(DATA_FILE, 'a' if file_exists else 'w', newline='') as f:
    writer = csv.writer(f)
    if not file_exists:
        writer.writerow([f"f{i}" for i in range(63)] + ["label"])

    with mp_vision.HandLandmarker.create_from_options(options) as landmarker:
        start_ms = int(time.time() * 1000)

        for sign_idx, sign in enumerate(SIGNS):
            count       = 0
            collecting  = False
            last_cap    = 0
            fps_time    = time.time()
            fps         = 0
            frame_count = 0

            print(f"\n[{sign_idx+1}/{len(SIGNS)}] → {sign}")
            print(f"  How : {GUIDES.get(sign, '')}")
            print(f"  Tip : {TIPS.get(sign, '')}")
            print("  Press SPACE to start...")

            while count < SAMPLES_PER_SIGN:
                ret, frame = cap.read()
                if not ret:
                    time.sleep(0.05)
                    continue

                frame = cv2.flip(frame, 1)

                frame_count += 1
                if frame_count % 20 == 0:
                    fps      = 20 / (time.time() - fps_time + 1e-6)
                    fps_time = time.time()

                ts     = int(time.time() * 1000) - start_ms
                future = executor.submit(detect_hand, landmarker, frame, ts)
                landmarks, scale_info = future.result()
                hand_detected = landmarks is not None

                if hand_detected:
                    draw_hand(frame, landmarks, scale_info)

                draw_ui(frame, sign, count, collecting, hand_detected,
                        fps, sign_idx+1, len(SIGNS))

                cv2.imshow("Signova Data Collector", frame)

                key = cv2.waitKey(1) & 0xFF
                if key == ord(' '):
                    if not collecting:
                        countdown(cap, sign, landmarker, start_ms)
                    collecting = not collecting
                elif key == ord('q'):
                    print(f"  ⏭ Skipped — {count} samples for {sign}")
                    break
                elif key == 27:
                    print("\n🛑 Quit")
                    cap.release()
                    cv2.destroyAllWindows()
                    executor.shutdown(wait=False)
                    exit()

                now = time.time()
                if collecting and hand_detected and (now - last_cap) >= CAPTURE_DELAY:
                    # ── RELATIVE FEATURES — the key improvement ──
                    features = extract_features(landmarks)
                    writer.writerow(features + [sign])
                    f.flush()
                    count   += 1
                    last_cap = now

            print(f"  ✅ {sign} — {count} samples collected")

cap.release()
cv2.destroyAllWindows()
executor.shutdown(wait=False)
print(f"\n{'='*58}")
print(f"🎉 Done! Data saved to:")
print(f"   {DATA_FILE}")
print(f"{'='*58}")
print("\nNow run: python ai_model/train_model.py")