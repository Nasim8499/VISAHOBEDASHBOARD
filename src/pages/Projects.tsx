import { PageContainer, PageHeader } from "@/components/layout/Page";
import { businesses } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkline, KpiCard } from "@/components/charts/MiniCharts";
import { FolderKanban, Clock3, CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const seedTrend = (seed: number) =>
  Array.from({ length: 8 }, (_, i) => Math.round(20 + Math.sin(i / 1.6 + seed) * 12 + i * 4 + (seed % 7)));

const kpis = [
  { label: "Active", value: String(businesses.length), delta: "+2", icon: FolderKanban, tone: "bg-gradient-blue", trend: [6, 7, 8, 8, 9, 10, 11, 12], sub: "this month" },
  { label: "In review", value: "5", delta: "+1", icon: Clock3, tone: "bg-accent", trend: [2, 3, 3, 4, 4, 5, 5, 5], sub: "waiting approval" },
  { label: "Completed", value: "146", delta: "+12", icon: CheckCircle2, tone: "bg-success", trend: [80, 96, 110, 122, 130, 138, 142, 146], bars: true, sub: "all-time" },
  { label: "Avg. velocity", value: "+18%", delta: "↑", icon: TrendingUp, tone: "bg-gradient-red", trend: [10, 12, 14, 13, 15, 16, 17, 18], sub: "vs last month" },
];

export default function Projects() {
  return (
    <PageContainer>
      <PageHeader title="Projects" subtitle="All active and recent projects across client workspaces." />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k, i) => <KpiCard key={k.label} {...k} index={i} />)}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.2 }}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Business</th>
                <th className="px-4 py-3 text-left">Stage</th>
                <th className="px-4 py-3 text-left">PM</th>
                <th className="px-4 py-3 text-left">Deadline</th>
                <th className="px-4 py-3 text-left">Activity</th>
                <th className="px-4 py-3 text-left">Progress</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {businesses.map((b, i) => (
                <motion.tr
                  key={b.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease, delay: 0.25 + i * 0.04 }}
                  className="border-t border-border transition hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="grid size-9 place-items-center rounded-lg text-white" style={{ background: b.color }}>{b.logo}</span>
                      <div>
                        <div className="font-semibold">{b.name}</div>
                        <div className="text-xs text-muted-foreground">{b.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{b.stage}</td>
                  <td className="px-4 py-3">{b.manager}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.deadline}</td>
                  <td className="w-32 px-4 py-3 text-primary">
                    <Sparkline data={seedTrend(i)} className="h-7 w-full" />
                  </td>
                  <td className="w-56 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={b.progress} className="flex-1" />
                      <span className="text-xs font-semibold">{b.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/workspace/${b.id}`}
                      className="group inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </PageContainer>
  );
}
