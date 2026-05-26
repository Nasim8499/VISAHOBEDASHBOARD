import { useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout/Page";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { motion } from "framer-motion";
import { DollarSign, Users, CheckCircle2, Timer, TrendingUp, Activity, Download, RefreshCw } from "lucide-react";
import { KpiCard } from "@/components/charts/MiniCharts";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;

const revenue = [
  { m: "Feb", v: 82, last: 70 },
  { m: "Mar", v: 96, last: 78 },
  { m: "Apr", v: 110, last: 88 },
  { m: "May", v: 134, last: 95 },
  { m: "Jun", v: 158, last: 104 },
  { m: "Jul", v: 184, last: 118 },
];

const categoryDist = [
  { name: "Restaurant", value: 22 },
  { name: "Travel", value: 18 },
  { name: "Beauty", value: 14 },
  { name: "Fitness", value: 16 },
  { name: "Real Estate", value: 12 },
  { name: "E-commerce", value: 18 },
];

const colors = ["#003B73", "#177BBB", "#E63946", "#F1573D", "#16A34A", "#F59E0B"];

const employeePerf = [
  { e: "Aarav", v: 24, eff: 88 },
  { e: "Sara", v: 32, eff: 94 },
  { e: "Lina", v: 18, eff: 76 },
  { e: "Marco", v: 27, eff: 82 },
  { e: "Hannah", v: 21, eff: 79 },
  { e: "Yuki", v: 29, eff: 91 },
];

const funnel = [
  { name: "Approval", value: 92, fill: "#177BBB" },
  { name: "Brand", value: 76, fill: "#003B73" },
  { name: "Build", value: 58, fill: "#F1573D" },
  { name: "Launch", value: 34, fill: "#E63946" },
];

const weekTraffic = [
  { d: "Mon", chat: 24, meet: 4 },
  { d: "Tue", chat: 32, meet: 6 },
  { d: "Wed", chat: 28, meet: 8 },
  { d: "Thu", chat: 41, meet: 5 },
  { d: "Fri", chat: 36, meet: 9 },
  { d: "Sat", chat: 18, meet: 2 },
  { d: "Sun", chat: 12, meet: 1 },
];

const kpis = [
  { label: "Revenue · Month", value: "$184k", delta: "+18%", icon: DollarSign, tone: "bg-gradient-blue", trend: [82, 96, 110, 134, 158, 184], sub: "MRR · 6mo" },
  { label: "Active Clients", value: "24", delta: "+3", icon: Users, tone: "bg-gradient-red", trend: [14, 17, 18, 20, 22, 24], sub: "this quarter" },
  { label: "Completed Projects", value: "146", delta: "+12", icon: CheckCircle2, tone: "bg-success", trend: [86, 102, 118, 128, 138, 146], sub: "all-time" },
  { label: "Avg. Completion", value: "38 d", delta: "-4 d", icon: Timer, tone: "bg-primary", trend: [54, 50, 47, 44, 41, 38], bars: true, sub: "faster every month" },
];

function ChartCard({ title, subtitle, icon: Icon, children, span = "" }: any) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, ease }}
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-elegant ${span}`}
    >
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gradient-blue opacity-[0.07] blur-2xl" />
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-blue text-white">
              <Icon className="size-4" />
            </span>
          )}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground/80">{subtitle}</p>}
          </div>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

export default function Reports() {
  const [range, setRange] = useState<"1M" | "3M" | "6M" | "1Y">("6M");
  const [refreshKey, setRefreshKey] = useState(0);

  const slicedRevenue = useMemo(() => {
    const n = range === "1M" ? 1 : range === "3M" ? 3 : range === "6M" ? 6 : revenue.length;
    return revenue.slice(-n);
  }, [range, refreshKey]);

  const exportCSV = () => {
    const rows = [["Month", "ThisYear", "LastYear"], ...slicedRevenue.map((r) => [r.m, r.v, r.last])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `visahobe-revenue-${range}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported", { description: `visahobe-revenue-${range}.csv` });
  };

  const refresh = () => {
    setRefreshKey((k) => k + 1);
    toast.message("Analytics refreshed", { description: "Latest data loaded." });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Operational insight across every workspace."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-sm">
              {(["1M", "3M", "6M", "1Y"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`tap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    range === r ? "bg-gradient-blue text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button onClick={refresh} className="tap inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold shadow-sm hover:bg-muted">
              <RefreshCw className="size-3.5" /> Refresh
            </button>
            <button onClick={exportCSV} className="tap inline-flex items-center gap-1.5 rounded-xl bg-gradient-blue px-3 py-2 text-xs font-semibold text-white shadow-elegant hover:shadow-glow">
              <Download className="size-3.5" /> Export CSV
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k, i) => <KpiCard key={k.label} {...k} index={i} />)}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard title="Revenue Trend" subtitle="This year vs last year" icon={TrendingUp} span="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={slicedRevenue} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#177BBB" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#177BBB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revLast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E63946" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#E63946" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" name="Last year" dataKey="last" stroke="#E63946" strokeWidth={2} fill="url(#revLast)" />
                <Area type="monotone" name="This year" dataKey="v" stroke="#003B73" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Pipeline Funnel" subtitle="Client journey progress" icon={Activity}>
          <div className="h-72">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="25%" outerRadius="100%" data={funnel} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={8} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            {funnel.map((f) => (
              <div key={f.name} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: f.fill }} />
                <span className="flex-1">{f.name}</span>
                <span className="font-semibold">{f.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Category Distribution" subtitle="Active client mix">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Pie data={categoryDist} dataKey="value" innerRadius={55} outerRadius={92} paddingAngle={3} stroke="hsl(var(--card))" strokeWidth={3}>
                  {categoryDist.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {categoryDist.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: colors[i] }} />
                <span className="flex-1">{c.name}</span>
                <span className="font-semibold">{c.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Employee Performance" subtitle="Tasks completed (this month)" span="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={employeePerf}>
                <defs>
                  <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#177BBB" />
                    <stop offset="100%" stopColor="#003B73" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="e" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="v" name="Tasks" radius={[8, 8, 0, 0]} fill="url(#bar1)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Weekly Activity" subtitle="Chat & meeting volume" span="lg:col-span-3">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={weekTraffic}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="chat" name="Chat messages" stroke="#177BBB" strokeWidth={2.5} dot={{ r: 4, fill: "#177BBB" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="meet" name="Meetings" stroke="#E63946" strokeWidth={2.5} dot={{ r: 4, fill: "#E63946" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </PageContainer>
  );
}
