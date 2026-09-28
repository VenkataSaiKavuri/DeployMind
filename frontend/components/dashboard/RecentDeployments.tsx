import type { Deployment } from "@/types/types";

import RiskBadge from "./RiskBadge";
import StatusBadge from "./StatusBadge";

type RecentDeploymentsProps = {
  deployments: Deployment[];
};

function formatTime(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function RecentDeployments({
  deployments,
}: RecentDeploymentsProps) {
  if (deployments.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-8 text-center">
        <h3 className="text-lg font-semibold text-white">
          No deployments yet
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Create your first deployment to start building operational memory.
        </p>

        <a
          href="/deployments/new"
          className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          + New Deployment
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead className="border-b border-slate-800 bg-slate-950/50">
            <tr>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Service
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Version
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Environment
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Risk
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Time
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {deployments.map((deployment) => (
              <tr
                key={deployment.id}
                className="transition hover:bg-slate-800/40"
              >
                <td className="px-5 py-4">
                  <span className="font-medium text-white">
                    {deployment.service}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className="font-mono text-sm text-slate-300">
                    {deployment.version}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                    {deployment.environment}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {deployment.risk_score === null ? (
                      <span className="text-xs text-slate-500">N/A</span>
                    ) : (
                      <>
                        <RiskBadge score={deployment.risk_score} />

                        <span className="text-xs text-slate-500">
                          {deployment.risk_score}
                        </span>
                      </>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge
                    status={deployment.status as Parameters<typeof StatusBadge>[0]["status"]}
                  />
                </td>

                <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-400">
                  {formatTime(deployment.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}