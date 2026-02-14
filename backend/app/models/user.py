from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # Monetization
    is_pro = Column(Boolean, default=False)
    subscription_id = Column(String, nullable=True)
    
    # Social Integration
    linkedin_token = Column(String, nullable=True)
    linkedin_profile_id = Column(String, nullable=True)
    
    # SaaS Fields
    plan = Column(String, default="free") # free, pro
    razorpay_customer_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

