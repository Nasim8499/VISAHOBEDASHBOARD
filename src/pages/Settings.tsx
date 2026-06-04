import { PageContainer, PageHeader } from "@/components/layout/Page";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, Palette, Bell, Shield, Save, Check } from "lucide-react";
import { applyBrandTheme, loadBrandTheme, saveBrandTheme } from "@/lib/brandTheme";

const BRAND_PRESETS = [
  { name: "Ocean", primary: "#003B73", accent: "#177BBB" },
  { name: "Emerald", primary: "#064e3b", accent: "#10b981" },
  { name: "Sunset", primary: "#7c2d12", accent: "#f97316" },
  { name: "Royal", primary: "#312e81", accent: "#8b5cf6" },
  { name: "Rose", primary: "#831843", accent: "#ec4899" },
  { name: "Noir Gold", primary: "#0d0d0d", accent: "#c9a84c" },
  { name: "Cyber", primary: "#0c2340", accent: "#2dd4a8" },
  { name: "Coral", primary: "#574b90", accent: "#ff6b6b" },
];

const ease = [0.22, 1, 0.36, 1] as const;

type Field =
  | { l: string; v: string; type?: "text" }
  | { l: string; v: boolean; type: "toggle" }
  | { l: string; v: string; type: "color" };

type Group = { title: string; icon: typeof Building2; tone: string; fields: Field[] };

const initial: Group[] = [
  {
    title: "Company Profile",
    icon: Building2,
    tone: "bg-gradient-blue",
    fields: [
      { l: "Company Name", v: "VisaHOBe PTE. LTD." },
      { l: "Email", v: "admin@visahobe.com" },
      { l: "Country", v: "Singapore" },
      { l: "Phone", v: "+65 6123 4567" },
    ],
  },
  {
    title: "Brand Theme",
    icon: Palette,
    tone: "bg-accent",
    fields: [
      { l: "Primary Color", v: loadBrandTheme().primary, type: "color" },
      { l: "Accent Color", v: loadBrandTheme().accent, type: "color" },
      { l: "Font", v: "Inter" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    tone: "bg-success",
    fields: [
      { l: "Email alerts", v: true, type: "toggle" },
      { l: "Approval reminders", v: true, type: "toggle" },
      { l: "Weekly reports", v: true, type: "toggle" },
      { l: "Marketing emails", v: false, type: "toggle" },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    tone: "bg-gradient-red",
    fields: [
      { l: "Two-factor auth", v: true, type: "toggle" },
      { l: "Session timeout (min)", v: "30" },
    ],
  },
];

export default function Settings() {
  const [groups, setGroups] = useState(initial);
  const [active, setActive] = useState(0);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const update = (gi: number, fi: number, v: string | boolean) => {
    setGroups((p) =>
      p.map((g, i) =>
        i === gi ? { ...g, fields: g.fields.map((f, j) => (j === fi ? ({ ...f, v } as Field) : f)) } : g,
      ),
    );
  };

  // Live-apply brand theme as user tweaks colors
  const brand = groups.find((g) => g.title === "Brand Theme");
  const primary = (brand?.fields[0].v as string) || "#003B73";
  const accent = (brand?.fields[1].v as string) || "#177BBB";
  useEffect(() => { applyBrandTheme({ primary, accent }); }, [primary, accent]);

  const applyPreset = (p: { primary: string; accent: string }) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.title === "Brand Theme"
          ? { ...g, fields: g.fields.map((f) =>
              f.l === "Primary Color" ? { ...f, v: p.primary } as Field :
              f.l === "Accent Color"  ? { ...f, v: p.accent  } as Field : f) }
          : g,
      ),
    );
  };

  const save = () => {
    saveBrandTheme({ primary, accent });
    setSavedAt(Date.now());
    toast.success("Settings saved", { description: "Theme applied across the app." });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        subtitle="Manage company profile, branding, notifications and security."
        actions={
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={save}
            className="tap inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant hover:shadow-glow"
          >
            {savedAt && Date.now() - savedAt < 2000 ? <Check className="size-4" /> : <Save className="size-4" />}
            {savedAt && Date.now() - savedAt < 2000 ? "Saved" : "Save changes"}
          </motion.button>
        }
      />

      {/* Section tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {groups.map((g, i) => {
          const Icon = g.icon;
          return (
            <button
              key={g.title}
              onClick={() => setActive(i)}
              className={`tap inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                active === i
                  ? "border-transparent bg-gradient-blue text-white shadow-elegant"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <Icon className="size-3.5" /> {g.title}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {groups.map((g, gi) => {
          const Icon = g.icon;
          return (
            <motion.section
              key={g.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease, delay: gi * 0.05 }}
              className={`relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition lg:col-span-1 ${
                active === gi ? "border-accent shadow-elegant" : "border-border"
              }`}
            >
              <div className={`pointer-events-none absolute -right-10 -top-10 size-32 rounded-full ${g.tone} opacity-10 blur-3xl`} />
              <div className="mb-4 flex items-center gap-3">
                <div className={`grid size-10 place-items-center rounded-xl ${g.tone} text-white shadow-elegant`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold">{g.title}</h3>
                  <p className="text-xs text-muted-foreground">{g.fields.length} settings</p>
                </div>
              </div>
              <div className="space-y-3">
                {g.fields.map((f, fi) => (
                  <div key={f.l} className="flex items-center justify-between gap-3">
                    <label className="text-sm text-muted-foreground">{f.l}</label>
                    {f.type === "toggle" ? (
                      <button
                        role="switch"
                        aria-checked={f.v as boolean}
                        onClick={() => update(gi, fi, !(f.v as boolean))}
                        className={`relative h-6 w-11 rounded-full transition ${f.v ? "bg-gradient-blue" : "bg-muted"}`}
                      >
                        <motion.span
                          layout
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className={`absolute top-0.5 size-5 rounded-full bg-white shadow ${f.v ? "right-0.5" : "left-0.5"}`}
                        />
                      </button>
                    ) : f.type === "color" ? (
                      <div className="flex w-2/3 items-center gap-2">
                        <input
                          type="color"
                          value={f.v as string}
                          onChange={(e) => update(gi, fi, e.target.value)}
                          className="size-10 cursor-pointer rounded-lg border border-border bg-background"
                        />
                        <input
                          value={f.v as string}
                          onChange={(e) => update(gi, fi, e.target.value)}
                          className="h-10 flex-1 rounded-lg border border-border bg-background px-3 font-mono text-xs outline-none focus:border-accent"
                        />
                      </div>
                    ) : (
                      <input
                        value={f.v as string}
                        onChange={(e) => update(gi, fi, e.target.value)}
                        className="h-10 w-2/3 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </PageContainer>
  );
}
