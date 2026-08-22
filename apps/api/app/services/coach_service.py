"""AI Coach — chat grounded in the athlete's own data.

When LLM_API_KEY is set, answers come from the configured language
model with the athlete snapshot injected as context. Without a key, a
deterministic grounded engine keeps the product fully demoable.
"""

from app.core.config import settings
from app.ml.features import AthleteSnapshot
from app.ml.registry import model_registry

SYSTEM_PROMPT = """You are EnduranceAI Coach, an expert endurance-sports coach.
Answer using ONLY the athlete data provided. Be specific, cite the numbers,
keep answers under 150 words, and always explain in plain language."""


async def answer(question: str, snap: AthleteSnapshot, locale: str = "en") -> dict:
    context = _context_block(snap)
    if settings.llm_api_key:
        return await _answer_with_llm(question, context, locale)
    return _answer_deterministic(question, snap, context)


def _context_block(snap: AthleteSnapshot) -> str:
    risk = model_registry.injury_risk.predict(snap)
    score = model_registry.performance_score.predict(snap)
    return (
        f"VO2max: {snap.vo2max} | FTP: {snap.ftp_watts}W | Threshold pace: {snap.threshold_pace_sec_km}s/km\n"
        f"CTL {snap.ctl} / ATL {snap.atl} / TSB {snap.tsb:.0f} | ACWR {snap.acwr:.2f}\n"
        f"HRV {snap.hrv_rmssd:.0f} ({snap.hrv_delta_pct:+.0f}% vs baseline) | Sleep 7d avg {snap.sleep_hours_7d}h\n"
        f"Weekly ramp {snap.ramp_rate_pct:+.0f}% | Consistency {snap.consistency_pct:.0f}%\n"
        f"Injury risk {risk['injury_risk_pct']}% | Performance score {score['score']}/100"
    )


async def _answer_with_llm(question: str, context: str, locale: str) -> dict:
    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=settings.llm_api_key)
    lang = "Portuguese (Brazil)" if locale.startswith("pt") else "English"
    msg = await client.messages.create(
        model=settings.llm_model,
        max_tokens=500,
        system=f"{SYSTEM_PROMPT}\nRespond in {lang}.",
        messages=[{"role": "user", "content": f"Athlete data:\n{context}\n\nQuestion: {question}"}],
    )
    return {"answer": msg.content[0].text, "grounded_on": context, "engine": "endurance-llm"}


def _answer_deterministic(question: str, snap: AthleteSnapshot, context: str) -> dict:
    q = question.lower()
    risk = model_registry.injury_risk.predict(snap)

    if any(k in q for k in ("hard", "intervalado", "forte", "interval", "amanhã", "tomorrow")):
        if snap.acwr > 1.3 or snap.hrv_delta_pct < -10:
            text = (
                f"I'd hold off. Your acute:chronic load ratio is {snap.acwr:.2f} and HRV is "
                f"{snap.hrv_delta_pct:+.0f}% vs. baseline — your body is under-recovered. "
                "Go easy tomorrow (zone 1–2, under 60 min) and reassess in 48h."
            )
        else:
            text = (
                f"Yes — your ACWR ({snap.acwr:.2f}) and HRV trend look healthy. "
                "A quality interval session tomorrow fits your current load."
            )
    elif any(k in q for k in ("overtraining", "demais", "too much")):
        text = (
            f"Your overtraining risk is {risk['overtraining_risk_pct']}%. "
            f"Main drivers: load ramp of {snap.ramp_rate_pct:+.0f}% and {snap.days_since_rest} days "
            "without full rest. One or two easy days would reset the trend."
        )
    elif any(k in q for k in ("injury", "lesão", "lesao", "risco")):
        top = risk["factors"][0]["description"]
        text = (
            f"Current injury risk: {risk['injury_risk_pct']}% ({risk['level']}). "
            f"Biggest factor: {top}. Address that first."
        )
    else:
        text = (
            f"Here's where you stand: fitness (CTL) {snap.ctl}, form (TSB) {snap.tsb:.0f}, "
            f"HRV {snap.hrv_delta_pct:+.0f}% vs. baseline, injury risk {risk['injury_risk_pct']}%. "
            "Ask me about tomorrow's training, race predictions, or recovery."
        )
    return {"answer": text, "grounded_on": context, "engine": "rules"}
