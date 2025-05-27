import sqlite3

DB_FILE = "models/metadata.db"
# Alter SQLite database
def alter_metadata_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

   # Check if column already exists
    cursor.execute("PRAGMA table_info(metadata);")
    columns = [col[1] for col in cursor.fetchall()]
    if "aspect_ratio" not in columns:
        print("Adding 'aspect_ratio' column to metadata table...")
        cursor.execute("ALTER TABLE metadata ADD COLUMN aspect_ratio REAL;")
        conn.commit()
    else:
        print("'aspect_ratio' column already exists. Skipping ALTER TABLE.")

    conn.close()

alter_metadata_db()