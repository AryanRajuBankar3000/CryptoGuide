"""
CryptoGuide - NLP / Natural Language Preprocessor

Purpose:
    Convert a free-form user query into a structured dictionary that
    the rule engine can consume.

Design:
    Deterministic keyword / regex based NLP.
    No external ML model.
    No API.
    No internet.
    No downloads.

The parser handles:
    1. Crypto engineering requirements
    2. Crypto concept questions
    3. General conversation
    4. Greetings
    5. Capability questions
    6. Gibberish / unusable input
    7. Ambiguous crypto requests

Existing rule-engine contract is preserved:
    use_case
    vehicle_lifetime
    threat_level
    pqc_required

Additional fields are provided for UX and intent handling.
"""

import re


# =====================================================================
# 1. AUTOMOTIVE / CRYPTOGRAPHIC USE CASES
# =====================================================================

USE_CASE_KEYWORDS = {

    "Secure Boot": [
        "secure boot",
        "secureboot",
        "bootloader security",
        "secure bootloader",
        "boot integrity",
        "boot process",
        "boot chain",
        "trusted boot",
        "verified boot",
        "platform integrity",
    ],

    "OTA Update": [
        "ota",
        "ota update",
        "ota updates",
        "over-the-air",
        "over the air",
        "firmware update",
        "firmware updates",
        "software update",
        "software updates",
        "remote update",
        "remote updates",
        "firmware upgrade",
        "firmware upgrades",
        "remote firmware",
        "remote software update",
    ],

    "V2X Communication": [
        "v2x",
        "vehicle-to-vehicle",
        "vehicle to vehicle",
        "v2v",
        "vehicle-to-infrastructure",
        "vehicle to infrastructure",
        "v2i",
        "vehicle-to-network",
        "v2n",
        "car-to-car",
        "c-v2x",
        "connected vehicle communication",
        "vehicle communication",
    ],

    "SecOC / In-Vehicle Communication": [
        "secoc",
        "can bus",
        "can-bus",
        "canfd",
        "can-fd",
        "can fd",
        "in-vehicle network",
        "in vehicle network",
        "vehicle network",
        "message authentication",
        "message authentication code",
        "mac authentication",
        "intra-vehicle",
        "intra vehicle",
        "automotive network",
    ],

    "ECU-to-ECU Communication": [
        "ecu to ecu",
        "ecu-to-ecu",
        "ecu to another ecu",
        "inter-ecu",
        "inter ecu",
        "internal ecu communication",
        "communication between ecus",
        "communication between ecu",
    ],

    "Key Exchange": [
        "key exchange",
        "key agreement",
        "session key",
        "session keys",
        "handshake",
        "handshake protocol",
        "key establishment",
        "establish a key",
        "shared secret",
        "diffie hellman",
        "diffie-hellman",
        "ecdh",
    ],

    "Data Encryption": [
        "data at rest",
        "storage encryption",
        "encrypt data",
        "encrypting data",
        "encrypted data",
        "data encryption",
        "encrypt stored data",
        "protect stored data",
        "confidentiality",
        "confidential data",
        "secure storage",
        "encrypted storage",
        "storage security",
    ],

    "Digital Signatures": [
        "code signing",
        "code-signing",
        "sign firmware",
        "signing firmware",
        "firmware signing",
        "signature verification",
        "verify signature",
        "digital signature",
        "digital signatures",
        "software signing",
        "firmware authenticity",
        "signed firmware",
    ],

    "RNG": [
        "random number",
        "random numbers",
        "random number generator",
        "random number generation",
        "rng",
        "trng",
        "true random",
        "true random number",
        "entropy source",
        "entropy",
        "seed generation",
        "randomness",
    ],

    "Diagnostics (UDS)": [
        "uds",
        "uds diagnostics",
        "diagnostic session",
        "diagnostic sessions",
        "obd",
        "obd ii",
        "obd-ii",
        "on-board diagnostics",
        "on board diagnostics",
        "automotive diagnostics",
        "vehicle diagnostics",
        "diagnostic communication",
    ],

    "Authentication": [
        "authentication",
        "authenticate",
        "authenticating",
        "device authentication",
        "device identity",
        "mutual authentication",
        "mutual auth",
        "server authentication",
        "client authentication",
        "node authentication",
    ],

    "Key Management": [
        "key management",
        "key lifecycle",
        "key rotation",
        "rotate keys",
        "key provisioning",
        "provisioning keys",
        "key storage",
        "key revocation",
        "key distribution",
        "cryptographic key management",
    ],

    "Certificate Management": [
        "certificate",
        "certificates",
        "digital certificate",
        "digital certificates",
        "certificate management",
        "certificate provisioning",
        "pki",
        "public key infrastructure",
        "certificate authority",
        "ca certificate",
    ],

    "Firmware Integrity": [
        "firmware integrity",
        "software integrity",
        "integrity protection",
        "integrity check",
        "integrity verification",
        "detect firmware tampering",
        "firmware tampering",
        "software tampering",
        "tamper protection",
    ],

    "Secure Diagnostics": [
        "secure diagnostics",
        "diagnostic security",
        "diagnostics security",
        "secure uds",
        "uds security",
    ],
}


