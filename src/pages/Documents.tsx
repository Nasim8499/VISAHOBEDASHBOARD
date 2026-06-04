import { PageContainer, PageHeader } from "@/components/layout/Page";
import { businesses } from "@/data/mock";
import {
  Download, Eye, FileText, Folder, Share2, UploadCloud, Search,
  Image as ImageIcon, FileSpreadsheet, FileCode2, FileArchive,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PrintPreviewModal } from "@/components/print/PrintPreviewModal";

const categories = [
  "All", "Client Info", "Legal", "Branding", "Marketing",
  "Website", "Invoice", "Final Delivery", "Visa", "HR",
] as const;
type Cat = (typeof categories)[number];

type Doc = { name: string; cat: Exclude<Cat, "All">; size: string; status: string; ref: string; kind?: "pdf" | "img" | "sheet" | "zip" | "code" };

// Full document set across all categories — not limited to brand/logo/invoice
const ALL_DOCS: Doc[] = [
  { name: "Client Onboarding Form.pdf",    cat: "Client Info",    size: "320 KB", status: "Verified", ref: "DOC-2001" },
  { name: "KYC Documents.zip",             cat: "Client Info",    size: "8.4 MB", status: "Approved", ref: "DOC-2002", kind: "zip" },
  { name: "Service Agreement.pdf",         cat: "Legal",          size: "1.4 MB", status: "Approved", ref: "LGL-3001" },
  { name: "Trademark Filing.pdf",          cat: "Legal",          size: "1.2 MB", status: "Approved", ref: "LGL-3002" },
  { name: "NDA — Mutual.pdf",              cat: "Legal",          size: "240 KB", status: "Pending",  ref: "LGL-3003" },
  { name: "Brand Strategy.pdf",            cat: "Branding",       size: "2.1 MB", status: "Approved", ref: "BR-1001" },
  { name: "Logo Concepts v3.pdf",          cat: "Branding",       size: "4.8 MB", status: "Pending",  ref: "BR-1002" },
  { name: "Brand Guidelines.pdf",          cat: "Branding",       size: "5.6 MB", status: "Verified", ref: "BR-1003" },
  { name: "Social Calendar Q3.xlsx",       cat: "Marketing",      size: "240 KB", status: "Approved", ref: "MKT-4001", kind: "sheet" },
  { name: "Campaign Brief.pdf",            cat: "Marketing",      size: "920 KB", status: "Pending",  ref: "MKT-4002" },
  { name: "Menu Photos.zip",               cat: "Marketing",      size: "32 MB",  status: "Verified", ref: "MKT-4003", kind: "zip" },
  { name: "Sitemap & Wireframes.pdf",      cat: "Website",        size: "1.6 MB", status: "Approved", ref: "WEB-5001" },
  { name: "Hero Banner Hi-Res.png",        cat: "Website",        size: "6.1 MB", status: "Verified", ref: "WEB-5002", kind: "img" },
  { name: "Source Bundle.zip",             cat: "Website",        size: "12 MB",  status: "Approved", ref: "WEB-5003", kind: "code" },
  { name: "Invoice #2031.pdf",             cat: "Invoice",        size: "180 KB", status: "Verified", ref: "INV-2031" },
  { name: "Invoice #2042.pdf",             cat: "Invoice",        size: "192 KB", status: "Pending",  ref: "INV-2042" },
  { name: "Statement — Aug.pdf",           cat: "Invoice",        size: "210 KB", status: "Verified", ref: "INV-2050" },
  { name: "Final Delivery Pack.zip",       cat: "Final Delivery", size: "84 MB",  status: "Approved", ref: "FD-6001", kind: "zip" },
  { name: "Handover Note.pdf",             cat: "Final Delivery", size: "640 KB", status: "Verified", ref: "FD-6002" },
  { name: "Visitor Visa Form.pdf",         cat: "Visa",           size: "320 KB", status: "Pending",  ref: "VISA-7001" },
  { name: "Work Visa Form.pdf",            cat: "Visa",           size: "480 KB", status: "Pending",  ref: "VISA-7002" },
  { name: "Visa Cover Letter.pdf",         cat: "Visa",           size: "120 KB", status: "Approved", ref: "VISA-7003" },
  { name: "Employee Offer Letter.pdf",     cat: "HR",             size: "180 KB", status: "Approved", ref: "HR-8001" },
  { name: "Payroll Sheet.xlsx",            cat: "HR",             size: "260 KB", status: "Verified", ref: "HR-8002", kind: "sheet" },
];

const kindIcon = (k?: Doc["kind"]) => {
  switch (k) {
    case "img":   return ImageIcon;
    case "sheet": return FileSpreadsheet;
    case "zip":   return FileArchive;
    case "code":  return FileCode2;
    default:      return FileText;
  }
};

