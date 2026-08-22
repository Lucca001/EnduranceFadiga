import { getTranslations, setRequestLocale } from "next-intl/server";
import { api } from "@/lib/api";
import { AnimateIn } from "@/components/layout/animate-in";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { Badge } from "@/components/ui/badge";

export default async function InjuryRiskPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations("injury");
  const risk = await api.injuryRisk();

  const gauges = [
    { label: t("injuryRisk"), value: risk.injury_risk_pct },
    { label: t("overtraining"), value: risk.overtraining_risk_pct },
    { label: t("decline"), value: risk.performance_decline_risk_pct },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {gauges.map((g, i) => (
          <AnimateIn key={g.label} delay={i * 0.08}>
            <Card className="flex flex-col items-center py-8">
              <ScoreRing score={g.value} label="%" />
              <p className="mt-3 text-sm font-medium text-muted">{g.label}</p>
            </Card>
          </AnimateIn>
        ))}
      </div>

      <AnimateIn delay={0.3} className="mt-6">
        <Card>
          <CardTitle className="mb-5">{t("factors")}</CardTitle>
          <div className="space-y-3">
            {risk.factors.map((f) => {
              const width = Math.min(100, Math.round((f.contribution / 1.2) * 100));
              return (
                <div key={f.name} className="rounded-xl bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{f.description}</p>
                    {f.elevated && <Badge tone="warning">elevated</Badge>}
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className={`h-full rounded-full ${f.elevated ? "bg-warning" : "bg-primary"}`}
                      style={{ width: `${Math.max(4, width)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </AnimateIn>
    </div>
  );
}
