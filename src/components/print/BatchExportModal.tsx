import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import JSZip from "jszip";
import jsPDF from "jspdf";
import {
  X, Download, Loader2, FileArchive, FileText, Settings2, Ruler, RotateCw,
} from "lucide-react";
import {
  renderSheetToPdfBlob, renderSheetToPageImages, saveBlob, sanitizeFilename,
  PrintOptions, PaperSize, DEFAULT_PRINT_OPTIONS, PAPER_SIZES,
} from "@/lib/pdfExport";
import type { PrintSheetProps } from "@/components/print/PrintSheet";

export type BatchItem = {
  id: string;
  ref: string;
  title: string;
  category?: string;
  pages: number;
  body: React.ReactNode;
};

interface Props {
  open: boolean;
  onClose: () => void;
  items: BatchItem[];
  sheetCommon: Omit<PrintSheetProps, "title" | "reference" | "category" | "body" | "size" | "lang">;
  clientName?: string;
}

type Mode = "zip" | "combined";

export function BatchExportModal({ open, onClose, items, sheetCommon, clientName }: Props) {
  const [mode, setMode]       = useState<Mode>("zip");
  const [opts, setOpts]       = useState<PrintOptions>({ ...DEFAULT_PRINT_OPTIONS });
  const [client, setClient]   = useState(clientName || "");
  const [zipName, setZipName] = useState("visa-documents-bundle");
  const [busy, setBusy]       = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, label: "" });

  useEffect(() => {
    if (open) {
      setClient(clientName || "");
      setProgress({ done: 0, total: 0, label: "" });
    }
  }, [open, clientName]);

  if (!open) return null;

  const baseName = (t: string) =>
    sanitizeFilename([client, t].filter(Boolean).join(" - "));

  function buildSheet(d: BatchItem): PrintSheetProps {
    return {
      ...(sheetCommon as any),
      lang: "en",
      title: d.title,
      reference: d.ref,
      category: d.category,
      body: d.body,
      size: `A4 · ${d.pages}p`,
      status: "Print Ready",
    } as PrintSheetProps;
  }

  async function run() {
    if (!items.length) { toast.error("Select at least one template"); return; }
    setBusy(true);
    setProgress({ done: 0, total: items.length, label: "" });
    const toastId = toast.loading(
      mode === "zip" ? `Bundling ${items.length} PDFs…` : `Combining ${items.length} PDFs…`,
    );
    try {
      const bundleName = sanitizeFilename(zipName) || "visa-documents-bundle";

      if (mode === "zip") {
        const zip = new JSZip();
        for (let i = 0; i < items.length; i++) {
          const d = items[i];
          setProgress({ done: i, total: items.length, label: d.title });
          const { blob, filename } = await renderSheetToPdfBlob(
            buildSheet(d),
            { ...opts, filename: baseName(`${d.ref}-${d.title}`) },
          );
          zip.file(filename, blob);
        }
        saveBlob(await zip.generateAsync({ type: "blob" }), `${bundleName}.zip`);
        toast.success(`ZIP ready · ${items.length} PDFs`, { id: toastId });
      } else {
        const size    = PAPER_SIZES[opts.paperSize];
        const pageWmm = opts.orientation === "portrait" ? size.w : size.h;
        const pageHmm = opts.orientation === "portrait" ? size.h : size.w;
        const merged  = new jsPDF({ unit: "mm", format: [pageWmm, pageHmm], orientation: opts.orientation });
        let added = false;
        for (let i = 0; i < items.length; i++) {
          const d = items[i];
          setProgress({ done: i, total: items.length, label: d.title });
          const pages = await renderSheetToPageImages(buildSheet(d), opts);
          for (const p of pages) {
            if (added) merged.addPage([p.widthMm, p.heightMm], opts.orientation);
            added = true;
            merged.addImage(p.dataUrl, "JPEG", p.marginMm, p.marginMm, p.widthMm - p.marginMm * 2, p.heightMm - p.marginMm * 2);
          }
        }
        merged.save(`${baseName(bundleName)}.pdf`);
        toast.success(`Combined PDF ready · ${items.length} docs`, { id: toastId });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Batch export failed", { id: toastId, description: err?.message || String(err) });
    } finally {
      setBusy(false);
      setProgress({ done: 0, total: 0, label: "" });
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-5 py-3 text-white">
          <div className="flex items-center gap-2">
            <FileArchive className="size-4" />
            <h3 className="text-sm font-bold">Batch export · {items.length} template{items.length === 1 ? "" : "s"}</h3>
          </div>
          <button onClick={onClose} disabled={busy} className="rounded-md p-1 hover:bg-white/10 disabled:opacity-50">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "zip" as Mode,      label: "ZIP of PDFs",   icon: FileArchive, desc: "One PDF per template, bundled" },
              { id: "combined" as Mode, label: "Combined PDF",  icon: FileText,    desc: "All pages in a single PDF" },
            ].map((m) => {
              const Active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  disabled={busy}
                  className={`rounded-xl border p-3 text-left transition ${
                    Active ? "border-accent bg-accent/5 shadow-elegant" : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-sm font-bold">
                    <m.icon className="size-4" /> {m.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{m.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Client name (added to each PDF filename)</label>
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              disabled={busy}
              placeholder="e.g. John Smith"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
            />
            <label className="text-xs font-semibold text-muted-foreground">Bundle filename</label>
            <input
              value={zipName}
              onChange={(e) => setZipName(e.target.value)}
              disabled={busy}
              placeholder="visa-documents-bundle"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="rounded-xl border border-border p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Settings2 className="size-3.5" /> Print settings
            </div>
            <div className="grid grid-cols-3 gap-2">
              <SelectField label="Paper"       value={opts.paperSize}        onChange={(v) => setOpts({ ...opts, paperSize: v as PaperSize })} options={["A4", "Letter", "Legal"]} disabled={busy} />
              <SelectField label="Orientation" value={opts.orientation}      onChange={(v) => setOpts({ ...opts, orientation: v as any })}     options={["portrait", "landscape"]} disabled={busy} icon={RotateCw} />
              <SelectField label="Margin (mm)" value={String(opts.marginMm)} onChange={(v) => setOpts({ ...opts, marginMm: Number(v) })}       options={["0", "5", "10", "15", "20", "25"]} disabled={busy} icon={Ruler} />
            </div>
          </div>

          {busy && progress.total > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="truncate">{progress.label || "Rendering…"}</span>
                <span>{progress.done}/{progress.total}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] transition-all"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={run}
            disabled={busy || items.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-4 py-2 text-sm font-bold text-white shadow-elegant hover:shadow-glow disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {busy ? "Exporting…" : mode === "zip" ? "Download ZIP" : "Download PDF"}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

function SelectField({
  label, value, onChange, options, disabled, icon: Icon,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; disabled?: boolean; icon?: any }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
        {Icon && <Icon className="size-3" />} {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm capitalize outline-none focus:border-accent disabled:opacity-60"
      >
        {options.map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
      </select>
    </label>
  );
}
