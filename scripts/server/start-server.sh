#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

start_mongo() {
  if command -v docker &>/dev/null; then
    if docker ps --format '{{.Names}}' | grep -q '^shopping-mongodb$'; then
      echo "MongoDB already running"
      return 0
    fi
    echo "Starting MongoDB via Docker..."
    if docker compose version &>/dev/null; then
      docker compose -f docker-compose.server.yml up -d mongodb
    else
      docker-compose -f docker-compose.server.yml up -d mongodb
    fi
    echo "Waiting for MongoDB to be ready..."
    for i in $(seq 1 30); do
      if docker exec shopping-mongodb mongosh --quiet --eval "db.adminCommand('ping')" 2>/dev/null; then
        echo "MongoDB ready"
        return 0
      fi
      sleep 1
    done
    echo "MongoDB failed to start"
    return 1
  else
    echo "Docker not found. Ensure MongoDB is running on localhost:27017"
    return 0
  fi
}

start_mongo

echo "Seeding database..."
pnpm seed:api
pnpm seed:orders-users

pnpm dev:api
