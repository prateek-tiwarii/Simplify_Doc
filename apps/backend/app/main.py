import json
import logging
from datetime import datetime

from fastapi import (
    APIRouter,
    BackgroundTasks,
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
    Query,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from pathlib import Path

from app.schemas import (
    ClarificationListItem,
    ClarificationListResponse,
    ClarificationResponse,
    ContractAnalysisResultResponse,
    ContractAnalysisStatusResponse,
    ContractUploadResponse,
)
from app.tools.analyze_job import analyze_contract_background
from utils.db import (
    create_analysis_job,
    get_analysis_job_status,
    get_analysis_result,
    get_clarification,
    get_clarifications,
    resolve_clarification,
    save_contract,
    get_all_analysis_results,
    star_analysis_result,
    unstar_analysis_result,
    get_starred_analysis_results,
    delete_report,
    fetch_report,
    get_all_clarifications,
)
from utils.s3 import upload_to_s3

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Enhanced Contract Analysis Agent",
    version="1.0.0",
    description="AI-powered contract analysis using local Ollama (llama3.2)",
)

# Serve locally stored uploads (used when S3 is not configured)
try:
    uploads_dir = Path(settings.LOCAL_STORAGE_DIR or "uploads")
    uploads_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")
except Exception as e:
    logger.warning(f"Could not mount uploads directory: {e}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://obligence.kyrexi.tech",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
router = APIRouter(prefix="/api")


def _iso(v):
    return v.isoformat() if isinstance(v, datetime) else v


@router.post("/contracts/upload", response_model=ContractUploadResponse)
async def upload_contract(
    file: UploadFile = File(...),
    metadata: str = Form(...),
    user: str = Form(...),
    background_tasks: BackgroundTasks = None,
):
    metadata_dict = json.loads(metadata)
    file_url = await upload_to_s3(file, user)
    contract_id = await save_contract(user, metadata_dict, file_url)
    await create_analysis_job(contract_id, user)
    if background_tasks:
        background_tasks.add_task(
            analyze_contract_background, contract_id, user, file_url
        )
    return ContractUploadResponse(
        file_url=file_url, contract_id=contract_id, status="processing"
    )


@router.get("/contracts/results/all")
async def get_all_contract_results(
    userid: str = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    sort: str = Query("asc", enum=["asc", "desc"]),
):
    """
    Retrieve all contract results with pagination.

    - **skip**: Number of results to skip (for pagination).
    - **limit**: Maximum number of results to return (for pagination).
    - **userid**: ID of the user requesting the results.
    """
    try:
        if not userid:
            return {"results": []}
        results = await get_all_analysis_results(userid, skip, limit, sort)
    except Exception as error:
        logger.error(f"Error retrieving contract results: {error}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    return {"results": results}


@router.post("/contracts/result/star/{contract_id}")
async def star_contract_result(contract_id: str, userid: str = Query(...)):
    """
    Star a contract analysis result for a user.

    - **contract_id**: ID of the contract to star.
    - **userid**: ID of the user starring the result.
    """
    try:
        await star_analysis_result(contract_id, userid)
        return {"message": "Contract result starred successfully"}
    except Exception as error:
        logger.error(f"Error starring contract result: {error}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.delete("/contracts/result/star/{contract_id}")
async def unstar_contract_result(contract_id: str, userid: str = Query(...)):
    """
    Unstar a contract analysis result for a user.

    - **contract_id**: ID of the contract to unstar.
    - **userid**: ID of the user unstarring the result.
    """
    try:
        await unstar_analysis_result(contract_id, userid)
        return {"message": "Contract result unstarred successfully"}
    except Exception as error:
        logger.error(f"Error unstarring contract result: {error}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/contracts/result/starred")
async def get_starred_contract_results(userid: str = Query(...)):
    """
    Retrieve all starred contract results for a user.

    - **userid**: ID of the user requesting the starred results.
    """
    try:
        if not userid:
            return {"results": []}
        results = await get_starred_analysis_results(userid)
        return {"results": results}
    except Exception as error:
        logger.error(f"Error retrieving starred contract results: {error}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/contracts/report/{report_id}")
async def get_report_by_id(report_id: str, userid: str = Query(...)):
    """
    Fetch a specific report by its ID for a user.

    - **report_id**: ID of the report to fetch.
    - **userid**: ID of the user requesting the report.
    """
    try:
        report = await fetch_report(report_id, userid)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return {"report": report}
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Error fetching report: {error}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.delete("/contracts/result/{contract_id}")
async def delete_contract_result(contract_id: str, userid: str = Query(...)):
    """
    Delete a contract analysis result for a user.

    - **contract_id**: ID of the contract result to delete.
    - **userid**: ID of the user deleting the result.
    """
    try:
        await delete_report(contract_id, userid)
        return {"message": "Contract result deleted successfully"}
    except Exception as error:
        logger.error(f"Error deleting contract result: {error}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Clarification endpoints
@router.get(
    "/contracts/clarification/{contract_id}", response_model=ClarificationListResponse
)
async def get_clarifications_for_contract(contract_id: str):
    """
    Returns all clarifications raised by the Portia agent for a contract.
    """
    clarifications = await get_clarifications(contract_id)
    result = []
    for c in clarifications:
        result.append(
            ClarificationListItem(
                id=str(c.get("_id")),
                question=c.get("question"),
                options=c.get("options", []),
                status=c.get("status", "pending"),
                priority=c.get("priority", "medium"),
                created_at=_iso(c.get("created_at")),
                resolved_at=_iso(c.get("resolved_at")),
            )
        )
    return ClarificationListResponse(clarifications=result)


@router.post(
    "/contracts/clarification/resolve/{clarification_id}",
    response_model=ClarificationResponse,
)
async def resolve_clarification_endpoint(clarification_id: str, response: str):
    await resolve_clarification(clarification_id, response)
    clarification = await get_clarification(clarification_id)
    
    contract_id = str(clarification["contract_id"])
    all_clars = await get_clarifications(contract_id)
    if all(c.get("status") == "resolved" for c in all_clars):
        from utils.db import update_analysis_job_status, update_contract_status
        await update_analysis_job_status(contract_id, "completed")
        await update_contract_status(contract_id, "completed")
        
    return ClarificationResponse(
        id=str(clarification["_id"]),
        contract_id=contract_id,
        question=clarification["question"],
        response=clarification.get("response"),
        status=clarification["status"],
        priority=clarification["priority"],
        created_at=_iso(clarification.get("created_at")),
        resolved_at=_iso(clarification.get("resolved_at")),
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@router.get(
    "/contracts/status/{contract_id}", response_model=ContractAnalysisStatusResponse
)
async def get_contract_status(contract_id: str):
    job = await get_analysis_job_status(contract_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return ContractAnalysisStatusResponse(
        contract_id=contract_id,
        status=job.get("status", "unknown"),
        error=job.get("error"),
        updated_at=_iso(job.get("updated_at")),
    )


@router.get(
    "/contracts/result/{contract_id}", response_model=ContractAnalysisResultResponse
)
async def get_contract_result(contract_id: str, userid: str):
    result = await get_analysis_result(contract_id, userid)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return ContractAnalysisResultResponse(
        contract_id=contract_id,
        result=result.get("result", {}),
        created_at=_iso(result.get("created_at")),
    )


@router.get("/clarifications/all", response_model=ClarificationListResponse)
async def get_all_clarifications_endpoint(user: str):
    clarifications = await get_all_clarifications(user)
    result = []
    for c in clarifications:
        result.append(
            ClarificationListItem(
                id=str(c.get("_id")),
                question=c.get("question"),
                options=c.get("options", []),
                status=c.get("status", "pending"),
                priority=c.get("priority", "medium"),
                created_at=_iso(c.get("created_at")),
                resolved_at=_iso(c.get("resolved_at")),
            )
        )
    return ClarificationListResponse(clarifications=result)


app.include_router(router)
