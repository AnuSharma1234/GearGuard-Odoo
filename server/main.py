"""
GearGuard API Entry Point
This file imports the FastAPI app from the app module.
Run with: uvicorn main:app --reload
"""
from app.main import app

__all__ = ["app"]