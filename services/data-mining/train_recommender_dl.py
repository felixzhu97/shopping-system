import argparse
import json
import os
import random
from collections import defaultdict

import numpy as np
import pandas as pd
import torch


def _stable_hash_u64(value: str) -> int:
    x = 1469598103934665603
    for b in value.encode("utf-8"):
        x ^= b
        x = (x * 1099511628211) & ((1 << 64) - 1)
    return x


def _read_interactions(order_items_csv: str, orders_csv: str) -> pd.DataFrame:
    items = pd.read_csv(order_items_csv)
    orders = pd.read_csv(orders_csv, usecols=["order_id", "user_id"])
    df = items.merge(orders, on="order_id", how="inner")
    df["quantity"] = df["quantity"].astype(float)
    df = df.groupby(["user_id", "product_id"], as_index=False)["quantity"].sum()
    df.rename(columns={"quantity": "weight"}, inplace=True)
    return df


class MF(torch.nn.Module):
    def __init__(self, users: int, items: int, dim: int):
        super().__init__()
        self.user = torch.nn.Embedding(users, dim)
        self.item = torch.nn.Embedding(items, dim)
        torch.nn.init.normal_(self.user.weight, std=0.02)
        torch.nn.init.normal_(self.item.weight, std=0.02)

    def score(self, u: torch.Tensor, i: torch.Tensor) -> torch.Tensor:
        ue = self.user(u)
        ie = self.item(i)
        return (ue * ie).sum(dim=-1)


def train(
    orders_csv: str,
    order_items_csv: str,
    out_dir: str,
    dim: int,
    epochs: int,
    batch_size: int,
    lr: float,
    seed: int,
    neg_per_pos: int,
) -> dict[str, int]:
    os.makedirs(out_dir, exist_ok=True)
    np_rng = np.random.default_rng(seed)
    random.seed(seed)
    torch.manual_seed(seed)

    df = _read_interactions(order_items_csv=order_items_csv, orders_csv=orders_csv)
    user_ids = df["user_id"].astype(str).tolist()
    item_ids = df["product_id"].astype(str).tolist()

    uniq_users = sorted(set(user_ids))
    uniq_items = sorted(set(item_ids))
    user_to_idx = {u: i for i, u in enumerate(uniq_users)}
    item_to_idx = {p: i for i, p in enumerate(uniq_items)}

    u_idx = np.array([user_to_idx[u] for u in user_ids], dtype=np.int64)
    i_idx = np.array([item_to_idx[p] for p in item_ids], dtype=np.int64)
    w = df["weight"].astype(float).to_numpy()

    user_pos: dict[int, set[int]] = defaultdict(set)
    for uu, ii in zip(u_idx.tolist(), i_idx.tolist()):
        user_pos[uu].add(ii)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = MF(users=len(uniq_users), items=len(uniq_items), dim=dim).to(device)
    opt = torch.optim.AdamW(model.parameters(), lr=lr)

    def sample_neg(u: int) -> int:
        pos = user_pos.get(u, set())
        while True:
            cand = int(np_rng.integers(0, len(uniq_items)))
            if cand not in pos:
                return cand

    n = len(u_idx)
    for _ in range(epochs):
        perm = np_rng.permutation(n)
        for start in range(0, n, batch_size):
            batch_ids = perm[start : start + batch_size]
            bu = u_idx[batch_ids]
            bi = i_idx[batch_ids]
            bw = w[batch_ids]

            negs = []
            for uu in bu.tolist():
                for _ in range(neg_per_pos):
                    negs.append(sample_neg(uu))
            negs = np.array(negs, dtype=np.int64).reshape(-1, neg_per_pos)

            u_rep = np.repeat(bu, neg_per_pos)
            i_pos_rep = np.repeat(bi, neg_per_pos)
            i_neg_rep = negs.reshape(-1)

            tu = torch.from_numpy(u_rep).to(device)
            ti_pos = torch.from_numpy(i_pos_rep).to(device)
            ti_neg = torch.from_numpy(i_neg_rep).to(device)
            tw = torch.from_numpy(np.repeat(bw, neg_per_pos)).float().to(device)

            s_pos = model.score(tu, ti_pos)
            s_neg = model.score(tu, ti_neg)
            loss = torch.nn.functional.softplus(-(s_pos - s_neg)) * tw
            loss = loss.mean()

            opt.zero_grad(set_to_none=True)
            loss.backward()
            opt.step()

    torch.save(
        {"state_dict": model.state_dict(), "dim": dim},
        os.path.join(out_dir, "recommender_mf.pt"),
    )
    with open(os.path.join(out_dir, "recommender_mf.users.json"), "w", encoding="utf-8") as f:
        json.dump(uniq_users, f, ensure_ascii=False)
    with open(os.path.join(out_dir, "recommender_mf.items.json"), "w", encoding="utf-8") as f:
        json.dump(uniq_items, f, ensure_ascii=False)
    meta = {
        "model_type": "matrix_factorization",
        "users": len(uniq_users),
        "items": len(uniq_items),
        "hyperparams": {
            "dim": dim,
            "epochs": epochs,
            "batch_size": batch_size,
            "lr": lr,
            "seed": seed,
            "neg_per_pos": neg_per_pos,
        },
    }
    with open(os.path.join(out_dir, "recommender_mf.meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    return {"users": len(uniq_users), "items": len(uniq_items)}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--orders_csv", default="services/data-mining/data/raw/orders.csv")
    parser.add_argument("--order_items_csv", default="services/data-mining/data/raw/order_items.csv")
    parser.add_argument("--out_dir", default="services/data-mining/artifacts/recommender_mf")
    parser.add_argument("--dim", type=int, default=64)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=2048)
    parser.add_argument("--lr", type=float, default=0.003)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--neg_per_pos", type=int, default=3)
    args = parser.parse_args()

    train(
        orders_csv=args.orders_csv,
        order_items_csv=args.order_items_csv,
        out_dir=args.out_dir,
        dim=args.dim,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        seed=args.seed,
        neg_per_pos=args.neg_per_pos,
    )


if __name__ == "__main__":
    main()
