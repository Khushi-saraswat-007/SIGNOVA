import pickle
import numpy as np
import cv2
import os
import time
try:
    import mediapipe as mp
    import cv2
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("⚠️ MediaPipe not available — running in API-only mode")from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
import torch
import torch.nn as nn


# ─── LSTM Model definition — must match train_lstm.py ────────────────────────
class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, num_classes, dropout=0.3):
        super().__init__()
        self.lstm  = nn.LSTM(input_size, hidden_size, num_layers,
                             batch_first=True, dropout=dropout if num_layers > 1 else 0)
        self.bn1   = nn.BatchNorm1d(hidden_size)
        self.drop1 = nn.Dropout(dropout)
        self.fc1   = nn.Linear(hidden_size, 128)
        self.bn2   = nn.BatchNorm1d(128)
        self.drop2 = nn.Dropout(dropout)
        self.fc2   = nn.Linear(128, 64)
        self.drop3 = nn.Dropout(0.2)
        self.out   = nn.Linear(64, num_classes)
        self.relu  = nn.ReLU()

    def forward(self, x):
        out, _ = self.lstm(x)
        out    = out[:, -1, :]
        out    = self.bn1(out)
        out    = self.drop1(out)
        out    = self.relu(self.fc1(out))
        out    = self.bn2(out)
        out    = self.drop2(out)
        out    = self.relu(self.fc2(out))
        out    = self.drop3(out)
        return self.out(out)


