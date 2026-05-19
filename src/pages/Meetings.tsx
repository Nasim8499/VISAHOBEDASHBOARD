import { PageContainer, PageHeader } from "@/components/layout/Page";
import { meetings } from "@/data/mock";
import { Video, Plus, Calendar as CalIcon } from "lucide-react";

export default function Meetings() {
  const today = new Date();
  const month = today.toLocaleString("default", { month: "long", year: "numeric" });
  const days = Array.from({ length: 35 });
  const dayOfMonth = today.getDate();

  return (
    <PageContainer>
      <PageHeader
        title="Meetings & Calendar"
        subtitle="Schedule discovery calls, brand reviews, website walkthroughs and launch handoffs."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white">
            <Plus className="size-4" /> New Meeting
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Calendar */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">{month}</h3>
            <div className="flex gap-1.5">
              <button className="rounded-lg border border-border px-2.5 py-1 text-xs">Today</button>
              <button className="rounded-lg border border-border px-2.5 py-1 text-xs">Month</button>
              <button className="rounded-lg border border-border px-2.5 py-1 text-xs">Week</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((_, i) => {
              const day = i - 2;
              const isToday = day === dayOfMonth;
              const hasEvent = [dayOfMonth, dayOfMonth + 1, dayOfMonth + 3].includes(day);
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-xl border p-2 text-left text-xs transition ${
                    isToday
                      ? "border-primary bg-primary text-primary-foreground"
                      : day > 0 && day <= 30
                      ? "border-border bg-card hover:border-accent"
                      : "border-transparent text-muted-foreground/40"
                  }`}
                >
                  {day > 0 && day <= 30 ? day : ""}
                  {hasEvent && day > 0 && (
                    <div className={`mt-1 h-1 rounded-full ${isToday ? "bg-white" : "bg-gradient-red"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Upcoming</h3>
            <ul className="space-y-3">
              {meetings.map((m, i) => (
                <li key={i} className="rounded-xl border border-border p-3">
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
                    <button className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">Join</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Meeting Types</h3>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              {["Discovery Call", "Brand Review", "Website Review", "Final Delivery", "Support"].map((t) => (
                <li key={t} className="flex items-center gap-1.5 rounded-lg border border-border p-2">
                  <CalIcon className="size-3.5 text-accent" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
