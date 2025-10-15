import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter(prefix="/chat", tags=["chat"])

# Get n8n URL from environment or use default
N8N_URL = os.getenv("N8N_URL", "http://n8n:5678")

class ChatRequest(BaseModel):
    """Request model for chat - can be used for both initial and resume requests"""
    sessionId: Optional[str] = None
    chatInput: Optional[str] = None
    resumeUrl: Optional[str] = None

class WebhookResponse(BaseModel):
    """Response model from n8n webhook"""
    direct_message_to_user: str
    resumeUrl: str
    sessionId: str

@router.post("/chat", response_model=WebhookResponse)
async def chat(request: ChatRequest):
    """
    Handle chat requests - can initialize a new session or resume an existing one
    """
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            # If sessionId is None, this is an initial request
            if request.sessionId is None:
                # Initialize new chat session
                webhook_url = f"{N8N_URL}/webhook-test/project-planner"
                response = await client.post(
                    webhook_url,
                    json={},  # Empty body for initial request
                    headers={"Content-Type": "application/json"}
                )
            else:
                # Resume existing chat session using the resume URL
                if not request.resumeUrl:
                    raise HTTPException(
                        status_code=400,
                        detail="resumeUrl is required when sessionId is provided"
                    )
                
                response = await client.post(
                    request.resumeUrl,
                    json={
                        "sessionId": request.sessionId,
                        "chatInput": request.chatInput
                    },
                    headers={"Content-Type": "application/json"}
                )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to process chat request: {response.text}"
                )
            
            # Parse the response from n8n
            response_data = response.json()
            
            # Map agentResponse to direct_message_to_user for consistency
            if "agentResponse" in response_data and "direct_message_to_user" not in response_data:
                response_data["direct_message_to_user"] = response_data.pop("agentResponse")
            
            # Validate the response has the expected fields
            if not all(key in response_data for key in ["direct_message_to_user", "resumeUrl", "sessionId"]):
                raise HTTPException(
                    status_code=500,
                    detail=f"Invalid response from n8n webhook. Missing required fields. Response: {response_data}"
                )
            
            return WebhookResponse(**response_data)
            
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to connect to n8n service: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Check if the chat service is healthy and can connect to n8n"""
    try:
        # Simple health check to n8n
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{N8N_URL}/healthz")
            
            if response.status_code == 200:
                return {"status": "healthy", "n8n_connection": "ok"}
            else:
                return {"status": "degraded", "n8n_connection": "error", "error": response.text}
                
    except httpx.RequestError as e:
        return {"status": "unhealthy", "n8n_connection": "failed", "error": str(e)}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}