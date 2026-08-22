import { getTranslations, setRequestLocale } from "next-intl/server";
import { api } from "@/lib/api";
import { AnimateIn } from "@/components/layout/animate-in";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ReportsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations("reports");
  const r = await api.weeklyReport();

  const stats = [
    { label: t("volume"), value: `${r.volume.hours}h`, sub: `${r.volume.km_run} km run` },
    { label: "CTL / ATL", value: `${r.load.ctl} / ${r.load.atl}`, sub: `TSB ${r.load.tsb}` },
    { label: "Ramp", value: `${r.load.ramp_pct > 0 ? "+" : ""}${r.load.ramp_pct}%`, sub: "week over week" },
    { label: "HRV", value: `${r.recovery.hrv_delta_pct}%`, sub: `sleep ${r.recovery.sleep_avg_h}h avg` },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <AnimateIn key={s.label} delay={i * 0.06}>
            <Card className="p-5">
              <CardTitle>{s.label}</CardTitle>
              <CardValue className="text-2xl">{s.value}</CardValue>
              <p className="mt-1 text-xs text-muted">{s.sub}</p>
            </Card>
          </AnimateIn>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnimateIn delay={0.25}>
          <Card>
            <CardTitle className="mb-4">{t("strengths")}</CardTitle>
            <div className="space-y-3">
              {r.strengths.map((s) => (
                <div key={s.title} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm font-medium text-primary">{s.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </AnimateIn>
        <AnimateIn delay={0.3}>
          <Card>
            <CardTitle className="mb-4">{t("recommendations")}</CardTitle>
            <div className="space-y-3">
              {r.recommendations.map((s) => (
                <div key={s.title} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center gap-2">
                    <Badge tone={s.severity}>{s.severity}</Badge>
                    <p className="text-sm font-medium">{s.title}</p>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </AnimateIn>
      </div>
    </div>
  );
}
