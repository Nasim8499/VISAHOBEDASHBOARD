import { PageContainer, PageHeader } from "@/components/layout/Page";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  BBStage,
  daysUntil,
  isOverdue,
  listAllPendingApprovals,
  loadStages,
  pickTemplateForCategory,
  pushEvent,
  saveStages,
  templateToStages,
} from "@/lib/brandBuilder";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  Inbox,
  MessageSquare,
  Send,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

type Row = {
  wsId: string;
  wsName: string;
  wsLogo?: string;
  wsColor?: string;
  stage: BBStage;
};

export default function ClientApprovals() {
  const { all } = useWorkspace();
  const [tick, setTick] = useState(0); // re-read after action
  const [comments, setComments] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"pending" | "rejected" | "approved" | "all">("pending");

  const pending: Row[] = useMemo(() => listAllPendingApprovals(all), [all, tick]);

  // Approved roll-up — read from stored stages, filter approved
  const approved: Row[] = useMemo(() => {
    const out: Row[] = [];
    for (const ws of all) {
      const tpl = pickTemplateForCategory(ws.category);
      const stages = loadStages(ws.id, templateToStages(tpl));
      stages.filter((s) => s.state === "approved").forEach((s) => {
        out.push({ wsId: ws.id, wsName: ws.name, wsLogo: ws.logo, wsColor: ws.color, stage: s });
      });
    }
    return out;
  }, [all, tick]);

  const rows: Row[] =
    filter === "approved" ? approved :
    filter === "rejected" ? pending.filter((r) => r.stage.state === "rejected") :
    filter === "pending" ? pending.filter((r) => r.stage.state === "sent") :
    [...pending, ...approved];

  function mutateStage(wsId: string, stageKey: string, patch: Partial<BBStage>) {
    const ws = all.find((w) => w.id === wsId);
    if (!ws) return;
    const tpl = pickTemplateForCategory(ws.category);
    const stages = loadStages(wsId, templateToStages(tpl)).map((s) =>
      s.key === stageKey ? { ...s, ...patch } : s,
    );
    saveStages(wsId, stages);
    return stages.find((s) => s.key === stageKey);
  }

  function approve(row: Row) {
    const comment = comments[`${row.wsId}:${row.stage.key}`]?.trim();
    mutateStage(row.wsId, row.stage.key, {
      state: "approved",
      pct: 100,
      clientComment: comment || row.stage.clientComment,
    });
    pushEvent(row.wsId, {
      stageKey: row.stage.key,
      stageLabel: row.stage.label,
      type: "stage.approved",
      message: `Client approved “${row.stage.label}”`,
      comment,
    });
    toast.success(`Approved · ${row.stage.label}`, {
      description: `${row.wsName}${comment ? " · comment sent" : ""}`,
    });
    setComments((c) => ({ ...c, [`${row.wsId}:${row.stage.key}`]: "" }));
    setTick((t) => t + 1);
  }

  function reject(row: Row) {
    const comment = comments[`${row.wsId}:${row.stage.key}`]?.trim();
    if (!comment) {
      toast.error("Please add a comment", { description: "Tell the team why you’re requesting changes." });
      return;
    }
    mutateStage(row.wsId, row.stage.key, {
      state: "rejected",
      pct: Math.min(row.stage.pct, 75),
      clientComment: comment,
    });
    pushEvent(row.wsId, {
      stageKey: row.stage.key,
      stageLabel: row.stage.label,
      type: "stage.rejected",
      message: `Client requested changes on “${row.stage.label}”`,
      comment,
    });
    toast.message(`Changes requested · ${row.stage.label}`, { description: row.wsName });
    setComments((c) => ({ ...c, [`${row.wsId}:${row.stage.key}`]: "" }));
    setTick((t) => t + 1);
  }

  const stats = {
    pending: pending.filter((r) => r.stage.state === "sent").length,
    rejected: pending.filter((r) => r.stage.state === "rejected").length,
    approved: approved.length,
    overdue: pending.filter((r) => isOverdue(r.stage)).length,
  };

  return (
    <PageContainer>
      <PageHeader
        title="Client Approvals"
        subtitle="Review Brand Builder stages sent for sign-off. Approve or send change requests with comments back to the team."
        actions={
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-muted"
          >
            <ShieldCheck className="size-4" /> Workflow dashboard
          </Link>
        }
      />

      {/* KPI strip */}
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi label="Pending" value={stats.pending} tone="warning" icon={Inbox} />
        <Kpi label="Overdue" value={stats.overdue} tone="destructive" icon={AlertTriangle} />
        <Kpi label="Changes requested" value={stats.rejected} tone="primary" icon={ThumbsDown} />
        <Kpi label="Approved" value={stats.approved} tone="success" icon={ThumbsUp} />
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["pending", "rejected", "approved", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold capitalize transition ${
              filter === f
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {f === "pending" ? `Pending (${stats.pending})` :
             f === "rejected" ? `Changes (${stats.rejected})` :
             f === "approved" ? `Approved (${stats.approved})` : "All"}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border-2 border-dashed border-border bg-card p-12 text-center">
          <span className="mb-3 grid size-14 place-items-center rounded-2xl bg-gradient-blue text-white">
            <ShieldCheck className="size-6" />
          </span>
          <h3 className="font-display text-xl font-bold">Nothing waiting for review</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            When your team sends a Brand Builder stage to the client, it will appear here for one-tap approval.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const id = `${r.wsId}:${r.stage.key}`;
            const overdue = isOverdue(r.stage);
            const days = daysUntil(r.stage.due);
            const state = r.stage.state;
            const isApproved = state === "approved";
            const isRejected = state === "rejected";
            return (
              <li
                key={id}
                className={`overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-elegant ${
                  overdue ? "border-destructive/40" :
                  isApproved ? "border-success/30" :
                  isRejected ? "border-primary/30" : "border-border"
                }`}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
                  {/* Workspace badge */}
                  <div className="flex items-center gap-3 sm:w-56 sm:shrink-0">
                    <span
                      className="grid size-11 place-items-center rounded-2xl text-lg text-white ring-2 ring-white/40 shadow-elegant"
                      style={{ background: r.wsColor || "hsl(var(--primary))" }}
                    >
                      {r.wsLogo || "🏢"}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold">{r.wsName}</div>
                      <Link
                        to={`/workspace/${r.wsId}`}
                        className="text-[11px] font-semibold text-accent hover:underline"
                      >
                        Open workspace →
                      </Link>
                    </div>
                  </div>

                  {/* Stage core */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xl">{r.stage.icon}</span>
                      <h3 className="font-display text-lg font-extrabold">{r.stage.label}</h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isApproved ? "bg-success/15 text-success" :
                          isRejected ? "bg-primary/15 text-primary" :
                          overdue ? "bg-destructive/15 text-destructive" :
                          "bg-warning/15 text-warning"
                        }`}
                      >
                        {isApproved ? <><Check className="size-3" /> Approved</> :
                         isRejected ? <><ThumbsDown className="size-3" /> Changes requested</> :
                         overdue ? <><AlertTriangle className="size-3" /> Overdue · waiting</> :
                         <><Send className="size-3" /> Awaiting your approval</>}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="size-3" />
                        Due {new Date(r.stage.due).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        {!isApproved && (
                          <span className={`ml-1 font-bold ${overdue ? "text-destructive" : days <= 3 ? "text-warning" : "text-muted-foreground"}`}>
                            ({overdue ? `${Math.abs(days)}d late` : days === 0 ? "today" : `${days}d left`})
                          </span>
                        )}
                      </span>
                      <span className="font-bold">{r.stage.pct}% complete</span>
                    </div>

                    {/* Progress */}
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${r.stage.pct}%`,
                          background: isApproved
                            ? "hsl(var(--success))"
                            : isRejected
                              ? "hsl(var(--primary))"
                              : overdue
                                ? "hsl(var(--destructive))"
                                : "hsl(var(--accent))",
                        }}
                      />
                    </div>

                    {/* Previous comment */}
                    {r.stage.clientComment && (
                      <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3 text-xs">
                        <div className="mb-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <MessageSquare className="size-3" /> Previous client note
                        </div>
                        <p className="text-foreground/90">{r.stage.clientComment}</p>
                      </div>
                    )}

                    {/* Approve / reject controls */}
                    {!isApproved && (
                      <div className="mt-3 space-y-2">
                        <textarea
                          placeholder="Add a comment for the team (required when requesting changes)…"
                          value={comments[id] ?? ""}
                          onChange={(e) => setComments((c) => ({ ...c, [id]: e.target.value }))}
                          className="min-h-[64px] w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => approve(r)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-2 text-xs font-bold text-white hover:opacity-90"
                          >
                            <ThumbsUp className="size-3.5" /> Approve stage
                          </button>
                          <button
                            onClick={() => reject(r)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-2 text-xs font-bold text-white hover:opacity-90"
                          >
                            <X className="size-3.5" /> Request changes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PageContainer>
  );
}

function Kpi({
  label, value, tone, icon: Icon,
}: { label: string; value: number; tone: "warning" | "destructive" | "primary" | "success"; icon: any }) {
  const map = {
    warning: { ring: "hsl(var(--warning))", soft: "bg-warning/10", text: "text-warning" },
    destructive: { ring: "hsl(var(--destructive))", soft: "bg-destructive/10", text: "text-destructive" },
    primary: { ring: "hsl(var(--primary))", soft: "bg-primary/10", text: "text-primary" },
    success: { ring: "hsl(var(--success))", soft: "bg-success/10", text: "text-success" },
  }[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4">
      <span className={`absolute -right-6 -top-6 size-20 rounded-full opacity-50 blur-2xl ${map.soft}`} />
      <div className="relative flex items-start justify-between">
        <span className="grid size-9 place-items-center rounded-xl text-white shadow-elegant" style={{ background: map.ring }}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className="relative mt-3 font-display text-2xl font-extrabold leading-none">{value}</div>
      <div className={`relative mt-1 text-[11px] font-bold uppercase tracking-wider ${map.text}`}>{label}</div>
    </div>
  );
}
