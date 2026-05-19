import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { DocLang, DOC_LANGS, tr } from "@/lib/i18n-docs";
import { PrintSheet, PrintSheetProps } from "./PrintSheet";
import { X, Download, Globe, Loader2 } from "lucide-react";

interface Props extends Omit<PrintSheetProps, "lang"> {
  open: boolean;
  onClose: () => void;
  defaultLang?: DocLang;
}

export function PrintPreviewModal({ open, onClose, defaultLang = "en", ...sheet }: Props) {
  const [lang, setLang] = useState<DocLang>(defaultLang);
  const [busy, setBusy] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  async function download() {
    if (!sheetRef.current) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(sheetRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const img = canvas.toDataURL("image/jpeg", 0.95);
      // A4 portrait — 210 x 297 mm
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = 210;
      const pageH = 297;
      const imgH = (canvas.height * pageW) / canvas.width;
      let y = 0;
      let remaining = imgH;
      // Multi-page: slice the tall image across A4 pages.
      if (imgH <= pageH) {
        pdf.addImage(img, "JPEG", 0, 0, pageW, imgH);
      } else {
        while (remaining > 0) {
          pdf.addImage(img, "JPEG", 0, y, pageW, imgH);
          remaining -= pageH;
          if (remaining > 0) {
            pdf.addPage();
            y -= pageH;
          }
        }
      }
      pdf.save(`${sheet.reference}-${lang}.pdf`);
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="flex h-[92vh] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{tr("preview", lang)}</h3>
            <span className="text-xs text-muted-foreground">A4 · 210×297mm</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
              <Globe className="ml-1 size-3.5 text-muted-foreground" />
              {DOC_LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    lang === l.code ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  title={l.label}
                >
                  {l.native}
                </button>
              ))}
            </div>

            <button
              onClick={download}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {tr("download", lang)}
            </button>
            <button
              onClick={onClose}
              className="grid size-9 place-items-center rounded-xl border border-border hover:bg-muted"
              aria-label={tr("close", lang)}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Scrollable preview canvas */}
        <div className="flex-1 overflow-auto bg-muted/40 p-6">
          <div className="mx-auto w-fit origin-top shadow-2xl ring-1 ring-black/10">
            <PrintSheet ref={sheetRef} lang={lang} {...sheet} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
