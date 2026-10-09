"""REST API endpoints for User Profiles and Public Dev Cards."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.user import get_user_by_id, get_user_profile_dict
from app.models.user import User
from app.schemas.user import UserProfileResponse

router = APIRouter(prefix="/users", tags=["User Profiles"])


@router.get(
    "",
    response_model=List[UserProfileResponse],
    summary="List all developer profiles (Team / Community)",
)
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Retrieve active developer profiles for collaborative view and mentions."""
    users = db.query(User).filter(User.is_active == True).offset(skip).limit(limit).all()
    results = []
    for u in users:
        p = get_user_profile_dict(db, u)
        results.append(UserProfileResponse(**p))
    return results


@router.get(
    "/{user_id}/profile",
    response_model=UserProfileResponse,
    summary="Get developer profile card by user ID",
)
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve public developer profile card with stats."""
    user = get_user_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found.",
        )

    profile_dict = get_user_profile_dict(db, user)
    return UserProfileResponse(**profile_dict)
