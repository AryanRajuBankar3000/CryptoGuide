"""
test_rule_engine.py
--------------------
Manual verification script to validate evaluate_use_case and generate_batch_summary.
"""

import json
import os
import sys

# Add root folder to sys.path to enable local imports
sys.path.append(os.path.join(os.path.dirname(_file_), ".."))

try:
    from ml_engine.rule_engine import evaluate_use_case, generate_batch_summary
except ImportError:
    from rule_engine import evaluate_use_case, generate_batch_summary

# Locate knowledge base JSON across possible local paths
possible_paths = [
    os.path.join(os.path.dirname(_file_), "..", "data", "knowledge_base.json"),
    os.path.join(os.path.dirname(_file_), "..", "data", "knowledge-base.json"),
    os.path.join(os.path.dirname(_file_), "knowledge_base.json"),
    os.path.join(os.path.dirname(_file_), "knowledge-base.json"),
]

DB = None
for path in possible_paths:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            DB = json.load(f)
        break

if DB is None:
    raise FileNotFoundError("Could not locate knowledge_base.json in project paths.")

print("=" * 70)
print("TEST 1: OTA updates (Signatures), 15-year lifetime, High threat, PQC required")
print("=" * 70)

query_1 = {
    "use_case": "OTA_updates",
    "vehicle_lifetime": 15,
    "threat_level": "High",
    "pqc_required": True,
}
result_1 = evaluate_use_case(query_1, DB)
print(json.dumps(result_1, indent=2, ensure_ascii=False))

print()
print("=" * 70)
print("TEST 2: Firmware signing (Signatures), 15-year lifetime, Critical threat, no PQC requirement")
print("=" * 70)

query_2 = {
    "use_case": "firmware_signing",
    "vehicle_lifetime": 15,
    "threat_level": "Critical",
    "pqc_required": False,
}
result_2 = evaluate_use_case(query_2, DB)
print(json.dumps(result_2, indent=2, ensure_ascii=False))

print()
print("=" * 70)
print("TEST 3: Batch summary combining Test 1 + Test 2")
print("=" * 70)

summary = generate_batch_summary([result_1, result_2])
print(json.dumps(summary, indent=2, ensure_ascii=False))

print()
print("Execution completed successfully.")