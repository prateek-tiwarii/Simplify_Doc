from pydantic import BaseModel, Field
from typing import Optional, Dict
from bson import ObjectId
from datetime import datetime


# Helper to convert ObjectId to str
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class Contracts(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    user: ObjectId
    metadata: dict
    file_url: str
    status: str = "processing"
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)

    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True


class ContractAnalysisJobModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    contract_id: ObjectId
    user: ObjectId
    plan_id: Optional[str] = None
    status: str = "pending"  # pending, extracting, analyzing, done, failed
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None

    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True


class ContractAnalysisResultModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    contract_id: ObjectId
    user: ObjectId
    result: Dict
    starred: bool = False
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True


class ClarificationModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    contract_id: ObjectId
    question: str
    response: Optional[str] = None
    status: str = "open"  # open, resolved
    priority: str = "medium"
    created_at: datetime = Field(default_factory=datetime.now)
    resolved_at: Optional[datetime] = None
    # Optional parameters for richer mcq clarification
    options: Optional[list[str]] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    portia_plan_run_id: Optional[str] = None
    portia_clarification_id: Optional[str] = None
    step: Optional[int] = None
    argument_name: Optional[str] = None

    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True
