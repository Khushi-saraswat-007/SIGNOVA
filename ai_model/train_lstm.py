import os
import numpy as np
import pickle
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import pandas as pd

# ─── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR  = os.path.join(BASE_DIR, "ai_model", "data", "sentence_data")
MODEL_DIR = os.path.join(BASE_DIR, "ai_model", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

SEQUENCE_LENGTH = 30

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

# ─── Load Data ───────────────────────────────────────────────────────────────
print("\n" + "="*58)
print("   SIGNOVA LSTM Trainer — PyTorch — Emergency Sentences")
print("="*58)
print(f"\n📂 Loading sequences from: {DATA_DIR}\n")

X, y = [], []

for sentence in SENTENCES:
    folder = os.path.join(DATA_DIR, sentence.replace(" ", "_"))
    if not os.path.exists(folder):
        print(f"  ⚠️  Folder not found: {sentence} — skipping")
        continue
    files = [f for f in os.listdir(folder) if f.endswith('.npy')]
    if len(files) == 0:
        print(f"  ⚠️  No data for: {sentence} — skipping")
        continue
    count = 0
    for f in files:
        seq = np.load(os.path.join(folder, f))
        if seq.shape == (SEQUENCE_LENGTH, 63):
            X.append(seq)
            y.append(sentence)
            count += 1
    print(f"  ✅ {sentence:25s} — {count} sequences")

if len(X) == 0:
    print("\n❌ No data found! Run collect_sentences.py first.")
    exit()

X = np.array(X, dtype=np.float32)
y = np.array(y)
print(f"\n📊 Dataset: {X.shape} | Classes: {len(set(y))}")

# ─── Encode Labels ────────────────────────────────────────────────────────────
le          = LabelEncoder()
y_encoded   = le.fit_transform(y)
num_classes = len(le.classes_)

print(f"\n📋 Labels:")
for i, label in enumerate(le.classes_):
    print(f"   {i} → {label:25s} ({np.sum(y_encoded==i)} samples)")

# ─── Train/Test Split ─────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, stratify=y_encoded, random_state=42
)
print(f"\n🔀 Train: {len(X_train)} | Test: {len(X_test)}")

# ─── Augmentation ────────────────────────────────────────────────────────────
print("\n🔧 Augmenting training data...")
X_aug, y_aug = [], []
for i in range(len(X_train)):
    X_aug.append(X_train[i])
    y_aug.append(y_train[i])
    for _ in range(2):
        noise = np.random.normal(0, 0.01, X_train[i].shape).astype(np.float32)
        X_aug.append(X_train[i] + noise)
        y_aug.append(y_train[i])
X_train = np.array(X_aug, dtype=np.float32)
y_train = np.array(y_aug)
print(f"  After augmentation: {len(X_train)} samples")

# ─── Dataset ─────────────────────────────────────────────────────────────────
class GestureDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.long)
    def __len__(self): return len(self.X)
    def __getitem__(self, idx): return self.X[idx], self.y[idx]

train_loader = DataLoader(GestureDataset(X_train, y_train), batch_size=16, shuffle=True)
test_loader  = DataLoader(GestureDataset(X_test,  y_test),  batch_size=16, shuffle=False)

# ─── LSTM Model ──────────────────────────────────────────────────────────────
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

device = torch.device('cpu')
model  = LSTMModel(63, 256, 3, num_classes, 0.3).to(device)
print(f"\n🧠 Parameters: {sum(p.numel() for p in model.parameters()):,}")

# ─── Training ────────────────────────────────────────────────────────────────
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, 'min', factor=0.5, patience=8)

best_val_acc, best_epoch, no_improve, best_weights = 0.0, 0, 0, None
EPOCHS, PATIENCE = 100, 20

print("\n🚀 Training...\n")

