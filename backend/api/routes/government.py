"""Government reporting and submission routes."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from core.security import get_current_user
from models.schemas import GovernmentSubmissionCreateRequest, GovernmentSubmissionResponse
from services.government.engine import SUBMISSIONS_DIR, create_submission_bundle_async

router = APIRouter()

# In-memory store (demo). Replace with DB persistence.
_SUBMISSIONS: Dict[str, GovernmentSubmissionResponse] = {}


@router.post("/submissions", response_model=GovernmentSubmissionResponse)
async def create_submission(
    req: GovernmentSubmissionCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    submission = await create_submission_bundle_async(req)
    _SUBMISSIONS[submission.id] = submission
    return submission


@router.get("/submissions", response_model=List[GovernmentSubmissionResponse])
async def list_submissions(current_user: dict = Depends(get_current_user)):
    return list(_SUBMISSIONS.values())


@router.get("/submissions/{submission_id}", response_model=GovernmentSubmissionResponse)
async def get_submission(submission_id: str, current_user: dict = Depends(get_current_user)):
    sub = _SUBMISSIONS.get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return sub


@router.get("/submissions/{submission_id}/download")
async def download_submission_bundle(submission_id: str, current_user: dict = Depends(get_current_user)):
    zip_path = SUBMISSIONS_DIR / f"{submission_id}.zip"
    if not zip_path.exists():
        raise HTTPException(status_code=404, detail="Bundle not found")

    return FileResponse(
        path=str(zip_path),
        filename=zip_path.name,
        media_type="application/zip",
    )
