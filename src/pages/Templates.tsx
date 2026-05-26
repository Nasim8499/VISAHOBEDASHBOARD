import { useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout/Page";
import { useWorkspace } from "@/context/WorkspaceContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Eye, Search, Sparkles, Heart, Star, Filter, X,
  UtensilsCrossed, Plane, Scissors, Dumbbell, Home, Megaphone,
  Image as ImageIcon, CalendarDays, Ticket, ShoppingBag, Briefcase, GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;

type Tpl = {
  id: string;
  title: string;
  category: string;
  format: "Post" | "Story" | "Flyer" | "Banner" | "Card";
  ratio: string;
  premium?: boolean;
  trending?: boolean;
  Icon: any;
  gradient: [string, string];
  tagline: string;
};

const TEMPLATES: Tpl[] = [
  { id: "t1",  title: "Restaurant Hero",     category: "Restaurant",  format: "Post",   ratio: "4/5", premium: true,  trending: true,  Icon: UtensilsCrossed, gradient: ["#1f1147", "#e85d75"], tagline: "Plates, glow & appetite" },
  { id: "t2",  title: "Travel Showcase",     category: "Travel",      format: "Story",  ratio: "9/16", premium: true,                  Icon: Plane,            gradient: ["#0c2340", "#5cbdb9"], tagline: "Wanderlust in motion" },
  { id: "t3",  title: "Beauty Booking",      category: "Beauty",      format: "Post",   ratio: "1/1",                 trending: true,  Icon: Scissors,         gradient: ["#9b72cf", "#f8c8d8"], tagline: "Soft luxe appointments" },
  { id: "t4",  title: "Fitness CTA",         category: "Fitness",     format: "Banner", ratio: "16/9",                                Icon: Dumbbell,         gradient: ["#0d1b2a", "#73ffb8"], tagline: "Power, sweat, signup" },
  { id: "t5",  title: "Real Estate Grid",    category: "Real Estate", format: "Post",   ratio: "4/5", premium: true,                  Icon: Home,             gradient: ["#0f1b3d", "#3b6fa0"], tagline: "Listings that breathe" },
  { id: "t6",  title: "Launch Banner",       category: "Brand",       format: "Banner", ratio: "16/9",                trending: true,  Icon: Megaphone,        gradient: ["#ff6b35", "#6c5ce7"], tagline: "Big day, bigger reveal" },
  { id: "t7",  title: "Story Promo",         category: "Brand",       format: "Story",  ratio: "9/16",                                Icon: ImageIcon,        gradient: ["#c9a84c", "#0d0d0d"], tagline: "Editorial vertical drop" },
  { id: "t8",  title: "Event Flyer",         category: "Events",      format: "Flyer",  ratio: "4/5", premium: true,                  Icon: CalendarDays,     gradient: ["#5c2018", "#e8b84a"], tagline: "RSVP-worthy artwork" },
  { id: "t9",  title: "Coupon Card",         category: "Retail",      format: "Card",   ratio: "1/1",                                 Icon: Ticket,           gradient: ["#c44569", "#574b90"], tagline: "Discount that converts" },
  { id: "t10", title: "E-commerce Drop",     category: "Retail",      format: "Post",   ratio: "1/1",                 trending: true,  Icon: ShoppingBag,      gradient: ["#2dd4a8", "#1b4332"], tagline: "Product hero in 4K" },
  { id: "t11", title: "Corporate Brief",     category: "Business",    format: "Card",   ratio: "4/5",                                 Icon: Briefcase,        gradient: ["#0a0a1a", "#4f46e5"], tagline: "Executive minimal" },
  { id: "t12", title: "Course Promo",        category: "Education",   format: "Post",   ratio: "1/1", premium: true,                  Icon: GraduationCap,    gradient: ["#1a3c2a", "#a0c49d"], tagline: "Enrollments, opened" },
];

const CATEGORIES = ["All", "Restaurant", "Travel", "Beauty", "Fitness", "Real Estate", "Brand", "Events", "Retail", "Business", "Education"];

export default function Templates() {
  const { workspace } = useWorkspace();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<Tpl | null>(null);

  const filtered = useMemo(
    () =>
      TEMPLATES.filter(
        (t) =>
          (cat === "All" || t.category === cat) &&
          (query === "" || t.title.toLowerCase().includes(query.toLowerCase()) || t.category.toLowerCase().includes(query.toLowerCase()))
      ),
    [query, cat]
  );

  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      toast.message(n.has(id) ? "Saved to favorites" : "Removed from favorites");
      return n;
    });
  };

  const useTemplate = (t: Tpl) => {
    toast.success(`Loading "${t.title}" into Post Designer…`, {
      description: `${t.format} · ${t.ratio} · ${workspace.name}`,
    });
  };

  const download = (t: Tpl) => {
    toast.success(`Download started`, { description: `${t.title}.png` });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Templates"
        subtitle="Premium templates ready to remix for any client workspace."
        actions={
          <button
            onClick={() => toast.message("AI generator coming next", { description: "Describe your brand and we'll draft 12 templates." })}
            className="tap inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant hover:shadow-glow"
          >
            <Sparkles className="size-4" /> AI Template
          </button>
        }
      />

      {/* Search + filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-5 flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates, categories, formats…"
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="size-3.5" /> {filtered.length} results
        </div>
      </motion.div>

      {/* Category chips */}
      <div className="scrollbar-thin mb-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {CATEGORIES.map((c) => (
          <motion.button
            key={c}
            whileTap={{ scale: 0.94 }}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              cat === c
                ? "border-transparent bg-gradient-blue text-white shadow-elegant"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {c}
          </motion.button>
        ))}
      </div>

      {/* Templates grid: 2 per row on mobile, scaling up */}
      <motion.div
        layout
        className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((t, i) => {
            const isFav = favs.has(t.id);
            const [c1, c2] = t.gradient;
            return (
              <motion.article
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, ease, delay: Math.min(i * 0.04, 0.4) }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-premium"
              >
                {/* Visual */}
                <div
                  className="relative aspect-[4/5] overflow-hidden"
                  style={{ background: `linear-gradient(${135 + i * 12}deg, ${c1}, ${c2})` }}
                >
                  {/* Decorative blobs */}
                  <motion.div
                    aria-hidden
                    className="absolute -left-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl"
                    animate={{ x: [0, 10, 0], y: [0, 8, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    aria-hidden
                    className="absolute -bottom-10 -right-10 size-32 rounded-full bg-white/10 blur-3xl"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Badges */}
                  <div className="absolute left-2.5 top-2.5 flex gap-1.5">
                    {t.premium && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur">
                        <Star className="size-2.5 fill-white" /> Pro
                      </span>
                    )}
                    {t.trending && (
                      <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-foreground">
                        Trending
                      </span>
                    )}
                  </div>

                  {/* Favorite */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => toggleFav(t.id)}
                    aria-label="Favorite"
                    className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-white/25 text-white backdrop-blur transition hover:bg-white/40"
                  >
                    <Heart className={`size-3.5 transition ${isFav ? "fill-white" : ""}`} />
                  </motion.button>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                    <motion.div
                      whileHover={{ rotate: 6, scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 240, damping: 16 }}
                      className="mb-3 grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur"
                    >
                      <t.Icon className="size-6" />
                    </motion.div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.2em] opacity-80">{t.format}</div>
                    <div className="mt-1 font-display text-base font-bold leading-tight sm:text-lg">{t.title}</div>
                    <div className="mt-1 line-clamp-2 text-[10px] opacity-80 sm:text-xs">{t.tagline}</div>
                  </div>

                  {/* Hover overlay actions */}
                  <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <button
                      onClick={() => setPreview(t)}
                      className="tap inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-white"
                    >
                      <Eye className="size-3" /> Preview
                    </button>
                    <button
                      onClick={() => useTemplate(t)}
                      className="tap inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background hover:opacity-90"
                    >
                      <Sparkles className="size-3" /> Use
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold">{t.title}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{t.category} · {t.ratio}</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPreview(t)}
                      aria-label="Preview"
                      className="tap grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="size-3" />
                    </button>
                    <button
                      onClick={() => download(t)}
                      aria-label="Download"
                      className="tap grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                    >
                      <Download className="size-3" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="font-display text-lg font-semibold">No templates match</div>
          <p className="mt-1 text-sm text-muted-foreground">Try a different keyword or category.</p>
        </div>
      )}

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4 backdrop-blur-sm"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-card shadow-premium"
            >
              <button
                onClick={() => setPreview(null)}
                className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur hover:bg-background"
              >
                <X className="size-4" />
              </button>
              <div className="grid md:grid-cols-2">
                <div
                  className="relative grid aspect-[4/5] place-items-center md:aspect-auto"
                  style={{ background: `linear-gradient(140deg, ${preview.gradient[0]}, ${preview.gradient[1]})` }}
                >
                  <div className="text-center text-white">
                    <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                      <preview.Icon className="size-7" />
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">{preview.format}</div>
                    <div className="mt-1 font-display text-2xl font-bold">{preview.title}</div>
                    <div className="mt-1 text-xs opacity-80">{preview.tagline}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 p-6">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{preview.category}</div>
                    <h3 className="mt-1 font-display text-2xl font-bold">{preview.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{preview.tagline}</p>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-center text-xs">
                    {[
                      ["Format", preview.format],
                      ["Ratio", preview.ratio],
                      ["Tier", preview.premium ? "Pro" : "Free"],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-xl bg-muted/60 p-3">
                        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
                        <dd className="mt-0.5 text-sm font-semibold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-auto flex flex-col gap-2">
                    <button
                      onClick={() => { useTemplate(preview); setPreview(null); }}
                      className="tap inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-blue px-4 py-3 text-sm font-semibold text-white shadow-elegant hover:shadow-glow"
                    >
                      <Sparkles className="size-4" /> Use this template
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => toggleFav(preview.id)}
                        className="tap inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold hover:bg-muted"
                      >
                        <Heart className={`size-3.5 ${favs.has(preview.id) ? "fill-current text-destructive" : ""}`} />
                        {favs.has(preview.id) ? "Saved" : "Favorite"}
                      </button>
                      <button
                        onClick={() => download(preview)}
                        className="tap inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold hover:bg-muted"
                      >
                        <Download className="size-3.5" /> Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
