# Girometro — Cosa manca da fare

Stato: il frontend è collegato al backend Django con autenticazione JWT. Partite ed Elo
funzionano end-to-end. Quanto segue è ciò che resta, dal più importante al più rifinitura.

## Funzionalità mancanti (dati non creabili da frontend)

Oggi solo **registrazione partite** scrive dati dall'app. Tutto il resto è in sola
lettura e va popolato via `/admin/`. Da implementare (endpoint POST + UI):

- [ ] **Chat** — invio messaggi (`POST /api/chat`). È il passo più semplice e ad alto impatto.
- [ ] **Leghe** — creare lega, iscrivere giocatori, gestire i punti/standing.
- [ ] **Tornei** — creare torneo, generare il bracket, registrare i risultati delle fasi.
- [ ] **Achievement** — al momento sono statici; renderli **calcolati** dai dati reali
      (es. "10 vittorie consecutive" derivato dallo storico) invece che inseriti a mano.

## Pagine frontend ancora legate a dati finti

Da verificare e ricollegare ai dati reali (alcune mostrano ancora valori hard-coded):

- [ ] `Statistiche.jsx` — il `Delta value={+140}` e il `Chip "Picco 1851"` sono ancora
      fissi; vanno derivati da `getStats()`.
- [ ] `Statistiche.jsx` — sezione **rivalità** (miglior avversario/nemico storico) da
      collegare a dati reali: endpoint dedicato o campo in `getStats()`.
- [ ] `Statistiche.jsx` — sezione **miglior coppia** (compagno con cui si vince di più)
      da collegare a dati reali.
- [ ] Etichette varie ("90 giorni", "questa sett.") da rendere coerenti coi dati reali.
- [ ] Verificare il comportamento di tutte le pagine con **DB vuoto / nuovo utente**
      (zero partite, zero rivalità): evitare stati rotti o vuoti poco chiari.

## Pagine future

- [ ] **Storico partite** — pagina dedicata con la lista di tutte le partite giocate
      (filtrabili per giocatore/data), collegata a un endpoint `GET /api/matches`.
- [ ] **Notifiche** — sistema per gestire e visualizzare notifiche in-app (es. sfide,
      risultati, achievement sbloccati); valutare se push o solo polling.

## Autenticazione / sicurezza

- [ ] **Logout completo**: invalidare il refresh token lato server (blacklist SimpleJWT),
      ora il logout cancella solo i token dal `localStorage`.
- [ ] Validazione password più robusta in registrazione (ora minimo 6 caratteri).
- [ ] Gestire la **scadenza del refresh token** nel frontend (redirect pulito a `/login`).
- [ ] Profilo utente: modifica nome/colore/avatar dopo la registrazione.

## Backend / produzione

- [ ] **`SECRET_KEY`**: ora è una chiave hard-coded di sviluppo in `settings.py`.
      Spostare in variabile d'ambiente prima di qualsiasi deploy.
- [ ] **`DEBUG=True`** e **CORS aperto a tutti**: chiudere per la produzione.
- [ ] `ALLOWED_HOSTS = ['*']`: restringere.
- [ ] Migrazione a **PostgreSQL** per la produzione (cambio del solo blocco `DATABASES`).
- [ ] Credenziali superuser di sviluppo (`admin` / `admin1234`) da cambiare.

## Qualità / DX

- [ ] **Nessun test** su frontend né backend. Aggiungere almeno test sulla logica Elo
      (`api/services.py`, `api/elo.py`) e sul flusso auth.
- [ ] File `.env` per `VITE_API_URL` invece dell'URL di default nel codice.
- [ ] Gestione errori UI più ricca (toast/messaggi) oltre alla schermata di login.

## Note

- Il backend gira su :8001 perché la :8000 era occupata sulla macchina di sviluppo.
- Vedi `.claude/conversation-summary.md` per il contesto di come ci siamo arrivati.

## Già fatto (storico)

- [x] Rinominare `src/api/mock.js` → `src/api/client.js` (`a2cb6a3`).
- [x] Rimuovere bottone gruppo e barra di ricerca dalla TopBar.
