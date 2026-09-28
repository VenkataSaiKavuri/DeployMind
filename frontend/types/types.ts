export type Deployment = {
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
};

export type Memory = {
  id: string;
  service: string;
  days_ago: number;
  change: string;
  outcome: "success" | "failed" | "latency" | "rollback";
  root_cause: string;
  resolution: string;
  tags: string[];
};

export type Incident = {
  id: string;
  service: string;
  root_cause: string;
  resolution: string;
  severity: string;
  status: string;
};

export type RiskResult = {
  score: number;
  level: "low" | "medium" | "high";
  reasons: string[];
  memory_ids: string[];
  confidence: number;
};

export type Recommendation = {
  verdict: string;
  actions: string[];
  confidence: number;
};

export type DashboardResponse = {
  kpis: {
    deployments: number;
    risk_avoided: number;
    memories: number;
    learning_change: number;
  };

  recent_deployments: Deployment[];
};