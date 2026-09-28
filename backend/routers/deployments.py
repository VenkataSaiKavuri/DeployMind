from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.deployment_service import (
    create_deployment,
    get_deployment,
)


router = APIRouter(
    prefix="/api/deployments",
    tags=["deployments"],
)


ALLOWED_ENVIRONMENTS = {
    "development",
    "staging",
    "production",
}


class DeploymentCreate(BaseModel):
    service: str = Field(min_length=1)
    version: str = Field(min_length=1)
    environment: str
    developer: str = Field(min_length=1)
    code_changes: list[str] = []
    config_changes: dict[str, str] = {}
    infra_changes: list[str] = []


@router.post("", status_code=201)
def create_new_deployment(payload: DeploymentCreate):
    service = payload.service.strip()
    version = payload.version.strip()
    developer = payload.developer.strip()

    if not service:
        raise HTTPException(
            status_code=400,
            detail="Service is required",
        )

    if not version:
        raise HTTPException(
            status_code=400,
            detail="Version is required",
        )

    if not developer:
        raise HTTPException(
            status_code=400,
            detail="Developer is required",
        )

    if payload.environment not in ALLOWED_ENVIRONMENTS:
        raise HTTPException(
            status_code=400,
            detail="Environment must be development, staging, or production",
        )

    code_changes = [
        change.strip()
        for change in payload.code_changes
        if change.strip()
    ]

    config_changes = {
        key.strip(): value.strip()
        for key, value in payload.config_changes.items()
        if key.strip() and value.strip()
    }

    infra_changes = [
        change.strip()
        for change in payload.infra_changes
        if change.strip()
    ]

    if (
        len(code_changes) == 0
        and len(config_changes) == 0
        and len(infra_changes) == 0
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Add at least one code, configuration, "
                "or infrastructure change."
            ),
        )

    return create_deployment(
        service=service,
        version=version,
        environment=payload.environment,
        developer=developer,
        code_changes=code_changes,
        config_changes=config_changes,
        infra_changes=infra_changes,
    )


@router.get("/{deployment_id}")
def get_deployment_by_id(deployment_id: str):
    deployment = get_deployment(deployment_id)

    if deployment is None:
        raise HTTPException(
            status_code=404,
            detail=f"Deployment {deployment_id} not found",
        )

    return deployment