# =====================================================================
# 2. CRYPTOGRAPHIC CONCEPTS
# =====================================================================

CRYPTO_CONCEPT_KEYWORDS = {

    "AES": [
        "aes",
        "advanced encryption standard",
    ],

    "RSA": [
        "rsa",
        "rsa encryption",
        "rsa cryptography",
    ],

    "ECC": [
        "ecc",
        "elliptic curve cryptography",
        "elliptic curve",
    ],

    "ECDSA": [
        "ecdsa",
        "elliptic curve digital signature algorithm",
    ],

    "EdDSA": [
        "eddsa",
        "ed25519",
        "ed448",
        "edwards digital signature",
    ],

    "SHA": [
        "sha",
        "sha-1",
        "sha1",
        "sha-224",
        "sha224",
        "sha-256",
        "sha256",
        "sha-384",
        "sha384",
        "sha-512",
        "sha512",
        "secure hash algorithm",
    ],

    "Hashing": [
        "hashing",
        "hash function",
        "hash functions",
        "cryptographic hash",
        "cryptographic hashing",
        "message digest",
    ],

    "HMAC": [
        "hmac",
        "hash based message authentication",
        "hash-based message authentication",
    ],

    "MAC": [
        "message authentication code",
        "message authentication codes",
    ],

    "Encryption": [
        "encryption",
        "encrypt",
        "encrypting",
        "encrypted",
        "decryption",
        "decrypt",
        "decrypting",
        "decrypted",
        "cipher",
        "ciphertext",
        "plaintext",
    ],

    "Digital Signatures": [
        "digital signature",
        "digital signatures",
        "signature scheme",
        "signature schemes",
        "electronic signature",
    ],

    "Key Exchange": [
        "key exchange",
        "key agreement",
        "diffie hellman",
        "diffie-hellman",
        "ecdh",
        "key establishment",
    ],

    "Random Number Generation": [
        "random number generation",
        "random number generator",
        "rng",
        "trng",
        "entropy",
        "randomness",
    ],

    "Post-Quantum Cryptography": [
        "post quantum",
        "post-quantum",
        "pqc",
        "quantum safe",
        "quantum-safe",
        "quantum resistant",
        "quantum-resistant",
        "quantum cryptography",
        "quantum computer",
        "quantum computers",
        "harvest now decrypt later",
        "harvest-now-decrypt-later",
        "hndl",
    ],

    "Cryptography": [
        "cryptography",
        "cryptographic",
        "cryptographic algorithm",
        "cryptographic algorithms",
        "crypto algorithm",
        "crypto algorithms",
        "cryptography algorithm",
    ],
}


# =====================================================================
# 3. THREAT LEVEL
# =====================================================================

THREAT_LEVEL_KEYWORDS = [

    (
        "Critical",
        [
            "critical threat",
            "critical risk",
            "critical security risk",
            "critical security",
            "nation-state",
            "nation state",
            "state-sponsored",
            "state sponsored",
            "safety-critical attack",
            "safety critical attack",
            "mission critical attack",
            "threat level is critical",
            "threat: critical",
            "critical attacker",
        ],
    ),

    (
        "High",
        [
            "high threat",
            "high risk",
            "high security risk",
            "high security",
            "highly targeted",
            "targeted attack",
            "targeted attacker",
            "remote attacker",
            "remote attack",
            "advanced attacker",
            "powerful attacker",
            "serious attacker",
            "threat level is high",
            "threat: high",
        ],
    ),

    (
        "Medium",
        [
            "medium threat",
            "medium risk",
            "moderate threat",
            "moderate risk",
            "normal threat",
            "standard threat",
            "threat level is medium",
            "threat: medium",
        ],
    ),

    (
        "Low",
        [
            "low threat",
            "low risk",
            "minimal threat",
            "minimal risk",
            "basic security",
            "non critical",
            "non-critical",
            "threat level is low",
            "threat: low",
        ],
    ),
]


