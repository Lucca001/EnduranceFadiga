"""SQLAlchemy mirror of prisma/schema.prisma (async).

Prisma owns migrations; these models are read/write access for the
Python service and workers. Keep the two in sync.
"""

from datetime import date, datetime

from sqlalchemy import JSON, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Athlete(Base):
    __tablename__ = "Athlete"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    clerkId: Mapped[str] = mapped_column(String, unique=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    locale: Mapped[str] = mapped_column(String, default="en")
    weightKg: Mapped[float | None] = mapped_column(Float)
    ftpWatts: Mapped[int | None] = mapped_column(Integer)
    maxHr: Mapped[int | None] = mapped_column(Integer)
    restingHr: Mapped[int | None] = mapped_column(Integer)
    thresholdPaceSecPerKm: Mapped[int | None] = mapped_column(Integer)

    activities: Mapped[list["Activity"]] = relationship(back_populates="athlete")
    dailyMetrics: Mapped[list["DailyMetric"]] = relationship(back_populates="athlete")


class Activity(Base):
    __tablename__ = "Activity"
    __table_args__ = (UniqueConstraint("provider", "externalId"),)

    id: Mapped[str] = mapped_column(String, primary_key=True)
    athleteId: Mapped[str] = mapped_column(ForeignKey("Athlete.id", ondelete="CASCADE"))
    provider: Mapped[str] = mapped_column(String)
    externalId: Mapped[str] = mapped_column(String)
    sport: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    startedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    durationSec: Mapped[int] = mapped_column(Integer)
    distanceM: Mapped[float | None] = mapped_column(Float)
    elevationGainM: Mapped[float | None] = mapped_column(Float)
    avgHr: Mapped[int | None] = mapped_column(Integer)
    avgPowerW: Mapped[int | None] = mapped_column(Integer)
    avgPaceSecPerKm: Mapped[int | None] = mapped_column(Integer)
    trainingLoad: Mapped[float | None] = mapped_column(Float)
    streams: Mapped[dict | None] = mapped_column(JSON)

    athlete: Mapped[Athlete] = relationship(back_populates="activities")


class DailyMetric(Base):
    __tablename__ = "DailyMetric"
    __table_args__ = (UniqueConstraint("athleteId", "date"),)

    id: Mapped[str] = mapped_column(String, primary_key=True)
    athleteId: Mapped[str] = mapped_column(ForeignKey("Athlete.id", ondelete="CASCADE"))
    date: Mapped[date] = mapped_column(Date)
    hrvRmssd: Mapped[float | None] = mapped_column(Float)
    restingHr: Mapped[int | None] = mapped_column(Integer)
    sleepHours: Mapped[float | None] = mapped_column(Float)
    vo2max: Mapped[float | None] = mapped_column(Float)
    ctl: Mapped[float | None] = mapped_column(Float)
    atl: Mapped[float | None] = mapped_column(Float)
    tsb: Mapped[float | None] = mapped_column(Float)
    readiness: Mapped[int | None] = mapped_column(Integer)
    performanceScore: Mapped[int | None] = mapped_column(Integer)

    athlete: Mapped[Athlete] = relationship(back_populates="dailyMetrics")


class Insight(Base):
    __tablename__ = "Insight"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    athleteId: Mapped[str] = mapped_column(ForeignKey("Athlete.id", ondelete="CASCADE"))
    severity: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    body: Mapped[str] = mapped_column(Text)
    factors: Mapped[dict | None] = mapped_column(JSON)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
