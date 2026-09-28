from enum import Enum

from pydantic import BaseModel, Field


class MemoryOutcome(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    LATENCY = "latency"
    ROLLBACK = "rollback"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Deployment(BaseModel):
    id: str = Field(min_length=1)
    service: str = Field(min_length=1)
    version: str = Field(min_length=1)
    environment: str = Field(min_length=1)
    developer: str = Field(min_length=1)
    code_changes: list[str]
    config_changes: dict[str, str]
    infra_changes: list[str]
    status: str
    risk_score: float | None = Field(default=None, ge=0, le=100)
    created_at: str


class Memory(BaseModel):
    id: str
    service: str
    days_ago: int
    change: str
    outcome: MemoryOutcome
    root_cause: str
    resolution: str
    tags: list[str]


class Incident(BaseModel):
    id: str
    service: str
    root_cause: str
    resolution: str
    severity: str
    status: str


class RiskResult(BaseModel):
    score: float = Field(ge=0, le=100)
    level: RiskLevel
    reasons: list[str]
    memory_ids: list[str]
    confidence: float = Field(ge=0, le=1)


class Recommendation(BaseModel):
    verdict: str
    actions: list[str]
    confidence: float = Field(ge=0, le=1)