_THREAT_WORD_ORDER = [
    "Critical",
    "High",
    "Medium",
    "Low",
]

_THREAT_WORD_PATTERN = re.compile(
    r"\b(critical|high|medium|moderate|low)\b"
    r"[^.!?]{0,30}\b(threat|risk)\b"
    r"|"
    r"\b(threat|risk)\b"
    r"[^.!?]{0,30}\b(critical|high|medium|moderate|low)\b",
    re.IGNORECASE,
)


# =====================================================================
# 4. POST-QUANTUM KEYWORDS
# =====================================================================

PQC_KEYWORDS = [
    "post-quantum",
    "post quantum",
    "quantum-safe",
    "quantum safe",
    "quantum-resistant",
    "quantum resistant",
    "quantum threat",
    "quantum computer",
    "quantum computers",
    "pqc",
    "harvest now decrypt later",
    "harvest-now-decrypt-later",
    "hndl",
    "future proof against quantum",
    "future-proof against quantum",
    "quantum secure",
    "quantum secure algorithm",
]


# =====================================================================
# 5. HARDWARE CONSTRAINTS
# =====================================================================

CONSTRAINED_HW_KEYWORDS = [
    "limited ram",
    "limited memory",
    "limited flash",
    "limited storage",
    "constrained",
    "resource constrained",
    "resource-constrained",
    "low memory",
    "low ram",
    "no accelerator",
    "no hardware accelerator",
    "no crypto accelerator",
    "no hardware crypto",
    "resource limited",
    "resource-limited",
    "8-bit",
    "8 bit",
    "16-bit",
    "16 bit",
    "low-power",
    "low power",
    "microcontroller",
    "small mcu",
    "small microcontroller",
    "tiny microcontroller",
    "small flash",
    "small ram",
]

ACCELERATED_HW_KEYWORDS = [
    "hardware accelerator",
    "hardware security module",
    "hardware security modules",
    "hsm",
    "secure element",
    "secure elements",
    "crypto accelerator",
    "crypto engine",
    "cryptographic accelerator",
    "hardware crypto",
    "hardware cryptography",
    "high-performance ecu",
    "high performance ecu",
]


# =====================================================================
# 6. REGULATORY / REFERENCE SCOPE
# =====================================================================

REGULATORY_KEYWORDS = {

    "ISO/SAE 21434": [
        "iso 21434",
        "iso/sae 21434",
        "iso sae 21434",
        "21434",
    ],

    "UNECE WP.29 R155": [
        "r155",
        "wp.29 r155",
        "wp29 r155",
        "unece r155",
        "unece wp.29 r155",
    ],

    "UNECE WP.29 R156": [
        "r156",
        "wp.29 r156",
        "wp29 r156",
        "unece r156",
        "unece wp.29 r156",
    ],
}


# =====================================================================
# 7. INTENT KEYWORDS
# =====================================================================

GREETING_PATTERNS = [
    "hello",
    "hi",
    "hey",
    "hey there",
    "good morning",
    "good afternoon",
    "good evening",
    "good night",
    "namaste",
]


CAPABILITY_PATTERNS = [
    "what can you do",
    "what do you do",
    "how can you help",
    "how do you help",
    "what are your capabilities",
    "what is cryptoguide",
    "tell me about cryptoguide",
    "what does cryptoguide do",
]


QUESTION_PATTERNS = [
    "what is",
    "what are",
    "what does",
    "how does",
    "how do",
    "how can",
    "why is",
    "why are",
    "why do",
    "why does",
    "explain",
    "tell me about",
    "define",
    "meaning of",
    "difference between",
    "difference of",
    "compare",
    "which is better",
]


REQUIREMENT_PATTERNS = [
    "i need",
    "we need",
    "i want",
    "we want",
    "i am designing",
    "we are designing",
    "i am building",
    "we are building",
    "i am implementing",
    "we are implementing",
    "looking for",
    "recommend",
    "recommendation",
    "which algorithm",
    "what algorithm should",
    "which crypto should",
    "which cryptographic",
    "need a secure",
    "need security",
    "secure my",
    "protect my",
    "protect our",
    "how should we secure",
]


# =====================================================================
# 8. DEFAULTS
# =====================================================================

