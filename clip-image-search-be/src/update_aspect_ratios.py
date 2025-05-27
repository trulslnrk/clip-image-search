import sqlite3
import csv

DB_FILE = "models/metadata.db"
TSV_FILE = "data_photos/photos.tsv000"

def update_aspect_ratios_from_tsv(db_file: str, tsv_file: str):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    with open(tsv_file, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file, delimiter="\t")
        updated_count = 0

        for _, row in enumerate(reader):
            photo_id = row["photo_id"]
            aspect_ratio = row["photo_aspect_ratio"]

            if not aspect_ratio:
                print(f"Missing aspect ratio for photo_id {photo_id}. Skipping.")
                continue  # skip if missing

            try:
                aspect_ratio = round(float(aspect_ratio), 4)

                # Check if photo_id exists
                cursor.execute("SELECT 1 FROM metadata WHERE id = ?", (photo_id,))
                if cursor.fetchone():
                    cursor.execute(
                        "UPDATE metadata SET aspect_ratio = ? WHERE id = ?",
                        (aspect_ratio, photo_id)
                    )
                    updated_count += 1
            except ValueError:
                print(f"Invalid aspect ratio for photo_id {photo_id}: {row['photo_aspect_ratio']}")
    
    conn.commit()
    conn.close()
    print(f"Aspect ratio updated for {updated_count} images.")

if __name__ == "__main__":
    update_aspect_ratios_from_tsv(DB_FILE, TSV_FILE)
