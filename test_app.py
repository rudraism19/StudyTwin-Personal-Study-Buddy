import json
import sys

# Ensure UTF-8 output if possible
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from app import app

def test_endpoints():
    client = app.test_client()

    print("Testing GET / ...")
    res = client.get("/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert b"StudyTwin" in res.data
    assert b"Built for:" in res.data
    print("[PASS] GET / passed")

    print("Testing GET /api/status ...")
    res = client.get("/api/status")
    assert res.status_code == 200
    data = res.get_json()
    assert "ollama_online" in data
    print(f"[PASS] GET /api/status passed (Ollama online: {data['ollama_online']})")

    print("Testing POST /api/explain (Simple English) ...")
    res = client.post("/api/explain", json={"topic": "Inheritance in Java", "style": "simple_english"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "inheritance" in data["explanation"].lower()
    print("[PASS] POST /api/explain (Simple English) passed")

    print("Testing POST /api/explain (Hinglish) ...")
    res = client.post("/api/explain", json={"topic": "Inheritance in Java", "style": "hinglish"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["explanation"]) > 50
    print("[PASS] POST /api/explain (Hinglish) passed")

    print("Testing POST /api/quiz ...")
    res = client.post("/api/quiz", json={"topic": "Inheritance in Java"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["questions"]) == 5
    for i, q in enumerate(data["questions"]):
        assert "question" in q
        assert "options" in q
        assert len(q["options"]) == 4
        assert "correct_index" in q
        assert 0 <= q["correct_index"] <= 3
        assert "explanation" in q
    print("[PASS] POST /api/quiz passed (5 valid MCQs generated with explanations)")

    print("Testing POST /api/tips ...")
    res = client.post("/api/tips", json={"topic": "Operating Systems"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "tips" in data
    print("[PASS] POST /api/tips passed")

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
