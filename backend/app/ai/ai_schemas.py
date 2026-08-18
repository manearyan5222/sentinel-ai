from pydantic import BaseModel, Field
from typing import List, Optional

class AIExplanationSchema(BaseModel):
    summary: str = Field(description="Concise summary of the incident event")
    risk_explanation: str = Field(description="Explanation of why this risk level was assigned")
    recommended_action: str = Field(description="Immediate protocol recommendation for the security guard")
    verification_steps: List[str] = Field(description="Concrete verification steps for the guard to follow")
    uncertainty: str = Field(description="Explicit note on uncertainties or missing information")

class AIChatResponseSchema(BaseModel):
    answer: str = Field(description="Evidence-based answer to the operator query")
    referenced_alerts: List[str] = Field(default_factory=list, description="IDs of alerts referenced in answer")
    confidence_note: str = Field(description="Note on data availability or uncertainty")

class IncidentSummarySchema(BaseModel):
    summary: str = Field(description="High-level incident summary across detection events")
    total_events_analyzed: int = Field(description="Number of detection events analyzed")
    key_observations: List[str] = Field(description="Key behavioral or spatial observations")
    recommended_action: str = Field(description="Overall operational recommendation")

class AlertExplainRequest(BaseModel):
    alert_id: str
    force_refresh: Optional[bool] = False

class AIChatRequest(BaseModel):
    message: str

class IncidentSummaryRequest(BaseModel):
    camera_id: Optional[str] = None
    hours: Optional[int] = 24