DEFAULT_VEHICLE_LIFETIME = 15
DEFAULT_THREAT_LEVEL = "Medium"
DEFAULT_USE_CASE = "Unspecified / General Cryptographic Guidance"


# =====================================================================
# 9. BASIC TEXT NORMALIZATION
# =====================================================================

def _normalize_text(user_text: str) -> str:
    """
    Normalize text so matching becomes more reliable.

    Examples:
        CAN-FD -> can fd
        20-Year -> 20 year
        POST-QUANTUM -> post quantum
    """

    if not user_text:
        return ""

    text = str(user_text).lower().strip()

    # Replace common separators with spaces.
    text = text.replace("-", " ")
    text = text.replace("_", " ")

    # Collapse repeated whitespace.
    text = re.sub(r"\s+", " ", text)

    return text


# =====================================================================
# 10. HELPERS
# =====================================================================

def _contains_any(text: str, keywords) -> bool:
    return any(keyword in text for keyword in keywords)


def _count_keyword_hits(text: str, keywords) -> int:
    """
    Count how many distinct keywords from a category appear.

    Each keyword contributes at most one hit.
    """
    return sum(1 for keyword in keywords if keyword in text)


# =====================================================================
# 11. USE CASE EXTRACTION
# =====================================================================

def _extract_use_cases(text_lower: str):
    """
    Score all use-case categories.

    Returns:
        primary_use_case
        all_detected_use_cases
    """

    scores = {}

    for use_case, keywords in USE_CASE_KEYWORDS.items():
        hits = _count_keyword_hits(text_lower, keywords)

        if hits > 0:
            scores[use_case] = hits

    if not scores:
        return DEFAULT_USE_CASE, []

    # Highest score wins.
    primary = max(
        scores,
        key=lambda key: scores[key]
    )

    # Stable ordering for all detected categories.
    all_detected = sorted(
        scores,
        key=lambda key: -scores[key]
    )

    return primary, all_detected


# =====================================================================
# 12. CRYPTO CONCEPT EXTRACTION
# =====================================================================

def _extract_crypto_concepts(text_lower: str):
    """
    Detect known cryptographic concepts.

    Returns a list instead of a single value because one sentence
    can contain multiple concepts.
    """

    detected = []

    for concept, keywords in CRYPTO_CONCEPT_KEYWORDS.items():

        if _contains_any(text_lower, keywords):
            detected.append(concept)

    return detected


# =====================================================================
# 13. VEHICLE LIFETIME EXTRACTION
# =====================================================================

NUMBER_WORDS = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
    "eleven": 11,
    "twelve": 12,
    "thirteen": 13,
    "fourteen": 14,
    "fifteen": 15,
    "sixteen": 16,
    "seventeen": 17,
    "eighteen": 18,
    "nineteen": 19,
    "twenty": 20,
    "twenty five": 25,
    "thirty": 30,
}


def _extract_vehicle_lifetime(text_lower: str):
    """
    Detect:
        15 years
        15-year
        15 yr
        twenty years
        twenty-year lifecycle
        two decades
    """

    # Numeric forms:
    # 15 years
    # 15-year
    # 15 yr
    numeric_match = re.search(
        r"\b(\d{1,3})\s*(?:year|years|yr|yrs)\b",
        text_lower,
    )

    if numeric_match:
        value = int(numeric_match.group(1))

        if 1 <= value <= 100:
            return value, True

    # Word-number forms:
    # twenty years
    # fifteen-year
    for phrase, value in sorted(
        NUMBER_WORDS.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    ):

        pattern = rf"\b{re.escape(phrase)}\s*(?:year|years|yr|yrs)\b"

        if re.search(pattern, text_lower):
            return value, True

    # Decade forms:
    decade_match = re.search(
        r"\b(\d+)\s*[- ]?\s*decades?\b",
        text_lower,
    )

    if decade_match:
        value = int(decade_match.group(1)) * 10

        if 1 <= value <= 100:
            return value, True

    if "two decades" in text_lower:
        return 20, True

    if "three decades" in text_lower:
        return 30, True

    return DEFAULT_VEHICLE_LIFETIME, False


# =====================================================================
# 14. THREAT LEVEL EXTRACTION
# =====================================================================

