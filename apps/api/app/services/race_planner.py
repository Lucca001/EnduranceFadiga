"""Race-day plan: pacing, power, nutrition and hydration."""

from app.ml.features import AthleteSnapshot
from app.ml.models.race_predictor import DISTANCES_KM
from app.ml.registry import model_registry


def build_plan(snap: AthleteSnapshot, distance: str) -> dict:
    pred = model_registry.race_predictor.predict(snap, distance)
    km = DISTANCES_KM[distance]
    hours = pred["predicted_seconds"] / 3600

    carbs_g_per_h = 60 if hours < 2.5 else 90
    fluid_ml_per_h = 600

    splits = []
    # Slight negative split: first third conservative, last third strong.
    for seg, factor in (("first_third", 1.02), ("middle_third", 1.00), ("final_third", 0.98)):
        splits.append({
            "segment": seg,
            "pace_sec_per_km": round(pred["pace_sec_per_km"] * factor),
            "power_watts": round(snap.ftp_watts * _if_target(distance) / factor),
        })

    return {
        "prediction": pred,
        "pacing": splits,
        "nutrition": {
            "carbs_g_per_hour": carbs_g_per_h,
            "carbs_g_total": round(carbs_g_per_h * hours),
            "fluid_ml_per_hour": fluid_ml_per_h,
            "fluid_ml_total": round(fluid_ml_per_h * hours),
            "sodium_mg_per_hour": 500,
        },
        "distance_km": km,
    }


def _if_target(distance: str) -> float:
    """Target intensity factor by event duration."""
    return {"5k": 1.02, "10k": 0.97, "half": 0.91, "marathon": 0.84, "70.3": 0.80, "ironman": 0.72}[distance]
