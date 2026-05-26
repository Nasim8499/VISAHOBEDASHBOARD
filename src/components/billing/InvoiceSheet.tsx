import { motion } from "framer-motion";
import { Printer, Download, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export interface InvoiceData {
  id: string;
  client: string;
  logo: string;
  color: string;
  amount: string;
  due: string;
  status: string;
  email?: string;
  address?: string;
}

const lineItems = (amount: string) => {
  const total = Number(amount.replace(/[^0-9.]/g, "")) || 0;
  return [
    { label: "Brand Identity Design", qty: 1, rate: total * 0.35 },
    { label: "Website Development", qty: 1, rate: total * 0.4 },
    { label: "Social Media Kit (12 posts)", qty: 12, rate: (total * 0.15) / 12 },
    { label: "Strategy & Consultation", qty: 4, rate: (total * 0.1) / 4 },
  ];
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function InvoiceSheet({
  invoice,
  onClose,
}: {
  invoice: InvoiceData;
  onClose: () => void;
}) {
  const items = lineItems(invoice.amount);
  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const tax = subtotal * 0.09;
  const total = subtotal + tax;

  const handlePrint = () => window.print();
  const handleDownload = () => {
    toast.success("Invoice downloaded", { description: `${invoice.id}.pdf saved to your device.` });
    setTimeout(handlePrint, 200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="min-h-full px-3 py-6 sm:px-6 sm:py-10">
        {/* Toolbar */}
        <div className="no-print mx-auto mb-4 flex max-w-[210mm] items-center justify-between gap-2 rounded-2xl border border-border bg-card/90 p-2 shadow-elegant backdrop-blur">
          <div className="px-2 text-sm font-semibold">Invoice preview · {invoice.id}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handlePrint(); }}
              className="tap inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
            >
              <Printer className="size-3.5" /> Print
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDownload(); }}
              className="tap inline-flex items-center gap-1.5 rounded-xl bg-gradient-blue px-3 py-2 text-xs font-semibold text-white shadow-elegant hover:shadow-glow"
            >
              <Download className="size-3.5" /> Download PDF
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="tap grid size-9 place-items-center rounded-xl border border-border hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* A4 sheet */}
        <div className="a4-print">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="a4-sheet relative overflow-hidden rounded-xl"
          >
            {/* Cinematic header band */}
            <div
              className="relative px-10 pb-8 pt-10 text-white"
              style={{
                background: `linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, ${invoice.color} 140%)`,
              }}
            >
              <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-10 size-56 rounded-full bg-white/5 blur-3xl" />
              <div className="relative flex items-start justify-between gap-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">VisaHOBe · Studio</div>
                  <div className="mt-2 font-display text-4xl font-bold tracking-tight">Invoice</div>
                  <div className="mt-1 text-sm text-white/80">{invoice.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">Amount Due</div>
                  <div className="mt-1 font-display text-4xl font-bold">{money(total)}</div>
                  <div className="mt-1 text-xs text-white/75">Due {invoice.due}</div>
                </div>
              </div>

              <div className="relative mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">From</div>
                  <div className="mt-1 text-sm font-semibold">VisaHOBe PTE. LTD.</div>
                  <div className="text-xs text-white/75">71 Robinson Rd, Singapore</div>
                  <div className="text-xs text-white/75">billing@visahobe.com</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">Billed To</div>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
                    <span className="grid size-7 place-items-center rounded-md bg-white/15 text-base">{invoice.logo}</span>
                    {invoice.client}
                  </div>
                  <div className="text-xs text-white/75">accounts@{invoice.client.toLowerCase().replace(/[^a-z]/g, "")}.com</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">Status</div>
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                    <CheckCircle2 className="size-3.5" /> {invoice.status}
                  </div>
                  <div className="mt-2 text-xs text-white/75">Issued {new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-10 py-8">
              {/* Items table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Rate</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.label} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-800">{it.label}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{it.qty}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{money(it.rate)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">{money(it.qty * it.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:justify-between">
                <div className="max-w-xs text-xs text-slate-500">
                  <div className="font-semibold text-slate-700">Payment Instructions</div>
                  <p className="mt-1 leading-relaxed">
                    Wire transfer to DBS Bank · A/C 011-22334-5 · SWIFT DBSSSGSG. Reference invoice number above.
                  </p>
                </div>
                <div className="w-full max-w-xs space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span><span>{money(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (9%)</span><span>{money(tax)}</span>
                  </div>
                  <div className="mt-2 flex justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                    <span className="font-semibold">Total Due</span>
                    <span className="font-display text-lg font-bold">{money(total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-10 flex flex-col gap-1 border-t border-slate-200 pt-5 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <div>Thank you for choosing VisaHOBe Studio.</div>
                <div>visahobe.com · +65 6123 4567</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
