// Brand theme utilities: persist + apply arbitrary brand colors as CSS variables.
// Converts hex -> HSL string ("H S% L%") suitable for Tailwind hsl(var(--token)) usage.

export type BrandTheme = {
  primary: string;     // Brand core (deep blue)
  accent: string;      // Secondary accent (lighter blue)
  red1: string;        // Gradient red 1
  red2: string;        // Gradient red 2 (warmer)
  text: string;        // Body/typography gray
};

const STORAGE_KEY = "vh.brandTheme";

export const DEFAULT_THEME: BrandTheme = {
  primary: "#003B73", // Primary Blue
  accent:  "#177BBB", // Gradient Blue / Secondary Accent
  red1:    "#E63946", // Gradient Red 1
  red2:    "#F1573D", // Gradient Red 2
  text:    "#6E7580", // Typography / Body gray
};

export function hexToHsl(hex: string): string {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return "220 70% 25%";
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let H = 0, S = 0;
  const L = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    S = L > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: H = (g - b) / d + (g < b ? 6 : 0); break;
      case g: H = (b - r) / d + 2; break;
      case b: H = (r - g) / d + 4; break;
    }
    H *= 60;
  }
  return `${Math.round(H)} ${Math.round(S * 100)}% ${Math.round(L * 100)}%`;
}

function shift(hsl: string, dL: number, dS = 0): string {
  const [h, s, l] = hsl.split(" ");
  const sv = parseInt(s);
  const lv = parseInt(l);
  return `${h} ${Math.max(0, Math.min(100, sv + dS))}% ${Math.max(0, Math.min(100, lv + dL))}%`;
}

export function applyBrandTheme(theme: BrandTheme) {
  const root = document.documentElement;
  const p = hexToHsl(theme.primary);
  const a = hexToHsl(theme.accent);
  const r1 = hexToHsl(theme.red1);
  const r2 = hexToHsl(theme.red2);
  const tx = hexToHsl(theme.text);
  const pGlow = shift(p, 18, -5);
  const aGlow = shift(a, 15, -5);

  // Core brand tokens
  root.style.setProperty("--primary", p);
  root.style.setProperty("--primary-glow", pGlow);
  root.style.setProperty("--accent", a);
  root.style.setProperty("--accent-glow", aGlow);
  root.style.setProperty("--ring", a);

  // Extended brand palette
  root.style.setProperty("--brand-red", r1);
  root.style.setProperty("--brand-red-2", r2);
  root.style.setProperty("--brand-blue-light", a);
  root.style.setProperty("--brand-text", tx);
  root.style.setProperty("--muted-foreground", tx);

  // Sidebar — derives from brand so super admin color changes flow through
  root.style.setProperty("--sidebar-primary", p);
  root.style.setProperty("--sidebar-ring", a);
  root.style.setProperty("--sidebar-background", shift(p, -8));
  root.style.setProperty("--sidebar-foreground", "0 0% 100%");
  root.style.setProperty("--sidebar-accent", shift(p, 6));
  root.style.setProperty("--sidebar-accent-foreground", "0 0% 100%");
  root.style.setProperty("--sidebar-border", shift(p, 10, -10));

  // Recompose gradients that depend on brand
  root.style.setProperty(
    "--gradient-blue",
    `linear-gradient(135deg, hsl(${p}) 0%, hsl(${pGlow}) 50%, hsl(${a}) 100%)`
  );
  root.style.setProperty(
    "--gradient-hero",
    `linear-gradient(125deg, hsl(${p}) 0%, hsl(${shift(p, 8)}) 40%, hsl(${a}) 100%)`
  );
  root.style.setProperty(
    "--gradient-red",
    `linear-gradient(135deg, hsl(${r1}) 0%, hsl(${r2}) 100%)`
  );
  root.style.setProperty(
    "--gradient-brand",
    `linear-gradient(135deg, hsl(${p}) 0%, hsl(${a}) 55%, hsl(${r2}) 100%)`
  );
  root.style.setProperty(
    "--gradient-sidebar",
    `radial-gradient(900px 520px at -10% -10%, hsl(${shift(p, 16)} / 0.85) 0%, transparent 55%), radial-gradient(700px 520px at 110% 110%, hsl(${shift(p, -4)} / 0.95) 0%, transparent 55%), linear-gradient(180deg, hsl(${shift(p, -10)}) 0%, hsl(${shift(p, -4)}) 55%, hsl(${shift(p, 4)}) 100%)`
  );
}

export function loadBrandTheme(): BrandTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_THEME;
}

export function saveBrandTheme(theme: BrandTheme) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(theme)); } catch {}
  applyBrandTheme(theme);
}

export function bootstrapBrandTheme() {
  applyBrandTheme(loadBrandTheme());
}
