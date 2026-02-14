from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from app.api import deps
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class UserUpdate(BaseModel):
    full_name: str = None
    email: str = None
    is_pro: bool = None
    linkedin_token: str = None

@router.get("/me")
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    return current_user

@router.put("/me")
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.email is not None:
        current_user.email = user_in.email
    if user_in.is_pro is not None:
        current_user.is_pro = user_in.is_pro
    if user_in.linkedin_token is not None:
        current_user.linkedin_token = user_in.linkedin_token
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
