import { PageContainer, PageHeader } from "@/components/layout/Page";
import { activity } from "@/data/mock";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Search, Filter, Clock, Download, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;

const CATEGORIES = ["All", "Approvals", "Brand", "Failures", "Pending"] as const;
type Cat = (typeof CATEGORIES)[number];

function toneFor(action: string) {
  const a = action.toLowerCase();
  if (/approve|complete|paid|verified|success/.test(a)) return { dot: "bg-success", ring: "ring-success/30", text: "text-success", cat: "Approvals" as Cat };
  if (/reject|fail|overdue|delete|cancel/.test(a)) return { dot: "bg-destructive", ring: "ring-destructive/30", text: "text-destructive", cat: "Failures" as Cat };
  if (/upload|create|added|new|brand/.test(a)) return { dot: "bg-gradient-blue", ring: "ring-primary/30", text: "text-primary", cat: "Brand" as Cat };
  if (/pending|review|wait/.test(a)) return { dot: "bg-warning", ring: "ring-warning/30", text: "text-warning", cat: "Pending" as Cat };
  return { dot: "bg-gradient-blue", ring: "ring-primary/30", text: "text-primary", cat: "Brand" as Cat };
}

export default function ActivityLogs() {
  const all = useMemo(() => [...activity, ...activity, ...activity], []);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Cat>("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const items = useMemo(
    () =>
      all.filter((a) => {
        const matchQ = `${a.who} ${a.action} ${a.target}`.toLowerCase().includes(q.toLowerCase());
        const matchCat = cat === "All" || toneFor(a.action).cat === cat;
        return matchQ && matchCat;
      }),
    [all, q, cat],
  );

  const exportCsv = () => {
    const rows = [["Who", "Action", "Target", "Time"], ...items.map((a) => [a.who, a.action, a.target, a.time])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export ready", { description: `${items.length} events downloaded as CSV.` });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Activity Logs"
        subtitle="Every action across all workspaces, in one timeline."
        actions={
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={exportCsv}
            className="tap inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            <Download className="size-4" /> Export CSV
          </motion.button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Events today", v: "127", tone: "bg-gradient-blue" },
          { l: "This week", v: "842", tone: "bg-primary" },
          { l: "Approvals", v: "34", tone: "bg-success" },
          { l: "Failures", v: "3", tone: "bg-gradient-red" },
        ].map((k, i) => (
          <motion.button
            key={k.l}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease, delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            onClick={() => {
              const map: Record<string, Cat> = { "Events today": "All", "This week": "All", Approvals: "Approvals", Failures: "Failures" };
              setCat(map[k.l] ?? "All");
            }}
            className="lift relative overflow-hidden rounded-2xl border border-border bg-card p-4 text-left shadow-sm"
          >
            <div aria-hidden className={`pointer-events-none absolute -right-8 -top-8 size-20 rounded-full ${k.tone} opacity-10 blur-2xl`} />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="size-3.5" /> {k.l}
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight">{k.v}</div>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease, delay: 0.2 }}
        className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-2"
      >
        <div className="flex flex-1 items-center gap-2 px-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search actor, action or target…"
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} className="tap rounded-md p-1 text-muted-foreground hover:bg-muted">
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className="tap inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
          >
            <Filter className="size-3.5" /> {cat === "All" ? "Filter" : cat}
          </button>
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-popover shadow-elegant"
              >
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCat(c); setFilterOpen(false); }}
                    className={`block w-full px-3 py-2 text-left text-xs font-medium transition hover:bg-muted ${cat === c ? "bg-muted text-primary" : ""}`}
                  >
                    {c}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ol className="relative ml-3 space-y-4 border-l border-border pl-6">
        <AnimatePresence initial={false}>
          {items.map((a, i) => {
            const t = toneFor(a.action);
            return (
              <motion.li
                key={`${a.who}-${a.action}-${i}`}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease, delay: Math.min(i * 0.02, 0.4) }}
                className="relative"
              >
                <span className={`absolute -left-[34px] grid size-7 place-items-center rounded-full ${t.dot} text-[10px] font-bold text-white ring-4 ${t.ring}`}>
                  {a.who.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                <div className="group rounded-xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-elegant">
                  <div className="text-sm">
                    <span className="font-semibold">{a.who}</span>{" "}
                    <span className={t.text}>{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" /> {a.time}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {items.length === 0 && (
          <li className="rounded-xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No matching activity
          </li>
        )}
      </ol>
    </PageContainer>
  );
}
