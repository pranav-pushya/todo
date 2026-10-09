"""Comprehensive system check of all FastAPI REST endpoints."""
import sys
from fastapi.testclient import TestClient
from main import app

def run_tests():
    client = TestClient(app)
    errors = []

    def check(name, resp, expected_status=200):
        if resp.status_code != expected_status:
            err = f"[FAIL] {name}: expected {expected_status}, got {resp.status_code} - {resp.text}"
            print(err)
            errors.append(err)
        else:
            print(f"[PASS] {name} (status {resp.status_code})")

    print("=== Testing System Health & Root ===")
    check("GET /", client.get("/"))
    check("GET /health", client.get("/health"))

    print("\n=== Testing Authentication & Profiles Endpoints ===")
    auth_resp = client.post("/api/v1/auth/login", json={"email_or_username": "demo@example.com", "password": "demo123"})
    check("POST /api/v1/auth/login", auth_resp)
    token = auth_resp.json().get("access_token") if auth_resp.status_code == 200 else ""
    auth_headers = {"Authorization": f"Bearer {token}"} if token else {}
    check("GET /api/v1/auth/me", client.get("/api/v1/auth/me", headers=auth_headers))
    check("GET /api/v1/users", client.get("/api/v1/users"))

    print("\n=== Testing Projects Endpoints ===")

    check("GET /api/v1/projects", client.get("/api/v1/projects"))
    p_resp = client.post("/api/v1/projects", json={"title": "Test Suite Project", "color": "#3b82f6"})
    check("POST /api/v1/projects", p_resp, 201)
    proj_id = p_resp.json().get("id") if p_resp.status_code == 201 else None

    print("\n=== Testing Tasks Endpoints ===")
    check("GET /api/v1/tasks", client.get("/api/v1/tasks"))
    t_resp = client.post("/api/v1/tasks", json={
        "title": "Automated verification task",
        "priority": "P1",
        "project_id": proj_id,
        "tags": "test,ci",
    })
    check("POST /api/v1/tasks", t_resp, 201)
    task_id = t_resp.json().get("id") if t_resp.status_code == 201 else None

    if task_id:
        check(f"GET /api/v1/tasks/{task_id}", client.get(f"/api/v1/tasks/{task_id}"))
        check(f"PATCH /api/v1/tasks/{task_id}/toggle", client.patch(f"/api/v1/tasks/{task_id}/toggle"))
        check("GET /api/v1/tasks/analytics/consistency", client.get("/api/v1/tasks/analytics/consistency"))

    print("\n=== Testing Notes Endpoints ===")
    check("GET /api/v1/notes", client.get("/api/v1/notes"))
    n_resp = client.post("/api/v1/notes", json={
        "title": "System Check Note",
        "content": "# Test Note\n$$\\mathcal{L} = -\\sum y \\log(\\hat{y})$$",
        "tags": "test,latex",
    })
    check("POST /api/v1/notes", n_resp, 201)

    print("\n=== Testing ML Webhook & Experiments ===")
    check("GET /api/v1/ml/experiments", client.get("/api/v1/ml/experiments"))
    ml_resp = client.post("/api/v1/ml/webhook", json={
        "run_name": "Test Run ResNet",
        "epoch": 5,
        "total_epochs": 10,
        "loss": 0.345,
        "metrics": {"val_loss": 0.412, "accuracy": 0.89},
        "status": "training",
    })
    check("POST /api/v1/ml/webhook", ml_resp, 200)

    print("\n=== Testing Sprints Endpoints ===")
    check("GET /api/v1/sprints", client.get("/api/v1/sprints"))
    check("GET /api/v1/sprints/active", client.get("/api/v1/sprints/active"))

    print("\n=== Testing AI Agent Logs ===")
    check("GET /api/v1/agent/logs", client.get("/api/v1/agent/logs"))

    # Cleanup test items
    if task_id:
        client.delete(f"/api/v1/tasks/{task_id}")
    if proj_id:
        client.delete(f"/api/v1/projects/{proj_id}")

    print("\n==================================")
    if errors:
        print(f"[FAILED] {len(errors)} ERROR(S) DETECTED!")
        for e in errors:
            print(" -", e)
        sys.exit(1)
    else:
        print("[SUCCESS] ALL REST API ENDPOINTS VERIFIED & WORKING FLAWLESSLY!")

if __name__ == "__main__":
    run_tests()
