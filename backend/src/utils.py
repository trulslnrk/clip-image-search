import os
import numpy as np

def ensure_directory(path):
    if not os.path.exists(path):
        os.makedirs(path)

def normalize(x: np.ndarray) -> np.ndarray:
    return x / np.linalg.norm(x)

# Normalize value within min-max to range [0,1000]
def normalizeValueWithinRange(min, max, value):
  return ((value - min) / (max - min)) * 1000