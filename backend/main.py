"""
AssetMatch Main API Application

This is the primary FastAPI entry point. It handles routing, middleware configuration, 
file uploads, and the core similarity search logic.
"""

import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pgvector.psycopg2 import register_vector

# Import isolated modular components
from database import get_db_connection, init_db_schema
from ml_engine import extract_feature_vector
from seed import seed_database

# Setup absolute paths for static asset hosting
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLES_DIR = os.path.join(BASE_DIR, "samples")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for the FastAPI application.
    Executes database initialization and optional auto-seeding on startup.
    """
    print("Running initial platform checks...")
    asset_count = init_db_schema()
    
    if asset_count == 0:
        print("Database empty. Initializing background auto-seed...")
        seed_database()
    else:
        print(f"System ready. Loaded index contains {asset_count} assets.")
        
    yield # App runs here
    
    # Any teardown logic would go here

# Initialize the FastAPI app with the lifespan context
app = FastAPI(title="AssetMatch API", version="1.0", lifespan=lifespan)

# Configure CORS to allow communication from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static directory so the frontend can retrieve images
app.mount("/assets", StaticFiles(directory=SAMPLES_DIR), name="assets")

@app.get("/")
async def root():
    """Health check endpoint to verify API status."""
    return {"message": "AssetMatch API is live with modular architecture."}

@app.post("/api/search")
async def search_similar_assets(
    reference_image: UploadFile = File(...),
    max_distance: float = Form(0.7),          # Threshold for cosine distance
    file_types: Optional[str] = Form(""),     # Comma separated string: "png,jpg,svg"
    min_aspect: float = Form(0.0),            # Minimum aspect ratio
    max_aspect: float = Form(10.0)            # Maximum aspect ratio
):
    """
    Receives an image upload, extracts its feature vector, and queries the database 
    for visually similar assets based on pgvector distance and provided filters.
    """
    # Validate the uploaded file extension
    valid_extensions = ('.png', '.jpg', '.jpeg')
    if not reference_image.filename.lower().endswith(valid_extensions):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PNG or JPEG.")
    
    # Extract the feature vector from the uploaded image
    image_bytes = await reference_image.read()
    query_vector = extract_feature_vector(image_bytes)
    
    conn = get_db_connection()
    register_vector(conn) 
    cur = conn.cursor()
    
    try:
        # Construct the base query using pgvector's cosine distance operator (<=>)
        query = """
            SELECT filename, project_name, (embedding <=> %s) AS distance, file_extension, aspect_ratio
            FROM studio_assets
            WHERE (embedding <=> %s) <= %s
            AND aspect_ratio >= %s AND aspect_ratio <= %s
        """
        
        # Note: We pass query_vector twice (once for SELECT, once for WHERE)
        query_params = [query_vector, query_vector, max_distance, min_aspect, max_aspect]
        
        # Append dynamic filtering for file extensions if requested by the client
        if file_types:
            ext_list = [ext.strip().lower() for ext in file_types.split(",")]
            query += " AND file_extension = ANY(%s)"
            query_params.append(ext_list)
            
        # Order by closest match (lowest distance) and limit results
        query += " ORDER BY distance ASC LIMIT 6;"
        
        cur.execute(query, tuple(query_params))
        matches = cur.fetchall()
        
    finally:
        cur.close()
        conn.close()
    
    # Format the SQL results into a clean JSON-serializable list
    results = [
        {
            "filename": row[0], 
            "project": row[1], 
            # Convert cosine distance to a similarity score (1 - distance)
            "similarity_score": round(1 - row[2], 4),
            "file_extension": row[3],
            "aspect_ratio": row[4]
        } 
        for row in matches
    ]
    
    return {
        "status": "success",
        "matches": results
    }

@app.get("/api/download/{filename}")
async def download_asset(filename: str):
    """
    Serves a specific asset file directly for download.
    """
    file_path = os.path.join(SAMPLES_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')