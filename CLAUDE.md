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
venv/bin/python manage.py runserver 8001          # dev API server (:8000 was taken on the dev box, hence :8001)
venv/bin/python manage.py migrate                 # apply DB migrations
venv/bin/python manage.py makemigrations api      # generate new migrations after model changes
venv/bin/python manage.py reset_db                # wipe all data + non-superuser accounts (fresh empty start)
venv/bin/python manage.py reset_db --keep-users   # wipe match/league/etc. data but keep accounts
venv/bin/python manage.py recompute_elo           # replay all matches and rebuild Elo history from scratch
venv/bin/python manage.py createsuperuser         # for /admin/ — populate leagues/tournaments by hand
```

There is no test runner configured on either side.

## What this is

**Girometro** — an Italian-language web app for tracking foosball ("calcio balilla") matches in a
group: Elo rankings, classifica, statistiche, leghe, tornei, and achievements. All copy and data
labels are in Italian.

The frontend **is wired to the Django backend** (`backend/`) over JWT-authenticated REST. Users
register/log in, become a `Player`, and populate data by hand (recording matches). The database
ships **empty** — there is no demo seed. `src/api/client.js` is the HTTP client.

## Frontend architecture

React 19 + Vite 8, React Router 7. No TypeScript, no CSS framework, no state-management library.

- `src/main.jsx` → `src/App.jsx` defines all routes, wrapped in `<AuthProvider>`. `/login` is public;
  all app routes are wrapped in `RequireAuth` (redirects to `/login` when there's no user, after the
  initial token check resolves). `AppLayout` is the shell (sidebar + topbar + centered `<Outlet/>`).
- `src/auth/AuthContext.jsx` — `AuthProvider` + `useAuth()`. Holds the current user (`me`), a
  `loading` flag for the boot-time token check, and `login`/`register`/`logout`/`refreshMe`. On mount
  it calls `getMe()` if a token exists. **Pages get `me` from `useAuth()`, not their own fetch.**
- `src/api/client.js` is the **HTTP client** (formerly `mock.js`). Holds JWT tokens in
  `localStorage`, attaches `Authorization: Bearer`, and auto-refreshes on a 401 then replays the
  request. Exports `login`/`register`/`logout`/`setTokens`/`getToken` plus one data fn per endpoint
  (`getMe`, `getPlayers`, `getStats`, `submitMatch`, …). `submitMatch` maps player objects → slug ids.
  Base URL is `import.meta.env.VITE_API_URL` or `http://127.0.0.1:8001/api`.
- `src/components/ui/` — small reusable primitives: `Panel`/`PanelTitle` (card wrapper used
  everywhere), `Avatar`, `Chip`, `Delta` (signed +/- Elo badge), `ProgressBar`, `LineChart`.
- `src/components/ErrorBoundary.jsx` — catches React render errors and shows a fallback.
- `src/layout/` — `Sidebar` (nav as `NAV_GROUPS`; user mini-card with logout), `TopBar` (campanello
  + bottone "Partita"; niente barra di ricerca né selettore gruppo), `AppLayout`.
- `src/pages/Login.jsx` — combined login/register screen.

## Backend architecture

Django 5 + DRF + `djangorestframework-simplejwt` (JWT auth) + `django-cors-headers`, SQLite
(`backend/db.sqlite3`). The project package is `girometro/`; the single Django app is `api/`,
organized into **feature slices** — each with its own `models.py`, `serializers.py`, `views.py`,
`urls.py`:

```
api/
  accounts/      # register, login, refresh, me
  players/       # player list, detail
  matches/       # record match, Elo logic
  stats/         # per-player stats + Elo series
  groups/        # group info (read-only from frontend)
  leagues/       # league standings (read-only from frontend)
  tournaments/   # bracket (read-only from frontend)
  achievements/  # achievement list (read-only from frontend)
  shared/        # elo.py (compute_delta), request.py (_get_me helper)
  management/commands/
    reset_db.py       # wipe data
    recompute_elo.py  # replay all matches and rebuild Elo
```

**Every read endpoint is shaped to match one `client.js` function exactly** — same field names
(`id`, `w`, `l`, `gf`, `ga`, `streak`, `best`, `delta`, …) — so the serializers, not the models,
are the contract with the frontend.

- **Auth** — `accounts/views.py` has `register` (creates Django `User` + linked `Player`, derives
  unique `slug`/`initials`/color, returns JWT tokens). Login/refresh use SimpleJWT's views at
  `/api/auth/login` and `/api/auth/refresh`. DRF default permission is `AllowAny` (reads are
  public); `me`, `stats`, and `matches` require `IsAuthenticated`.
- **Elo** — `shared/elo.py` implements goal-based Elo: `actual_score = goals_a / (goals_a + goals_b)`,
  K=32, team rating = average of members. `matches/services.py` → `recompute_all()` replays the
  **entire match history** in chronological order on every insert, so backdated matches stay
  consistent. Writes one `EloHistory` row per participant per match.
- `api/models.py` — thin re-exports/shared base; real models live in each slice. Key models:
  `Player` (`OneToOneField` to `auth.User`), `Match`, `EloHistory`, `League`/`LeagueStanding`,
  `Tournament`/`BracketMatch`, `Achievement`, `Group`.

The DB starts empty. Players/matches/Elo/ranking/stats come from live user activity. Leagues,
tournaments, chat, and achievements are not yet creatable from the frontend — populate them via
`/admin/` (run `createsuperuser` first). CORS is open for `localhost:5173`/`5174` (and all origins
while `DEBUG=True`).

## Conventions to match

- **Styling is inline `style={{}}` objects**, not CSS files. Colors come from CSS variables in
  `src/index.css` `:root` — always use `var(--accent)`, `var(--surface)`, `var(--muted)`,
  `var(--pos)`, `var(--neg)`, `var(--line)`, `var(--dim)`, etc. Never hard-code hex.
- Class names in `index.css` are utility helpers: `disp`/`disp-tight` (Barlow Condensed display
  font), `mono` (Space Mono), `glow-accent`/`txt-glow` (orange glow), `screen-in`/`rise` (entrance
  animations), `card-hover`, `press-90/95/97` (tap-scale). Reuse these instead of redefining inline.
- Icons come from `lucide-react`, imported by name.
- New data-backed screens follow the pattern: `useState(null)` + `useEffect` fetch from `client.js`,
  `if (!data) return null;` guard, then render inside `<div className="screen-in">`.

## Known quirks

- "Registra Partita" (record a match) is a **modal**, not a route: `AppLayout` holds `registraOpen`
  state and exposes the opener via `<Outlet context={{ onRegistra }} />`. `TopBar` opens it through
  its `onRegistra` prop; `Dashboard.jsx` gets it via `useOutletContext()`. There is no `/registra`
  route — always open through that context.
- Elo recomputes the full history on every match insert (`recompute_all()`). This is intentional for
  correctness with backdated matches — fine for a small group.
- The `client.js` filename was originally `mock.js`; some older comments may still reference the old
  name.
