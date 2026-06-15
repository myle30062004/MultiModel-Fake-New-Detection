import datetime
from decimal import Decimal

import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, List,Dict, Any
import os

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/newsguard")

# -----------------------------
# DB CONNECTION
# -----------------------------
def get_db_connection():
    return psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)


# -----------------------------
# SAFE SERIALIZER
# -----------------------------
def safe_value(v: Any):
    """Convert non-JSON serializable types"""
    if isinstance(v, datetime.datetime):
        return v.isoformat()
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, memoryview):
        return bytes(v).decode("utf-8", errors="ignore")
    return v


def safe_row(row: Dict[str, Any]) -> Dict[str, Any]:
    return {k: safe_value(v) for k, v in dict(row).items()}


# -----------------------------
# POSTS
# -----------------------------
def get_posts(limit: int = 20, offset: int = 0) -> List[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, post_message, user_name,
                   timestamp_post,
                   num_like_post, num_comment_post, num_share_post,
                   engagement_score,
                   text_length, image_count,
                   label, image_path
            FROM posts
            ORDER BY COALESCE(timestamp_post, 0)::bigint DESC NULLS LAST
            LIMIT %s OFFSET %s
        """, (limit, offset))

        rows = cursor.fetchall()
        return [safe_row(r) for r in rows]

    finally:
        cursor.close()
        conn.close()


def get_latest_posts(limit: int = 20):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, post_message, user_name,
                   timestamp_post,
                   num_like_post, num_comment_post, num_share_post,
                   engagement_score,
                   image_path, label
            FROM posts
            ORDER BY
                CASE
                    WHEN timestamp_post IS NULL THEN 0
                    WHEN timestamp_post::text ~ '^[0-9]+$'
                    THEN timestamp_post::bigint
                    ELSE 0
                END DESC
            LIMIT %s
        """, (limit,))

        rows = cursor.fetchall()
        return [dict(r) for r in rows]

    except Exception as e:
        print("🔥 DB ERROR:", e)
        raise

    finally:
        cursor.close()
        conn.close()


def get_trending_posts(limit: int = 20) -> List[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT *
            FROM posts
            ORDER BY engagement_score DESC NULLS LAST
            LIMIT %s
        """, (limit,))

        rows = cursor.fetchall()
        return [safe_row(r) for r in rows]

    finally:
        cursor.close()
        conn.close()


def get_post_by_id(post_id: int) -> Optional[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT *
            FROM posts
            WHERE id = %s
        """, (post_id,))

        row = cursor.fetchone()
        return safe_row(row) if row else None

    finally:
        cursor.close()
        conn.close()


def search_posts(query: str, limit: int = 20) -> List[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT *
            FROM posts
            WHERE post_message ILIKE %s
            LIMIT %s
        """, (f"%{query}%", limit))

        rows = cursor.fetchall()
        return [safe_row(r) for r in rows]

    finally:
        cursor.close()
        conn.close()


# -----------------------------
# PREDICTIONS
# -----------------------------
def save_prediction(post_id: int, prediction: dict) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO predictions 
            (post_id, prediction, confidence,
             text_weight, image_weight, meta_weight, trust_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (
            post_id,
            prediction.get("label"),
            prediction.get("confidence", 0.0),
            prediction.get("text_weight", 0.0),
            prediction.get("image_weight", 0.0),
            prediction.get("meta_weight", 0.0),
            prediction.get("trust_score", 0.0),
        ))

        pred_id = cursor.fetchone()["id"]
        conn.commit()
        return pred_id

    finally:
        cursor.close()
        conn.close()


def get_predictions_for_post(post_id: int) -> List[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT *
            FROM predictions
            WHERE post_id = %s
            ORDER BY created_at DESC
        """, (post_id,))

        rows = cursor.fetchall()
        return [safe_row(r) for r in rows]

    finally:
        cursor.close()
        conn.close()


# -----------------------------
# STATS
# -----------------------------
def get_stats() -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT COUNT(*) AS total FROM posts;")
        total = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) AS count FROM posts WHERE label = 0;")
        real_count = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) AS count FROM posts WHERE label = 1;")
        fake_count = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) AS total FROM predictions;")
        total_predictions = cursor.fetchone()["total"]

        return {
            "total_posts": total,
            "real_posts": real_count,
            "fake_posts": fake_count,
            "total_predictions": total_predictions
        }

    finally:
        cursor.close()
        conn.close()