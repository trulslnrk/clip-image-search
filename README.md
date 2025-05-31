# Generative Artificial Intelligence – Clip image search

## Overview

This is a web application that demonstrates semantic image search and embedding space navigation using OpenAI’s CLIP model. Users can perform both text- and image-based searches and interactively explore CLIP’s latent space by walking in embedding space directions. The system is built using:

- **Frontend**: React + TypeScript with TanStack Router (file-based routing)
- **Backend**: Python with FastAPI
- **ML Infrastructure**: CLIP via Hugging Face, FAISS for similarity search, and KMeans for clustering

## Structure

```
clip-image-search/
├── frontend/                          # React app
│   ├── src/
│   │   ├── components/                # React components
│   │   ├── models/                    # Shared TypeScript models
│   │   └── routes/                    # File-based routing (TanStack Router)
├── backend/                           # Python FastAPI backend
│   ├── models/                        # FAISS indexes and SQLite DB file
│   ├── data_photos/                   # Metadata for all images
│   ├── src/
│   │   ├── app.py                     # FastAPI app entry point
│   │   ├── meta_data_db.py            # Metadata DB logic
│   │   ├── process_images_from_tsv.py # Script to process images & embeddings
│   │   └── search.py                  # Search and clustering logic
│   └── requirements.txt               # Dependencies
└── README.md
```

## Running locally:

Download the code from the zip-file or clone the GitHub repository:

```bash
$ git clone https://github.com/trulslnrk/clip-image-search.git
```

### Backend

> [!NOTE] > **Python 3.10 required:** Some dependencies are not compatible with versions above 3.10.

1. Be sure you are in the correct folder. So from the root directory of this project:

```bash
$ cd ./backend
```

2. It is recommended that you use a virtual environment to install the dependencies. Create a virtual environment:

```bash
$ python3 -m venv venv
```

Activate the virtual environment:

```bash
$ source venv/bin/activate
```

3. Install dependencies:

```bash
$ pip3 install -r requirements.txt
```

4. Start the FastAPI server:

```bash
$ uvicorn src.app:app --reload
```

### Frontend

1. Open a new terminal window and navigate to the frontend folder:

```bash
$ cd ./frontend
```

The frontend application and build system runs on node.js. To get up and running:

- Node version is specified in the `.nvmrc` file
- Install [NVM](https://github.com/nvm-sh/nvm)
- Run the command `nvm install` from the `frontend` directory to install correct node version

2. Install dependencies:

```bash
$ npm install
```

3. Run the frontend in dev mode:

```bash
$ npm run dev
```

## Test the program

Both the backend and the frontend should be running now. Go to http://localhost:5173/ in the browser to start testing.

You can now:

- Enter a text query to search for related images
- Upload an image to find visually similar images
- Click on cluster results to navigate the embedding space
- Use the explore mode to walk along individual embedding dimensions

## Notes

- Images are not stored locally; they are loaded on demand from the Unsplash CDN.
- The FAISS index is precomputed using CLIP embeddings and stored locally in the backend/models/ folder.
