"""Elo rating logic — goal-based, table-driven.

The delta is read from a hand-tuned lookup table (see
``.claude/elo-goal-based.md``) rather than a closed-form Elo formula. The table
is defined from the **winner's** point of view: rows are the loser's goal count
(0..9, the winner always reaching 10), columns are the "gap" — the winner's
rating minus the loser's rating before the match. The loser gets the negation.

For teams the team rating is the average of its members; every member of a team
receives the same delta. Scores other than the canonical 10 are normalised so
the loser's goals map onto the 0..9 row axis.
"""

# Gap columns of the lookup table: winner_rating - loser_rating.
GAP_COLS = [-1000, -500, 0, 500, 1000, 1500]

# Rows indexed by the loser's goals (0 = shutout .. 9 = lost 10-9).
# Each row holds the winner's delta at each gap in GAP_COLS.
DELTA_TABLE = {
    0: [24, 20, 16, 12, 8, 3],
    1: [21, 18, 13, 9, 5, 2],
    2: [19, 15, 11, 6, 3, 1],
    3: [17, 13, 9, 4, 2, 1],
    4: [15, 11, 7, 2, 1, 0],
    5: [14, 10, 5, 1, 0, -1],
    6: [12, 8, 4, 0, -4, -3],
    7: [11, 7, 3, -2, -5, -6],
    8: [10, 6, 2, -3, -7, -9],
    9: [9, 5, 1, -4, -7, -12],
}

MAX_GOALS = 10  # foosball is played to 10


def _interp_gap(row, gap):
    """Linearly interpolate a table row across the gap axis."""
    if gap <= GAP_COLS[0]:
        return float(row[0])
    if gap >= GAP_COLS[-1]:
        return float(row[-1])
    for i in range(len(GAP_COLS) - 1):
        lo, hi = GAP_COLS[i], GAP_COLS[i + 1]
        if lo <= gap <= hi:
            t = (gap - lo) / (hi - lo)
            return row[i] + t * (row[i + 1] - row[i])
    return float(row[-1])


def _winner_delta(gap, loser_goals):
    """Winner's Elo delta given the rating gap and the loser's goals.

    Bilinear interpolation: across the gap axis (columns) and across the
    loser-goals axis (rows). ``loser_goals`` may be fractional after
    normalisation, so we blend the two bracketing rows.
    """
    lg = max(0.0, min(9.0, float(loser_goals)))
    low = int(lg)
    high = min(9, low + 1)
    frac = lg - low

    d_low = _interp_gap(DELTA_TABLE[low], gap)
    d_high = _interp_gap(DELTA_TABLE[high], gap)
    return d_low + frac * (d_high - d_low)


def compute_delta(team_a_elos, team_b_elos, score_a, score_b):
    """Return the integer Elo delta applied to side A's members.

    Side B's members receive the negation. The magnitude comes from the
    goal-based lookup table, read from the winner's perspective and mirrored
    onto side A.
    """
    avg_a = sum(team_a_elos) / len(team_a_elos)
    avg_b = sum(team_b_elos) / len(team_b_elos)

    # Draw: no clear winner, symmetric — award nothing.
    if score_a == score_b:
        return 0

    a_won = score_a > score_b
    winner_elo, loser_elo = (avg_a, avg_b) if a_won else (avg_b, avg_a)
    winner_goals, loser_goals = (score_a, score_b) if a_won else (score_b, score_a)

    gap = winner_elo - loser_elo

    # Normalise the loser's goals onto the 0..9 row axis. When the winner
    # reaches exactly 10 this is a no-op; otherwise scale proportionally.
    if winner_goals > 0:
        loser_goals_norm = loser_goals * (MAX_GOALS / winner_goals)
    else:
        loser_goals_norm = 0.0

    winner_delta = round(_winner_delta(gap, loser_goals_norm))

    return winner_delta if a_won else -winner_delta
