import { PageContainer, PageHeader } from "@/components/layout/Page";
import { activity } from "@/data/mock";
import { motion } from "framer-motion";
import { Activity, Search, Filter, Clock } from "lucide-react";
import { useMemo, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

function toneFor(action: string) {
  const a = action.toLowerCase();
  if (/approve|complete|paid|verified|success/.test(a)) return { dot: "bg-success", ring: "ring-success/30", text: "text-success" };
  if (/reject|fail|overdue|delete|cancel/.test(a)) return { dot: "bg-destructive", ring: "ring-destructive/30", text: "text-destructive" };
  if (/upload|create|added|new|brand/.test(a)) return { dot: "bg-gradient-blue", ring: "ring-primary/30", text: "text-primary" };
  if (/pending|review|wait/.test(a)) return { dot: "bg-warning", ring: "ring-warning/30", text: "text-warning" };
  return { dot: "bg-gradient-blue", ring: "ring-primary/30", text: "text-primary" };
}

export default function ActivityLogs() {
  const all = useMemo(() => [...activity, ...activity, ...activity], []);
  const [q, setQ] = useState("");
  const items = useMemo(
    () => all.filter((a) => `${a.who} ${a.action} ${a.target}`.toLowerCase().includes(q.toLowerCase())),
    [all, q]
  );

  return (
    <PageContainer>
      <PageHeader title="Activity Logs" subtitle="Every action across all workspaces, in one timeline." />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Events today", v: "127", tone: "bg-gradient-blue" },
          { l: "This week", v: "842", tone: "bg-primary" },
          { l: "Approvals", v: "34", tone: "bg-success" },
          { l: "Failures", v: "3", tone: "bg-gradient-red" },
        ].map((k, i) => (
          <motion.div
            key={k.l}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease, delay: i * 0.05 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div aria-hidden className={`pointer-events-none absolute -right-8 -top-8 size-20 rounded-full ${k.tone} opacity-10 blur-2xl`} />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="size-3.5" /> {k.l}
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight">{k.v}</div>
          </motion.div>
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
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
          <Filter className="size-3.5" /> Filter
        </button>
      </motion.div>

      <ol className="relative ml-3 space-y-4 border-l border-border pl-6">
        {items.map((a, i) => {
          const t = toneFor(a.action);
          return (
            <motion.li
              key={`${a.who}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease, delay: 0.25 + Math.min(i * 0.03, 0.6) }}
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
        {items.length === 0 && (
          <li className="rounded-xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No matching activity
          </li>
        )}
      </ol>
    </PageContainer>
  );
}
