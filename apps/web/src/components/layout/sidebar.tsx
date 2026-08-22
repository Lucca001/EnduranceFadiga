"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
  Activity, Bot, CalendarRange, Gauge, HeartPulse, Plug, SlidersHorizontal, Zap,
} from "lucide-react";

const items = [
  { href: "/dashboard", key: "dashboard", icon: Gauge },
  { href: "/coach", key: "coach", icon: Bot },
  { href: "/predictions", key: "predictions", icon: Zap },
  { href: "/injury-risk", key: "injuryRisk", icon: HeartPulse },
  { href: "/simulator", key: "simulator", icon: SlidersHorizontal },
  { href: "/reports", key: "reports", icon: CalendarRange },
  { href: "/integrations", key: "integrations", icon: Plug },
] as const;

export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-surface/80 backdrop-blur-xl lg:flex">
      <Link href="/" className="flex items-center gap-2.5 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 shadow-glow">
          <Activity className="h-5 w-5 text-primary" />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">
          Endurance<span className="text-gradient">AI</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ href, key, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted hover:bg-card hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t(key)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between rounded-xl bg-card px-3 py-2 text-xs text-muted">
          <span>Idioma / Language</span>
          <span className="flex gap-1">
            {(["en", "pt"] as const).map((l) => (
              <Link
                key={l}
                href={pathname}
                locale={l}
                className={cn("rounded-md px-2 py-0.5 uppercase", l === locale ? "bg-primary/15 text-primary" : "hover:text-foreground")}
              >
                {l}
              </Link>
            ))}
          </span>
        </div>
      </div>
    </aside>
  );
}
