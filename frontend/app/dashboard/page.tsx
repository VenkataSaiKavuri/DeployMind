"use client";

import { useCallback, useEffect, useState } from "react";

import KpiCard from "@/components/dashboard/KpiCard";
import RecentDeployments from "@/components/dashboard/RecentDeployments";
import { getDashboard } from "@/lib/api";
import type { DashboardResponse } from "@/types/types";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const data = await getDashboard();

      setDashboard(data);
    } catch (err) {
      console.error("Dashboard loading failed:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-800" />
            <div className="mt-3 h-4 w-64 animate-pulse rounded bg-slate-800" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-xl border border-slate-800 bg-slate-900"
              />
            ))}
          </div>

          <div className="mt-8">
            <div className="h-6 w-52 animate-pulse rounded bg-slate-800" />
            <div className="mt-4 h-64 animate-pulse rounded-xl border border-slate-800 bg-slate-900" />
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Loading DeployMind...
          </p>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            !
          </div>

          <h1 className="mt-4 text-xl font-semibold">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            The DeployMind backend could not be reached.
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-slate-800 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold">
                D
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  DeployMind
                </h1>

                <p className="text-sm text-slate-400">
                  AI Deployment Intelligence
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
              <span className="text-emerald-400">●</span>
              <span className="text-sm font-medium text-emerald-400">
                Operational
              </span>
            </div>

            <a
              href="/deployments/new"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              + New Deployment
            </a>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Deployments"
              value={dashboard.kpis.deployments}
              description="Total analyzed"
            />

            <KpiCard
              title="Risk Avoided"
              value={dashboard.kpis.risk_avoided}
              description="Potential incidents prevented"
            />

            <KpiCard
              title="Memories"
              value={dashboard.kpis.memories}
              description="Operational experiences"
            />

            <KpiCard
              title="Learning"
              value={`↑ ${dashboard.kpis.learning_change}%`}
              description="Improvement over time"
            />
          </div>
        </section>

        {/* Recent Deployments */}
        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Recent Deployments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest deployment activity across your environments.
            </p>
          </div>

          <RecentDeployments
            deployments={dashboard.recent_deployments}
          />
        </section>
      </div>
    </main>
  );
}