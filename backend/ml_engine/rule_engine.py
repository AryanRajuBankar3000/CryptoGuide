"""
rule_engine.py
--------------
Recommendation & Risk Scoring Engine adapted for the dictionary-based
knowledge base schema.
"""

import re
from typing import List, Dict, Any, Optional, Union

CURRENT_YEAR = 2026
DEFAULT_BUFFER_YEARS = 4

THREAT_BUFFER_MODIFIER = {
    "Low": -1,
    "Medium": 0,
    "High": 1,
    "Critical": 2,
}

RISK_GREEN = "🟢"
RISK_YELLOW = "🟡"
RISK_RED = "🔴"

RISK_RANK = {RISK_GREEN: 0, RISK_YELLOW: 1, RISK_RED: 2}


# ---------------------------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------------------------

def _extract_deprecation_year(security_lifespan: str) -> Optional[int]:
    """Extract numeric year from security lifespan string descriptions."""
    if not security_lifespan:
        return None
    matches = re.findall(r'\b(20\d\d)\b', security_lifespan)
    if matches:
        return int(matches[0])
    return None


def _is_quantum_safe(entry: Dict[str, Any]) -> bool:
    """Assess whether the recommended algorithm or approach is post-quantum secure."""
    text = (
        f"{entry.get('pqcMigrationPath', '')} "
        f"{entry.get('rationale', '')} "
        f"{entry.get('recommendedAlgorithm', '')}"
    ).lower()

    if "no migration needed" in text or "not quantum-vulnerable" in text or "not applicable" in text:
        return True
    if "crystals" in entry.get("recommendedAlgorithm", "").lower():
        return True
    return False


def _normalize_key(key: str) -> str:
    """Normalize input strings for fuzzy key matching."""
    return re.sub(r'[^a-zA-Z0-9]', '', str(key)).lower()


def _resolve_use_case_entry(
    use_case: str,
    db: Union[Dict[str, Any], List[Dict[str, Any]]]
) -> Optional[Dict[str, Any]]:
    """Locate the target use case within the dictionary or list-based knowledge base."""
    if isinstance(db, list):
        for item in db:
            if item.get("useCase", "").lower() == use_case.lower() or item.get("use_case", "").lower() == use_case.lower():
                return item
        return None

    norm_target = _normalize_key(use_case)

    for k, v in db.items():
        if _normalize_key(k) == norm_target or _normalize_key(v.get("useCase", "")) == norm_target:
            return v

    synonyms = {
        "otaupdates": "Signatures",
        "ota": "Signatures",
        "firmwaresigning": "Signatures",
        "firmware": "Signatures",
        "v2x": "Communication",
        "v2xcommunication": "Communication",
        "can": "MAC_SecOC",
        "secoc": "MAC_SecOC",
        "storage": "DataEncryption",
        "encryption": "DataEncryption",
        "boot": "SecureBoot",
        "lifecycle": "KeyManagement",
        "provisioning": "HSMProvisioning",
    }

    mapped_key = synonyms.get(norm_target)
    if mapped_key and mapped_key in db:
        return db[mapped_key]

    return None


# ---------------------------------------------------------------------------
# RISK SCORING
# ---------------------------------------------------------------------------

def _compute_buffer_years(threat_level: str) -> int:
    modifier = THREAT_BUFFER_MODIFIER.get(threat_level, 0)
    return DEFAULT_BUFFER_YEARS + modifier


