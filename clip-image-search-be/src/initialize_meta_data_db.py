import sqlite3
import csv
import os

DB_FILE = "../models/metadata.db"
TSV_FILE = "../data/photos.tsv000"

def create_metadata_db(db_file: str):
    """Create the SQLite database and metadata table."""
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

def populate_metadata_db(db_file: str, tsv_file: str):
    """Populate the SQLite database with metadata from the TSV file."""
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    with open(tsv_file, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file, delimiter="\t")
        for row in reader:
            image_id = row["photo_id"]
            image_url = row["photo_image_url"]
            description = row.get("photo_description", "")
            try:
                cursor.execute("""
                    INSERT INTO metadata (id, url, description)
                    VALUES (?, ?, ?)
                """, (image_id, image_url, description))
            except sqlite3.IntegrityError:
                print(f"Skipping duplicate entry for ID {image_id}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    if not os.path.exists(DB_FILE):
        print("Creating metadata database...")
        create_metadata_db(DB_FILE)
        print("Populating metadata database...")
        populate_metadata_db(DB_FILE, TSV_FILE)
        print("Metadata database setup complete.")
    else:
        print("Metadata database already exists.")