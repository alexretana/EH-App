import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter(prefix="/chat", tags=["chat"])

# Get n8n URL from environment or use default
N8N_URL = os.getenv("N8N_URL", "http://n8n:5678")

class ChatInitRequest(BaseModel):
    """Request model for initiating a chat session"""
    pass  # Empty body for initial request

class ChatMessageRequest(BaseModel):
    """Request model for sending a message in a chat session"""
    sessionId: str
    chatInput: str

class WebhookResponse(BaseModel):
    """Response model from n8n webhook"""
    direct_message_to_user: str
    resumeUrl: str
    sessionId: str

@router.post("/init", response_model=WebhookResponse)
async def init_chat_session():
    """
    Initialize a new chat session by calling the n8n webhook
    """
    webhook_url = f"{N8N_URL}/webhook-test/project-planner"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                webhook_url,
                json={},  # Empty body for initial request
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to initialize chat session: {response.text}"
                )
            
            # Parse the response from n8n
            response_data = response.json()
            
            # Validate the response has the expected fields
            if not all(key in response_data for key in ["direct_message_to_user", "resumeUrl", "sessionId"]):
                raise HTTPException(
                    status_code=500,
                    detail="Invalid response from n8n webhook"
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

@router.post("/resume", response_model=WebhookResponse)
async def resume_chat_session(request: ChatMessageRequest):
    """
    Resume a chat session by sending a message to the resume URL
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
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
                    detail=f"Failed to resume chat session: {response.text}"
                )
            
            # Parse the response from n8n
            response_data = response.json()
            
            # Validate the response has the expected fields
            if not all(key in response_data for key in ["direct_message_to_user", "resumeUrl", "sessionId"]):
                raise HTTPException(
                    status_code=500,
                    detail="Invalid response from n8n webhook"
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