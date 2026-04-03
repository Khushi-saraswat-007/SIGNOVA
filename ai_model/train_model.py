import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import os
import time

os.makedirs("ai_model/models", exist_ok=True)

print("📂 Loading data...")
df = pd.read_csv("ai_model/data/gesture_data.csv")
print(f"✅ Dataset: {len(df)} samples, {df['label'].nunique()} classes")
print(f"📋 Signs: {list(df['label'].unique())}")
print(f"\n📊 Samples per sign:")
print(df['label'].value_counts())

X = df.drop('label', axis=1).values
y = df['label'].values

# Normalize
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

le = LabelEncoder()
y_encoded = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_encoded,
    test_size=0.2,
    stratify=y_encoded,
    random_state=42
)

print(f"\n🔀 Train: {len(X_train)} | Test: {len(X_test)}")
print("\n🧠 Training models...\n")

# ── Model 1: Random Forest (fast CPU, n_jobs=-1 uses all cores) ──
print("1️⃣  Random Forest...")
t = time.time()
rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    n_jobs=-1,       # use all CPU cores
    random_state=42
)
rf.fit(X_train, y_train)
rf_acc = accuracy_score(y_test, rf.predict(X_test))
print(f"   Accuracy: {rf_acc*100:.1f}%  ({time.time()-t:.1f}s)")

# ── Model 2: MLP Neural Network (fast inference on CPU) ──
print("2️⃣  MLP Neural Network...")
t = time.time()
mlp = MLPClassifier(
    hidden_layer_sizes=(256, 128, 64),
    activation='relu',
    solver='adam',
    alpha=0.001,
    batch_size=32,
    learning_rate='adaptive',
    max_iter=500,
    random_state=42,
    early_stopping=True,
    validation_fraction=0.1,
    n_iter_no_change=15
)
mlp.fit(X_train, y_train)
mlp_acc = accuracy_score(y_test, mlp.predict(X_test))
print(f"   Accuracy: {mlp_acc*100:.1f}%  ({time.time()-t:.1f}s)")

# ── Model 3: SVM (excellent for small feature sets) ──
print("3️⃣  SVM...")
t = time.time()
svm = SVC(
    kernel='rbf',
    C=10,
    gamma='scale',
    probability=True,
    random_state=42
)
svm.fit(X_train, y_train)
svm_acc = accuracy_score(y_test, svm.predict(X_test))
print(f"   Accuracy: {svm_acc*100:.1f}%  ({time.time()-t:.1f}s)")

# ── Model 4: Voting Ensemble (best of all three) ──
print("4️⃣  Voting Ensemble...")
t = time.time()
ensemble = VotingClassifier(
    estimators=[('rf', rf), ('mlp', mlp), ('svm', svm)],
    voting='soft',
    n_jobs=-1
)
ensemble.fit(X_train, y_train)
ens_acc = accuracy_score(y_test, ensemble.predict(X_test))
print(f"   Accuracy: {ens_acc*100:.1f}%  ({time.time()-t:.1f}s)")

# ── Pick best ──
results = [
    (rf,       rf_acc,  "Random Forest"),
    (mlp,      mlp_acc, "MLP Neural Net"),
    (svm,      svm_acc, "SVM"),
    (ensemble, ens_acc, "Voting Ensemble"),
]
best_model, best_acc, best_name = max(results, key=lambda x: x[1])

print(f"\n🏆 Best Model: {best_name} — {best_acc*100:.1f}%")

# ── Cross validation ──
print("\n🔄 Cross validating best model (5-fold)...")
cv = cross_val_score(best_model, X_scaled, y_encoded, cv=5, n_jobs=-1)
print(f"   CV Score: {cv.mean()*100:.1f}% ± {cv.std()*100:.1f}%")

# ── Full report ──
y_pred = best_model.predict(X_test)
print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred, target_names=le.classes_))

print("🔀 Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(pd.DataFrame(cm, index=le.classes_, columns=le.classes_))

# ── Test inference speed ──
print("\n⚡ Inference speed test (1000 predictions)...")
sample = X_scaled[:1]
t = time.time()
for _ in range(1000):
    best_model.predict_proba(sample)
ms = (time.time() - t)
print(f"   {ms:.3f}s total = {ms:.4f}ms per prediction")

# ── Save ──
with open("ai_model/models/gesture_model.pkl", "wb") as f:
    pickle.dump(best_model, f)
with open("ai_model/models/label_encoder.pkl", "wb") as f:
    pickle.dump(le, f)
with open("ai_model/models/scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print(f"\n✅ Saved: {best_name}")
print("🚀 Restart backend to load new model!")