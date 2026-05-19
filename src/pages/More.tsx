import { PageContainer, PageHeader } from "@/components/layout/Page";
import { Link } from "react-router-dom";
import { navGroups } from "@/components/layout/Sidebar";

export default function More() {
  return (
    <PageContainer>
      <PageHeader title="More" subtitle="All VisaHOBe Operating OS tools." />
      <div className="space-y-6">
        {navGroups.map((g) => (
          <section key={g.label}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {g.items.map((it) => (
                <Link
                  key={it.to}
                  to={it.to}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition hover:shadow-elegant"
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-gradient-blue text-white">
                    <it.icon className="size-4" />
                  </span>
                  <span className="text-sm font-medium">{it.label}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