def _extract_threat_level(text_lower: str):

    # --------------------------------------------------------------
    # Pass 1: explicit phrases
    # --------------------------------------------------------------

    for level, keywords in THREAT_LEVEL_KEYWORDS:

        if _contains_any(text_lower, keywords):
            return level, True

    # --------------------------------------------------------------
    # Pass 2: severity near threat/risk
    # --------------------------------------------------------------

    match = _THREAT_WORD_PATTERN.search(text_lower)

    if match:

        groups = match.groups()

        severity = None

        for group in groups:

            if group and group not in ("threat", "risk"):

                severity = group.lower()
                break

        if severity:

            if severity == "moderate":
                severity = "medium"

            severity = severity.capitalize()

            if severity in _THREAT_WORD_ORDER:
                return severity, True

    return DEFAULT_THREAT_LEVEL, False


# =====================================================================
# 15. PQC EXTRACTION
# =====================================================================

def _extract_pqc_required(text_lower: str):

    return _contains_any(
        text_lower,
        PQC_KEYWORDS,
    )


# =====================================================================
# 16. HARDWARE EXTRACTION
# =====================================================================

def _extract_hardware_constraint(text_lower: str):

    # Constrained takes priority because it is usually a stronger
    # architectural limitation.

    if _contains_any(
        text_lower,
        CONSTRAINED_HW_KEYWORDS,
    ):
        return "Constrained"

    if _contains_any(
        text_lower,
        ACCELERATED_HW_KEYWORDS,
    ):
        return "Accelerated"

    return "Unspecified"


# =====================================================================
# 17. REGULATORY EXTRACTION
# =====================================================================

def _extract_regulatory_scope(text_lower: str):

    found = []

    for standard, keywords in REGULATORY_KEYWORDS.items():

        if _contains_any(text_lower, keywords):
            found.append(standard)

    return found


# =====================================================================
# 18. QUESTION DETECTION
# =====================================================================

def _looks_like_question(text_lower: str) -> bool:

    if "?" in text_lower:
        return True

    if _contains_any(
        text_lower,
        QUESTION_PATTERNS,
    ):
        return True

    return False


# =====================================================================
# 19. REQUIREMENT DETECTION
# =====================================================================

def _looks_like_requirement(text_lower: str) -> bool:

    return _contains_any(
        text_lower,
        REQUIREMENT_PATTERNS,
    )


# =====================================================================
# 20. GREETING DETECTION
# =====================================================================

def _is_greeting(text_lower: str) -> bool:

    stripped = text_lower.strip()

    for greeting in GREETING_PATTERNS:

        if stripped == greeting:
            return True

    return False


# =====================================================================
# 21. CAPABILITY QUESTION DETECTION
# =====================================================================

def _is_capability_question(text_lower: str) -> bool:

    return _contains_any(
        text_lower,
        CAPABILITY_PATTERNS,
    )


# =====================================================================
# 22. GIBBERISH DETECTION
# =====================================================================

def _looks_like_gibberish(text_lower: str) -> bool:
    """
    Conservative gibberish detector.

    Important:
        This intentionally does NOT classify every unusual sentence
        as gibberish.

    It only flags obvious unusable inputs such as:
        asdfghjkl
        qwertyuiop
        123456789
        !!!@@@###
    """

    stripped = text_lower.strip()

    if not stripped:
        return False

    # No alphabetic characters at all.
    if not re.search(r"[a-z]", stripped):

        # Pure numbers / symbols.
        return True

    # Very long repeated character sequence.
    if re.search(r"(.)\1{5,}", stripped):
        return True

    # Common keyboard patterns.
    obvious_noise = [
        "asdfghjkl",
        "qwertyuiop",
        "zxcvbnm",
        "asdfgh",
        "qwerty",
        "hjkl",
    ]

    if stripped in obvious_noise:
        return True

    # If it contains almost no vowels and is a long single token,
    # it is probably noise.
    words = stripped.split()

    if len(words) == 1:

        word = words[0]

        if (
            len(word) >= 8
            and not re.search(r"[aeiou]", word)
            and re.fullmatch(r"[a-z0-9]+", word)
        ):
            return True

    return False


# =====================================================================
# 23. CRYPTO SIGNAL SCORE
# =====================================================================

def _calculate_crypto_signal(
    text_lower: str,
    detected_use_cases,
    detected_concepts,
) -> int:
    """
    Estimate how strongly the sentence is related to cryptography.

    This is NOT ML confidence.

    It is a deterministic score used only for intent selection.
    """

    score = 0

    # Automotive/crypto use case is strong evidence.
    score += len(detected_use_cases) * 3

    # Known cryptographic concept.
    score += len(detected_concepts) * 2

    # Generic security terms.
    generic_crypto_terms = [
        "crypto",
        "cryptography",
        "cryptographic",
        "algorithm",
        "security",
        "secure",
        "encryption",
        "authentication",
        "integrity",
        "confidentiality",
        "key",
        "signature",
        "hash",
    ]

    for term in generic_crypto_terms:

        if term in text_lower:
            score += 1

    return score


