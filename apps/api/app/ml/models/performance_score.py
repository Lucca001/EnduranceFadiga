"""Composite Performance Score (0–100).

Weighted blend of recovery, load management, consistency and fitness
trend. Weights sum to 1; nutrition is scaffolded for a future signal.
"""

from app.ml.features import AthleteSnapshot

WEIGHTS = {
    "sleep": 0.15,
    "hrv": 0.15,
    "load_balance": 0.15,
    "recovery": 0.10,
    "consistency": 0.15,
    "volume": 0.10,
    "intensity": 0.10,
    "fitness_trend": 0.10,
    # "nutrition": 0.0  — architecture ready, signal not yet ingested
}


class PerformanceScoreModel:
    version = "performance-score-1.0.0"

    def predict(self, snap: AthleteSnapshot) -> dict:
        components = {
            "sleep": _clamp((snap.sleep_hours_7d - 5) / 3.5),
            "hrv": _clamp(0.5 + snap.hrv_delta_pct / 30),
            "load_balance": _clamp(1 - abs(snap.acwr - 1.05) / 0.6),
            "recovery": _clamp(0.5 + snap.tsb / 40),
            "consistency": _clamp(snap.consistency_pct / 100),
            "volume": _clamp(snap.weekly_hours / 14),
            "intensity": _clamp(1 - max(0, snap.ramp_rate_pct - 15) / 30),
            "fitness_trend": _clamp(snap.ctl / 100),
        }
        score = sum(WEIGHTS[k] * v for k, v in components.items()) / sum(WEIGHTS.values())
        return {
            "score": round(score * 100),
            "components": {k: round(v * 100) for k, v in components.items()},
            "weights": WEIGHTS,
            "model_version": self.version,
        }


def _clamp(v: float) -> float:
    return max(0.0, min(1.0, v))
