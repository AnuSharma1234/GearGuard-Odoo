from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    auth,
    users,
    departments,
    maintenance_teams,
    technicians,
    equipment,
    maintenance_requests,
    time_logs,
    reports
)

# Create FastAPI application
app = FastAPI(
    title="GearGuard API",
    description="The Ultimate Maintenance Tracker - Manage equipment, teams, and maintenance requests",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(departments.router)
app.include_router(maintenance_teams.router)
app.include_router(technicians.router)
app.include_router(equipment.router)
app.include_router(maintenance_requests.router)
app.include_router(time_logs.router)
app.include_router(reports.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to GearGuard API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
