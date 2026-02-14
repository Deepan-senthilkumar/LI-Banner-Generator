from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import time
import random

router = APIRouter()

class TextGenRequest(BaseModel):
    context: str # e.g., "Software Engineer", "Marketing Guru"
    type: str # "headline", "tagline", "about"

class ImageGenRequest(BaseModel):
    prompt: str

@router.post("/generate-text")
def generate_text(request: TextGenRequest):
    # Simulate AI processing time
    time.sleep(1.5)
    
    context = request.context.lower()
    
    if request.type == "headline":
        headlines = [
            f"Transforming Ideas into {request.context} Reality",
            f"Passionate {request.context} | Building the Future",
            f"Senior {request.context} specializing in Scalable Systems",
            f"Helping businesses grow through {request.context} excellence"
        ]
        return {"result": random.choice(headlines)}
    
    elif request.type == "tagline":
        taglines = [
            "Innovate. Build. Scale.",
            "Designing for the user.",
            "Code that matters.",
            "Turning coffee into code."
        ]
        return {"result": random.choice(taglines)}
        
    return {"result": f"AI generated text for {request.context}"}

@router.post("/generate-image")
def generate_image(request: ImageGenRequest):
    # Simulate AI processing time
    time.sleep(2.0)
    
    # Return a random abstract/tech background from Unsplash or a placeholder service
    # In a real app, this would call OpenAI DALL-E or Stability AI
    
    styles = [
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80", # Tech Blue
        "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80", # Gradient dark
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80", # Space/Network
        "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1200&q=80"  # Abstract Fluid
    ]
    
    return {"url": random.choice(styles)}
