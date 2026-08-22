/** Realistic demo data mirroring the API response shapes. */

const loadSeries = Array.from({ length: 90 }, (_, i) => {
  const day = i - 89;
  const ctl = 55 + i * 0.26 + Math.sin(i / 9) * 3;
  const atl = ctl + Math.sin(i / 5) * 14 + (i > 75 ? 12 : 0);
  return {
    date: new Date(Date.now() + day * 86400000).toISOString().slice(0, 10),
    ctl: Math.round(ctl * 10) / 10,
    atl: Math.round(atl * 10) / 10,
    tsb: Math.round((ctl - atl) * 10) / 10,
  };
});

const hrvSeries = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() + (i - 29) * 86400000).toISOString().slice(0, 10),
  hrv: Math.round(66 + Math.sin(i / 4) * 5 - (i > 22 ? (i - 22) * 1.2 : 0)),
  restingHr: Math.round(46 + (i > 22 ? (i - 22) * 0.4 : 0) + Math.sin(i / 3)),
}));

export const MOCK = {
  dashboard: {
    performance_score: {
      score: 78,
      components: { sleep: 51, hrv: 33, load_balance: 82, recovery: 27, consistency: 87, volume: 82, intensity: 90, fitness_trend: 78 },
    },
    readiness: { acwr: 1.17, tsb: -13.7, hrv_delta_pct: -12.1 },
    metrics: {
      vo2max: 54.2, ftp_watts: 268, threshold_pace_sec_km: 255,
      ctl: 78.4, atl: 92.1, hrv_rmssd: 58, resting_hr: 46,
      sleep_hours_7d: 6.8, weekly_hours: 11.5,
    },
    loadSeries,
    hrvSeries,
    activities: [
      { name: "Threshold Intervals 6×1k", sport: "RUN", date: "Today", duration: 3720, distance: 12400, load: 96, pace: 268 },
      { name: "Endurance Ride", sport: "RIDE", date: "Yesterday", duration: 7200, distance: 58000, load: 118, power: 198 },
      { name: "Recovery Swim", sport: "SWIM", date: "Thu", duration: 2400, distance: 2200, load: 34 },
      { name: "Long Run", sport: "RUN", date: "Wed", duration: 6300, distance: 21100, load: 142, pace: 298 },
      { name: "Tempo Ride", sport: "RIDE", date: "Tue", duration: 4500, distance: 42000, load: 89, power: 224 },
    ],
  },

  races: {
    "5k": { predicted_seconds: 1198, ci_low_seconds: 1168, ci_high_seconds: 1228, pace_sec_per_km: 240 },
    "10k": { predicted_seconds: 2576, ci_low_seconds: 2512, ci_high_seconds: 2640, pace_sec_per_km: 258 },
    "half": { predicted_seconds: 5688, ci_low_seconds: 5546, ci_high_seconds: 5830, pace_sec_per_km: 270 },
    "marathon": { predicted_seconds: 12122, ci_low_seconds: 11819, ci_high_seconds: 12425, pace_sec_per_km: 287 },
    "70.3": { predicted_seconds: 19080, ci_low_seconds: 18603, ci_high_seconds: 19557, pace_sec_per_km: 169 },
    "ironman": { predicted_seconds: 41400, ci_low_seconds: 40365, ci_high_seconds: 42435, pace_sec_per_km: 183 },
  } as Record<string, { predicted_seconds: number; ci_low_seconds: number; ci_high_seconds: number; pace_sec_per_km: number }>,

  racePlan: {
    prediction: { predicted_seconds: 5688, pace_sec_per_km: 270 },
    pacing: [
      { segment: "first_third", pace_sec_per_km: 275, power_watts: 239 },
      { segment: "middle_third", pace_sec_per_km: 270, power_watts: 244 },
      { segment: "final_third", pace_sec_per_km: 265, power_watts: 249 },
    ],
    nutrition: { carbs_g_per_hour: 60, carbs_g_total: 95, fluid_ml_per_hour: 600, fluid_ml_total: 948, sodium_mg_per_hour: 500 },
  },

  injuryRisk: {
    injury_risk_pct: 34, overtraining_risk_pct: 41, performance_decline_risk_pct: 37, level: "moderate",
    factors: [
      { name: "ramp_rate", contribution: 0.64, description: "Weekly load ramp of +18%", elevated: true },
      { name: "hrv", contribution: 0.55, description: "HRV -12% vs. baseline", elevated: true },
      { name: "rest", contribution: 0.3, description: "8 days since a rest day", elevated: false },
      { name: "sleep", contribution: 0.1, description: "Averaging 6.8h sleep", elevated: false },
      { name: "acwr", contribution: 0.0, description: "Acute:chronic load ratio at 1.17", elevated: false },
    ],
  },

  insights: {
    insights: [
      { severity: "warning", title: "Load up, recovery down", body: "Your training load rose 18% this week while HRV dropped 12% below baseline. Your body is absorbing more stress than it can recover from. Reduce intensity for the next two days." },
      { severity: "warning", title: "Sleep debt building", body: "You averaged 6.8h of sleep this week. Recovery adaptations happen during sleep — aim for 8h during heavy blocks." },
      { severity: "positive", title: "Consistency is your superpower", body: "You completed 87% of planned sessions over the last 4 weeks. Consistency predicts long-term improvement better than any single workout." },
    ],
  },

  weeklyReport: {
    volume: { hours: 11.5, km_run: 62 },
    load: { ctl: 78.4, atl: 92.1, tsb: -13.7, ramp_pct: 18 },
    recovery: { hrv_delta_pct: -12.1, sleep_avg_h: 6.8 },
    performance_score: { score: 78 },
    risk: { injury_risk_pct: 34, level: "moderate" },
    strengths: [
      { severity: "positive", title: "Consistency is your superpower", body: "87% of planned sessions completed over the last 4 weeks." },
    ],
    recommendations: [
      { severity: "warning", title: "Load up, recovery down", body: "Reduce intensity for two days; your HRV trend shows incomplete recovery." },
      { severity: "warning", title: "Sleep debt building", body: "Target 8h/night this week to absorb the current training block." },
    ],
  },

  simulation: {
    before: { performance_score: { score: 78 }, injury_risk: { injury_risk_pct: 34 }, race_10k: { predicted_seconds: 2576 }, race_half: { predicted_seconds: 5688 } },
    after: { performance_score: { score: 84 }, injury_risk: { injury_risk_pct: 27 }, race_10k: { predicted_seconds: 2509 }, race_half: { predicted_seconds: 5541 } },
  },

  coachAnswer: (q: string) => ({
    answer:
      "Based on your current data: your acute:chronic load ratio is 1.17 and HRV is 12% below baseline — you're carrying fatigue from the +18% load ramp. I'd keep tomorrow easy (zone 1–2, under 60 min) and push the quality session to the day after, assuming HRV rebounds.",
    engine: "demo",
    question: q,
  }),
};
