import os
import httpx
import json
import redis
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

router = APIRouter(prefix="/chat", tags=["chat"])

# Get n8n URL from environment or use default
N8N_URL = os.getenv("N8N_URL", "http://n8n:5678")

# Redis connection
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "n8n_password")

def get_redis_client():
    """Get a Redis client connection"""
    return redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        password=REDIS_PASSWORD,
        decode_responses=True
    )

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

class ChatSession(BaseModel):
    """Model for chat session metadata"""
    sessionId: str
    description: str
    lastMessage: str
    messageCount: int
    timestamp: str

class RestoreConversationRequest(BaseModel):
    """Request model for restoring a conversation"""
    sessionId: str

class RestoreConversationResponse(BaseModel):
    """Response model for restored conversation"""
    messages: List[Dict[str, Any]]
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

@router.get("/sessions", response_model=List[ChatSession])
async def get_chat_sessions():
    """
    Get all chat sessions with their descriptions and metadata
    """
    try:
        r = get_redis_client()
        
        # Get all session keys (timestamps)
        session_keys = r.keys("*")
        
        # Filter out non-session keys (like chat_descriptions)
        session_keys = [key for key in session_keys if key != "chat_descriptions"]
        
        sessions = []
        
        # Sort by timestamp (newest first)
        session_keys.sort(reverse=True)
        
        for session_id in session_keys:
            # Get description from chat_descriptions hash
            description = r.hget("chat_descriptions", session_id)
            if not description:
                description = "New Conversation"
            
            # Get message count and last message
            message_count = r.llen(session_id)
            last_message = ""
            
            if message_count > 0:
                # Get the last message
                last_msg_raw = r.lindex(session_id, -1)
                if last_msg_raw:
                    try:
                        last_msg = json.loads(last_msg_raw)
                        if last_msg.get("type") == "ai":
                            # Parse AI message content
                            content_data = json.loads(last_msg["data"]["content"])
                            last_message = content_data.get("direct_response_to_user", "")
                        else:
                            # Extract user input from human message
                            lines = last_msg["data"]["content"].split('\n')
                            user_line = next((line for line in lines if line.startswith("User's Most Recent Chat Input:")), "")
                            last_message = user_line.replace("User's Most Recent Chat Input: ", "")
                    except (json.JSONDecodeError, KeyError):
                        last_message = "Unable to preview message"
            
            # Parse session ID as timestamp
            try:
                timestamp = session_id  # ISO 8601 format
            except:
                timestamp = session_id
            
            sessions.append({
                "sessionId": session_id,
                "description": description,
                "lastMessage": last_message[:100] + "..." if len(last_message) > 100 else last_message,
                "messageCount": message_count,
                "timestamp": timestamp
            })
        
        return sessions
        
    except redis.RedisError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to connect to Redis: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

@router.post("/restore", response_model=RestoreConversationResponse)
async def restore_conversation(request: RestoreConversationRequest):
    """
    Restore a conversation by fetching all messages for a session
    """
    try:
        r = get_redis_client()
        
        # Check if session exists
        if not r.exists(request.sessionId):
            raise HTTPException(
                status_code=404,
                detail=f"Session {request.sessionId} not found"
            )
        
        # Get all messages for the session
        messages_raw = r.lrange(request.sessionId, 0, -1).reverse()
        
        formatted_messages = []
        
        for msg_raw in messages_raw:
            try:
                # Parse the message wrapper
                msg_wrapper = json.loads(msg_raw)
                msg_type = msg_wrapper['type']
                
                if msg_type == 'ai':
                    # Parse AI message content
                    content_data = json.loads(msg_wrapper['data']['content'])
                    content = content_data.get('direct_response_to_user', '')
                    
                    # Generate a unique ID for the message
                    message_id = str(uuid.uuid4())
                    
                    # Use the sessionId as a base for timestamp if not available
                    timestamp = msg_wrapper.get('timestamp', '')
                    if not timestamp and request.sessionId:
                        timestamp = request.sessionId
                    
                    formatted_messages.append({
                        "id": message_id,
                        "role": 'agent',
                        "content": content,
                        "timestamp": timestamp,
                        "created_at": timestamp
                    })
                else:
                    # Extract user input from human message
                    content = msg_wrapper['data']['content']
                    
                    # Try to extract the actual user input if it has the special prefix
                    lines = content.split('\n')
                    user_line = next((line for line in lines if line.startswith("User's Most Recent Chat Input:")), "")
                    if user_line:
                        # Found the special prefix, extract everything after it until the "---" separator
                        user_content = user_line.replace("User's Most Recent Chat Input: ", "")
                        # Find the line with "---" and take everything before it
                        for i, line in enumerate(lines):
                            if line.strip() == "---" and i > 0:
                                # Join the lines from after the prefix to before the separator
                                user_content = '\n'.join(lines[lines.index(user_line) + 1:i])
                                break
                        content = user_content.strip()
                    else:
                        # No special prefix, check if content is just "[object Object]" or empty
                        if content.strip() in ["[object Object]", "", "\n\nCurrent Project's Context Data: \n[object Object]\n\nCurrent Project's Goals Data:\n[object Object]"]:
                            content = "(User input not available)"
                    
                    # Generate a unique ID for the message
                    message_id = str(uuid.uuid4())
                    
                    # Use the sessionId as a base for timestamp if not available
                    timestamp = msg_wrapper.get('timestamp', '')
                    if not timestamp and request.sessionId:
                        timestamp = request.sessionId
                    
                    formatted_messages.append({
                        "id": message_id,
                        "role": 'user',
                        "content": content,
                        "timestamp": timestamp,
                        "created_at": timestamp
                    })
            except (json.JSONDecodeError, KeyError) as e:
                # Skip malformed messages but continue processing
                continue
        
        return {
            "messages": formatted_messages,
            "sessionId": request.sessionId
        }
        
    except HTTPException:
        raise
    except redis.RedisError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to connect to Redis: {str(e)}"
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