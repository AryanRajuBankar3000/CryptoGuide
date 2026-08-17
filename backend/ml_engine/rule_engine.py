"""
rule_engine.py
--------------
Teammate 2's module: Recommendation & Risk Scoring Engine.

Responsibility:
    Take structured parameters (from Teammate 1's NLP parser) and the
    knowledge base (built by the database team), and produce:
      1. A filtered, risk-scored list of suitable cryptographic algorithms
         for a single use case  -> evaluate_use_case()
      2. A combined summary across multiple use cases in a batch
         -> generate_batch_summary()

This file has NO dependency on FastAPI, the NLP parser, or the database
loading code. It only works with plain Python dicts and lists, so it can
be developed, tested, and handed off completely independently.
"""

from typing import List, Dict, Any, Optional

# ---------------------------------------------------------------------------
# TUNABLE CONSTANTS
# Keep these at the top so they're easy to adjust once real data comes in.
# ---------------------------------------------------------------------------

CURRENT_YEAR = 2026

# Base "safety margin" in years. If an algorithm's deprecation date is more
# than this many years past when the vehicle needs to retire, we call it Green.
DEFAULT_BUFFER_YEARS = 4

# Threat level nudges the buffer up (stricter) or down (more lenient).
# Critical threat = demand a bigger safety cushion. Low threat = relax it.
THREAT_BUFFER_MODIFIER = {
    "Low": -1,
    "Medium": 0,
    "High": 1,
    "Critical": 2,
}

RISK_GREEN = "🟢"
RISK_YELLOW = "🟡"
RISK_RED = "🔴"

# Order used for sorting / picking the "top pick" (best first)
RISK_RANK = {RISK_GREEN: 0, RISK_YELLOW: 1, RISK_RED: 2}


# ---------------------------------------------------------------------------
# STEP 1: FILTERS
# Each filter takes one algorithm dict and returns True/False.
# Keeping these separate makes them easy to test and easy to reorder.
# ---------------------------------------------------------------------------

def _passes_use_case_filter(algo: Dict[str, Any], use_case: str) -> bool:
    """Keep only algorithms that list this use case as supported."""
    return use_case in algo.get("use_cases", [])


def _passes_pqc_filter(algo: Dict[str, Any], pqc_required: bool) -> bool:
    """
    If the user requires post-quantum safety, drop anything that isn't
    quantum-safe. If PQC isn't required, keep everything (classical
    algorithms are still shown, just scored honestly).
    """
    if not pqc_required:
        return True
    return bool(algo.get("quantum_safe", False))


def _passes_hardware_filter(algo: Dict[str, Any], params: Dict[str, Any]) -> bool:
    """
    Optional filter: only applies if the caller supplied hardware limits.
    Safe to leave unused (returns True) until the database includes real
    hardware constraint data.
    """
    max_ram = params.get("available_ram_kb")
    max_flash = params.get("available_flash_kb")

    if max_ram is not None and algo.get("min_ram_kb", 0) > max_ram:
        return False
    if max_flash is not None and algo.get("min_flash_kb", 0) > max_flash:
        return False
    return True


# ---------------------------------------------------------------------------
# STEP 2: RISK SCORING
# ---------------------------------------------------------------------------

def _compute_buffer_years(threat_level: str) -> int:
    """Turn a threat level string into an actual number of buffer years."""
    modifier = THREAT_BUFFER_MODIFIER.get(threat_level, 0)
    return DEFAULT_BUFFER_YEARS + modifier