class DetectionService:
    def __init__(self):
        self.landmarker      = None
        self.model_loaded    = False
        self.lstm_loaded     = False
        self.scaler          = None
        self.start_ms        = int(time.time() * 1000)
        self.sequence        = []
        self.SEQUENCE_LENGTH = 30

        # ── Base path ─────────────────────────────────────────────────
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(
                   os.path.dirname(os.path.abspath(__file__)))))

        # ── Load MediaPipe ────────────────────────────────────────────
        try:
            MODEL_PATH   = os.path.join(BASE_DIR, "ai_model", "hand_landmarker.task")
            base_options = mp_python.BaseOptions(model_asset_path=MODEL_PATH)
            options      = mp_vision.HandLandmarkerOptions(
                base_options=base_options,
                running_mode=mp_vision.RunningMode.VIDEO,
                num_hands=1,
                min_hand_detection_confidence=0.4,
                min_hand_presence_confidence=0.4,
                min_tracking_confidence=0.4
            )
            self.landmarker = mp_vision.HandLandmarker.create_from_options(options)
            print("✅ MediaPipe loaded successfully!")
        except Exception as e:
            print(f"⚠️  MediaPipe error: {e}")

        # ── Load RF Model (single signs) ──────────────────────────────
        try:
            model_path  = os.path.join(BASE_DIR, "ai_model", "models", "gesture_model.pkl")
            label_path  = os.path.join(BASE_DIR, "ai_model", "models", "label_encoder.pkl")
            scaler_path = os.path.join(BASE_DIR, "ai_model", "models", "scaler.pkl")

            if os.path.exists(model_path) and os.path.exists(label_path):
                with open(model_path,  "rb") as f: self.rf_model = pickle.load(f)
                with open(label_path,  "rb") as f: self.rf_le    = pickle.load(f)
                if os.path.exists(scaler_path):
                    with open(scaler_path, "rb") as f: self.scaler = pickle.load(f)
                self.model_loaded = True
                print("✅ RF Sign Model loaded successfully!")
            else:
                print("⚠️  No RF model found — run train_model.py first!")
        except Exception as e:
            print(f"⚠️  RF Model error: {e}")

        # ── Load LSTM Model (sentences) — PyTorch ─────────────────────
        try:
            lstm_path   = os.path.join(BASE_DIR, "ai_model", "models", "lstm_model.pt")
            lstm_lbl    = os.path.join(BASE_DIR, "ai_model", "models", "lstm_labels.pkl")
            config_path = os.path.join(BASE_DIR, "ai_model", "models", "lstm_config.pkl")

            if os.path.exists(lstm_path) and os.path.exists(lstm_lbl) and os.path.exists(config_path):
                with open(lstm_lbl,    "rb") as f: self.lstm_le     = pickle.load(f)
                with open(config_path, "rb") as f: cfg              = pickle.load(f)

                self.lstm_model = LSTMModel(
                    input_size=cfg["input_size"],
                    hidden_size=cfg["hidden_size"],
                    num_layers=cfg["num_layers"],
                    num_classes=cfg["num_classes"],
                    dropout=cfg["dropout"]
                )
                self.lstm_model.load_state_dict(
                    torch.load(lstm_path, map_location=torch.device('cpu'))
                )
                self.lstm_model.eval()
                self.SEQUENCE_LENGTH = cfg["seq_length"]
                self.lstm_loaded     = True
                print("✅ LSTM Sentence Model loaded successfully!")
            else:
                print("⚠️  No LSTM model found — run train_lstm.py first!")
        except Exception as e:
            print(f"⚠️  LSTM Model error: {e}")

    # ── Feature Extraction ────────────────────────────────────────────
    def extract_features(self, landmarks):
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

    # ── Letterbox ─────────────────────────────────────────────────────
    def letterbox(self, frame, size=640):
        h, w     = frame.shape[:2]
        scale    = size / max(h, w)
        nh, nw   = int(h * scale), int(w * scale)
        resized  = cv2.resize(frame, (nw, nh))
        square   = np.zeros((size, size, 3), dtype=np.uint8)
        pad_top  = (size - nh) // 2
        pad_left = (size - nw) // 2
        square[pad_top:pad_top+nh, pad_left:pad_left+nw] = resized
        return square, scale, pad_top, pad_left

    # ── Get Landmarks ─────────────────────────────────────────────────
    def get_landmarks(self, frame):
        try:
            h, w = frame.shape[:2]
            sq, scale, pad_top, pad_left = self.letterbox(frame, 640)
            rgb    = cv2.cvtColor(sq, cv2.COLOR_BGR2RGB)
            rgb    = np.ascontiguousarray(rgb)
            mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            ts     = int(time.time() * 1000) - self.start_ms
            result = self.landmarker.detect_for_video(mp_img, ts)

            if not result.hand_landmarks:
                return None

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
            return adjusted
        except Exception as e:
            print(f"Landmark error: {e}")
            return None

    # ── RF Prediction — single signs ──────────────────────────────────
    def predict_sign(self, frame) -> dict:
        if not self.landmarker or not self.model_loaded:
            return None
        try:
            landmarks = self.get_landmarks(frame)
            if not landmarks:
                return None

            features = np.array(self.extract_features(landmarks)).reshape(1, -1)
            if self.scaler:
                features = self.scaler.transform(features)

            proba      = self.rf_model.predict_proba(features)[0]
            max_idx    = np.argmax(proba)
            confidence = float(proba[max_idx])

            if confidence < 0.75:
                return None

            return {
                "sign":       self.rf_le.classes_[max_idx],
                "confidence": confidence,
                "mode":       "sign"
            }
        except Exception as e:
            print(f"RF error: {e}")
            return None

    # ── LSTM Prediction — sentences ───────────────────────────────────
    def predict_sentence(self, frame) -> dict:
        if not self.landmarker or not self.lstm_loaded:
            return None
        try:
            landmarks = self.get_landmarks(frame)

            if landmarks:
                features = self.extract_features(landmarks)
                self.sequence.append(features)
                self.sequence = self.sequence[-self.SEQUENCE_LENGTH:]
            else:
                self.sequence = []
                return None

            if len(self.sequence) < self.SEQUENCE_LENGTH:
                return None

            # PyTorch inference
            input_data = torch.tensor(
                np.array(self.sequence, dtype=np.float32).reshape(1, self.SEQUENCE_LENGTH, 63),
                dtype=torch.float32
            )

            self.lstm_model.eval()
            with torch.no_grad():
                output     = self.lstm_model(input_data)
                proba      = torch.softmax(output, dim=1).numpy()[0]
                max_idx    = np.argmax(proba)
                confidence = float(proba[max_idx])

            if confidence < 0.85:
                return None

            return {
                "sign":       self.lstm_le.classes_[max_idx],
                "confidence": confidence,
                "mode":       "sentence"
            }
        except Exception as e:
            print(f"LSTM error: {e}")
            return None

    # ── Main predict ──────────────────────────────────────────────────
    def predict(self, frame, mode="sign") -> dict:
        if mode == "sentence":
            return self.predict_sentence(frame)
        return self.predict_sign(frame)

    # ── Reset sequence buffer ─────────────────────────────────────────
    def reset_sequence(self):
        self.sequence = []