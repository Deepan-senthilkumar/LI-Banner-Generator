from fastapi import APIRouter
from app.api.v1.endpoints import auth, payment, social, ai, projects, users

api_router = APIRouter()

# Register routes
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(payment.router, prefix="/payment", tags=["payment"])
api_router.include_router(social.router, prefix="/social", tags=["social"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
