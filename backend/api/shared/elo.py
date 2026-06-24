"""Elo rating logic.

Standard Elo with a fixed K-factor. For team matches the team rating is the
average of its members; every member of a team receives the same delta.

The actual score is goal-based: actual_a = score_a / (score_a + score_b),
so a 10-0 win counts far more than a 10-9 win.
"""

K_FACTOR = 32


def expected_score(rating_a, rating_b):
    """Probability that side A beats side B."""
    return 1.0 / (1.0 + 10 ** ((rating_b - rating_a) / 400.0))


def compute_delta(team_a_elos, team_b_elos, score_a, score_b):
    """Return the integer Elo delta applied to side A's members.

    Side B's members receive the negation. The actual score is proportional
    to goals: score_a / (score_a + score_b), ranging from 0 (shutout loss)
    to 1 (shutout win), with 0.5 for a draw.
    """
    avg_a = sum(team_a_elos) / len(team_a_elos)
    avg_b = sum(team_b_elos) / len(team_b_elos)

    exp_a = expected_score(avg_a, avg_b)
    total = score_a + score_b
    actual_a = score_a / total if total > 0 else 0.5

    delta_a = round(K_FACTOR * (actual_a - exp_a))
    return delta_a
