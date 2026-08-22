"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { date: string; hrv: number; restingHr: number };

export function HrvChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="hsl(228 12% 14%)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: "hsl(228 8% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={40} />
        <YAxis tick={{ fill: "hsl(228 8% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "hsl(228 15% 10%)", border: "1px solid hsl(228 12% 16%)", borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: "hsl(228 8% 55%)" }}
        />
        <Line type="monotone" dataKey="hrv" name="HRV (rMSSD)" stroke="hsl(160 84% 45%)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="restingHr" name="Resting HR" stroke="hsl(0 78% 60%)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