def _score_entry(
    entry: Dict[str, Any],
    vehicle_lifetime: int,
    threat_level: str,
    pqc_required: bool,
    current_year: int = CURRENT_YEAR,
) -> Dict[str, Any]:
    algo_name = entry.get("recommendedAlgorithm", "Unknown")
    lifespan_str = entry.get("securityLifespan", "")
    dep_year = _extract_deprecation_year(lifespan_str)
    safe_until_year = current_year + vehicle_lifetime
    buffer_years = _compute_buffer_years(threat_level)
    quantum_safe = _is_quantum_safe(entry)

    if pqc_required and not quantum_safe:
        risk = RISK_RED
        reason = (
            f"PQC required, but {algo_name} is quantum-vulnerable. "
            f"Migration: {entry.get('pqcMigrationPath', 'Migrate to PQC algorithm.')}"
        )
    elif quantum_safe:
        risk = RISK_GREEN
        reason = f"{algo_name} is quantum-resistant or symmetric. Lifespan: {lifespan_str}."
    elif dep_year is None:
        risk = RISK_YELLOW
        reason = f"{algo_name} has no explicit deprecation year. Lifespan note: {lifespan_str}."
    elif safe_until_year < (dep_year - buffer_years):
        risk = RISK_GREEN
        reason = (
            f"{algo_name} remains secure through vehicle retirement ({safe_until_year}), "
            f"with buffer before estimated horizon ({dep_year})."
        )
    elif safe_until_year <= dep_year:
        risk = RISK_YELLOW
        reason = (
            f"{algo_name} lifetime window cuts close: vehicle retires in {safe_until_year}, "
            f"estimated horizon is ~{dep_year}. Migration plan recommended."
        )
    else:
        risk = RISK_RED
        reason = (
            f"{algo_name} security horizon ({dep_year}) expires while vehicle is still active "
            f"(until {safe_until_year}). Action required: {entry.get('pqcMigrationPath', 'Plan migration.')}"
        )

    return {
        "algorithm": algo_name,
        "mode": entry.get("mode"),
        "key_length": entry.get("keyLength"),
        "risk": risk,
        "reason": reason,
        "deprecation_year": dep_year,
        "standards": entry.get("standardsRefs", []),
        "migration_path": entry.get("pqcMigrationPath", ""),
        "risk_flags": entry.get("riskFlags", []),
    }


# ---------------------------------------------------------------------------
# PUBLIC API
# ---------------------------------------------------------------------------

def evaluate_use_case(
    params: Dict[str, Any],
    db: Union[Dict[str, Any], List[Dict[str, Any]]]
) -> Dict[str, Any]:
    """
    Filter and score algorithms for a single use case against the knowledge base.
    """
    use_case = params.get("use_case", "")
    vehicle_lifetime = params.get("vehicle_lifetime", 10)
    threat_level = params.get("threat_level", "Medium")
    pqc_required = params.get("pqc_required", False)

    entry = _resolve_use_case_entry(use_case, db)

    if not entry:
        return {
            "use_case": use_case,
            "recommended": [],
            "top_pick": None,
            "error": f"Use case '{use_case}' not found in database."
        }

    scored_item = _score_entry(entry, vehicle_lifetime, threat_level, pqc_required)

    return {
        "use_case": entry.get("useCase", use_case),
        "recommended": [scored_item],
        "top_pick": scored_item["algorithm"],
    }


def generate_batch_summary(recommendations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Roll up multiple evaluate_use_case() results into one combined summary.
    """
    all_entries = []
    for block in recommendations:
        use_case = block.get("use_case", "Unknown")
        for entry in block.get("recommended", []):
            all_entries.append({**entry, "use_case": use_case})

    counts = {"green": 0, "yellow": 0, "red": 0}
    for entry in all_entries:
        if entry["risk"] == RISK_GREEN:
            counts["green"] += 1
        elif entry["risk"] == RISK_YELLOW:
            counts["yellow"] += 1
        elif entry["risk"] == RISK_RED:
            counts["red"] += 1

    if counts["red"] > 0:
        highest_risk = RISK_RED
    elif counts["yellow"] > 0:
        highest_risk = RISK_YELLOW
    else:
        highest_risk = RISK_GREEN

    actionable = [e for e in all_entries if e["risk"] in (RISK_RED, RISK_YELLOW)]
    actionable.sort(key=lambda e: RISK_RANK[e["risk"]])

    priority_actions = []
    for entry in actionable:
        prefix = "URGENT" if entry["risk"] == RISK_RED else "MONITOR"
        dep = f" (~{entry['deprecation_year']})" if entry.get("deprecation_year") else ""
        priority_actions.append(
            f"{prefix}: [{entry['use_case']}] {entry['algorithm']}{dep} — {entry['reason']}"
        )

    return {
        "highest_risk": highest_risk,
        "risk_counts": counts,
        "priority_actions": priority_actions,
    }