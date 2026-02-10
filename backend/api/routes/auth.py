"""Authentication routes."""
from fastapi import APIRouter, HTTPException, status, Depends
from models.schemas import LoginRequest, TokenResponse, UserCreate, UserResponse
from core.security import (
    verify_password, get_password_hash, create_access_token, 
    create_refresh_token, decode_token, get_current_user
)

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Authenticate user and return tokens."""
    # TODO: Replace with actual database lookup
    # For demo purposes, accept any valid email/password
    user_data = {
        "sub": "demo-user-id",
        "email": request.email,
        "role": "admin"
    }
    
    return TokenResponse(
        access_token=create_access_token(user_data),
        refresh_token=create_refresh_token(user_data)
    )


@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    """Register a new user."""
    # TODO: Implement actual user registration
    return UserResponse(
        id="new-user-id",
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        organization_id=user.organization_id,
        is_active=True,
        created_at="2024-01-01T00:00:00Z"
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """Refresh access token."""
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    user_data = {
        "sub": payload.get("sub"),
        "email": payload.get("email"),
        "role": payload.get("role")
    }
    
    return TokenResponse(
        access_token=create_access_token(user_data),
        refresh_token=create_refresh_token(user_data)
    )


@router.get("/me", response_model=dict)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information."""
    return current_user
