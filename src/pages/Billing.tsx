import { PageContainer, PageHeader } from "@/components/layout/Page";
import { businesses } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { Download, Plus } from "lucide-react";

const invoices = businesses.map((b, i) => ({
  id: `INV-${2030 + i}`,
  client: b.name,
  amount: b.budget,
  due: b.deadline,
  status: i % 3 === 0 ? "Pending" : i % 3 === 1 ? "Approved" : "Verified",
}));

export default function Billing() {
  return (
    <PageContainer>
      <PageHeader
        title="Billing & Invoice"
        subtitle="Generate invoices, track payments, manage packages."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white">
            <Plus className="size-4" /> Generate Invoice
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Revenue (M)", v: "$184k" },
          { l: "Outstanding", v: "$42k" },
          { l: "Paid invoices", v: "126" },
          { l: "Overdue", v: "3" },
        ].map((k) => (
          <div key={k.l} className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">{k.l}</div>
            <div className="mt-2 text-2xl font-bold">{k.v}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Invoice</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Due</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id} className="border-t border-border hover:bg-muted/40">
                <td className="px-4 py-3 font-mono text-xs">{i.id}</td>
                <td className="px-4 py-3 font-medium">{i.client}</td>
                <td className="px-4 py-3 font-semibold">{i.amount}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.due}</td>
                <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                <td className="px-4 py-3">
                  <button className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted">
                    <Download className="size-3.5" /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
