// Centralized mock data — swap each export for a real API call when backend is ready

const PLAYERS = [
  { id: 'teo',    name: 'Teo Marchetti',  initials: 'TM', color: '#c2410c', elo: 1842, w: 96,  l: 54, gf: 812, ga: 631, streak: 4,  best: 7,  delta: 23 },
  { id: 'luca',   name: 'Luca Ferrari',   initials: 'LF', color: '#3f6f8f', elo: 1918, w: 118, l: 47, gf: 940, ga: 588, streak: 6,  best: 9,  delta: 12 },
  { id: 'marco',  name: 'Marco Bianchi',  initials: 'MB', color: '#5b5fa8', elo: 1796, w: 88,  l: 61, gf: 770, ga: 690, streak: -2, best: 6,  delta: 31 },
  { id: 'giulia', name: 'Giulia Rossi',   initials: 'GR', color: '#8a4a78', elo: 1761, w: 79,  l: 58, gf: 701, ga: 642, streak: 2,  best: 5,  delta: -8 },
  { id: 'sara',   name: 'Sara Conti',     initials: 'SC', color: '#2f7d72', elo: 1724, w: 72,  l: 63, gf: 668, ga: 651, streak: 1,  best: 4,  delta: 6  },
  { id: 'dario',  name: 'Dario Greco',    initials: 'DG', color: '#7a6a36', elo: 1688, w: 64,  l: 70, gf: 612, ga: 668, streak: -1, best: 5,  delta: -14 },
  { id: 'ste',    name: 'Ste Gallo',      initials: 'SG', color: '#9a5230', elo: 1641, w: 55,  l: 74, gf: 560, ga: 690, streak: -3, best: 3,  delta: 4  },
  { id: 'vale',   name: 'Vale Esposito',  initials: 'VE', color: '#4a5a6a', elo: 1607, w: 48,  l: 79, gf: 521, ga: 712, streak: 1,  best: 4,  delta: 9  },
];

const P = Object.fromEntries(PLAYERS.map(p => [p.id, p]));
const ME = P.teo;
const ME_RANK = PLAYERS.slice().sort((a, b) => b.elo - a.elo).findIndex(p => p.id === ME.id) + 1;
const GROUP = { name: 'Polso Magico', members: PLAYERS.length, tag: 'BAR CENTRALE · MILANO' };

export const getMe = async () => ({ ...ME, rank: ME_RANK });
export const getGroup = async () => ({ ...GROUP });
export const getPlayers = async () => PLAYERS.slice().sort((a, b) => b.elo - a.elo);

export const getLastMatch = async () => ({
  mode: '1vs1', date: 'Ieri, 18:42', won: true,
  teamA: [ME], teamB: [P.marco], scoreA: 5, scoreB: 3, elo: +23,
});

export const getActivity = async () => [
  { id: 1, a: P.luca,  b: P.dario, sa: 5, sb: 1, when: '12 min fa', mode: '1vs1' },
  { id: 2, a: ME,      b: P.marco, sa: 5, sb: 3, when: '1 ora fa',  mode: '1vs1', mine: true },
  { id: 3, a: P.giulia,b: P.sara,  sa: 5, sb: 4, when: '3 ore fa',  mode: '1vs1' },
  { id: 4, a: P.ste,   b: P.vale,  sa: 2, sb: 5, when: 'Ieri',      mode: '1vs1' },
  { id: 5, a: P.luca,  b: P.marco, sa: 5, sb: 2, when: 'Ieri',      mode: '1vs1' },
];

export const getStats = async () => ({
  eloSeries: [1702, 1688, 1715, 1740, 1726, 1758, 1772, 1769, 1795, 1788, 1806, 1819, 1842],
  rivalries: [
    { opp: P.luca,   w: 9,  l: 14, gf: 84,  ga: 97 },
    { opp: P.marco,  w: 17, l: 8,  gf: 132, ga: 96 },
    { opp: P.giulia, w: 11, l: 9,  gf: 98,  ga: 88 },
  ],
  partners: [
    { mate: P.sara,  w: 22, l: 7, syn: 88 },
    { mate: P.dario, w: 14, l: 9, syn: 71 },
  ],
  records: [
    { label: 'Più gol in una partita', value: '5',    sub: 'vs Sara · cappotto' },
    { label: 'Striscia più lunga',     value: '7',    sub: 'vittorie · Mar 2025' },
    { label: 'Elo massimo',            value: '1851', sub: 'picco stagionale' },
    { label: 'Rimonta record',         value: '0→5',  sub: 'da 0–4 a 5–4' },
  ],
});

export const getLeagues = async () => [
  { id: 'inverno', name: 'Lega Inverno', season: 'Stagione 3', daysLeft: 9, played: 14, total: 21, featured: true,
    table: [{ p: P.luca, pts: 38 }, { p: ME, pts: 34 }, { p: P.marco, pts: 31 }, { p: P.giulia, pts: 27 }, { p: P.sara, pts: 22 }] },
  { id: 'doppio', name: 'Coppa Doppio', season: 'Stagione 1 · 2vs2', daysLeft: 23, played: 6, total: 15, featured: false,
    table: [{ p: P.sara, pts: 18 }, { p: P.dario, pts: 16 }, { p: ME, pts: 15 }, { p: P.vale, pts: 11 }] },
];

