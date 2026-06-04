import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { DocLang, DOC_LANGS, tr } from "@/lib/i18n-docs";
import { PrintSheet, PrintSheetProps } from "./PrintSheet";
import {
  X, Download, Globe, Loader2, RefreshCw, AlertTriangle, Ruler, Info, FileJson,
  Settings2, RotateCw,
} from "lucide-react";
import { PAPER_SIZES, PaperSize, Orientation, sanitizeFilename } from "@/lib/pdfExport";

interface Props extends Omit<PrintSheetProps, "lang"> {
  open: boolean;
  onClose: () => void;
  defaultLang?: DocLang;
}

// The preview is always rendered at A4 source; download() re-scales to the
// chosen paper size/orientation/margin selected by the user.
const PAGE_W_MM = 210;
const PAGE_H_MM = 297;
const GAP_MM = 2;
const MIN_SLICE_RATIO = 0.35;

type DebugInfo = {
  pxPerMm: number;
  pageHpx: number;
  bodyTop: number;
  bodyHeight: number;
  breaks: number[];
  moved: { top: number; height: number; label: string }[];
};

type ExportNotice = {
  kind: "error" | "warning";
  message: string;
  assets?: string[];
};

type ExportLog = {
  generatedAt: string;
  reference: string;
  language: DocLang;
  page: { widthMm: number; heightMm: number; gapMm: number };
  pxPerMm: number;
  bodyCanvasHeightPx: number;
  availableBodyHeightMm: number;
  pageBreaksPx: number[];
  avoidedRanges: { startPx: number; endPx: number; label: string; kind: string }[];
  movedBlocks: { pageIndex: number; naturalEndPx: number; retreatedToPx: number; label: string; kind: string }[];
  pages: { index: number; startPx: number; endPx: number; heightPx: number }[];
  placeholders: string[];
};

