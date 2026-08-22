import { getTranslations, setRequestLocale } from "next-intl/server";
import { api } from "@/lib/api";
import { formatDuration, formatPace } from "@/lib/format";
import { AnimateIn } from "@/components/layout/animate-in";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { Droplets, Flame } from "lucide-react";

const LABELS: Record<string, string> = {
  "5k": "5 km", "10k": "10 km", half: "Half Marathon", marathon: "Marathon",
  "70.3": "Ironman 70.3", ironman: "Ironman",
};

export default async function PredictionsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations("predictions");
  const [races, plan] = await Promise.all([api.races(), api.racePlan("half")]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(races).map(([key, r], i) => (
          <AnimateIn key={key} delay={i * 0.06}>
            <Card>
              <CardTitle>{LABELS[key] ?? key}</CardTitle>
              <CardValue className="text-gradient">{formatDuration(r.predicted_seconds)}</CardValue>
              <p className="mt-2 text-xs text-muted">
                {formatDuration(r.ci_low_seconds)} – {formatDuration(r.ci_high_seconds)} · {t("confidence")}
              </p>
              <p className="mt-1 text-xs text-muted">{t("pace")}: {formatPace(r.pace_sec_per_km)}</p>
            </Card>
          </AnimateIn>
        ))}
      </div>

      <AnimateIn delay={0.4} className="mt-8">
        <Card>
          <CardTitle className="mb-5">{t("planTitle")} — Half Marathon</CardTitle>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted">{t("pacing")}</p>
              <div className="space-y-2">
                {plan.pacing.map((p) => (
                  <div key={p.segment} className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm">
                    <span className="capitalize text-muted">{p.segment.replace(/_/g, " ")}</span>
                    <span className="font-medium">{formatPace(p.pace_sec_per_km)} · {p.power_watts}W</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted">{t("nutrition")}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-surface p-4">
                  <Flame className="h-4 w-4 text-warning" />
                  <p className="mt-2 font-display text-xl font-semibold">{plan.nutrition.carbs_g_per_hour}g</p>
                  <p className="text-xs text-muted">{t("carbs")} · {plan.nutrition.carbs_g_total}g total</p>
                </div>
                <div className="rounded-xl bg-surface p-4">
                  <Droplets className="h-4 w-4 text-accent" />
                  <p className="mt-2 font-display text-xl font-semibold">{plan.nutrition.fluid_ml_per_hour}ml</p>
                  <p className="text-xs text-muted">{t("fluid")} · {plan.nutrition.fluid_ml_total}ml total</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </AnimateIn>
    </div>
  );
}
