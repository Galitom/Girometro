#!/usr/bin/env bash
# Avvia Girometro: backend Django (:8001) + frontend Vite (:5173).
# Ctrl-C ferma entrambi i processi.

set -euo pipefail

# Cartella in cui si trova questo script (radice del progetto).
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
VENV_PY="$BACKEND/venv/bin/python"

if [[ ! -x "$VENV_PY" ]]; then
  echo "Errore: virtualenv non trovato in $BACKEND/venv" >&2
  echo "Crea il venv e installa le dipendenze prima di avviare." >&2
  exit 1
fi

if [[ ! -d "$ROOT/node_modules" ]]; then
  echo "node_modules mancante: installo le dipendenze del frontend..."
  (cd "$ROOT" && npm install)
fi

# Tiene traccia dei PID per fermarli all'uscita.
pids=()

cleanup() {
  echo
  echo "Arresto di Girometro..."
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

# Applica eventuali migrazioni pendenti, poi avvia l'API.
echo "Applico le migrazioni del database..."
(cd "$BACKEND" && "$VENV_PY" manage.py migrate)

echo "Avvio backend Django su http://127.0.0.1:8001 ..."
(cd "$BACKEND" && "$VENV_PY" manage.py runserver 8001) &
pids+=($!)

echo "Avvio frontend Vite su http://127.0.0.1:5173 ..."
(cd "$ROOT" && npm run dev) &
pids+=($!)

echo
echo "Girometro avviato. Premi Ctrl-C per fermare tutto."

# Aspetta che un processo termini; cleanup ferma il resto.
wait -n
