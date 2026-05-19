import { PageContainer, PageHeader } from "@/components/layout/Page";

const groups = [
  {
    title: "Company Profile",
    fields: [
      { l: "Company Name", v: "VisaHOBe PTE. LTD." },
      { l: "Email", v: "admin@visahobe.com" },
      { l: "Country", v: "Singapore" },
    ],
  },
  {
    title: "Brand Theme",
    fields: [
      { l: "Primary Color", v: "#003B73" },
      { l: "Accent Color", v: "#177BBB" },
      { l: "Font", v: "Inter" },
    ],
  },
  {
    title: "Notifications",
    fields: [
      { l: "Email alerts", v: "On" },
      { l: "Approval reminders", v: "On" },
      { l: "Weekly reports", v: "On" },
    ],
  },
  {
    title: "Security",
    fields: [
      { l: "Two-factor auth", v: "Enabled" },
      { l: "Session timeout", v: "30 min" },
    ],
  },
];

export default function Settings() {
  return (
    <PageContainer>
      <PageHeader title="Settings" subtitle="Manage company profile, branding, roles, integrations and security." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {groups.map((g) => (
          <section key={g.title} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{g.title}</h3>
            <div className="space-y-3">
              {g.fields.map((f) => (
                <div key={f.l} className="flex items-center justify-between gap-3">
                  <label className="text-sm text-muted-foreground">{f.l}</label>
                  <input
                    defaultValue={f.v}
                    className="h-10 w-2/3 rounded-lg border border-border bg-background px-3 text-sm focus:border-accent outline-none"
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
