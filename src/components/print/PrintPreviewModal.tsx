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

const PAGE_W_MM = 210;
const PAGE_H_MM = 297;

export function PrintPreviewModal({ open, onClose, defaultLang = "en", ...sheet }: Props) {
  const [lang, setLang] = useState<DocLang>(defaultLang);
  const [busy, setBusy] = useState(false);
  const [renderError, setRenderError] = useState<{ message: string; assets?: string[] } | null>(null);
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
      if ((document as any).fonts?.ready) {
        try { await (document as any).fonts.ready; } catch { /* noop */ }
      }

      const sheetEl = sheetRef.current;
      const headerEl = sheetEl.querySelector<HTMLElement>("[data-print-header]");
      const bodyEl = sheetEl.querySelector<HTMLElement>("[data-print-body]");
      const footerEl = sheetEl.querySelector<HTMLElement>("[data-print-footer]");
      if (!headerEl || !bodyEl || !footerEl) throw new Error("Print sheet is missing required regions.");

      // Pre-flight: detect cross-origin images that will taint the canvas.
      const failingAssets = await detectUnloadableImages(sheetEl);
      if (failingAssets.length) {
        throw Object.assign(new Error("CROSS_ORIGIN_IMAGE"), { assets: failingAssets });
      }

      const baseOpts = { scale: 2, backgroundColor: "#ffffff", useCORS: true, allowTaint: false, logging: false };
      const [headerCanvas, bodyCanvas, footerCanvas] = await Promise.all([
        html2canvas(headerEl, baseOpts),
        html2canvas(bodyEl, baseOpts),
        html2canvas(footerEl, baseOpts),
      ]);

      // px-per-mm derived from the sheet width (each region is exactly PAGE_W_MM wide).
      const pxPerMm = bodyCanvas.width / PAGE_W_MM;
      const headerHmm = headerCanvas.height / pxPerMm;
      const footerHmm = footerCanvas.height / pxPerMm;
      const gapMm = 2; // breathing space between chrome and content
      const availableBodyHmm = PAGE_H_MM - headerHmm - footerHmm - gapMm * 2;
      if (availableBodyHmm < 40) throw new Error("Page header/footer leave too little room for body content.");

      // Compute avoid-break ranges from the body DOM, in body-canvas px.
      const bodyRect = bodyEl.getBoundingClientRect();
      const avoidRanges: { startPx: number; endPx: number }[] = [];
      bodyEl.querySelectorAll<HTMLElement>("[data-avoid-break]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const startPx = (r.top - bodyRect.top) * (bodyCanvas.height / bodyRect.height);
        const endPx = (r.bottom - bodyRect.top) * (bodyCanvas.height / bodyRect.height);
        avoidRanges.push({ startPx, endPx });
      });
      avoidRanges.sort((a, b) => a.startPx - b.startPx);

      const pageHpxBody = Math.floor(availableBodyHmm * pxPerMm);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      let cursorPx = 0;
      let pageIndex = 0;
      const minSlicePx = Math.floor(pageHpxBody * 0.35); // never split smaller than 35% of a page

      while (cursorPx < bodyCanvas.height) {
        let endPx = Math.min(cursorPx + pageHpxBody, bodyCanvas.height);

        // If the natural break cuts through an avoid-block, retreat to the block's start.
        const conflict = avoidRanges.find(
          (r) => r.startPx > cursorPx && r.startPx < endPx && r.endPx > endPx
        );
        if (conflict && conflict.startPx - cursorPx >= minSlicePx) {
          endPx = Math.floor(conflict.startPx);
        }

        const sliceH = endPx - cursorPx;
        // Compose a full A4 page: header on top, body slice in middle, footer at bottom.
        const page = document.createElement("canvas");
        page.width = bodyCanvas.width;
        page.height = Math.round(PAGE_H_MM * pxPerMm);
        const ctx = page.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, page.width, page.height);

        // Header
        ctx.drawImage(headerCanvas, 0, 0, headerCanvas.width, headerCanvas.height, 0, 0, page.width, headerCanvas.height);
        // Body slice (offset by header + gap)
        const bodyTopPx = Math.round((headerHmm + gapMm) * pxPerMm);
        ctx.drawImage(bodyCanvas, 0, cursorPx, bodyCanvas.width, sliceH, 0, bodyTopPx, page.width, sliceH);
        // Footer (anchored to bottom)
        const footerTopPx = page.height - footerCanvas.height;
        ctx.drawImage(footerCanvas, 0, 0, footerCanvas.width, footerCanvas.height, 0, footerTopPx, page.width, footerCanvas.height);

        // Page number stamp (above footer line)
        ctx.font = `${Math.round(9 * pxPerMm * 0.353)}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = "#64748b";
        ctx.textAlign = "center";
        const pageLabel = `${tr("page", lang)} ${pageIndex + 1}`;
        ctx.fillText(pageLabel, page.width / 2, footerTopPx - Math.round(2 * pxPerMm));

        const img = page.toDataURL("image/jpeg", 0.95);
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, PAGE_W_MM, PAGE_H_MM);

        cursorPx = endPx;
        pageIndex += 1;
        if (pageIndex > 50) break; // safety
      }

      pdf.save(`${sheet.reference || "document"}-${lang}.pdf`);
      toast.success(`PDF ready · ${pageIndex} page${pageIndex === 1 ? "" : "s"}`, { id: loadingToast });
    } catch (err: any) {
      console.error("PDF export failed", err);
      const { message, assets } = interpretError(err);
      setRenderError({ message, assets });
      toast.error("PDF export failed", {
        id: loadingToast,
        description: assets?.length
          ? `${message} Failing asset: ${truncate(assets[0])}`
          : message,
        duration: 8000,
      });
    } finally {
      setBusy(false);
    }
  }

  const retry = () => {
    setRenderError(null);
    setRenderKey((k) => k + 1);
    setTimeout(download, 60);
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

        <div className="relative flex-1 overflow-auto bg-muted/40 p-6">
          {renderError && (
            <div className="mx-auto mb-4 flex max-w-[210mm] items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="font-semibold">PDF export failed</div>
                <div className="text-destructive/90">{renderError.message}</div>
                {renderError.assets?.length ? (
                  <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive/90">
                    <div className="font-semibold mb-1">Failing asset{renderError.assets.length > 1 ? "s" : ""}:</div>
                    <ul className="list-disc space-y-0.5 pl-4 break-all">
                      {renderError.assets.slice(0, 5).map((u) => <li key={u}><code>{u}</code></li>)}
                    </ul>
                    <div className="mt-2 text-destructive/80">
                      Fix: host the image on the same origin, proxy it through your backend, or ensure the server returns
                      <code className="mx-1">Access-Control-Allow-Origin: *</code> and your CSP allows
                      <code className="mx-1">img-src</code> from that domain.
                    </div>
                  </div>
                ) : null}
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
                <Loader2 className="size-4 animate-spin text-primary" /> Composing pages…
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

/* ----------------- helpers ----------------- */

function truncate(s: string, n = 80) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function interpretError(err: any): { message: string; assets?: string[] } {
  if (err?.message === "CROSS_ORIGIN_IMAGE" && Array.isArray(err.assets)) {
    return {
      message:
        "One or more images couldn't be loaded for export due to CORS or Content-Security-Policy restrictions. The browser can't rasterize cross-origin images that don't allow it.",
      assets: err.assets,
    };
  }
  const raw = String(err?.message || err || "");
  if (/tainted|SecurityError|cross-?origin/i.test(raw)) {
    return {
      message:
        "The export was blocked because the page contains cross-origin assets without CORS permission. Host images on the same origin or enable Access-Control-Allow-Origin on the source.",
    };
  }
  if (/CSP|Content[- ]Security[- ]Policy/i.test(raw)) {
    return {
      message:
        "Your Content-Security-Policy is blocking the export. Add the asset domain to img-src and connect-src, or serve assets from the same origin.",
    };
  }
  return { message: raw || "Something went wrong while generating the PDF." };
}

async function detectUnloadableImages(root: HTMLElement): Promise<string[]> {
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
  const failures: string[] = [];
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (!img.src) return resolve();
          const probe = new Image();
          probe.crossOrigin = "anonymous";
          probe.onload = () => resolve();
          probe.onerror = () => {
            failures.push(img.src);
            resolve();
          };
          probe.src = img.src;
        })
    )
  );
  return failures;
}
