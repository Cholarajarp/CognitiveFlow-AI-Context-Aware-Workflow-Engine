from datetime import datetime
from typing import Literal, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool
import uvicorn

from database import init_db, get_db, Workflow
from ai_engine import AIEngineError, get_gemini_response
from workflow import get_active_window_info

app = FastAPI(title="CognitiveFlow API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
init_db()


class AIRequest(BaseModel):
    text: str = Field(..., min_length=1)
    mode: Literal["analyze", "create", "automate"]
    record: bool = True


class AIResponse(BaseModel):
    response: str
    workflow_id: Optional[int] = None


class DeleteResponse(BaseModel):
    success: bool
    message: str
    deleted_count: int


class WorkflowResponse(BaseModel):
    id: int
    text: Optional[str]
    mode: str
    timestamp: datetime
    response: Optional[str]

    class Config:
        orm_mode = True


@app.get("/")
async def read_root():
    return {"message": "CognitiveFlow Backend is running"}


@app.get("/context")
async def get_context():
    try:
        return await run_in_threadpool(get_active_window_info)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Context detection failed: {exc}") from exc


@app.post("/ai", response_model=AIResponse)
async def process_ai(request: AIRequest, db: Session = Depends(get_db)):
    clean_text = request.text.strip()
    if not clean_text:
        raise HTTPException(status_code=422, detail="`text` must not be empty.")

    try:
        context = await run_in_threadpool(get_active_window_info)
        context_str = f"Active Window: {context.get('title', 'Unknown')}"
        ai_response = await get_gemini_response(clean_text, context_str)
    except AIEngineError as exc:
        raise HTTPException(status_code=502, detail=f"AI processing failed: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected AI error: {exc}") from exc

    workflow_id = None
    if request.record:
        try:
            new_workflow = Workflow(text=clean_text, mode=request.mode, response=ai_response)
            db.add(new_workflow)
            db.commit()
            db.refresh(new_workflow)
            workflow_id = new_workflow.id
        except Exception as exc:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to save workflow: {exc}") from exc

    return {"response": ai_response, "workflow_id": workflow_id}


@app.get("/workflows", response_model=list[WorkflowResponse])
async def get_workflows(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    try:
        workflows = (
            db.query(Workflow)
            .order_by(Workflow.timestamp.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return workflows
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch workflows: {exc}") from exc


@app.post("/workflows/replay/{id}")
async def replay_workflow(id: int, db: Session = Depends(get_db)):
    workflow = db.query(Workflow).filter(Workflow.id == id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    if not workflow.text:
        raise HTTPException(status_code=400, detail="Selected workflow has no input text.")

    try:
        context = await run_in_threadpool(get_active_window_info)
        context_str = f"Active Window: {context.get('title', 'Unknown')}"
        ai_response = await get_gemini_response(workflow.text, context_str)
    except AIEngineError as exc:
        raise HTTPException(status_code=502, detail=f"AI replay failed: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected replay error: {exc}") from exc

    return {"original_request": workflow.text, "new_response": ai_response}


@app.delete("/workflows/{id}", response_model=DeleteResponse)
async def delete_workflow(id: int, db: Session = Depends(get_db)):
    workflow = db.query(Workflow).filter(Workflow.id == id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    try:
        db.delete(workflow)
        db.commit()
        return {"success": True, "message": f"Workflow {id} deleted.", "deleted_count": 1}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete workflow: {exc}") from exc


@app.delete("/workflows", response_model=DeleteResponse)
async def delete_all_workflows(db: Session = Depends(get_db)):
    try:
        deleted_count = db.query(Workflow).delete(synchronize_session=False)
        db.commit()
        return {
            "success": True,
            "message": f"Deleted {deleted_count} workflow(s).",
            "deleted_count": deleted_count,
        }
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to clear workflows: {exc}") from exc


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
