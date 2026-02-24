from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
import uvicorn
import asyncio

from database import init_db, get_db, Workflow
from ai_engine import get_gemini_response
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
    text: str
    mode: str

class WorkflowResponse(BaseModel):
    id: int
    text: Optional[str]
    mode: str
    timestamp: datetime
    response: Optional[str]

    class Config:
        from_attributes = True

@app.get("/")
async def read_root():
    return {"message": "CognitiveFlow Backend is running"}

@app.get("/context")
async def get_context():
    # In a real async app, we might run this in a threadpool if it was blocking
    # For now, get_active_window_info is fast (or mocked)
    return get_active_window_info()

@app.post("/ai")
async def process_ai(request: AIRequest, db: Session = Depends(get_db)):
    context = get_active_window_info()
    context_str = f"Active Window: {context['title']} (App: {context['app_name']})"
    
    # Await the async AI response
    ai_response = await get_gemini_response(request.text, context_str)
    
    # Database operations (sync)
    # Ideally, we would use an async session or run_in_threadpool,
    # but for this MVP SQLite usage, direct call is acceptable.
    new_workflow = Workflow(
        text=request.text,
        mode=request.mode,
        response=ai_response
    )
    db.add(new_workflow)
    db.commit()
    db.refresh(new_workflow)
    
    return {"response": ai_response, "workflow_id": new_workflow.id}

@app.get("/workflows", response_model=List[WorkflowResponse])
async def get_workflows(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    workflows = db.query(Workflow).order_by(Workflow.timestamp.desc()).offset(skip).limit(limit).all()
    # Convert datetime to string for Pydantic if needed, but Pydantic handles it usually.
    # We return ORM objects directly due to response_model and from_attributes=True
    return workflows

@app.post("/workflows/replay/{id}")
async def replay_workflow(id: int, db: Session = Depends(get_db)):
    workflow = db.query(Workflow).filter(Workflow.id == id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Re-run the AI logic with current context
    context = get_active_window_info()
    context_str = f"Active Window: {context['title']} (App: {context['app_name']})"
    
    ai_response = await get_gemini_response(workflow.text, context_str)
    
    return {"original_request": workflow.text, "new_response": ai_response}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
