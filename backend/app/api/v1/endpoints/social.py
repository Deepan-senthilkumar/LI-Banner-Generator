from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Mock LinkedIn Configuration
LINKEDIN_CLIENT_ID = "mock_client_id"
LINKEDIN_CLIENT_SECRET = "mock_client_secret"
REDIRECT_URI = "http://localhost:5173/app/settings" # Frontend callback

@router.get("/auth")
def linkedin_auth():
    # Return the OAuth URL
    return {
        "url": f"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={LINKEDIN_CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope=r_liteprofile%20w_member_social"
    }

@router.get("/callback")
def linkedin_callback(
    code: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    # In a real app, exchange code for access token here via requests.post
    # mock_token_response = requests.post(...)
    
    mock_token = f"mock_linkedin_token_{code}"
    
    current_user.linkedin_token = mock_token
    current_user.linkedin_profile_id = "mock_profile_id"
    db.commit()
    
    return {"status": "success", "connected": True}

@router.post("/publish")
def publish_to_linkedin(
    data: dict, # { "image_url": "...", "text": "..." }
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    if not current_user.linkedin_token:
        raise HTTPException(status_code=400, detail="LinkedIn not connected")
        
    # Logic to publish would go here:
    # 1. Register Upload
    # 2. Upload Image Binary
    # 3. Create Share
    
    logger.info(f"Publishing to LinkedIn for user {current_user.id}")
    
    return {"status": "published", "post_url": "https://linkedin.com/feed/update/urn:li:share:mock123"}
