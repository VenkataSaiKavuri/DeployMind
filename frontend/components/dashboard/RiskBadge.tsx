type RiskBadgeProps = {
  score: number;
};

export default function RiskBadge({ score }: RiskBadgeProps) {
  let label = "Low";
  let className =
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  if (score >= 40 && score <= 69) {
    label = "Medium";
    className =
      "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  if (score >= 70) {
    label = "High";
    className =
      "bg-red-500/10 text-red-400 border-red-500/20";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      <span className="mr-1.5">●</span>
      {label}
    </span>
  );
}