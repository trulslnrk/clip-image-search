import sqlite3

# Create SQLite database and table
def create_metadata_db(db_file: str):
    """
    Create a SQLite database with a metadata table if it doesn't already exist.
    Args:
        db_file (str): Path to the SQLite database file.
    """
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

def insert_metadata(db_file: str, metadata: list):
    """
    Inserts metadata records into the metadata table of the specified SQLite database.

    Args:
        db_file (str): Path to the SQLite database file.
        metadata (list): A list of tuples (id, url, aspect_ratio, description) to insert.
    """
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.executemany("""
        INSERT INTO metadata (id, url, aspect_ratio, description)
        VALUES (?, ?, ?, ?)
    """, metadata)
    conn.commit()
    conn.close()


def get_metadata_by_indices(db_file: str, indices: list):
    """
    Retrieve multiple metadata records from the SQLite database using FAISS indices.
    This function adjusts the provided FAISS indices (which start at 0) to match
    the SQLite rowid (which starts at 1) and retrieves the corresponding metadata
    entries from the database.
    Args:
        db_file (str): Path to the SQLite database file.
        indices (list): A list of FAISS indices (ints or list of lists).
    Returns:
        list: A list of tuples (id, url, description, aspect_ratio) for each matching record.
    """
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

def get_metadata_by_index(db_file: str, index: int):
    """
    Retrieve a single metadata record from the SQLite database using a FAISS index.
    Args:
        db_file (str): Path to the SQLite database file.
        index (int): FAISS index of the record to retrieve.
    Returns:
        tuple: A tuple (id, url, description, aspect_ratio) for the matching record.

    """
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