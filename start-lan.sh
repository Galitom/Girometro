#!/usr/bin/env bash
#
# start-lan.sh — avvia Girometro (backend Django + frontend Vite) e lo rende
# raggiungibile dagli altri dispositivi sulla stessa rete locale (LAN).
#
# Cosa fa:
#   1. Rileva automaticamente l'IP LAN di questo computer (interfaccia con la
#      route di default — quella con cui parli davvero verso la rete).
#   2. Scrive .env.local con VITE_API_URL puntato a quell'IP, così il browser
#      degli altri chiama l'API sul TUO pc e non sul loro.
#   3. Avvia il backend su 0.0.0.0:8001 e il frontend Vite in ascolto su tutta
#      la rete. Chiudendo con Ctrl-C entrambi vengono fermati.
#
# Uso:
#   ./start-lan.sh            # rileva l'IP e avvia tutto
#   ./start-lan.sh 192.168.x  # forza un IP specifico (se il rilevamento sbaglia)
#
set -euo pipefail

# Root del progetto = cartella dove sta questo script.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

BACKEND_PORT=8001
FRONTEND_PORT=5173

# --- 1. Rileva l'IP LAN ----------------------------------------------------
if [[ $# -ge 1 ]]; then
  LAN_IP="$1"
else
  # IP sorgente della route di default: robusto, esclude le reti virtuali.
  LAN_IP="$(ip route get 1.1.1.1 2>/dev/null | grep -oP '(?<=src\s)\d+(\.\d+){3}' | head -n1 || true)"
fi

if [[ -z "${LAN_IP:-}" ]]; then
  echo "!! Non sono riuscito a rilevare l'IP LAN." >&2
  echo "   Controlla con 'ip addr' e rilancia:  ./start-lan.sh <IP>" >&2
  exit 1
fi

# --- 2. Scrivi .env.local con l'URL dell'API -------------------------------
API_URL="http://${LAN_IP}:${BACKEND_PORT}/api"
printf '# Generato da start-lan.sh — URL API per i dispositivi sulla LAN.\nVITE_API_URL=%s\n' "$API_URL" > .env.local

echo "==================================================================="
echo "  Girometro in avvio sulla rete locale"
echo "  IP di questo PC : $LAN_IP"
echo "  API (backend)   : $API_URL"
echo "  App (frontend)  : http://${LAN_IP}:${FRONTEND_PORT}"
echo ""
echo "  >>> Condividi questo link:  http://${LAN_IP}:${FRONTEND_PORT}"
echo "==================================================================="
echo ""

# --- 3. Avvia backend + frontend, fermandoli entrambi all'uscita -----------
PIDS=()
cleanup() {
  echo ""
  echo "Arresto in corso..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

# Backend Django in ascolto su tutte le interfacce.
( cd backend && venv/bin/python manage.py runserver "0.0.0.0:${BACKEND_PORT}" ) &
PIDS+=($!)

# Frontend Vite (host:true è già impostato in vite.config.js).
npm run dev &
PIDS+=($!)

# Aspetta finché uno dei due processi termina (o Ctrl-C).
wait
