import argparse
import csv
import math
import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone


def _parse_dt(value: str) -> datetime:
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _read_csv(path: str) -> list[dict[str, str]]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def _write_csv(path: str, fieldnames: list[str], rows: list[dict[str, object]]) -> None:
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def build_dataset(
    users_csv: str,
    products_csv: str,
    orders_csv: str,
    order_items_csv: str,
    out_csv: str,
    label_window_days: int,
    min_history_orders: int,
) -> dict[str, str]:
    users = _read_csv(users_csv)
    products = _read_csv(products_csv)
    orders = _read_csv(orders_csv)
    order_items = _read_csv(order_items_csv)

    product_category: dict[str, str] = {p["product_id"]: p["category"] for p in products}
    order_time: dict[str, datetime] = {o["order_id"]: _parse_dt(o["created_at"]) for o in orders}
    order_user: dict[str, str] = {o["order_id"]: o["user_id"] for o in orders}
    order_total: dict[str, float] = {o["order_id"]: float(o["total_amount"]) for o in orders}

    max_time = max(order_time.values()) if order_time else datetime.now(timezone.utc)
    cutoff = max_time - timedelta(days=label_window_days)

    user_orders_before: dict[str, list[str]] = defaultdict(list)
    user_orders_after: dict[str, list[str]] = defaultdict(list)

    for oid, ts in order_time.items():
        uid = order_user[oid]
        if ts <= cutoff:
            user_orders_before[uid].append(oid)
        else:
            user_orders_after[uid].append(oid)

    user_categories_before: dict[str, set[str]] = defaultdict(set)
    for it in order_items:
        oid = it["order_id"]
        ts = order_time.get(oid)
        if ts is None or ts > cutoff:
            continue
        uid = order_user.get(oid)
        if uid is None:
            continue
        cat = product_category.get(it["product_id"])
        if cat:
            user_categories_before[uid].add(cat)

    rows: list[dict[str, object]] = []
    for u in users:
        uid = u["user_id"]
        oids = user_orders_before.get(uid, [])
        if len(oids) < min_history_orders:
            continue

        times = [order_time[oid] for oid in oids]
        last_time = max(times)
        recency_days = max(0.0, (cutoff - last_time).total_seconds() / 86400.0)

        freq = float(len(oids))
        monetary = float(sum(order_total[oid] for oid in oids))
        avg_order_value = monetary / freq if freq > 0 else 0.0
        category_diversity = float(len(user_categories_before.get(uid, set())))
        log_monetary = math.log1p(monetary)
        log_freq = math.log1p(freq)
        label = 1 if len(user_orders_after.get(uid, [])) > 0 else 0

        rows.append(
            {
                "user_id": uid,
                "cutoff_at": cutoff.isoformat(),
                "recency_days": f"{recency_days:.6f}",
                "order_count": f"{freq:.6f}",
                "total_amount": f"{monetary:.6f}",
                "avg_order_value": f"{avg_order_value:.6f}",
                "category_diversity": f"{category_diversity:.6f}",
                "log_total_amount": f"{log_monetary:.6f}",
                "log_order_count": f"{log_freq:.6f}",
                "label_purchase_in_window": str(label),
            }
        )

    fieldnames = [
        "user_id",
        "cutoff_at",
        "recency_days",
        "order_count",
        "total_amount",
        "avg_order_value",
        "category_diversity",
        "log_total_amount",
        "log_order_count",
        "label_purchase_in_window",
    ]
    _write_csv(out_csv, fieldnames, rows)

    return {
        "cutoff_at": cutoff.isoformat(),
        "rows": str(len(rows)),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--users_csv", default="services/data-mining/data/raw/users.csv")
    parser.add_argument("--products_csv", default="services/data-mining/data/raw/products.csv")
    parser.add_argument("--orders_csv", default="services/data-mining/data/raw/orders.csv")
    parser.add_argument("--order_items_csv", default="services/data-mining/data/raw/order_items.csv")
    parser.add_argument("--out_csv", default="services/data-mining/data/processed/propensity_dataset.csv")
    parser.add_argument("--label_window_days", type=int, default=30)
    parser.add_argument("--min_history_orders", type=int, default=2)
    args = parser.parse_args()

    build_dataset(
        users_csv=args.users_csv,
        products_csv=args.products_csv,
        orders_csv=args.orders_csv,
        order_items_csv=args.order_items_csv,
        out_csv=args.out_csv,
        label_window_days=args.label_window_days,
        min_history_orders=args.min_history_orders,
    )


if __name__ == "__main__":
    main()
