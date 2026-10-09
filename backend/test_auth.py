"""Automated verification test suite for User Profiles & Authentication."""

import sys
import time
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_auth_and_profiles():
    print("============================================================")
    print("RUNNING AUTOMATED VERIFICATION: USER PROFILES & AUTHENTICATION")
    print("============================================================")

    # 1. Test Seeded Demo User Login
    print("\n--- 1. Testing Demo User Login ---")
    resp = client.post(
        "/api/v1/auth/login",
        json={"email_or_username": "demo@example.com", "password": "demo123"},
    )
    assert resp.status_code == 200, f"Demo login failed: {resp.text}"
    demo_data = resp.json()
    assert "access_token" in demo_data, "No access_token in login response"
    assert demo_data["user"]["email"] == "demo@example.com"
    demo_token = demo_data["access_token"]
    print(f"[PASS] Demo login successful. Token received: {demo_token[:20]}...")

    # Also test login with username
    resp_user = client.post(
        "/api/v1/auth/login",
        json={"email_or_username": "demo_user", "password": "demo123"},
    )
    assert resp_user.status_code == 200
    print("[PASS] Demo login with username succeeded.")

    # 2. Test Invalid Login
    print("\n--- 2. Testing Invalid Credentials Rejection ---")
    resp_invalid = client.post(
        "/api/v1/auth/login",
        json={"email_or_username": "demo@example.com", "password": "wrongpassword"},
    )
    assert resp_invalid.status_code == 401
    print("[PASS] Invalid password correctly rejected with HTTP 401.")

    # 3. Test New User Registration
    print("\n--- 3. Testing New User Registration ---")
    unique_suffix = f"test_{int(time.time() * 1000)}"
    new_user_payload = {
        "email": f"tester_{unique_suffix}@example.com",
        "username": f"user_{unique_suffix}",
        "password": "SecurePassword123!",
        "full_name": "Test Engineer",
        "bio": "Testing user profile and auth flows.",
        "role": "QA & Systems Engineer",
        "github_username": "tester-qa",
        "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    }
    resp_reg = client.post("/api/v1/auth/register", json=new_user_payload)
    assert resp_reg.status_code == 201, f"Registration failed: {resp_reg.text}"


    user_token = resp_reg.json()["access_token"]

    user_info = resp_reg.json()["user"]
    user_id = user_info["id"]
    print(f"[PASS] User registration/login succeeded. User ID: {user_id}, Role: {user_info['role']}")

    # 4. Test Duplicate Email/Username Rejection
    print("\n--- 4. Testing Duplicate Registration Rejection ---")
    resp_dup = client.post("/api/v1/auth/register", json=new_user_payload)
    assert resp_dup.status_code == 400
    print(f"[PASS] Duplicate registration rejected: {resp_dup.json()['detail']}")

    # 5. Test Authenticated Profile Route (/api/v1/auth/me)
    print("\n--- 5. Testing /api/v1/auth/me Profile Route ---")
    headers = {"Authorization": f"Bearer {user_token}"}
    resp_me = client.get("/api/v1/auth/me", headers=headers)
    assert resp_me.status_code == 200
    me_data = resp_me.json()
    assert me_data["id"] == user_id
    assert me_data["username"] == new_user_payload["username"]
    assert "tasks_count" in me_data

    assert "projects_count" in me_data
    print(f"[PASS] /api/v1/auth/me verified for {me_data['username']} (Tasks: {me_data['tasks_count']}).")

    # 6. Test Unauthenticated / Invalid Token Rejection
    print("\n--- 6. Testing Unauthorized Access ---")
    resp_unauth = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer bad_invalid_token_999"})
    assert resp_unauth.status_code == 401
    print("[PASS] Unauthorized access correctly returned HTTP 401.")

    # 7. Test Profile Update
    print("\n--- 7. Testing Profile Update (PATCH /api/v1/auth/me) ---")
    update_payload = {
        "full_name": "Updated Engineer Name",
        "bio": "Specializing in autonomous agents and distributed systems.",
        "role": "Principal AI Architect",
        "theme_preference": "dracula",
    }
    resp_update = client.patch("/api/v1/auth/me", headers=headers, json=update_payload)
    assert resp_update.status_code == 200
    updated_data = resp_update.json()
    assert updated_data["full_name"] == "Updated Engineer Name"
    assert updated_data["role"] == "Principal AI Architect"
    assert updated_data["theme_preference"] == "dracula"
    print(f"[PASS] Profile updated successfully. New role: {updated_data['role']}.")

    # 8. Test Password Change
    print("\n--- 8. Testing Password Change ---")
    # First test incorrect current password
    resp_pwd_fail = client.post(
        "/api/v1/auth/change-password",
        headers=headers,
        json={"current_password": "WrongCurrentPassword", "new_password": "NewSecurePassword456!"},
    )
    assert resp_pwd_fail.status_code == 400
    print("[PASS] Wrong current password correctly rejected.")

    # Now change with correct current password
    resp_pwd_ok = client.post(
        "/api/v1/auth/change-password",
        headers=headers,
        json={"current_password": "SecurePassword123!", "new_password": "NewSecurePassword456!"},
    )
    assert resp_pwd_ok.status_code == 200
    print("[PASS] Password successfully changed.")

    # Verify login with new password
    resp_relogin = client.post(
        "/api/v1/auth/login",
        json={"email_or_username": new_user_payload["email"], "password": "NewSecurePassword456!"},
    )
    assert resp_relogin.status_code == 200
    print("[PASS] Login with new password succeeded.")

    # 9. Test Public User Profile Card (/api/v1/users/{id}/profile)
    print("\n--- 9. Testing Public Profile Card ---")
    resp_card = client.get(f"/api/v1/users/{user_id}/profile")
    assert resp_card.status_code == 200
    card_data = resp_card.json()
    assert card_data["id"] == user_id
    assert card_data["full_name"] == "Updated Engineer Name"
    print(f"[PASS] Public profile card retrieved for User {user_id}.")

    # 10. Test List Users (/api/v1/users)
    print("\n--- 10. Testing List Developer Profiles ---")
    resp_list = client.get("/api/v1/users")
    assert resp_list.status_code == 200
    users_list = resp_list.json()
    assert len(users_list) >= 2  # demo_user + test_user
    print(f"[PASS] List users returned {len(users_list)} developer profiles.")

    print("\n============================================================")
    print("ALL 10 USER PROFILES & AUTHENTICATION TESTS PASSED (100%)!")
    print("============================================================")


if __name__ == "__main__":
    test_auth_and_profiles()
