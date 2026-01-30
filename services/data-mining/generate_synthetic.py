import argparse
import csv
import os
import random
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone


@dataclass(frozen=True)
class Paths:
    users_csv: str
    products_csv: str
    orders_csv: str
    order_items_csv: str


def _utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(microsecond=0)


def _ensure_parent_dir(path: str) -> None:
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)


def _write_csv(path: str, fieldnames: list[str], rows: list[dict]) -> None:
    _ensure_parent_dir(path)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def generate(
    out: Paths,
    users: int,
    products: int,
    orders: int,
    seed: int,
    days: int,
) -> None:
    rng = random.Random(seed)
    now = _utc_now()
    start = now - timedelta(days=days)

    user_rows: list[dict] = []
    for i in range(users):
        created_at = start + timedelta(days=rng.randint(0, max(days - 1, 0)))
        user_rows.append(
            {
                "user_id": f"u{i+1}",
                "email": f"user{i+1}@example.com",
                "role": "user",
                "created_at": created_at.isoformat(),
            }
        )

    categories = ["electronics", "fashion", "beauty", "grocery", "home", "sports"]
    product_rows: list[dict] = []
    for i in range(products):
        created_at = start + timedelta(days=rng.randint(0, max(days - 1, 0)))
        price = round(rng.uniform(5.0, 500.0), 2)
        product_rows.append(
            {
                "product_id": f"p{i+1}",
                "category": rng.choice(categories),
                "price": f"{price:.2f}",
                "created_at": created_at.isoformat(),
            }
        )

    order_rows: list[dict] = []
    item_rows: list[dict] = []

    weights = [rng.random() ** 2 for _ in range(users)]
    weight_sum = sum(weights) or 1.0
    probs = [w / weight_sum for w in weights]
    user_ids = [r["user_id"] for r in user_rows]
    product_ids = [r["product_id"] for r in product_rows]
    product_price = {r["product_id"]: float(r["price"]) for r in product_rows}

    for i in range(orders):
        user_id = rng.choices(user_ids, weights=probs, k=1)[0]
        created_at = start + timedelta(seconds=rng.randint(0, max(days * 24 * 3600 - 1, 0)))
        status = rng.choices(
            ["pending", "processing", "shipped", "delivered", "cancelled"],
            weights=[0.05, 0.1, 0.25, 0.55, 0.05],
            k=1,
        )[0]
        order_id = f"o{i+1}"

        item_count = rng.randint(1, 5)
        picked = rng.sample(product_ids, k=min(item_count, len(product_ids)))
        total = 0.0
        for pid in picked:
            qty = rng.randint(1, 3)
            price = product_price[pid]
            total += price * qty
            item_rows.append(
                {
                    "order_id": order_id,
                    "product_id": pid,
                    "quantity": str(qty),
                    "price": f"{price:.2f}",
                }
            )

        order_rows.append(
            {
                "order_id": order_id,
                "user_id": user_id,
                "total_amount": f"{total:.2f}",
                "status": status,
                "created_at": created_at.isoformat(),
            }
        )

    _write_csv(
        out.users_csv,
        ["user_id", "email", "role", "created_at"],
        user_rows,
    )
    _write_csv(
        out.products_csv,
        ["product_id", "category", "price", "created_at"],
        product_rows,
    )
    _write_csv(
        out.orders_csv,
        ["order_id", "user_id", "total_amount", "status", "created_at"],
        order_rows,
    )
    _write_csv(
        out.order_items_csv,
        ["order_id", "product_id", "quantity", "price"],
        item_rows,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out_dir", default="services/data-mining/data/raw")
    parser.add_argument("--users", type=int, default=500)
    parser.add_argument("--products", type=int, default=200)
    parser.add_argument("--orders", type=int, default=5000)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--days", type=int, default=180)
    args = parser.parse_args()

    base = args.out_dir
    out = Paths(
        users_csv=os.path.join(base, "users.csv"),
        products_csv=os.path.join(base, "products.csv"),
        orders_csv=os.path.join(base, "orders.csv"),
        order_items_csv=os.path.join(base, "order_items.csv"),
    )
    generate(
        out=out,
        users=args.users,
        products=args.products,
        orders=args.orders,
        seed=args.seed,
        days=args.days,
    )


if __name__ == "__main__":
    main()
