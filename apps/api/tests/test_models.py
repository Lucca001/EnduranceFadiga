import numpy as np

from app.ml.features import AthleteSnapshot, compute_training_loads
from app.ml.models.injury_risk import InjuryRiskModel
from app.ml.models.performance_score import PerformanceScoreModel
from app.ml.models.race_predictor import RacePredictor
from app.services.snapshot import DEMO_SNAPSHOT


def _snap(**overrides) -> AthleteSnapshot:
    from dataclasses import replace
    return replace(DEMO_SNAPSHOT, **overrides)


class TestRacePredictor:
    def test_longer_races_take_longer(self):
        m = RacePredictor()
        m.fit_bootstrap(n=500)
        t5 = m.predict(DEMO_SNAPSHOT, "5k")["predicted_seconds"]
        t10 = m.predict(DEMO_SNAPSHOT, "10k")["predicted_seconds"]
        t42 = m.predict(DEMO_SNAPSHOT, "marathon")["predicted_seconds"]
        assert t5 < t10 < t42

    def test_prediction_is_plausible(self):
        m = RacePredictor()
        m.fit_bootstrap(n=500)
        t10 = m.predict(DEMO_SNAPSHOT, "10k")["predicted_seconds"]
        assert 1800 < t10 < 4200  # 30–70 min for a 4:15/km athlete


class TestInjuryRisk:
    def test_high_load_raises_risk(self):
        m = InjuryRiskModel()
        low = m.predict(_snap(atl=70, ctl=80, ramp_rate_pct=2, days_since_rest=2))
        high = m.predict(_snap(atl=140, ctl=80, ramp_rate_pct=30, days_since_rest=12))
        assert high["injury_risk_pct"] > low["injury_risk_pct"]

    def test_factors_are_explained(self):
        result = InjuryRiskModel().predict(DEMO_SNAPSHOT)
        assert all("description" in f for f in result["factors"])


class TestPerformanceScore:
    def test_score_in_range(self):
        score = PerformanceScoreModel().predict(DEMO_SNAPSHOT)["score"]
        assert 0 <= score <= 100

    def test_better_sleep_improves_score(self):
        m = PerformanceScoreModel()
        assert m.predict(_snap(sleep_hours_7d=8.5))["score"] >= m.predict(_snap(sleep_hours_7d=5.0))["score"]


def test_training_loads():
    tss = np.full(60, 80.0)
    ctl, atl, tsb = compute_training_loads(tss)
    assert atl > ctl * 0.9  # steady load converges
    assert abs(tsb) < 20
