#!/usr/bin/env bash
# Local scratch Postgres for development (port 5433). Production data is never involved.
#   scripts/dev-db.sh start | stop | status | psql
set -euo pipefail
export LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8   # macOS: Postgres refuses to start without a valid locale
DATA="${DEV_DB_DIR:-$HOME/.portfolio-dev-db}"
case "${1:-status}" in
  start)  pg_ctl -D "$DATA" -o "-p 5433 -c listen_addresses=127.0.0.1 -c unix_socket_directories=$DATA" -l "$DATA/server.log" start ;;
  stop)   pg_ctl -D "$DATA" stop ;;
  status) pg_ctl -D "$DATA" status ;;
  psql)   psql -h 127.0.0.1 -p 5433 -U dev -d portfolio_dev ;;
  *) echo "usage: $0 start|stop|status|psql"; exit 1 ;;
esac
