from fastapi import FastAPI, UploadFile, File
import shutil
import os
from src.search import search_images
from src.process_images import process_images

app = FastAPI()

DATA_DIR = "data/"

@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    file_path = os.path.join(DATA_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"message": "File uploaded successfully"}

@app.get("/search/")
async def search(query: str):
    results = search_images(query)
    return {"results": results}
