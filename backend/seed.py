"""
Database Seeding Utility

Scans the local samples directory, extracts metadata and feature vectors for each image, 
and populates the database to provide initial data for the application.
"""

import os
from PIL import Image
from pgvector.psycopg2 import register_vector

from database import get_db_connection
from ml_engine import extract_feature_vector

# Locate the samples directory relative to this script
SAMPLE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "samples")

def seed_database() -> None:
    """
    Iterates through all supported images in the samples directory, extracts their 
    feature vectors and metadata, and inserts them into the PostgreSQL database.
    """
    print("Starting Metadata & Vector Extraction...")
    
    if not os.path.exists(SAMPLE_DIR):
        print(f"Directory {SAMPLE_DIR} not found. Skipping seed.")
        return

    # Filter for standard image formats
    images = [f for f in os.listdir(SAMPLE_DIR) if f.endswith(('.png', '.jpg', '.jpeg'))]
    total_images = len(images)
    
    if total_images == 0:
        print("No images found in samples directory. Skipping seed.")
        return

    conn = get_db_connection()
    register_vector(conn)
    cur = conn.cursor()

    success_count = 0
    
    try:
        for index, filename in enumerate(images, start=1):
            filepath = os.path.join(SAMPLE_DIR, filename)
            
            try:
                # 1. Read image bytes and generate the ML feature vector
                with open(filepath, "rb") as f:
                    image_bytes = f.read()
                vector = extract_feature_vector(image_bytes)
                
                # 2. Extract basic file metadata
                file_ext = os.path.splitext(filename)[1].lower().replace('.', '')
                
                # 3. Calculate aspect ratio using PIL
                with Image.open(filepath) as img:
                    width, height = img.size
                    aspect_ratio = round(width / height, 4)
                
                # 4. Determine asset category (Mock logic for development)
                asset_category = "2D_Sprite" if file_ext == "png" else "Photograph"

                # 5. Insert the parsed data into the database schema
                cur.execute("""
                    INSERT INTO studio_assets 
                    (filename, project_name, file_extension, aspect_ratio, asset_category, embedding)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (filename, "Studio_Inventory", file_ext, aspect_ratio, asset_category, vector))
                
                success_count += 1
                
                # Commit in batches of 50 to maintain performance
                if index % 50 == 0:
                    conn.commit()
                    
            except Exception as e:
                print(f"Failed to process {filename}: {e}")
                conn.rollback() # Rollback the current transaction on error
                
        # Final commit for any remaining assets in the batch
        conn.commit()
        print(f"SUCCESS: {success_count} assets securely vectorized with metadata!")
        
    finally:
        # Ensure database cursors and connections are closed safely
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_database()