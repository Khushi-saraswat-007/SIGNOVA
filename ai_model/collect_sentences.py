import cv2
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
DATA_DIR   = os.path.join(BASE_DIR, "ai_model", "data", "sentence_data")
os.makedirs(DATA_DIR, exist_ok=True)

# ─── Download MediaPipe model if needed ──────────────────────────────────────
if not os.path.exists(MODEL_PATH):
    print("📥 Downloading MediaPipe hand model...")
    urllib.request.urlretrieve(
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        MODEL_PATH
    )
    print("✅ Downloaded!")

# ─── Emergency Sentences ─────────────────────────────────────────────────────
SENTENCES = [
    "Call Ambulance",
    "I Need Help",
    "Call Police",
    "I Am In Pain",
    "I Cannot Breathe",
    "Call My Family",
    "I Need Doctor",
    "I Am Lost",
    "Please Call Someone",
    "Emergency",
]

SEQUENCE_LENGTH  = 30   # 30 frames per sequence
SAMPLES_PER_SIGN = 100  # 100 sequences per sentence

GUIDES = {
    "Call Ambulance"    : "Point finger up then mimic phone call gesture",
    "I Need Help"       : "Point to yourself then raise both hands up",
    "Call Police"       : "Point up then badge tap on chest",
    "I Am In Pain"      : "Point to yourself then scrunch face + hand on chest",
    "I Cannot Breathe"  : "Point to yourself then hands on throat area",
    "Call My Family"    : "Point up then cross arms on chest (family sign)",
    "I Need Doctor"     : "Point to yourself then tap wrist (doctor sign)",
    "I Am Lost"         : "Point to yourself then look around confused gesture",
    "Please Call Someone": "Prayer hands then point outward",
    "Emergency"         : "Both hands open, wave urgently side to side",
}

TIPS = {
    "Call Ambulance"    : "Make the motion fluid — point then phone gesture",
    "I Need Help"       : "Clear self-point then urgent raise of hands",
    "Call Police"       : "Point up clearly then tap chest badge area",
    "I Am In Pain"      : "Expressive — hand on chest with urgent motion",
    "I Cannot Breathe"  : "Both hands on throat, urgent expression",
    "Call My Family"    : "Point then cross arms clearly on chest",
    "I Need Doctor"     : "Point to self then tap inner wrist",
    "I Am Lost"         : "Confused shrug + look around motion",
    "Please Call Someone": "Prayer hands then strong outward point",
    "Emergency"         : "Fast urgent waving of both open palms",
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

# ─── Feature Extraction — same as collect_data.py ────────────────────────────
def extract_features(landmarks):
    """Relative features — wrist normalized, scale invariant"""
    wrist_x = landmarks[0][0]
    wrist_y = landmarks[0][1]
    wrist_z = landmarks[0][2]

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

def preprocess_frame(frame):
    lab     = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe   = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    l       = clahe.apply(l)
    return cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2BGR)

def letterbox_frame(frame, size=640):
    h, w     = frame.shape[:2]
    scale    = size / max(h, w)
    nh, nw   = int(h * scale), int(w * scale)
    resized  = cv2.resize(frame, (nw, nh))
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
        if 0<=pts[a][0]<w and 0<=pts[a][1]<h and 0<=pts[b][0]<w and 0<=pts[b][1]<h:
            cv2.line(frame, pts[a], pts[b], (80, 180, 255), 2, cv2.LINE_AA)
    fingertips = {4, 8, 12, 16, 20}
    for i, pt in enumerate(pts):
        if 0 <= pt[0] < w and 0 <= pt[1] < h:
            size  = 8 if i in fingertips else 5
            color = (0, 255, 120) if i in fingertips else (0, 210, 90)
            cv2.circle(frame, pt, size, color, -1, cv2.LINE_AA)
            cv2.circle(frame, pt, size, (255, 255, 255), 1, cv2.LINE_AA)

def draw_sequence_bar(frame, seq_len, total, y=138):
    """Show how many frames captured in current sequence"""
    bx, bw, bh = 10, 440, 20
    filled = int((seq_len / total) * bw)
    pct    = int((seq_len / total) * 100)
    cv2.rectangle(frame, (bx, y), (bx+bw, y+bh), (30, 20, 60), -1)
    color = (0, 255, 100) if pct >= 80 else (0, 120, 255)
    if filled > 0:
        cv2.rectangle(frame, (bx, y), (bx+filled, y+bh), color, -1)
    cv2.rectangle(frame, (bx, y), (bx+bw, y+bh), (100, 80, 180), 2)
    cv2.putText(frame, f"Sequence: {seq_len}/{total} frames",
                (bx+bw+12, y+15), cv2.FONT_HERSHEY_SIMPLEX,
                0.55, (200, 200, 220), 1, cv2.LINE_AA)

