"""
Test script for the chat API endpoints
"""
import asyncio
import httpx
import os

# Test configuration
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


async def test_chat_init():
    """Test the chat initialization endpoint"""
    print("Testing chat initialization...")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(f"{BACKEND_URL}/api/chat/init")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Chat initialized successfully")
            print(f"  Session ID: {data.get('sessionId')}")
            print(f"  Resume URL: {data.get('resumeUrl')}")
            print(f"  Message: {data.get('direct_message_to_user')}")
            return data
        else:
            print(f"✗ Failed to initialize chat: {response.status_code}")
            print(f"  Error: {response.text}")
            return None


async def test_chat_resume(session_id: str, resume_url: str):
    """Test the chat resume endpoint"""
    print(f"\nTesting chat resume with session ID: {session_id}")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{BACKEND_URL}/api/chat/resume",
            json={
                "sessionId": session_id,
                "chatInput": "Hello, this is a test message"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Chat resumed successfully")
            print(f"  Session ID: {data.get('sessionId')}")
            print(f"  Resume URL: {data.get('resumeUrl')}")
            print(f"  Message: {data.get('direct_message_to_user')}")
            return data
        else:
            print(f"✗ Failed to resume chat: {response.status_code}")
            print(f"  Error: {response.text}")
            return None


async def test_health_check():
    """Test the health check endpoint"""
    print("\nTesting health check...")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{BACKEND_URL}/api/chat/health")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Health check passed")
            print(f"  Status: {data.get('status')}")
            print(f"  N8N Connection: {data.get('n8n_connection')}")
            return True
        else:
            print(f"✗ Health check failed: {response.status_code}")
            print(f"  Error: {response.text}")
            return False


async def main():
    """Run all tests"""
    print("Chat API Test Suite")
    print("=" * 50)
    
    # Test health check first
    health_ok = await test_health_check()
    
    if not health_ok:
        print("\n⚠️ Health check failed. The n8n service might not be running.")
        print("Continuing with other tests...")
    
    # Test chat initialization
    init_result = await test_chat_init()
    
    if init_result:
        # Test chat resume if initialization was successful
        await test_chat_resume(
            init_result.get('sessionId'),
            init_result.get('resumeUrl')
        )
    
    print("\n" + "=" * 50)
    print("Test suite completed")


if __name__ == "__main__":
    asyncio.run(main())