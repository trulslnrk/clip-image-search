import sqlite3

# Create SQLite database and table
def create_metadata_db(db_file: str):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS metadata (
            id TEXT PRIMARY KEY,
            url TEXT NOT NULL,
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
        INSERT INTO metadata (id, url, description)
        VALUES (?, ?, ?)
    """, metadata)
    conn.commit()
    conn.close()