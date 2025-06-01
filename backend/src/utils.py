import os
import numpy as np

def ensure_directory(path):
    if not os.path.exists(path):
        os.makedirs(path)

def normalize(x: np.ndarray) -> np.ndarray:
    return x / np.linalg.norm(x)

def normalizeValueWithinRange(min, max, value):
    """
    Normalizes a given value within a specified range [min, max] to a scale of 0 to 1000.
    Args:
        min (float): The minimum value of the range.
        max (float): The maximum value of the range.
        value (float): The value to be normalized.
    Returns:
        float: The normalized value scaled to the range 0 to 1000.
    """
    return ((value - min) / (max - min)) * 1000