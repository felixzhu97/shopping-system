import argparse
import csv
import os
from datetime import datetime, timezone
from typing import Any, Optional

from pymongo import MongoClient


def ensure_parent_dir(path: str) -> None:
    parent_dir = os.path.dirname(path)
    if parent_dir:
        os.makedirs(parent_dir, exist_ok=True)


def write_csv(path: str, fieldnames: list[str], rows: list[dict[str, Any]]) -> None:
    ensure_parent_dir(path)
    with open(path, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def to_iso(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, datetime):
        dt = value
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).replace(microsecond=0).isoformat()
    return str(value)


def choose_db(client: MongoClient, explicit_name: Optional[str]) -> Any:
    if explicit_name:
        return client[explicit_name]
    default_db = client.get_default_database()
    if default_db is None:
        raise ValueError("Database name is required. Provide --db or include it in the MongoDB URI.")
    return default_db


def export(
    mongo_uri: str,
    db_name: Optional[str],
    out_dir: str,
    users_collection: str,
    products_collection: str,
    orders_collection: str,
    limit: Optional[int],
) -> dict[str, int]:
    client = MongoClient(mongo_uri)
    db = choose_db(client, db_name)

    users_cursor = db[users_collection].find({})
    products_cursor = db[products_collection].find({})
    orders_cursor = db[orders_collection].find({})
    if limit:
        users_cursor = users_cursor.limit(limit)
        products_cursor = products_cursor.limit(limit)
        orders_cursor = orders_cursor.limit(limit)

    users_rows: list[dict[str, Any]] = []
    for user in users_cursor:
        users_rows.append(
            {
                "user_id": str(user.get("_id", "")),
                "email": user.get("email", ""),
                "role": user.get("role", ""),
                "created_at": to_iso(user.get("createdAt") or user.get("created_at")),
            }
        )

    products_rows: list[dict[str, Any]] = []
    for product in products_cursor:
        products_rows.append(
            {
                "product_id": str(product.get("_id", "")),
                "category": product.get("category", ""),
                "price": str(product.get("price", "")),
                "created_at": to_iso(product.get("createdAt") or product.get("created_at")),
            }
        )

    orders_rows: list[dict[str, Any]] = []
    order_items_rows: list[dict[str, Any]] = []
    for order in orders_cursor:
        order_id = str(order.get("_id", ""))
        user_id = str(order.get("userId", ""))
        created_at = to_iso(order.get("createdAt") or order.get("created_at"))
        total_amount = order.get("totalAmount", order.get("total_amount", ""))
        status = order.get("status", "")

        orders_rows.append(
            {
                "order_id": order_id,
                "user_id": user_id,
                "total_amount": str(total_amount),
                "status": str(status),
                "created_at": created_at,
            }
        )

        items = order.get("items") or []
        for item in items:
            order_items_rows.append(
                {
                    "order_id": order_id,
                    "product_id": str(item.get("productId", "")),
                    "quantity": str(item.get("quantity", "")),
                    "price": str(item.get("price", "")),
                }
            )

    write_csv(
        os.path.join(out_dir, "users.csv"),
        ["user_id", "email", "role", "created_at"],
        users_rows,
    )
    write_csv(
        os.path.join(out_dir, "products.csv"),
        ["product_id", "category", "price", "created_at"],
        products_rows,
    )
    write_csv(
        os.path.join(out_dir, "orders.csv"),
        ["order_id", "user_id", "total_amount", "status", "created_at"],
        orders_rows,
    )
    write_csv(
        os.path.join(out_dir, "order_items.csv"),
        ["order_id", "product_id", "quantity", "price"],
        order_items_rows,
    )

    return {
        "users": len(users_rows),
        "products": len(products_rows),
        "orders": len(orders_rows),
        "order_items": len(order_items_rows),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mongo_uri", default=os.environ.get("MONGODB_URI", ""))
    parser.add_argument("--db", default=os.environ.get("MONGODB_DB", ""))
    parser.add_argument("--out_dir", default="services/data-mining/data/raw")
    parser.add_argument("--users_collection", default="users")
    parser.add_argument("--products_collection", default="products")
    parser.add_argument("--orders_collection", default="orders")
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    mongo_uri = args.mongo_uri.strip()
    if not mongo_uri:
        raise ValueError("Missing MongoDB URI. Provide --mongo_uri or set MONGODB_URI.")

    db_name = args.db.strip() or None
    limit = args.limit if args.limit and args.limit > 0 else None

    export(
        mongo_uri=mongo_uri,
        db_name=db_name,
        out_dir=args.out_dir,
        users_collection=args.users_collection,
        products_collection=args.products_collection,
        orders_collection=args.orders_collection,
        limit=limit,
    )


if __name__ == "__main__":
    main()
