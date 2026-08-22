import { Badge } from "@/components/ui/badge";
import { formatDuration, formatKm, formatPace } from "@/lib/format";
import { Bike, Footprints, Waves } from "lucide-react";

type Item = {
  name: string; sport: string; date: string;
  duration: number; distance: number; load: number;
  pace?: number; power?: number;
};

const ICONS = { RUN: Footprints, RIDE: Bike, SWIM: Waves } as const;

export function ActivityList({ items }: { items: Item[] }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((a) => {
        const Icon = ICONS[a.sport as keyof typeof ICONS] ?? Footprints;
        return (
          <li key={`${a.name}-${a.date}`} className="flex items-center gap-4 py-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{a.name}</p>
              <p className="text-xs text-muted">
                {a.date} · {formatDuration(a.duration)} · {formatKm(a.distance)}
                {a.pace ? ` · ${formatPace(a.pace)}` : ""}
                {a.power ? ` · ${a.power}W` : ""}
              </p>
            </div>
            <Badge tone="neutral">TSS {a.load}</Badge>
          </li>
        );
      })}
    </ul>
  );
}
