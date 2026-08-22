"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Bot, Send, User } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export default function CoachPage() {
  const t = useTranslations("coach");
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    const res = await api.askCoach(question, locale);
    setMessages((m) => [...m, { role: "assistant", content: res.answer }]);
    setLoading(false);
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="glass flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 shadow-glow">
                <Bot className="h-7 w-7 text-primary" />
              </span>
              <div className="flex max-w-md flex-wrap justify-center gap-2">
                {t.raw("suggestions").map((s: string) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="rounded-full border border-border bg-card px-4 py-2 text-xs text-muted transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${m.role === "user" ? "bg-border" : "bg-primary/15"}`}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                </span>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-primary/15" : "bg-surface"}`}>
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-1.5 pl-11">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary/60"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); ask(input); }}
          className="flex gap-3 border-t border-border p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            className="h-11 flex-1 rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors placeholder:text-muted focus:border-primary/50"
          />
          <Button type="submit" disabled={loading} className="h-11 w-11 p-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
