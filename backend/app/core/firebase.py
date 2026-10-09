"""Firebase Authentication token verification using Google's public JWKS."""

from typing import Any, Dict, Optional
import jwt
from fastapi import HTTPException, status

FIREBASE_PROJECT_ID = "kortex-246"
GOOGLE_JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"

jwk_client = jwt.PyJWKClient(GOOGLE_JWKS_URL, cache_keys=True, max_cached_keys=16)


def verify_firebase_id_token(id_token: str, project_id: str = FIREBASE_PROJECT_ID) -> Dict[str, Any]:
    """Verify Google Firebase RS256 ID Token and return decoded payload.
    
    Validates token signature against Google's public certificates,
    verifies issuer and audience matching the Firebase project ID.
    """
    try:
        signing_key = jwk_client.get_signing_key_from_jwt(id_token)
        payload = jwt.decode(
            id_token,
            signing_key.key,
            algorithms=["RS256"],
            audience=project_id,
            issuer=f"https://securetoken.google.com/{project_id}",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase authentication token has expired. Please sign in again.",
        )
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase authentication token: {str(e)}",
        )
