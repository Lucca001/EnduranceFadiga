"""Central model registry.

Models are loaded once at startup. Artifacts are cached with joblib;
if no artifact exists the model bootstraps itself so a fresh clone is
immediately functional.
"""

from pathlib import Path

import joblib

from app.ml.models.injury_risk import InjuryRiskModel
from app.ml.models.performance_score import PerformanceScoreModel
from app.ml.models.race_predictor import RacePredictor

ARTIFACT_DIR = Path(__file__).parent / "artifacts"


class ModelRegistry:
    def __init__(self) -> None:
        self.race_predictor = RacePredictor()
        self.injury_risk = InjuryRiskModel()
        self.performance_score = PerformanceScoreModel()
        self._loaded = False

    def load_all(self) -> None:
        artifact = ARTIFACT_DIR / "race_predictor.joblib"
        if artifact.exists():
            self.race_predictor = joblib.load(artifact)
        else:
            self.race_predictor.fit_bootstrap()
            ARTIFACT_DIR.mkdir(exist_ok=True)
            joblib.dump(self.race_predictor, artifact)
        self._loaded = True

    def status(self) -> dict:
        return {
            "loaded": self._loaded,
            "race_predictor": self.race_predictor.version,
            "injury_risk": self.injury_risk.version,
            "performance_score": self.performance_score.version,
        }


model_registry = ModelRegistry()
