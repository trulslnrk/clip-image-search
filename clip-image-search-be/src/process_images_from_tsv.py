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

# Paths
DATA_DIR = "data/"
EMBEDDINGS_FILE_IP = "models/faiss_index_ip_2.bin"
EMBEDDINGS_FILE_L2 = "models/faiss_index_l2_2.bin"
DB_FILE = "models/metadata.db"

# Constants
EMBEDDING_DIM = 512  # CLIP base output

# Load CLIP model & processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# 
# Normalize value within min-max to range [0,1000]
#  
def normalizeValueWithinRange(min, max, value):
  return ((value - min) / (max - min)) * 1000


def generate_embedding(image: Image.Image):
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        embedding = model.get_image_features(**inputs).detach().numpy()
        normalized_embedding = embedding / np.linalg.norm(embedding)
    return (embedding, normalized_embedding)


def process_images_from_tsv(tsv_path="data/photos.tsv000"):
    print("Processing images from TSV...")
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    embeddings = []
    normalized_embeddings = []
    metadata = []

    with open(tsv_path, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file, delimiter="\t")
        for index, row in enumerate(reader):
            if(index < 3):
                image_url = row["photo_image_url"]
                image_id = row["photo_id"]
                description = row.get("photo_description", "")
                image_path = os.path.join(DATA_DIR, f"{image_id}.jpg")

                try:
                    # Download and process image
                    response = requests.get(image_url, timeout=10)
                    response.raise_for_status()
                    image = Image.open(BytesIO(response.content)).convert("RGB")

                    # Generate embedding
                    embedding, normalized_embedding = generate_embedding(image)
                    embeddings.append(embedding)
                    normalized_embeddings.append(normalized_embedding)

                    # Normalize the width and height to fit to a max value of 1000
                    width, height = image.size
                    max_value = max(width, height)
                    normalized_width = normalizeValueWithinRange(0, max_value, width)
                    normalized_height = normalizeValueWithinRange(0, max_value, height)
                    # Resize image to the normalized dimensions
                    image = image.resize((int(normalized_width), int(normalized_height)), Image.NEAREST)

                    # Save image
                    image.save(image_path)

                    # Save metadata
                    metadata.append((image_id, image_url, description))

                    if index % 100 == 0:
                        print(f"[{index}] Processed image and embedding.")

                except Exception as e:
                    print(f"[{index}] Failed to process {image_url}: {e}")

    if not embeddings:
        print("No embeddings created. Exiting.")
        return

    print(f"✅ Created embeddings for {len(embeddings)} images.")

    # Stack and index embeddings (no normalization)
    all_embeddings = np.vstack(embeddings)
    index_l2 = faiss.IndexFlatL2(EMBEDDING_DIM)
    index_l2.add(all_embeddings)
    faiss.write_index(index_l2, EMBEDDINGS_FILE_L2)
    print(f"✅ FAISS index written to: {EMBEDDINGS_FILE_L2}")

    # Stack and index embeddings (with normalization)
    all_normalized_embeddings = np.vstack(normalized_embeddings)
    index_ip = faiss.IndexFlatIP(EMBEDDING_DIM)
    index_ip.add(all_normalized_embeddings)
    faiss.write_index(index_ip, EMBEDDINGS_FILE_IP)
    print(f"✅ FAISS index written to: {EMBEDDINGS_FILE_IP}")

    # Store metadata
    create_metadata_db(DB_FILE)
    insert_metadata(DB_FILE, metadata)
    print(f"✅ Metadata saved to DB: {DB_FILE}")

if __name__ == "__main__":
    process_images_from_tsv()
