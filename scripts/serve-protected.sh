#!/usr/bin/env bash

set -euo pipefail

: "${ACTIVIO_DEMO_PASSWORD:?Ustaw ACTIVIO_DEMO_PASSWORD przed uruchomieniem.}"

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(dirname -- "$script_dir")"
demo_port="${ACTIVIO_DEMO_PORT:-8080}"

exec env ACTIVIO_DEMO_PORT="$demo_port" node "$project_dir/server.mjs"
