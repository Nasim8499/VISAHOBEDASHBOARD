// Off-screen PDF renderer + print options used by Visa Documents.
// Used for one-click downloads (from grid cards) and batch ZIP exports,
// independent of any open preview modal.

import React from "react";
import { createRoot, Root } from "react-dom/client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PrintSheet, PrintSheetProps } from "@/components/print/PrintSheet";

export const PAPER_SIZES = {
  A4:     { w: 210,   h: 297   },
  Letter: { w: 215.9, h: 279.4 },
  Legal:  { w: 215.9, h: 355.6 },
} as const;

export type PaperSize   = keyof typeof PAPER_SIZES;
export type Orientation = "portrait" | "landscape";

export type PrintOptions = {
  paperSize:   PaperSize;
  orientation: Orientation;
  marginMm:    number;   // outer white margin in mm (0–25)
  filename?:   string;   // without .pdf extension
};

export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  paperSize:   "A4",
  orientation: "portrait",
  marginMm:    0,
};

export function sanitizeFilename(name: string): string {
  return (name || "")
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140) || "document";
}

export function buildFilename(parts: (string | undefined | null)[], ext = "pdf"): string {
  const joined = parts.filter(Boolean).map((p) => sanitizeFilename(String(p))).join(" - ");
  return `${joined || "document"}.${ext}`;
}

const GAP_MM = 2;
const SOURCE_SHEET_WMM = 210; // PrintSheet is always laid out at 210mm wide

async function mountSheetOffscreen(sheetProps: PrintSheetProps): Promise<{
  el: HTMLDivElement;
  cleanup: () => void;
}> {
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;z-index:-1;";
  document.body.appendChild(host);
  const root: Root = createRoot(host);

  const elRef: { current: HTMLDivElement | null } = { current: null };
  await new Promise<void>((resolve) => {
    root.render(
      React.createElement(PrintSheet, {
        ...sheetProps,
        ref: (el: HTMLDivElement | null) => { elRef.current = el; },
      } as any),
    );
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  if ((document as any).fonts?.ready) {
    try { await (document as any).fonts.ready; } catch {}
  }
  await new Promise((r) => setTimeout(r, 60));

  if (!elRef.current) {
    try { root.unmount(); } catch {}
    host.remove();
    throw new Error("Failed to mount print sheet");
  }

  return {
    el: elRef.current,
    cleanup: () => { try { root.unmount(); } catch {} host.remove(); },
  };
}

/** Render a PrintSheet headlessly and return a paginated PDF blob. */
export async function renderSheetToPdfBlob(
  sheetProps: PrintSheetProps,
  opts: PrintOptions = DEFAULT_PRINT_OPTIONS,
): Promise<{ blob: Blob; pages: number; filename: string }> {
  const { el: sheetEl, cleanup } = await mountSheetOffscreen(sheetProps);
  try {
    const headerEl = sheetEl.querySelector<HTMLElement>("[data-print-header]");
    const bodyEl   = sheetEl.querySelector<HTMLElement>("[data-print-body]");
    const footerEl = sheetEl.querySelector<HTMLElement>("[data-print-footer]");
    if (!headerEl || !bodyEl || !footerEl) throw new Error("Print sheet is missing required regions.");

    const size    = PAPER_SIZES[opts.paperSize];
    const pageWmm = opts.orientation === "portrait" ? size.w : size.h;
    const pageHmm = opts.orientation === "portrait" ? size.h : size.w;
    const m       = Math.max(0, Math.min(25, opts.marginMm));
    const innerW  = pageWmm - m * 2;
    const innerH  = pageHmm - m * 2;
    const scale   = innerW / SOURCE_SHEET_WMM;

    const base = { scale: 2, backgroundColor: "#ffffff", useCORS: true, allowTaint: false, logging: false };
    const [headerCanvas, bodyCanvas, footerCanvas] = await Promise.all([
      html2canvas(headerEl, base),
      html2canvas(bodyEl,   base),
      html2canvas(footerEl, base),
    ]);

    const pxPerMm        = bodyCanvas.width / SOURCE_SHEET_WMM;
    const headerHmmSrc   = headerCanvas.height / pxPerMm;
    const footerHmmSrc   = footerCanvas.height / pxPerMm;
    const headerHmmOut   = headerHmmSrc * scale;
    const footerHmmOut   = footerHmmSrc * scale;
    const availBodyOutMm = innerH - headerHmmOut - footerHmmOut - GAP_MM * 2;
    if (availBodyOutMm < 30) throw new Error("Page too small for header + footer at this size/margin.");
    const availBodySrcMm = availBodyOutMm / scale;
    const pageBodyHpx    = Math.floor(availBodySrcMm * pxPerMm);
    const composeHpx     = Math.round((innerH / scale) * pxPerMm);

    const pdf = new jsPDF({
      unit: "mm",
      format: [pageWmm, pageHmm],
      orientation: opts.orientation,
    });

    let cursor = 0, pageIdx = 0;
    while (cursor < bodyCanvas.height) {
      const end    = Math.min(cursor + pageBodyHpx, bodyCanvas.height);
      const sliceH = end - cursor;

      const page = document.createElement("canvas");
      page.width  = bodyCanvas.width;
      page.height = composeHpx;
      const ctx = page.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, page.width, page.height);

      ctx.drawImage(headerCanvas, 0, 0);
      const bodyTopPx = Math.round((headerHmmSrc + GAP_MM) * pxPerMm);
      ctx.drawImage(bodyCanvas, 0, cursor, bodyCanvas.width, sliceH, 0, bodyTopPx, page.width, sliceH);
      const footerTopPx = page.height - footerCanvas.height;
      ctx.drawImage(footerCanvas, 0, footerTopPx);

      const img = page.toDataURL("image/jpeg", 0.95);
      if (pageIdx > 0) pdf.addPage([pageWmm, pageHmm], opts.orientation);
      pdf.addImage(img, "JPEG", m, m, innerW, innerH);

      cursor = end;
      pageIdx += 1;
      if (pageIdx > 80) break;
    }

    const blob     = pdf.output("blob");
    const filename = `${sanitizeFilename(opts.filename || sheetProps.reference || sheetProps.title || "document")}.pdf`;
    return { blob, pages: pageIdx, filename };
  } finally {
    cleanup();
  }
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