const catTone: Record<Exclude<Cat, "All">, string> = {
  "Client Info":    "from-sky-500 to-blue-800",
  Legal:            "from-rose-500 to-rose-900",
  Branding:         "from-fuchsia-500 to-indigo-800",
  Marketing:        "from-amber-500 to-orange-700",
  Website:          "from-cyan-500 to-teal-800",
  Invoice:          "from-emerald-500 to-emerald-900",
  "Final Delivery": "from-violet-500 to-violet-900",
  Visa:             "from-blue-600 to-slate-900",
  HR:               "from-pink-500 to-rose-800",
};

export default function Documents() {
  const [active, setActive] = useState(businesses[0].id);
  const [cat, setCat] = useState<Cat>("All");
  const [q, setQ] = useState("");
  const [previewFile, setPreviewFile] = useState<Doc | null>(null);
  const activeBusiness = businesses.find((b) => b.id === active) ?? businesses[0];

  const docs = useMemo(
    () =>
      ALL_DOCS.filter(
        (d) =>
          (cat === "All" || d.cat === cat) &&
          (q === "" || d.name.toLowerCase().includes(q.toLowerCase()) || d.ref.toLowerCase().includes(q.toLowerCase()))
      ),
    [cat, q]
  );

  const countBy = (c: Cat) => (c === "All" ? ALL_DOCS.length : ALL_DOCS.filter((d) => d.cat === c).length);

  return (
    <PageContainer>
      <PageHeader
        title="Documents & File Manager"
        subtitle="Every file across every workspace — branding, legal, invoices, visa, HR & more."
        actions={
          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(220_85%_22%)] to-[hsl(225_80%_35%)] px-4 py-2.5 text-sm font-semibold text-white shadow-elegant hover:shadow-glow"
          >
            <UploadCloud className="size-4" /> Upload
          </motion.button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* Workspace sidebar */}
        <aside className="space-y-1 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspaces
          </div>
          {businesses.map((b) => (
            <motion.button
              key={b.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActive(b.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active === b.id
                  ? "bg-gradient-to-r from-[hsl(220_85%_22%)] to-[hsl(225_80%_35%)] font-semibold text-white shadow-sm"
                  : "hover:bg-muted/60"
              }`}
            >
              <Folder className={`size-4 ${active === b.id ? "text-white" : "text-accent"}`} />
              <span className="truncate">{b.name}</span>
            </motion.button>
          ))}
        </aside>

        <div className="space-y-6">
          {/* Drop zone + search */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_280px]">
            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground transition hover:border-accent"
            >
              <UploadCloud className="mx-auto mb-2 size-7 text-accent" />
              Drag & drop files here, or <span className="font-semibold text-accent">browse</span>
            </motion.div>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search files & refs…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <motion.button
                key={c}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setCat(c)}
                className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  cat === c
                    ? "border-transparent bg-gradient-to-r from-[hsl(220_85%_22%)] to-[hsl(225_80%_35%)] text-white shadow-elegant"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                {c}
                <span className={`rounded-full px-1.5 text-[10px] font-bold ${cat === c ? "bg-white/20" : "bg-muted text-muted-foreground"}`}>
                  {countBy(c)}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Card grid */}
          <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {docs.map((f, i) => {
              const Icon = kindIcon(f.kind);
              return (
                <motion.div
                  key={f.ref}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.025 }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-elegant"
                >
                  <div className={`relative h-24 bg-gradient-to-br ${catTone[f.cat]}`}>
                    <div className="absolute inset-0 opacity-25" style={{
                      backgroundImage:
                        "radial-gradient(600px 200px at 0% 100%, rgba(255,255,255,0.35), transparent 60%)",
                    }} />
                    <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                      {f.cat}
                    </span>
                    <span className="absolute bottom-3 left-3 grid size-11 place-items-center rounded-xl bg-white/20 ring-1 ring-white/30 text-white backdrop-blur">
                      <Icon className="size-5" />
                    </span>
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <div className="truncate text-sm font-semibold">{f.name}</div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{f.ref}</span>
                        <span>·</span>
                        <span>{f.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <StatusBadge status={f.status} />
                      <div className="flex gap-1.5">
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          onClick={() => setPreviewFile(f)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          <Eye className="size-3.5" /> Preview
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setPreviewFile(f)}
                          className="grid size-8 place-items-center rounded-lg border border-border hover:bg-muted"
                          title="Download as A4 PDF"
                        >
                          <Download className="size-3.5" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="grid size-8 place-items-center rounded-lg border border-border hover:bg-muted"
                        >
                          <Share2 className="size-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {docs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No documents match your filters.
            </div>
          )}
        </div>
      </div>

      <PrintPreviewModal
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        title={previewFile?.name ?? ""}
        reference={previewFile?.ref ?? ""}
        workspaceName={activeBusiness.name}
        workspaceLogo={activeBusiness.logo}
        preparedFor={activeBusiness.name}
        preparedBy={(activeBusiness as any).manager || (activeBusiness as any).manager_name}
        category={previewFile?.cat}
        size={previewFile?.size}
        status={previewFile?.status}
        workspace={activeBusiness}
      />
    </PageContainer>
  );
}
