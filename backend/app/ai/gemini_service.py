import json
import logging
import time
from datetime import datetime
from typing import Dict, Any, Optional
from app.config import settings
from app.ai.ai_prompts import (
    SENTINEL_SYSTEM_INSTRUCTION,
    build_alert_explanation_prompt,
    build_ai_chat_prompt,
    build_incident_summary_prompt
)
from app.ai.ai_schemas import (
    AIExplanationSchema,
    AIChatResponseSchema,
    IncidentSummarySchema
)

logger = logging.getLogger("sentinel.gemini")

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
        self.client = None
        self.last_call_timestamps: Dict[str, float] = {} # Throttle tracker per key/alert
        self.min_interval_seconds = 2.0 # Minimum seconds between API requests
        self._init_client()

    def _init_client(self):
        if not self.api_key or self.api_key == "your_api_key_here":
            logger.info("GEMINI_API_KEY is not configured. Gemini features will run in DISABLED mode.")
            self.client = None
            return

        try:
            # Try importing Google GenAI SDK
            from google import genai
            self.client = genai.Client(api_key=self.api_key)
            logger.info("Google Gemini GenAI client initialized successfully.")
        except Exception as e:
            try:
                # Fallback import for google-generativeai
                import google.generativeai as genai_legacy
                genai_legacy.configure(api_key=self.api_key)
                self.client = genai_legacy
                logger.info("Google Gemini legacy SDK initialized successfully.")
            except Exception as ex:
                logger.warning(f"Failed to initialize Gemini SDK ({e} / {ex}). Running in HTTP fallback mode.")
                self.client = "HTTP_FALLBACK"

    def is_enabled(self) -> bool:
        return bool(self.api_key and self.api_key != "your_api_key_here")

    def get_status(self) -> Dict[str, Any]:
        if not self.is_enabled():
            return {"status": "DISABLED", "message": "GEMINI_API_KEY is missing or unconfigured."}
        if self.client is None:
            return {"status": "ERROR", "message": "Failed to initialize Gemini client."}
        return {"status": "ONLINE", "message": "Google Gemini AI layer is active and ready."}

    def _throttle_check(self, key: str = "global") -> bool:
        """Returns True if request should proceed, False if throttled."""
        now = time.time()
        last_time = self.last_call_timestamps.get(key, 0)
        if now - last_time < self.min_interval_seconds:
            logger.warning(f"Gemini API request throttled for key: {key}")
            return False
        self.last_call_timestamps[key] = now
        return True

    def _call_gemini_raw(self, prompt: str) -> Optional[str]:
        """Calls Gemini API safely with rate limiting, timeouts, and error catching."""
        if not self.is_enabled():
            return None

        if not self._throttle_check():
            logger.warning("Throttling active: skipping raw call.")
            return None

        logger.info("Sending request to Google Gemini API...")
        try:
            # Case 1: New google-genai SDK
            if hasattr(self.client, 'models'):
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config={
                        'system_instruction': SENTINEL_SYSTEM_INSTRUCTION,
                        'response_mime_type': 'application/json',
                    }
                )
                return response.text

            # Case 2: Legacy google.generativeai SDK
            elif hasattr(self.client, 'GenerativeModel'):
                model = self.client.GenerativeModel(
                    'gemini-1.5-flash',
                    system_instruction=SENTINEL_SYSTEM_INSTRUCTION
                )
                response = model.generate_content(prompt)
                return response.text

            # Case 3: HTTP REST API direct fallback
            else:
                import urllib.request
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
                data = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "systemInstruction": {"parts": [{"text": SENTINEL_SYSTEM_INSTRUCTION}]},
                    "generationConfig": {"responseMimeType": "application/json"}
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(data).encode('utf-8'),
                    headers={'Content-Type': 'application/json'}
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    res_body = json.loads(resp.read().decode('utf-8'))
                    return res_body['candidates'][0]['content']['parts'][0]['text']

        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}")
            return None

    def explain_alert(self, alert_data: dict, db_session=None, force_refresh=False) -> Dict[str, Any]:
        """
        Generates structured AI explanation for a given alert dict.
        Checks DB cache first unless force_refresh is True.
        Falls back safely if AI is disabled or fails.
        """
        alert_id = alert_data.get("id")

        # 1. Check if DB cached explanation exists
        if not force_refresh and alert_data.get("ai_summary"):
            logger.info(f"Returning cached AI explanation for alert {alert_id}")
            return {
                "summary": alert_data.get("ai_summary"),
                "risk_explanation": alert_data.get("ai_risk_explanation"),
                "recommended_action": alert_data.get("ai_recommended_action"),
                "verification_steps": alert_data.get("ai_verification_steps") or [],
                "uncertainty": alert_data.get("ai_uncertainty") or "Based on recorded CCTV camera parameters.",
                "cached": True
            }

        # 2. Fallback if Gemini is disabled
        if not self.is_enabled():
            return self._build_deterministic_fallback_explanation(alert_data, "AI layer disabled (missing API key)")

        # 3. Build Prompt & Call Gemini
        prompt = build_alert_explanation_prompt(alert_data)
        raw_text = self._call_gemini_raw(prompt)

        if not raw_text:
            return self._build_deterministic_fallback_explanation(alert_data, "Gemini API unavailable or rate limited")

        # 4. Parse & Validate Schema
        try:
            clean_json = self._extract_json_str(raw_text)
            parsed_dict = json.loads(clean_json)
            validated = AIExplanationSchema(**parsed_dict)
            res_dict = validated.model_dump()
            res_dict["cached"] = False

            # 5. Save to DB Cache if DB session provided
            if db_session and alert_id:
                try:
                    from app.models.alert import Alert
                    db_alert = db_session.query(Alert).filter(Alert.id == alert_id).first()
                    if db_alert:
                        db_alert.ai_summary = res_dict["summary"]
                        db_alert.ai_risk_explanation = res_dict["risk_explanation"]
                        db_alert.ai_recommended_action = res_dict["recommended_action"]
                        db_alert.ai_verification_steps = res_dict["verification_steps"]
                        db_alert.ai_uncertainty = res_dict["uncertainty"]
                        db_alert.ai_generated_at = datetime.utcnow()
                        db_session.commit()
                        logger.info(f"Cached AI explanation in SQLite DB for alert {alert_id}")
                except Exception as dbe:
                    logger.error(f"Failed to persist AI cache to DB: {dbe}")

            return res_dict

        except Exception as ve:
            logger.error(f"Failed to validate Gemini JSON schema: {ve}")
            return self._build_deterministic_fallback_explanation(alert_data, "Fallback used due to schema validation failure")

    def chat_assistant(self, user_query: str, system_context: dict) -> Dict[str, Any]:
        """Queries the Gemini security assistant regarding DB event log context."""
        if not self.is_enabled():
            return {
                "answer": "The AI Assistant is running in offline mode. Please configure GEMINI_API_KEY in backend/.env to enable intelligent natural language log queries.",
                "referenced_alerts": [],
                "confidence_note": "AI service unconfigured"
            }

        prompt = build_ai_chat_prompt(user_query, system_context)
        raw_text = self._call_gemini_raw(prompt)

        if not raw_text:
            return {
                "answer": f"Unable to reach Gemini AI service. Current active alerts in database: {system_context.get('active_alerts_count', 0)}.",
                "referenced_alerts": [],
                "confidence_note": "API temporarily unavailable"
            }

        try:
            clean_json = self._extract_json_str(raw_text)
            parsed_dict = json.loads(clean_json)
            validated = AIChatResponseSchema(**parsed_dict)
            return validated.model_dump()
        except Exception as ve:
            logger.error(f"Failed to parse chat response: {ve}")
            return {
                "answer": raw_text[:500] if len(raw_text) > 0 else "Could not process response.",
                "referenced_alerts": [],
                "confidence_note": "Unstructured output"
            }

    def summarize_incidents(self, events_summary_text: str, total_count: int) -> Dict[str, Any]:
        """Summarizes a group of detection events."""
        if not self.is_enabled():
            return {
                "summary": f"Group of {total_count} detection events recorded.",
                "total_events_analyzed": total_count,
                "key_observations": ["System operating in offline rule-based mode"],
                "recommended_action": "Review events manually in SOC dashboard."
            }

        prompt = build_incident_summary_prompt(events_summary_text, total_count)
        raw_text = self._call_gemini_raw(prompt)

        if not raw_text:
            return {
                "summary": f"Analyzed {total_count} security detection events.",
                "total_events_analyzed": total_count,
                "key_observations": ["Automated summary unavailable"],
                "recommended_action": "Inspect high priority alert logs directly."
            }

        try:
            clean_json = self._extract_json_str(raw_text)
            parsed_dict = json.loads(clean_json)
            validated = IncidentSummarySchema(**parsed_dict)
            return validated.model_dump()
        except Exception as ve:
            logger.error(f"Failed to parse incident summary: {ve}")
            return {
                "summary": f"Incident cluster of {total_count} events.",
                "total_events_analyzed": total_count,
                "key_observations": ["Multi-event detection cluster"],
                "recommended_action": "Verify event timeline in SOC logs."
            }

    def _build_deterministic_fallback_explanation(self, alert_data: dict, reason: str) -> Dict[str, Any]:
        reasons = alert_data.get("risk_reasons") or ["Contextual risk rule triggered"]
        protocol = alert_data.get("action_protocol") or {}
        return {
            "summary": protocol.get("what") or f"Detection event on {alert_data.get('camera_name', 'CCTV')}",
            "risk_explanation": f"Automated 0-100 risk score is {alert_data.get('risk_score', 0)} ({alert_data.get('risk_level', 'ELEVATED')}). Triggered factors: {', '.join(reasons)}.",
            "recommended_action": protocol.get("recommended_action") or "Verify subject identity and security access status.",
            "verification_steps": [
                "Verify camera feed live visual",
                "Check resident and expected visitor pre-registration database",
                "Dispatch security guard if subject remains in restricted zone"
            ],
            "uncertainty": f"Deterministic Rule Engine Fallback ({reason}).",
            "cached": False
        }

    def _extract_json_str(self, text: str) -> str:
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

gemini_service = GeminiService()
