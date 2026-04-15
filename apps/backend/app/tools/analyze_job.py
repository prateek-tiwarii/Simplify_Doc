import json
import logging
import re
from typing import Any

from pypdf import PdfReader

from utils.db import (
    update_analysis_job_status,
    save_analysis_result,
    update_contract_status,
    create_clarification,
)
from pydantic import BaseModel, Field
from app.tools.pdf_file import download_pdf_to_temp, remove_temp_files
from app.tools.prompts import analyze_prompt
from app.llm.ollama import ollama_generate_json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ContractAnalysisSchema(BaseModel):
    summary: str = Field(default="No summary provided by the model.")
    parties: list[dict] = Field(default_factory=list)
    dates: dict[str, str | None] = Field(default_factory=dict)
    obligations: list[dict] = Field(default_factory=list)
    financial_terms: list[dict] = Field(default_factory=list)
    risk_assessment: dict = Field(default_factory=dict)
    confidence_score: float = Field(default=0.0)
    unclear_sections: list[dict] = Field(default_factory=list)


async def analyze_contract_background(contract_id, user, file_url):
    temp_file_path = None
    try:
        temp_file_path = await download_pdf_to_temp(file_url)

        # Extract text from the PDF
        try:
            reader = PdfReader(temp_file_path)
            pages_text: list[str] = []
            for page in reader.pages:
                try:
                    t = page.extract_text() or ""
                except Exception:
                    t = ""
                if t:
                    pages_text.append(t)
            contract_text = "\n\n".join(pages_text).strip()
        except Exception as pdf_err:
            try:
                import docx
                doc = docx.Document(temp_file_path)
                contract_text = "\n\n".join(para.text for para in doc.paragraphs).strip()
            except Exception:
                raise Exception("Invalid file format. Please upload a valid PDF or DOCX file.")
        if not contract_text:
            raise Exception("Could not extract text from the document.")

        # Keep prompt size reasonable
        max_chars = 60_000
        if len(contract_text) > max_chars:
            contract_text = contract_text[:max_chars]

        prompt = f"{analyze_prompt}\n\nCONTRACT TEXT:\n{contract_text}"

        # Call local Ollama (llama3.2) and parse JSON
        analysis_result_raw: Any = await ollama_generate_json(prompt)

        # Normalize / validate output
        def _strip_code_fence(s: str) -> str:
            if not isinstance(s, str):
                return s
            s = s.strip()
            if s.startswith("```") and s.endswith("```"):
                # Remove the leading ```lang and trailing ```
                m = re.match(r"```[a-zA-Z0-9_-]*\s*(.*)```\s*\Z", s, flags=re.DOTALL)
                if m:
                    return m.group(1).strip()
            return s

        def _to_dict(obj):
            if obj is None:
                return None
            if isinstance(obj, dict):
                return obj
            if hasattr(obj, "model_dump"):
                return obj.model_dump()
            if hasattr(obj, "dict"):
                return obj.dict()
            if isinstance(obj, str):
                try:
                    return json.loads(_strip_code_fence(obj))
                except Exception:
                    return None
            try:
                # Last resort: try json on str(obj)
                return json.loads(str(obj))
            except Exception:
                return None

        analysis_result = _to_dict(analysis_result_raw)
        if not isinstance(analysis_result, dict):
            raise Exception("Final output could not be parsed into a dict.")

        # Validate required fields (best-effort) and apply defaults
        # We also want to protect against validation errors if the local LLM completely ignores schema.
        try:
            validated = ContractAnalysisSchema(**analysis_result)
        except Exception:
            # If the model hallucinates wildly, swallow the raw json into 'summary' and fill defaults.
            validated = ContractAnalysisSchema(summary=f"Model returned invalid structure: {analysis_result}")
        
        analysis_result = validated.model_dump()

        # Normalize nested fields that may come as JSON strings
        for nested_key in ("dates", "risk_assessment"):
            if nested_key in analysis_result and isinstance(
                analysis_result[nested_key], str
            ):
                try:
                    analysis_result[nested_key] = json.loads(
                        _strip_code_fence(analysis_result[nested_key])
                    )
                except Exception:
                    pass

        logger.debug(f"Analysis Result (normalized): {analysis_result}")

        # Save the analysis result to the database
        await save_analysis_result(contract_id, user, analysis_result)

        # Create clarifications if there are unclear sections
        unclear = analysis_result.get("unclear_sections", [])
        if unclear:
            for issue in unclear:
                section = issue.get("section", "General")
                question = issue.get("issue", "Needs clarification")
                priority = issue.get("priority", "medium")
                if not isinstance(question, str):
                    question = str(question)
                await create_clarification(
                    contract_id=contract_id,
                    question=f"{section}: {question}",
                    priority=priority if isinstance(priority, str) else "medium",
                )
            await update_analysis_job_status(contract_id, "pending_clarification")
            await update_contract_status(contract_id, "pending_clarification")
            logger.info(f"Analysis pending clarifications for contract {contract_id}")
        else:
            # Update job and contract status to completed
            await update_analysis_job_status(contract_id, "completed")
            await update_contract_status(contract_id, "completed")
            logger.info(f"Analysis completed successfully for contract {contract_id}")

    except Exception as e:
        await update_analysis_job_status(contract_id, "failed", error=str(e))
        await update_contract_status(contract_id, "failed")
        logger.error(f"Analysis failed for contract {contract_id}: {e}")
    finally:
        if temp_file_path:
            remove_temp_files(temp_file_path)
