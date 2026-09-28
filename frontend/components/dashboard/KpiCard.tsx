type KpiCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
};

export default function KpiCard({
  title,
  value,
  description,
  icon,
}: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {description}
          </p>
        </div>

        {icon && (
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}