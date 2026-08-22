"""Injury & overtraining risk.

Interpretable logistic model over well-established risk factors
(ACWR, ramp rate, HRV suppression, sleep debt, monotony). Every
prediction returns the contributing factors so the UI can explain
*why* the risk is what it is — never just a number.
"""

import math

from app.ml.features import AthleteSnapshot


class InjuryRiskModel:
    version = "injury-risk-1.1.0"

    # (name, weight, extractor) — weights calibrated against published
    # ACWR/HRV literature and tuned on the bootstrap cohort.
    def predict(self, snap: AthleteSnapshot) -> dict:
        factors = []

        acwr = snap.acwr
        acwr_score = max(0.0, (acwr - 1.3) * 2.2) + max(0.0, (0.8 - acwr) * 1.2)
        factors.append(_factor("acwr", acwr_score, f"Acute:chronic load ratio at {acwr:.2f}"))

        ramp = max(0.0, (snap.ramp_rate_pct - 10) / 10) * 0.8
        factors.append(_factor("ramp_rate", ramp, f"Weekly load ramp of {snap.ramp_rate_pct:+.0f}%"))

        hrv_drop = max(0.0, -snap.hrv_delta_pct / 10) * 0.9
        factors.append(_factor("hrv", hrv_drop, f"HRV {snap.hrv_delta_pct:+.0f}% vs. baseline"))

        sleep_debt = max(0.0, (7.0 - snap.sleep_hours_7d)) * 0.5
        factors.append(_factor("sleep", sleep_debt, f"Averaging {snap.sleep_hours_7d:.1f}h sleep"))

        no_rest = max(0.0, (snap.days_since_rest - 6) / 4) * 0.6
        factors.append(_factor("rest", no_rest, f"{snap.days_since_rest} days since a rest day"))

        logit = -2.4 + sum(f["contribution"] for f in factors)
        risk = 1 / (1 + math.exp(-logit))

        overtraining = min(1.0, max(0.0, (hrv_drop + no_rest + max(0, -snap.tsb) / 40) / 2.5))

        return {
            "injury_risk_pct": round(risk * 100),
            "overtraining_risk_pct": round(overtraining * 100),
            "performance_decline_risk_pct": round(min(95, max(5, (risk * 0.6 + overtraining * 0.4) * 100))),
            "level": _level(risk),
            "factors": sorted(factors, key=lambda f: -f["contribution"]),
            "model_version": self.version,
        }


def _factor(name: str, contribution: float, description: str) -> dict:
    return {
        "name": name,
        "contribution": round(contribution, 3),
        "description": description,
        "elevated": contribution > 0.3,
    }


def _level(risk: float) -> str:
    if risk < 0.25:
        return "low"
    if risk < 0.55:
        return "moderate"
    return "high"
