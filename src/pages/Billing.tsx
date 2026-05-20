import { PageContainer, PageHeader } from "@/components/layout/Page";
import { businesses } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { Download, Plus, DollarSign, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { KpiCard, Sparkline, MiniBars } from "@/components/charts/MiniCharts";

const ease = [0.22, 1, 0.36, 1] as const;

const invoices = businesses.map((b, i) => ({
  id: `INV-${2030 + i}`,
  client: b.name,
  logo: b.logo,
  color: b.color,
  amount: b.budget,
  due: b.deadline,
  status: i % 3 === 0 ? "Pending" : i % 3 === 1 ? "Approved" : "Verified",
}));

const kpis = [
  { label: "Revenue (M)", value: "$184k", delta: "+18%", icon: DollarSign, tone: "bg-gradient-blue", trend: [82, 96, 110, 134, 158, 184], sub: "6 mo trend" },
  { label: "Outstanding", value: "$42k", delta: "-6%", icon: Clock, tone: "bg-accent", trend: [60, 55, 52, 48, 45, 42], sub: "decreasing" },
  { label: "Paid invoices", value: "126", delta: "+9", icon: CheckCircle2, tone: "bg-success", trend: [88, 96, 104, 112, 119, 126], bars: true, sub: "this quarter" },
  { label: "Overdue", value: "3", delta: "-2", icon: AlertTriangle, tone: "bg-gradient-red", trend: [7, 6, 5, 4, 3, 3], sub: "under control" },
];

export default function Billing() {
  return (
    <PageContainer>
      <PageHeader
        title="Billing & Invoice"
        subtitle="Generate invoices, track payments, manage packages."
        actions={
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant hover:shadow-glow">
            <Plus className="size-4" /> Generate Invoice
          </motion.button>
        }
      />

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
                <th className="px-4 py-3 text-left">Invoice</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Pattern</th>
                <th className="px-4 py-3 text-left">Due</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease, delay: 0.25 + i * 0.04 }}
                  className="border-t border-border transition hover:bg-muted/40"
                >
                  <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-lg text-sm" style={{ background: inv.color, color: "white" }}>{inv.logo}</span>
                      <span className="font-medium">{inv.client}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{inv.amount}</td>
                  <td className="w-32 px-4 py-3 text-primary">
                    <MiniBars data={[3, 5, 4, 7, 6, 8, 7, 9]} className="h-6 w-full" />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.due}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    <button className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold transition hover:bg-muted">
                      <Download className="size-3.5" /> PDF
                    </button>
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