# =====================================================================
# 24. INTENT DETECTION
# =====================================================================

def _detect_intent(
    text_lower: str,
    detected_use_cases,
    detected_concepts,
    crypto_signal,
) -> str:
    """
    Determine what kind of input the user gave.
    """

    # Empty input.
    if not text_lower:
        return "empty"

    # Greeting.
    if _is_greeting(text_lower):
        return "greeting"

    # Capability question.
    if _is_capability_question(text_lower):
        return "capability_question"

    # Obvious gibberish.
    if _looks_like_gibberish(text_lower):
        return "gibberish"

    # Strong cryptographic signal.
    if crypto_signal > 0:

        # If asking what/how/why about a crypto concept.
        if (
            _looks_like_question(text_lower)
            and detected_concepts
            and not _looks_like_requirement(text_lower)
        ):
            return "crypto_concept_question"

        # Explicit engineering requirement.
        if _looks_like_requirement(text_lower):
            return "crypto_requirement"

        # Question containing a use case.
        if detected_use_cases and _looks_like_question(text_lower):
            return "crypto_requirement"

        # If it contains a clear crypto use case,
        # treat it as a requirement.
        if detected_use_cases:
            return "crypto_requirement"

        # Generic crypto concept with no explicit requirement.
        if detected_concepts:
            return "crypto_concept_question"

        # Generic security/crypto request.
        return "crypto_requirement"

    # No crypto signal and looks like a question.
    if _looks_like_question(text_lower):
        return "general_question"

    # Everything else that resembles normal language.
    return "general_statement"


# =====================================================================
# 25. MAIN PARSER
# =====================================================================

