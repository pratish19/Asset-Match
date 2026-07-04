"""
Machine Learning Engine

This module handles the extraction of feature vectors from images using a 
pre-trained ResNet18 model, optimized for similarity search.
"""

import io
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import numpy as np

print("Loading Machine Learning Core...")

# Load ResNet18 and strip the final classification layer to get raw feature embeddings
base_model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
model = torch.nn.Sequential(*(list(base_model.children())[:-1]))
model.eval() # Set model to evaluation mode (disables dropout/batchnorm updates)

# Define the standard production image transformation pipeline
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    # Normalize using standard ImageNet mean and standard deviation
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def extract_feature_vector(image_bytes: bytes) -> np.ndarray:
    """
    Converts raw binary image data into a normalized 512-dimensional feature vector.
    
    Args:
        image_bytes (bytes): The raw byte stream of the uploaded image.
        
    Returns:
        np.ndarray: A flattened, 512-D numpy array representing the image features.
    """
    # Open the image from bytes and ensure it's in RGB format
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # Apply transformations and add a batch dimension (unsqueeze)
    tensor = transform(image).unsqueeze(0)
    
    # Extract features without tracking gradients to save memory and processing power
    with torch.no_grad():
        vector = model(tensor).flatten().numpy()
        
    return vector