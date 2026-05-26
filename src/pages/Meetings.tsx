import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageContainer, PageHeader } from "@/components/layout/Page";
import { meetings } from "@/data/mock";
import { Video, Plus, Calendar as CalIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { MotionButton, FadeIn } from "@/components/ui/motion";
import { EmptyState } from "@/components/ui/empty-state";

type View = "month" | "week";

type LocalEvent = {
  day: number;
  title: string;
  type: string;
  time: string;
  business?: string;
};

export default function Meetings() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [view, setView] = useState<View>("month");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: "Discovery Call", time: "10:00 AM", day: today.getDate() });
  const [localEvents, setLocalEvents] = useState<LocalEvent[]>([]);

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

  const handleCreate = () => {
    if (!form.title.trim()) {
      toast.error("Please add a meeting title");
      return;
    }
    setLocalEvents((p) => [...p, { ...form }]);
    toast.success(`Meeting scheduled · ${form.title}`, { description: `${form.type} · ${form.time}` });
    setForm({ ...form, title: "" });
    setNewOpen(false);
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
            onClick={() => setNewOpen(true)}
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
              {(["month", "week"] as const).map((v) => (
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
            {view === "month" ? (
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
            ) : (
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
                action={{ label: "New meeting", onClick: () => setNewOpen(true), icon: Plus }}
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
                    onClick={() => {
                      setForm({ ...form, type: t });
                      setNewOpen(true);
                    }}
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
                    setForm({ ...form, day: selectedDay });
                    setNewOpen(true);
                  },
                }}
              />
            ) : (
              selectedDay &&
              eventsForDay(selectedDay).map((e, i) => (
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
                  <div className="mt-2 flex gap-2">
                    <MotionButton
                      onClick={() => join(e.title)}
                      className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"
                    >
                      Join
                    </MotionButton>
                    <MotionButton
                      onClick={() => toast.message("Reschedule", { description: "Pick a new time slot." })}
                      className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold hover:bg-muted"
                    >
                      Reschedule
                    </MotionButton>
                  </div>
                </motion.div>
              ))
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
