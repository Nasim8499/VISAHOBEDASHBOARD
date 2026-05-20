import { PageContainer, PageHeader } from "@/components/layout/Page";
import { tasksByStatus } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const columns = [
  "Backlog",
  "To Do",
  "In Progress",
  "Waiting Client Approval",
  "Revision Requested",
  "Completed",
] as const;

const priorityTone: Record<string, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/10 text-warning",
  Low: "bg-muted text-muted-foreground",
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function Tasks() {
  const reduce = useReducedMotion();

  const colVariants = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease, delay: reduce ? 0 : i * 0.06 },
    }),
  };

  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease } },
  };

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
      >
        <PageHeader
          title="Tasks & Workflow"
          subtitle="Track every task across every client business workspace."
          actions={
            <motion.button
              whileHover={reduce ? undefined : { scale: 1.04 }}
              whileTap={reduce ? undefined : { scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant transition-shadow hover:shadow-glow"
            >
              <Plus className="size-4" /> New Task
            </motion.button>
          }
        />
      </motion.div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col, i) => {
          const list = tasksByStatus[col] || [];
          return (
            <motion.div
              key={col}
              custom={i}
              initial="hidden"
              animate="show"
              variants={colVariants}
              className="w-72 shrink-0"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{col}</h3>
                  <motion.span
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease, delay: 0.1 + i * 0.05 }}
                    className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {list.length}
                  </motion.span>
                </div>
                <motion.button
                  whileHover={reduce ? undefined : { rotate: 90, scale: 1.1 }}
                  transition={{ duration: 0.25, ease }}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                >
                  <Plus className="size-4" />
                </motion.button>
              </div>
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="space-y-2"
              >
                {list.map((t) => (
                  <motion.div
                    key={t.title}
                    variants={cardVariants}
                    whileHover={reduce ? undefined : { y: -3, scale: 1.015 }}
                    transition={{ duration: 0.2, ease }}
                    className="cursor-grab rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-elegant"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold">{t.title}</div>
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${priorityTone[t.priority]}`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="grid size-7 place-items-center rounded-full bg-gradient-blue text-[10px] font-semibold text-white">
                        {t.assignee}
                      </span>
                      <span>Due {t.due}</span>
                    </div>
                  </motion.div>
                ))}
                {list.length === 0 && (
                  <motion.div
                    variants={cardVariants}
                    className="rounded-xl border-2 border-dashed border-border p-5 text-center text-xs text-muted-foreground"
                  >
                    No tasks
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease, delay: 0.3 }}
        className="mt-6 rounded-2xl border border-border bg-card p-5"
      >
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Legend</h3>
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.35 } } }}
          className="flex flex-wrap gap-2"
        >
          {columns.map((c) => (
            <motion.div
              key={c}
              variants={{ hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease } } }}
            >
              <StatusBadge status={c} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
