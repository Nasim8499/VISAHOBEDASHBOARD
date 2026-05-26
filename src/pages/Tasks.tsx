import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  Plus, Search, Filter, X, MoreHorizontal, CheckCircle2, Clock3,
  AlertTriangle, Sparkles, ListChecks, Trash2, ArrowRight, ArrowLeft, Flag, GripVertical,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/Page";
import { tasksByStatus as seedTasks } from "@/data/mock";
import { cn } from "@/lib/utils";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

type Status =
  | "Backlog" | "To Do" | "In Progress"
  | "Waiting Client Approval" | "Revision Requested" | "Completed";

type Priority = "Low" | "Medium" | "High";

type Task = {
  id: string;
  title: string;
  assignee: string;
  priority: Priority;
  due: string;
  status: Status;
  business?: string;
};

const columns: Status[] = [
  "Backlog", "To Do", "In Progress",
  "Waiting Client Approval", "Revision Requested", "Completed",
];

const columnAccent: Record<Status, { ring: string; soft: string; text: string; bar: string }> = {
  "Backlog":                  { ring: "hsl(var(--muted-foreground))", soft: "bg-muted",          text: "text-muted-foreground", bar: "from-muted to-muted" },
  "To Do":                    { ring: "hsl(var(--accent))",           soft: "bg-accent/10",      text: "text-accent",           bar: "from-accent/70 to-accent" },
  "In Progress":              { ring: "hsl(var(--primary))",          soft: "bg-primary/10",     text: "text-primary",          bar: "from-primary/70 to-primary" },
  "Waiting Client Approval":  { ring: "hsl(var(--warning))",          soft: "bg-warning/15",     text: "text-warning",          bar: "from-warning/70 to-warning" },
  "Revision Requested":       { ring: "hsl(var(--destructive))",      soft: "bg-destructive/10", text: "text-destructive",      bar: "from-destructive/70 to-destructive" },
  "Completed":                { ring: "hsl(var(--success))",          soft: "bg-success/10",     text: "text-success",          bar: "from-success/70 to-success" },
};

const priorityTone: Record<Priority, string> = {
  High:   "bg-destructive/10 text-destructive ring-1 ring-destructive/30",
  Medium: "bg-warning/15 text-warning ring-1 ring-warning/30",
  Low:    "bg-muted text-muted-foreground ring-1 ring-border",
};

const uid = () => Math.random().toString(36).slice(2, 9);

function seedToTasks(): Task[] {
  const arr: Task[] = [];
  (Object.entries(seedTasks) as [Status, readonly any[]][]).forEach(([s, list]) => {
    list.forEach((t) => arr.push({ id: uid(), status: s, ...t }));
  });
  return arr;
}

const ease = [0.22, 1, 0.36, 1] as const;

