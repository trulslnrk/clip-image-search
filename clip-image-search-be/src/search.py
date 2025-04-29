import sqlite3
from fastapi import HTTPException, UploadFile
import numpy as np
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import io
import faiss
from sklearn.cluster import KMeans

# Load CLIP model & processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Load FAISS index
EMBEDDINGS_FILE = "models/faiss_index_ip.bin"
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


def search_faiss(query_vector: np.ndarray, k=6):
    _distances, all_indices = index.search(query_vector, k=100)
    indices = all_indices[0]

    all_metadata = get_metadata_by_indices("models/metadata.db", all_indices.tolist())
    all_embeddings = [index.reconstruct(int(idx)) for idx in all_indices[0]]

    # Separate best match and rest
    best_index = int(indices[0])
    best_embedding = all_embeddings[0]
    best_metadata = all_metadata[0]
    
    remaining_embeddings = all_embeddings[1:]
    remaining_indices = indices[1:]
    
    # Cluster remaining 99 into 6 clusters
    kmeans = KMeans(n_clusters=k, random_state=42).fit(remaining_embeddings)

     # Find nearest point to each centroid
    remaining_embeddings = np.array(remaining_embeddings)
    centroid_indices = []
    centroids = kmeans.cluster_centers_
    for i in range(k):
        cluster_points = remaining_embeddings[kmeans.labels_ == i]
        cluster_faiss_indices = remaining_indices[kmeans.labels_ == i]  # Track actual FAISS indices

        if len(cluster_points) == 0:
            continue

        distances = np.linalg.norm(cluster_points - centroids[i], axis=1)
        closest_idx_in_cluster = np.argmin(distances)
        centroid_faiss_index = int(cluster_faiss_indices[closest_idx_in_cluster])

        centroid_indices.append(centroid_faiss_index)

    centroid_metadata = get_metadata_by_indices("models/metadata.db", [centroid_indices])
    centroid_embeddings = [index.reconstruct(i) for i in centroid_indices]


    # print(f"id: {best_metadata[0]}, url: {best_metadata[1]}, desc: {best_metadata[2]}")
    # for i in range (k):
    #     print(f"Index: {int(centroid_indices[i])}")
    #     print(f"Embeddings: for {i}")
    #     print(f"Metadata-> id: {centroid_metadata[i][0]}, url: {centroid_metadata[i][1]}, desc: {centroid_metadata[i][2]}")

    print(f"metadata: {best_metadata[1]}")    
    
    # Return results
    return {
        "best_match": {
            "index": best_index,
            "embeddings": best_embedding.tolist(),
            "metadata": {"id": best_metadata[0], "url": best_metadata[1], "desc": best_metadata[2]}
        },
               "clusters": [
            {
                "index": int(centroid_indices[i]),
                "embeddings": centroid_embeddings[i].tolist(),
                "metadata":{"id": centroid_metadata[i][0], "url": centroid_metadata[i][1], "desc": centroid_metadata[i][2]}
            }
            for i in range(k)
        ]
    }

def navigate_in_embedding_space(current_embedding, delta, step_size, k=6):
    # Step in the given direction
    best_embedding = np.array(current_embedding)
    delta_vector = np.array(delta)
    step_size = step_size if step_size else 1.0

    # Apply step size
    new_embedding = best_embedding + step_size * delta_vector
    new_embedding /= np.linalg.norm(new_embedding)

    return search_faiss(np.array([new_embedding]))