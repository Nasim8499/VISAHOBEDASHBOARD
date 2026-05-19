import { PageContainer, PageHeader } from "@/components/layout/Page";
import { Sparkles, Send } from "lucide-react";
import { useState } from "react";

const tools = [
  { title: "Business Name Generator", desc: "Brainstorm unique, brandable names." },
  { title: "Slogan Generator", desc: "Catchy taglines tuned to your audience." },
  { title: "Brand Strategy Writer", desc: "Mission, vision, voice, positioning." },
  { title: "Logo Prompt Generator", desc: "Direction-rich prompts for designers." },
  { title: "Social Caption Generator", desc: "Posts with hooks and hashtags." },
  { title: "Facebook Ad Copy Generator", desc: "Conversion-tested ad variations." },
  { title: "Website Structure Generator", desc: "Sitemaps and section blueprints." },
  { title: "Proposal Writer", desc: "Professional client proposals." },
  { title: "Client Reply Writer", desc: "Friendly, on-brand client responses." },
];

export default function AIAssistant() {
  const [draft, setDraft] = useState("");
  const [log, setLog] = useState<string[]>([
    "VisaHOBe AI: Hi! I'm ready to help with naming, copy, strategy and replies.",
  ]);
  const send = () => {
    if (!draft.trim()) return;
    setLog((l) => [...l, `You: ${draft}`, "VisaHOBe AI: Here are 3 polished options ready to share with your client…"]);
    setDraft("");
  };

  return (
    <PageContainer>
      <PageHeader title="AI Assistant" subtitle="Premium AI tools for branding, marketing and client comms." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tools.map((t) => (
            <button
              key={t.title}
              className="group text-left rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-hero text-white">
                <Sparkles className="size-4" />
              </span>
              <h3 className="mt-3 text-sm font-semibold">{t.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
            </button>
          ))}
        </div>

        <aside className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
          <header className="border-b border-border p-4">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-hero text-white">
                <Sparkles className="size-4" />
              </span>
              <div>
                <div className="text-sm font-semibold">VisaHOBe AI</div>
                <div className="text-[11px] text-success">● Ready</div>
              </div>
            </div>
          </header>
          <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-4 text-sm">
            {log.map((m, i) => (
              <div key={i} className={`rounded-xl p-3 ${m.startsWith("You:") ? "ml-auto max-w-[85%] bg-gradient-blue text-white" : "max-w-[90%] bg-muted"}`}>
                {m}
              </div>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask the assistant…"
                className="flex-1 bg-transparent px-2 text-sm outline-none"
              />
              <button onClick={send} className="rounded-lg bg-gradient-blue p-2 text-white">
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
