import { PageContainer, PageHeader } from "@/components/layout/Page";
import { businesses } from "@/data/mock";
import { Download, Eye, FileText, Folder, Share2, UploadCloud } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useState } from "react";
import { PrintPreviewModal } from "@/components/print/PrintPreviewModal";

const categories = ["Client Info", "Legal", "Branding", "Marketing", "Website", "Invoice", "Final Delivery"];

const files = [
  { name: "Brand Strategy.pdf", cat: "Branding", size: "2.1 MB", status: "Approved", ref: "DOC-1001" },
  { name: "Logo Concepts v3.pdf", cat: "Branding", size: "4.8 MB", status: "Pending", ref: "DOC-1002" },
  { name: "Invoice #2031.pdf", cat: "Invoice", size: "180 KB", status: "Verified", ref: "INV-2031" },
  { name: "Menu Photos.zip", cat: "Marketing", size: "32 MB", status: "Verified", ref: "DOC-1003" },
  { name: "Trademark.pdf", cat: "Legal", size: "1.2 MB", status: "Approved", ref: "DOC-1004" },
];

export default function Documents() {
  const [active, setActive] = useState(businesses[0].id);
  const [previewFile, setPreviewFile] = useState<typeof files[number] | null>(null);
  const activeBusiness = businesses.find((b) => b.id === active) ?? businesses[0];

  return (
    <PageContainer>
      <PageHeader
        title="Documents & File Manager"
        subtitle="Every file, organized by client workspace and category."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white">
            <UploadCloud className="size-4" /> Upload
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-2 rounded-2xl border border-border bg-card p-3">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Workspaces</div>
          {businesses.map((b) => (
            <button
              key={b.id}
              onClick={() => setActive(b.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active === b.id ? "bg-muted font-semibold" : "hover:bg-muted/60"
              }`}
            >
              <Folder className="size-4 text-accent" />
              <span className="truncate">{b.name}</span>
            </button>
          ))}
        </aside>

        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground hover:border-accent">
            <UploadCloud className="mx-auto mb-2 size-8 text-accent" />
            Drag & drop files here, or <span className="font-semibold text-accent">browse</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((c, i) => (
              <button
                key={c}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  i === 0 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">File</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Size</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.name} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="grid size-9 place-items-center rounded-lg bg-gradient-red text-white">
                          <FileText className="size-4" />
                        </span>
                        <span className="font-medium">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{f.cat}</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.size}</td>
                    <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewFile(f)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                          title="A4 print preview"
                        >
                          <Eye className="size-3.5" /> Preview
                        </button>
                        <button
                          onClick={() => setPreviewFile(f)}
                          className="grid size-8 place-items-center rounded-lg border border-border hover:bg-muted"
                          title="Download as A4 PDF"
                        >
                          <Download className="size-3.5" />
                        </button>
                        <button className="grid size-8 place-items-center rounded-lg border border-border hover:bg-muted"><Share2 className="size-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PrintPreviewModal
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        title={previewFile?.name ?? ""}
        reference={previewFile?.ref ?? ""}
        workspaceName={activeBusiness.name}
        workspaceLogo={(activeBusiness as any).logo}
        preparedFor={activeBusiness.name}
        preparedBy="VisaHOBe Operations"
        category={previewFile?.cat}
        size={previewFile?.size}
        status={previewFile?.status}
      />
    </PageContainer>
  );
}