for epoch in range(EPOCHS):
    # Train
    model.train()
    t_loss, t_correct, t_total = 0, 0, 0
    for Xb, yb in train_loader:
        Xb, yb = Xb.to(device), yb.to(device)
        optimizer.zero_grad()
        out  = model(Xb)
        loss = criterion(out, yb)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        t_loss    += loss.item()
        t_correct += (out.argmax(1) == yb).sum().item()
        t_total   += yb.size(0)

    # Validate
    model.eval()
    v_loss, v_correct, v_total = 0, 0, 0
    with torch.no_grad():
        for Xb, yb in test_loader:
            Xb, yb = Xb.to(device), yb.to(device)
            out    = model(Xb)
            v_loss += criterion(out, yb).item()
            v_correct += (out.argmax(1) == yb).sum().item()
            v_total   += yb.size(0)

    t_acc = t_correct / t_total
    v_acc = v_correct / v_total
    v_loss_avg = v_loss / len(test_loader)
    scheduler.step(v_loss_avg)

    if v_acc > best_val_acc:
        best_val_acc = v_acc
        best_epoch   = epoch + 1
        no_improve   = 0
        best_weights = {k: v.clone() for k, v in model.state_dict().items()}
    else:
        no_improve += 1

    if (epoch + 1) % 5 == 0 or epoch == 0:
        star = "⭐" if v_acc == best_val_acc else ""
        print(f"  Epoch [{epoch+1:3d}/{EPOCHS}]  "
              f"Train {t_acc*100:.1f}%  Val {v_acc*100:.1f}%  {star}")

    if no_improve >= PATIENCE:
        print(f"\n  ⏹ Early stopping at epoch {epoch+1}")
        break

# Restore best
if best_weights:
    model.load_state_dict(best_weights)
    print(f"\n✅ Best weights from epoch {best_epoch} ({best_val_acc*100:.1f}%)")

# ─── Evaluate ────────────────────────────────────────────────────────────────
model.eval()
all_preds, all_true = [], []
with torch.no_grad():
    for Xb, yb in test_loader:
        preds = model(Xb.to(device)).argmax(1).cpu().numpy()
        all_preds.extend(preds)
        all_true.extend(yb.numpy())

all_preds = np.array(all_preds)
all_true  = np.array(all_true)
final_acc = np.mean(all_preds == all_true)

print(f"\n🎯 Test Accuracy: {final_acc*100:.1f}%")
print("\n📋 Classification Report:")
print(classification_report(all_true, all_preds, target_names=le.classes_))
print("🔀 Confusion Matrix:")
cm = confusion_matrix(all_true, all_preds)
print(pd.DataFrame(cm, index=le.classes_, columns=le.classes_))

# ─── Speed test ──────────────────────────────────────────────────────────────
sample = torch.tensor(X_test[:1], dtype=torch.float32)
t = time.time()
with torch.no_grad():
    for _ in range(100): model(sample)
print(f"\n⚡ {(time.time()-t)*10:.2f}ms per prediction")

# ─── Save ────────────────────────────────────────────────────────────────────
lstm_path   = os.path.join(MODEL_DIR, "lstm_model.pt")
label_path  = os.path.join(MODEL_DIR, "lstm_labels.pkl")
config_path = os.path.join(MODEL_DIR, "lstm_config.pkl")

torch.save(model.state_dict(), lstm_path)
with open(label_path,  "wb") as f: pickle.dump(le, f)
with open(config_path, "wb") as f: pickle.dump({
    "input_size": 63, "hidden_size": 256,
    "num_layers": 3,  "num_classes": num_classes,
    "dropout": 0.3,   "seq_length": SEQUENCE_LENGTH
}, f)

print(f"\n✅ Saved: lstm_model.pt  |  lstm_labels.pkl  |  lstm_config.pkl")
print(f"\n{'='*58}")
print(f"🎉 Done! Accuracy: {final_acc*100:.1f}%")
print(f"{'='*58}")
print("\nRestart backend: uvicorn app.main:app --reload --port 8000")