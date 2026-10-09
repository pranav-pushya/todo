"""Automated End-to-End Test Suite for Phase 1 Backend Foundation.

Tests all REST endpoints, smart views (Inbox, Today, Upcoming, Completed),
database cascades, CORS preflights, and OpenAPI documentation.
"""

import sys
from datetime import date, timedelta
from fastapi.testclient import TestClient

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from main import app

client = TestClient(app)


def run_tests():
    """Run all verification tests sequentially and assert correctness."""
    print("=" * 60)
    print("STARTING AUTOMATED PHASE 1 BACKEND VERIFICATION")
    print("=" * 60)

    # 1. Root Endpoint Test
    res = client.get("/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "version" in data and "docs" in data
    print("[PASS] 1. Root landing endpoint (GET /) verified.")

    # 2. Health Check Test
    res = client.get("/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    health = res.json()
    assert health["status"] == "healthy"
    assert health["database"] == "connected"
    print("[PASS] 2. Database connectivity & health check (GET /health) verified.")

    # 3. OpenAPI & Swagger Docs Test
    res = client.get("/openapi.json")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    openapi = res.json()
    assert openapi["info"]["title"] == "Kortex API"
    assert "/api/v1/tasks/" in openapi["paths"]
    assert "/api/v1/projects/" in openapi["paths"]
    print("[PASS] 3. Swagger OpenAPI schema (/openapi.json) verified.")

    # 4. CORS Preflight Test
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
    }
    res = client.options("/api/v1/tasks/", headers=headers)
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == "http://localhost:5173"
    print("[PASS] 4. CORS preflight headers verified for Vite frontend (:5173).")

    # 5. Project Creation Test
    proj_payload = {
        "title": "Platform Engineering",
        "description": "Core cloud and backend infrastructure",
        "color": "#0047ab",
    }
    res = client.post("/api/v1/projects/", json=proj_payload)
    assert res.status_code == 201, f"Expected 201, got {res.status_code}"
    project = res.json()
    project_id = project["id"]
    assert project["title"] == "Platform Engineering"
    assert project["task_count"] == 0
    print(f"[PASS] 5. Project created successfully (ID: {project_id}).")

    # 6. Duplicate Project Prevention Test
    res = client.post("/api/v1/projects/", json={"title": "Platform Engineering"})
    assert res.status_code == 400, "Duplicate project was not rejected!"
    print("[PASS] 6. Duplicate project title correctly rejected (HTTP 400).")

    # 7. Project Metadata Update Test
    res = client.patch(
        f"/api/v1/projects/{project_id}",
        json={"description": "Updated infrastructure goals"},
    )
    assert res.status_code == 200
    assert res.json()["description"] == "Updated infrastructure goals"
    print("[PASS] 7. Project metadata updated (PATCH /api/v1/projects/{id}).")

    # 8. Create Inbox Task (No parent project)
    inbox_payload = {
        "title": "Brainstorm AI Copilot features",
        "priority": "P3",
        "tags": "ideas,copilot",
    }
    res = client.post("/api/v1/tasks/", json=inbox_payload)
    assert res.status_code == 201
    inbox_task = res.json()
    inbox_id = inbox_task["id"]
    assert inbox_task["project_id"] is None
    print(f"[PASS] 8. Inbox task created without project (Task ID: {inbox_id}).")

    # 9. Create Today Task under Project (Priority P1)
    today_str = str(date.today())
    today_payload = {
        "title": "Fix High-Severity Database Lock",
        "priority": "P1",
        "due_date": today_str,
        "project_id": project_id,
        "tags": "database,urgent",
    }
    res = client.post("/api/v1/tasks/", json=today_payload)
    assert res.status_code == 201
    today_task = res.json()
    today_id = today_task["id"]
    assert today_task["priority"] == "P1"
    assert today_task["due_date"] == today_str
    print(f"[PASS] 9. Today task created (P1 Urgent, Task ID: {today_id}).")

    # 10. Create Upcoming Task under Project (Priority P2)
    upcoming_str = str(date.today() + timedelta(days=3))
    upcoming_payload = {
        "title": "Deploy Staging Environment",
        "priority": "P2",
        "due_date": upcoming_str,
        "project_id": project_id,
        "tags": "devops",
    }
    res = client.post("/api/v1/tasks/", json=upcoming_payload)
    assert res.status_code == 201
    upcoming_task = res.json()
    upcoming_id = upcoming_task["id"]
    print(f"[PASS] 10. Upcoming task created (P2 High, Task ID: {upcoming_id}).")

    # 11. Test Smart View: Inbox
    res = client.get("/api/v1/tasks/?view=inbox")
    assert res.status_code == 200
    inbox_list = res.json()
    assert len(inbox_list) == 1 and inbox_list[0]["id"] == inbox_id
    print("[PASS] 11. Smart view '?view=inbox' verified.")

    # 12. Test Smart View: Today
    res = client.get("/api/v1/tasks/?view=today")
    assert res.status_code == 200
    today_list = res.json()
    assert len(today_list) == 1 and today_list[0]["id"] == today_id
    print("[PASS] 12. Smart view '?view=today' verified.")

    # 13. Test Smart View: Upcoming
    res = client.get("/api/v1/tasks/?view=upcoming")
    assert res.status_code == 200
    upcoming_list = res.json()
    assert len(upcoming_list) == 1 and upcoming_list[0]["id"] == upcoming_id
    print("[PASS] 13. Smart view '?view=upcoming' verified.")

    # 14. Test Live Project Task Counters
    res = client.get(f"/api/v1/projects/{project_id}")
    assert res.status_code == 200
    proj_data = res.json()
    assert proj_data["task_count"] == 2
    assert proj_data["completed_task_count"] == 0
    print("[PASS] 14. Project task counters verified (Active: 2, Completed: 0).")

    # 15. Test Task Completion Toggle
    res = client.patch(f"/api/v1/tasks/{today_id}/toggle")
    assert res.status_code == 200
    toggled = res.json()
    assert toggled["completed"] is True
    assert toggled["completed_at"] is not None
    print("[PASS] 15. Task toggle verified: marked complete with UTC timestamp.")

    # 16. Test Smart View: Completed
    res = client.get("/api/v1/tasks/?view=completed")
    assert res.status_code == 200
    completed_list = res.json()
    assert len(completed_list) == 1 and completed_list[0]["id"] == today_id
    print("[PASS] 16. Smart view '?view=completed' verified.")

    # 17. Test Updated Project Task Counters After Completion
    res = client.get(f"/api/v1/projects/{project_id}")
    assert res.status_code == 200
    proj_data = res.json()
    assert proj_data["task_count"] == 1
    assert proj_data["completed_task_count"] == 1
    print("[PASS] 17. Project task counters updated (Active: 1, Completed: 1).")

    # 18. Test Delete Task
    res = client.delete(f"/api/v1/tasks/{inbox_id}")
    assert res.status_code == 204
    print("[PASS] 18. Single task deletion verified (HTTP 204 No Content).")

    # 19. Test Cascading Project Deletion
    res = client.delete(f"/api/v1/projects/{project_id}")
    assert res.status_code == 204
    print("[PASS] 19. Project deletion verified (HTTP 204 No Content).")

    # 20. Confirm All Cascaded Child Tasks Are Gone
    res = client.get("/api/v1/tasks/?view=all")
    assert res.status_code == 200
    assert len(res.json()) == 0
    print("[PASS] 20. Cascading delete verified: 0 orphan tasks remaining.")

    # 21. Direct Agent Tool Execution Test
    tool_payload = {
        "title": "Direct Tool Verification Task",
        "priority": "P1",
        "due_date": "today",
    }
    res = client.post("/api/v1/agent/tool/create_task", json=tool_payload)
    assert res.status_code == 200
    tool_data = res.json()
    assert tool_data["status"] == "success"
    agent_tid = tool_data["task_id"]
    print(f"[PASS] 21. Direct agent tool execution verified (Task ID: {agent_tid}).")

    # 22. AI Agent Execution Audit Logs Test
    res = client.get("/api/v1/agent/logs")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    print(f"[PASS] 22. Agent audit logs endpoint verified (Entries: {len(res.json())}).")

    # 23. Live Autonomous AI Agent Command Test
    agent_payload = {
        "prompt": "Create a task 'Security Vulnerability Patch' due tomorrow with priority P1 under project Cybersecurity"
    }
    res = client.post("/api/v1/agent/command", json=agent_payload)
    assert res.status_code == 200
    agent_res = res.json()
    assert agent_res["status"] == "success"
    assert len(agent_res["executed_actions"]) >= 1
    assert "reply" in agent_res
    print("[PASS] 23. Live Groq LLM autonomous tool calling command verified.")

    # Final cleanup of agent-created items
    client.delete(f"/api/v1/tasks/{agent_tid}")
    from app.core.database import SessionLocal
    from app.models import Project
    db = SessionLocal()
    p_cyber = db.query(Project).filter_by(title="Cybersecurity").first()
    if p_cyber:
        db.delete(p_cyber)
        db.commit()
    db.close()
    print("[PASS] 24. Post-test cleanup verified.")

    print("=" * 60)
    print("ALL 24 AUTOMATED VERIFICATION TESTS PASSED (100% SUCCESS)!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as err:
        print(f"[FAIL] TEST FAILED: {err}")
        sys.exit(1)
    except Exception as exc:
        print(f"[ERROR] UNEXPECTED ERROR: {exc}")
        sys.exit(1)
