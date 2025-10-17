import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import api_router
import logging
import json

# Environment configuration
APP_ENV = os.getenv("APP_ENV", "development")
DEBUG = os.getenv("BACKEND_DEBUG", "false").lower() == "true"
LOG_LEVEL = os.getenv("BACKEND_LOG_LEVEL", "info").upper()

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app with environment-specific configuration
app = FastAPI(
    title="Event Horizon API",
    version="1.0.0",
    debug=DEBUG,
    docs_url="/docs" if DEBUG else None,  # Disable docs in production
    redoc_url="/redoc" if DEBUG else None,
)

# Configure CORS based on environment
cors_origins_str = os.getenv(
    "BACKEND_CORS_ORIGINS",
    '["http://localhost:5173", "http://127.0.0.1:5173"]'
)

# Parse CORS origins from JSON string
try:
    cors_origins = json.loads(cors_origins_str)
except json.JSONDecodeError:
    logger.warning(f"Failed to parse CORS origins, using defaults")
    cors_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

logger.info(f"Starting Event Horizon API in {APP_ENV} mode")
logger.info(f"CORS origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")

@app.get('/')
def root():
    return {
        'msg': 'Event Horizon API is running',
        'environment': APP_ENV,
        'debug': DEBUG
    }

@app.get('/health')
def health_check():
    return {
        'status': 'healthy',
        'environment': APP_ENV
    }

@app.on_event("startup")
async def startup_event():
    logger.info(f"Application started in {APP_ENV} mode")
    if DEBUG:
        logger.debug("Debug mode is enabled")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down")

