"""
Database Module

This module handles the PostgreSQL connection and schema initialization, 
specifically configuring the pgvector extension for similarity search.
"""

import os
import psycopg2
from pgvector.psycopg2 import register_vector

def get_db_connection():
    """
    Establishes and returns a connection to the PostgreSQL database.
    Uses environment variables with fallbacks to default development values.
    
    Returns:
        psycopg2.extensions.connection: The active database connection.
    """
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "db"),
        dbname=os.getenv("POSTGRES_DB", "asset_db"),
        user=os.getenv("POSTGRES_USER", "admin"),
        password=os.getenv("POSTGRES_PASSWORD", "admin")
    )

def init_db_schema() -> int:
    """
    Initializes the database schema by enabling the vector extension and 
    creating the primary asset storage table if it does not exist.
    
    Returns:
        int: The current count of assets in the database.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Enable the vector extension required for embeddings
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        conn.commit()
        
        # Register the vector type with psycopg2 for this connection
        register_vector(conn)
        
        # Create the main table for storing asset metadata and feature vectors
        cur.execute("""
            CREATE TABLE IF NOT EXISTS studio_assets (
                id SERIAL PRIMARY KEY,
                filename TEXT,
                project_name TEXT,
                file_extension VARCHAR(10),
                aspect_ratio FLOAT,
                asset_category VARCHAR(50),
                embedding vector(512)
            );
        """)
        conn.commit()
        
        # Check how many assets currently exist to determine if seeding is needed
        cur.execute("SELECT COUNT(*) FROM studio_assets;")
        asset_count = cur.fetchone()[0]
        
    finally:
        # Ensure resources are always cleaned up
        cur.close()
        conn.close()
        
    return asset_count