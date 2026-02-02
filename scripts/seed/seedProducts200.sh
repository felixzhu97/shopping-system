#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

echo "Seeding 200 products..."
pnpm -s exec tsx seed/seedProducts200.ts
echo "Done!"