"""Elo rating logic.

Standard Elo with a fixed K-factor. For team matches the team rating is the
average of its members; every member of a team receives the same delta.
"""

K_FACTOR = 32


def expected_score(rating_a, rating_b):
    """Probability that side A beats side B."""
    return 1.0 / (1.0 + 10 ** ((rating_b - rating_a) / 400.0))


def compute_delta(team_a_elos, team_b_elos, a_won):
    """Return the integer Elo delta for the winning convention.

    The returned value is the change applied to side A's members; side B's
    members receive the negation. ``a_won`` decides the actual scores.
    """
    avg_a = sum(team_a_elos) / len(team_a_elos)
    avg_b = sum(team_b_elos) / len(team_b_elos)

    exp_a = expected_score(avg_a, avg_b)
    actual_a = 1.0 if a_won else 0.0

    delta_a = round(K_FACTOR * (actual_a - exp_a))
    return delta_a
