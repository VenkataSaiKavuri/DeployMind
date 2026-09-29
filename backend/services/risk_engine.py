import re
from typing import Any


IMPORTANT_CONFIG_KEYS = {
    "REDIS_TIMEOUT",
    "RETRY_COUNT",
    "DB_POOL_SIZE",
    "DATABASE_URL",
    "CACHE_TIMEOUT",
    "CONNECTION_TIMEOUT",
}


def parse_duration_ms(value: Any) -> float | None:
    """Convert simple duration values such as 2000ms, 2s, or 5s to milliseconds."""
    if value is None:
        return None

    text = str(value).strip().lower().replace(" ", "")

    match = re.fullmatch(r"(\d+(?:\.\d+)?)(ms|s)", text)
    if not match:
        return None

    number = float(match.group(1))
    unit = match.group(2)

    if unit == "s":
        return number * 1000

    return number


def parse_number(value: Any) -> float | None:
    """Convert a simple numeric value to a number."""
    if value is None:
        return None

    match = re.search(r"\d+(?:\.\d+)?", str(value))
    if not match:
        return None

    return float(match.group(0))


def detect_major_infrastructure_change(
    infra_changes: list[str],
) -> bool:
    """
    Detect simple major version changes such as:
    Redis 7.2 -> 7.4
    PostgreSQL 15 -> 16
    Node 20 -> 22
    """
    version_pattern = re.compile(
        r"\b([A-Za-z][A-Za-z0-9_-]*)\s+"
        r"(\d+(?:\.\d+)*)\s*->\s*(\d+(?:\.\d+)*)",
        re.IGNORECASE,
    )

    for change in infra_changes:
        if version_pattern.search(change):
            return True

    return False


def memory_relevance_score(
    deployment: dict[str, Any],
    memory: dict[str, Any],
) -> int:
    """Calculate deterministic relevance between a deployment and historical memory."""

    score = 0

    deployment_service = str(
        deployment.get("service", "")
    ).lower()

    memory_service = str(
        memory.get("service", "")
    ).lower()

    if deployment_service and deployment_service == memory_service:
        score += 5

    searchable_deployment = " ".join(
        [
            *deployment.get("code_changes", []),
            *deployment.get("infra_changes", []),
            *deployment.get("config_changes", {}).keys(),
            *deployment.get("config_changes", {}).values(),
        ]
    ).lower()

    tags = memory.get("tags", [])

    for tag in tags:
        if str(tag).lower() in searchable_deployment:
            score += 2

    memory_text = " ".join(
        [
            str(memory.get("change", "")),
            str(memory.get("root_cause", "")),
            str(memory.get("resolution", "")),
            " ".join(str(tag) for tag in tags),
        ]
    ).lower()

    keywords = {
        "redis",
        "timeout",
        "payment",
        "configuration",
        "retry",
    }

    for keyword in keywords:
        if keyword in searchable_deployment and keyword in memory_text:
            score += 1

    return score


def get_relevant_memories(
    deployment: dict[str, Any],
    memories: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Return memories sorted by deterministic relevance."""
    scored = []

    for memory in memories:
        score = memory_relevance_score(deployment, memory)

        if score > 0:
            scored.append((score, memory))

    scored.sort(
        key=lambda item: (
            item[0],
            str(item[1].get("id", "")),
        ),
        reverse=True,
    )

    return [memory for _, memory in scored]


def analyze_deployment(
    deployment: dict[str, Any],
    memories: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Deterministically analyze a deployment.

    Returns the shared RiskResult shape:
    score
    level
    reasons
    memory_ids
    confidence
    """

    score = 0
    reasons: list[str] = []

    config_changes = deployment.get("config_changes", {}) or {}
    code_changes = deployment.get("code_changes", []) or []
    infra_changes = deployment.get("infra_changes", []) or []

    # --------------------------------------------------
    # Rule 1 — Important configuration change
    # --------------------------------------------------

    changed_keys = {
        str(key).strip().upper()
        for key in config_changes.keys()
    }

    important_changed_keys = changed_keys.intersection(
        IMPORTANT_CONFIG_KEYS
    )

    if important_changed_keys:
        score += 15
        reasons.append(
            "Important configuration settings have changed."
        )

    # --------------------------------------------------
    # Rule 2 — Redis timeout
    # --------------------------------------------------

    redis_timeout = None

    for key, value in config_changes.items():
        if str(key).strip().upper() == "REDIS_TIMEOUT":
            redis_timeout = parse_duration_ms(value)
            break

    if redis_timeout is not None and redis_timeout < 3000:
        score += 25
        reasons.append(
            "Redis timeout is below the historically safe threshold."
        )

    # --------------------------------------------------
    # Rule 3 — Retry count
    # --------------------------------------------------

    retry_count = None

    for key, value in config_changes.items():
        if str(key).strip().upper() == "RETRY_COUNT":
            retry_count = parse_number(value)
            break

    if retry_count is not None and retry_count > 4:
        score += 15
        reasons.append(
            "Retry count is higher than the recommended operational range."
        )

    # --------------------------------------------------
    # Rule 4 — Major infrastructure change
    # --------------------------------------------------

    major_infrastructure_change = detect_major_infrastructure_change(
        infra_changes
    )

    if major_infrastructure_change:
        score += 10
        reasons.append(
            "A major infrastructure or dependency upgrade is included."
        )

    # --------------------------------------------------
    # Rule 5 — Historical similarity
    # --------------------------------------------------

    relevant_memories = get_relevant_memories(
        deployment,
        memories,
    )

    failed_memories = [
        memory
        for memory in relevant_memories
        if str(memory.get("outcome", "")).upper()
        in {"FAILED", "FAILURE"}
    ]

    if failed_memories:
        score += 13
        reasons.append(
            "Similar payment-service deployments have previously failed."
        )

    # --------------------------------------------------
    # Score limit
    # --------------------------------------------------

    score = min(score, 100)

    # --------------------------------------------------
    # Risk level
    # --------------------------------------------------

    if score <= 39:
        level = "low"
    elif score <= 69:
        level = "medium"
    else:
        level = "high"

    # --------------------------------------------------
    # Confidence
    # --------------------------------------------------

    confidence = 0.70

    if important_changed_keys:
        confidence += 0.06

    if major_infrastructure_change:
        confidence += 0.05

    if failed_memories:
        confidence += 0.10

    confidence = min(confidence, 0.99)

    # --------------------------------------------------
    # RiskResult
    # --------------------------------------------------

    return {
        "score": score,
        "level": level,
        "reasons": reasons,
        "memory_ids": [
            memory.get("id")
            for memory in relevant_memories
            if memory.get("id")
        ],
        "confidence": confidence,
    }