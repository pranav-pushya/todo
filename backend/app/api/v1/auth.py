"""REST API endpoints for User Registration, Authentication, and Profiles."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token
from app.crud.user import (
    authenticate_user,
    change_user_password,
    create_user,
    get_user_by_email,
    get_user_by_id,
    get_user_by_username,
    get_user_profile_dict,
    update_user_profile,
)
from app.models.user import User
from app.schemas.user import (
    TokenResponse,
    UserLogin,
    UserPasswordChange,
    UserProfileResponse,
    UserRegister,
    UserUpdate,
)

router = APIRouter(prefix="/auth", tags=["Authentication & Profiles"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new developer account",
)
def register(
    user_in: UserRegister,
    db: Session = Depends(get_db),
):
    """Register a new user account with unique email and username, returning access token and profile."""
    # Check if email is already taken
    existing_email = get_user_by_email(db, email=user_in.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Check if username is already taken
    existing_username = get_user_by_username(db, username=user_in.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is already taken. Please choose another.",
        )

    # Create user
    user = create_user(db, user_in=user_in)

    # Generate JWT access token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "username": user.username}
    )

    profile_dict = get_user_profile_dict(db, user)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserProfileResponse(**profile_dict),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Log in with email/username and password (JSON)",
)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    """Authenticate with email or username and password, returning JWT access token."""
    user = authenticate_user(
        db,
        email_or_username=login_data.email_or_username,
        password=login_data.password,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "username": user.username}
    )

    profile_dict = get_user_profile_dict(db, user)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserProfileResponse(**profile_dict),
    )


@router.post(
    "/token",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="OAuth2 compatible form login (Swagger UI)",
)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Standard OAuth2 form login for Swagger docs and OAuth2 clients."""
    user = authenticate_user(
        db,
        email_or_username=form_data.username,
        password=form_data.password,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "username": user.username}
    )

    profile_dict = get_user_profile_dict(db, user)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserProfileResponse(**profile_dict),
    )


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get current user profile and live workspace counts",
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the profile and aggregated entity counts for the authenticated user."""
    profile_dict = get_user_profile_dict(db, current_user)
    return UserProfileResponse(**profile_dict)


@router.patch(
    "/me",
    response_model=UserProfileResponse,
    summary="Update current user profile information",
)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update profile fields such as name, bio, role, GitHub handle, and avatar."""
    updated_user = update_user_profile(db, current_user, user_update)
    profile_dict = get_user_profile_dict(db, updated_user)
    return UserProfileResponse(**profile_dict)


@router.post(
    "/change-password",
    summary="Change user account password",
)
def change_password(
    password_data: UserPasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Securely change password after validating current password."""
    success, message = change_user_password(
        db,
        current_user,
        current_pwd=password_data.current_password,
        new_pwd=password_data.new_password,
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )

    return {"status": "success", "message": message}
