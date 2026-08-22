"use client";

import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { AnimateIn } from "@/components/layout/animate-in";
import { cn } from "@/lib/utils";

export function MetricCard({
  title, value, unit, trend, delay = 0,
}: {
  title: string;
  value: string | number;
  unit?: string;
  trend?: { value: string; positive: boolean };
  delay?: number;
}) {
  return (
    <AnimateIn delay={delay}>
      <Card className="p-5">
        <CardTitle>{title}</CardTitle>
        <CardValue className="flex items-baseline gap-1.5">
          {value}
          {unit && <span className="text-base font-normal text-muted">{unit}</span>}
        </CardValue>
        {trend && (
          <p className={cn("mt-1 text-xs font-medium", trend.positive ? "text-primary" : "text-danger")}>
            {trend.value}
          </p>
        )}
      </Card>
    </AnimateIn>
  );
}
