import { forwardRef } from "react";
import { DocLang, DOC_LANGS, tr } from "@/lib/i18n-docs";

export interface PrintSheetProps {
  lang: DocLang;
  title: string;
  reference: string;
  workspaceName: string;
  workspaceLogo?: string;
  preparedFor?: string;
  preparedBy?: string;
  category?: string;
  size?: string;
  status?: string;
  body?: React.ReactNode;
}

// Renders an A4 sheet (210mm wide, height grows with content).
// Used both for on-screen preview and as the DOM source for jsPDF.
export const PrintSheet = forwardRef<HTMLDivElement, PrintSheetProps>(function PrintSheet(
  { lang, title, reference, workspaceName, workspaceLogo, preparedFor, preparedBy, category, size, status, body },
  ref
) {
  const meta = DOC_LANGS.find((l) => l.code === lang)!;
  const dir = meta.rtl ? "rtl" : "ltr";
  const today = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : lang, { dateStyle: "long" }).format(new Date());
  const accent = templateAccent(category);

  return (
    <div
      ref={ref}
      dir={dir}
      lang={lang}
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "18mm 16mm 26mm",
        background: "#ffffff",
        color: "#0f172a",
        fontFamily: meta.font,
        fontSize: "11pt",
        lineHeight: 1.55,
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `2px solid ${accent}`,
          paddingBottom: "8mm",
          marginBottom: "10mm",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {workspaceLogo ? (
            <img src={workspaceLogo} alt="" crossOrigin="anonymous" style={{ width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover" }} />
          ) : (
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "8px",
                background: `linear-gradient(135deg, ${accent}, #0f172a)`,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: "14pt",
              }}
            >
              {workspaceName.charAt(0)}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: "13pt", letterSpacing: "-0.01em" }}>{workspaceName}</div>
            <div style={{ fontSize: "9pt", color: accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {category || tr("document", lang)}
            </div>
          </div>
        </div>
        <div style={{ textAlign: meta.rtl ? "left" : "right", fontSize: "9pt", color: "#475569" }}>
          <div>{tr("reference", lang)}: <b style={{ color: "#0f172a" }}>{reference}</b></div>
          <div>{tr("date", lang)}: <b style={{ color: "#0f172a" }}>{today}</b></div>
        </div>
      </header>

      {/* Title */}
      <h1
        style={{
          fontSize: "26pt",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          margin: "0 0 6mm",
          lineHeight: 1.1,
        }}
      >
        {title}
      </h1>

      {/* Meta grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4mm 8mm",
          padding: "5mm 6mm",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          marginBottom: "8mm",
          fontSize: "10pt",
          breakInside: "avoid",
        }}
      >
        {preparedFor && <Field label={tr("preparedFor", lang)} value={preparedFor} />}
        {preparedBy && <Field label={tr("preparedBy", lang)} value={preparedBy} />}
        {category && <Field label={tr("category", lang)} value={category} />}
        {size && <Field label={tr("size", lang)} value={size} />}
        {status && <Field label={tr("status", lang)} value={status} />}
      </div>

      {/* Body — category-aware template */}
      <section style={{ fontSize: "11pt" }}>
        {body ?? <CategoryTemplate category={category} lang={lang} accent={accent} preparedFor={preparedFor} reference={reference} />}
      </section>

      {/* Footer */}
      <footer
        style={{
          position: "absolute",
          left: "16mm",
          right: "16mm",
          bottom: "10mm",
          borderTop: "1px solid #e2e8f0",
          paddingTop: "4mm",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "8.5pt",
          color: "#64748b",
        }}
      >
        <span>{tr("confidential", lang)}</span>
        <span>{workspaceName} · {reference}</span>
      </footer>
    </div>
  );
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "8.5pt", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontWeight: 600, color: "#0f172a", marginTop: "1mm" }}>{value}</div>
    </div>
  );
}

function templateAccent(category?: string): string {
  switch ((category || "").toLowerCase()) {
    case "branding": return "#7c3aed";
    case "legal": return "#0f172a";
    case "invoice": return "#059669";
    case "marketing": return "#ea580c";
    default: return "#2563eb";
  }
}

