import { MOCK } from "./mock";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ATHLETE_ID = "demo-athlete";

/**
 * Thin API client. Every method degrades to realistic mock data when
 * the backend is unreachable, so the UI is always demoable.
 */
async function get<T>(path: string, fallback: T): Promise<T> {
  if (!API_URL) return fallback;
  try {
    const res = await fetch(`${API_URL}/api/v1${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function post<T>(path: string, body: unknown, fallback: T): Promise<T> {
  if (!API_URL) return fallback;
  try {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export const api = {
  dashboard: () => get(`/dashboard/${ATHLETE_ID}/summary`, MOCK.dashboard),
  races: () => get(`/predictions/${ATHLETE_ID}/races`, MOCK.races),
  racePlan: (d: string) => get(`/predictions/${ATHLETE_ID}/race-plan/${d}`, MOCK.racePlan),
  injuryRisk: () => get(`/injury-risk/${ATHLETE_ID}`, MOCK.injuryRisk),
  insights: () => get(`/insights/${ATHLETE_ID}`, MOCK.insights),
  weeklyReport: () => get(`/reports/${ATHLETE_ID}/weekly`, MOCK.weeklyReport),
  askCoach: (question: string, locale: string) =>
    post(`/coach/${ATHLETE_ID}/ask`, { question, locale }, MOCK.coachAnswer(question)),
  simulate: (changes: Record<string, number>) =>
    post(`/simulator/${ATHLETE_ID}/run`, changes, MOCK.simulation),
};
