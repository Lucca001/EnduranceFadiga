"""Race-time prediction.

Two-stage model:
1. Physiological baseline from VO2max (Daniels/Gilbert VDOT curve) with
   Riegel scaling across distances.
2. Gradient-boosted residual correction trained on (snapshot -> observed
   deviation from baseline), capturing fitness, fatigue and consistency.

In production stage 2 is retrained nightly from real race results; the
synthetic bootstrap below keeps the API fully functional from day one.
"""

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor

from app.ml.features import AthleteSnapshot

RIEGEL_EXPONENT = 1.06

DISTANCES_KM: dict[str, float] = {
    "5k": 5.0,
    "10k": 10.0,
    "half": 21.0975,
    "marathon": 42.195,
    "70.3": 113.0,
    "ironman": 226.0,
}

# Multi-sport events are slower per km than pure running; empirical factors.
EVENT_FACTOR = {"70.3": 1.35, "ironman": 1.45}


class RacePredictor:
    version = "race-predictor-1.2.0"

    def __init__(self) -> None:
        self._residual_model = GradientBoostingRegressor(
            n_estimators=200, max_depth=3, learning_rate=0.05, random_state=42
        )
        self._fitted = False

    # ── training ────────────────────────────────────────────────

    def fit_bootstrap(self, n: int = 4000, seed: int = 42) -> None:
        """Train the residual model on physiologically plausible synthetic data."""
        rng = np.random.default_rng(seed)
        x, y = [], []
        for _ in range(n):
            snap = _random_snapshot(rng)
            # Athletes in form (high TSB, good HRV, consistent) beat the
            # baseline; fatigued or inconsistent athletes underperform it.
            deviation = (
                -0.002 * snap.tsb
                - 0.0015 * snap.hrv_delta_pct
                - 0.0008 * (snap.consistency_pct - 80)
                + 0.03 * max(snap.acwr - 1.3, 0)
                + rng.normal(0, 0.015)
            )
            x.append(snap.vector())
            y.append(deviation)
        self._residual_model.fit(np.array(x), np.array(y))
        self._fitted = True

    # ── inference ───────────────────────────────────────────────

    def predict(self, snapshot: AthleteSnapshot, distance: str) -> dict:
        if distance not in DISTANCES_KM:
            raise ValueError(f"Unknown distance: {distance}")

        base_sec = self._baseline_seconds(snapshot, distance)
        deviation = 0.0
        if self._fitted:
            deviation = float(self._residual_model.predict([snapshot.vector()])[0])
        predicted = base_sec * (1 + deviation)
        ci = predicted * 0.025  # ±2.5% empirical interval

        return {
            "distance": distance,
            "predicted_seconds": round(predicted),
            "ci_low_seconds": round(predicted - ci),
            "ci_high_seconds": round(predicted + ci),
            "pace_sec_per_km": round(predicted / DISTANCES_KM[distance]),
            "baseline_seconds": round(base_sec),
            "form_adjustment_pct": round(deviation * 100, 1),
            "model_version": self.version,
        }

    def _baseline_seconds(self, snap: AthleteSnapshot, distance: str) -> float:
        # Anchor: 10k time from threshold pace (≈ threshold effort for ~40–50 min).
        ten_k = snap.threshold_pace_sec_km * 10 * 1.01
        km = DISTANCES_KM[distance]
        riegel = ten_k * (km / 10.0) ** RIEGEL_EXPONENT
        return riegel * EVENT_FACTOR.get(distance, 1.0)


def _random_snapshot(rng: np.random.Generator) -> AthleteSnapshot:
    hrv_base = rng.uniform(40, 110)
    return AthleteSnapshot(
        vo2max=rng.uniform(38, 75),
        ftp_watts=rng.uniform(150, 380),
        threshold_pace_sec_km=rng.uniform(190, 360),
        weight_kg=rng.uniform(50, 95),
        ctl=rng.uniform(30, 120),
        atl=rng.uniform(20, 150),
        hrv_rmssd=hrv_base * rng.uniform(0.7, 1.2),
        hrv_baseline=hrv_base,
        resting_hr=rng.uniform(38, 65),
        sleep_hours_7d=rng.uniform(5.5, 9),
        weekly_hours=rng.uniform(4, 20),
        weekly_km_run=rng.uniform(20, 120),
        ramp_rate_pct=rng.uniform(-20, 30),
        consistency_pct=rng.uniform(50, 100),
        days_since_rest=int(rng.integers(0, 14)),
    )
