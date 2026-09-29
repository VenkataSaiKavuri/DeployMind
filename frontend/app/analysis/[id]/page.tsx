"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  analyzeDeployment,
  getDeployment,
  getMemories,
  type Deployment,
  type Memory,
  type RiskResult,
} from "@/lib/api";

import MemoryEvidenceCard from "@/components/analysis/MemoryEvidenceCard";

const ANALYSIS_STAGES = [
  "Analyzing code changes",
  "Checking configuration",
  "Searching deployment history",
  "Recalling incidents",
  "Comparing historical outcomes",
  "Calculating deployment risk",
];

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();

  const deploymentId = String(params.id);

  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [result, setResult] = useState<RiskResult | null>(null);

  const [loadingDeployment, setLoadingDeployment] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [stageIndex, setStageIndex] = useState(-1);

  const [error, setError] = useState("");
  const [showWhy, setShowWhy] = useState(false);

  const [memories, setMemories] = useState<Memory[]>([]);

  /*
   * Load deployment + historical memories
   */
  const loadDeployment = useCallback(async () => {
    try {
      setLoadingDeployment(true);
      setError("");

      const [deploymentData, memoriesData] = await Promise.all([
        getDeployment(deploymentId),
        getMemories(),
      ]);

      setDeployment(deploymentData);
      setMemories(memoriesData);

      /*
       * We intentionally do not automatically analyze here.
       * The user explicitly starts analysis using the button.
       */
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The requested deployment could not be found."
      );
    } finally {
      setLoadingDeployment(false);
    }
  }, [deploymentId]);

  useEffect(() => {
    loadDeployment();
  }, [loadDeployment]);

  /*
   * Analysis animation
   */
  useEffect(() => {
    if (!analyzing) {
      return;
    }

    setStageIndex(0);

    const interval = window.setInterval(() => {
      setStageIndex((current) => {
        if (current >= ANALYSIS_STAGES.length - 1) {
          window.clearInterval(interval);
          return current;
        }

        return current + 1;
      });
    }, 450);

    return () => {
      window.clearInterval(interval);
    };
  }, [analyzing]);

  /*
   * Run analysis
   */
  async function handleAnalyze() {
    if (analyzing) {
      return;
    }

    try {
      setError("");
      setShowWhy(false);
      setAnalyzing(true);
      setStageIndex(0);

      const analysisResult = await analyzeDeployment(deploymentId);

      setResult(analysisResult);

      /*
       * Refresh deployment so stored risk_score is updated.
       */
      const updatedDeployment = await getDeployment(deploymentId);
      setDeployment(updatedDeployment);

      /*
       * Refresh memories in case the backend memory source changed.
       */
      try {
        const memoriesData = await getMemories();
        setMemories(memoriesData);
      } catch {
        /*
         * Analysis itself succeeded.
         * Memory retrieval failure should not crash the page.
         */
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze this deployment."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  const displayedResult = result;

  const riskLevel = displayedResult?.level?.toUpperCase() ?? "";

  /*
   * Risk progress width
   */
  const riskWidth = useMemo(() => {
    if (!displayedResult) {
      return 0;
    }

    return Math.max(0, Math.min(100, displayedResult.score));
  }, [displayedResult]);

  /*
   * Confidence display
   */
  const confidencePercent = displayedResult
    ? Math.round(displayedResult.confidence * 100)
    : null;

  /*
   * Only display memories returned by the risk engine.
   *
   * This keeps the UI tied to the actual memory_ids
   * returned by the backend.
   */
  const relevantMemories = useMemo(() => {
    if (!displayedResult) {
      return [];
    }

    const ids = new Set(displayedResult.memory_ids);

    return memories.filter((memory) => ids.has(memory.id));
  }, [displayedResult, memories]);

  /*
   * Loading state
   */
  if (loadingDeployment) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
            <p className="text-sm text-zinc-400">
              Loading deployment...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Deployment not found
   */
  if (error && !deployment) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-900/50 bg-zinc-950 p-8">
            <p className="text-sm text-red-400">
              Deployment not found
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              The requested deployment could not be found.
            </h1>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-6 rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:border-zinc-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!deployment) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                DeployMind
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                AI Deployment Analysis
              </h1>

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-zinc-300">
                  {deployment.service}
                </span>

                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-zinc-300">
                  {deployment.version}
                </span>

                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-zinc-300">
                  {deployment.environment}
                </span>

                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-zinc-300">
                  {deployment.developer}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing
                ? "Analyzing Deployment..."
                : displayedResult
                  ? "Re-analyze"
                  : "Analyze Deployment"}
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* DEPLOYMENT SUMMARY */}
        {/* ========================================================= */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Deployment Summary
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Deployment ID: {deployment.id}
              </p>
            </div>

            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
              {deployment.status}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryItem
              label="Service"
              value={deployment.service}
            />

            <SummaryItem
              label="Version"
              value={deployment.version}
            />

            <SummaryItem
              label="Environment"
              value={deployment.environment}
            />

            <SummaryItem
              label="Developer"
              value={deployment.developer}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <SummaryItem
              label="Code Changes"
              value={String(deployment.code_changes.length)}
            />

            <SummaryItem
              label="Configuration Changes"
              value={String(
                Object.keys(deployment.config_changes).length
              )}
            />

            <SummaryItem
              label="Infrastructure Changes"
              value={String(deployment.infra_changes.length)}
            />
          </div>
        </section>

        {/* ========================================================= */}
        {/* ANALYSIS ANIMATION */}
        {/* ========================================================= */}

        {analyzing && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-lg font-semibold">
              Analyzing deployment...
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Evaluating deployment changes and historical evidence.
            </p>

            <div className="mt-6 space-y-3">
              {ANALYSIS_STAGES.map((stage, index) => {
                const completed = index < stageIndex;
                const active = index === stageIndex;

                return (
                  <div
                    key={stage}
                    className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
                  >
                    <div
                      className={[
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                        completed
                          ? "bg-white text-black"
                          : active
                            ? "border border-zinc-500 text-white"
                            : "border border-zinc-800 text-zinc-600",
                      ].join(" ")}
                    >
                      {completed ? "✓" : index + 1}
                    </div>

                    <span
                      className={
                        completed || active
                          ? "text-sm text-white"
                          : "text-sm text-zinc-600"
                      }
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* ANALYSIS RESULT */}
        {/* ========================================================= */}

        {displayedResult && !analyzing && (
          <>
            {/* ===================================================== */}
            {/* RISK RESULT */}
            {/* ===================================================== */}

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-zinc-500">
                    Risk Score
                  </p>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-5xl font-bold">
                      {displayedResult.score}
                    </span>

                    <span className="text-zinc-500">
                      / 100
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="text-lg font-bold">
                      {riskLevel} RISK
                    </span>
                  </div>
                </div>

                <div className="w-full max-w-xl">
                  <div className="mb-2 flex justify-between text-xs text-zinc-500">
                    <span>0</span>
                    <span>100</span>
                  </div>

                  <div
                    className="h-4 overflow-hidden rounded-full bg-zinc-800"
                    aria-label={`Risk score ${displayedResult.score} out of 100`}
                  >
                    <div
                      className="h-full rounded-full bg-white transition-all duration-700"
                      style={{
                        width: `${riskWidth}%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex justify-end">
                    <span className="text-sm text-zinc-400">
                      Confidence: {confidencePercent}%
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================================== */}
            {/* REASONS */}
            {/* ===================================================== */}

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Why is this deployment risky?
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Deterministic signals identified during analysis.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWhy(true)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:border-zinc-500"
                >
                  Why did you flag this?
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {displayedResult.reasons.map((reason, index) => (
                  <div
                    key={`${reason}-${index}`}
                    className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-xs font-semibold">
                      {index + 1}
                    </div>

                    <p className="text-sm leading-6 text-zinc-300">
                      {reason}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ===================================================== */}
            {/* HISTORICAL MEMORY */}
            {/* ===================================================== */}

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">
                  Historical Memory Retrieved
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  {memories.length} memories retrieved
                  {relevantMemories.length > 0
                    ? ` · ${relevantMemories.length} highly relevant`
                    : ""}
                </p>

                <p className="mt-2 text-xs text-zinc-600">
                  Prototype memory source
                </p>
              </div>

              {relevantMemories.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {relevantMemories.map((memory) => (
                    <MemoryEvidenceCard
                      key={memory.id}
                      memory={memory}
                    />
                  ))}
                </div>
              ) : displayedResult.memory_ids.length > 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                  <p className="text-sm text-zinc-400">
                    The analysis returned relevant memory IDs,
                    but their detailed records are currently
                    unavailable.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {displayedResult.memory_ids.map((memoryId) => (
                      <span
                        key={memoryId}
                        className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
                      >
                        {memoryId}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                  <p className="text-sm text-zinc-500">
                    No highly relevant historical memories were
                    found for this deployment.
                  </p>
                </div>
              )}
            </section>
          </>
        )}

        {/* ========================================================= */}
        {/* INITIAL STATE */}
        {/* ========================================================= */}

        {!displayedResult && !analyzing && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <div className="mx-auto max-w-xl">
              <p className="text-sm text-zinc-500">
                Ready for analysis
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Analyze this deployment
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Run the deterministic DeployMind risk analysis
                to evaluate configuration, code, infrastructure,
                and historical signals.
              </p>

              <button
                type="button"
                onClick={handleAnalyze}
                className="mt-6 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Analyze Deployment
              </button>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* WHY PANEL */}
        {/* ========================================================= */}

        {showWhy && displayedResult && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="why-analysis-title"
          >
            <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-600">
                    DeployMind
                  </p>

                  <h2
                    id="why-analysis-title"
                    className="mt-2 text-2xl font-bold"
                  >
                    Why this deployment was flagged
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWhy(false)}
                  className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:text-white"
                  aria-label="Close reasoning panel"
                >
                  Close
                </button>
              </div>

              {/* Risk */}
              <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">
                      Risk score
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {displayedResult.score}/100
                    </p>
                  </div>

                  <p className="text-lg font-bold">
                    {riskLevel}
                  </p>
                </div>
              </div>

              {/* Signals */}
              <div className="mt-5 space-y-4">
                {displayedResult.reasons.map((reason, index) => (
                  <div
                    key={`why-${reason}-${index}`}
                    className="rounded-xl border border-zinc-800 p-5"
                  >
                    <p className="text-xs uppercase tracking-wide text-zinc-600">
                      Signal {index + 1}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      {reason}
                    </p>
                  </div>
                ))}
              </div>

              {/* Configuration */}
              <div className="mt-5 rounded-xl border border-zinc-800 p-5">
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Current deployment configuration
                </p>

                <div className="mt-4 space-y-3">
                  {Object.entries(deployment.config_changes).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-4 rounded-lg bg-zinc-900 px-4 py-3"
                      >
                        <span className="text-sm text-zinc-400">
                          {key}
                        </span>

                        <span className="font-mono text-sm text-white">
                          {value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Infrastructure */}
              <div className="mt-5 rounded-xl border border-zinc-800 p-5">
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Infrastructure changes
                </p>

                {deployment.infra_changes.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {deployment.infra_changes.map((change) => (
                      <p
                        key={change}
                        className="rounded-lg bg-zinc-900 px-4 py-3 text-sm text-zinc-300"
                      >
                        {change}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-zinc-500">
                    No infrastructure changes.
                  </p>
                )}
              </div>

              {/* Historical evidence */}
              <div className="mt-5 rounded-xl border border-zinc-800 p-5">
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Historical evidence
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  {relevantMemories.length} relevant historical
                  memory records were retrieved.
                </p>

                {relevantMemories.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {relevantMemories.map((memory) => (
                      <div
                        key={memory.id}
                        className="rounded-lg bg-zinc-900 px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-semibold text-white">
                            {memory.id}
                          </span>

                          <span className="text-xs text-zinc-500">
                            {memory.days_ago} days ago
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-zinc-400">
                          {memory.change}
                        </p>

                        <p className="mt-2 text-xs text-zinc-500">
                          Outcome: {memory.outcome}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : displayedResult.memory_ids.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {displayedResult.memory_ids.map((memoryId) => (
                      <span
                        key={memoryId}
                        className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
                      >
                        {memoryId}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-zinc-500">
                    No relevant historical memories were returned.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FOOTER NAVIGATION */}
        {/* ========================================================= */}

        <div className="flex justify-start pb-8">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-white"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}

/*
 * Summary item
 */
function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-600">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-medium text-zinc-200">
        {value}
      </p>
    </div>
  );
}