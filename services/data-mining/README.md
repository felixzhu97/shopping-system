# Data mining

This folder provides a runnable data mining pipeline using machine learning and deep learning.

## Inputs

Raw CSV files:

- `data/raw/users.csv`
  - `user_id`, `email`, `role`, `created_at`
- `data/raw/products.csv`
  - `product_id`, `category`, `price`, `created_at`
- `data/raw/orders.csv`
  - `order_id`, `user_id`, `total_amount`, `status`, `created_at`
- `data/raw/order_items.csv`
  - `order_id`, `product_id`, `quantity`, `price`

## Outputs

- `data/processed/propensity_dataset.csv`
- `artifacts/propensity_ml/`
- `artifacts/propensity_dl/`
- `artifacts/recommender_mf/`

## Run

Export data from MongoDB:

```bash
python3 services/data-mining/export_mongo.py --mongo_uri "mongodb://localhost:27017/shopping-system-public" --db "shopping-system-public"
```

Smoke test (synthetic data):

```bash
python3 services/data-mining/smoke_test.py
```

Smoke test (MongoDB):

```bash
MONGODB_URI="mongodb://localhost:27017/shopping-system-public" python3 services/data-mining/smoke_test.py --use_mongo --db "shopping-system-public"
```

Generate synthetic data:

```bash
python3 services/data-mining/generate_synthetic.py
```

Build dataset:

```bash
python3 services/data-mining/prepare_propensity_dataset.py
```

Train models:

```bash
python3 services/data-mining/train_propensity_ml.py
python3 services/data-mining/train_propensity_dl.py
python3 services/data-mining/train_recommender_dl.py
```