export function PrintPreviewModal({ open, onClose, defaultLang = "en", ...sheet }: Props) {
  const [lang, setLang] = useState<DocLang>(defaultLang);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<ExportNotice | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  const [debug, setDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [lastLog, setLastLog] = useState<ExportLog | null>(null);
  const [previewPlaceholders, setPreviewPlaceholders] = useState<string[]>([]);
  // Print/export settings
  const [paperSize, setPaperSize] = useState<PaperSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [marginMm, setMarginMm] = useState<number>(0);
  const [filename, setFilename] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Reset filename when the underlying doc changes
  useEffect(() => {
    if (open) setFilename(sanitizeFilename(`${sheet.reference || ""}-${sheet.title || "document"}`));
  }, [open, sheet.reference, sheet.title]);

  // Preview-side image fallback: detect blocked images on render and swap them
  // in-place with branded placeholders so what the user sees matches the PDF.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const id = window.setTimeout(async () => {
      const el = sheetRef.current;
      if (!el) return;
      const failing = await detectUnloadableImages(el);
      if (cancelled || !failing.length) return;
      el.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
        if (!failing.includes(img.src)) return;
        if (img.dataset.placeholderApplied === "1") return;
        img.dataset.originalSrc = img.src;
        img.dataset.placeholderApplied = "1";
        img.srcset = "";
        img.src = brandedPlaceholder(sheet.workspaceName || "•");
        img.title = `Placeholder · original asset blocked (${img.dataset.originalSrc})`;
      });
      setPreviewPlaceholders(failing);
      if (!notice) {
        setNotice({
          kind: "warning",
          message:
            "Some images couldn't be loaded due to CORS / CSP restrictions and have been replaced with branded placeholders in the preview. The exported PDF will match what you see here.",
          assets: failing,
        });
      }
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [open, renderKey, sheet.workspaceName, lang, sheet.reference]);

  useEffect(() => {
    if (!open || !debug) {
      if (!debug) setDebugInfo(null);
      return;
    }
    const id = window.setTimeout(() => setDebugInfo(computeDebug(sheetRef.current)), 80);
    return () => window.clearTimeout(id);
  }, [open, debug, lang, renderKey, sheet.category, sheet.reference, sheet.title, previewPlaceholders.length]);

  if (!open) return null;

  async function download() {
    if (!sheetRef.current) {
      toast.error("Preview is not ready yet. Please try again.");
      return;
    }
    setBusy(true);
    setNotice((n) => (n?.kind === "warning" ? n : null));
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

      // Re-detect in case content changed since last preview pass; placeholders
      // are already applied in the DOM (so the canvas captures them).
      const failingAssets = await detectUnloadableImages(sheetEl);
      const placeholdersUsed = Array.from(
        new Set([...previewPlaceholders, ...failingAssets])
      );

      const baseOpts = { scale: 2, backgroundColor: "#ffffff", useCORS: true, allowTaint: false, logging: false };
      const [headerCanvas, bodyCanvas, footerCanvas] = await Promise.all([
        html2canvas(headerEl, baseOpts),
        html2canvas(bodyEl, baseOpts),
        html2canvas(footerEl, baseOpts),
      ]);

      // Source canvas is rendered at A4 (210mm). Target page can be any size/orientation
      // with an outer margin; we rescale uniformly to fit innerW × innerH.
      const size = PAPER_SIZES[paperSize];
      const targetWmm = orientation === "portrait" ? size.w : size.h;
      const targetHmm = orientation === "portrait" ? size.h : size.w;
      const m = Math.max(0, Math.min(25, marginMm));
      const innerW = targetWmm - m * 2;
      const innerH = targetHmm - m * 2;
      const scale = innerW / PAGE_W_MM;

      const pxPerMm = bodyCanvas.width / PAGE_W_MM;
      const headerHmm = headerCanvas.height / pxPerMm;
      const footerHmm = footerCanvas.height / pxPerMm;
      const headerHmmOut = headerHmm * scale;
      const footerHmmOut = footerHmm * scale;
      const availableBodyHmmOut = innerH - headerHmmOut - footerHmmOut - GAP_MM * 2;
      if (availableBodyHmmOut < 30) throw new Error("Page header/footer leave too little room for body content at this size/margin.");
      const availableBodyHmmSrc = availableBodyHmmOut / scale;

      const bodyRect = bodyEl.getBoundingClientRect();
      const ranges = collectAvoidRanges(bodyEl, bodyRect, bodyCanvas.height);

      const pageHpxBody = Math.floor(availableBodyHmmSrc * pxPerMm);
      const composeHpx = Math.round((innerH / scale) * pxPerMm);
      const pdf = new jsPDF({ unit: "mm", format: [targetWmm, targetHmm], orientation });

      let cursorPx = 0;
      let pageIndex = 0;
      const minSlicePx = Math.floor(pageHpxBody * MIN_SLICE_RATIO);

      const logBreaks: number[] = [];
      const logMoved: ExportLog["movedBlocks"] = [];
      const logPages: ExportLog["pages"] = [];

      while (cursorPx < bodyCanvas.height) {
        let endPx = Math.min(cursorPx + pageHpxBody, bodyCanvas.height);
        const naturalEnd = endPx;

        const conflict = findInnermostConflict(ranges, cursorPx, endPx);
        if (conflict && conflict.startPx - cursorPx >= minSlicePx) {
          endPx = Math.floor(conflict.startPx);
          logMoved.push({
            pageIndex,
            naturalEndPx: Math.round(naturalEnd),
            retreatedToPx: Math.round(endPx),
            label: conflict.label,
            kind: conflict.kind,
          });
        }

        const sliceH = endPx - cursorPx;
        const page = document.createElement("canvas");
        page.width = bodyCanvas.width;
        page.height = composeHpx;
        const ctx = page.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, page.width, page.height);

        ctx.drawImage(headerCanvas, 0, 0, headerCanvas.width, headerCanvas.height, 0, 0, page.width, headerCanvas.height);
        const bodyTopPx = Math.round((headerHmm + GAP_MM) * pxPerMm);
        ctx.drawImage(bodyCanvas, 0, cursorPx, bodyCanvas.width, sliceH, 0, bodyTopPx, page.width, sliceH);
        const footerTopPx = page.height - footerCanvas.height;
        ctx.drawImage(footerCanvas, 0, 0, footerCanvas.width, footerCanvas.height, 0, footerTopPx, page.width, footerCanvas.height);

        ctx.font = `${Math.round(9 * pxPerMm * 0.353)}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = "#64748b";
        ctx.textAlign = "center";
        const pageLabel = `${tr("page", lang)} ${pageIndex + 1}`;
        ctx.fillText(pageLabel, page.width / 2, footerTopPx - Math.round(2 * pxPerMm));

        const img = page.toDataURL("image/jpeg", 0.95);
        if (pageIndex > 0) pdf.addPage([targetWmm, targetHmm], orientation);
        pdf.addImage(img, "JPEG", m, m, innerW, innerH);

        logPages.push({ index: pageIndex, startPx: Math.round(cursorPx), endPx: Math.round(endPx), heightPx: Math.round(sliceH) });
        logBreaks.push(Math.round(endPx));

        cursorPx = endPx;
        pageIndex += 1;
        if (pageIndex > 50) break;
      }

      const outName = `${sanitizeFilename(filename || `${sheet.reference || "document"}-${lang}`)}.pdf`;
      pdf.save(outName);

      const log: ExportLog = {
        generatedAt: new Date().toISOString(),
        reference: sheet.reference,
        language: lang,
        page: { widthMm: targetWmm, heightMm: targetHmm, gapMm: GAP_MM },
        pxPerMm,
        bodyCanvasHeightPx: bodyCanvas.height,
        availableBodyHeightMm: availableBodyHmmOut,
        pageBreaksPx: logBreaks,
        avoidedRanges: ranges.map((r) => ({
          startPx: Math.round(r.startPx),
          endPx: Math.round(r.endPx),
          label: r.label,
          kind: r.kind,
        })),
        movedBlocks: logMoved,
        pages: logPages,
        placeholders: placeholdersUsed,
      };
      setLastLog(log);

      toast.success(`PDF ready · ${pageIndex} page${pageIndex === 1 ? "" : "s"}`, { id: loadingToast });
    } catch (err: any) {
      console.error("PDF export failed", err);
      const { message, assets } = interpretError(err);
      setNotice({ kind: "error", message, assets });
      toast.error("PDF export failed", {
        id: loadingToast,
        description: assets?.length ? `${message} Failing asset: ${truncate(assets[0])}` : message,
        duration: 8000,
      });
    } finally {
      setBusy(false);
      if (debug) setDebugInfo(computeDebug(sheetRef.current));
    }
  }

  const retry = () => {
    setNotice(null);
    setRenderKey((k) => k + 1);
    setTimeout(download, 60);
  };

  const downloadLog = () => {
    if (!lastLog) return;
    const blob = new Blob([JSON.stringify(lastLog, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sheet.reference || "document"}-${lang}-pagination.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Pagination log downloaded");
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="flex h-[92vh] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{tr("preview", lang)}</h3>
            <span className="text-xs text-muted-foreground">A4 · 210×297mm</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDebug((d) => !d)}
              disabled={busy}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                debug
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
              title="Toggle pagination debug overlay"
            >
              <Ruler className="size-3.5" /> Debug
            </button>

            <button
              onClick={downloadLog}
              disabled={busy || !lastLog}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-50"
              title={lastLog ? "Download pagination JSON log" : "Export a PDF first to generate a log"}
            >
              <FileJson className="size-3.5" /> Log
            </button>

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
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(220_85%_22%)] to-[hsl(225_80%_42%)] px-4 py-2 text-sm font-bold text-white shadow-elegant transition hover:shadow-glow disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {busy ? "Generating PDF…" : "Download PDF"}
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

        <div className="relative flex-1 overflow-auto bg-muted/40 p-6 pb-24">
          {/* Floating prominent Download PDF CTA */}
          <button
            onClick={download}
            disabled={busy}
            className="sticky bottom-4 z-20 ml-auto flex w-fit items-center gap-2 rounded-2xl bg-gradient-to-r from-[hsl(220_85%_22%)] to-[hsl(225_80%_42%)] px-5 py-3 text-sm font-bold text-white shadow-2xl ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-60"
            style={{ float: "right" }}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {busy ? "Generating PDF…" : "Download PDF"}
          </button>

          {notice && (
            <div
              className={`mx-auto mb-4 flex max-w-[210mm] items-start gap-3 rounded-xl border p-4 text-sm ${
                notice.kind === "error"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200"
              }`}
            >
              {notice.kind === "error" ? (
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              ) : (
                <Info className="mt-0.5 size-4 shrink-0" />
              )}
              <div className="flex-1 space-y-1">
                <div className="font-semibold">
                  {notice.kind === "error" ? "PDF export failed" : "Showing branded placeholders"}
                </div>
                <div className="opacity-90">{notice.message}</div>
                {notice.assets?.length ? (
                  <div className="rounded-md bg-background/50 p-2 text-xs">
                    <div className="font-semibold mb-1">
                      Failing asset{notice.assets.length > 1 ? "s" : ""}:
                    </div>
                    <ul className="list-disc space-y-0.5 pl-4 break-all">
                      {notice.assets.slice(0, 5).map((u) => (
                        <li key={u}><code>{u}</code></li>
                      ))}
                    </ul>
                    <div className="mt-2 opacity-80">
                      To fix permanently: host on the same origin, proxy via your backend, or ensure the server returns
                      <code className="mx-1">Access-Control-Allow-Origin: *</code> and your CSP allows
                      <code className="mx-1">img-src</code> from that domain.
                    </div>
                  </div>
                ) : null}
              </div>
              {notice.kind === "error" && (
                <button
                  onClick={retry}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-background px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                >
                  <RefreshCw className="size-3.5" /> Retry
                </button>
              )}
            </div>
          )}

          {busy && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow">
                <Loader2 className="size-4 animate-spin text-primary" /> Composing pages…
              </div>
            </div>
          )}

          <div className="relative mx-auto w-fit origin-top shadow-2xl ring-1 ring-black/10">
            <PrintSheet key={renderKey} ref={sheetRef} lang={lang} {...sheet} />
            {debug && debugInfo && <DebugOverlay info={debugInfo} />}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ----------------- debug overlay ----------------- */

function DebugOverlay({ info }: { info: DebugInfo }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {info.breaks.map((y, i) => (
        <div key={`b-${i}`} className="absolute left-0 right-0" style={{ top: y }}>
          <div style={{ borderTop: "2px dashed #ef4444", opacity: 0.9 }} />
          <div
            style={{
              position: "absolute", right: 4, top: -18, background: "#ef4444", color: "#fff",
              fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700,
              fontFamily: "ui-sans-serif, system-ui",
            }}
          >
            Page {i + 1} break
          </div>
        </div>
      ))}
      {info.moved.map((m, i) => (
        <div
          key={`m-${i}`}
          className="absolute left-0 right-0"
          style={{
            top: m.top, height: m.height,
            background: "rgba(234, 179, 8, 0.18)",
            outline: "1.5px dashed #d97706", outlineOffset: -2,
          }}
        >
          <div
            style={{
              position: "absolute", left: 4, top: 4, background: "#d97706", color: "#fff",
              fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700,
              fontFamily: "ui-sans-serif, system-ui",
            }}
          >
            Kept together · {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function computeDebug(sheetEl: HTMLDivElement | null): DebugInfo | null {
  if (!sheetEl) return null;
  const headerEl = sheetEl.querySelector<HTMLElement>("[data-print-header]");
  const bodyEl = sheetEl.querySelector<HTMLElement>("[data-print-body]");
  const footerEl = sheetEl.querySelector<HTMLElement>("[data-print-footer]");
  if (!headerEl || !bodyEl || !footerEl) return null;

  const sheetRect = sheetEl.getBoundingClientRect();
  const pxPerMm = sheetRect.width / PAGE_W_MM;
  const headerHmm = headerEl.getBoundingClientRect().height / pxPerMm;
  const footerHmm = footerEl.getBoundingClientRect().height / pxPerMm;
  const availMm = PAGE_H_MM - headerHmm - footerHmm - GAP_MM * 2;
  const pageHpx = availMm * pxPerMm;

  const bodyRect = bodyEl.getBoundingClientRect();
  const bodyTop = bodyRect.top - sheetRect.top;
  const bodyHeight = bodyRect.height;

  const ranges = collectAvoidRangesCss(bodyEl, bodyRect);

  const breaks: number[] = [];
  const moved: { top: number; height: number; label: string }[] = [];
  const minSlice = pageHpx * MIN_SLICE_RATIO;
  let cursor = 0;
  let guard = 0;
  while (cursor < bodyHeight && guard++ < 60) {
    let end = Math.min(cursor + pageHpx, bodyHeight);
    const conflict = findInnermostConflictCss(ranges, cursor, end);
    if (conflict && conflict.start - cursor >= minSlice) {
      moved.push({
        top: conflict.start + bodyTop,
        height: conflict.end - conflict.start,
        label: conflict.label,
      });
      end = conflict.start;
    }
    breaks.push(end + bodyTop);
    cursor = end;
  }
  if (breaks.length && breaks[breaks.length - 1] >= bodyTop + bodyHeight - 1) breaks.pop();

  return { pxPerMm, pageHpx, bodyTop, bodyHeight, breaks, moved };
}

/* ----------------- pagination helpers ----------------- */

type Range = { startPx: number; endPx: number; label: string; kind: string };
type CssRange = { start: number; end: number; label: string; kind: string };

// Collect every "atomic" block that must not split mid-page. Includes:
//   - explicit [data-avoid-break] blocks
//   - every <tr> at any nesting level (real <tbody>/<thead>/<tfoot> rows, including nested tables)
//   - <thead> + <tfoot> as a whole (so a table header never orphans at page bottom)
function collectAvoidRanges(bodyEl: HTMLElement, bodyRect: DOMRect, bodyCanvasHeight: number): Range[] {
  const scale = bodyCanvasHeight / bodyRect.height;
  const list: Range[] = [];
  const push = (el: Element, kind: string, label?: string) => {
    const r = (el as HTMLElement).getBoundingClientRect();
    list.push({
      startPx: (r.top - bodyRect.top) * scale,
      endPx: (r.bottom - bodyRect.top) * scale,
      kind,
      label: label || labelFor(el as HTMLElement) || kind,
    });
  };
  bodyEl.querySelectorAll<HTMLElement>("[data-avoid-break]").forEach((el) => push(el, "avoid-block"));
  bodyEl.querySelectorAll<HTMLTableRowElement>("tr").forEach((tr) => {
    const section = tr.closest("thead") ? "thead row" : tr.closest("tfoot") ? "tfoot row" : "tbody row";
    push(tr, section);
  });
  bodyEl.querySelectorAll<HTMLElement>("thead, tfoot").forEach((sec) =>
    push(sec, sec.tagName.toLowerCase())
  );
  list.sort((a, b) => a.startPx - b.startPx);
  return list;
}

function collectAvoidRangesCss(bodyEl: HTMLElement, bodyRect: DOMRect): CssRange[] {
  const list: CssRange[] = [];
  const push = (el: Element, kind: string, label?: string) => {
    const r = (el as HTMLElement).getBoundingClientRect();
    list.push({
      start: r.top - bodyRect.top,
      end: r.bottom - bodyRect.top,
      kind,
      label: label || labelFor(el as HTMLElement) || kind,
    });
  };
  bodyEl.querySelectorAll<HTMLElement>("[data-avoid-break]").forEach((el) => push(el, "avoid-block"));
  bodyEl.querySelectorAll<HTMLTableRowElement>("tr").forEach((tr) => {
    const section = tr.closest("thead") ? "thead row" : tr.closest("tfoot") ? "tfoot row" : "tbody row";
    push(tr, section);
  });
  bodyEl.querySelectorAll<HTMLElement>("thead, tfoot").forEach((sec) => push(sec, sec.tagName.toLowerCase()));
  list.sort((a, b) => a.start - b.start);
  return list;
}

function labelFor(el: HTMLElement): string {
  const txt = (el.textContent || "").trim().split(/\s+/).slice(0, 4).join(" ");
  if (!txt) return "block";
  return txt.length > 36 ? txt.slice(0, 35) + "…" : txt;
}

// Innermost conflict = the latest-starting block the natural break would split.
// For nested tables, inner rows have larger `start`, so we retreat to the
// inner row's start — preserving every row at every nesting level.
function findInnermostConflict(ranges: Range[], cursor: number, end: number): Range | null {
  let best: Range | null = null;
  for (const r of ranges) {
    if (r.startPx > cursor && r.startPx < end && r.endPx > end) {
      if (!best || r.startPx > best.startPx) best = r;
    }
  }
  return best;
}

function findInnermostConflictCss(ranges: CssRange[], cursor: number, end: number): CssRange | null {
  let best: CssRange | null = null;
  for (const r of ranges) {
    if (r.start > cursor && r.start < end && r.end > end) {
      if (!best || r.start > best.start) best = r;
    }
  }
  return best;
}

/* ----------------- error / asset helpers ----------------- */

function truncate(s: string, n = 80) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function interpretError(err: any): { message: string; assets?: string[] } {
  if (err?.message === "CROSS_ORIGIN_IMAGE" && Array.isArray(err.assets)) {
    return {
      message:
        "One or more images couldn't be loaded for export due to CORS or Content-Security-Policy restrictions.",
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
          // Skip images we've already swapped to placeholders in a previous pass.
          if (img.dataset.placeholderApplied === "1") return resolve();
          if (!img.src || img.src.startsWith("data:")) return resolve();
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

function brandedPlaceholder(label: string): string {
  const initial = (label || "•").trim().charAt(0).toUpperCase() || "•";
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="20" fill="url(#g)"/>
  <text x="50%" y="54%" text-anchor="middle" font-family="Inter, system-ui, sans-serif"
        font-size="78" font-weight="800" fill="#ffffff" dominant-baseline="middle">${escapeXml(initial)}</text>
  <text x="50%" y="86%" text-anchor="middle" font-family="Inter, system-ui, sans-serif"
        font-size="10" fill="#ffffff" opacity="0.7" letter-spacing="2">PLACEHOLDER</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c] as string));
}
