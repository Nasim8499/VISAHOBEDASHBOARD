import { useState } from "react";
import { motion } from "framer-motion";
import { PageContainer, PageHeader } from "@/components/layout/Page";
import { Bot, Send, Sparkles, Brain, Cpu, Zap, Flame, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Agent = {
  id: string;
  name: string;
  tagline: string;
  icon: any;
  gradient: string;
  model: string;
};

const AGENTS: Agent[] = [
  { id: "openai",  name: "OpenAI",  tagline: "GPT reasoning & writing",       icon: Sparkles, gradient: "from-[#003B73] to-[#177BBB]", model: "openai/gpt-5-mini" },
  { id: "qwen",    name: "Qwen",    tagline: "Alibaba multilingual expert",   icon: Cpu,      gradient: "from-[#E63946] to-[#F1573D]", model: "qwen-plus" },
  { id: "gemini",  name: "Gemini",  tagline: "Google multimodal AI",          icon: Brain,    gradient: "from-[#177BBB] to-[#003B73]", model: "google/gemini-3-flash-preview" },
  { id: "grok",    name: "Grok",    tagline: "Real-time witty answers",       icon: Zap,      gradient: "from-[#F1573D] to-[#E63946]", model: "grok-beta" },
  { id: "minimax", name: "MiniMax", tagline: "Long-context generation",       icon: Flame,    gradient: "from-[#003B73] to-[#E63946]", model: "abab6.5-chat" },
  { id: "kimi",    name: "Kimi",    tagline: "Moonshot deep research",        icon: Wind,     gradient: "from-[#177BBB] to-[#F1573D]", model: "moonshot-v1-8k" },
];

export default function AIAgents() {
  const [active, setActive] = useState<Agent>(AGENTS[0]);
  const [prompt, setPrompt] = useState("");
  const [log, setLog] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!prompt.trim()) return;
    const userText = prompt.trim();
    setLog((l) => [...l, { role: "user", text: userText }]);
    setPrompt("");
    setLoading(true);
    try {
      // Mock response — wire to edge function when DashScope key is added
      await new Promise((r) => setTimeout(r, 600));
      setLog((l) => [
        ...l,
        {
          role: "agent",
          text: `**${active.name}** (${active.model}): I received "${userText}". Connect the DashScope API key in settings to enable live responses.`,
        },
      ]);
    } catch (e: any) {
      toast.error(e?.message || "Agent request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="AI Agents" subtitle="Switch between premium AI models in one workspace." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {AGENTS.map((a, i) => {
          const isActive = active.id === a.id;
          const Icon = a.icon;
          return (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, scale: 1.02 }}
              onClick={() => setActive(a)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
                isActive
                  ? "border-transparent text-white shadow-elegant"
                  : "border-border bg-card hover:shadow-elegant"
              )}
            >
              {isActive && (
                <div className={cn("absolute inset-0 bg-gradient-to-br", a.gradient)} />
              )}
              <div className="relative">
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-xl",
                    isActive ? "bg-white/20 text-white" : "bg-gradient-to-br text-white",
                    !isActive && a.gradient
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="mt-3 text-sm font-semibold">{a.name}</div>
                <div className={cn("text-[11px]", isActive ? "text-white/80" : "text-muted-foreground")}>
                  {a.tagline}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <header className={cn("flex items-center gap-3 bg-gradient-to-r p-4 text-white", active.gradient)}>
          <span className="grid size-10 place-items-center rounded-xl bg-white/20">
            <Bot className="size-5" />
          </span>
          <div>
            <div className="text-sm font-semibold">{active.name} Agent</div>
            <div className="text-[11px] text-white/80">Model: {active.model}</div>
          </div>
        </header>

        <div className="scrollbar-thin max-h-[480px] min-h-[280px] space-y-2 overflow-y-auto p-4 text-sm">
          {log.length === 0 && (
            <div className="grid place-items-center py-12 text-center text-muted-foreground">
              <Bot className="mb-2 size-8 opacity-50" />
              <div className="text-sm">Start chatting with {active.name}</div>
            </div>
          )}
          {log.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[88%] rounded-xl p-3",
                m.role === "user"
                  ? "ml-auto bg-gradient-blue text-white"
                  : "bg-muted"
              )}
            >
              {m.text}
            </div>
          ))}
          {loading && <div className="text-xs text-muted-foreground">{active.name} is thinking…</div>}
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={`Ask ${active.name}…`}
              className="flex-1 bg-transparent px-2 text-sm outline-none"
            />
            <button
              onClick={send}
              disabled={loading}
              className={cn("rounded-lg bg-gradient-to-br p-2 text-white transition disabled:opacity-50", active.gradient)}
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
