# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This repo has two parts: the **frontend** at the root (Vite + React) and the **backend** in
`backend/` (Django + DRF). They run as separate processes.

## Commands

Frontend (run from repo root):

```bash
npm run dev      # Vite dev server with HMR (falls back to :5174 if :5173 is taken)
npm run build    # production build to dist/
npm run preview  # serve the production build locally
npm run lint     # ESLint over all .js/.jsx
```

Backend (run from `backend/`; the venv lives at `backend/venv/`):

```bash
venv/bin/python manage.py runserver 8001   # dev API server (:8000 was taken on the dev box, hence :8001)
venv/bin/python manage.py migrate          # apply DB migrations
venv/bin/python manage.py reset_db         # wipe all data + non-superuser accounts (fresh empty start)
venv/bin/python manage.py reset_db --keep-users   # wipe match/league/etc. data but keep accounts
venv/bin/python manage.py createsuperuser  # for /admin/ — populate leagues/tournaments/chat by hand
venv/bin/python manage.py makemigrations api
```

There is no test runner configured on either side.

## What this is

**Girometro** — an Italian-language web app for tracking foosball ("calcio balilla") matches in a
group: Elo rankings, leagues, tournaments, stats, chat, and achievements. All copy and data labels
are in Italian.

The frontend **is wired to the Django backend** (`backend/`) over JWT-authenticated REST. Users
register/log in, become a `Player`, and populate data by hand (recording matches). The database
ships **empty** — there is no demo seed. `src/api/mock.js` is now the HTTP client (name kept for
import stability), not mock data.

## Frontend architecture

React 19 + Vite 8, React Router 7. No TypeScript, no CSS framework, no state-management library.

- `src/main.jsx` → `src/App.jsx` defines all routes, wrapped in `<AuthProvider>`. `/login` is public;
  all app routes are wrapped in `RequireAuth` (redirects to `/login` when there's no user, after the
  initial token check resolves). `AppLayout` is the shell (sidebar + topbar + centered `<Outlet/>`).
- `src/auth/AuthContext.jsx` — `AuthProvider` + `useAuth()`. Holds the current user (`me`), a
  `loading` flag for the boot-time token check, and `login`/`register`/`logout`/`refreshMe`. On mount
  it calls `getMe()` if a token exists. **Pages get `me` from `useAuth()`, not their own fetch** (only
  `AppLayout` consumes it; pages that still fetch `getMe()` independently also work).
- `src/api/mock.js` is the **HTTP client** (filename kept for import stability). Holds JWT tokens in
  `localStorage`, attaches `Authorization: Bearer`, and auto-refreshes on a 401 then replays the
  request. Exports `login`/`register`/`logout`/`setTokens`/`getToken` plus one data fn per endpoint
  (`getMe`, `getPlayers`, `getStats`, `submitMatch`, …). `submitMatch` maps player objects → slug ids.
  Base URL is `import.meta.env.VITE_API_URL` or `http://127.0.0.1:8001/api`.
- `src/components/ui/` holds the small reusable primitives: `Panel`/`PanelTitle` (the card wrapper
  used everywhere), `Avatar`, `Chip`, `Delta` (signed +/- Elo badge), `ProgressBar`, `LineChart`.
- `src/layout/` is `Sidebar` (nav as `NAV_GROUPS`; the user mini-card has the logout button),
  `TopBar`, `AppLayout`. `src/pages/Login.jsx` is the combined login/register screen.

## Backend architecture

Django 5 + DRF + `djangorestframework-simplejwt` (JWT auth) + `django-cors-headers`, SQLite
(`backend/db.sqlite3`). The project is `girometro/`, the single app is `api/`. **Every read endpoint
is shaped to match one `mock.js` function exactly** — same field names (`id`, `w`, `l`, `gf`, `ga`,
`streak`, `best`, `delta`, …), same optional-key omissions — so the serializers, not the models, are
the contract with the frontend.

- **Auth** — `api/auth.py` has `register` (creates a Django `User` + a linked `Player`, derives a
  unique `slug`/`initials`/color, returns JWT tokens) plus `RegisterSerializer`. Login/refresh use
  SimpleJWT's `TokenObtainPairView`/`TokenRefreshView` at `/api/auth/login` and `/api/auth/refresh`.
  DRF default permission is `AllowAny` (reads are public); `me`, `stats`, and `matches` add
  `IsAuthenticated`. "Me" = the `Player` whose `user` is the request's authenticated user
  (`_get_me(request)` in `views.py`).
- `api/models.py` — `Player` has a `OneToOneField` to `auth.User` (`user`); a registered user owns
  exactly one Player. Also `Match` + `EloHistory`, `League`/`LeagueStanding`,
  `Tournament`/`BracketMatch`, `ChatMessage`, `Achievement`, `Group`.
- `api/views.py` + `api/urls.py` — one function-based view per endpoint, all under `/api/`. The full
  endpoint table is in `backend/README.md`.
- `api/serializers.py` — uses `source=` and `to_representation` overrides to rename Django fields to
  the mock's keys and drop keys when not applicable (e.g. achievement `date`/`prog`/`of`).
- `api/elo.py` + `api/services.py` — **real Elo logic.** `POST /api/matches` runs `record_match()` in
  a transaction: standard Elo (K=32, team rating = average of members), updates W/L, goals, and
  streaks, and writes one `EloHistory` row per participant. `elo_change` is reported from the
  requesting player's perspective (`perspective=` arg). `/api/stats` `eloSeries` and the weekly
  `delta` on `/api/me` derive from `EloHistory`.
- `api/management/commands/reset_db.py` — empties the DB for a fresh start (`--keep-users` keeps
  accounts). There is no demo seed; players come from real registrations.

The DB starts empty. Players/matches/Elo/ranking/stats come from live user activity; leagues,
tournaments, chat, and achievements are not yet creatable from the frontend — populate them via
`/admin/` (run `createsuperuser` first). CORS is open for `localhost:5173`/`5174` (and all origins
while `DEBUG=True`).

## Conventions to match

- **Styling is inline `style={{}}` objects**, not CSS files. Colors, fonts, and the sidebar width
  come from CSS variables defined in `src/index.css` `:root` — always use `var(--accent)`,
  `var(--surface)`, `var(--muted)`, `var(--pos)`, `var(--neg)`, etc. rather than hard-coding hex.
- Class names in `index.css` are utility helpers, not modules: `disp`/`disp-tight` (Barlow Condensed
  display font), `mono` (Space Mono), `glow-accent`/`txt-glow` (orange glow), `screen-in`/`rise`
  (entrance animations), `card-hover`, `press-90/95/97` (tap-scale). Reuse these instead of
  re-defining the effects inline.
- Icons come from `lucide-react`, imported by name. In mock data, icons are stored as **string names**
  (e.g. `icon: 'Flame'`) and the rendering page maps the string to the component.
- New data-backed screens follow the pattern: `useState(null)` + `useEffect` fetch from `mock.js`,
  `if (!data) return null;` guard, then render inside `<div className="screen-in">`.

## Known quirks

- "Registra Partita" (record a match) is a **modal**, not a route: `AppLayout` holds `registraOpen`
  state, and exposes the opener to pages via `<Outlet context={{ onRegistra }} />`. `TopBar` opens it
  through its `onRegistra` prop; `Dashboard.jsx` gets the same callback via `useOutletContext()`. There
  is no `/registra` route — open the modal through that context rather than adding one.
