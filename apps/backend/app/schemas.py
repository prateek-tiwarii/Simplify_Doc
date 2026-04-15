from typing import Any
from fastapi import UploadFile
from pydantic import BaseModel, Field
from typing import Dict, List, Optional


class ContractUploadRequest(BaseModel):
    file: UploadFile
    user: str
    metadata: Dict[str, str]


class ContractUploadResponse(BaseModel):
    file_url: str
    contract_id: str
    status: str


class ContractParty(BaseModel):
    name: str
    role: str
    contact_info: Optional[str] = None


class ContractDates(BaseModel):
    effective_date: Optional[str] = None
    termination_date: Optional[str] = None
    renewal_date: Optional[str] = None
    signature_date: Optional[str] = None


class ContractObligation(BaseModel):
    party: str
    text: str
    deadline: Optional[str] = None
    category: Optional[str] = None


class FinancialTerm(BaseModel):
    amount: str
    currency: Optional[str] = "USD"
    frequency: Optional[str] = None
    description: str


class RiskAssessment(BaseModel):
    risk_level: str = Field(..., description="Low, Medium, High")
    risk_factors: List[str] = []
    recommendations: List[str] = []


class ClarificationItem(BaseModel):
    id: str
    status: str
    question: Optional[str] = None
    response: Optional[str] = None
    priority: str = "medium"


# --- New schemas for status/result/clarification endpoints ---


class ContractAnalysisStatusResponse(BaseModel):
    contract_id: str
    status: str
    error: Optional[str] = None
    updated_at: Optional[str] = None


class ContractAnalysisResultResponse(BaseModel):
    contract_id: str
    result: Dict
    created_at: Optional[str] = None


class ClarificationRequest(BaseModel):
    contract_id: str
    question: str
    priority: Optional[str] = "medium"


class ClarificationResponse(BaseModel):
    id: str
    contract_id: str
    question: str
    response: Optional[str] = None
    status: str
    priority: str
    created_at: Optional[str] = None
    resolved_at: Optional[str] = None


class ClarificationListItem(BaseModel):
    id: str
    question: Optional[str] = None
    options: Optional[List[Any]] = []
    status: str = "pending"
    priority: str = "medium"
    created_at: Optional[str] = None
    resolved_at: Optional[str] = None
    # Optional Params for more rich clarifications
    options: Optional[list[str]] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    portia_plan_run_id: Optional[str] = None
    portia_clarification_id: Optional[str] = None
    step: Optional[int] = None
    argument_name: Optional[str] = None


class ClarificationListResponse(BaseModel):
    clarifications: List[ClarificationListItem]
