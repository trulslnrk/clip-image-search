import faiss
import os

# Define path to FAISS index file
EMBEDDINGS_FILE = "models/faiss_index.bin"

# Ensure models directory exists
os.makedirs("models", exist_ok=True)

# Define the dimension of the embeddings (should match CLIP output, usually 512)
D = 512

# Create a new FAISS index (L2 distance)
index = faiss.IndexFlatL2(D)

# Save the index to file
faiss.write_index(index, EMBEDDINGS_FILE)
print(f"Initialized an empty FAISS index and saved it to {EMBEDDINGS_FILE}")
