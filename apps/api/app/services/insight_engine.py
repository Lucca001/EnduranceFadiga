"""Turns raw model outputs into natural-language insights.

Rule templates keep insights deterministic and auditable; the AI Coach
handles open-ended questions separately.
"""

from app.ml.features import AthleteSnapshot


def generate_insights(snap: AthleteSnapshot, risk: dict) -> list[dict]:
    insights: list[dict] = []

    if snap.ramp_rate_pct > 15 and snap.hrv_delta_pct < -8:
        insights.append(_insight(
            "warning",
            "Load up, recovery down",
            f"Your training load rose {snap.ramp_rate_pct:.0f}% this week while HRV dropped "
            f"{abs(snap.hrv_delta_pct):.0f}% below baseline. Your body is absorbing more stress "
            "than it can recover from. Reduce intensity for the next two days.",
        ))

    if snap.acwr > 1.3:
        insights.append(_insight(
            "critical",
            "Load spike detected",
            f"Your acute:chronic ratio is {snap.acwr:.2f} — above the 1.3 threshold associated "
            "with elevated injury risk. Consider swapping tomorrow's session for an easy spin.",
        ))

    if snap.sleep_hours_7d < 7:
        insights.append(_insight(
            "warning",
            "Sleep debt building",
            f"You averaged {snap.sleep_hours_7d:.1f}h of sleep this week. Recovery adaptations "
            "happen during sleep — aim for 8h during heavy blocks.",
        ))

    if snap.tsb < -25:
        insights.append(_insight(
            "info",
            "Deep in the fatigue zone",
            f"Form (TSB) is at {snap.tsb:.0f}. Expected during a build phase, but plan a "
            "recovery week within the next 10 days to convert fatigue into fitness.",
        ))

    if snap.consistency_pct >= 85:
        insights.append(_insight(
            "positive",
            "Consistency is your superpower",
            f"You completed {snap.consistency_pct:.0f}% of planned sessions over the last 4 weeks. "
            "Consistency predicts long-term improvement better than any single workout.",
        ))

    return insights


def _insight(severity: str, title: str, body: str) -> dict:
    return {"severity": severity, "title": title, "body": body}
