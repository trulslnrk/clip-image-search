import sqlite3
from fastapi import HTTPException, UploadFile
import numpy as np
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import io
import faiss
from sklearn.cluster import KMeans
from sklearn.metrics import pairwise_distances_argmin_min

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

def search_by_text(query: str):
    inputs = processor(text=[query], return_tensors="pt", padding=True)
    text_embedding = model.get_text_features(**inputs).detach().numpy()
    query_vector = text_embedding / np.linalg.norm(text_embedding)
    return search_faiss(query_vector)

def search_by_image(image: UploadFile):
    image_bytes = image.file.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(images=[img], return_tensors="pt")
    image_embedding = model.get_image_features(**inputs).detach().numpy()
    query_vector = image_embedding / np.linalg.norm(image_embedding)
    return search_faiss(query_vector)

def search_faiss(query_vector: np.ndarray):
    distances, indices = index.search(query_vector, k=100)
    all_metadata = get_metadata_by_indices("models/metadata.db", indices.tolist())
    all_embeddings = [index.reconstruct(int(idx)) for idx in indices[0]]
    print(distances)
    
        # Separate best match and rest
    best_index = int(indices[0][0])
    best_embedding = all_embeddings[0]
    best_metadata = all_metadata[0]

    remaining_embeddings = all_embeddings[1:]
    remaining_indices = indices[0][1:]
    remaining_metadata = all_metadata[1:]
    
        # Cluster remaining 99 into 6 clusters
    n_clusters = 6
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
    kmeans.fit(remaining_embeddings)

    # Find closest embedding to each centroid
    closest_indices, _ = pairwise_distances_argmin_min(kmeans.cluster_centers_, remaining_embeddings)

    # Collect cluster representatives
    cluster_representatives = []
    for i in closest_indices:
        rep_index = int(remaining_indices[i])
        rep_embedding = remaining_embeddings[i]
        rep_metadata = remaining_metadata[i]
        cluster_representatives.append({
            "index": rep_index,
            "embedding": rep_embedding.tolist(),
            "metadata":{"id": rep_metadata[0], "url": rep_metadata[1], "desc": rep_metadata[2]}
        })

    
    # Return results
    return {
        "best_match": {
            "index": best_index,
            "embedding": best_embedding.tolist(),
            "metadata": {"id": best_metadata[0], "url": best_metadata[1], "desc": best_metadata[2]}
        },
        "clusters": cluster_representatives
    }
