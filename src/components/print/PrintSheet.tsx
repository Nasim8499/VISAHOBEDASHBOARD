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

// Renders a single A4 sheet (210mm x 297mm) with branded header + footer.
// Used both for on-screen preview and as the DOM source for jsPDF.
export const PrintSheet = forwardRef<HTMLDivElement, PrintSheetProps>(function PrintSheet(
  { lang, title, reference, workspaceName, workspaceLogo, preparedFor, preparedBy, category, size, status, body },
  ref
) {
  const meta = DOC_LANGS.find((l) => l.code === lang)!;
  const dir = meta.rtl ? "rtl" : "ltr";
  const today = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : lang, { dateStyle: "long" }).format(new Date());

  return (
    <div
      ref={ref}
      dir={dir}
      lang={lang}
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "18mm 16mm 22mm",
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
          borderBottom: "2px solid #0f172a",
          paddingBottom: "8mm",
          marginBottom: "10mm",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {workspaceLogo ? (
            <img src={workspaceLogo} alt="" style={{ width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover" }} />
          ) : (
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "8px",
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
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
            <div style={{ fontSize: "9pt", color: "#64748b" }}>{tr("document", lang)}</div>
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
        }}
      >
        {preparedFor && (
          <Field label={tr("preparedFor", lang)} value={preparedFor} />
        )}
        {preparedBy && <Field label={tr("preparedBy", lang)} value={preparedBy} />}
        {category && <Field label={tr("category", lang)} value={category} />}
        {size && <Field label={tr("size", lang)} value={size} />}
        {status && <Field label={tr("status", lang)} value={status} />}
      </div>

      {/* Body */}
      <section style={{ fontSize: "11pt" }}>
        <h2 style={{ fontSize: "13pt", fontWeight: 700, margin: "0 0 3mm", color: "#1e293b" }}>{tr("summary", lang)}</h2>
        <p style={{ margin: 0, color: "#334155" }}>{body ?? tr("summaryBody", lang)}</p>
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
