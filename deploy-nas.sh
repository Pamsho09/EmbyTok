#!/usr/bin/env sh
set -e

if [ ! -f .env ]; then
  echo "Missing .env file in repo root"
  exit 1
fi

echo "Building EmbyTok image..."
docker compose build

echo "Starting containers..."
docker compose up -d

echo "Done. App running at http://<NAS_IP>:8080"
