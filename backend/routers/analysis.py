import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from services.deployment_service import (
    get_deployment,
    load_deployments,
    save_deployments,
)
from services.risk_engine import analyze_deployment


router = APIRouter(
    prefix="/api",
    tags=["analysis"],
)


BASE_DIR = Path(__file__).resolve().parent.parent
MEMORIES_FILE = BASE_DIR / "data" / "memories.json"


def load_memories() -> list[dict]:
    if not MEMORIES_FILE.exists():
        return []

    with MEMORIES_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError("memories.json must contain a JSON array")

    return data


@router.post("/analyze/{deployment_id}")
def analyze_deployment_by_id(deployment_id: str):
    # 1. Find deployment
    deployment = get_deployment(deployment_id)

    if deployment is None:
        raise HTTPException(
            status_code=404,
            detail=f"Deployment {deployment_id} not found",
        )

    # 2. Load mock historical memories
    try:
        memories = load_memories()
    except (OSError, json.JSONDecodeError, ValueError):
        memories = []

    # 3. Run deterministic risk engine
    result = analyze_deployment(
        deployment,
        memories,
    )

    # 4. Update only risk_score
    deployments = load_deployments()

    for existing_deployment in deployments:
        if existing_deployment.get("id") == deployment_id:
            existing_deployment["risk_score"] = result["score"]
            break

    # 5. Persist updated deployment
    save_deployments(deployments)

    # 6. Return RiskResult
    return result

@router.get("/memories")
def get_memories():
    try:
        return load_memories()
    except (OSError, json.JSONDecodeError, ValueError):
        raise HTTPException(
            status_code=500,
            detail="Historical memory unavailable",
        )