import { PageContainer, PageHeader } from "@/components/layout/Page";
import { businesses } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { Download, Plus, DollarSign, Clock, CheckCircle2, AlertTriangle, Search, Eye, Send } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { KpiCard, MiniBars } from "@/components/charts/MiniCharts";
import { useMemo, useState } from "react";
import { InvoiceSheet, type InvoiceData } from "@/components/billing/InvoiceSheet";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;

const baseInvoices: InvoiceData[] = businesses.map((b, i) => ({
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

const FILTERS = ["All", "Pending", "Approved", "Verified"] as const;

export default function Billing() {
  const [invoices, setInvoices] = useState(baseInvoices);
  const [active, setActive] = useState<InvoiceData | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const filtered = useMemo(
    () =>
      invoices.filter(
        (i) =>
          (filter === "All" || i.status === filter) &&
          (i.client.toLowerCase().includes(query.toLowerCase()) || i.id.toLowerCase().includes(query.toLowerCase())),
      ),
    [invoices, query, filter],
  );

  const handleCreate = () => {
    const next: InvoiceData = {
      id: `INV-${2030 + invoices.length}`,
      client: "New Client",
      logo: "✨",
      color: "#6366f1",
      amount: "$5,000",
      due: new Date(Date.now() + 14 * 86400000).toLocaleDateString(),
      status: "Pending",
    };
    setInvoices([next, ...invoices]);
    toast.success("Invoice draft created", { description: next.id });
    setActive(next);
  };

  const handleSend = (inv: InvoiceData) => {
    toast.success("Invoice sent", { description: `${inv.id} → ${inv.client}` });
    setInvoices((p) => p.map((x) => (x.id === inv.id ? { ...x, status: "Approved" } : x)));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Billing & Invoice"
        subtitle="Generate invoices, track payments, manage packages."
        actions={
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            className="tap inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant hover:shadow-glow"
          >
            <Plus className="size-4" /> Generate Invoice
          </motion.button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k, i) => <KpiCard key={k.label} {...k} index={i} />)}
      </div>

      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-2 px-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by client or invoice ID…"
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`tap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === f ? "bg-gradient-blue text-white shadow-elegant" : "border border-border hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {filtered.map((inv, i) => (
          <motion.button
            key={inv.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease, delay: i * 0.03 }}
            onClick={() => setActive(inv)}
            className="lift flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm"
          >
            <span className="grid size-11 place-items-center rounded-xl text-lg" style={{ background: inv.color, color: "white" }}>
              {inv.logo}
            </span>
            <div className="flex-1">
              <div className="text-sm font-semibold">{inv.client}</div>
              <div className="font-mono text-[11px] text-muted-foreground">{inv.id} · {inv.due}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{inv.amount}</div>
              <StatusBadge status={inv.status} className="mt-1" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Desktop table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.1 }}
        className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block"
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
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, ease, delay: 0.15 + i * 0.03 }}
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
                    <div className="ml-auto flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setActive(inv)}
                        className="tap inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted"
                      >
                        <Eye className="size-3.5" /> View
                      </button>
                      <button
                        onClick={() => handleSend(inv)}
                        className="tap inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted"
                      >
                        <Send className="size-3.5" /> Send
                      </button>
                      <button
                        onClick={() => setActive(inv)}
                        className="tap inline-flex items-center gap-1.5 rounded-lg bg-gradient-blue px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        <Download className="size-3.5" /> PDF
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No invoices match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {active && <InvoiceSheet invoice={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </PageContainer>
  );
}
