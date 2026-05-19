import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, User2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "666085";

function toEmail(username: string) {
  return `${username.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, "")}@visahobe.local`;
}

export default function Auth() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = username.toLowerCase().trim();
      const email = toEmail(u);

      // Bootstrap: admin / 666085 — auto-create on first attempt
      const isAdmin = u === ADMIN_USERNAME && password === ADMIN_PASSWORD;

      let { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error && isAdmin) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: "Super Admin", role: "super_admin", username: u },
          },
        });
        if (signUpErr) throw signUpErr;
        const retry = await supabase.auth.signInWithPassword({ email, password });
        if (retry.error) throw retry.error;
        error = null;
      }

      if (error) throw error;
      toast.success("Welcome back");
      navigate("/");
    } catch (err: any) {
      toast.error(err?.message || "Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-hero p-12 text-white lg:block">
        <div className="absolute -right-32 -top-32 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <span className="font-display text-lg font-bold">V</span>
            </div>
            <div>
              <div className="text-sm font-semibold">VisaHOBe</div>
              <div className="text-[11px] uppercase tracking-wider opacity-80">Business OS</div>
            </div>
          </div>
          <div className="mt-auto">
            <Sparkles className="mb-4 size-6 opacity-90" />
            <h1 className="font-display text-4xl font-bold leading-tight">
              Private workspace for VisaHOBe staff and approved clients.
            </h1>
            <p className="mt-4 max-w-md text-white/85">
              Accounts are created by your Super Admin. Enter the credentials you were given to continue.
            </p>
          </div>
        </div>
      </div>

      <div className="grid place-items-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.9 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sign in
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold">Enter your credentials</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Super Admin: use username <span className="font-mono font-semibold">admin</span> with your private password.
              Employees and clients: use the username your admin issued you.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field icon={User2} label="Username" value={username} onChange={setUsername} required autoFocus />
            <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} required minLength={6} />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-blue px-4 py-3 text-sm font-semibold text-white shadow-elegant transition hover:shadow-glow disabled:opacity-60"
            >
              {busy ? "Please wait…" : "Sign in"}
              <ArrowRight className="size-4" />
            </motion.button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>
              No public sign-up. New employee and client accounts are created by the Super Admin from
              the Team page once signed in.
            </span>
          </div>

          <div className="mt-10 text-center text-[11px] text-muted-foreground">
            © VisaHOBe PTE. LTD.
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, label, value, onChange, type = "text", required, minLength, autoFocus,
}: any) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type={type}
          required={required}
          minLength={minLength}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
    </label>
  );
}
