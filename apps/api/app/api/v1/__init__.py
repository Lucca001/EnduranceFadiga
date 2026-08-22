from fastapi import APIRouter

from app.api.v1 import coach, dashboard, injury, insights, predictions, reports, simulator

api_router = APIRouter()
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
api_router.include_router(injury.router, prefix="/injury-risk", tags=["injury-risk"])
api_router.include_router(coach.router, prefix="/coach", tags=["coach"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(simulator.router, prefix="/simulator", tags=["simulator"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
