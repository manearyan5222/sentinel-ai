SENTINEL_SYSTEM_INSTRUCTION = (
    "You are the SentinelAI security event assistant. You analyze structured CCTV detection events "
    "produced by the application's existing computer-vision system.\n"
    "STRICT RULES:\n"
    "1. You do NOT determine criminality, guilt, or malicious intent.\n"
    "2. Never claim someone is definitely dangerous, a criminal, or suspicious based on identity, clothing, race, or appearance.\n"
    "3. Provide concise, evidence-based explanations for human security staff.\n"
    "4. Use ONLY the supplied structured event information. Never invent observations.\n"
    "5. Clearly state uncertainties.\n"
    "6. Recommendations MUST be framed as verification steps for a human security guard.\n"
    "7. Always return valid JSON adhering strictly to the requested JSON schema."
)

def build_alert_explanation_prompt(alert_data: dict) -> str:
    return f"""
Analyze the following structured CCTV security alert event and generate a human-in-the-loop decision support explanation.

EVENT STRUCTURED DATA:
- Alert ID: {alert_data.get('id')}
- Camera: {alert_data.get('camera_name')} ({alert_data.get('location_zone')})
- Timestamp: {alert_data.get('created_at')}
- Entity Identity: {alert_data.get('identity_type')} ({alert_data.get('entity_label')})
- Dwell Duration: {alert_data.get('dwell_time_seconds')} seconds
- Risk Score: {alert_data.get('risk_score')}/100 ({alert_data.get('risk_level')})
- Deterministic Risk Rules Triggered: {', '.join(alert_data.get('risk_reasons', []))}
- Action Protocol Context: {alert_data.get('action_protocol', {})}

Return a valid JSON object matching this schema:
{{
  "summary": "Short 1-2 sentence description of what occurred",
  "risk_explanation": "Explanation of why the automated system scored this risk level",
  "recommended_action": "Suggested verification steps for the human security guard",
  "verification_steps": ["Step 1 to verify", "Step 2 to verify"],
  "uncertainty": "Explicit caveat regarding missing data or camera limitations"
}}
"""

def build_ai_chat_prompt(user_query: str, system_context: dict) -> str:
    return f"""
The security operator is asking a question about the current CCTV monitoring events.

OPERATOR QUERY: "{user_query}"

CURRENT DATABASE CONTEXT:
- Active Alerts: {system_context.get('active_alerts_count')}
- Total Alerts Today: {system_context.get('total_alerts_count')}
- Recent Alerts Summary: {system_context.get('alerts_summary')}
- Available Cameras: {system_context.get('cameras')}
- Authorized Resident Count: {system_context.get('residents_count')}
- Expected Visitor Count: {system_context.get('visitors_count')}

Answer the operator's query objectively using ONLY the supplied database context.
Do NOT invent events or data not present in the context.
If information is unavailable or unrecorded, state it explicitly.

Return a valid JSON object matching this schema:
{{
  "answer": "Clear, concise answer based on available logs",
  "referenced_alerts": ["alt-101"],
  "confidence_note": "Statement on context completeness"
}}
"""

def build_incident_summary_prompt(events_summary: str, total_count: int) -> str:
    return f"""
Summarize the following group of {total_count} detection events recorded by SentinelAI.

EVENTS LOG:
{events_summary}

Return a valid JSON object matching this schema:
{{
  "summary": "Short operator-friendly summary of the incident group",
  "total_events_analyzed": {total_count},
  "key_observations": ["Observation 1", "Observation 2"],
  "recommended_action": "Overall operational guidance for security staff"
}}
"""
