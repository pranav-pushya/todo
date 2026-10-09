"""Automated verification script for AI agent capabilities and fuzzy task resolution."""
import sys
from app.core.database import SessionLocal
from app.models.task import Task
from app.services.agent_tools import find_task_smartly, tool_complete_task, tool_delete_task
from app.services.groq_client import build_system_prompt, get_database_context

def main():
    db = SessionLocal()
    try:
        print("=== 1. Testing Database Context Injection ===")
        ctx = get_database_context(db)
        print("Live DB Context length:", len(ctx))
        assert "CURRENT WORKSPACE SNAPSHOT" in ctx
        print("DB context preview:\n", "\n".join(ctx.split("\n")[:10]))

        print("\n=== 2. Testing find_task_smartly Resolver ===")
        # Get any active task to test
        sample = db.query(Task).first()
        if sample:
            print(f"Sample task ID={sample.id}, title='{sample.title}'")
            # Test direct ID
            t1 = find_task_smartly(db, str(sample.id))
            assert t1 is not None and t1.id == sample.id, f"Failed direct ID: {sample.id}"
            print("Direct ID match OK")

            # Test 'task #ID'
            t2 = find_task_smartly(db, f"task #{sample.id}")
            assert t2 is not None and t2.id == sample.id, f"Failed 'task #ID': {sample.id}"
            print("Pattern 'task #ID' match OK")

            # Test 'id ID'
            t3 = find_task_smartly(db, f"id {sample.id}")
            assert t3 is not None and t3.id == sample.id, f"Failed 'id ID': {sample.id}"
            print("Pattern 'id ID' match OK")

            # Test title fragment
            first_word = sample.title.split()[0]
            if len(first_word) > 2:
                t4 = find_task_smartly(db, first_word)
                assert t4 is not None, f"Failed title fragment: '{first_word}'"
                print(f"Fuzzy title match on '{first_word}' OK (matched id={t4.id})")
        else:
            print("No tasks in DB to test find_task_smartly, skipping.")

        print("\n=== 3. Testing System Prompt Generation ===")
        prompt = build_system_prompt(db=db)
        assert "DISTINGUISH BETWEEN QUESTIONS VS ACTIONS" in prompt
        assert "UNDERSTAND HINDI / HINGLISH SEAMLESSLY" in prompt
        assert "kholo" in prompt
        assert "banao" in prompt
        assert "CURRENT WORKSPACE SNAPSHOT" in prompt
        print("System prompt contains live snapshot and Hinglish instructions! OK")

        print("\nALL AUTOMATED TESTS PASSED SUCCESSFULLY!")
    finally:
        db.close()

if __name__ == "__main__":
    main()
