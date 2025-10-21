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

# Get public n8n domain for URL translation
N8N_PUBLIC_DOMAIN = os.getenv("N8N_BASE_URL", "https://eh-n8n.retanatech.com")

def translate_resume_url(public_url: str) -> str:
    """
    Translate a public n8n URL to an internal Docker network URL.
    
    When n8n generates a resumeUrl, it uses the public domain (e.g., https://eh-n8n.retanatech.com).
    However, the backend container should use the internal Docker network to avoid DNS issues
    and unnecessary external routing.
    
    Example:
        https://eh-n8n.retanatech.com/webhook-waiting/123
        becomes
        http://n8n:5678/webhook-waiting/123
    """
    if public_url.startswith(N8N_PUBLIC_DOMAIN):
        # Extract the path from the public URL
        path = public_url.replace(N8N_PUBLIC_DOMAIN, "")
        # Construct internal URL
        return f"{N8N_URL}{path}"
    
    # If the URL doesn't match the expected public domain, return as-is
    # (This handles cases where the URL might already be internal or use a different format)
    return public_url

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

def parse_user_message(content: str) -> str:
    """
    Parse user input from various message formats in the n8n workflow.
    
    This function handles multiple patterns used by different agents:
    1. "User's Most Recent Chat Input:" followed by content and "---" separator
    2. Simple content with context data after "======"
    3. Content with just "[object Object]" or empty
    
    Returns the actual user input or a fallback message.
    """
    # Handle empty or null content
    if not content or content.strip() == "":
        return "(User input not available)"
    
    lines = content.split('\n')
    
    # Pattern 1: Look for "User's Most Recent Chat Input:" prefix
    for i, line in enumerate(lines):
        if line.startswith("User's Most Recent Chat Input:"):
            # Extract everything after the prefix
            user_input = line.replace("User's Most Recent Chat Input:", "").strip()
            
            # If there's content on the same line after the prefix, use it
            if user_input:
                return user_input
            
            # Otherwise, look for content between this line and the "---" separator
            for j in range(i + 1, len(lines)):
                if lines[j].strip() == "---":
                    # Join the lines from after the prefix to before the separator
                    user_content = '\n'.join(lines[i + 1:j]).strip()
                    return user_content if user_content else "(User input not available)"
            
            # If no separator found, return the next non-empty line if it exists
            for j in range(i + 1, len(lines)):
                if lines[j].strip():
                    return lines[j].strip()
    
    # Pattern 2: Look for content before "======" separator
    for i, line in enumerate(lines):
        if line.strip() == "======" and i > 0:
            # The user input is everything before this separator
            user_content = '\n'.join(lines[:i]).strip()
            if user_content and user_content not in ["[object Object]"]:
                return user_content
    
    # Pattern 3: Check if content is just placeholder text
    if content.strip() in ["[object Object]", "\n\nCurrent Project's Context Data: \n[object Object]\n\nCurrent Project's Goals Data:\n[object Object]"]:
        return "(User input not available)"
    
    # Pattern 4: If content contains JSON-like structures, try to extract just the user part
    # Check for patterns like "Current Project's Context Data:" and extract what comes before
    for i, line in enumerate(lines):
        if "Current Project's" in line and "Data:" in line and i > 0:
            # User input is likely everything before this line
            user_content = '\n'.join(lines[:i]).strip()
            if user_content and user_content not in ["[object Object]"]:
                return user_content
    
    # Pattern 5: Handle the case where the content is just a simple user input
    # without any special prefixes or separators
    if content.strip() and len(content.strip()) < 200:  # Reasonable length for user input
        # Check if it looks like a user message (not JSON or technical data)
        if not any(char in content.strip() for char in ['{', '}', '[', ']']):
            return content.strip()
    
    # If all else fails, return the content if it's not a placeholder
    if content.strip() and content.strip() not in ["[object Object]"]:
        # Return just the first line if it's a long message
        first_line = lines[0].strip()
        if first_line and len(first_line) < 100:  # Reasonable length for user input
            return first_line
    
    return "(User input not available)"

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

class AddDescriptionRequest(BaseModel):
    """Request model for adding a chat description"""
    sessionId: str
    description: str

@router.post("/chat", response_model=WebhookResponse)
async def chat(request: ChatRequest):
    """
    Handle chat requests - can initialize a new session or resume an existing one
    """
    # Debug logging
    print(f"[DEBUG] Chat request received: sessionId={request.sessionId}, chatInput={request.chatInput}, resumeUrl={request.resumeUrl}")
    
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            # Determine which endpoint and payload to use based on session state
            if request.sessionId is None:
                # Case 1: New chat session (no sessionId)
                print(f"[DEBUG] Starting new chat session")
                webhook_url = f"{N8N_URL}/n8n/project-planner"
                payload = {}  # Empty body for initial request
                
            elif request.resumeUrl:
                # Case 2: Active session continuation (sessionId + resumeUrl)
                # Use the webhook-waiting URL to continue the current workflow execution
                print(f"[DEBUG] Continuing active session {request.sessionId} via resumeUrl")
                webhook_url = translate_resume_url(request.resumeUrl)
                payload = {
                    "sessionId": request.sessionId,
                    "chatInput": request.chatInput
                }
                
            else:
                # Case 3: Restored session (sessionId but no resumeUrl)
                # Send to project-planner with sessionId to restore from Redis
                print(f"[DEBUG] Restoring conversation for session {request.sessionId}")
                webhook_url = f"{N8N_URL}/n8n/project-planner"
                payload = {
                    "sessionId": request.sessionId,
                    "chatInput": request.chatInput
                }
            
            print(f"[DEBUG] Sending request to {webhook_url} with payload: {payload}")
            response = await client.post(
                webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                print(f"[DEBUG] n8n returned status {response.status_code}: {response.text}")
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
        messages_raw = r.lrange(request.sessionId, 0, -1)
        if messages_raw:
            messages_raw.reverse()
        
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
                    content = parse_user_message(msg_wrapper['data']['content'])
                    
                    # Skip user messages that contain placeholder context data
                    if "Current Project's Context Data:" in msg_wrapper['data']['content'] and "[object Object]" in msg_wrapper['data']['content']:
                        continue
                    
                    # Generate a unique ID for the message
                    message_id = str(uuid.uuid4())
                    
                    # Use the sessionId as a base for timestamp if not available
                    timestamp = msg_wrapper.get('timestamp', '')
                    if not timestamp and request.sessionId:
                        timestamp = request.sessionId
                    
                    user_message = {
                        "id": message_id,
                        "role": 'user',
                        "content": content,
                        "timestamp": timestamp,
                        "created_at": timestamp
                    }
                    
                    # Always skip the first message (starting prompt)
                    if len(formatted_messages) > 0 or messages_raw.index(msg_raw) > 0:
                        formatted_messages.append(user_message)
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

@router.post("/addDescription")
async def add_description(request: AddDescriptionRequest):
    """
    Add or update a chat description in Redis
    This endpoint is called by n8n to store conversation titles
    """
    try:
        r = get_redis_client()
        
        # Validate the description length (max 60 characters as per design)
        if len(request.description) > 60:
            raise HTTPException(
                status_code=400,
                detail="Description must be 60 characters or less"
            )
        
        # Set the description in the chat_descriptions hash
        # HSET chat_descriptions {sessionId} {description}
        r.hset("chat_descriptions", request.sessionId, request.description)
        
        return {
            "success": True,
            "sessionId": request.sessionId,
            "description": request.description
        }
        
    except redis.RedisError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to connect to Redis: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )