import torch
import os
import numpy as np
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import faiss

# Load CLIP model & processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Directory setup
DATA_DIR = "data/"
EMBEDDINGS_FILE = "models/faiss_index.bin"

# FAISS Index
embedding_dim = 512  # CLIP's output embedding size
if os.path.exists(EMBEDDINGS_FILE):
    index = faiss.read_index(EMBEDDINGS_FILE)
else:
    print("FAISS index not found, creating a new one...")
    index = faiss.IndexFlatL2(512)  # Assuming 512-dimensional embeddings

# Function to generate embeddings
def generate_embedding(image_path: str):
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        embedding = model.get_image_features(**inputs).detach().numpy()
        embedding = embedding / np.linalg.norm(embedding)
    return embedding

# Process all images and store embeddings
def process_images():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    image_files = [f for f in os.listdir(DATA_DIR) if f.endswith((".png", ".jpg", ".jpeg"))]
    embeddings = []

    for image_file in image_files:
        image_path = os.path.join(DATA_DIR, image_file)
        embedding = generate_embedding(image_path)
        embeddings.append(embedding)

    # Convert to NumPy array & add to FAISS
    embeddings = np.vstack(embeddings)
    index.add(embeddings)

    # Save FAISS index
    faiss.write_index(index, EMBEDDINGS_FILE)
    print(f"Processed {len(image_files)} images and saved embeddings.")

if __name__ == "__main__":
    process_images()
