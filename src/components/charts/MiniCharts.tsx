import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/* ──────────────────────────────────────────────────────────
   Sparkline — area line w/ pulsing endpoint
   ────────────────────────────────────────────────────────── */
export function Sparkline({
  data,
  className = "h-8 w-full",
  strokeWidth = 1.6,
}: {
  data: number[];
  className?: string;
  strokeWidth?: number;
}) {
  const W = 100;
  const H = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = W / (data.length - 1);
  const pts = data.map((v, i) => [i * step, H - ((v - min) / range) * (H - 4) - 2] as const);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const area = `${d} L${W},${H} L0,${H} Z`;
  const last = pts[pts.length - 1];
  const id = `spk-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease }}
      />
      <circle cx={last[0]} cy={last[1]} r="2.2" fill="currentColor" />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill="currentColor" opacity="0.18">
        <animate attributeName="r" values="3;6;3" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/* Bars — gradient mini bar chart */
export function MiniBars({
  data,
  className = "h-8 w-full",
}: {
  data: number[];
  className?: string;
}) {
  const W = 100;
  const H = 32;
  const min = Math.min(...data, 0);
  const max = Math.max(...data);
  const range = max - min || 1;
  const id = `bar-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {data.map((v, i) => {
        const h = ((v - min) / range) * (H - 4) + 3;
        const bw = W / data.length - 1.5;
        return (
          <motion.rect
            key={i}
            x={i * (W / data.length) + 0.75}
            y={H}
            width={bw}
            height={0}
            rx={1.2}
            fill={`url(#${id})`}
            initial={false}
            animate={{ y: H - h, height: h }}
            transition={{ duration: 0.7, ease, delay: i * 0.04 }}
          />
        );
      })}
    </svg>
  );
}

/* Donut ring with center label */
export function MiniRing({
  value,
  size = 56,
  stroke = 6,
  label,
  color = "currentColor",
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  label?: string;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, value)) / 100) * c;

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeOpacity="0.12" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          initial={{ strokeDasharray: `0 ${c}` }}
          animate={{ strokeDasharray: `${dash} ${c}` }}
          transition={{ duration: 1, ease }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[11px] font-semibold">
        {label ?? `${Math.round(value)}%`}
      </div>
    </div>
  );
}

/* Rich KPI card with chart slot */
export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "bg-gradient-blue",
  trend,
  bars,
  sub,
  index = 0,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: any;
  tone?: string;
  trend?: number[];
  bars?: boolean;
  sub?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-elegant"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-8 -top-8 size-24 rounded-full ${tone} opacity-10 blur-2xl transition group-hover:opacity-20`}
      />
      <div className="relative flex items-start justify-between">
        <span className={`grid size-9 place-items-center rounded-xl ${tone} text-white shadow-sm`}>
          {Icon ? <Icon className="size-4" /> : null}
        </span>
        {delta && (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
            {delta}
          </span>
        )}
      </div>
      <div className="relative mt-3 text-2xl font-bold tracking-tight">{value}</div>
      <div className="relative text-xs text-muted-foreground">{label}</div>
      {trend && (
        <div className="relative mt-3 text-primary">
          {bars ? <MiniBars data={trend} /> : <Sparkline data={trend} />}
        </div>
      )}
      {sub && (
        <div className="relative mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {sub}
        </div>
      )}
    </motion.div>
  );
}