function SectionTitle({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <h2 style={{ fontSize: "13pt", fontWeight: 700, margin: "6mm 0 3mm", color: accent, breakAfter: "avoid" }}>
      {children}
    </h2>
  );
}

function CategoryTemplate({
  category, lang, accent, preparedFor, reference,
}: { category?: string; lang: DocLang; accent: string; preparedFor?: string; reference: string }) {
  const cat = (category || "").toLowerCase();
  if (cat === "branding") return <BrandingTemplate lang={lang} accent={accent} />;
  if (cat === "legal") return <LegalTemplate lang={lang} accent={accent} preparedFor={preparedFor} />;
  if (cat === "invoice") return <InvoiceTemplate lang={lang} accent={accent} preparedFor={preparedFor} reference={reference} />;
  if (cat === "marketing") return <MarketingTemplate lang={lang} accent={accent} />;
  return (
    <>
      <SectionTitle accent={accent}>{tr("summary", lang)}</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>{tr("summaryBody", lang)}</p>
    </>
  );
}

/* ---------- Branding ---------- */
function BrandingTemplate({ lang, accent }: { lang: DocLang; accent: string }) {
  const palette = ["#0f172a", accent, "#f59e0b", "#f8fafc"];
  return (
    <>
      <SectionTitle accent={accent}>Brand Overview</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        This brand document captures the visual and verbal identity guidelines for the workspace, including logo usage,
        color palette, typography, and tone of voice. {tr("summaryBody", lang)}
      </p>

      <SectionTitle accent={accent}>Color Palette</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4mm", breakInside: "avoid" }}>
        {palette.map((c) => (
          <div key={c} style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ background: c, height: "22mm" }} />
            <div style={{ padding: "2mm 3mm", fontSize: "9pt", color: "#475569" }}>{c.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <SectionTitle accent={accent}>Typography</SectionTitle>
      <div style={{ display: "grid", gap: "3mm", color: "#334155" }}>
        <div><b>Display</b> — Inter Bold · 36pt · for hero headlines</div>
        <div><b>Headings</b> — Inter SemiBold · 18–24pt</div>
        <div><b>Body</b> — Inter Regular · 11pt · 1.55 line-height</div>
      </div>

      <SectionTitle accent={accent}>Logo Usage</SectionTitle>
      <ul style={{ margin: 0, paddingInlineStart: "5mm", color: "#334155" }}>
        <li>Maintain a clear-space equal to the height of the mark.</li>
        <li>Do not stretch, recolor or apply effects to the primary logo.</li>
        <li>Use the inverted lockup on dark backgrounds only.</li>
      </ul>
    </>
  );
}

/* ---------- Legal ---------- */
function LegalTemplate({ lang, accent, preparedFor }: { lang: DocLang; accent: string; preparedFor?: string }) {
  return (
    <>
      <SectionTitle accent={accent}>Parties</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        This agreement is entered into between <b>{preparedFor || "the Client"}</b> ("Client") and VisaHOBe Operations ("Provider").
      </p>

      <SectionTitle accent={accent}>1. Scope of Work</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        The Provider shall deliver services described in the attached scope and any subsequent statements of work, subject to the
        terms set forth herein. {tr("summaryBody", lang)}
      </p>

      <SectionTitle accent={accent}>2. Confidentiality</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        Each party shall protect the other's confidential information using no less than reasonable care, for a period of three (3) years.
      </p>

      <SectionTitle accent={accent}>3. Term & Termination</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        This agreement remains in effect until terminated by either party with thirty (30) days written notice.
      </p>

      <div style={{ marginTop: "12mm", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10mm", breakInside: "avoid" }}>
        <SignatureBlock label="Client" />
        <SignatureBlock label="Provider" />
      </div>
    </>
  );
}

function SignatureBlock({ label }: { label: string }) {
  return (
    <div>
      <div style={{ borderBottom: "1px solid #0f172a", height: "16mm" }} />
      <div style={{ fontSize: "9pt", color: "#475569", marginTop: "2mm" }}>{label} signature · Date</div>
    </div>
  );
}

/* ---------- Invoice ---------- */
function InvoiceTemplate({ lang, accent, preparedFor, reference }: { lang: DocLang; accent: string; preparedFor?: string; reference: string }) {
  const items = [
    { desc: "Brand strategy & discovery", qty: 1, rate: 1200 },
    { desc: "Logo & visual identity system", qty: 1, rate: 1800 },
    { desc: "Marketing collateral (10 assets)", qty: 10, rate: 95 },
    { desc: "Project management", qty: 6, rate: 75 },
  ];
  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;
  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8mm", marginBottom: "4mm" }}>
        <div>
          <div style={{ fontSize: "8.5pt", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>Bill to</div>
          <div style={{ fontWeight: 700, marginTop: "1mm" }}>{preparedFor || "Client"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "8.5pt", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>Invoice #</div>
          <div style={{ fontWeight: 700, marginTop: "1mm" }}>{reference}</div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "4mm" }}>
        <thead>
          <tr style={{ background: "#f1f5f9", color: "#475569", fontSize: "9pt", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <th style={th}>Description</th>
            <th style={{ ...th, width: "20mm", textAlign: "right" }}>Qty</th>
            <th style={{ ...th, width: "28mm", textAlign: "right" }}>Rate</th>
            <th style={{ ...th, width: "30mm", textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td style={td}>{i.desc}</td>
              <td style={{ ...td, textAlign: "right" }}>{i.qty}</td>
              <td style={{ ...td, textAlign: "right" }}>{fmt(i.rate)}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{fmt(i.qty * i.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "6mm", marginInlineStart: "auto", width: "70mm", fontSize: "10.5pt", breakInside: "avoid" }}>
        <Row label="Subtotal" value={fmt(subtotal)} />
        <Row label="Tax (5%)" value={fmt(tax)} />
        <div style={{ borderTop: `2px solid ${accent}`, marginTop: "2mm", paddingTop: "2mm" }}>
          <Row label="Total due" value={fmt(total)} bold accent={accent} />
        </div>
      </div>

      <SectionTitle accent={accent}>Payment Terms</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        Payment is due within 14 days of issue. Late payments may be subject to a 1.5% monthly service charge.
      </p>
    </>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: "3mm 3mm", fontWeight: 600 };
const td: React.CSSProperties = { padding: "3mm 3mm", color: "#334155", fontSize: "10.5pt", verticalAlign: "top" };

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "1.5mm 0", color: accent || "#0f172a", fontWeight: bold ? 800 : 500 }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ---------- Marketing ---------- */
function MarketingTemplate({ lang, accent }: { lang: DocLang; accent: string }) {
  return (
    <>
      <SectionTitle accent={accent}>Campaign Goals</SectionTitle>
      <ul style={{ margin: 0, paddingInlineStart: "5mm", color: "#334155" }}>
        <li>Increase qualified leads by 35% within the quarter.</li>
        <li>Grow social engagement across primary channels by 50%.</li>
        <li>Establish thought leadership in the local market.</li>
      </ul>

      <SectionTitle accent={accent}>Channels & Deliverables</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm", breakInside: "avoid" }}>
        {[
          { c: "Instagram", d: "12 posts, 8 reels, 20 stories" },
          { c: "LinkedIn", d: "6 thought-leadership articles" },
          { c: "Email", d: "Bi-weekly newsletter to 5k subs" },
          { c: "Paid Ads", d: "Meta + Google search, $2k budget" },
        ].map((x) => (
          <div key={x.c} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "3mm 4mm" }}>
            <div style={{ fontWeight: 700, color: accent }}>{x.c}</div>
            <div style={{ color: "#475569", fontSize: "10pt", marginTop: "1mm" }}>{x.d}</div>
          </div>
        ))}
      </div>

      <SectionTitle accent={accent}>Timeline</SectionTitle>
      <ul style={{ margin: 0, paddingInlineStart: "5mm", color: "#334155" }}>
        <li><b>Week 1–2:</b> Strategy, audience research, asset planning.</li>
        <li><b>Week 3–5:</b> Production of creative assets and copy.</li>
        <li><b>Week 6–10:</b> Live campaign, weekly optimisation.</li>
        <li><b>Week 11–12:</b> Reporting, learnings, next-quarter plan.</li>
      </ul>

      <SectionTitle accent={accent}>KPIs</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        CTR, CPL, CAC, engagement rate, and pipeline contribution will be tracked weekly and summarised in the monthly report.
      </p>
    </>
  );
}
