import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageContainer, PageHeader } from "@/components/layout/Page";
import { meetings } from "@/data/mock";
import { Video, Plus, Calendar as CalIcon, ChevronLeft, ChevronRight, X, Pencil, Trash2, List } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { MotionButton, FadeIn } from "@/components/ui/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { usePersistentState } from "@/hooks/usePersistentState";

type View = "month" | "week" | "agenda";

type LocalEvent = {
  id: string;
  day: number;
  title: string;
  type: string;
  time: string;
  business?: string;
};

const uid = () => Math.random().toString(36).slice(2, 9);
const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d\s?(AM|PM|am|pm)?$/;

export default function Meetings() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [view, setView] = useState<View>("month");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", type: "Discovery Call", time: "10:00 AM", day: today.getDate() });
  const [localEvents, setLocalEvents] = usePersistentState<LocalEvent[]>("vh-meetings-v1", []);
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});

  const monthLabel = cursor.toLocaleString("default", { month: "long", year: "numeric" });
  const firstDow = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = 42;

  const isCurrentMonth =
    cursor.getMonth() === today.getMonth() && cursor.getFullYear() === today.getFullYear();
  const baseEventDays = new Set(
    isCurrentMonth ? [today.getDate(), today.getDate() + 1, today.getDate() + 3] : [],
  );
  localEvents.forEach((e) => baseEventDays.add(e.day));

  const eventsForDay = (day: number) => {
    const seed = isCurrentMonth && [today.getDate(), today.getDate() + 1, today.getDate() + 3].includes(day)
      ? meetings.filter((_, i) => i < 2).map((m) => ({ ...m, day }))
      : [];
    return [...seed, ...localEvents.filter((e) => e.day === day)];
  };

  const handlePrev = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const handleNext = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const handleToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    toast.success("Jumped to today");
  };

  const openDay = (day: number) => {
    setSelectedDay(day);
    setOpen(true);
  };

  const validate = () => {
    const e: { title?: string; time?: string } = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.time.trim()) e.time = "Time is required";
    else if (!TIME_RE.test(form.time.trim())) e.time = "Use a format like 10:00 AM";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openNewSheet = (preset?: Partial<typeof form>) => {
    setEditingId(null);
    setErrors({});
    setForm({ title: "", type: "Discovery Call", time: "10:00 AM", day: today.getDate(), ...preset });
    setNewOpen(true);
  };

  const openEditSheet = (ev: LocalEvent) => {
    setEditingId(ev.id);
    setErrors({});
    setForm({ title: ev.title, type: ev.type, time: ev.time, day: ev.day });
    setOpen(false);
    setNewOpen(true);
  };

  const handleCreate = () => {
    if (!validate()) return;
    if (editingId) {
      setLocalEvents((p) => p.map((e) => (e.id === editingId ? { ...e, ...form } : e)));
      toast.success(`Meeting updated · ${form.title}`);
    } else {
      setLocalEvents((p) => [...p, { id: uid(), ...form }]);
      toast.success(`Meeting scheduled · ${form.title}`, { description: `${form.type} · ${form.time}` });
    }
    setEditingId(null);
    setForm({ ...form, title: "" });
    setNewOpen(false);
  };

  const deleteEvent = (id: string) => {
    setLocalEvents((p) => p.filter((e) => e.id !== id));
    toast.message("Meeting deleted");
  };

  const join = (title: string) => toast.success(`Joining ${title}…`, { description: "Opening secure room." });

  // Week view: 7 days starting Sunday of current week
  const weekStart = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }, [today]);

  return (
    <PageContainer>
      <PageHeader
        title="Meetings & Calendar"
        subtitle="Schedule discovery calls, brand reviews, website walkthroughs and launch handoffs."
        actions={
          <MotionButton
            onClick={() => openNewSheet()}
            className="rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant hover:shadow-glow"
          >
            <Plus className="size-4" /> New Meeting
          </MotionButton>
        }
      />

      {/* Infographic strip — eye-catching, animated stats */}
      <CalendarInfographics
        totalThisMonth={meetings.length + localEvents.length}
        types={meetings.concat(localEvents as any).map((m) => m.type)}
        busyByDay={Array.from({ length: 7 }).map((_, dow) => {
          const seedDays = [today.getDate(), today.getDate() + 1, today.getDate() + 3];
          let count = 0;
          if (isCurrentMonth) {
            seedDays.forEach((d) => {
              const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
              if (date.getDay() === dow) count += 2;
            });
          }
          localEvents.forEach((e) => {
            const date = new Date(cursor.getFullYear(), cursor.getMonth(), e.day);
            if (date.getDay() === dow) count += 1;
          });
          return count;
        })}
      />


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Calendar */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="tap grid size-8 place-items-center rounded-lg border border-border hover:bg-muted"
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <h3 className="font-display text-lg font-bold min-w-[160px] text-center">{monthLabel}</h3>
              <button
                onClick={handleNext}
                className="tap grid size-8 place-items-center rounded-lg border border-border hover:bg-muted"
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={handleToday}
                className="tap rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted"
              >
                Today
              </button>
              {(["month", "week", "agenda"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`tap rounded-lg border px-2.5 py-1 text-xs capitalize transition ${
                    view === v
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {view === "month" && (
              <motion.div
                key={`month-${cursor.toISOString()}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="py-2">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: cells }).map((_, i) => {
                    const day = i - firstDow + 1;
                    const inMonth = day > 0 && day <= daysInMonth;
                    const isToday = inMonth && isCurrentMonth && day === today.getDate();
                    const hasEvent = inMonth && baseEventDays.has(day);
                    return (
                      <motion.button
                        key={i}
                        whileTap={inMonth ? { scale: 0.94 } : undefined}
                        onClick={() => inMonth && openDay(day)}
                        disabled={!inMonth}
                        className={`aspect-square rounded-xl border p-2 text-left text-xs transition ${
                          isToday
                            ? "border-primary bg-primary text-primary-foreground shadow-glow"
                            : inMonth
                            ? "border-border bg-card hover:border-accent hover:bg-muted/60"
                            : "border-transparent text-muted-foreground/40"
                        }`}
                      >
                        {inMonth ? day : ""}
                        {hasEvent && (
                          <div className={`mt-1 h-1 rounded-full ${isToday ? "bg-white" : "bg-gradient-red"}`} />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {view === "week" && (
              <motion.div
                key="week"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
                className="grid grid-cols-7 gap-2"
              >
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date(weekStart);
                  d.setDate(weekStart.getDate() + i);
                  const day = d.getDate();
                  const isToday = d.toDateString() === today.toDateString();
                  const evts = eventsForDay(day);
                  return (
                    <button
                      key={i}
                      onClick={() => openDay(day)}
                      className={`tap min-h-[140px] rounded-xl border p-3 text-left transition ${
                        isToday ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {d.toLocaleDateString(undefined, { weekday: "short" })}
                      </div>
                      <div className={`text-xl font-bold ${isToday ? "text-primary" : ""}`}>{day}</div>
                      <div className="mt-2 space-y-1">
                        {evts.slice(0, 2).map((e, idx) => (
                          <div key={idx} className="truncate rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium">
                            {e.title}
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {view === "agenda" && (
              <motion.div
                key="agenda"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="space-y-2"
              >
                {(() => {
                  const allDays = Array.from(baseEventDays).sort((a, b) => a - b);
                  if (allDays.length === 0) {
                    return (
                      <EmptyState
                        icon={List}
                        title="No agenda items"
                        description="Your month is wide open. Schedule a meeting to fill it up."
                        action={{ label: "New meeting", icon: Plus, onClick: () => openNewSheet() }}
                      />
                    );
                  }
                  return allDays.map((day, idx) => {
                    const d = new Date(cursor.getFullYear(), cursor.getMonth(), day);
                    const evts = eventsForDay(day);
                    return (
                      <motion.div
                        key={day}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="rounded-xl border border-border bg-card p-3"
                      >
                        <button
                          onClick={() => openDay(day)}
                          className="flex w-full items-center justify-between text-left"
                        >
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {d.toLocaleDateString(undefined, { weekday: "long" })}
                            </div>
                            <div className="font-display text-lg font-bold">
                              {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </div>
                          </div>
                          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                            {evts.length} {evts.length === 1 ? "event" : "events"}
                          </span>
                        </button>
                        <ul className="mt-2 space-y-1.5">
                          {evts.map((e, i) => {
                            const isLocal = (e as LocalEvent).id != null;
                            return (
                              <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5">
                                <div className="min-w-0">
                                  <div className="truncate text-xs font-semibold">{e.title}</div>
                                  <div className="text-[10px] text-muted-foreground">{e.type} · {e.time}</div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => join(e.title)}
                                    className="tap rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground"
                                  >
                                    Join
                                  </button>
                                  {isLocal && (
                                    <>
                                      <button
                                        onClick={() => openEditSheet(e as LocalEvent)}
                                        className="tap grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                                        aria-label="Edit"
                                      >
                                        <Pencil className="size-3" />
                                      </button>
                                      <button
                                        onClick={() => deleteEvent((e as LocalEvent).id)}
                                        className="tap grid size-6 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                                        aria-label="Delete"
                                      >
                                        <Trash2 className="size-3" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    );
                  });
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Upcoming */}
        <aside className="space-y-4">
          <FadeIn className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Upcoming</h3>
            {meetings.length === 0 ? (
              <EmptyState
                icon={CalIcon}
                title="No meetings yet"
                description="Schedule your first call to get started."
                action={{ label: "New meeting", onClick: () => openNewSheet(), icon: Plus }}
              />
            ) : (
              <ul className="space-y-3">
                {meetings.map((m, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-border p-3 hover:border-accent transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-lg bg-gradient-blue text-white">
                          <Video className="size-4" />
                        </span>
                        <div>
                          <div className="text-sm font-semibold">{m.title}</div>
                          <div className="text-[11px] text-muted-foreground">{m.business}</div>
                        </div>
                      </div>
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">{m.type}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{m.time}</span>
                      <MotionButton
                        onClick={() => join(m.title)}
                        className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"
                      >
                        Join
                      </MotionButton>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </FadeIn>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Meeting Types</h3>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              {["Discovery Call", "Brand Review", "Website Review", "Final Delivery", "Support"].map((t) => (
                <li key={t}>
                  <button
                    onClick={() => openNewSheet({ type: t })}
                    className="tap flex w-full items-center gap-1.5 rounded-lg border border-border p-2 hover:border-accent hover:bg-muted/50"
                  >
                    <CalIcon className="size-3.5 text-accent" /> {t}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Day details sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedDay
                ? new Date(cursor.getFullYear(), cursor.getMonth(), selectedDay).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "Day"}
            </SheetTitle>
            <SheetDescription>All meetings and events for this date.</SheetDescription>
          </SheetHeader>
          <div className="mt-5 space-y-3">
            {selectedDay && eventsForDay(selectedDay).length === 0 ? (
              <EmptyState
                icon={CalIcon}
                title="Nothing scheduled"
                description="This day is wide open. Add a meeting to fill it."
                action={{
                  label: "Add meeting",
                  icon: Plus,
                  onClick: () => {
                    setOpen(false);
                    openNewSheet({ day: selectedDay });
                  },
                }}
              />
            ) : (
              selectedDay &&
              eventsForDay(selectedDay).map((e, i) => {
                const isLocal = (e as LocalEvent).id != null;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{e.title}</div>
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        {e.type}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{e.time}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <MotionButton
                        onClick={() => join(e.title)}
                        className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"
                      >
                        Join
                      </MotionButton>
                      {isLocal ? (
                        <>
                          <MotionButton
                            onClick={() => openEditSheet(e as LocalEvent)}
                            className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold hover:bg-muted"
                          >
                            <Pencil className="size-3" /> Edit
                          </MotionButton>
                          <MotionButton
                            onClick={() => deleteEvent((e as LocalEvent).id)}
                            className="rounded-lg border border-destructive/40 px-2.5 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3" /> Delete
                          </MotionButton>
                        </>
                      ) : (
                        <MotionButton
                          onClick={() => toast.message("Reschedule", { description: "Pick a new time slot." })}
                          className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold hover:bg-muted"
                        >
                          Reschedule
                        </MotionButton>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* New meeting sheet */}
      <Sheet open={newOpen} onOpenChange={setNewOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New Meeting</SheetTitle>
            <SheetDescription>Quickly schedule a call with a client or your team.</SheetDescription>
          </SheetHeader>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">Title</span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Discovery call with Acme"
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">Type</span>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-accent"
              >
                {["Discovery Call", "Brand Review", "Website Review", "Final Delivery", "Support"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">Day</span>
                <input
                  type="number"
                  min={1}
                  max={daysInMonth}
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">Time</span>
                <input
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="10:00 AM"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-accent"
                />
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <MotionButton
                onClick={handleCreate}
                className="flex-1 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant hover:shadow-glow"
              >
                <Plus className="size-4" /> Schedule
              </MotionButton>
              <MotionButton
                onClick={() => setNewOpen(false)}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"
              >
                <X className="size-4" /> Cancel
              </MotionButton>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}

/* ============== Animated Infographic Strip ============== */
const ease = [0.22, 1, 0.36, 1] as const;
const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

function CalendarInfographics({
  totalThisMonth,
  types,
  busyByDay,
}: {
  totalThisMonth: number;
  types: string[];
  busyByDay: number[];
}) {
  const typeCounts = types.reduce<Record<string, number>>((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const totalType = Math.max(1, Object.values(typeCounts).reduce((a, b) => a + b, 0));
  const palette = ["hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--warning))", "hsl(var(--success))", "hsl(var(--destructive))"];
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const todayCount = busyByDay[new Date().getDay()] ?? 0;
  const weekTotal = busyByDay.reduce((a, b) => a + b, 0);
  const maxBusy = Math.max(...busyByDay, 1);

  // donut
  const R = 26, C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* Today */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[hsl(230_55%_22%)] via-[hsl(235_65%_38%)] to-[hsl(245_70%_60%)] p-4 text-white shadow-elegant"
      >
        <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/15 blur-2xl" />
        <div className="relative">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Today</div>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-display text-4xl font-extrabold leading-none tabular-nums">{todayCount}</span>
            <span className="pb-1 text-[11px] text-white/80">meetings</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">
            <span className="size-1.5 animate-pulse rounded-full bg-success" /> Live agenda
          </div>
          {/* sparkline */}
          <svg viewBox="0 0 100 30" className="mt-3 h-10 w-full">
            <defs>
              <linearGradient id="todayFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 22 L14 14 L28 18 L42 8 L56 16 L72 6 L86 12 L100 4 L100 30 L0 30 Z" fill="url(#todayFill)" />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease }}
              d="M0 22 L14 14 L28 18 L42 8 L56 16 L72 6 L86 12 L100 4"
              fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"
            />
          </svg>
        </div>
      </motion.div>

      {/* Donut by meeting type */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease, delay: 0.05 }}
        className="rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">By Type</div>
        <div className="mt-2 flex items-center gap-3">
          <div className="relative grid size-[88px] place-items-center">
            <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
              <circle cx="44" cy="44" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="9" />
              {sortedTypes.map(([name, count], i) => {
                const len = (count / totalType) * C;
                const seg = (
                  <motion.circle
                    key={name}
                    cx="44" cy="44" r={R} fill="none"
                    stroke={palette[i % palette.length]}
                    strokeWidth="9" strokeLinecap="butt"
                    strokeDasharray={`${len} ${C - len}`}
                    strokeDashoffset={-offset}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                  />
                );
                offset += len;
                return seg;
              })}
            </svg>
            <div className="absolute text-center">
              <div className="font-display text-lg font-bold leading-none tabular-nums">{totalThisMonth}</div>
              <div className="text-[8px] uppercase tracking-wider text-muted-foreground">total</div>
            </div>
          </div>
          <ul className="flex-1 space-y-1.5 text-[11px]">
            {sortedTypes.map(([name, count], i) => (
              <li key={name} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="size-2 shrink-0 rounded-sm" style={{ background: palette[i % palette.length] }} />
                  <span className="truncate font-semibold">{name}</span>
                </span>
                <span className="text-muted-foreground tabular-nums">{count}</span>
              </li>
            ))}
            {sortedTypes.length === 0 && <li className="text-muted-foreground">No meetings yet</li>}
          </ul>
        </div>
      </motion.div>

      {/* Busy by weekday — animated bars */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease, delay: 0.1 }}
        className="rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Weekly Load</div>
          <div className="text-[10px] font-bold text-accent">{weekTotal} mtgs</div>
        </div>
        <div className="mt-3 flex h-20 items-end gap-1.5">
          {busyByDay.map((v, i) => {
            const h = (v / maxBusy) * 100;
            const isToday = new Date().getDay() === i;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <motion.span
                  initial={{ height: 2 }}
                  animate={{ height: `${Math.max(h, 4)}%` }}
                  transition={{ duration: 0.7, ease, delay: i * 0.05 }}
                  className={`w-full rounded-md ${
                    isToday ? "bg-gradient-to-t from-primary to-accent shadow-glow" : "bg-gradient-to-t from-muted to-muted/60"
                  }`}
                />
                <span className={`text-[9px] font-bold ${isToday ? "text-accent" : "text-muted-foreground"}`}>
                  {dayLabels[i]}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Status badges */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease, delay: 0.15 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <span className="pointer-events-none absolute -bottom-8 -right-8 size-32 rounded-full bg-accent/20 blur-2xl vh-float" />
        <div className="relative">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Pipeline</div>
          <div className="mt-2 space-y-2">
            {[
              { label: "Scheduled", value: totalThisMonth, color: "hsl(var(--accent))" },
              { label: "Confirmed", value: Math.round(totalThisMonth * 0.7), color: "hsl(var(--primary))" },
              { label: "Pending", value: Math.max(0, totalThisMonth - Math.round(totalThisMonth * 0.7)), color: "hsl(var(--warning))" },
            ].map((row, i) => (
              <div key={row.label} className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px] font-semibold">
                  <span style={{ color: row.color }}>{row.label}</span>
                  <span className="tabular-nums text-muted-foreground">{row.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${totalThisMonth ? (row.value / totalThisMonth) * 100 : 0}%` }}
                    transition={{ duration: 0.8, ease, delay: 0.2 + i * 0.1 }}
                    className="block h-full rounded-full"
                    style={{ background: row.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

