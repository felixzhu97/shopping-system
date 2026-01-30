import argparse
import hashlib
import json
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


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


def train(
    dataset_csv: str,
    out_dir: str,
    test_ratio: float,
    seed: int,
) -> dict[str, float]:
    os.makedirs(out_dir, exist_ok=True)
    df = pd.read_csv(dataset_csv)
    df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
    for col in FEATURES:
        df[col] = df[col].astype(float).clip(-1_000_000.0, 1_000_000.0)

    y = df["label_purchase_in_window"].astype(int).to_numpy()
    x = df[FEATURES].astype(float).to_numpy()
    user_ids = df["user_id"].astype(str).tolist()

    is_test = split_mask(user_ids, test_ratio=test_ratio)
    x_train, x_test = x[~is_test], x[is_test]
    y_train, y_test = y[~is_test], y[is_test]

    model = Pipeline(
        steps=[
            ("scaler", StandardScaler(with_mean=True, with_std=True)),
            (
                "clf",
                LogisticRegression(
                    random_state=seed,
                    max_iter=2000,
                    class_weight="balanced",
                    solver="liblinear",
                    C=0.1,
                ),
            ),
        ]
    )
    model.fit(x_train, y_train)

    prob = model.predict_proba(x_test)[:, 1]
    pred = (prob >= 0.5).astype(int)
    auc = float(roc_auc_score(y_test, prob)) if len(np.unique(y_test)) > 1 else float("nan")
    acc = float(accuracy_score(y_test, pred))

    joblib.dump(model, os.path.join(out_dir, "propensity_ml.joblib"))
    meta = {
        "model_type": "logistic_regression",
        "features": FEATURES,
        "test_ratio": test_ratio,
        "seed": seed,
        "metrics": {"auc": auc, "accuracy": acc},
    }
    with open(os.path.join(out_dir, "propensity_ml.meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    return {"auc": auc, "accuracy": acc}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset_csv", default="services/data-mining/data/processed/propensity_dataset.csv")
    parser.add_argument("--out_dir", default="services/data-mining/artifacts/propensity_ml")
    parser.add_argument("--test_ratio", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=7)
    args = parser.parse_args()

    train(
        dataset_csv=args.dataset_csv,
        out_dir=args.out_dir,
        test_ratio=args.test_ratio,
        seed=args.seed,
    )


if __name__ == "__main__":
    main()
