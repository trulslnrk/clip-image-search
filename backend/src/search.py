import sqlite3
from fastapi import HTTPException, UploadFile
import numpy as np
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import io
import faiss
from sklearn.cluster import KMeans
from src.meta_data_db import get_metadata_by_indices, get_matadata_by_index

# Load CLIP model & processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Load FAISS index
INDEX_IP_PATH = "models/faiss_index_ip.bin"
INDEX_L2_PATH = "models/faiss_index_l2.bin"
DB_FILE = "models/metadata.db"
index_ip = faiss.read_index(INDEX_IP_PATH)
index_l2 = faiss.read_index(INDEX_L2_PATH)

def search_by_text(query: str):
    inputs = processor(text=[query], return_tensors="pt", padding=True)
    text_embedding = model.get_text_features(**inputs).detach().numpy()
    text_embedding_normalized = text_embedding / np.linalg.norm(text_embedding)
    _, index = index_ip.search(text_embedding_normalized, k=1)
    
    meta_data = get_matadata_by_index("models/metadata.db", index[0][0])
    query_vector = index_l2.reconstruct(int(index[0]))
    # Ensure query_vector is 2D for FAISS search
    query_vector = np.array([query_vector])  
    return search_faiss(query_vector, index=index_l2, best_search=meta_data, best_index=index[0][0])

def search_by_image(image: UploadFile):
    image_bytes = image.file.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(images=[img], return_tensors="pt")
    image_embedding = model.get_image_features(**inputs).detach().numpy()
    image_embedding_normalized = image_embedding / np.linalg.norm(image_embedding)
    _, index = index_ip.search(image_embedding_normalized, k=1)

    meta_data = get_matadata_by_index("models/metadata.db", index[0][0])
    query_vector = index_l2.reconstruct(int(index[0]))
    # Ensure query_vector is 2D for FAISS search
    query_vector = np.array([query_vector]) 
    return search_faiss(query_vector, index=index_l2, best_search=meta_data, best_index=index[0][0])    


def search_faiss(query_vector: np.ndarray, k=6, index=None, best_search=None, best_index=None):
    if index is None:
        raise ValueError("Index must be provided for search.")

    _distances, all_indices = index.search(query_vector, k=100)
    indices = all_indices[0]

    all_metadata = get_metadata_by_indices("models/metadata.db", all_indices.tolist())
    all_embeddings = [index.reconstruct(int(idx)) for idx in indices]

    if best_index is not None and best_search is not None:
        best_index = int(best_index)
        best_embedding = query_vector[0]
        best_metadata = best_search
        remaining_embeddings = all_embeddings
        remaining_indices = indices
    else:
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

    return {
        "best_match": {
            "index": best_index,
            "embeddings": best_embedding.tolist(),
            "metadata": {
                "id": best_metadata[0],
                "url": best_metadata[1],
                "desc": best_metadata[2],
                "aspectRatio": best_metadata[3]
            }
        },
        "clusters": [
            {
                "index": int(centroid_indices[i]),
                "embeddings": centroid_embeddings[i].tolist(),
                "metadata":{
                    "id": centroid_metadata[i][0], 
                    "url": centroid_metadata[i][1], 
                    "desc": centroid_metadata[i][2], 
                    "aspectRatio": centroid_metadata[i][3]
                }
            }
            for i in range(k)
        ]
    }

def navigate_in_embedding_space(current_embedding, delta, step_size, k=6):
    current_embedding = np.array(current_embedding)
    delta_vector = np.array(delta)
    step_size = step_size if step_size else 1.0

    new_embedding = current_embedding + step_size * delta_vector

    return search_faiss(np.array([new_embedding]), index=index_l2)