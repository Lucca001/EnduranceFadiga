import { getTranslations, setRequestLocale } from "next-intl/server";
import { api } from "@/lib/api";
import { MOCK } from "@/lib/mock";
import { formatPace } from "@/lib/format";
import { AnimateIn } from "@/components/layout/animate-in";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { MetricCard } from "@/components/dashboard/metric-card";
import { LoadChart } from "@/components/dashboard/load-chart";
import { HrvChart } from "@/components/dashboard/hrv-chart";
import { ActivityList } from "@/components/dashboard/activity-list";

export default async function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  const [data, insights] = await Promise.all([api.dashboard(), api.insights()]);
  const m = data.metrics;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={`${t("title")}, Alex`} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <AnimateIn className="lg:row-span-2">
          <Card className="flex h-full flex-col items-center justify-center gap-2 py-8">
            <ScoreRing score={data.performance_score.score} label={t("performanceScore")} />
            <div className="mt-4 grid w-full grid-cols-2 gap-x-6 gap-y-1.5 px-4 text-xs">
              {Object.entries(data.performance_score.components).slice(0, 6).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="capitalize text-muted">{k.replace("_", " ")}</span>
                  <span className="font-medium">{v as number}</span>
                </div>
              ))}
            </div>
          </Card>
        </AnimateIn>

        <MetricCard delay={0.05} title={t("trainingLoad")} value={m.ctl} unit="CTL" trend={{ value: `ATL ${m.atl}`, positive: m.atl < m.ctl * 1.3 }} />
        <MetricCard delay={0.1} title={t("recovery")} value={data.readiness.tsb} trend={{ value: `ACWR ${data.readiness.acwr}`, positive: data.readiness.acwr < 1.3 }} />
        <MetricCard delay={0.15} title={t("sleep")} value={m.sleep_hours_7d} unit="h" trend={{ value: m.sleep_hours_7d >= 7 ? "On target" : "Below 7h target", positive: m.sleep_hours_7d >= 7 }} />
        <MetricCard delay={0.2} title={t("hrv")} value={m.hrv_rmssd} unit="ms" trend={{ value: `${data.readiness.hrv_delta_pct}% ${t("vsBaseline")}`, positive: data.readiness.hrv_delta_pct >= 0 }} />
        <MetricCard delay={0.25} title={t("vo2max")} value={m.vo2max} unit="ml/kg/min" />
        <MetricCard delay={0.3} title={t("ftp")} value={m.ftp_watts} unit="W" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnimateIn delay={0.35}>
          <Card>
            <CardTitle>{t("loadChartTitle")}</CardTitle>
            <p className="mb-4 mt-0.5 text-xs text-muted">{t("loadChartSubtitle")}</p>
            <LoadChart data={MOCK.dashboard.loadSeries} />
          </Card>
        </AnimateIn>
        <AnimateIn delay={0.4}>
          <Card>
            <CardTitle className="mb-4">{t("hrvChartTitle")}</CardTitle>
            <HrvChart data={MOCK.dashboard.hrvSeries} />
          </Card>
        </AnimateIn>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnimateIn delay={0.45}>
          <Card>
            <CardTitle className="mb-2">{t("recentActivities")}</CardTitle>
            <ActivityList items={MOCK.dashboard.activities} />
          </Card>
        </AnimateIn>
        <AnimateIn delay={0.5}>
          <Card>
            <CardTitle className="mb-4">{t("insights")}</CardTitle>
            <div className="space-y-4">
              {insights.insights.map((i) => (
                <div key={i.title} className="rounded-xl border border-border bg-surface/60 p-4">
                  <div className="flex items-center gap-2">
                    <Badge tone={i.severity}>{i.severity}</Badge>
                    <p className="text-sm font-medium">{i.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{i.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </AnimateIn>
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        Threshold pace {formatPace(m.threshold_pace_sec_km)} · {m.weekly_hours}h this week
      </p>
    </div>
  );
}