def parse_natural_query(user_text: str) -> dict:
    """
    Main entry point.

    Always returns a dictionary.

    Existing fields required by rule_engine.py remain available.

    Additional fields:
        intent
        crypto_concept
        detected_concepts
        crypto_signal
        is_ambiguous
        extraction_notes
    """

    # --------------------------------------------------------------
    # Handle completely empty input.
    # --------------------------------------------------------------

    if not user_text or not str(user_text).strip():

        return {
            "intent": "empty",

            "use_case": DEFAULT_USE_CASE,
            "vehicle_lifetime": DEFAULT_VEHICLE_LIFETIME,
            "threat_level": DEFAULT_THREAT_LEVEL,
            "pqc_required": False,

            "hardware_constraint": "Unspecified",
            "regulatory_scope": [],

            "detected_use_cases": [],
            "detected_concepts": [],
            "crypto_concept": None,

            "crypto_signal": 0,
            "is_ambiguous": True,

            "extraction_notes": [
                "Empty query — no information was provided."
            ],
        }

    # --------------------------------------------------------------
    # Normalize.
    # --------------------------------------------------------------

    text_lower = _normalize_text(user_text)

    notes = []

    # --------------------------------------------------------------
    # Extract crypto information.
    # --------------------------------------------------------------

    primary_use_case, all_detected = _extract_use_cases(
        text_lower
    )

    detected_concepts = _extract_crypto_concepts(
        text_lower
    )

    # --------------------------------------------------------------
    # Extract individual fields.
    # --------------------------------------------------------------

    lifetime, lifetime_found = _extract_vehicle_lifetime(
        text_lower
    )

    threat, threat_found = _extract_threat_level(
        text_lower
    )

    pqc_required = _extract_pqc_required(
        text_lower
    )

    hardware_constraint = _extract_hardware_constraint(
        text_lower
    )

    regulatory_scope = _extract_regulatory_scope(
        text_lower
    )

    # --------------------------------------------------------------
    # Calculate crypto signal.
    # --------------------------------------------------------------

    crypto_signal = _calculate_crypto_signal(
        text_lower,
        all_detected,
        detected_concepts,
    )

    # --------------------------------------------------------------
    # Detect intent.
    # --------------------------------------------------------------

    intent = _detect_intent(
        text_lower,
        all_detected,
        detected_concepts,
        crypto_signal,
    )

    # --------------------------------------------------------------
    # Add extraction notes.
    # --------------------------------------------------------------

    if intent == "crypto_requirement":

        if primary_use_case == DEFAULT_USE_CASE:

            notes.append(
                "Cryptographic/security requirement detected, "
                "but no specific use case was identified."
            )

        if len(all_detected) > 1:

            notes.append(
                f"Multiple use cases detected: "
                f"{', '.join(all_detected)}. "
                f"Primary selected: {primary_use_case}."
            )

        if not lifetime_found:

            notes.append(
                f"Vehicle lifetime not specified — "
                f"defaulted to {DEFAULT_VEHICLE_LIFETIME} years."
            )

        if not threat_found:

            notes.append(
                f"Threat level not specified — "
                f"defaulted to {DEFAULT_THREAT_LEVEL}."
            )

    elif intent == "crypto_concept_question":

        if detected_concepts:

            notes.append(
                f"Cryptographic concept(s) detected: "
                f"{', '.join(detected_concepts)}."
            )

        else:

            notes.append(
                "General cryptography question detected."
            )

    elif intent == "general_statement":

        notes.append(
            "No cryptographic requirement detected."
        )

    elif intent == "general_question":

        notes.append(
            "General question detected without a clear "
            "cryptographic requirement."
        )

    elif intent == "gibberish":

        notes.append(
            "Input appears to be unusable or meaningless."
        )

    elif intent == "greeting":

        notes.append(
            "Greeting detected."
        )

    elif intent == "capability_question":

        notes.append(
            "User is asking about CryptoGuide capabilities."
        )

    # --------------------------------------------------------------
    # Ambiguity.
    # --------------------------------------------------------------

    is_ambiguous = False

    if intent == "crypto_requirement":

        if (
            primary_use_case == DEFAULT_USE_CASE
            or len(all_detected) == 0
        ):
            is_ambiguous = True

    # --------------------------------------------------------------
    # Pick primary crypto concept.
    # --------------------------------------------------------------

    crypto_concept = (
        detected_concepts[0]
        if detected_concepts
        else None
    )

    # --------------------------------------------------------------
    # Return structured output.
    # --------------------------------------------------------------

    return {

        # ----------------------------------------------------------
        # NEW INTENT INFORMATION
        # ----------------------------------------------------------

        "intent": intent,

        # ----------------------------------------------------------
        # EXISTING RULE ENGINE CONTRACT
        # ----------------------------------------------------------

        "use_case": primary_use_case,
        "vehicle_lifetime": lifetime,
        "threat_level": threat,
        "pqc_required": pqc_required,

        # ----------------------------------------------------------
        # EXISTING BONUS FIELDS
        # ----------------------------------------------------------

        "hardware_constraint": hardware_constraint,
        "regulatory_scope": regulatory_scope,
        "detected_use_cases": all_detected,

        # ----------------------------------------------------------
        # NEW CRYPTO CONCEPT FIELDS
        # ----------------------------------------------------------

        "detected_concepts": detected_concepts,
        "crypto_concept": crypto_concept,

        # ----------------------------------------------------------
        # NEW NLP SIGNAL FIELDS
        # ----------------------------------------------------------

        "crypto_signal": crypto_signal,
        "is_ambiguous": is_ambiguous,

        # ----------------------------------------------------------
        # EXPLANATION
        # ----------------------------------------------------------

        "extraction_notes": notes,
    }


# =====================================================================
# 26. SELF TEST
# =====================================================================

