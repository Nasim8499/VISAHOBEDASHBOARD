import { PageContainer, PageHeader } from "@/components/layout/Page";
import { businesses } from "@/data/mock";
import { useState } from "react";
import { Paperclip, Mic, Smile, Send, Search } from "lucide-react";

interface Msg { id: number; from: "client" | "team" | "note"; text: string; time: string }

const seed: Record<string, Msg[]> = Object.fromEntries(
  businesses.map((b) => [
    b.id,
    [
      { id: 1, from: "client", text: `Hey team, excited about the ${b.name} brand!`, time: "9:12" },
      { id: 2, from: "team", text: `Welcome! We've shared the brand brief — please review.`, time: "9:14" },
      { id: 3, from: "note", text: `Internal: Sara to revise logo by Thursday.`, time: "9:20" },
    ],
  ])
);

export default function Chat() {
  const [active, setActive] = useState(businesses[0].id);
  const [messages, setMessages] = useState(seed);
  const [draft, setDraft] = useState("");
  const [internal, setInternal] = useState(false);
  const ws = businesses.find((b) => b.id === active)!;

  const send = () => {
    if (!draft.trim()) return;
    const next = { ...messages };
    next[active] = [
      ...next[active],
      { id: Date.now(), from: internal ? "note" : "team", text: draft, time: "now" },
    ];
    setMessages(next);
    setDraft("");
  };

  return (
    <PageContainer className="!py-0 lg:!py-8">
      <PageHeader title="Live Chat" subtitle="Central comms hub across every client business." />
      <div className="grid h-[calc(100vh-220px)] grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[300px_1fr]">
        {/* List */}
        <aside className="hidden border-r border-border md:flex md:flex-col">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm" placeholder="Search messages" />
            </div>
          </div>
          <ul className="scrollbar-thin flex-1 overflow-y-auto">
            {businesses.map((b) => (
              <li key={b.id}>
                <button
                  onClick={() => setActive(b.id)}
                  className={`flex w-full items-center gap-3 border-b border-border p-3 text-left transition ${
                    active === b.id ? "bg-muted/60" : "hover:bg-muted/40"
                  }`}
                >
                  <span className="grid size-10 place-items-center rounded-xl text-lg text-white" style={{ background: b.color }}>
                    {b.logo}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{b.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{b.lastActivity}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Conversation */}
        <div className="flex flex-col">
          <header className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl text-white" style={{ background: ws.color }}>{ws.logo}</span>
              <div>
                <div className="text-sm font-semibold">{ws.name}</div>
                <div className="text-xs text-success">● Online</div>
              </div>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button className="rounded-lg border border-border px-2.5 py-1.5 text-xs">Assign</button>
              <button className="rounded-lg border border-border px-2.5 py-1.5 text-xs">Quick replies</button>
            </div>
          </header>

          <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4">
            {messages[active].map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from === "team" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    m.from === "team"
                      ? "bg-gradient-blue text-white"
                      : m.from === "note"
                      ? "border border-warning/30 bg-warning/10 text-foreground"
                      : "bg-muted"
                  }`}
                >
                  {m.from === "note" && (
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-warning">Internal note</div>
                  )}
                  {m.text}
                  <div className="mt-1 text-[10px] opacity-70">{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-3">
            <div className="mb-2 flex items-center gap-2 text-xs">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={internal}
                  onChange={(e) => setInternal(e.target.checked)}
                  className="size-3.5 accent-[hsl(var(--warning))]"
                />
                <span className="font-semibold">Internal note mode</span>
              </label>
            </div>
            <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2">
              <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><Paperclip className="size-4" /></button>
              <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><Smile className="size-4" /></button>
              <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><Mic className="size-4" /></button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={internal ? "Write internal note…" : `Message ${ws.name}…`}
                className="flex-1 bg-transparent px-2 text-sm outline-none"
              />
              <button onClick={send} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-blue px-3 py-2 text-xs font-semibold text-white">
                Send <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
