type DeploymentStatus =
  | "success"
  | "failed"
  | "rollback"
  | "pending";

type StatusBadgeProps = {
  status: DeploymentStatus;
};

const statusConfig = {
  success: {
    label: "Success",
    className:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: "✓",
  },
  failed: {
    label: "Failed",
    className:
      "bg-red-500/10 text-red-400 border-red-500/20",
    icon: "×",
  },
  rollback: {
    label: "Rolled Back",
    className:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: "↶",
  },
  pending: {
    label: "Pending",
    className:
      "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: "○",
  },
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <span className="mr-1.5">{config.icon}</span>
      {config.label}
    </span>
  );
}