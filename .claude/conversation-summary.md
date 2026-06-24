# Riassunto sessione — Girometro

Cronologia di cosa è stato fatto in questa sessione, dall'avvio del progetto alla
creazione di un backend autenticato collegato al frontend.

## Punto di partenza

`Girometro` era un **prototipo front-end-only**: app Vite + React 19 (React Router 7,
niente TypeScript, niente CSS framework) per tracciare partite di calcio balilla — Elo,
classifica, leghe, tornei, statistiche, chat, achievement. Tutti i dati venivano da
`src/api/mock.js` (dati finti). Tutta la UI è in italiano.

## Cosa è stato fatto, in ordine

1. **Avvio progetto** — `npm run dev`; il server Vite gira su **http://localhost:5174/**
   (la 5173 era occupata).

2. **`CLAUDE.md`** — creato e poi mantenuto aggiornato a ogni passo (comandi,
   architettura FE/BE, convenzioni, quirk noti).

3. **Backend Django** — creato in `backend/`:
   - Django 5 + DRF, **SQLite** (`backend/db.sqlite3`), `django-cors-headers`.
   - Progetto `girometro/`, app `api/`. Modelli: `Player`, `Match`, `EloHistory`,
     `League`/`LeagueStanding`, `Tournament`/`BracketMatch`, `ChatMessage`,
     `Achievement`, `Group`.
   - **Logica Elo reale** (`api/elo.py` + `api/services.py`): Elo standard K=32, media
     squadra; `POST /api/matches` aggiorna Elo/W-L/gol/streak in transazione e scrive
     lo storico Elo.
   - Serializer modellati per restituire le **stesse identiche forme JSON** di `mock.js`.
   - Un endpoint per ogni funzione del mock, sotto `/api/`.

4. **Collegamento FE ↔ BE** — `src/api/mock.js` riscritto da dati finti a **client HTTP**
   (`fetch` verso `http://127.0.0.1:8001/api`, override con `VITE_API_URL`). Adattato
   `RegistraModal.jsx` a caricare giocatori/utente in modo asincrono (prima usava export
   sincroni `ME`/`PLAYERS`, rimossi).

5. **Fix bottone Dashboard** — "Registra Partita" puntava a una rotta `/registra`
   inesistente; ora apre il modale via `useOutletContext()` esposto da `AppLayout`.

6. **Autenticazione utenti (JWT)** — scelta finale: **SimpleJWT**, **DB vuoto** con
   popolamento manuale, **per ora solo registrazione partite** dopo il login.
   - `Player` collegato a `auth.User` (OneToOne `user`); rimosso il flag `is_me`.
   - `api/auth.py`: `register` crea User + Player (slug univoco, iniziali, colore, Elo
     1500) e restituisce i token. Login/refresh via `TokenObtainPairView`/`TokenRefreshView`.
   - Permessi: letture pubbliche; `/me`, `/stats`, `POST /matches` richiedono auth.
   - Comando `reset_db` (sostituisce il vecchio `seed`) per svuotare il DB.
   - Frontend: `src/auth/AuthContext.jsx` (`AuthProvider` + `useAuth()`),
     `src/pages/Login.jsx` (login/registrazione), rotte protette da `RequireAuth` in
     `App.jsx`, logout nella `Sidebar`. Il client `mock.js` gestisce token in
     `localStorage` e auto-refresh su 401.

7. **Superuser** — creato account admin per `/admin/` (vedi credenziali sotto).

## Stato attuale

- **Frontend**: http://localhost:5174/ (redirect a `/login` se non autenticato).
- **Backend**: http://127.0.0.1:8001/api/ — DB **vuoto**.
- Flusso verificato end-to-end: registrazione → token → partita autenticata con Elo
  ricalcolato → 401 senza token. Lint pulito.

### Credenziali admin (sviluppo)
- **username**: `admin`
- **password**: `admin1234`
- Admin: http://127.0.0.1:8001/admin/
- ⚠️ Credenziali solo per sviluppo locale — da cambiare/non usare in produzione.

## Comandi utili

```bash
# Frontend (dalla root)
npm run dev

# Backend (da backend/)
venv/bin/python manage.py runserver 8001
venv/bin/python manage.py reset_db              # svuota DB + account non-superuser
venv/bin/python manage.py reset_db --keep-users # svuota solo i dati, tiene gli account
```

## Possibili passi successivi (discussi, non fatti)

- Rendere creabili da frontend anche leghe, tornei, standing (ora solo via `/admin/`).
- Aggiungere invio messaggi in chat dal frontend (`POST /api/chat`).
- Migrazione a PostgreSQL per la produzione (cambio del solo blocco `DATABASES`).
