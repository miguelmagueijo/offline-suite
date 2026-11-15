#!/usr/bin/env bash
# Rebuilds and restarts the app from the current checkout.
set -euo pipefail
cd "$(dirname "$0")"

docker compose build
docker compose up -d --wait --remove-orphans
docker image prune -f

echo "Deployed $(git rev-parse --short HEAD)"
