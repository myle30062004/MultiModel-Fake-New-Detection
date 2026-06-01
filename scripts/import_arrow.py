#!/usr/bin/env python
"""
Import Apache Arrow dataset (reintel_final_dataset) into PostgreSQL.
Extracts images and calculates metadata.
Dataset has 12 image columns (image_0 to image_11).
"""

import os
import sys
import io
from pathlib import Path
from typing import Optional
from datasets import load_from_disk
import psycopg2
from psycopg2.extras import execute_values
from PIL import Image
import argparse
import pandas as pd


def load_arrow_dataset(path: str):
    """Load Hugging Face Dataset from save_to_disk() directory."""
    path_obj = Path(path)
    
    if not path_obj.exists():
        raise FileNotFoundError(f"Dataset path does not exist: {path}")
    
    if not path_obj.is_dir():
        raise ValueError(f"Expected a directory (Hugging Face Dataset), got file: {path}")
    
    # Check if it's a HuggingFace dataset directory
    if not (path_obj / "dataset_info.json").exists():
        raise FileNotFoundError(f"Not a valid Hugging Face dataset directory (missing dataset_info.json): {path}")
    
    try:
        print(f"Loading Hugging Face Dataset from {path}...")
        dataset = load_from_disk(str(path_obj))
        print(f"Dataset features: {list(dataset.features.keys())}")
        print(f"Total records: {len(dataset)}")
        return dataset.to_pandas()
    except Exception as e:
        print(f"Error loading dataset: {e}")
        raise


# def extract_image(image_data: Optional[bytes], output_dir: str, image_id: str) -> Optional[str]:
#     """Extract image from binary data and save to disk."""
#     if image_data is None:
#         return None
    
#     try:
#         img = Image.open(io.BytesIO(image_data))
#         output_path = Path(output_dir) / f"{image_id}.png"
#         img.save(output_path)
#         return str(output_path)
#     except Exception as e:
#         print(f"Warning: Could not extract image {image_id}: {e}")
#         return None
def extract_image(image_data, output_dir, image_id):
    """Extract image from HuggingFace Image object or bytes."""
    if image_data is None:
        return None

    try:
        # HuggingFace Image objects have a 'bytes' attribute or can be PIL Images directly
        if hasattr(image_data, 'convert'):
            img = image_data
        elif isinstance(image_data, dict) and 'bytes' in image_data:
            img = Image.open(io.BytesIO(image_data['bytes']))
        elif isinstance(image_data, bytes):
            img = Image.open(io.BytesIO(image_data))
        else:
            return None

        # Convert RGBA and P mode images to RGB for JPEG saving
        if img.mode in ('RGBA', 'P'):
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'RGBA':
                rgb_img.paste(img, mask=img.split()[-1])
            else:
                rgb_img.paste(img)
            img = rgb_img

        output_path = Path(output_dir) / f"{image_id}.jpg"
        img.save(output_path, quality=85)
        return str(output_path)

    except Exception as e:
        print(f"Warning: Could not extract image {image_id}: {e}")
        return None


def safe_float(val, default=0.0):
    """Safely convert value to float, handling NaN, None, and 'None' strings."""
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return default
    if isinstance(val, str):
        if val.strip().lower() in ('none', 'null', 'nan', ''):
            return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def safe_int(val, default=0):
    """Safely convert value to int, handling NaN, None, 'None' strings, and numeric strings."""
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return default
    if isinstance(val, str):
        if val.strip().lower() in ('none', 'null', 'nan', ''):
            return default
    try:
        # Handle string values like "1", "2.5", etc.
        float_val = float(val)
        if pd.isna(float_val):
            return default
        return int(float_val)
    except (ValueError, TypeError):
        return default


def safe_string(val, default=""):
    """Safely convert value to string, handling None."""
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return default
    return str(val).strip()


def calculate_engagement_score(likes: int, comments: int, shares: int) -> float:
    """Calculate engagement score from interaction counts."""
    return (likes * 1.0) + (comments * 2.0) + (shares * 3.0)


def connect_db(db_url):
    """Connect to PostgreSQL."""
    try:
        conn = psycopg2.connect(db_url)
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to database: {e}")
        raise


def import_dataset(arrow_path: str, db_url: str, output_dir: str):
    """Main import function."""
    print(f"Loading Dataset from {arrow_path}...")
    df = load_arrow_dataset(arrow_path)
    print(f"Columns: {df.columns.tolist()}")
    print(f"Loaded {len(df)} records.")
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("Connecting to database...")
    conn = connect_db(db_url)
    cursor = conn.cursor()
    
    print("Creating schema...")
    # Drop existing tables if they exist (for re-runs)
    cursor.execute("DROP TABLE IF EXISTS predictions CASCADE;")
    cursor.execute("DROP TABLE IF EXISTS posts CASCADE;")
    conn.commit()
    
    with open("database/migrations/001_create_posts_table.sql") as f:
        cursor.execute(f.read())
    with open("database/migrations/002_create_predictions_table.sql") as f:
        cursor.execute(f.read())
    conn.commit()
    
    print("Importing records...")
    records = []
    processed = 0
    skipped = 0
    
    for idx, row in df.iterrows():
        try:
            image_path = None
            image_count = 0
            
            # Extract images from image_0 to image_11 (12 columns)
            # Most records only have image_0, others are sparse
            for image_index in range(12):
                image_col = f"image_{image_index}"
                image_data = row.get(image_col)
                
                # Check for null/nan
                if image_data is None or (isinstance(image_data, float) and pd.isna(image_data)):
                    continue
                
                image_count += 1
                # Save only the first image as main image_path
                if image_path is None:
                    image_path = extract_image(image_data, output_dir, f"post_{idx}_{image_col}")

            # Parse numeric fields safely (some are string type in dataset)
            likes = safe_float(row.get("num_like_post"))
            comments = safe_int(row.get("num_comment_post"))
            shares = safe_int(row.get("num_share_post"))
            timestamp = safe_int(row.get("timestamp_post"))
            
            engagement = calculate_engagement_score(likes, comments, shares)
            post_msg = safe_string(row.get("post_message"))
            text_length = len(post_msg)
            
            record_tuple = (
                safe_string(row.get("id"), f"post_{idx}"),
                post_msg,
                safe_string(row.get("user_name"), "Anonymous"),
                timestamp,
                int(likes),
                comments,
                shares,
                float(engagement),
                int(text_length),
                int(image_count),
                int(row.get("label", 0)),
                image_path
            )
            
            records.append(record_tuple)
            processed += 1
            
            if processed % 500 == 0:
                print(f"  Processed {processed}/{len(df)} records... ({skipped} skipped)")
        
        except Exception as e:
            print(f"Warning: Skipping row {idx}: {e}")
            skipped += 1
            continue
    
    insert_query = """
    INSERT INTO posts 
    (id, post_message, user_name, timestamp_post, num_like_post, num_comment_post, 
     num_share_post, engagement_score, text_length, image_count, label, image_path)
    VALUES %s
    ON CONFLICT (id) DO NOTHING;
    """
    
    execute_values(cursor, insert_query, records, page_size=1000)
    conn.commit()
    
    print(f"Imported {processed} records ({skipped} skipped).")
    cursor.close()
    conn.close()
    print("Done!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import Arrow dataset to PostgreSQL")
    parser.add_argument("--arrow", required=True, help="Path to Arrow/Parquet file")
    parser.add_argument("--db-url", required=True, help="PostgreSQL connection URL")
    parser.add_argument("--output-dir", default="uploads/images", help="Image output directory")
    
    args = parser.parse_args()
    import_dataset(args.arrow, args.db_url, args.output_dir)