def _score_algorithm(
    algo: Dict[str, Any],
    vehicle_lifetime: int,
    threat_level: str,
    current_year: int = CURRENT_YEAR,
) -> Dict[str, Any]:
    """
    Score a single algorithm against how long the vehicle needs to stay
    secure, returning a risk color + human-readable reason.

    Example:
        _score_algorithm(
            {"algorithm": "RSA-2048", "quantum_safe": False, "deprecation_year": 2030},
            vehicle_lifetime=15,
            threat_level="High"
        )
        -> {"algorithm": "RSA-2048", "risk": "🔴", "reason": "...", "deprecation_year": 2030}
    """
    name = algo["algorithm"]
    safe_until_year = current_year + vehicle_lifetime
    buffer_years = _compute_buffer_years(threat_level)

    if algo.get("quantum_safe"):
        risk = RISK_GREEN
        reason = (
            f"{name} is quantum-safe, so it has no classical deprecation "
            f"clock ticking against this vehicle's {vehicle_lifetime}-year lifetime."
        )
        dep_year = None
    else:
        dep_year = algo.get("deprecation_year")

        if dep_year is None:
            risk = RISK_YELLOW
            reason = (
                f"{name} has no recorded deprecation date. Treat with caution "
                f"until NIST guidance is confirmed."
            )
        elif safe_until_year < (dep_year - buffer_years):
            risk = RISK_GREEN
            reason = (
                f"{name} remains valid well past {safe_until_year} "
                f"(vehicle retirement), with margin to spare before its "
                f"{dep_year} deprecation date."
            )
        elif safe_until_year <= dep_year:
            risk = RISK_YELLOW
            reason = (
                f"{name} is cutting it close: vehicle retires in "
                f"{safe_until_year}, algorithm is deprecated in {dep_year}. "
                f"Plan a migration path."
            )
        else:
            risk = RISK_RED
            reason = (
                f"{name} will already be deprecated ({dep_year}) while this "
                f"vehicle is still on the road (until {safe_until_year}). "
                f"Do not deploy without a migration plan."
            )

    return {
        "algorithm": name,
        "risk": risk,
        "reason": reason,
        "deprecation_year": dep_year,
    }


# ---------------------------------------------------------------------------
# STEP 3: PUBLIC FUNCTIONS
# These are the two functions main.py will actually import and call.
# ---------------------------------------------------------------------------

def evaluate_use_case(params: Dict[str, Any], db: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Filter + score every algorithm in db against a single use case's
    parameters, and return a ranked recommendation block.

    Args:
        params: dict from Teammate 1's parser, expected keys:
            - use_case (str)           e.g. "OTA_updates"
            - vehicle_lifetime (int)   e.g. 15
            - threat_level (str)       one of "Low"/"Medium"/"High"/"Critical"
            - pqc_required (bool)
        db: list of algorithm dicts (loaded from knowledge_base.json)

    Returns:
        {
            "use_case": "OTA_updates",
            "recommended": [ {algorithm, risk, reason, deprecation_year}, ... ],
            "top_pick": "CRYSTALS-Kyber"
        }

    Example:
        >>> evaluate_use_case(
        ...     {"use_case": "OTA_updates", "vehicle_lifetime": 15,
        ...      "threat_level": "High", "pqc_required": True},
        ...     mock_db
        ... )
    """
    use_case = params.get("use_case")
    vehicle_lifetime = params.get("vehicle_lifetime", 10)
    threat_level = params.get("threat_level", "Medium")
    pqc_required = params.get("pqc_required", False)

    candidates = [
        algo for algo in db
        if _passes_use_case_filter(algo, use_case)
        and _passes_pqc_filter(algo, pqc_required)
        and _passes_hardware_filter(algo, params)
    ]

    scored = [
        _score_algorithm(algo, vehicle_lifetime, threat_level)
        for algo in candidates
    ]

    # Best risk first (Green, then Yellow, then Red)
    scored.sort(key=lambda entry: RISK_RANK[entry["risk"]])

    top_pick = scored[0]["algorithm"] if scored else None

    return {
        "use_case": use_case,
        "recommended": scored,
        "top_pick": top_pick,
    }


def generate_batch_summary(recommendations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Roll up multiple evaluate_use_case() results into one combined summary:
    overall worst risk, counts per color, and a prioritized action list.

    Args:
        recommendations: list of outputs from evaluate_use_case()

    Returns:
        {
            "highest_risk": "🔴",
            "risk_counts": {"green": 3, "yellow": 1, "red": 2},
            "priority_actions": [ "URGENT: ...", "MONITOR: ...", ... ]
        }
    """
    all_entries = []
    for block in recommendations:
        use_case = block["use_case"]
        for entry in block["recommended"]:
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

    # Red first, then Yellow. Green needs no action, so it's excluded.
    actionable = [e for e in all_entries if e["risk"] in (RISK_RED, RISK_YELLOW)]
    actionable.sort(key=lambda e: RISK_RANK[e["risk"]])

    priority_actions = []
    for entry in actionable:
        prefix = "URGENT" if entry["risk"] == RISK_RED else "MONITOR"
        dep = f" (deprecates {entry['deprecation_year']})" if entry["deprecation_year"] else ""
        priority_actions.append(
            f"{prefix}: {entry['use_case']} using {entry['algorithm']}{dep} — {entry['reason']}"
        )

    return {
        "highest_risk": highest_risk,
        "risk_counts": counts,
        "priority_actions": priority_actions,
    }