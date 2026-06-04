import { PageContainer, PageHeader } from "@/components/layout/Page";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import {
  Plane, Briefcase, GraduationCap, Globe2, FileCheck2,
  ClipboardList, Mail, Building2, ShieldCheck, Stamp, Eye, Download, Search,
  CheckSquare, Square, FileArchive, X, Loader2,
} from "lucide-react";
import { PrintPreviewModal } from "@/components/print/PrintPreviewModal";
import { BatchExportModal } from "@/components/print/BatchExportModal";
import { renderSheetToPdfBlob, saveBlob, sanitizeFilename } from "@/lib/pdfExport";
import { useWorkspace } from "@/context/WorkspaceContext";

type VisaDoc = {
  id: string;
  ref: string;
  title: string;
  subtitle: string;
  category: "Visitor" | "Work" | "Student" | "Business" | "General";
  pages: number;
  icon: any;
  tone: string; // gradient tail
  body: React.ReactNode;
};

const tone = (from: string, to: string) =>
  `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;

/* ---------------- A4 body templates (print-ready inline styles) ---------------- */

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: "6mm" }}>
    <div
      style={{
        fontSize: "10pt",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: "#0f3a6b",
        borderBottom: "1px solid #cbd5e1",
        paddingBottom: "1.5mm",
        marginBottom: "2.5mm",
      }}
    >
      {title}
    </div>
    <div style={{ fontSize: "10.5pt", color: "#1e293b" }}>{children}</div>
  </div>
);

const Row = ({ l, v }: { l: string; v: string }) => (
  <div style={{ display: "flex", padding: "1.2mm 0", borderBottom: "1px dotted #e2e8f0" }}>
    <div style={{ width: "55mm", color: "#64748b", fontSize: "10pt" }}>{l}</div>
    <div style={{ flex: 1, fontWeight: 600 }}>{v || "—"}</div>
  </div>
);

const FormBody = ({ kind, fields, checklist }: { kind: string; fields: [string, string][]; checklist?: string[] }) => (
  <div>
    <Section title={`${kind} — Applicant Details`}>
      {fields.map(([l, v]) => <Row key={l} l={l} v={v} />)}
    </Section>
    <Section title="Travel & Purpose">
      <Row l="Purpose of Visit" v="As stated in the application narrative" />
      <Row l="Intended Date of Entry" v="—" />
      <Row l="Intended Duration" v="—" />
      <Row l="Port of Entry" v="—" />
    </Section>
    <Section title="Sponsor / Host">
      <Row l="Sponsor Name" v="—" />
      <Row l="Relationship" v="—" />
      <Row l="Contact Number" v="—" />
      <Row l="Address" v="—" />
    </Section>
    {checklist && (
      <Section title="Mandatory Documents">
        <ul style={{ paddingLeft: "5mm", margin: 0 }}>
          {checklist.map((c) => (
            <li key={c} style={{ marginBottom: "1.2mm" }}>☐ {c}</li>
          ))}
        </ul>
      </Section>
    )}
    <Section title="Declaration">
      <p style={{ margin: 0 }}>
        I hereby declare that the information furnished above is true, complete and
        correct to the best of my knowledge and belief. I understand that any
        false statement or concealment of material fact may result in refusal of
        visa and / or other legal action under the applicable immigration laws.
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12mm" }}>
        <div>
          <div style={{ borderTop: "1px solid #0f172a", width: "60mm", paddingTop: "1.5mm", fontSize: "9.5pt", color: "#64748b" }}>
            Applicant signature
          </div>
        </div>
        <div>
          <div style={{ borderTop: "1px solid #0f172a", width: "55mm", paddingTop: "1.5mm", fontSize: "9.5pt", color: "#64748b" }}>
            Date
          </div>
        </div>
      </div>
    </Section>
  </div>
);

const LetterBody = ({ subject, paragraphs, signatory }: { subject: string; paragraphs: string[]; signatory: string }) => (
  <div>
    <div style={{ fontSize: "10pt", color: "#475569", marginBottom: "8mm" }}>
      To: <strong>The Visa Officer</strong><br />
      Embassy / Consulate of the Destination Country
    </div>
    <div style={{ fontSize: "11pt", fontWeight: 700, marginBottom: "6mm", color: "#0f3a6b" }}>
      Subject: {subject}
    </div>
    {paragraphs.map((p, i) => (
      <p key={i} style={{ marginBottom: "4mm", textAlign: "justify" }}>{p}</p>
    ))}
    <p style={{ marginTop: "10mm" }}>Sincerely,</p>
    <div style={{ marginTop: "12mm", borderTop: "1px solid #0f172a", width: "60mm", paddingTop: "1.5mm", fontSize: "10pt" }}>
      {signatory}
    </div>
  </div>
);

const ItineraryBody = () => (
  <div>
    <Section title="Day-by-Day Travel Itinerary">
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
        <thead>
          <tr style={{ background: "#f1f5f9", color: "#0f3a6b" }}>
            <th style={{ padding: "3mm", textAlign: "left", borderBottom: "2px solid #cbd5e1" }}>Day</th>
            <th style={{ padding: "3mm", textAlign: "left", borderBottom: "2px solid #cbd5e1" }}>Date</th>
            <th style={{ padding: "3mm", textAlign: "left", borderBottom: "2px solid #cbd5e1" }}>City</th>
            <th style={{ padding: "3mm", textAlign: "left", borderBottom: "2px solid #cbd5e1" }}>Plan</th>
            <th style={{ padding: "3mm", textAlign: "left", borderBottom: "2px solid #cbd5e1" }}>Stay</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 7 }).map((_, i) => (
            <tr key={i}>
              <td style={{ padding: "2.5mm", borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>Day {i + 1}</td>
              <td style={{ padding: "2.5mm", borderBottom: "1px solid #e2e8f0" }}>—</td>
              <td style={{ padding: "2.5mm", borderBottom: "1px solid #e2e8f0" }}>—</td>
              <td style={{ padding: "2.5mm", borderBottom: "1px solid #e2e8f0" }}>Sightseeing / meetings</td>
              <td style={{ padding: "2.5mm", borderBottom: "1px solid #e2e8f0" }}>—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
    <Section title="Flight Bookings">
      <Row l="Outbound Flight" v="—" />
      <Row l="Return Flight" v="—" />
      <Row l="PNR / Booking Ref" v="—" />
    </Section>
    <Section title="Accommodation">
      <Row l="Hotel / Host Name" v="—" />
      <Row l="Address" v="—" />
      <Row l="Check-in / Check-out" v="—" />
    </Section>
  </div>
);

const ChecklistBody = ({ items }: { items: string[] }) => (
  <div>
    <Section title="Required Documents Checklist">
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5pt" }}>
        <thead>
          <tr style={{ background: "#f1f5f9", color: "#0f3a6b" }}>
            <th style={{ padding: "3mm", textAlign: "left", width: "10mm" }}>#</th>
            <th style={{ padding: "3mm", textAlign: "left" }}>Document</th>
            <th style={{ padding: "3mm", textAlign: "center", width: "18mm" }}>Required</th>
            <th style={{ padding: "3mm", textAlign: "center", width: "18mm" }}>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td style={{ padding: "2.5mm", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>{i + 1}</td>
              <td style={{ padding: "2.5mm", borderBottom: "1px solid #e2e8f0" }}>{it}</td>
              <td style={{ padding: "2.5mm", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>✔</td>
              <td style={{ padding: "2.5mm", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>☐</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
    <Section title="Notes">
      <p style={{ margin: 0 }}>
        All photocopies must be self-attested. Originals are required at the time
        of biometrics & interview. Documents in languages other than English must
        be accompanied by certified translations.
      </p>
    </Section>
  </div>
);

const baseFields: [string, string][] = [
  ["Full Name (as in passport)", "—"],
  ["Date of Birth", "—"],
  ["Nationality", "—"],
  ["Passport Number", "—"],
  ["Passport Issue / Expiry", "—"],
  ["Permanent Address", "—"],
  ["Phone / Email", "—"],
  ["Occupation", "—"],
];

export const VISA_DOCS: VisaDoc[] = [
  {
    id: "v1", ref: "VISA-VTR-001",
    title: "Visitor Visa Application Form",
    subtitle: "Short-stay tourist / family visit",
    category: "Visitor", pages: 2, icon: Plane,
    tone: tone("#0ea5e9", "#1e3a8a"),
    body: <FormBody kind="Visitor Visa" fields={baseFields} checklist={["Passport (6+ months validity)","2 recent photographs","Bank statement (6 months)","Travel insurance","Confirmed flight & hotel bookings"]} />,
  },
  {
    id: "v2", ref: "VISA-VTR-002",
    title: "Visitor Visa Cover Letter",
    subtitle: "Statement of purpose for tourism",
    category: "Visitor", pages: 1, icon: Mail,
    tone: tone("#06b6d4", "#0f3a6b"),
    body: <LetterBody
      subject="Application for Visitor Visa"
      signatory="Applicant Signature"
      paragraphs={[
        "I am writing to formally apply for a visitor visa for the purpose of tourism and sightseeing. I intend to travel for a short duration, after which I shall return to my home country where I have stable employment and family commitments.",
        "Attached with this application are all the supporting documents including my valid passport, financial statements demonstrating sufficient funds, confirmed return air tickets, hotel reservations, and a comprehensive day-by-day itinerary.",
        "I assure the consulate that I shall abide by all immigration regulations during my stay and shall depart strictly within the validity of my visa. I kindly request you to grant me a visitor visa at the earliest convenience.",
      ]}
    />,
  },
  {
    id: "v3", ref: "VISA-VTR-003",
    title: "Invitation Letter (Host)",
    subtitle: "Family / friend invitation for visit",
    category: "Visitor", pages: 1, icon: Stamp,
    tone: tone("#22d3ee", "#1e40af"),
    body: <LetterBody
      subject="Invitation Letter for Visitor Visa Application"
      signatory="Host Signature"
      paragraphs={[
        "I, the undersigned, a lawful resident of the destination country, do hereby cordially invite the applicant named on this application to visit me during the stated period.",
        "I confirm that the applicant will reside at my residential address during their entire stay, and I undertake full financial and moral responsibility for their accommodation, local travel, and timely departure.",
        "Enclosed please find copies of my identification document, proof of legal residence, and recent utility bill confirming address. I kindly request the consulate to favourably consider this application.",
      ]}
    />,
  },
  {
    id: "v4", ref: "VISA-TUR-004",
    title: "Tourist Itinerary (7-Day Plan)",
    subtitle: "Day-by-day travel plan & bookings",
    category: "Visitor", pages: 2, icon: Globe2,
    tone: tone("#14b8a6", "#0f3a6b"),
    body: <ItineraryBody />,
  },
  {
    id: "v5", ref: "VISA-WRK-005",
    title: "Work Visa Application Form",
    subtitle: "Skilled employment / long-stay",
    category: "Work", pages: 3, icon: Briefcase,
    tone: tone("#6366f1", "#1e1b4b"),
    body: <FormBody kind="Work Visa" fields={baseFields} checklist={["Valid passport","Employer offer letter","Educational certificates","Experience letters","Police clearance certificate","Medical fitness report"]} />,
  },
  {
    id: "v6", ref: "VISA-WRK-006",
    title: "Employer Offer Letter",
    subtitle: "Formal job offer for visa",
    category: "Work", pages: 1, icon: Building2,
    tone: tone("#8b5cf6", "#1e1b4b"),
    body: <LetterBody
      subject="Offer of Employment & Sponsorship Confirmation"
      signatory="Authorised Signatory · HR Department"
      paragraphs={[
        "We are pleased to formally extend an offer of employment to the candidate named on this application for the position specified, commencing on the mutually agreed joining date.",
        "This appointment is contingent on the successful grant of an appropriate work visa. The company shall sponsor the visa application and bear all associated processing and relocation costs as per company policy.",
        "Details of remuneration, benefits, working hours, and contractual obligations are enclosed in the attached employment contract. We kindly request the consular authority to consider this application favourably.",
      ]}
    />,
  },
  {
    id: "v7", ref: "VISA-WRK-007",
    title: "Sponsorship Declaration",
    subtitle: "Financial sponsorship for work visa",
    category: "Work", pages: 1, icon: ShieldCheck,
    tone: tone("#a855f7", "#312e81"),
    body: <LetterBody
      subject="Declaration of Financial & Legal Sponsorship"
      signatory="Authorised Signatory · Sponsor"
      paragraphs={[
        "The undersigned hereby confirms full sponsorship of the applicant for the duration of the proposed employment, including accommodation, healthcare, and timely return travel at the conclusion of the engagement.",
        "Audited financial statements, business registration certificate, and confirmation of payroll capacity are enclosed. The sponsor undertakes to comply with all reporting obligations as required by the relevant immigration authority.",
      ]}
    />,
  },
  {
    id: "v8", ref: "VISA-STU-008",
    title: "Student Visa Application",
    subtitle: "Higher education enrolment",
    category: "Student", pages: 2, icon: GraduationCap,
    tone: tone("#f59e0b", "#92400e"),
    body: <FormBody kind="Student Visa" fields={baseFields} checklist={["Admission / I-20 letter","Tuition payment receipt","Academic transcripts","English proficiency test","Statement of purpose","Proof of funds / scholarship"]} />,
  },
  {
    id: "v9", ref: "VISA-BIZ-009",
    title: "Business Visa Application",
    subtitle: "Conference, meetings, trade",
    category: "Business", pages: 2, icon: Briefcase,
    tone: tone("#ef4444", "#7f1d1d"),
    body: <FormBody kind="Business Visa" fields={baseFields} checklist={["Invitation letter from host company","Company introduction letter","GST / incorporation documents","Bank statements (12 months)","Confirmed return tickets","Meeting agenda / schedule"]} />,
  },
  {
    id: "v10", ref: "VISA-CHK-010",
    title: "Master Document Checklist",
    subtitle: "All-purpose visa document tracker",
    category: "General", pages: 2, icon: ClipboardList,
    tone: tone("#0f172a", "#1e293b"),
    body: <ChecklistBody items={[
      "Passport (original + 2 copies)",
      "Visa application form (signed)",
      "Passport-size photographs (2)",
      "Cover letter",
      "Invitation / offer letter",
      "Bank statement (6 months)",
      "Income Tax Returns (last 3 years)",
      "Salary slips (last 3 months)",
      "Travel insurance",
      "Flight reservation",
      "Hotel reservation",
      "Itinerary",
      "Educational certificates",
      "Employment letter",
      "Medical fitness report",
      "Police clearance certificate",
    ]} />,
  },
];

const CATEGORIES = ["All", "Visitor", "Work", "Student", "Business", "General"] as const;

export default function VisaDocuments() {
  const { workspace } = useWorkspace();
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<VisaDoc | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);

  const docs = VISA_DOCS.filter((d) =>
    (filter === "All" || d.category === filter) &&
    (q === "" || d.title.toLowerCase().includes(q.toLowerCase()) || d.ref.toLowerCase().includes(q.toLowerCase()))
  );

  const sheetCommon = {
    workspaceName: workspace?.name || "VisaHOBe",
    workspaceLogo: workspace?.logo || "🛂",
    preparedFor: workspace?.name || "Client",
    preparedBy: (workspace as any)?.manager_name || "VisaHOBe Consultant",
    workspace: workspace as any,
  };

  const togglePick = (id: string) => {
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const pickAllVisible = () => setPicked(new Set(docs.map((d) => d.id)));
  const clearPicks = () => setPicked(new Set());

  async function quickDownload(d: VisaDoc) {
    setDownloadingId(d.id);
    const t = toast.loading(`Preparing ${d.title}…`);
    try {
      const { blob, filename } = await renderSheetToPdfBlob(
        {
          ...sheetCommon, lang: "en", title: d.title, reference: d.ref, category: d.category,
          body: d.body, size: `A4 · ${d.pages}p`, status: "Print Ready",
        } as any,
        { paperSize: "A4", orientation: "portrait", marginMm: 0, filename: sanitizeFilename(`${d.ref}-${d.title}`) },
      );
      saveBlob(blob, filename);
      toast.success("PDF downloaded", { id: t });
    } catch (err: any) {
      toast.error("Download failed", { id: t, description: err?.message || String(err) });
    } finally {
      setDownloadingId(null);
    }
  }

  const pickedDocs = VISA_DOCS.filter((d) => picked.has(d.id));

  return (
    <PageContainer>
      <PageHeader
        title="Visa Documents"
        subtitle="Print-ready A4 templates for visitor, work, student & business visas."
        actions={
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search visa templates…"
              className="w-56 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        }
      />

      {/* Stat ribbon */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        {[
          { l: "Templates", v: VISA_DOCS.length, icon: FileCheck2, tint: "from-sky-500 to-blue-900" },
          { l: "Visitor Visa", v: VISA_DOCS.filter((d) => d.category === "Visitor").length, icon: Plane, tint: "from-cyan-500 to-indigo-900" },
          { l: "Work Visa", v: VISA_DOCS.filter((d) => d.category === "Work").length, icon: Briefcase, tint: "from-violet-500 to-indigo-900" },
          { l: "Other", v: VISA_DOCS.filter((d) => !["Visitor", "Work"].includes(d.category)).length, icon: ClipboardList, tint: "from-slate-700 to-slate-900" },
        ].map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className={`pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br ${s.tint} opacity-15 blur-2xl`} />
            <div className="flex items-center gap-3">
              <span className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${s.tint} text-white shadow-elegant`}>
                <s.icon className="size-5" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.l}</div>
                <div className="font-display text-2xl font-bold">{s.v}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <motion.button
            key={c}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === c
                ? "border-transparent bg-gradient-to-r from-[hsl(220_85%_22%)] to-[hsl(225_80%_35%)] text-white shadow-elegant"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {c}
          </motion.button>
        ))}
      </div>

      {/* Batch selection toolbar */}
      {picked.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-gradient-to-r from-[hsl(var(--primary))/0.08] to-[hsl(var(--accent))/0.10] p-3 shadow-sm"
        >
          <div className="flex items-center gap-2 text-sm">
            <CheckSquare className="size-4 text-[hsl(var(--accent))]" />
            <span className="font-bold">{picked.size}</span> template{picked.size === 1 ? "" : "s"} selected
            <button onClick={pickAllVisible} className="ml-2 text-xs font-semibold text-[hsl(var(--accent))] hover:underline">
              Select all visible
            </button>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setBatchOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-4 py-2 text-xs font-bold text-white shadow-elegant hover:shadow-glow"
            >
              <FileArchive className="size-3.5" /> Batch download
            </motion.button>
            <button
              onClick={clearPicks}
              className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              <X className="size-3.5" /> Clear
            </button>
          </div>
        </motion.div>
      )}

      {/* Card grid */}
      <motion.div
        layout
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {docs.map((d, i) => {
          const Icon = d.icon;
          const isPicked = picked.has(d.id);
          const isDownloading = downloadingId === d.id;
          return (
            <motion.div
              key={d.id}
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className={`group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-elegant ${
                isPicked ? "border-[hsl(var(--accent))] ring-2 ring-[hsl(var(--accent))]/30" : "border-border"
              }`}
            >
              {/* Selection checkbox */}
              <button
                onClick={() => togglePick(d.id)}
                title={isPicked ? "Deselect" : "Select for batch download"}
                className={`absolute left-3 top-3 z-10 grid size-7 place-items-center rounded-lg backdrop-blur transition ${
                  isPicked ? "bg-[hsl(var(--accent))] text-white shadow-elegant" : "bg-white/80 text-foreground/80 hover:bg-white"
                }`}
              >
                {isPicked ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
              </button>

              {/* Cover */}
              <div className="relative h-32 overflow-hidden" style={{ background: d.tone }}>
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage:
                    "radial-gradient(800px 200px at 0% 100%, rgba(255,255,255,0.35), transparent 60%), radial-gradient(400px 200px at 100% 0%, rgba(255,255,255,0.25), transparent 60%)",
                }} />
                <div className="absolute right-3 top-3 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                  {d.category}
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{d.ref}</div>
                    <div className="text-xs font-bold opacity-90">A4 · {d.pages} page{d.pages > 1 ? "s" : ""}</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-3 p-4">
                <div>
                  <div className="font-display text-sm font-bold leading-snug">{d.title}</div>
                  <div className="text-xs text-muted-foreground">{d.subtitle}</div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelected(d)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition hover:bg-muted"
                  >
                    <Eye className="size-3.5" /> Preview
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isDownloading}
                    onClick={() => quickDownload(d)}
                    title="Download PDF directly"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:shadow-elegant disabled:opacity-70"
                  >
                    {isDownloading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                    {isDownloading ? "Saving…" : "PDF"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {docs.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No visa templates match your search.
        </div>
      )}

      <PrintPreviewModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ""}
        reference={selected?.ref ?? ""}
        workspaceName={workspace?.name || "VisaHOBe"}
        workspaceLogo={workspace?.logo || "🛂"}
        preparedFor={workspace?.name || "Client"}
        preparedBy={(workspace as any)?.manager_name || "VisaHOBe Consultant"}
        category={selected?.category}
        size={`A4 · ${selected?.pages ?? 1}p`}
        status="Print Ready"
        workspace={workspace as any}
        body={selected?.body}
      />

      <BatchExportModal
        open={batchOpen}
        onClose={() => setBatchOpen(false)}
        items={pickedDocs.map((d) => ({
          id: d.id, ref: d.ref, title: d.title, category: d.category, pages: d.pages, body: d.body,
        }))}
        sheetCommon={sheetCommon as any}
        clientName={workspace?.name}
      />
    </PageContainer>
  );
}
