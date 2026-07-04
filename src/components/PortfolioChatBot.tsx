import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, X, Send, Sparkles, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const STORAGE_KEY = "gk-portfolio-chat-v1";

const STARTER_PROMPTS = [
  "What is Ganesh working on?",
  "Tell me about his projects",
  "What are his top skills?",
  "How can I contact him?",
];

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: UIMessage[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* quota — ignore */
  }
}

function messageText(m: UIMessage): string {
  if (Array.isArray((m as { parts?: unknown }).parts)) {
    return (m as UIMessage).parts
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("");
  }
  return (m as unknown as { content?: string }).content ?? "";
}

export function PortfolioChatBot() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInitialMessages(loadMessages());
    setHydrated(true);
  }, []);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    messages: initialMessages,
  });

  useEffect(() => {
    if (hydrated) saveMessages(messages);
  }, [messages, hydrated]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, status]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  const isLoading = status === "submitted" || status === "streaming";

  async function handleSend(text?: string) {
    const value = (text ?? input).trim();
    if (!value || isLoading) return;
    setInput("");
    await sendMessage({ text: value });
  }

  function handleReset() {
    setMessages([]);
    saveMessages([]);
  }

  return (
    <>
      {/* Floating Trigger */}
      <button
        type="button"
        aria-label={open ? "Close chatbot" : "Open chatbot — ask about Ganesh"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[60] group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_10px_40px_-10px_oklch(0.85_0.18_165/0.7)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:h-16 sm:w-16"
      >
        <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-30 group-hover:opacity-60" aria-hidden="true" />
        {open ? <X className="relative h-6 w-6" /> : <MessageCircle className="relative h-6 w-6 sm:h-7 sm:w-7" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat with Ganesh's AI assistant"
          className="fixed bottom-24 right-4 z-[60] flex h-[min(600px,80vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.16_0.02_260)]/95 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200 sm:right-5"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent px-4 py-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-sm font-semibold text-foreground">Ask about Ganesh</div>
              <div className="text-[11px] text-muted-foreground">Powered by Gemini · Portfolio assistant</div>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset conversation"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm text-muted-foreground">
                  <span className="text-foreground">Hi 👋</span> I'm Ganesh's AI assistant. Ask me about his experience, skills, projects, or how to get in touch.
                </div>
                <div className="space-y-1.5">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSend(p)}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const text = messageText(m);
              if (!text) return null;
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  {isUser ? (
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                      {text}
                    </div>
                  ) : (
                    <div className="max-w-[90%] text-sm text-foreground/90 leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1 [&_li]:my-0.5 [&_strong]:text-foreground [&_strong]:font-semibold [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs">
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error.message.includes("429")
                  ? "Rate limit reached — please try again in a moment."
                  : error.message.includes("402")
                  ? "AI credits exhausted. Please try later."
                  : "Couldn't reach the assistant. Please try again."}
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="border-t border-white/10 bg-black/20 p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Ask about experience, projects, skills…"
                rows={1}
                maxLength={500}
                aria-label="Message"
                className="flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-24"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground/70">AI-generated — may occasionally be inaccurate.</p>
          </form>
        </div>
      )}
    </>
  );
}