export const getTournaments = async () => ({
  list: [
    { id: 't1', name: 'Coppa del Bancone', status: 'live', players: 8,  prize: '€120', fee: '€15', note: 'Quarti in corso' },
    { id: 't2', name: 'Notturna Lampo',    status: 'open', players: 6,  cap: 16, prize: '€80', fee: '€10', note: 'Iscrizioni aperte' },
    { id: 't3', name: 'Memorial Spritz',   status: 'done', players: 12, prize: '€200', fee: '€20', note: 'Vinto da Luca F.' },
  ],
  bracket: {
    quarti: [
      { a: P.luca,  b: P.vale,  sa: 5,    sb: 2,    done: true },
      { a: P.giulia,b: P.ste,   sa: 5,    sb: 3,    done: true },
      { a: ME,      b: P.dario, sa: 5,    sb: 4,    done: true },
      { a: P.marco, b: P.sara,  sa: null, sb: null, done: false, live: true },
    ],
    semi: [
      { a: P.luca,  b: P.giulia, sa: null, sb: null, done: false },
      { a: ME,      b: null,     sa: null, sb: null, done: false },
    ],
    finale: [
      { a: null, b: null, sa: null, sb: null, done: false },
    ],
  },
});

export const getChat = async () => [
  { id: 1, who: P.giulia, text: 'Stasera rivincita? Devo vendicarmi 😤', t: '17:02' },
  { id: 2, type: 'event', icon: 'Swords', text: 'Teo ha battuto Marco 5–3 · +23 Elo', t: '18:43' },
  { id: 3, who: P.marco,  text: 'Era fortuna, il tuo portiere era imprendibile', t: '18:45' },
  { id: 4, who: ME,  mine: true, text: 'Manico, non fortuna 😎', t: '18:46' },
  { id: 5, type: 'event', icon: 'Flame', text: 'Luca è in striscia di 6 vittorie!', t: '19:10' },
  { id: 6, who: P.luca, text: 'Chi mi ferma stasera offro io il terzo tempo', t: '19:12' },
  { id: 7, who: P.sara, text: 'Accetto la sfida 🔥 ore 21 al Bancone', t: '19:15' },
  { id: 8, type: 'event', icon: 'Trophy', text: 'Coppa del Bancone · Quarti in corso', t: '19:20' },
];

export const getAchievements = async () => [
  { id: 'a1',  name: 'Primo Sangue',  desc: 'Vinci la tua prima partita',      icon: 'Swords',      got: true,  date: 'Set 2024' },
  { id: 'a2',  name: 'Cappotto',      desc: 'Vinci 5–0 senza subire gol',      icon: 'ShieldCheck', got: true,  date: 'Ott 2024' },
  { id: 'a3',  name: 'Striscia x5',  desc: '5 vittorie consecutive',           icon: 'Flame',       got: true,  date: 'Nov 2024' },
  { id: 'a4',  name: 'Cecchino',      desc: 'Segna 500 gol totali',             icon: 'Target',      got: true,  date: 'Gen 2025' },
  { id: 'a5',  name: 'Re del Polso',  desc: 'Raggiungi 1800 Elo',              icon: 'Crown',       got: true,  date: 'Mag 2025' },
  { id: 'a6',  name: 'Maratoneta',    desc: 'Gioca 150 partite',               icon: 'Activity',    got: true,  date: 'Mag 2025' },
  { id: 'a7',  name: 'Nemesi',        desc: 'Batti lo stesso avversario 10×',  icon: 'Swords',      got: false, prog: 8,    of: 10 },
  { id: 'a8',  name: 'Imbattibile',   desc: '10 vittorie consecutive',          icon: 'Zap',         got: false, prog: 7,    of: 10 },
  { id: 'a9',  name: 'Leggenda',      desc: 'Raggiungi 2000 Elo',              icon: 'Star',        got: false, prog: 1842, of: 2000, elo: true },
  { id: 'a10', name: 'Trofeo',        desc: 'Vinci un torneo',                 icon: 'Trophy',      got: false, prog: 0,    of: 1 },
  { id: 'a11', name: 'Bomber Doppio', desc: 'Vinci 25 partite in 2vs2',        icon: 'Users',       got: false, prog: 22,   of: 25 },
  { id: 'a12', name: 'Nottambulo',    desc: 'Gioca 20 partite dopo mezzanotte',icon: 'Moon',        got: false, prog: 6,    of: 20 },
];

export const submitMatch = async (payload) => {
  // POST /api/matches — replace with real fetch
  console.log('submitMatch', payload);
  return { ok: true, eloChange: payload.scoreA > payload.scoreB ? 21 : -17 };
};

// Re-export ME and PLAYERS so pages can build player selects without another fetch
export { ME, PLAYERS };
