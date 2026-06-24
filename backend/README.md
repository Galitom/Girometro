# Girometro — Backend (Django + DRF)

REST API for the Girometro frontend. Built with Django 5 + Django REST Framework,
JWT auth (`djangorestframework-simplejwt`), SQLite, and `django-cors-headers`.
Read endpoints return the **exact JSON shapes** the frontend's `src/api/mock.js`
expects; writes are JWT-authenticated. The database **starts empty** — players are
created by user registration, and data is populated by hand from the app.

## Setup

```bash
cd backend
python3 -m venv venv
venv/bin/pip install -r requirements.txt
venv/bin/python manage.py migrate
venv/bin/python manage.py runserver 8001
```

(The venv is already created; the dev box had something on :8000, hence :8001.)

Admin UI (to populate leagues / tournaments / chat / achievements by hand):

```bash
venv/bin/python manage.py createsuperuser
# then visit http://127.0.0.1:8001/admin/
```

Reset to an empty state:

```bash
venv/bin/python manage.py reset_db              # wipe data + non-superuser accounts
venv/bin/python manage.py reset_db --keep-users # keep accounts, wipe match/league/etc. data
```

## Auth

JWT via SimpleJWT. The frontend stores the tokens and sends `Authorization: Bearer <access>`.

| What            | Method | Path                 | Body / result                                            |
|-----------------|--------|----------------------|----------------------------------------------------------|
| Register        | POST   | `/api/auth/register` | `{username, password, name?}` → `{access, refresh, player_id}` |
| Login           | POST   | `/api/auth/login`    | `{username, password}` → `{access, refresh}`             |
| Refresh         | POST   | `/api/auth/refresh`  | `{refresh}` → `{access}`                                 |

Registration creates a Django `User` plus a linked `Player` (unique `slug`, derived
`initials`, palette color, Elo 1500).

## Data endpoints

All under `/api/`. **Auth?** = requires a valid access token.

| mock.js          | Method | Path               | Auth? |
|------------------|--------|--------------------|-------|
| `getMe`          | GET    | `/api/me`          | yes   |
| `getGroup`       | GET    | `/api/group`       | no    |
| `getPlayers`     | GET    | `/api/players`     | no    |
| `getLastMatch`   | GET    | `/api/last-match`  | no    |
| `getActivity`    | GET    | `/api/activity`    | no    |
| `getStats`       | GET    | `/api/stats`       | yes   |
| `getLeagues`     | GET    | `/api/leagues`     | no    |
| `getTournaments` | GET    | `/api/tournaments` | no    |
| `getChat`        | GET    | `/api/chat`        | no    |
| `getAchievements`| GET    | `/api/achievements`| no    |
| `submitMatch`    | POST   | `/api/matches`     | yes   |

`POST /api/matches` body: `{ mode, teamA: [slug], teamB: [slug], scoreA, scoreB }`
→ `{ ok: true, eloChange }`. Creates the match, recomputes Elo (standard Elo, K=32;
team rating = average of members), updates W/L, goals, and streaks, and records Elo
history. `eloChange` is from the requesting user's perspective. Rejects draws and a
player appearing on both sides.

## How the data is modeled

- **Player** — `slug` is the public id; `user` is a one-to-one link to `auth.User`.
  `/api/me` returns the requesting user's player (with computed `rank` and weekly `delta`).
- **Match** + **EloHistory** — every recorded match writes one history row per
  participant; `/api/stats` `eloSeries` and the weekly delta are derived from these.
- **League / LeagueStanding**, **Tournament / BracketMatch**, **ChatMessage**,
  **Achievement** — back the respective pages. Not yet creatable from the frontend;
  add them via `/admin/`.

## Frontend integration

`src/api/mock.js` is already an HTTP client pointed at `http://127.0.0.1:8001/api`
(override with the `VITE_API_URL` env var). It stores JWT tokens in `localStorage`,
attaches the `Authorization` header, and refreshes on 401. CORS is open for
`localhost:5173`/`5174` (and all origins while `DEBUG=True`).