/* ---------------- INFOGRAPHIC STRIP ---------------- */
function StatTile({
  label, value, sub, accent, viz,
}: { label: string; value: string | number; sub: string; accent: string; viz: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <span
        className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-30 blur-2xl vh-float"
        style={{ background: accent }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
          <div className="mt-1 font-display text-3xl font-extrabold leading-none tabular-nums">{value}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
        </div>
        <div className="shrink-0">{viz}</div>
      </div>
    </motion.div>
  );
}

function Donut({ value, color }: { value: number; color: string }) {
  const R = 18, C = 2 * Math.PI * R;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
      <circle cx="26" cy="26" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
      <motion.circle
        cx="26" cy="26" r={R} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${C}` }}
        animate={{ strokeDasharray: `${(value / 100) * C} ${C}` }}
        transition={{ duration: 0.9, ease }}
      />
    </svg>
  );
}

function Bars({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-10 items-end gap-0.5">
      {data.map((v, i) => (
        <motion.span
          key={i}
          initial={{ height: 2 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ duration: 0.7, ease, delay: i * 0.04 }}
          className="w-1.5 rounded-t"
          style={{ background: color }}
        />
      ))}
    </div>
  );
}

function PulseBlip({ color }: { color: string }) {
  return (
    <span className="relative grid size-12 place-items-center">
      <span className="absolute size-12 rounded-full opacity-30 animate-ping" style={{ background: color }} />
      <span className="grid size-9 place-items-center rounded-full text-white shadow-glow" style={{ background: color }}>
        <AlertTriangle className="size-4" />
      </span>
    </span>
  );
}

/* ---------------- TASK CARD ---------------- */
function TaskCard({
  task, onMove, onDelete, onOpen, onDragStart, onDragEnd, isDragging,
}: {
  task: Task;
  onMove: (id: string, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
  onOpen: (t: Task) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ duration: 0.28, ease }}
      draggable
      onDragStart={(e) => {
        // framer-motion forwards the native event
        (e as unknown as DragEvent).dataTransfer?.setData("text/plain", task.id);
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(task)}
      className={cn(
        "group cursor-grab active:cursor-grabbing rounded-xl border border-border bg-card p-3 shadow-sm transition hover:shadow-elegant hover:border-accent/60",
        isDragging && "ring-2 ring-accent",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 min-w-0">
          <GripVertical className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50 transition group-hover:text-muted-foreground" />
          <div className="text-sm font-semibold leading-snug">{task.title}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-muted">
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">Move</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(task.id, -1); }}>
              <ArrowLeft className="size-3.5" /> Previous column
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(task.id, 1); }}>
              <ArrowRight className="size-3.5" /> Next column
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="text-destructive"
            >
              <Trash2 className="size-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", priorityTone[task.priority])}>
          <Flag className="mr-0.5 inline size-2.5" />{task.priority}
        </span>
        {task.business && (
          <span className="truncate rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {task.business}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="grid size-7 place-items-center rounded-full bg-gradient-blue text-[10px] font-semibold text-white shadow-sm">
          {task.assignee}
        </span>
        <span>Due {task.due}</span>
      </div>
    </motion.div>
  );
}

/* ---------------- PAGE ---------------- */
export default function Tasks() {
  const reduce = useReducedMotion();
  const [tasks, setTasks] = useState<Task[]>(seedToTasks);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [newOpen, setNewOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [form, setForm] = useState<{ title: string; assignee: string; priority: Priority; due: string; status: Status; business: string }>({
    title: "", assignee: "AM", priority: "Medium", due: "", status: "To Do", business: "",
  });

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, search, priorityFilter]);

  const byCol = useMemo(() => {
    const map: Record<Status, Task[]> = {
      "Backlog": [], "To Do": [], "In Progress": [],
      "Waiting Client Approval": [], "Revision Requested": [], "Completed": [],
    };
    filtered.forEach((t) => map[t.status].push(t));
    return map;
  }, [filtered]);

  /* ----- KPIs ----- */
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const highRisk = tasks.filter((t) => t.priority === "High" && t.status !== "Completed").length;
  const awaiting = tasks.filter((t) => t.status === "Waiting Client Approval").length;
  const completionPct = total ? Math.round((completed / total) * 100) : 0;
  const columnCounts = columns.map((c) => tasks.filter((t) => t.status === c).length);

  /* ----- Mutations ----- */
  const moveTask = (id: string, dir: -1 | 1) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const idx = columns.indexOf(t.status);
        const next = columns[Math.min(columns.length - 1, Math.max(0, idx + dir))];
        if (next !== t.status) toast.success(`Moved to ${next}`);
        return { ...t, status: next };
      })
    );
  };

  const setStatus = (id: string, status: Status) => {
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(`Moved to ${status}`);
  };

  const deleteTask = (id: string) => {
    setTasks((p) => p.filter((t) => t.id !== id));
    setDetailTask(null);
    toast.message("Task deleted");
  };

  const createTask = () => {
    if (!form.title.trim()) {
      toast.error("Add a task title first");
      return;
    }
    const t: Task = {
      id: uid(),
      title: form.title.trim(),
      assignee: (form.assignee || "AM").slice(0, 2).toUpperCase(),
      priority: form.priority,
      due: form.due || "—",
      status: form.status,
      business: form.business || undefined,
    };
    setTasks((p) => [t, ...p]);
    toast.success("Task created", { description: `${t.title} · ${t.status}` });
    setForm({ ...form, title: "", business: "" });
    setNewOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Tasks & Workflow"
        subtitle="Track every task across every client business — drag through stages, ship faster."
        actions={
          <motion.button
            whileHover={reduce ? undefined : { y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            onClick={() => setNewOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant hover:shadow-glow"
          >
            <Plus className="size-4" /> New Task
          </motion.button>
        }
      />

      {/* INFOGRAPHIC STAT STRIP */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile
          label="Total"
          value={total}
          sub={`${columns.length} columns`}
          accent="hsl(var(--accent))"
          viz={<Bars data={columnCounts.map((c) => Math.max(c, 1))} color="hsl(var(--accent))" />}
        />
        <StatTile
          label="In Progress"
          value={inProgress}
          sub="actively moving"
          accent="hsl(var(--primary))"
          viz={
            <div className="relative grid size-12 place-items-center">
              <Clock3 className="absolute size-4 text-primary" />
              <Donut value={Math.min(100, inProgress * 12)} color="hsl(var(--primary))" />
            </div>
          }
        />
        <StatTile
          label="Awaiting Client"
          value={awaiting}
          sub="approval pending"
          accent="hsl(var(--warning))"
          viz={
            <div className="relative grid size-12 place-items-center">
              <Sparkles className="absolute size-4 text-warning" />
              <Donut value={Math.min(100, awaiting * 25)} color="hsl(var(--warning))" />
            </div>
          }
        />
        <StatTile
          label="High Risk"
          value={highRisk}
          sub="priority tasks open"
          accent="hsl(var(--destructive))"
          viz={<PulseBlip color="hsl(var(--destructive))" />}
        />
        <StatTile
          label="Completion"
          value={`${completionPct}%`}
          sub={`${completed}/${total} done`}
          accent="hsl(var(--success))"
          viz={
            <div className="relative grid size-12 place-items-center">
              <CheckCircle2 className="absolute size-4 text-success" />
              <Donut value={completionPct} color="hsl(var(--success))" />
            </div>
          }
        />
      </div>

      {/* TOOLBAR */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-accent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 text-xs">
            <Filter className="ml-1.5 size-3.5 text-muted-foreground" />
            {(["All", "High", "Medium", "Low"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={cn(
                  "tap rounded-lg px-2.5 py-1 font-semibold transition",
                  priorityFilter === p ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ListChecks className="size-4" />
          Showing {filtered.length} of {tasks.length}
        </div>
      </div>

      {/* KANBAN — fixed height, scrolls horizontally on smaller widths, columns scroll vertically internally */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
        {columns.map((col, i) => {
          const list = byCol[col];
          const accent = columnAccent[col];
          return (
            <motion.section
              key={col}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease, delay: reduce ? 0 : i * 0.05 }}
              className="flex h-[calc(100vh-26rem)] min-h-[420px] w-72 shrink-0 flex-col rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 shadow-sm"
            >
              {/* Column header */}
              <div className="flex items-center justify-between gap-2 border-b border-border p-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: accent.ring }} />
                  <h3 className="truncate text-sm font-bold">{col}</h3>
                  <motion.span
                    key={list.length}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 360, damping: 18 }}
                    className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", accent.soft, accent.text)}
                  >
                    {list.length}
                  </motion.span>
                </div>
                <button
                  onClick={() => { setForm({ ...form, status: col }); setNewOpen(true); }}
                  className="tap grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Add task to ${col}`}
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              {/* Mini fill bar */}
              <div className="px-3 pt-2">
                <div className="h-1 overflow-hidden rounded-full bg-muted">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${total ? (list.length / Math.max(...columnCounts, 1)) * 100 : 0}%` }}
                    transition={{ duration: 0.7, ease }}
                    className={cn("block h-full rounded-full bg-gradient-to-r", accent.bar)}
                  />
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2 overflow-y-auto p-3 scrollbar-thin">
                <AnimatePresence mode="popLayout">
                  {list.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onMove={moveTask}
                      onDelete={deleteTask}
                      onOpen={setDetailTask}
                    />
                  ))}
                </AnimatePresence>
                {list.length === 0 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => { setForm({ ...form, status: col }); setNewOpen(true); }}
                    className="w-full rounded-xl border-2 border-dashed border-border p-5 text-center text-xs text-muted-foreground hover:border-accent hover:text-accent transition"
                  >
                    <Plus className="mx-auto mb-1 size-4" />
                    Add task
                  </motion.button>
                )}
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* DETAIL SHEET */}
      <Sheet open={!!detailTask} onOpenChange={(o) => !o && setDetailTask(null)}>
        <SheetContent>
          {detailTask && (
            <>
              <SheetHeader>
                <SheetTitle>{detailTask.title}</SheetTitle>
                <SheetDescription>Quick task details and stage controls.</SheetDescription>
              </SheetHeader>
              <div className="mt-5 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Assignee</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-full bg-gradient-blue text-[11px] font-semibold text-white">
                        {detailTask.assignee}
                      </span>
                      <span className="font-semibold">{detailTask.assignee}</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Due</div>
                    <div className="mt-1 font-semibold">{detailTask.due}</div>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Priority</div>
                    <div className={cn("mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-bold", priorityTone[detailTask.priority])}>
                      {detailTask.priority}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</div>
                    <div className={cn("mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-bold", columnAccent[detailTask.status].soft, columnAccent[detailTask.status].text)}>
                      {detailTask.status}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Move to</div>
                  <div className="flex flex-wrap gap-1.5">
                    {columns.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setStatus(detailTask.id, c); setDetailTask({ ...detailTask, status: c }); }}
                        className={cn(
                          "tap rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition",
                          detailTask.status === c
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-muted"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => deleteTask(detailTask.id)}
                    className="tap inline-flex items-center gap-1.5 rounded-xl border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                  <button
                    onClick={() => setDetailTask(null)}
                    className="tap ml-auto rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    Done
                  </button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* NEW TASK SHEET */}
      <Sheet open={newOpen} onOpenChange={setNewOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New Task</SheetTitle>
            <SheetDescription>Add a task to any column on the workflow board.</SheetDescription>
          </SheetHeader>
          <div className="mt-5 space-y-3 text-sm">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Title</span>
              <input
                autoFocus
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && createTask()}
                placeholder="e.g. Logo round 2 — FitZone"
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 outline-none focus:border-accent"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assignee</span>
                <input
                  value={form.assignee}
                  onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                  maxLength={3}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 outline-none focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Due</span>
                <input
                  value={form.due}
                  onChange={(e) => setForm({ ...form, due: e.target.value })}
                  placeholder="Aug 04"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 outline-none focus:border-accent"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Business</span>
              <input
                value={form.business}
                onChange={(e) => setForm({ ...form, business: e.target.value })}
                placeholder="SpiceBite Restaurant"
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 outline-none focus:border-accent"
              />
            </label>
            <div>
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority</span>
              <div className="flex gap-1.5">
                {(["Low", "Medium", "High"] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, priority: p })}
                    className={cn(
                      "tap flex-1 rounded-lg border px-3 py-1.5 text-xs font-semibold",
                      form.priority === p ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Column</span>
              <div className="flex flex-wrap gap-1.5">
                {columns.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, status: c })}
                    className={cn(
                      "tap rounded-lg border px-2.5 py-1 text-[11px] font-semibold",
                      form.status === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setNewOpen(false)} className="tap flex-1 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold hover:bg-muted">
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={createTask}
                className="tap flex-1 rounded-xl bg-gradient-blue px-3 py-2.5 text-sm font-semibold text-white shadow-elegant hover:shadow-glow"
              >
                Create task
              </motion.button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
