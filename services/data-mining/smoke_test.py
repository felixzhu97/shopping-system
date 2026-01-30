import argparse
import os
import sys


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--use_mongo", action="store_true")
    parser.add_argument("--mongo_uri", default=os.environ.get("MONGODB_URI", ""))
    parser.add_argument("--db", default=os.environ.get("MONGODB_DB", ""))
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--seed", type=int, default=7)
    args = parser.parse_args()

    base_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, base_dir)

    raw_dir = os.path.join(base_dir, "data", "raw")
    processed_csv = os.path.join(base_dir, "data", "processed", "propensity_dataset.csv")

    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(os.path.dirname(processed_csv), exist_ok=True)

    if args.use_mongo:
        from export_mongo import export

        mongo_uri = args.mongo_uri.strip()
        if not mongo_uri:
            raise ValueError("Missing MongoDB URI. Provide --mongo_uri or set MONGODB_URI.")

        db_name = args.db.strip() or None
        limit = args.limit if args.limit and args.limit > 0 else None
        export(
            mongo_uri=mongo_uri,
            db_name=db_name,
            out_dir=raw_dir,
            users_collection="users",
            products_collection="products",
            orders_collection="orders",
            limit=limit,
        )
    else:
        from generate_synthetic import Paths, generate

        out = Paths(
            users_csv=os.path.join(raw_dir, "users.csv"),
            products_csv=os.path.join(raw_dir, "products.csv"),
            orders_csv=os.path.join(raw_dir, "orders.csv"),
            order_items_csv=os.path.join(raw_dir, "order_items.csv"),
        )
        generate(out=out, users=500, products=200, orders=5000, seed=args.seed, days=180)

    from prepare_propensity_dataset import build_dataset
    from train_propensity_ml import train as train_ml
    from train_propensity_dl import train as train_dl
    from train_recommender_dl import train as train_rec

    min_history_orders = 1 if args.use_mongo else 2
    build_dataset(
        users_csv=os.path.join(raw_dir, "users.csv"),
        products_csv=os.path.join(raw_dir, "products.csv"),
        orders_csv=os.path.join(raw_dir, "orders.csv"),
        order_items_csv=os.path.join(raw_dir, "order_items.csv"),
        out_csv=processed_csv,
        label_window_days=30,
        min_history_orders=min_history_orders,
    )

    try:
        import pandas as pd

        rows = len(pd.read_csv(processed_csv))
    except Exception:
        rows = 0

    if rows == 0 and args.use_mongo:
        from generate_synthetic import Paths, generate

        out = Paths(
            users_csv=os.path.join(raw_dir, "users.csv"),
            products_csv=os.path.join(raw_dir, "products.csv"),
            orders_csv=os.path.join(raw_dir, "orders.csv"),
            order_items_csv=os.path.join(raw_dir, "order_items.csv"),
        )
        generate(out=out, users=500, products=200, orders=5000, seed=args.seed, days=180)
        build_dataset(
            users_csv=os.path.join(raw_dir, "users.csv"),
            products_csv=os.path.join(raw_dir, "products.csv"),
            orders_csv=os.path.join(raw_dir, "orders.csv"),
            order_items_csv=os.path.join(raw_dir, "order_items.csv"),
            out_csv=processed_csv,
            label_window_days=30,
            min_history_orders=2,
        )

    train_ml(
        dataset_csv=processed_csv,
        out_dir=os.path.join(base_dir, "artifacts", "propensity_ml"),
        test_ratio=0.2,
        seed=args.seed,
    )
    train_dl(
        dataset_csv=processed_csv,
        out_dir=os.path.join(base_dir, "artifacts", "propensity_dl"),
        test_ratio=0.2,
        seed=args.seed,
        epochs=3,
        batch_size=256,
        lr=0.001,
        hidden=64,
        dropout=0.1,
    )
    train_rec(
        orders_csv=os.path.join(raw_dir, "orders.csv"),
        order_items_csv=os.path.join(raw_dir, "order_items.csv"),
        out_dir=os.path.join(base_dir, "artifacts", "recommender_mf"),
        dim=32,
        epochs=3,
        batch_size=2048,
        lr=0.003,
        seed=args.seed,
        neg_per_pos=3,
    )


if __name__ == "__main__":
    main()
