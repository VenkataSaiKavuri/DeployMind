"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Brain,
  Clock3,
  GraduationCap,
  Rocket,
  LayoutDashboard,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "New Deployment",
    href: "/deployments/new",
    icon: Rocket,
  },
  {
    name: "AI Analysis",
    href: "/analysis",
    icon: Brain,
  },
  {
    name: "History",
    href: "/history",
    icon: Clock3,
  },
  {
    name: "Memory",
    href: "/memory",
    icon: Activity,
  },
  {
    name: "Learning",
    href: "/learning",
    icon: GraduationCap,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-6 py-6">
        <h1 className="text-xl font-bold tracking-tight text-white">
          DeployMind
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Deployment Intelligence
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Phase 0 Foundation
        </div>
      </div>
    </aside>
  );
}