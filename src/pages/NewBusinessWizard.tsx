import { PageContainer, PageHeader } from "@/components/layout/Page";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  "Business Category & Name",
  "Client Contact Info",
  "Country / Market Target",
  "Services Required",
  "Brand Preferences",
  "Required Documents",
  "Assign Team",
  "Timeline & Budget",
  "Review & Create",
];

export default function NewBusinessWizard() {
  const [step, setStep] = useState(0);
  const pct = ((step + 1) / steps.length) * 100;

  return (
    <PageContainer>
      <PageHeader
        title="Create New Business Workspace"
        subtitle="Onboard a new client and spin up their complete VisaHOBe workspace."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Stepper */}
        <aside className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Progress
          </div>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-blue transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <ol className="space-y-2">
            {steps.map((s, i) => {
              const done = i < step;
              const cur = i === step;
              return (
                <li key={s}>
                  <button
                    onClick={() => setStep(i)}
                    className={`flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm transition ${
                      cur ? "bg-primary/5 font-semibold text-primary" : "hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                        done
                          ? "bg-success text-white"
                          : cur
                          ? "bg-gradient-blue text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="size-3" /> : i + 1}
                    </span>
                    <span className="truncate">{s}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* Form panel */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Step {step + 1} of {steps.length}
          </div>
          <h2 className="mt-1 font-display text-xl font-bold">{steps[step]}</h2>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {step === 0 && (
              <>
                <Field label="Business Name" placeholder="e.g. SpiceBite Restaurant" />
                <Field
                  label="Category"
                  as="select"
                  options={["Restaurant", "Travel", "Beauty", "Fitness", "Real Estate", "E-commerce"]}
                />
                <Field label="Short Description" full placeholder="One-line value proposition" />
              </>
            )}
            {step === 1 && (
              <>
                <Field label="Primary Contact" placeholder="Full name" />
                <Field label="Email" type="email" placeholder="name@business.com" />
                <Field label="Phone" placeholder="+1 555 0123" />
                <Field label="WhatsApp / Telegram" placeholder="Optional" />
              </>
            )}
            {step === 2 && (
              <>
                <Field label="Country" placeholder="Singapore" />
                <Field label="City" placeholder="Singapore" />
                <Field label="Target Market" full placeholder="Local SG diners, ages 22-45" />
              </>
            )}
            {step === 3 && (
              <div className="sm:col-span-2 grid grid-cols-2 gap-3 md:grid-cols-3">
                {["Branding", "Logo", "Website", "Social Kit", "Marketing", "Documents"].map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted">
                    <input type="checkbox" defaultChecked className="size-4 accent-[hsl(var(--primary))]" />
                    <span className="text-sm font-medium">{s}</span>
                  </label>
                ))}
              </div>
            )}
            {step === 4 && (
              <>
                <Field label="Preferred Style" as="select" options={["Modern", "Minimal", "Luxury", "Creative", "Classic", "Corporate"]} />
                <Field label="Primary Color" type="color" />
                <Field label="Reference Links" full placeholder="https://…" />
              </>
            )}
            {step === 5 && (
              <div className="sm:col-span-2 rounded-2xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Drop client documents here, or <span className="font-semibold text-accent">browse</span>
              </div>
            )}
            {step === 6 && (
              <div className="sm:col-span-2 grid grid-cols-2 gap-3 md:grid-cols-3">
                {["Aarav M.", "Sara K.", "Lina P.", "Marco R.", "Hannah C.", "Yuki T."].map((p) => (
                  <label key={p} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted">
                    <input type="checkbox" className="size-4 accent-[hsl(var(--primary))]" />
                    <span className="text-sm font-medium">{p}</span>
                  </label>
                ))}
              </div>
            )}
            {step === 7 && (
              <>
                <Field label="Start Date" type="date" />
                <Field label="Deadline" type="date" />
                <Field label="Budget (USD)" placeholder="$24,000" />
                <Field label="Package" as="select" options={["Starter", "Growth", "Pro", "Enterprise"]} />
              </>
            )}
            {step === 8 && (
              <div className="sm:col-span-2 rounded-2xl bg-gradient-hero p-6 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Ready to launch</div>
                <h3 className="mt-1 text-xl font-bold">You're about to create a new client workspace.</h3>
                <p className="mt-2 text-sm opacity-90">
                  VisaHOBe will auto-create folders, assign team, send the welcome email and start the brand
                  builder workflow.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold disabled:opacity-50"
              disabled={step === 0}
            >
              <ChevronLeft className="size-4" /> Back
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-blue px-4 py-2 text-sm font-semibold text-white"
              >
                Next <ChevronRight className="size-4" />
              </button>
            ) : (
              <Link
                to="/clients"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-red px-4 py-2 text-sm font-semibold text-white"
              >
                Create Workspace
              </Link>
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  full = false,
  as,
  options,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  full?: boolean;
  as?: "select";
  options?: string[];
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {as === "select" ? (
        <select className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-accent outline-none">
          {options?.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-accent outline-none"
        />
      )}
    </label>
  );
}
