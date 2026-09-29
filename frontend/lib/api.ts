const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl() {
    if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    return API_URL;
}

export interface Deployment {
    id: string;
    service: string;
    version: string;
    environment: string;
    developer: string;
    code_changes: string[];
    config_changes: Record<string, string>;
    infra_changes: string[];
    status: string;
    risk_score: number | null;
    created_at: string;
}

export interface CreateDeploymentPayload {
    service: string;
    version: string;
    environment: string;
    developer: string;
    code_changes: string[];
    config_changes: Record<string, string>;
    infra_changes: string[];
}

/*
 * Phase 3 Risk Analysis result.
 *
 * This follows the shared RiskResult contract:
 * score
 * level
 * reasons
 * memory_ids
 * confidence
 */
export interface RiskResult {
    score: number;
    level: "low" | "medium" | "high";
    reasons: string[];
    memory_ids: string[];
    confidence: number;
}

export async function getDashboard() {
    const response = await fetch(
        `${getApiUrl()}/api/dashboard`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch dashboard");
    }

    return response.json();
}

export async function createDeployment(
    payload: CreateDeploymentPayload
): Promise<Deployment> {
    const response = await fetch(
        `${getApiUrl()}/api/deployments`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        let message = "Unable to create deployment.";

        try {
            const error = await response.json();

            if (typeof error?.detail === "string") {
                message = error.detail;
            }
        } catch {
            // Keep the default user-friendly message.
        }

        throw new Error(message);
    }

    return response.json();
}

export async function getDeployment(
    deploymentId: string
): Promise<Deployment> {
    const response = await fetch(
        `${getApiUrl()}/api/deployments/${deploymentId}`
    );

    if (!response.ok) {
        let message = "Unable to load deployment.";

        try {
            const error = await response.json();

            if (typeof error?.detail === "string") {
                message = error.detail;
            }
        } catch {
            // Keep the default user-friendly message.
        }

        throw new Error(message);
    }

    return response.json();
}

/*
 * Phase 3:
 * Run deterministic risk analysis for a deployment.
 *
 * POST /api/analyze/{deployment_id}
 */
export async function analyzeDeployment(
    deploymentId: string
): Promise<RiskResult> {
    const response = await fetch(
        `${getApiUrl()}/api/analyze/${deploymentId}`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        let message = "Unable to analyze this deployment.";

        try {
            const error = await response.json();

            if (typeof error?.detail === "string") {
                message = error.detail;
            }
        } catch {
            // Keep the default user-friendly message.
        }

        throw new Error(message);
    }

    return response.json();
}

export interface Memory {
    id: string;
    service: string;
    days_ago: number;
    change: string;
    outcome: string;
    root_cause: string;
    resolution: string;
    tags: string[];
}

export async function getMemories(): Promise<Memory[]> {
    const response = await fetch(
        `${getApiUrl()}/api/memories`
    );

    if (!response.ok) {
        throw new Error(
            "Historical memory unavailable"
        );
    }

    return response.json();
}