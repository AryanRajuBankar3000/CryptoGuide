"""
test_rule_engine.py
--------------------
Simple manual test script (not pytest — just plain, readable prints) so
you can run this file directly and SEE that your logic works, before
handing your file off to the integrator.

How to run (from the project root folder, with venv activated):
    python tests/test_rule_engine.py
"""

import json
import os
import sys

# Allow this script to import from the ml_engine folder one level up
sys.path.append(os.path.join(os.path.dirname(_file_), ".."))

from ml_engine.rule_engine import evaluate_use_case, generate_batch_summary

# ---------------------------------------------------------------------------
# Load the mock knowledge base
# ---------------------------------------------------------------------------
DB_PATH = os.path.join(os.path.dirname(_file_), "..", "data", "knowledge_base_mock.json")
with open(DB_PATH, "r") as f:
    MOCK_DB = json.load(f)

print("=" * 70)
print("TEST 1: OTA updates, 15-year lifetime, High threat, PQC required")
print("=" * 70)

query_1 = {
    "use_case": "OTA_updates",
    "vehicle_lifetime": 15,
    "threat_level": "High",
    "pqc_required": True,
}
result_1 = evaluate_use_case(query_1, MOCK_DB)
print(json.dumps(result_1, indent=2, ensure_ascii=False))

print()
print("=" * 70)
print("TEST 2: Firmware signing, 15-year lifetime, Critical threat, no PQC requirement")
print("=" * 70)

query_2 = {
    "use_case": "firmware_signing",
    "vehicle_lifetime": 15,
    "threat_level": "Critical",
    "pqc_required": False,
}
result_2 = evaluate_use_case(query_2, MOCK_DB)
print(json.dumps(result_2, indent=2, ensure_ascii=False))

print()
print("=" * 70)
print("TEST 3: Batch summary combining Test 1 + Test 2")
print("=" * 70)

summary = generate_batch_summary([result_1, result_2])
print(json.dumps(summary, indent=2, ensure_ascii=False))

print()
print("If you see risk colors (🟢/🟡/🔴) and reasons above with no Python")
print("errors, your engine is working correctly.")