def draw_sample_bar(frame, count, total, y=175):
    """Show how many complete sequences saved"""
    bx, bw, bh = 10, 440, 18
    filled = int((count / total) * bw)
    pct    = int((count / total) * 100)
    cv2.rectangle(frame, (bx, y), (bx+bw, y+bh), (30, 20, 60), -1)
    color = (0, 200, 80)
    if filled > 0:
        cv2.rectangle(frame, (bx, y), (bx+filled, y+bh), color, -1)
    cv2.rectangle(frame, (bx, y), (bx+bw, y+bh), (100, 80, 180), 2)
    cv2.putText(frame, f"{pct}%  ({count}/{total} sequences)",
                (bx+bw+12, y+14), cv2.FONT_HERSHEY_SIMPLEX,
                0.5, (200, 200, 220), 1, cv2.LINE_AA)

def draw_ui(frame, sentence, sample_count, seq_len,
            collecting, hand_detected, fps, sign_idx, total_signs):
    h, w = frame.shape[:2]

    # Top bar
    cv2.rectangle(frame, (0, 0), (w, 210), (12, 6, 32), -1)

    # Sentence name
    cv2.putText(frame, f"Sentence  {sign_idx}/{total_signs}:  {sentence}",
                (10, 38), cv2.FONT_HERSHEY_SIMPLEX,
                0.85, (140, 180, 255), 2, cv2.LINE_AA)

    # FPS
    fps_color = (0, 255, 120) if fps > 20 else (0, 165, 255)
    cv2.putText(frame, f"FPS {fps:.0f}",
                (w-90, 30), cv2.FONT_HERSHEY_SIMPLEX,
                0.6, fps_color, 1, cv2.LINE_AA)

    # Status
    if collecting:
        if hand_detected:
            sc, st = (0, 255, 120), "  RECORDING SEQUENCE"
        else:
            sc, st = (0, 165, 255), "  NO HAND — show your hand!"
    else:
        sc, st = (120, 100, 220), "  PAUSED — Press SPACE to start"

    cv2.rectangle(frame, (8, 50), (8 + len(st)*12 + 10, 78), sc, -1)
    cv2.putText(frame, st, (14, 70),
                cv2.FONT_HERSHEY_SIMPLEX, 0.65, (10, 5, 20), 2, cv2.LINE_AA)

    # Mode label
    cv2.putText(frame, "MODE: SENTENCE / LSTM",
                (10, 108), cv2.FONT_HERSHEY_SIMPLEX,
                0.6, (255, 180, 50), 1, cv2.LINE_AA)

    # Bars
    draw_sequence_bar(frame, seq_len, SEQUENCE_LENGTH)
    draw_sample_bar(frame, sample_count, SAMPLES_PER_SIGN)

    # No hand warning
    if collecting and not hand_detected:
        bx = w // 2 - 220
        by = h // 2 - 45
        cv2.rectangle(frame, (bx, by), (bx+440, by+90), (0, 30, 100), -1)
        cv2.rectangle(frame, (bx, by), (bx+440, by+90), (0, 165, 255), 2)
        cv2.putText(frame, "  Show your hand clearly!",
                    (bx+20, by+55),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 210, 255), 2, cv2.LINE_AA)

    # Bottom bar
    cv2.rectangle(frame, (0, h-70), (w, h), (12, 6, 32), -1)
    cv2.putText(frame, f"How: {GUIDES.get(sentence,'')}",
                (10, h-45), cv2.FONT_HERSHEY_SIMPLEX,
                0.50, (120, 200, 255), 1, cv2.LINE_AA)
    cv2.putText(frame, f"Tip: {TIPS.get(sentence,'')}",
                (10, h-22), cv2.FONT_HERSHEY_SIMPLEX,
                0.46, (180, 255, 180), 1, cv2.LINE_AA)
    cv2.putText(frame, "SPACE: start/pause    Q: skip    ESC: quit",
                (w-345, h-8), cv2.FONT_HERSHEY_SIMPLEX,
                0.45, (100, 90, 150), 1, cv2.LINE_AA)

    # Status dot
    dot = (0, 255, 150) if hand_detected else (60, 60, 140)
    cv2.circle(frame, (w-22, h-85), 13, dot, -1, cv2.LINE_AA)
    cv2.circle(frame, (w-22, h-85), 13, (255, 255, 255), 1, cv2.LINE_AA)

