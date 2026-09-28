import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "deployments.json"


def load_deployments() -> list[dict[str, Any]]:
    """Load all deployments from the JSON storage file."""
    if not DATA_FILE.exists():
        return []

    with DATA_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError("deployments.json must contain a JSON array")

    return data


def save_deployments(deployments: list[dict[str, Any]]) -> None:
    """Save all deployments to the JSON storage file."""
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(deployments, file, indent=2, ensure_ascii=False)


def generate_deployment_id(deployments: list[dict[str, Any]]) -> str:
    """Generate the next human-readable DEP-NNN identifier."""
    max_number = 0

    for deployment in deployments:
        deployment_id = deployment.get("id", "")

        if isinstance(deployment_id, str) and deployment_id.startswith("DEP-"):
            try:
                number = int(deployment_id[4:])
                max_number = max(max_number, number)
            except ValueError:
                continue

    return f"DEP-{max_number + 1:03d}"


def create_deployment(
    service: str,
    version: str,
    environment: str,
    developer: str,
    code_changes: list[str],
    config_changes: dict[str, str],
    infra_changes: list[str],
) -> dict[str, Any]:
    """Create and persist a new deployment."""
    deployments = load_deployments()

    deployment = {
        "id": generate_deployment_id(deployments),
        "service": service,
        "version": version,
        "environment": environment,
        "developer": developer,
        "code_changes": code_changes,
        "config_changes": config_changes,
        "infra_changes": infra_changes,
        "status": "pending",
        "risk_score": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    deployments.append(deployment)
    save_deployments(deployments)

    return deployment


def get_deployment(deployment_id: str) -> dict[str, Any] | None:
    """Find a deployment by its ID."""
    deployments = load_deployments()

    for deployment in deployments:
        if deployment.get("id") == deployment_id:
            return deployment

    return None