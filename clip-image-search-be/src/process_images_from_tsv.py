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
EMBEDDINGS_FILE = "../models/faiss_index.bin"
DB_FILE = "../models/metadata.db"


# FAISS Index
embedding_dim = 512  # CLIP's output embedding size, with clip-vit-base-patch32 it should be 512
if os.path.exists(EMBEDDINGS_FILE):
    index = faiss.read_index(EMBEDDINGS_FILE)

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
            image_url = row["photo_image_url"]
            image_id = row["photo_id"]
            description = row.get("photo_description", "")
            image_path = os.path.join(DATA_DIR, f"{image_id}.jpg")
            if not os.path.exists(image_path):
                # Download the image if it doesn't exist
                try:
                # Download the image
                    response = requests.get(image_url)
                    response.raise_for_status()
                    image = Image.open(BytesIO(response.content)).convert("RGB")
                    # image.save(image_path)

                    # Generate embedding
                    embedding = generate_embedding_from_image(image)
                    embeddings.append(embedding)

                    # Save metadata
                    metadata.append((image_id, image_url, description))
                    
                    if index % 100 == 0:
                        print(f"Finished with batch, at element: {index}")

                except Exception as e:
                    print(f"Failed to process image from URL {image_url}: {e}")



    print(f"Added embedding for {len(embedding)} pictures")
    # Convert to NumPy array & add to FAISS
    embeddings = np.vstack(embeddings)
    index = faiss.IndexFlatL2(512)
    index.add(embeddings)
    
    
    # Save FAISS index
    faiss.write_index(index, EMBEDDINGS_FILE)
    print("Added index to file")
    
    # Save metadata to SQLite
    create_metadata_db(DB_FILE)
    insert_metadata(DB_FILE, metadata)
    print(f"Added metadata for {len(metadata)}")

if __name__ == "__main__":
    process_images_from_tsv()