def countdown(cap, sentence, landmarker, start_ms):
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
            cv2.putText(frame, f"GET READY: {sentence}",
                        (w//2-250, h//2-80),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (120, 180, 255), 2, cv2.LINE_AA)
            cv2.putText(frame, str(i),
                        (w//2-45, h//2+55),
                        cv2.FONT_HERSHEY_SIMPLEX, 4.5, (0, 255, 140), 5, cv2.LINE_AA)
            cv2.putText(frame, GUIDES.get(sentence, ""),
                        (w//2-250, h//2+115),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.58, (180, 255, 180), 1, cv2.LINE_AA)
            cv2.putText(frame, f"Tip: {TIPS.get(sentence,'')}",
                        (w//2-250, h//2+145),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.50, (255, 220, 120), 1, cv2.LINE_AA)
            cv2.imshow("Signova Sentence Collector", frame)
            cv2.waitKey(50)

# ─── Main ────────────────────────────────────────────────────────────────────
print("\n" + "="*62)
print("   SIGNOVA Sentence Collector — LSTM Sequence Mode")
print("="*62)
print(f"  CPU cores       : {os.cpu_count()}")
print(f"  Sentences       : {SENTENCES}")
print(f"  Sequence length : {SEQUENCE_LENGTH} frames per sample")
print(f"  Samples/sentence: {SAMPLES_PER_SIGN}")
print(f"  Data saved to   : {DATA_DIR}")
print("\n  SPACE = start/pause    Q = skip    ESC = quit")
print("="*62 + "\n")

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH,  640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
cap.set(cv2.CAP_PROP_FPS,          30)
cap.set(cv2.CAP_PROP_BUFFERSIZE,   1)

ret, test = cap.read()
if not ret:
    print("❌ Camera not found!")
    exit()
print(f"✅ Camera ready — {int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))}x{int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))}")
print(f"✅ Sequence mode: {SEQUENCE_LENGTH} frames → 1 sample\n")

# Create folder per sentence
for s in SENTENCES:
    os.makedirs(os.path.join(DATA_DIR, s.replace(" ", "_")), exist_ok=True)

with mp_vision.HandLandmarker.create_from_options(options) as landmarker:
    start_ms = int(time.time() * 1000)

    for sign_idx, sentence in enumerate(SENTENCES):
        sample_count = 0
        collecting   = False
        fps_time     = time.time()
        fps          = 0
        frame_count  = 0
        sequence     = []   # current sequence buffer

        # Count already collected samples
        save_dir    = os.path.join(DATA_DIR, sentence.replace(" ", "_"))
        existing    = len([f for f in os.listdir(save_dir) if f.endswith('.npy')])
        sample_count = existing
        print(f"\n[{sign_idx+1}/{len(SENTENCES)}] → {sentence}")
        print(f"  Already collected: {existing} sequences")
        print(f"  Need: {SAMPLES_PER_SIGN - existing} more")
        print(f"  How : {GUIDES.get(sentence, '')}")
        print("  Press SPACE to start...")

        if existing >= SAMPLES_PER_SIGN:
            print(f"  ✅ Already complete — skipping!")
            continue

        while sample_count < SAMPLES_PER_SIGN:
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

            draw_ui(frame, sentence, sample_count, len(sequence),
                    collecting, hand_detected, fps,
                    sign_idx+1, len(SENTENCES))

            cv2.imshow("Signova Sentence Collector", frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord(' '):
                if not collecting:
                    sequence = []
                    countdown(cap, sentence, landmarker, start_ms)
                collecting = not collecting
                if not collecting:
                    sequence = []  # reset on pause
            elif key == ord('q'):
                print(f"  ⏭ Skipped — {sample_count} sequences for {sentence}")
                break
            elif key == 27:
                print("\n🛑 Quit")
                cap.release()
                cv2.destroyAllWindows()
                executor.shutdown(wait=False)
                exit()

            # ── Collect sequence frames ──
            if collecting:
                if hand_detected:
                    features = extract_features(landmarks)
                    sequence.append(features)
                else:
                    # No hand — reset sequence
                    sequence = []

                # When sequence is full → save it
                if len(sequence) == SEQUENCE_LENGTH:
                    seq_array = np.array(sequence)  # shape: (30, 63)
                    filename  = os.path.join(
                        save_dir,
                        f"seq_{sample_count:04d}.npy"
                    )
                    np.save(filename, seq_array)
                    sample_count += 1
                    sequence = []   # reset for next sequence
                    print(f"  💾 Saved sequence {sample_count}/{SAMPLES_PER_SIGN}", end='\r')

        print(f"\n  ✅ {sentence} — {sample_count} sequences saved")

cap.release()
cv2.destroyAllWindows()
executor.shutdown(wait=False)

print(f"\n{'='*62}")
print(f"🎉 Done! All sentences collected!")
print(f"   Data saved to: {DATA_DIR}")
print(f"{'='*62}")
print("\nNow run: python ai_model/train_lstm.py")