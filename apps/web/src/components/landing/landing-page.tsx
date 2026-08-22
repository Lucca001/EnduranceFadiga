"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link, usePathname } from "@/i18n/routing";
import { ShaderCanvas } from "@/components/ui/aether-flow";
import { AnimateIn } from "@/components/layout/animate-in";
import { cn } from "@/lib/utils";
import {
  Activity, ArrowRight, Bot, CalendarRange, Check, Gauge,
  HeartPulse, Plug, SlidersHorizontal, Zap,
} from "lucide-react";

const FEATURE_ICONS = [Bot, Zap, HeartPulse, SlidersHorizontal, CalendarRange, Gauge];
const PROVIDERS = ["Strava", "Garmin", "TrainingPeaks", "Zwift", "Apple Health", "COROS", "Polar", "Suunto"];

type Feature = { name: string; desc: string };
type Step = { name: string; desc: string };
type Plan = { name: string; price: string; cta: string; popular: boolean; features: string[] };
type Stat = { value: string; label: string };

export function LandingPage() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <main className="relative">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 shadow-glow">
              <Activity className="h-4 w-4 text-primary" />
            </span>
            Endurance<span className="text-gradient">AI</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">{t("nav.features")}</a>
            <a href="#how" className="transition-colors hover:text-foreground">{t("nav.how")}</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">{t("nav.pricing")}</a>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden gap-1 text-xs sm:flex">
              {(["en", "pt"] as const).map((l) => (
                <Link key={l} href={pathname} locale={l}
                  className={cn("rounded-md px-2 py-1 uppercase", l === locale ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground")}>
                  {l}
                </Link>
              ))}
            </span>
            <Link href="/dashboard"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:brightness-110">
              {t("nav.open")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero with Aether Flow shader ────────────────────── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <ShaderCanvas hue={168} speed={0.12} intensity={0.65} complexity={5.5} warp={0.5} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-24 text-center">
          <AnimateIn>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
              {t("hero.badge")}
            </span>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <h1 className="mt-8 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
              {t("hero.title")}<br />
              <span className="text-gradient">{t("hero.titleAccent")}</span>
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-foreground/70">
              {t("hero.subtitle")}
            </p>
          </AnimateIn>
          <AnimateIn delay={0.3} className="mt-10 flex justify-center gap-4">
            <Link href="/dashboard"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 font-medium text-primary-foreground shadow-glow transition-all hover:brightness-110">
              {t("hero.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how"
              className="inline-flex h-12 items-center rounded-xl border border-white/15 bg-white/5 px-7 font-medium backdrop-blur-sm transition-colors hover:bg-white/10">
              {t("hero.ctaSecondary")}
            </a>
          </AnimateIn>

          <AnimateIn delay={0.45} className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md sm:grid-cols-4">
            {(t.raw("hero.stats") as Stat[]).map((s) => (
              <div key={s.label} className="bg-background/60 p-5">
                <p className="font-display text-xl font-semibold text-gradient sm:text-2xl">{s.value}</p>
                <p className="mt-1 text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </AnimateIn>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28">
        <AnimateIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t("features.title")}</h2>
          <p className="mt-4 text-muted">{t("features.subtitle")}</p>
        </AnimateIn>
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(t.raw("features.items") as Feature[]).map((f, i) => {
            const Icon = FEATURE_ICONS[i] ?? Gauge;
            return (
              <AnimateIn key={f.name} delay={i * 0.06}>
                <div className="glass group h-full p-6 transition-colors hover:border-primary/30">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-all group-hover:shadow-glow">
                    <Icon className="h-5 w-5 text-primary" />
                  </span>
                  <h3 className="mt-4 font-display font-semibold">{f.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section id="how" className="scroll-mt-24 border-y border-border bg-surface/50 py-28">
        <div className="mx-auto max-w-6xl px-6">
          <AnimateIn className="text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t("how.title")}</h2>
          </AnimateIn>
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {(t.raw("how.steps") as Step[]).map((s, i) => (
              <AnimateIn key={s.name} delay={i * 0.1}>
                <div className="relative">
                  <span className="font-display text-6xl font-semibold text-primary/15">0{i + 1}</span>
                  <h3 className="mt-2 font-display text-xl font-semibold">{s.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <AnimateIn>
          <p className="text-sm font-medium uppercase tracking-widest text-muted">{t("integrations.title")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {PROVIDERS.map((p) => (
              <span key={p} className="rounded-full border border-border bg-card px-5 py-2.5 font-display text-sm font-medium text-foreground/80">
                {p}
              </span>
            ))}
          </div>
        </AnimateIn>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-28">
        <AnimateIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t("pricing.title")}</h2>
          <p className="mt-4 text-muted">{t("pricing.subtitle")}</p>
        </AnimateIn>
        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {(t.raw("pricing.plans") as Plan[]).map((p, i) => (
            <AnimateIn key={p.name} delay={i * 0.08}>
              <div className={cn("glass relative flex h-full flex-col p-7", p.popular && "border-primary/50 shadow-glow")}>
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {t("pricing.popularLabel")}
                  </span>
                )}
                <h3 className="font-display font-semibold">{p.name}</h3>
                <p className="mt-3 font-display text-4xl font-semibold">
                  {p.price}<span className="text-base font-normal text-muted">{t("pricing.month")}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard"
                  className={cn(
                    "mt-8 inline-flex h-11 items-center justify-center rounded-xl text-sm font-medium transition-all",
                    p.popular
                      ? "bg-primary text-primary-foreground shadow-glow hover:brightness-110"
                      : "border border-border bg-card hover:bg-border/60"
                  )}>
                  {p.cta}
                </Link>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border py-28">
        <ShaderCanvas hue={168} speed={0.08} intensity={0.4} complexity={4} warp={0.35} className="opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">{t("ctaFinal.title")}</h2>
          <p className="mt-4 text-muted">{t("ctaFinal.subtitle")}</p>
          <Link href="/dashboard"
            className="mt-10 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 font-medium text-primary-foreground shadow-glow transition-all hover:brightness-110">
            {t("ctaFinal.cta")} <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-3">
          <div>
            <span className="flex items-center gap-2.5 font-display text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                <Activity className="h-4 w-4 text-primary" />
              </span>
              Endurance<span className="text-gradient">AI</span>
            </span>
            <p className="mt-3 max-w-xs text-sm text-muted">{t("footer.tagline")}</p>
          </div>
          <div className="text-sm">
            <p className="font-medium">{t("footer.product")}</p>
            <ul className="mt-3 space-y-2 text-muted">
              <li><a href="#features" className="hover:text-foreground">{t("footer.links.features")}</a></li>
              <li><a href="#pricing" className="hover:text-foreground">{t("footer.links.pricing")}</a></li>
              <li><Link href="/dashboard" className="hover:text-foreground">{t("footer.links.dashboard")}</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-medium">{t("footer.company")}</p>
            <ul className="mt-3 space-y-2 text-muted">
              <li><a href="#" className="hover:text-foreground">{t("footer.links.about")}</a></li>
              <li><a href="mailto:hello@enduranceai.app" className="hover:text-foreground">{t("footer.links.contact")}</a></li>
              <li className="flex items-center gap-2 pt-1"><Plug className="h-3.5 w-3.5" /> hello@enduranceai.app</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} EnduranceAI · {t("footer.rights")}
        </div>
      </footer>
    </main>
  );
}
