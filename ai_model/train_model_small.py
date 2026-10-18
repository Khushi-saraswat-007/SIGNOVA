"""
SIGNOVA - small, fast gesture model (MLP only).

Replaces the 500 MB Voting Ensemble with a model of a few MB that predicts
in well under 1 ms. Saves the same 3 files the backend already loads:
  ai_model/models/gesture_model.pkl, label_encoder.pkl, scaler.pkl

Run from the project root (C:\\signova):
    python -W ignore ai_model/train_model_small.py
A text report is also saved to ai_model/train_report.txt
"""
import os, pickle, time, warnings
import numpy as np
import pandas as pd
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

warnings.filterwarnings("ignore")
os.makedirs("ai_model/models", exist_ok=True)
lines = []


def out(s=""):
    print(s)
    lines.append(str(s))


df = pd.read_csv("ai_model/data/gesture_data.csv")
out(f"Dataset: {len(df)} samples, {df['label'].nunique()} classes")

X = df.drop("label", axis=1).values
y = df["label"].values

scaler = StandardScaler()
Xs = scaler.fit_transform(X)
le = LabelEncoder()
ye = le.fit_transform(y)

Xtr, Xte, ytr, yte = train_test_split(
    Xs, ye, test_size=0.2, stratify=ye, random_state=42)

t = time.time()
mlp = MLPClassifier(
    hidden_layer_sizes=(256, 128, 64),
    activation="relu", solver="adam", alpha=0.001,
    batch_size=64, learning_rate="adaptive", max_iter=300,
    early_stopping=True, validation_fraction=0.1, n_iter_no_change=12,
    random_state=42)
mlp.fit(Xtr, ytr)
pred = mlp.predict(Xte)
acc = accuracy_score(yte, pred)
out(f"MLP test accuracy: {acc*100:.2f}%  (trained in {time.time()-t:.0f}s)")

# speed
s = Xs[:1]
t = time.time()
for _ in range(1000):
    mlp.predict_proba(s)
out(f"Speed: {(time.time()-t):.3f} ms per prediction")

out("\nClassification report:")
out(classification_report(yte, pred, target_names=le.classes_, digits=3))

# most common confusions (easier to read than the full matrix)
cm = confusion_matrix(yte, pred)
pairs = []
for i in range(len(cm)):
    for j in range(len(cm)):
        if i != j and cm[i, j] > 0:
            pairs.append((cm[i, j], le.classes_[i], le.classes_[j]))
pairs.sort(reverse=True)
out("Top confusions (true -> predicted : count):")
for n, a, b in pairs[:15]:
    out(f"  {a} -> {b} : {n}")

with open("ai_model/models/gesture_model.pkl", "wb") as f:
    pickle.dump(mlp, f)
with open("ai_model/models/label_encoder.pkl", "wb") as f:
    pickle.dump(le, f)
with open("ai_model/models/scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

size = os.path.getsize("ai_model/models/gesture_model.pkl") / 1e6
out(f"\nSaved. gesture_model.pkl = {size:.1f} MB")

with open("ai_model/train_report.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))