import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnimateIn } from "@/components/layout/animate-in";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PROVIDERS = [
  { name: "Strava", status: "connected", lastSync: "8 min ago", color: "hsl(12 90% 55%)" },
  { name: "Garmin Connect", status: "connected", lastSync: "12 min ago", color: "hsl(200 95% 55%)" },
  { name: "TrainingPeaks", status: "reauth", lastSync: "3 days ago", color: "hsl(210 90% 60%)" },
  { name: "Zwift", status: "available", lastSync: null, color: "hsl(25 95% 55%)" },
  { name: "Apple Health", status: "available", lastSync: null, color: "hsl(0 0% 90%)" },
  { name: "COROS", status: "available", lastSync: null, color: "hsl(45 95% 55%)" },
  { name: "Polar", status: "available", lastSync: null, color: "hsl(355 85% 55%)" },
  { name: "Suunto", status: "available", lastSync: null, color: "hsl(160 84% 45%)" },
] as const;

export default async function IntegrationsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations("integrations");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROVIDERS.map((p, i) => (
          <AnimateIn key={p.name} delay={i * 0.05}>
            <Card className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl font-display text-sm font-bold" style={{ background: `${p.color.replace(")", " / 0.15)")}`, color: p.color }}>
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium">{p.name}</span>
                </span>
                {p.status === "connected" && <Badge tone="positive">{t("connected")}</Badge>}
                {p.status === "reauth" && <Badge tone="warning">{t("reauth")}</Badge>}
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                {p.lastSync ? <span>{t("lastSync")}: {p.lastSync}</span> : <span>—</span>}
                {p.status === "available" && (
                  <button className="rounded-lg border border-border px-3 py-1.5 font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                    {t("connect")}
                  </button>
                )}
              </div>
            </Card>
          </AnimateIn>
        ))}
      </div>
    </div>
  );
}
