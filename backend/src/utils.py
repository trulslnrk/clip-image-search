import os
import numpy as np

def ensure_directory(path):
    if not os.path.exists(path):
        os.makedirs(path)

def normalize(x: np.ndarray) -> np.ndarray:
    return x / np.linalg.norm(x)