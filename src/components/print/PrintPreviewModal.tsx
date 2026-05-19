import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { DocLang, DOC_LANGS, tr } from "@/lib/i18n-docs";
import { PrintSheet, PrintSheetProps } from "./PrintSheet";
import { X, Download, Globe, Loader2, RefreshCw, AlertTriangle } from "lucide-react";

interface Props extends Omit<PrintSheetProps, "lang"> {
  open: boolean;
  onClose: () => void;
  defaultLang?: DocLang;
}

export function PrintPreviewModal({ open, onClose, defaultLang = "en", ...sheet }: Props) {
  const [lang, setLang] = useState<DocLang>(defaultLang);
  const [busy, setBusy] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  async function download() {
    if (!sheetRef.current) {
      toast.error("Preview is not ready yet. Please try again.");
      return;
    }
    setBusy(true);
    setRenderError(null);
    const loadingToast = toast.loading("Generating PDF…");
    try {
      // Ensure web fonts are ready so text doesn't render as fallback glyphs.
      if ((document as any).fonts?.ready) {
        try { await (document as any).fonts.ready; } catch { /* noop */ }
      }

      const node = sheetRef.current;
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        logging: false,
        windowWidth: node.scrollWidth,
        windowHeight: node.scrollHeight,
      });

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = 210;
      const pageH = 297;
      // Pixels per mm in our rasterized canvas.
      const pxPerMm = canvas.width / pageW;
      const pageHpx = Math.floor(pageH * pxPerMm);

      // Slice the tall canvas into page-sized chunks so each PDF page is a clean
      // rasterized slice — no overlap, no cropping, no missing sections.
      let renderedPx = 0;
      let pageIndex = 0;
      while (renderedPx < canvas.height) {
        const sliceH = Math.min(pageHpx, canvas.height - renderedPx);
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceH;
        const ctx = slice.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        const img = slice.toDataURL("image/jpeg", 0.95);
        const imgHmm = sliceH / pxPerMm;
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, pageW, imgHmm);
        renderedPx += sliceH;
        pageIndex += 1;
      }

      pdf.save(`${sheet.reference || "document"}-${lang}.pdf`);
      toast.success("PDF ready", { id: loadingToast });
    } catch (err: any) {
      console.error("PDF export failed", err);
      const msg = err?.message?.includes("tainted") || err?.message?.includes("CORS")
        ? "Couldn't export due to a cross-origin image. Use a same-origin asset or enable CORS."
        : err?.message || "Something went wrong while generating the PDF.";
      setRenderError(msg);
      toast.error("PDF export failed", { id: loadingToast, description: msg });
    } finally {
      setBusy(false);
    }
  }

  const retry = () => {
    setRenderError(null);
    setRenderKey((k) => k + 1);
  };

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
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
              <Globe className="ml-1 size-3.5 text-muted-foreground" />
              {DOC_LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  disabled={busy}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    lang === l.code ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  } disabled:opacity-60`}
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
              {busy ? "Generating…" : tr("download", lang)}
            </button>
            <button
              onClick={onClose}
              disabled={busy}
              className="grid size-9 place-items-center rounded-xl border border-border hover:bg-muted disabled:opacity-60"
              aria-label={tr("close", lang)}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Scrollable preview canvas */}
        <div className="relative flex-1 overflow-auto bg-muted/40 p-6">
          {renderError && (
            <div className="mx-auto mb-4 flex max-w-[210mm] items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">PDF export failed</div>
                <div className="text-destructive/80">{renderError}</div>
              </div>
              <button
                onClick={retry}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-background px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <RefreshCw className="size-3.5" /> Retry
              </button>
            </div>
          )}

          {busy && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow">
                <Loader2 className="size-4 animate-spin text-primary" /> Rasterizing pages…
              </div>
            </div>
          )}

          <div className="mx-auto w-fit origin-top shadow-2xl ring-1 ring-black/10">
            <PrintSheet key={renderKey} ref={sheetRef} lang={lang} {...sheet} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
