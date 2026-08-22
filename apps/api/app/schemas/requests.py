from pydantic import BaseModel, Field


class CoachQuestion(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    locale: str = "en"


class ScenarioRequest(BaseModel):
    weight_delta_kg: float = Field(0, ge=-15, le=15)
    sleep_hours: float | None = Field(None, ge=3, le=12)
    volume_delta_pct: float = Field(0, ge=-50, le=50)
    intensity_delta_pct: float = Field(0, ge=-50, le=50)

    def as_changes(self) -> dict:
        changes: dict = {}
        if self.weight_delta_kg:
            changes["weight_delta_kg"] = self.weight_delta_kg
        if self.sleep_hours is not None:
            changes["sleep_hours"] = self.sleep_hours
        if self.volume_delta_pct:
            changes["volume_delta_pct"] = self.volume_delta_pct
        if self.intensity_delta_pct:
            changes["intensity_delta_pct"] = self.intensity_delta_pct
        return changes
