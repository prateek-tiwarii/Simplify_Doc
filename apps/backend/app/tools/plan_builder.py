from pydantic import BaseModel
from .prompts import analyze_prompt

try:
    from portia import PlanBuilderV2, StepOutput, Input

    _PORTIA_AVAILABLE = True
except Exception:
    PlanBuilderV2 = StepOutput = Input = None  # type: ignore
    _PORTIA_AVAILABLE = False

class FinalOutput(BaseModel):
    summary: str
    parties: list[dict]
    dates: dict
    obligations: list[dict]
    financial_terms: list[dict]
    risk_assessment: dict
    confidence_score: float
    unclear_sections: list[dict]


plan = None

if _PORTIA_AVAILABLE:
    plan = (
        PlanBuilderV2("Can you analyze this contract and provide a summary?")
        .input(
            name="pdf_file",
            description="The PDF file containing the contract to analyze",
        )
        .invoke_tool_step(
            step_name="extract_pdf_content",
            tool="pdf_reader_tool",
            args={
                "file_path": Input("pdf_file"),
            },
        )
        .llm_step(
            task=analyze_prompt,
            inputs=[StepOutput(0)],
        )
        # If Portia or tools raise clarifications (e.g., Multiple Choice),
        # the plan run will pause and our background job will persist them.
        .final_output(
            output_schema=FinalOutput,
        )
        .build()
    )
