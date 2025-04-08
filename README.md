# Generative Artificial Intelligence – Clip image search

## Some description

Bladi bladi bladi

## Running locally:

Download the code from the zip-file or clone the GitHub repository:

```bash
$ git clone https://github.com/trulslnrk/clip-image-search.git
```

### Backend

When running the backend do not use python versions higher than 3.10.
This is because not all dependencies support the newest versions of python.

1. Be sure you are in the correct folder. So from the root directory of this project:

```bash
$ cd ./clip-image-search-be
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

4. Run the backend:

```bash
$ uvicorn src.app:app --reload
```

### Frontend

1. Be sure you are in the correct folder. So from the root directory of this project:

```bash
$ cd ./clip-image-search-frontend
```

The frontend application and build system runs on node.js. To get up and running:

- Node version is specified in the `.nvmrc` file
- Install [NVM](https://github.com/nvm-sh/nvm)
- Run the command `nvm install` from the `clip-image-search-frontend` directory to install correct node version

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

##
