"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { date: string; ctl: number; atl: number; tsb: number };

export function LoadChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="ctl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(160 84% 45%)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(160 84% 45%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="atl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(200 95% 55%)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="hsl(200 95% 55%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="hsl(228 12% 14%)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: "hsl(228 8% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={40} />
        <YAxis tick={{ fill: "hsl(228 8% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "hsl(228 15% 10%)", border: "1px solid hsl(228 12% 16%)", borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: "hsl(228 8% 55%)" }}
        />
        <Area type="monotone" dataKey="ctl" name="Fitness (CTL)" stroke="hsl(160 84% 45%)" strokeWidth={2} fill="url(#ctl)" />
        <Area type="monotone" dataKey="atl" name="Fatigue (ATL)" stroke="hsl(200 95% 55%)" strokeWidth={2} fill="url(#atl)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
