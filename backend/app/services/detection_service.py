import pickle
import numpy as np
import cv2
import os
import mediapipe as mp

class DetectionService:
    def __init__(self):
        self.landmarker = None
        self.model_loaded = False
        self.scaler = None

        try:
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            MODEL_PATH = os.path.join(BASE_DIR, "ai_model", "hand_landmarker.task")

            if not os.path.exists(MODEL_PATH):
                print(f"⚠️ Hand landmarker not found at {MODEL_PATH}")
                return

            BaseOptions = mp.tasks.BaseOptions
            HandLandmarker = mp.tasks.vision.HandLandmarker
            HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
            VisionRunningMode = mp.tasks.vision.RunningMode

            options = HandLandmarkerOptions(
                base_options=BaseOptions(model_asset_path=MODEL_PATH),
                running_mode=VisionRunningMode.IMAGE,
                num_hands=1,
                min_hand_detection_confidence=0.5,
                min_hand_presence_confidence=0.5,
                min_tracking_confidence=0.5
            )
            self.landmarker = HandLandmarker.create_from_options(options)
            print("✅ MediaPipe loaded successfully!")

        except Exception as e:
            print(f"⚠️ MediaPipe error: {e}")

        try:
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            model_path = os.path.join(BASE_DIR, "ai_model", "models", "gesture_model.pkl")
            label_path = os.path.join(BASE_DIR, "ai_model", "models", "label_encoder.pkl")
            scaler_path = os.path.join(BASE_DIR, "ai_model", "models", "scaler.pkl")

            if os.path.exists(model_path) and os.path.exists(label_path):
                with open(model_path, "rb") as f:
                    self.model = pickle.load(f)
                with open(label_path, "rb") as f:
                    self.le = pickle.load(f)
                if os.path.exists(scaler_path):
                    with open(scaler_path, "rb") as f:
                        self.scaler = pickle.load(f)
                self.model_loaded = True
                print("✅ AI Model loaded successfully!")
            else:
                print("⚠️ No model found.")

        except Exception as e:
            print(f"⚠️ Model loading error: {e}")

    def predict(self, frame) -> dict:
        if not self.landmarker or not self.model_loaded:
            return None

        try:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            result = self.landmarker.detect(mp_image)

            if not result.hand_landmarks:
                return None

            hand = result.hand_landmarks[0]
            features = np.array([val for lm in hand for val in (lm.x, lm.y, lm.z)]).reshape(1, -1)

            if self.scaler:
                features = self.scaler.transform(features)

            proba = self.model.predict_proba(features)[0]
            max_idx = np.argmax(proba)
            confidence = float(proba[max_idx])

            if confidence < 0.6:
                return None

            return {
                "sign": self.le.classes_[max_idx],
                "confidence": confidence
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return None