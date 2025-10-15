# Chat API Implementation

This document describes the chat API implementation that proxies requests between the frontend and n8n webhooks.

## Overview

The chat API provides two main endpoints:
1. `/api/chat/init` - Initialize a new chat session
2. `/api/chat/resume` - Continue an existing chat session
3. `/api/chat/health` - Health check endpoint

## Architecture

```
Frontend → Backend API → n8n Webhook → n8n Workflow
```

The frontend no longer directly communicates with n8n. Instead, it sends requests to the backend, which then forwards them to the appropriate n8n webhook. This approach solves the Docker networking and CORS issues.

## API Endpoints

### Initialize Chat Session

**Endpoint:** `POST /api/chat/init`

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "direct_message_to_user": "Welcome to the Project Planning Assistant!",
  "resumeUrl": "http://n8n:5678/webhook-test/project-planner/abc123",
  "sessionId": "abc123-def456-ghi789"
}
```

### Resume Chat Session

**Endpoint:** `POST /api/chat/resume`

**Request Body:**
```json
{
  "sessionId": "abc123-def456-ghi789",
  "chatInput": "I want to create a new project"
}
```

**Response:**
```json
{
  "direct_message_to_user": "I'll help you create a new project. What type of project would you like to create?",
  "resumeUrl": "http://n8n:5678/webhook-test/project-planner/abc123",
  "sessionId": "abc123-def456-ghi789"
}
```

### Health Check

**Endpoint:** `GET /api/chat/health`

**Response:**
```json
{
  "status": "healthy",
  "n8n_connection": "ok"
}
```

## Configuration

The n8n URL is configured via the `N8N_URL` environment variable. If not set, it defaults to `http://n8n:5678`.

## Testing

Run the test script to verify the implementation:

```bash
cd backend
python test_chat_api.py
```

## Frontend Integration

The frontend has been updated to use the new backend endpoints:

```javascript
// Initialize chat session
const response = await fetch('/api/chat/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
});

// Resume chat session
const response = await fetch('/api/chat/resume', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    chatInput: message
  })
});
```

## Error Handling

The API handles the following error cases:

1. **n8n Service Unavailable**: Returns a 503 status code with details about the connection error
2. **Invalid n8n Response**: Returns a 500 status code if the response from n8n doesn't contain the expected fields
3. **Network Errors**: Returns appropriate HTTP status codes with error details

## Security Considerations

1. The backend validates the response from n8n to ensure it contains the expected fields
2. Timeouts are set to prevent hanging requests
3. Error messages are sanitized to prevent leaking sensitive information

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure the n8n container is running and accessible from the backend container
2. **CORS Errors**: Verify the backend CORS configuration includes the frontend URL
3. **Timeout Errors**: Check if n8n is responding within the timeout period (30 seconds)

### Debugging

1. Check the backend logs for error messages
2. Use the health check endpoint to verify n8n connectivity
3. Test the n8n webhook directly to ensure it's working correctly

## Future Enhancements

1. Add authentication/authorization to the chat endpoints
2. Implement session persistence in the database
3. Add rate limiting to prevent abuse
4. Implement chat history storage and retrieval