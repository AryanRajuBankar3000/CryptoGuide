"""
CryptoGuide - NLP / Natural Language Preprocessor
Owner: Teammate 1

Purpose:
    Convert a free-form engineer query (e.g. "OTA updates for a truck lasting
    15 years, high threat, must be quantum-safe") into a structured dict that
    the rule engine (Teammate 2) can consume.

Design choice:
    This is a deterministic keyword/regex classifier, NOT a statistical ML
    model and NOT an LLM call. Reasons:
      - Zero setup risk (stdlib only, no downloads, no API keys)
      - Fully explainable: every extracted field can point to the exact
        phrase that triggered it -> good for judge Q&A
      - Deterministic -> easy to unit test in isolation before integration

Contract with main.py / rule_engine.py:
    parse_natural_query(text) -> dict, ALWAYS containing at minimum:
        use_case          : str
        vehicle_lifetime   : int
        threat_level       : str   ("Low" | "Medium" | "High" | "Critical")
        pqc_required       : bool
    Plus bonus fields (safe to ignore downstream, useful for UX/transparency):
        hardware_constraint : str  ("Constrained" | "Accelerated" | "Unspecified")
        regulatory_scope    : list[str]
        detected_use_cases  : list[str]   # for multi-use-case queries
        extraction_notes    : list[str]   # which fields were defaulted (for UI trust)
"""

import re

# ---------------------------------------------------------------------------
# 1. USE CASE KEYWORD MAP
#    Maps automotive scenario -> trigger phrases. Order matters only for
#    tie-breaking (earlier = slightly preferred on equal score).
# ---------------------------------------------------------------------------
USE_CASE_KEYWORDS = {
    "Secure Boot": [
        "secure boot", "bootloader", "boot integrity", "boot process", "boot chain"
    ],
    "OTA Update": [
        "ota", "over-the-air", "over the air", "firmware update", "software update",
        "remote update", "firmware upgrade"
    ],
    "V2X Communication": [
        "v2x", "vehicle-to-vehicle", "vehicle to vehicle", "v2v",
        "vehicle-to-infrastructure", "v2i", "car-to-car", "c-v2x"
    ],
    "SecOC / In-Vehicle Communication": [
        "secoc", "can bus", "can-fd", "can fd", "in-vehicle network",
        "message authentication", "intra-vehicle"
    ],
    "ECU-to-ECU Communication": [
        "ecu to ecu", "ecu-to-ecu", "inter-ecu", "internal ecu communication"
    ],
    "Key Exchange": [
        "key exchange", "key agreement", "session key", "handshake", "key establishment"
    ],
    "Data Encryption": [
        "data at rest", "storage encryption", "encrypt data", "confidentiality",
        "encrypted storage"
    ],
    "Digital Signatures": [
        "code signing", "sign firmware", "signature verification", "signing",
        "digital signature"
    ],
    "RNG": [
        "random number", "rng", "entropy source", "seed generation", "true random"
    ],
    "Diagnostics (UDS)": [
        "uds", "diagnostic session", "obd", "on-board diagnostics"
    ],
}

# ---------------------------------------------------------------------------
# 2. THREAT LEVEL KEYWORDS (checked in this priority order — most severe wins)
# ---------------------------------------------------------------------------
THREAT_LEVEL_KEYWORDS = [
    ("Critical", ["critical threat", "critical risk", "nation-state", "safety-critical attack",
                  "threat level is critical", "threat: critical"]),
    ("High",     ["high threat", "high risk", "high security", "adversarial", "remote attacker",
                  "threat level is high", "threat: high", "highly targeted"]),
    ("Medium",   ["medium threat", "moderate threat", "moderate risk",
                  "threat level is medium", "threat: medium"]),
    ("Low",      ["low threat", "low risk", "minimal threat",
                  "threat level is low", "threat: low"]),
]

# Fallback: a bare severity word ("high", "critical", "medium", "low") that
# appears within a few words of "threat" or "risk". Checked only if the
# stricter phrase list above finds nothing.
_THREAT_WORD_ORDER = ["Critical", "High", "Medium", "Low"]  # priority if multiple appear
_THREAT_WORD_PATTERN = re.compile(
    r'\b(critical|high|medium|moderate|low)\b[^.]{0,25}\b(threat|risk)\b|'
    r'\b(threat|risk)\b[^.]{0,25}\b(critical|high|medium|moderate|low)\b'
)

# ---------------------------------------------------------------------------
# 3. POST-QUANTUM KEYWORDS
# ---------------------------------------------------------------------------
PQC_KEYWORDS = [
    "post-quantum", "post quantum", "quantum-safe", "quantum safe",
    "quantum-resistant", "quantum resistant", "quantum threat",
    "pqc", "quantum computer", "harvest now decrypt later", "hndl"
]

# ---------------------------------------------------------------------------
# 4. HARDWARE CONSTRAINT KEYWORDS
# ---------------------------------------------------------------------------
CONSTRAINED_HW_KEYWORDS = [
    "limited ram", "constrained", "low memory", "no accelerator",
    "resource-constrained", "resource constrained", "8-bit", "low-power",
    "low power", "microcontroller", "no hardware crypto", "small flash"
]
ACCELERATED_HW_KEYWORDS = [
    "hardware accelerator", "hsm", "hardware security module", "secure element",
    "crypto accelerator", "powerful", "high-performance ecu"
]

# ---------------------------------------------------------------------------
# 5. REGULATORY / REFERENCE SCOPE KEYWORDS
# ---------------------------------------------------------------------------
REGULATORY_KEYWORDS = {
    "ISO/SAE 21434": ["iso 21434", "iso/sae 21434", "21434"],
    "UNECE WP.29 R155": ["r155", "wp.29 r155", "unece r155"],
    "UNECE WP.29 R156": ["r156", "wp.29 r156", "unece r156"],
}

