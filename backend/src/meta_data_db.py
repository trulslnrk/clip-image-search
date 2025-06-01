import sqlite3

# Create SQLite database and table
def create_metadata_db(db_file: str):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS metadata (
            id TEXT PRIMARY KEY,
            url TEXT NOT NULL,
            aspect_ratio REAL,
            description TEXT
        )
    """)
    conn.commit()
    conn.close()

# Insert metadata into the database
def insert_metadata(db_file: str, metadata: list):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.executemany("""
        INSERT INTO metadata (id, url, aspect_ratio, description)
        VALUES (?, ?, ?, ?)
    """, metadata)
    conn.commit()
    conn.close()

def get_metadata_by_indices(db_file: str, indices: list):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    # Ensure indices is a flat list
    flat_indices = [item for sublist in indices for item in sublist] if isinstance(indices[0], (list, tuple)) else indices

    # Adjust FAISS indices to match SQLite rowid (FAISS starts at 0, SQLite rowid starts at 1)
    adjusted_indices = [index + 1 for index in flat_indices]
    placeholders = ", ".join("?" for _ in adjusted_indices)

    if not adjusted_indices:
        raise ValueError("No indices provided for metadata retrieval.")
    
    query = f"SELECT id, url, description, aspect_ratio FROM metadata WHERE rowid IN ({placeholders})"
    
    try:
        cursor.execute(query, adjusted_indices)
    except sqlite3.Error as e:
        conn.close()
        raise RuntimeError(f"Database query failed: {e}")
    results = cursor.fetchall()
    if not results:
        print("No results found. Ensure FAISS index and database are synchronized.")  # Debugging log
    conn.close()
    return results

def get_matadata_by_index(db_file: str, index: int):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Adjust FAISS index to match SQLite rowid (FAISS starts at 0, SQLite rowid starts at 1)
    adjusted_index = index + 1
    
    try:
        query = f'SELECT id, url, description, aspect_ratio FROM metadata WHERE rowid="{adjusted_index}"'
        cursor.execute(query)
    except sqlite3.Error as e:
        conn.close()
        raise RuntimeError(f"Database query failed: {e}")
    
    result = cursor.fetchone()
    if not result:
        print("No result found. Ensure FAISS index and database are synchronized.")  # Debugging log
    conn.close()
    return result