import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, Lock, User2, Sparkles, ArrowRight } from "lucide-react";

type Mode = "signin" | "signup" | "forgot";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"client" | "employee">("client");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        navigate("/");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name, role },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent.");
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
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
              Build, brand, launch and grow every client business — from one workspace.
            </h1>
            <p className="mt-4 max-w-md text-white/85">
              The premium operating system for VisaHOBe employees and admins, with a polished portal for clients.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid place-items-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Welcome back"}
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold">
              {mode === "signup" ? "Join VisaHOBe Business OS" : mode === "forgot" ? "We'll email you a link" : "Sign in to continue"}
            </h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <Field icon={User2} label="Full name" value={name} onChange={setName} required />
            )}
            <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} required />
            {mode !== "forgot" && (
              <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} required minLength={6} />
            )}
            {mode === "signup" && (
              <div>
                <div className="mb-1.5 text-xs font-semibold text-muted-foreground">Sign up as</div>
                <div className="grid grid-cols-2 gap-2">
                  {(["client", "employee"] as const).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`rounded-xl border p-3 text-left text-sm transition ${
                        role === r ? "border-primary bg-primary/5 font-semibold" : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="capitalize">{r}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {r === "client" ? "Portal access only" : "Internal team member"}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  The very first account created automatically becomes a Super Admin.
                </p>
              </div>
            )}

            <button
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-blue px-4 py-3 text-sm font-semibold text-white shadow-elegant transition hover:shadow-glow disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            {mode === "signin" && (
              <>
                <button onClick={() => setMode("forgot")} className="text-muted-foreground hover:text-foreground">
                  Forgot password?
                </button>
                <div className="text-muted-foreground">
                  No account?{" "}
                  <button onClick={() => setMode("signup")} className="font-semibold text-accent">
                    Sign up
                  </button>
                </div>
              </>
            )}
            {mode !== "signin" && (
              <button onClick={() => setMode("signin")} className="text-muted-foreground hover:text-foreground">
                ← Back to sign in
              </button>
            )}
          </div>

          <div className="mt-10 text-center text-[11px] text-muted-foreground">
            <Link to="/">© VisaHOBe PTE. LTD.</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  required,
  minLength,
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
    </label>
  );
}
