import argparse
import hashlib
import json
import os

import numpy as np
import pandas as pd
import torch
from sklearn.metrics import accuracy_score, roc_auc_score


FEATURES = [
    "recency_days",
    "order_count",
    "total_amount",
    "avg_order_value",
    "category_diversity",
    "log_total_amount",
    "log_order_count",
]


def _stable_hash_u64(value: str) -> int:
    digest = hashlib.blake2b(value.encode("utf-8"), digest_size=8).digest()
    return int.from_bytes(digest, byteorder="big", signed=False)


def split_mask(user_ids: list[str], test_ratio: float) -> np.ndarray:
    ratio = float(test_ratio)
    ratio = min(max(ratio, 0.0), 1.0)
    numerator = int(round(ratio * 1_000_000))
    threshold = (numerator * (1 << 64)) // 1_000_000
    return np.array([_stable_hash_u64(u) < threshold for u in user_ids], dtype=bool)


class MLP(torch.nn.Module):
    def __init__(self, in_dim: int, hidden: int, dropout: float):
        super().__init__()
        self.net = torch.nn.Sequential(
            torch.nn.Linear(in_dim, hidden),
            torch.nn.ReLU(),
            torch.nn.Dropout(dropout),
            torch.nn.Linear(hidden, hidden),
            torch.nn.ReLU(),
            torch.nn.Dropout(dropout),
            torch.nn.Linear(hidden, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x).squeeze(-1)


def train(
    dataset_csv: str,
    out_dir: str,
    test_ratio: float,
    seed: int,
    epochs: int,
    batch_size: int,
    lr: float,
    hidden: int,
    dropout: float,
) -> dict[str, float]:
    os.makedirs(out_dir, exist_ok=True)
    rng = np.random.default_rng(seed)
    torch.manual_seed(seed)

    df = pd.read_csv(dataset_csv)
    df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
    y = df["label_purchase_in_window"].astype(int).to_numpy()
    x = df[FEATURES].astype(float).to_numpy()
    user_ids = df["user_id"].astype(str).tolist()

    is_test = split_mask(user_ids, test_ratio=test_ratio)
    x_train, x_test = x[~is_test], x[is_test]
    y_train, y_test = y[~is_test], y[is_test]

    mean = x_train.mean(axis=0, keepdims=True)
    std = x_train.std(axis=0, keepdims=True) + 1e-6
    x_train = (x_train - mean) / std
    x_test = (x_test - mean) / std

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = MLP(in_dim=x_train.shape[1], hidden=hidden, dropout=dropout).to(device)
    opt = torch.optim.AdamW(model.parameters(), lr=lr)
    loss_fn = torch.nn.BCEWithLogitsLoss()

    x_train_t = torch.from_numpy(x_train).float()
    y_train_t = torch.from_numpy(y_train).float()

    n = x_train_t.shape[0]
    for _ in range(epochs):
        idx = rng.permutation(n)
        for start in range(0, n, batch_size):
            batch = idx[start : start + batch_size]
            xb = x_train_t[batch].to(device)
            yb = y_train_t[batch].to(device)
            logits = model(xb)
            loss = loss_fn(logits, yb)
            opt.zero_grad(set_to_none=True)
            loss.backward()
            opt.step()

    model.eval()
    with torch.no_grad():
        prob = torch.sigmoid(model(torch.from_numpy(x_test).float().to(device))).cpu().numpy()
    pred = (prob >= 0.5).astype(int)
    auc = float(roc_auc_score(y_test, prob)) if len(np.unique(y_test)) > 1 else float("nan")
    acc = float(accuracy_score(y_test, pred))

    torch.save(
        {
            "state_dict": model.state_dict(),
            "mean": mean.astype(np.float32),
            "std": std.astype(np.float32),
            "features": FEATURES,
        },
        os.path.join(out_dir, "propensity_dl.pt"),
    )
    meta = {
        "model_type": "mlp",
        "features": FEATURES,
        "test_ratio": test_ratio,
        "seed": seed,
        "hyperparams": {
            "epochs": epochs,
            "batch_size": batch_size,
            "lr": lr,
            "hidden": hidden,
            "dropout": dropout,
        },
        "metrics": {"auc": auc, "accuracy": acc},
    }
    with open(os.path.join(out_dir, "propensity_dl.meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    return {"auc": auc, "accuracy": acc}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset_csv", default="services/data-mining/data/processed/propensity_dataset.csv")
    parser.add_argument("--out_dir", default="services/data-mining/artifacts/propensity_dl")
    parser.add_argument("--test_ratio", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=256)
    parser.add_argument("--lr", type=float, default=0.001)
    parser.add_argument("--hidden", type=int, default=64)
    parser.add_argument("--dropout", type=float, default=0.1)
    args = parser.parse_args()

    train(
        dataset_csv=args.dataset_csv,
        out_dir=args.out_dir,
        test_ratio=args.test_ratio,
        seed=args.seed,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        hidden=args.hidden,
        dropout=args.dropout,
    )


if __name__ == "__main__":
    main()
