"""Scenario simulator — apply what-if deltas and re-run every model."""

from dataclasses import replace

from app.ml.features import AthleteSnapshot
from app.ml.registry import model_registry


def simulate(snap: AthleteSnapshot, changes: dict) -> dict:
    modified = replace(
        snap,
        weight_kg=snap.weight_kg + changes.get("weight_delta_kg", 0),
        sleep_hours_7d=changes.get("sleep_hours", snap.sleep_hours_7d),
        weekly_hours=snap.weekly_hours * (1 + changes.get("volume_delta_pct", 0) / 100),
        ramp_rate_pct=snap.ramp_rate_pct + changes.get("volume_delta_pct", 0),
        atl=snap.atl * (1 + changes.get("intensity_delta_pct", 0) / 100),
    )
    # First-order physiological effects of the scenario.
    if changes.get("weight_delta_kg", 0) < 0:
        # ~1.7% VO2max (ml/kg/min) gain per kg lost, capped.
        modified = replace(
            modified,
            vo2max=snap.vo2max * (1 + min(0.06, -changes["weight_delta_kg"] * 0.017)),
        )
    if changes.get("sleep_hours", snap.sleep_hours_7d) >= 8 and snap.sleep_hours_7d < 8:
        modified = replace(modified, hrv_rmssd=snap.hrv_rmssd * 1.06)

    return {
        "before": _evaluate(snap),
        "after": _evaluate(modified),
        "changes_applied": changes,
    }


def _evaluate(snap: AthleteSnapshot) -> dict:
    return {
        "performance_score": model_registry.performance_score.predict(snap),
        "injury_risk": model_registry.injury_risk.predict(snap),
        "race_10k": model_registry.race_predictor.predict(snap, "10k"),
        "race_half": model_registry.race_predictor.predict(snap, "half"),
    }
