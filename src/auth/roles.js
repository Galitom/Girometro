// Ruoli utente e helper di permesso condivisi. Il ruolo arriva dal backend su
// `me.role` (vedi getMe()). Rispecchia api/players/models.py Player.ROLE_*.

export const ROLES = {
  PLAYER: 'player',
  BACKOFFICE: 'backoffice',
  ADMIN: 'admin',
};

// Etichette in italiano per la UI.
export const ROLE_LABELS = {
  [ROLES.PLAYER]: 'Player',
  [ROLES.BACKOFFICE]: 'Back office',
  [ROLES.ADMIN]: 'Admin',
};

export const isAdmin = (me) => me?.role === ROLES.ADMIN;

// Admin e back office possono registrare/aggiornare le partite.
export const canManageMatches = (me) =>
  me?.role === ROLES.ADMIN || me?.role === ROLES.BACKOFFICE;
