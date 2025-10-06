from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import api_router

app = FastAPI(title="Event Horizon API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")

@app.get('/')
def root():
    return {'msg': 'Event Horizon API is running'}

@app.get('/health')
def health_check():
    return {'status': 'healthy'}

