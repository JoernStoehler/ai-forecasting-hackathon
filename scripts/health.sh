#!/usr/bin/env bash
set -euo pipefail

# Non-blocking health check for agents. Does not start/stop services.
# - Prints ports
# - Prints service/tunnel status
# - Probes local and domain endpoints with short timeouts

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
source "$ROOT_DIR/scripts/ports.sh"
ensure_ports "$ROOT_DIR"

echo "ports DOCS=$DOCS_PORT FE=$FRONTEND_PORT BE=$BACKEND_PORT"

echo "status:" && bash "$ROOT_DIR/scripts/run.sh" || true
echo "tunnel:" && bash "$ROOT_DIR/scripts/tunnel.sh" --actions status || true

be_ok=0; fe_ok=0; dom_be_ok=0; dom_fe_code=0

if curl -sS --max-time 5 --connect-timeout 2 "http://127.0.0.1:$BACKEND_PORT/api/health" >/dev/null; then be_ok=1; fi
fe_code=$(curl -sS -I --max-time 5 --connect-timeout 2 "http://127.0.0.1:$FRONTEND_PORT/" | awk 'NR==1{print $2}' || true)
if [[ "${fe_code:-}" == "200" || "${fe_code:-}" == "204" ]]; then fe_ok=1; fi

DOMAIN=${TUNNEL_DOMAIN:-ai-forecasting-hackathon.joernstoehler.com}
dom_fe_code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 6 --connect-timeout 3 "https://$DOMAIN" || echo 000)
if curl -sS --max-time 6 --connect-timeout 3 "https://$DOMAIN/api/health" >/dev/null 2>&1; then dom_be_ok=1; fi

echo "local FE=$fe_ok($fe_code) BE=$be_ok domain FE_code=$dom_fe_code BE=$dom_be_ok"

if [[ $fe_ok -eq 1 && $be_ok -eq 1 ]]; then exit 0; else exit 1; fi

