import { PageContainer, PageHeader } from "@/components/layout/Page";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

const revenue = [
  { m: "Feb", v: 82 }, { m: "Mar", v: 96 }, { m: "Apr", v: 110 },
  { m: "May", v: 134 }, { m: "Jun", v: 158 }, { m: "Jul", v: 184 },
];
const categoryDist = [
  { name: "Restaurant", value: 22 }, { name: "Travel", value: 18 },
  { name: "Beauty", value: 14 }, { name: "Fitness", value: 16 },
  { name: "Real Estate", value: 12 }, { name: "E-commerce", value: 18 },
];
const colors = ["#003B73", "#177BBB", "#E63946", "#F1573D", "#16A34A", "#F59E0B"];

const kpis = [
  { label: "Revenue · Month", value: "$184k", delta: "+18%" },
  { label: "Active Clients", value: "24", delta: "+3" },
  { label: "Completed Projects", value: "146", delta: "+12" },
  { label: "Avg. Completion Time", value: "38 days", delta: "-4 d" },
];

export default function Reports() {
  return (
    <PageContainer>
      <PageHeader title="Reports & Analytics" subtitle="Operational insight across every workspace." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-2 text-2xl font-bold">{k.value}</div>
            <div className="mt-1 text-xs font-semibold text-success">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#177BBB" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#177BBB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke="#003B73" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Business Category Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip />
                <Pie data={categoryDist} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={2}>
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
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Employee Performance</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={[
                { e: "Aarav", v: 24 }, { e: "Sara", v: 32 }, { e: "Lina", v: 18 },
                { e: "Marco", v: 27 }, { e: "Hannah", v: 21 }, { e: "Yuki", v: 29 },
              ]}>
                <XAxis dataKey="e" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="v" radius={[8, 8, 0, 0]} fill="#003B73" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
