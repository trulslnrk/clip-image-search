import sqlite3
from fastapi import HTTPException, UploadFile
import torch
import numpy as np
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import io
import faiss

# Load CLIP model & processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Load FAISS index
EMBEDDINGS_FILE = "models/faiss_index.bin"
DB_FILE = "models/metadata.db"
index = faiss.read_index(EMBEDDINGS_FILE)

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
    
    query = f"SELECT id, url, description FROM metadata WHERE rowid IN ({placeholders})"
    
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

# Function to search for images
def search_images(query: str = None, image: UploadFile = None):
    if query:
        inputs = processor(text=[query], return_tensors="pt", padding=True)
        text_embedding = model.get_text_features(**inputs).detach().numpy()
        query_vector = text_embedding / np.linalg.norm(text_embedding)
    elif image:
        image_bytes = image.file.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        inputs = processor(images=[img], return_tensors="pt")
        image_embedding = model.get_image_features(**inputs).detach().numpy()
        query_vector = image_embedding / np.linalg.norm(image_embedding)
    else:
        raise HTTPException(status_code=400, detail="Either query text or image is required.")
    

    # _, indices = index.search(query_vector, k=5)  # Find top 5 similar images
    _, indices = index.search(query_vector, k=1)  # Find top 5 similar images

    metadata = get_metadata_by_indices("models/metadata.db", indices.tolist())
    return {"results": indices.tolist(), "metadata": metadata}

if __name__ == "__main__":
    query = "a dog in a park"
    results = search_images(query)
    print(f"Top results: {results}")
