import { forwardRef } from "react";
import { DocLang, DOC_LANGS, tr } from "@/lib/i18n-docs";
import type { BusinessWorkspace } from "@/data/mock";

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
  workspace?: BusinessWorkspace; // real workspace data drives category templates
}

// Renders an A4 sheet (210mm wide; height grows with content).
// Internally exposes three logical regions for paginated export:
//   [data-print-header], [data-print-body], [data-print-footer]
export const PrintSheet = forwardRef<HTMLDivElement, PrintSheetProps>(function PrintSheet(
  { lang, title, reference, workspaceName, workspaceLogo, preparedFor, preparedBy, category, size, status, body, workspace },
  ref
) {
  const meta = DOC_LANGS.find((l) => l.code === lang)!;
  const dir = meta.rtl ? "rtl" : "ltr";
  const today = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : lang, { dateStyle: "long" }).format(new Date());
  const accent = workspace?.color || templateAccent(category);
  const ws = workspace;

  return (
    <div
      ref={ref}
      dir={dir}
      lang={lang}
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#ffffff",
        color: "#0f172a",
        fontFamily: meta.font,
        fontSize: "11pt",
        lineHeight: 1.55,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header — captured separately, repeated on every page */}
      <div
        data-print-header
        style={{
          padding: "14mm 16mm 6mm",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `2px solid ${accent}`,
            paddingBottom: "5mm",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {workspaceLogo && /^https?:\/\//.test(workspaceLogo) ? (
              <img
                src={workspaceLogo}
                alt=""
                crossOrigin="anonymous"
                style={{ width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover" }}
              />
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
                {workspaceLogo && workspaceLogo.length <= 4 ? workspaceLogo : workspaceName.charAt(0)}
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
            {ws && <div style={{ color: "#64748b" }}>{ws.city}, {ws.country}</div>}
          </div>
        </div>
      </div>

      {/* Body — paginated across pages */}
      <div
        data-print-body
        style={{
          padding: "4mm 16mm 6mm",
          flex: 1,
        }}
      >
        <h1 style={{ fontSize: "26pt", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6mm", lineHeight: 1.1 }}>
          {title}
        </h1>

        {/* Meta grid */}
        <div
          data-avoid-break
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
          }}
        >
          {preparedFor && <Field label={tr("preparedFor", lang)} value={preparedFor} />}
          {preparedBy && <Field label={tr("preparedBy", lang)} value={preparedBy} />}
          {category && <Field label={tr("category", lang)} value={category} />}
          {ws?.manager && <Field label="Project manager" value={ws.manager} />}
          {ws?.stage && <Field label="Current stage" value={ws.stage} />}
          {ws?.deadline && <Field label="Deadline" value={ws.deadline} />}
          {size && <Field label={tr("size", lang)} value={size} />}
          {status && <Field label={tr("status", lang)} value={status} />}
        </div>

        <section style={{ fontSize: "11pt" }}>
          {body ?? (
            <CategoryTemplate
              category={category}
              lang={lang}
              accent={accent}
              preparedFor={preparedFor}
              reference={reference}
              workspace={ws}
            />
          )}
        </section>
      </div>

      {/* Footer — captured separately, repeated on every page */}
      <div
        data-print-footer
        style={{
          padding: "4mm 16mm 10mm",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: "3mm",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "8.5pt",
            color: "#64748b",
          }}
        >
          <span>{tr("confidential", lang)}</span>
          <span>{workspaceName} · {reference}</span>
        </div>
      </div>
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
    <h2 style={{ fontSize: "13pt", fontWeight: 700, margin: "6mm 0 3mm", color: accent }}>
      {children}
    </h2>
  );
}

function CategoryTemplate({
  category, lang, accent, preparedFor, reference, workspace,
}: { category?: string; lang: DocLang; accent: string; preparedFor?: string; reference: string; workspace?: BusinessWorkspace }) {
  const cat = (category || "").toLowerCase();
  if (cat === "branding") return <BrandingTemplate lang={lang} accent={accent} workspace={workspace} />;
  if (cat === "legal") return <LegalTemplate lang={lang} accent={accent} preparedFor={preparedFor} workspace={workspace} />;
  if (cat === "invoice") return <InvoiceTemplate lang={lang} accent={accent} preparedFor={preparedFor} reference={reference} workspace={workspace} />;
  if (cat === "marketing") return <MarketingTemplate lang={lang} accent={accent} workspace={workspace} />;
  return (
    <>
      <SectionTitle accent={accent}>{tr("summary", lang)}</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>{tr("summaryBody", lang)}</p>
    </>
  );
}

/* ---------- Branding ---------- */
function BrandingTemplate({ lang, accent, workspace }: { lang: DocLang; accent: string; workspace?: BusinessWorkspace }) {
  const palette = workspace?.palette?.length ? workspace.palette : ["#0f172a", accent, "#f59e0b", "#f8fafc"];
  const fontPair = workspace?.font || "Inter Display + Inter";
  return (
    <>
      <SectionTitle accent={accent}>Brand Overview</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        Identity guidelines for <b>{workspace?.name || "the workspace"}</b>
        {workspace?.category ? ` — a ${workspace.category.toLowerCase()} brand` : ""}
        {workspace?.city ? ` based in ${workspace.city}, ${workspace.country}` : ""}.
        {workspace?.slogan ? <> Brand promise: <i>"{workspace.slogan}"</i>.</> : null}
      </p>

      <SectionTitle accent={accent}>Color Palette</SectionTitle>
      <div data-avoid-break style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(palette.length, 5)}, 1fr)`, gap: "4mm" }}>
        {palette.slice(0, 5).map((c) => (
          <div key={c} style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ background: c, height: "22mm" }} />
            <div style={{ padding: "2mm 3mm", fontSize: "9pt", color: "#475569" }}>{c.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <SectionTitle accent={accent}>Typography</SectionTitle>
      <div data-avoid-break style={{ display: "grid", gap: "3mm", color: "#334155" }}>
        <div><b>Pair</b> — {fontPair}</div>
        <div><b>Display</b> — Bold · 36pt · for hero headlines</div>
        <div><b>Headings</b> — SemiBold · 18–24pt</div>
        <div><b>Body</b> — Regular · 11pt · 1.55 line-height</div>
      </div>

      <SectionTitle accent={accent}>Logo Usage</SectionTitle>
      <ul style={{ margin: 0, paddingInlineStart: "5mm", color: "#334155" }}>
        <li>Maintain clear-space equal to the height of the mark.</li>
        <li>Do not stretch, recolor or apply effects to the primary logo.</li>
        <li>Use the inverted lockup on dark backgrounds only.</li>
        <li>Primary accent: <b style={{ color: accent }}>{accent.toUpperCase()}</b>.</li>
      </ul>
    </>
  );
}

/* ---------- Legal ---------- */
function LegalTemplate({ lang, accent, preparedFor, workspace }: { lang: DocLang; accent: string; preparedFor?: string; workspace?: BusinessWorkspace }) {
  const client = preparedFor || workspace?.name || "the Client";
  const jurisdiction = workspace?.country || "the jurisdiction of execution";
  return (
    <>
      <SectionTitle accent={accent}>Parties</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        This agreement is entered into between <b>{client}</b> ("Client"),
        {workspace?.city ? ` located in ${workspace.city}, ${workspace.country},` : ""} and
        VisaHOBe Operations ("Provider"), under the laws of <b>{jurisdiction}</b>.
      </p>

      <SectionTitle accent={accent}>1. Scope of Work</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        The Provider shall deliver services covering the <b>{workspace?.stage || "agreed"}</b> stage of the
        {workspace?.category ? ` ${workspace.category.toLowerCase()} engagement` : " engagement"}, including any
        subsequent statements of work. {tr("summaryBody", lang)}
      </p>

      <SectionTitle accent={accent}>2. Fees & Term</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        Project fees are set at <b>{workspace?.budget || "the agreed amount"}</b>, due per the payment schedule.
        Delivery is targeted for <b>{workspace?.deadline || "the agreed date"}</b>.
      </p>

      <SectionTitle accent={accent}>3. Confidentiality</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        Each party shall protect the other's confidential information using no less than reasonable care, for a period of three (3) years.
      </p>

      <SectionTitle accent={accent}>4. Termination</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        Either party may terminate with thirty (30) days written notice. Outstanding fees for delivered work remain payable.
      </p>

      <div data-avoid-break style={{ marginTop: "12mm", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10mm" }}>
        <SignatureBlock label={`Client — ${client}`} />
        <SignatureBlock label={`Provider — ${workspace?.manager || "Authorised signatory"}`} />
      </div>
    </>
  );
}

function SignatureBlock({ label }: { label: string }) {
  return (
    <div>
      <div style={{ borderBottom: "1px solid #0f172a", height: "16mm" }} />
      <div style={{ fontSize: "9pt", color: "#475569", marginTop: "2mm" }}>{label} · Signature · Date</div>
    </div>
  );
}

/* ---------- Invoice ---------- */
function InvoiceTemplate({ lang, accent, preparedFor, reference, workspace }: { lang: DocLang; accent: string; preparedFor?: string; reference: string; workspace?: BusinessWorkspace }) {
  // Derive realistic line items from workspace stage + budget.
  const budgetNum = parseBudget(workspace?.budget);
  const items = buildInvoiceItems(workspace?.stage, workspace?.category, budgetNum);
  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;
  const currency = budgetNum.currency;
  const fmt = (n: number) => `${currency}${n.toLocaleString()}`;

  return (
    <>
      <div data-avoid-break style={{ display: "flex", justifyContent: "space-between", gap: "8mm", marginBottom: "4mm" }}>
        <div>
          <div style={{ fontSize: "8.5pt", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>Bill to</div>
          <div style={{ fontWeight: 700, marginTop: "1mm" }}>{preparedFor || workspace?.name || "Client"}</div>
          {workspace && <div style={{ color: "#64748b", fontSize: "10pt" }}>{workspace.city}, {workspace.country}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "8.5pt", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>Invoice #</div>
          <div style={{ fontWeight: 700, marginTop: "1mm" }}>{reference}</div>
          {workspace?.deadline && <div style={{ color: "#64748b", fontSize: "10pt" }}>Due: {workspace.deadline}</div>}
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
            <tr key={idx} data-avoid-break style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td style={td}>{i.desc}</td>
              <td style={{ ...td, textAlign: "right" }}>{i.qty}</td>
              <td style={{ ...td, textAlign: "right" }}>{fmt(i.rate)}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{fmt(i.qty * i.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div data-avoid-break style={{ marginTop: "6mm", marginInlineStart: "auto", width: "70mm", fontSize: "10.5pt" }}>
        <Row label="Subtotal" value={fmt(subtotal)} />
        <Row label="Tax (5%)" value={fmt(tax)} />
        <div style={{ borderTop: `2px solid ${accent}`, marginTop: "2mm", paddingTop: "2mm" }}>
          <Row label="Total due" value={fmt(total)} bold accent={accent} />
        </div>
      </div>

      <SectionTitle accent={accent}>Payment Terms</SectionTitle>
      <p style={{ margin: 0, color: "#334155" }}>
        Payment is due within 14 days of issue. Late payments may be subject to a 1.5% monthly service charge.
        Project manager of record: <b>{workspace?.manager || "VisaHOBe Operations"}</b>.
      </p>
    </>
  );
}

function parseBudget(b?: string): { amount: number; currency: string } {
  if (!b) return { amount: 0, currency: "$" };
  const currency = (b.match(/[^\d.,\s]+/) || ["$"])[0];
  const amount = Number(b.replace(/[^\d.]/g, "")) || 0;
  return { amount, currency };
}

function buildInvoiceItems(stage?: string, category?: string, budget?: { amount: number }): { desc: string; qty: number; rate: number }[] {
  const base = budget?.amount && budget.amount > 0 ? budget.amount : 4000;
  const cat = (category || "").toLowerCase();
  const stageLine = stage ? `${stage} stage delivery` : "Project delivery";
  return [
    { desc: `${stageLine}${cat ? ` — ${category}` : ""}`, qty: 1, rate: Math.round(base * 0.45) },
    { desc: "Creative direction & art production", qty: 1, rate: Math.round(base * 0.25) },
    { desc: "Project management & client comms", qty: 6, rate: Math.round((base * 0.15) / 6) },
    { desc: "Revisions & final delivery", qty: 1, rate: Math.round(base * 0.15) },
  ];
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
function MarketingTemplate({ lang, accent, workspace }: { lang: DocLang; accent: string; workspace?: BusinessWorkspace }) {
  const name = workspace?.name || "the brand";
  const market = workspace?.city ? `${workspace.city}, ${workspace.country}` : "the primary market";
  return (
    <>
      <SectionTitle accent={accent}>Campaign Goals</SectionTitle>
      <ul style={{ margin: 0, paddingInlineStart: "5mm", color: "#334155" }}>
        <li>Position <b>{name}</b> as a category leader in {market}.</li>
        <li>Increase qualified leads by 35% within the quarter.</li>
        <li>Grow social engagement across primary channels by 50%.</li>
        {workspace?.slogan && <li>Reinforce the brand promise: <i>"{workspace.slogan}"</i>.</li>}
      </ul>

      <SectionTitle accent={accent}>Channels & Deliverables</SectionTitle>
      <div data-avoid-break style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm" }}>
        {[
          { c: "Instagram", d: "12 posts, 8 reels, 20 stories" },
          { c: "LinkedIn", d: "6 thought-leadership articles" },
          { c: "Email", d: "Bi-weekly newsletter to 5k subs" },
          { c: "Paid Ads", d: "Meta + Google search" },
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
        CTR, CPL, CAC, engagement rate, and pipeline contribution tracked weekly. Owner: <b>{workspace?.manager || "Marketing Lead"}</b>.
      </p>
    </>
  );
}
