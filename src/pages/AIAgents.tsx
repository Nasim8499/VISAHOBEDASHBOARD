import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, Brain, Cpu, Zap, Flame, Wind, Plus, Settings2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Agent = {
  id: string;
  name: string;
  tagline: string;
  icon: any;
  gradient: string;
  ring: string;
  model: string;
};

const AGENTS: Agent[] = [
  { id: "openai",  name: "OpenAI",  tagline: "GPT reasoning & writing",     icon: Sparkles, gradient: "from-[#003B73] to-[#177BBB]", ring: "ring-[#177BBB]/40", model: "openai/gpt-5-mini" },
  { id: "qwen",    name: "Qwen",    tagline: "Alibaba multilingual expert", icon: Cpu,      gradient: "from-[#E63946] to-[#F1573D]", ring: "ring-[#F1573D]/40", model: "qwen-plus" },
  { id: "gemini",  name: "Gemini",  tagline: "Google multimodal AI",        icon: Brain,    gradient: "from-[#177BBB] to-[#003B73]", ring: "ring-[#003B73]/40", model: "google/gemini-3-flash-preview" },
  { id: "grok",    name: "Grok",    tagline: "Real-time witty answers",     icon: Zap,      gradient: "from-[#F1573D] to-[#E63946]", ring: "ring-[#E63946]/40", model: "grok-beta" },
  { id: "minimax", name: "MiniMax", tagline: "Long-context generation",     icon: Flame,    gradient: "from-[#003B73] to-[#E63946]", ring: "ring-[#E63946]/40", model: "abab6.5-chat" },
  { id: "kimi",    name: "Kimi",    tagline: "Moonshot deep research",      icon: Wind,     gradient: "from-[#177BBB] to-[#F1573D]", ring: "ring-[#F1573D]/40", model: "moonshot-v1-8k" },
];

const STORAGE_KEY = "vh.activeAgent";
const SUGGESTIONS = [
  "Summarize today's client pipeline",
  "Draft a polite follow-up email",
  "Translate visa instructions to Hindi",
  "Brainstorm a LinkedIn post about visas",
];

type Msg = { role: "user" | "agent"; text: string };

export default function AIAgents() {
  const [params, setParams] = useSearchParams();

  // Resolve initial agent: URL param > localStorage > default
  const initialId = useMemo(() => {
    const fromUrl = params.get("agent");
    if (fromUrl && AGENTS.find((a) => a.id === fromUrl)) return fromUrl;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && AGENTS.find((a) => a.id === stored)) return stored;
    } catch {}
    return AGENTS[0].id;
  }, []);

  const [activeId, setActiveId] = useState(initialId);
  const active = AGENTS.find((a) => a.id === activeId) ?? AGENTS[0];

  // Keep URL + localStorage in sync whenever agent changes
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, activeId); } catch {}
    if (params.get("agent") !== activeId) {
      const next = new URLSearchParams(params);
      next.set("agent", activeId);
      setParams(next, { replace: true });
    }
  }, [activeId]);

  // Respond to URL changes (back/forward, deep links)
  useEffect(() => {
    const fromUrl = params.get("agent");
    if (fromUrl && fromUrl !== activeId && AGENTS.find((a) => a.id === fromUrl)) {
      setActiveId(fromUrl);
    }
  }, [params]);

  const [prompt, setPrompt] = useState("");
  const [log, setLog] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [log, loading]);

  const send = async (text?: string) => {
    const value = (text ?? prompt).trim();
    if (!value) return;
    setLog((l) => [...l, { role: "user", text: value }]);
    setPrompt("");
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setLog((l) => [
        ...l,
        {
          role: "agent",
          text: `Hi — I'm **${active.name}** (${active.model}). You said: "${value}". Connect the DashScope API key to enable live responses.`,
        },
      ]);
    } catch (e: any) {
      toast.error(e?.message || "Agent request failed");
    } finally {
      setLoading(false);
    }
  };

  const firstName = "there";

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-background">
      {/* Top bar — Gemini-style */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className={cn("grid size-8 place-items-center rounded-full bg-gradient-to-br text-white shadow-sm", active.gradient)}>
            <active.icon className="size-4" />
          </span>
          <div className="text-sm font-medium">
            VisaHOBe <span className="text-muted-foreground">·</span>{" "}
            <span className="font-semibold">{active.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLog([])}
            className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            <Plus className="size-3.5" /> New chat
          </button>
          <button className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted">
            <Settings2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Agent pill row */}
      <div className="scrollbar-thin flex gap-2 overflow-x-auto border-b border-border/60 px-4 py-3 sm:px-6">
        {AGENTS.map((a) => {
          const isActive = a.id === activeId;
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              onClick={() => setActiveId(a.id)}
              className={cn(
                "group relative flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-all",
                isActive
                  ? "border-transparent text-white shadow-sm"
                  : "border-border/70 bg-card text-foreground/80 hover:border-border hover:bg-muted"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="agent-pill"
                  className={cn("absolute inset-0 rounded-full bg-gradient-to-r", a.gradient)}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon className="size-3.5" />
                {a.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
          {log.length === 0 ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-6 sm:pt-12"
            >
              <h1 className={cn("bg-gradient-to-r bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl", active.gradient)}>
                Hello, {firstName}
              </h1>
              <p className="mt-2 text-xl text-muted-foreground sm:text-2xl">
                How can <span className="font-medium text-foreground/80">{active.name}</span> help you today?
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    onClick={() => send(s)}
                    className="group flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition hover:border-border hover:bg-muted/40"
                  >
                    <span className="text-sm text-foreground/80">{s}</span>
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {log.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    {m.role === "agent" ? (
                      <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br text-white", active.gradient)}>
                        <active.icon className="size-4" />
                      </span>
                    ) : (
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
                        You
                      </span>
                    )}
                    <div className="flex-1 pt-1">
                      <div className="mb-1 text-xs font-medium text-muted-foreground">
                        {m.role === "agent" ? active.name : "You"}
                      </div>
                      <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                        {m.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <div className="flex gap-3">
                  <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br text-white", active.gradient)}>
                    <active.icon className="size-4" />
                  </span>
                  <div className="flex items-center gap-1.5 pt-2">
                    <span className="size-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.3s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.15s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-foreground/40" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border/60 bg-background/80 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <div className={cn("flex items-end gap-2 rounded-3xl border bg-card p-2 pl-5 shadow-sm transition-all", `ring-2 ${active.ring}`)}>
            <Bot className="mt-2 size-4 text-muted-foreground" />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={`Message ${active.name}…`}
              className="max-h-40 flex-1 resize-none bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => send()}
              disabled={loading || !prompt.trim()}
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40",
                active.gradient
              )}
            >
              <Send className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {active.name} may produce inaccurate information. Verify important details.
          </p>
        </div>
      </div>
    </div>
  );
}
