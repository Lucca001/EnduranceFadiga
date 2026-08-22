"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import { AnimateIn } from "@/components/layout/animate-in";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

type Result = Awaited<ReturnType<typeof api.simulate>>;

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium">{value > 0 && label.includes("%") ? "+" : ""}{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[hsl(160,84%,45%)]"
      />
    </div>
  );
}

export default function SimulatorPage() {
  const t = useTranslations("simulator");
  const [weight, setWeight] = useState(0);
  const [sleep, setSleep] = useState(6.8);
  const [volume, setVolume] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult(await api.simulate({ weight_delta_kg: weight, sleep_hours: sleep, volume_delta_pct: volume }));
    setLoading(false);
  }

  const rows = result
    ? [
        { label: "Performance Score", before: result.before.performance_score.score, after: result.after.performance_score.score, fmt: (v: number) => `${v}/100`, higherBetter: true },
        { label: "Injury Risk", before: result.before.injury_risk.injury_risk_pct, after: result.after.injury_risk.injury_risk_pct, fmt: (v: number) => `${v}%`, higherBetter: false },
        { label: "10k", before: result.before.race_10k.predicted_seconds, after: result.after.race_10k.predicted_seconds, fmt: formatDuration, higherBetter: false },
        { label: "Half Marathon", before: result.before.race_half.predicted_seconds, after: result.after.race_half.predicted_seconds, fmt: formatDuration, higherBetter: false },
      ]
    : [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <AnimateIn className="lg:col-span-2">
          <Card className="space-y-6">
            <Slider label={t("weight")} value={weight} min={-8} max={8} step={0.5} unit=" kg" onChange={setWeight} />
            <Slider label={t("sleepH")} value={sleep} min={5} max={10} step={0.5} unit="h" onChange={setSleep} />
            <Slider label={`${t("volume")}`} value={volume} min={-30} max={30} step={5} unit="%" onChange={setVolume} />
            <Button onClick={run} disabled={loading} className="w-full">
              {t("run")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </AnimateIn>

        <AnimateIn delay={0.1} className="lg:col-span-3">
          <Card className="h-full">
            <CardTitle className="mb-4">{t("before")} → {t("after")}</CardTitle>
            {!result && <p className="py-12 text-center text-sm text-muted">—</p>}
            <div className="space-y-2">
              {rows.map((r) => {
                const improved = r.higherBetter ? r.after > r.before : r.after < r.before;
                return (
                  <div key={r.label} className="flex items-center justify-between rounded-xl bg-surface px-4 py-3.5 text-sm">
                    <span className="text-muted">{r.label}</span>
                    <span className="flex items-center gap-2.5 font-medium">
                      <span className="text-muted line-through decoration-border">{r.fmt(r.before)}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted" />
                      <span className={improved ? "text-primary" : "text-danger"}>{r.fmt(r.after)}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </AnimateIn>
      </div>
    </div>
  );
}
