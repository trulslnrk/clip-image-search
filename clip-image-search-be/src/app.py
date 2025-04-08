from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
from src.search import search_by_text, search_by_image, navigate_in_embedding_space, search_by_text_two
from pydantic import BaseModel
from typing import List

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

@app.get("/api/search/text")
async def search_text(query: str = Query(..., description="Text to search for")):
    try:
        results = search_by_text(query)
        return JSONResponse(content=results)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)
    
@app.get("/api/search/text/two")
async def search_text(query: str = Query(..., description="Text to search for")):
    try:
        results = search_by_text_two(query)
        return JSONResponse(content=results)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)
    
@app.post("/api/search/image")
async def search_image(image: UploadFile = File(...)):
    try:
        results = search_by_image(image)
        return JSONResponse(content=results)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)
    
    
class NavigateRequest(BaseModel):
    current_embedding: List[float]
    delta: List[float]
    step_size: float

@app.post("/api/navigate")
async def navigate(request: NavigateRequest):
    try:
        results = navigate_in_embedding_space(request.current_embedding, request.delta, request.step_size)
        return JSONResponse(content=results)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))