import json
from pathlib import Path

from fastapi import APIRouter


router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"],
)


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def load_json(filename: str):
    file_path = DATA_DIR / filename

    with file_path.open("r", encoding="utf-8") as file:
        return json.load(file)


@router.get("")
def get_dashboard():
    deployments = load_json("deployments.json")
    memories = load_json("memories.json")
    incidents = load_json("incidents.json")

    # Phase 1 prototype/demo KPI values.
    # These are intentionally not calculated from the seed dataset.
    kpis = {
        "deployments": 127,
        "risk_avoided": 23,
        "memories": 486,
        "learning_change": 34,
    }

    # Keep the existing seed deployment records.
    # Limit the response to the recent records displayed by the dashboard.
    recent_deployments = deployments[-10:]

    return {
        "kpis": kpis,
        "recent_deployments": recent_deployments,
    }