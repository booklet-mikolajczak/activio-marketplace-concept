#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(dirname -- "$script_dir")"

cd "$project_dir"
docker compose up -d

echo "Uruchamiam publiczny tunel. Skopiuj adres https://...trycloudflare.com z komunikatu poniżej."
echo "Zatrzymaj udostępnianie przez Ctrl+C. Przy kolejnym uruchomieniu adres będzie inny."

exec docker run --rm \
    --network traefik_proxy \
    cloudflare/cloudflared:latest \
    tunnel --no-autoupdate --url http://activio-club-concept:8080