# ---------------------------------------------------------------------------
# DEFAULTS (used when a field cannot be extracted — always flagged in
# extraction_notes so the UI can tell the user "we assumed X")
# ---------------------------------------------------------------------------
DEFAULT_VEHICLE_LIFETIME = 15   # years — typical automotive assumption
DEFAULT_THREAT_LEVEL = "Medium"
DEFAULT_USE_CASE = "Unspecified / General Cryptographic Guidance"


def _extract_use_cases(text_lower: str):
    """Score every use-case category by keyword hits. Return (primary, all_detected)."""
    scores = {}
    for use_case, keywords in USE_CASE_KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw in text_lower)
        if hits > 0:
            scores[use_case] = hits

    if not scores:
        return DEFAULT_USE_CASE, []

    # Primary = highest scoring; ties broken by dict insertion order (stable sort)
    primary = max(scores, key=lambda k: scores[k])
    all_detected = sorted(scores, key=lambda k: -scores[k])
    return primary, all_detected


def _extract_vehicle_lifetime(text_lower: str):
    """Look for patterns like '15 years', '18-year', '20 yr lifecycle'."""
    match = re.search(r'(\d{1,2})\s*(?:-|\s)?\s*(?:year|yr)s?', text_lower)
    if match:
        return int(match.group(1)), True  # found=True
    return DEFAULT_VEHICLE_LIFETIME, False


def _extract_threat_level(text_lower: str):
    # Pass 1: exact phrase match (most reliable)
    for level, keywords in THREAT_LEVEL_KEYWORDS:
        if any(kw in text_lower for kw in keywords):
            return level, True

    # Pass 2: loose proximity match, e.g. "the threat level is high"
    match = _THREAT_WORD_PATTERN.search(text_lower)
    if match:
        word = next(g for g in match.groups() if g and g not in ("threat", "risk"))
        word = "Medium" if word == "moderate" else word.capitalize()
        if word in _THREAT_WORD_ORDER:
            return word, True

    return DEFAULT_THREAT_LEVEL, False


def _extract_pqc_required(text_lower: str):
    return any(kw in text_lower for kw in PQC_KEYWORDS)


def _extract_hardware_constraint(text_lower: str):
    if any(kw in text_lower for kw in CONSTRAINED_HW_KEYWORDS):
        return "Constrained"
    if any(kw in text_lower for kw in ACCELERATED_HW_KEYWORDS):
        return "Accelerated"
    return "Unspecified"


def _extract_regulatory_scope(text_lower: str):
    found = []
    for standard, keywords in REGULATORY_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            found.append(standard)
    return found


def parse_natural_query(user_text: str) -> dict:
    """
    Main entry point. Always returns a fully-populated dict — never raises
    on messy/empty input (fails safe with defaults + notes explaining why).
    """
    if not user_text or not user_text.strip():
        return {
            "use_case": DEFAULT_USE_CASE,
            "vehicle_lifetime": DEFAULT_VEHICLE_LIFETIME,
            "threat_level": DEFAULT_THREAT_LEVEL,
            "pqc_required": False,
            "hardware_constraint": "Unspecified",
            "regulatory_scope": [],
            "detected_use_cases": [],
            "extraction_notes": ["Empty query — all fields defaulted."],
        }

    text_lower = user_text.lower()
    notes = []

    primary_use_case, all_detected = _extract_use_cases(text_lower)
    if primary_use_case == DEFAULT_USE_CASE:
        notes.append("No specific use case detected — defaulted to general guidance.")
    elif len(all_detected) > 1:
        notes.append(f"Multiple use cases detected: {', '.join(all_detected)}. "
                      f"Primary selected: {primary_use_case}.")

    lifetime, lifetime_found = _extract_vehicle_lifetime(text_lower)
    if not lifetime_found:
        notes.append(f"Vehicle lifetime not specified — defaulted to {DEFAULT_VEHICLE_LIFETIME} years.")

    threat, threat_found = _extract_threat_level(text_lower)
    if not threat_found:
        notes.append(f"Threat level not specified — defaulted to {DEFAULT_THREAT_LEVEL}.")

    pqc_required = _extract_pqc_required(text_lower)
    hardware_constraint = _extract_hardware_constraint(text_lower)
    regulatory_scope = _extract_regulatory_scope(text_lower)

    return {
        "use_case": primary_use_case,
        "vehicle_lifetime": lifetime,
        "threat_level": threat,
        "pqc_required": pqc_required,
        "hardware_constraint": hardware_constraint,
        "regulatory_scope": regulatory_scope,
        "detected_use_cases": all_detected,
        "extraction_notes": notes,
    }


# ---------------------------------------------------------------------------
# SELF-TEST — run this file directly to sanity-check extraction logic
# without needing FastAPI, the knowledge base, or your teammates' code.
#     python nlp_parser.py
# ---------------------------------------------------------------------------
if _name_ == "_main_":
    import json

    test_queries = [
        "I am designing an OTA update system for an ECU that will remain in "
        "vehicles for 18 years. The MCU has limited RAM and no dedicated "
        "accelerator. The threat level is high and we want to prepare for "
        "post-quantum migration.",

        "Secure boot for a 10 year vehicle lifecycle, low threat environment.",

        "V2X communication with hardware security module, medium threat, ISO 21434 scope.",

        "We need SecOC message authentication on CAN-FD for a 20-year truck platform.",

        "encrypt data",  # sparse input, tests defaults

        "",
        
          # empty input, tests fail-safe path
    ]

    for q in test_queries:
        print("-" * 70)
        print("QUERY:", q if q else "(empty)")
        print(json.dumps(parse_natural_query(q), indent=2))