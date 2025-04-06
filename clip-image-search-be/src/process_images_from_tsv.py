from io import BytesIO
import requests
import torch
import os
import numpy as np
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
from meta_data_db import create_metadata_db, insert_metadata
import faiss
import csv

# Load CLIP model & processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Directory setup
DATA_DIR = "data/"
EMBEDDINGS_FILE = "models/faiss_index.bin"
DB_FILE = "models/metadata.db"

# # Ensure models directory exists
# os.makedirs("models", exist_ok=True)
# # Ensure data directory exists
# os.makedirs(DATA_DIR, exist_ok=True)
# # Ensure metadata directory exists
# os.makedirs("metadata", exist_ok=True)
# # Ensure FAISS index file exists    

# FAISS Index
embedding_dim = 512  # CLIP's output embedding sizeD
if os.path.exists(EMBEDDINGS_FILE):
    index = faiss.read_index(EMBEDDINGS_FILE)
# else:
#     print("FAISS index not found, creating a new one...")
#     index = faiss.IndexFlatL2(512)  # Assuming 512-dimensional embeddings

# Function to generate embeddings
def generate_embedding_from_image(image):
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        embedding = model.get_image_features(**inputs).detach().numpy()
        embedding = embedding / np.linalg.norm(embedding)
    return embedding

# Process all images and store embeddings
def process_images_from_tsv():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    embeddings = []
    metadata = []

    with open("data/photos.tsv000", "r", encoding="utf-8") as file:
        reader = csv.DictReader(file, delimiter="\t")
        for index, row in enumerate(reader):
            # Check if the image already exists in the directory
            image_url = row["photo_image_url"]
            image_id = row["photo_id"]
            description = row.get("photo_description", "")
            image_path = os.path.join(DATA_DIR, f"{image_id}.jpg")
            if not os.path.exists(image_path) and index < 15:
                # Download the image if it doesn't exist
                try:
                # Download the image
                    response = requests.get(image_url)
                    response.raise_for_status()
                    image = Image.open(BytesIO(response.content)).convert("RGB")
                    # image.save(image_path)

                                    # Generate embedding
                    embedding = generate_embedding_from_image(image)
                    print(f"Generated embedding for image ID {image_id}")
                    embeddings.append(embedding)

                    # Save metadata
                    print(f"Saving metadata for image ID {image_id}")
                    metadata.append((image_id, image_url, description))

                except Exception as e:
                    print(f"Failed to process image from URL {image_url}: {e}")

    # Convert to NumPy array & add to FAISS
    embeddings = np.vstack(embeddings)
    index = faiss.IndexFlatL2(512)
    index.add(embeddings)
    

    # Save FAISS index
    faiss.write_index(index, EMBEDDINGS_FILE)
    
    # Save metadata to SQLite
    create_metadata_db(DB_FILE)
    insert_metadata(DB_FILE, metadata)

if __name__ == "__main__":
    process_images_from_tsv()