if __name__ == "__main__":

    import json

    test_queries = [

        # ----------------------------------------------------------
        # ORIGINAL ENGINEERING TESTS
        # ----------------------------------------------------------

        "I am designing an OTA update system for an ECU that will remain "
        "in vehicles for 18 years. The MCU has limited RAM and no dedicated "
        "accelerator. The threat level is high and we want to prepare for "
        "post-quantum migration.",

        "Secure boot for a 10 year vehicle lifecycle, low threat environment.",

        "V2X communication with hardware security module, medium threat, "
        "ISO 21434 scope.",

        "We need SecOC message authentication on CAN-FD for a 20-year "
        "truck platform.",

        "encrypt data",

        "",

        "We need a random number generator for key generation on a "
        "hardware security module.",

        "Digital signature scheme for signing firmware images before OTA "
        "deployment, critical threat level.",

        "Key exchange protocol for a low-cost microcontroller with no "
        "hardware crypto accelerator.",

        "Data at rest encryption for storing diagnostic logs, "
        "12 year vehicle lifecycle, low risk.",

        "ECU-to-ECU communication authentication for a 15-year platform, "
        "moderate threat.",

        "We are implementing UDS diagnostics and need entropy for "
        "session key generation.",

        "quantum resistant algorithm needed",

        "secure boot and OTA update for a truck platform lasting 20 years, "
        "ISO 21434 scope, high threat",

        "storage encryption for a powerful ECU with hardware accelerator, "
        "R155 compliance needed",

        "handshake protocol for V2V communication, resource constrained "
        "device, 10 years",

        "message authentication code for in-vehicle network on "
        "8-bit microcontroller",

        "we want to future-proof against harvest now decrypt later attacks",

        "code signing for firmware, nation-state threat actor concern, "
        "25 year lifetime",

        "just tell me something about crypto",

        "CAN-FD authentication, low power device, quantum safe, R156",

        # ----------------------------------------------------------
        # CRYPTO CONCEPT QUESTIONS
        # ----------------------------------------------------------

        "What is AES?",

        "What is RSA?",

        "What is ECC?",

        "What is ECDSA?",

        "What is SHA-256?",

        "Explain hashing.",

        "What is HMAC?",

        "What is a digital signature?",

        "Explain encryption.",

        "What is post quantum cryptography?",

        "What is a cryptographic algorithm?",

        "What is the difference between encryption and hashing?",

        "How does key exchange work?",

        "Explain Diffie Hellman.",

        # ----------------------------------------------------------
        # INFORMAL CRYPTO QUESTIONS
        # ----------------------------------------------------------

        "what crypto should i use for my car",

        "how do i secure my ecu",

        "which algorithm should i use for firmware",

        "how can i protect my software updates",

        "what crypto is good for can bus",

        "need crypto for my ecu",

        "i need security for my vehicle",

        "make my firmware secure",

        "how should we secure the ecu communication",

        # ----------------------------------------------------------
        # GENERAL STATEMENTS
        # ----------------------------------------------------------

        "My name is Haaland.",

        "My name is Venky.",

        "My favourite food is biryani.",

        "I like football.",

        "I like cricket.",

        "I am a student.",

        "I am studying ECE.",

        "I am working on a hackathon.",

        "Today is a good day.",

        "I am building a car.",

        "My favourite player is Haaland.",

        # ----------------------------------------------------------
        # GREETINGS
        # ----------------------------------------------------------

        "hello",

        "hi",

        "hey",

        "hey there",

        "good morning",

        "good evening",

        "namaste",

        # ----------------------------------------------------------
        # CAPABILITY QUESTIONS
        # ----------------------------------------------------------

        "what can you do?",

        "how can you help me?",

        "what is CryptoGuide?",

        "what are your capabilities?",

        # ----------------------------------------------------------
        # GENERAL QUESTIONS
        # ----------------------------------------------------------

        "what is a car?",

        "who is Haaland?",

        "what is football?",

        "why is the sky blue?",

        # ----------------------------------------------------------
        # AMBIGUOUS CRYPTO
        # ----------------------------------------------------------

        "I need security.",

        "I need crypto.",

        "I need an algorithm.",

        "I need encryption.",

        "Which algorithm should I use?",

        "make my system secure.",

        # ----------------------------------------------------------
        # GIBBERISH / NOISE
        # ----------------------------------------------------------

        "asdfghjkl",

        "qwertyuiop",

        "zxcvbnm",

        "123456789",

        "!!!@@@###",

        "xjskdjfh",

        # ----------------------------------------------------------
        # NATURAL LANGUAGE VARIATIONS
        # ----------------------------------------------------------

        "Our truck needs to stay secure for twenty years.",

        "This vehicle will be on the road for two decades.",

        "We have a 25-year vehicle lifecycle.",

        "The ECU has very little RAM and no crypto hardware.",

        "Our device is a tiny microcontroller.",

        "We have an HSM available.",

        "The system has a dedicated crypto accelerator.",

        "We are worried about harvest-now-decrypt-later attacks.",

        "We need to protect firmware from tampering.",

        "We need authentication between two ECUs.",

        "Our car communicates with another car and needs security.",

        "We need to store secrets securely inside the ECU.",
    ]


    print()
    print("=" * 100)
    print("CryptoGuide NLP Parser Test")
    print("=" * 100)

    for index, query in enumerate(test_queries, start=1):

        print()
        print("-" * 100)
        print(f"TEST #{index}")
        print(f"QUERY: {query if query else '(empty)'}")
        print("-" * 100)

        result = parse_natural_query(query)

        print(
            json.dumps(
                result,
                indent=2,
            )
        )