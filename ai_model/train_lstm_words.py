"""
SIGNOVA - LSTM trainer for sentences + words (drop-in for train_lstm.py).

Reads EVERY folder in ai_model/data/sentence_data (your emergency sentences and
the WLASL word folders), trains the same LSTM architecture, and saves the same
files the backend already loads: lstm_model.pt, lstm_labels.pkl, lstm_config.pkl.

Why a new script: the old one split sequences randomly. Word sequences come in
pairs (original + mirrored) from the SAME video, so a random split leaks the
test video into training and gives fake-high accuracy. Here the split is by
video: all sequences of one video go entirely to train or entirely to test.

Run from the project root:   python ai_model/train_lstm_words.py
"""
import os, pickle, time, random
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "ai_model", "data", "sentence_data")
MODEL_DIR = os.path.join(BASE_DIR, "ai_model", "models")
os.makedirs(MODEL_DIR, exist_ok=True)
SEQ_LEN = 30
SEED = 42
random.seed(SEED); np.random.seed(SEED); torch.manual_seed(SEED)

# ---------- load ----------
X, y, groups = [], [], []
for folder in sorted(os.listdir(DATA_DIR)):
    fp = os.path.join(DATA_DIR, folder)
    if not os.path.isdir(fp):
        continue
    label = folder.replace("_", " ")
    n = 0
    for f in os.listdir(fp):
        if not f.endswith(".npy"):
            continue
        seq = np.load(os.path.join(fp, f))
        if seq.shape != (SEQ_LEN, 63):
            continue
        # group id: word files are "<videoid>_o.npy"/"<videoid>_f.npy" -> same
        # group; every other file (your own recordings) is its own group.
        stem = f[:-4]
        g = f"{folder}/{stem[:-2]}" if stem.endswith(("_o", "_f")) else f"{folder}/{stem}"
        X.append(seq); y.append(label); groups.append(g); n += 1
    print(f"  {label:25s} {n} sequences")
assert X, "No data found in " + DATA_DIR
X = np.array(X, dtype=np.float32); y = np.array(y); groups = np.array(groups)

le = LabelEncoder(); ye = le.fit_transform(y); C = len(le.classes_)
print(f"\nDataset {X.shape}, {C} classes")

# ---------- split by group (video), per class ----------
train_idx, test_idx = [], []
for c in range(C):
    gs = sorted(set(groups[ye == c]))
    random.shuffle(gs)
    n_test = max(1, int(round(len(gs) * 0.2))) if len(gs) >= 3 else 0
    test_g = set(gs[:n_test])
    for i in np.where(ye == c)[0]:
        (test_idx if groups[i] in test_g else train_idx).append(i)
Xtr, ytr = X[train_idx], ye[train_idx]
Xte, yte = X[test_idx], ye[test_idx]
print(f"Train {len(Xtr)} | Test {len(Xte)}  (split by video, no leakage)")

# ---------- augmentation (train only) ----------
Xa, ya = [Xtr], [ytr]
for _ in range(3):
    noise = np.random.normal(0, 0.02, Xtr.shape).astype(np.float32)
    scale = np.random.uniform(0.9, 1.1, (len(Xtr), 1, 1)).astype(np.float32)
    Xa.append(Xtr * scale + noise); ya.append(ytr)
Xtr = np.concatenate(Xa); ytr = np.concatenate(ya)
print("After augmentation:", len(Xtr))


class DS(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X); self.y = torch.tensor(y, dtype=torch.long)
    def __len__(self): return len(self.X)
    def __getitem__(self, i): return self.X[i], self.y[i]


train_loader = DataLoader(DS(Xtr, ytr), batch_size=32, shuffle=True)
test_loader = DataLoader(DS(Xte, yte), batch_size=32)


# ---------- model: IDENTICAL to train_lstm.py / backend ----------
class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, num_classes, dropout=0.3):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True,
                            dropout=dropout if num_layers > 1 else 0)
        self.bn1 = nn.BatchNorm1d(hidden_size)
        self.drop1 = nn.Dropout(dropout)
        self.fc1 = nn.Linear(hidden_size, 128)
        self.bn2 = nn.BatchNorm1d(128)
        self.drop2 = nn.Dropout(dropout)
        self.fc2 = nn.Linear(128, 64)
        self.drop3 = nn.Dropout(0.2)
        self.out = nn.Linear(64, num_classes)
        self.relu = nn.ReLU()

    def forward(self, x):
        out, _ = self.lstm(x)
        out = out[:, -1, :]
        out = self.drop1(self.bn1(out))
        out = self.drop2(self.bn2(self.relu(self.fc1(out))))
        out = self.drop3(self.relu(self.fc2(out)))
        return self.out(out)


model = LSTMModel(63, 256, 3, C, 0.3)
counts = np.bincount(ytr, minlength=C).astype(np.float32)
weights = torch.tensor((counts.sum() / (C * np.maximum(counts, 1))), dtype=torch.float32)
criterion = nn.CrossEntropyLoss(weight=weights)   # classes with fewer samples count more
optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, "min", factor=0.5, patience=8)

best_acc, best_w, bad = 0.0, None, 0
EPOCHS, PATIENCE = 120, 20
t0 = time.time()
for ep in range(EPOCHS):
    model.train(); tc = tt = 0
    for xb, yb in train_loader:
        optimizer.zero_grad()
        out = model(xb); loss = criterion(out, yb); loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0); optimizer.step()
        tc += (out.argmax(1) == yb).sum().item(); tt += len(yb)
    model.eval(); vc = vt = 0; vl = 0.0
    with torch.no_grad():
        for xb, yb in test_loader:
            out = model(xb); vl += criterion(out, yb).item()
            vc += (out.argmax(1) == yb).sum().item(); vt += len(yb)
    scheduler.step(vl / max(len(test_loader), 1))
    va = vc / max(vt, 1)
    if va > best_acc:
        best_acc, bad = va, 0
        best_w = {k: v.clone() for k, v in model.state_dict().items()}
    else:
        bad += 1
    if ep == 0 or (ep + 1) % 5 == 0:
        print(f"Epoch {ep+1:3d}  train {tc/tt*100:5.1f}%  val {va*100:5.1f}%")
    if bad >= PATIENCE:
        print("Early stop at epoch", ep + 1); break
if best_w:
    model.load_state_dict(best_w)
print(f"Training time {time.time()-t0:.0f}s | best val {best_acc*100:.1f}%")

# ---------- report ----------
model.eval(); preds, true = [], []
with torch.no_grad():
    for xb, yb in test_loader:
        preds += model(xb).argmax(1).tolist(); true += yb.tolist()
print(f"\nTest accuracy (unseen videos): {np.mean(np.array(preds)==np.array(true))*100:.1f}%\n")
print(classification_report(true, preds, labels=list(range(C)),
                            target_names=le.classes_, zero_division=0))

# ---------- save (same files the backend loads) ----------
torch.save(model.state_dict(), os.path.join(MODEL_DIR, "lstm_model.pt"))
with open(os.path.join(MODEL_DIR, "lstm_labels.pkl"), "wb") as f: pickle.dump(le, f)
with open(os.path.join(MODEL_DIR, "lstm_config.pkl"), "wb") as f:
    pickle.dump({"input_size": 63, "hidden_size": 256, "num_layers": 3,
                 "num_classes": C, "dropout": 0.3, "seq_length": SEQ_LEN}, f)
print("Saved lstm_model.pt | lstm_labels.pkl | lstm_config.pkl")
print("Restart the backend to load them.")