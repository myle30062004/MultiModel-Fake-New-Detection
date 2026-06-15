import os

from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, HttpUrl, validator
from typing import Any, Dict, Optional

from predictor import Predictor
import database

app = FastAPI(title="Multimodal Fake News API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
print("UPLOAD_DIR =", UPLOAD_DIR)
print("EXISTS =", os.path.exists(UPLOAD_DIR))
predictor = Predictor()


class PredictionPayload(BaseModel):
    title: str
    content: str
    image_url: Optional[HttpUrl] = None
    metadata: Optional[Dict[str, Any]] = None

    @validator("title")
    def title_non_empty(cls, value: str):
        value = value.strip()
        if not value:
            raise ValueError("Title must not be empty")
        return value

    @validator("content")
    def content_non_empty(cls, value: str):
        value = value.strip()
        if not value:
            raise ValueError("Content must not be empty")
        return value


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/posts")
async def get_posts(page: int = Query(1, ge=1), limit: int = Query(20, le=100)):
    """Fetch posts with pagination."""
    offset = (page - 1) * limit
    try:
        posts = database.get_posts(limit=limit, offset=offset)
        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/posts/trending")
async def get_trending_posts(limit: int = Query(20, le=100)):
    """Fetch trending posts by engagement score."""
    try:
        posts = database.get_trending_posts(limit=limit)
        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/posts/latest")
async def get_latest_posts(limit: int = Query(20, le=100)):
    """Fetch latest posts."""
    try:
        posts = database.get_latest_posts(limit=limit)
        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/posts/search")
async def search_posts(q: str = Query(..., min_length=1), limit: int = Query(20, le=100)):
    """Search posts by content."""
    try:
        posts = database.search_posts(q, limit=limit)
        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/posts/{post_id}")
async def get_post(post_id: str):
    """Fetch single post by ID."""
    try:
        post = database.get_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return post
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/posts/{post_id}/predictions")
async def get_post_predictions(post_id: str):
    """Fetch predictions for a post."""
    try:
        predictions = database.get_predictions_for_post(post_id)
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict")
async def predict(payload: PredictionPayload, request: Request):
    """Run prediction on content."""
    client_ip = request.client.host if request.client else "unknown"
    try:
        response = predictor.predict(
            title=payload.title,
            content=payload.content,
            image_url=str(payload.image_url) if payload.image_url else None,
            client_ip=client_ip,
            post_metadata=payload.metadata or {},
        )
        return response
    except ValueError as exc:
        raise HTTPException(status_code=429, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}")


@app.get("/stats")
async def get_stats():
    """Get overall statistics."""
    try:
        stats = database.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
