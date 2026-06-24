# Setup su una nuova macchina

Guida per far girare Girometro dopo aver clonato/pullato il repository.

## Requisiti

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **npm** ≥ 9

---

## 1. Clona il repository

```bash
git clone <url-repo> Girometro
cd Girometro
```

---

## 2. Frontend

```bash
npm install
```

Crea il file `.env` nella root del progetto (opzionale, ma consigliato):

```
VITE_API_URL=http://127.0.0.1:8001/api
```

Se non crei il file, il client usa già `http://127.0.0.1:8001/api` come default.

---

## 3. Backend

```bash
cd backend
python3 -m venv venv
venv/bin/pip install -r requirements.txt
```

Applica le migrazioni e crea il superuser per `/admin/`:

```bash
venv/bin/python manage.py migrate
venv/bin/python manage.py createsuperuser
```

---

## 4. Avvia i server

Apri **due terminali separati**.

**Terminale 1 — Backend** (dalla cartella `backend/`):

```bash
venv/bin/python manage.py runserver 8001
```

**Terminale 2 — Frontend** (dalla root del progetto):

```bash
npm run dev
```

L'app è raggiungibile su `http://localhost:5173` (o `:5174` se la porta è occupata).

---

## 5. Prima configurazione

1. Vai su `http://localhost:5173` e registra il primo account — diventa automaticamente un `Player`.
2. Accedi a `http://localhost:8001/admin/` con le credenziali del superuser per gestire leghe, tornei e achievement via pannello admin.
3. Registra partite dall'app per popolare classifica, Elo e statistiche.

---

## Note

- Il backend gira su `:8001` (non `:8000`) perché sulla macchina di sviluppo originale la 8000 era occupata.
- Il DB è SQLite (`backend/db.sqlite3`) — non è incluso nel repo, quindi parte sempre vuoto.
- Per azzerare i dati senza ricreare il DB: `venv/bin/python manage.py reset_db` (oppure `--keep-users` per tenere gli account).
