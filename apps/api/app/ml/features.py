"""Feature engineering shared by every model.

All models consume the same AthleteSnapshot so that predictions,
risk scores and simulations stay consistent with each other.
"""

from dataclasses import dataclass, field

import numpy as np


@dataclass
class AthleteSnapshot:
    """Point-in-time view of an athlete, built from synced data."""

    vo2max: float
    ftp_watts: float
    threshold_pace_sec_km: float
    weight_kg: float
    ctl: float                  # chronic training load (42d EWMA of daily TSS)
    atl: float                  # acute training load (7d EWMA)
    hrv_rmssd: float
    hrv_baseline: float
    resting_hr: float
    sleep_hours_7d: float
    weekly_hours: float
    weekly_km_run: float
    ramp_rate_pct: float        # week-over-week load change
    consistency_pct: float      # % of planned sessions completed, 28d
    days_since_rest: int
    extras: dict = field(default_factory=dict)

    @property
    def tsb(self) -> float:
        """Form: positive = fresh, negative = fatigued."""
        return self.ctl - self.atl

    @property
    def acwr(self) -> float:
        """Acute:chronic workload ratio. Sweet spot ≈ 0.8–1.3."""
        return self.atl / self.ctl if self.ctl > 0 else 1.0

    @property
    def hrv_delta_pct(self) -> float:
        if self.hrv_baseline <= 0:
            return 0.0
        return (self.hrv_rmssd - self.hrv_baseline) / self.hrv_baseline * 100

    def vector(self) -> np.ndarray:
        return np.array(
            [
                self.vo2max,
                self.ftp_watts / max(self.weight_kg, 1),
                self.threshold_pace_sec_km,
                self.ctl,
                self.tsb,
                self.acwr,
                self.hrv_delta_pct,
                self.sleep_hours_7d,
                self.weekly_hours,
                self.ramp_rate_pct,
                self.consistency_pct,
            ],
            dtype=float,
        )


FEATURE_NAMES = [
    "vo2max",
    "watts_per_kg",
    "threshold_pace",
    "ctl",
    "tsb",
    "acwr",
    "hrv_delta_pct",
    "sleep_hours_7d",
    "weekly_hours",
    "ramp_rate_pct",
    "consistency_pct",
]


def compute_training_loads(daily_tss: np.ndarray) -> tuple[float, float, float]:
    """CTL/ATL/TSB via exponentially weighted moving averages (Banister-style)."""
    ctl = _ewma(daily_tss, time_constant=42)
    atl = _ewma(daily_tss, time_constant=7)
    return round(ctl, 1), round(atl, 1), round(ctl - atl, 1)


def _ewma(values: np.ndarray, time_constant: int) -> float:
    if len(values) == 0:
        return 0.0
    alpha = 1 - np.exp(-1 / time_constant)
    acc = 0.0
    for v in values:
        acc = acc + alpha * (v - acc)
    return float(acc)
