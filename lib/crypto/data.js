export const OBJECTIVES = [
  {
    id: 'secure-boot',
    title: 'Secure Boot',
    short: 'Verify firmware',
    description: 'Verify ECU firmware before execution.',
    icon: 'shield-check',
    subOptions: [
      { id: 'fw-signing', label: 'Firmware Signing' },
      { id: 'fw-verification', label: 'Firmware Verification' },
      { id: 'secure-key-storage', label: 'Secure Key Storage' },
      { id: 'anti-rollback', label: 'Anti-Rollback Protection' },
      { id: 'boot-integrity', label: 'Boot Integrity' },
    ],
  },
  {
    id: 'ota',
    title: 'OTA Updates',
    short: 'Protect updates',
    description: 'Authenticate and protect vehicle software updates.',
    icon: 'cloud-upload',
    subOptions: [
      { id: 'update-signing', label: 'Update Signing' },
      { id: 'update-integrity', label: 'Update Integrity' },
      { id: 'update-encryption', label: 'Update Encryption' },
      { id: 'secure-download', label: 'Secure Download' },
      { id: 'ota-anti-rollback', label: 'Anti-Rollback' },
      { id: 'update-auth', label: 'Update Authentication' },
    ],
  },
  {
    id: 'v2x',
    title: 'V2X Communication',
    short: 'Protect V2X',
    description: 'Protect vehicle-to-everything communication.',
    icon: 'radio',
    subOptions: [
      { id: 'msg-auth', label: 'Message Authentication' },
      { id: 'msg-integrity', label: 'Message Integrity' },
      { id: 'cert-mgmt', label: 'Certificate Management' },
      { id: 'key-exchange', label: 'Key Exchange' },
      { id: 'privacy', label: 'Privacy / Pseudonymity' },
      { id: 'replay', label: 'Replay Protection' },
    ],
  },
  {
    id: 'secoc',
    title: 'MAC / SecOC',
    short: 'Authenticate CAN',
    description: 'Authenticate in-vehicle network messages.',
    icon: 'network',
    subOptions: [
      { id: 'can-auth', label: 'CAN Authentication' },
      { id: 'mac', label: 'Message Authentication Code' },
      { id: 'freshness', label: 'Freshness Counter' },
      { id: 'secoc-replay', label: 'Replay Protection' },
      { id: 'key-mgmt', label: 'Key Management' },
      { id: 'secoc', label: 'SecOC' },
    ],
  },
  {
    id: 'data-encryption',
    title: 'Data Encryption',
    short: 'Protect data',
    description: 'Protect stored or transmitted vehicle data.',
    icon: 'lock',
    subOptions: [
      { id: 'data-at-rest', label: 'Data at Rest' },
      { id: 'data-in-transit', label: 'Data in Transit' },
      { id: 'ecu-storage', label: 'ECU Storage' },
      { id: 'diag-data', label: 'Diagnostic Data' },
      { id: 'sensitive-data', label: 'Sensitive Vehicle Data' },
      { id: 'comm-encryption', label: 'Communication Encryption' },
    ],
  },
  {
    id: 'key-exchange',
    title: 'Key Exchange',
    short: 'Shared secrets',
    description: 'Establish secure shared secrets between systems.',
    icon: 'key-round',
    subOptions: [
      { id: 'ecdh', label: 'ECDH' },
      { id: 'hybrid-kex', label: 'Hybrid Key Exchange' },
      { id: 'ml-kem', label: 'ML-KEM' },
      { id: 'key-agreement', label: 'Key Agreement' },
      { id: 'key-provisioning', label: 'Key Provisioning' },
      { id: 'session-keys', label: 'Session Keys' },
    ],
  },
  {
    id: 'integrity',
    title: 'Integrity / Hashing',
    short: 'Detect tampering',
    description: 'Detect unauthorized data modification.',
    icon: 'hash',
    subOptions: [
      { id: 'sha-256', label: 'SHA-256' },
      { id: 'sha-384', label: 'SHA-384' },
      { id: 'sha-512', label: 'SHA-512' },
      { id: 'hmac', label: 'HMAC' },
      { id: 'cmac', label: 'CMAC' },
      { id: 'fw-integrity', label: 'Firmware Integrity' },
    ],
  },
  {
    id: 'rng',
    title: 'Random Number Generation',
    short: 'Secure entropy',
    description: 'Generate secure cryptographic randomness.',
    icon: 'shuffle',
    subOptions: [
      { id: 'trng', label: 'Hardware TRNG' },
      { id: 'drbg', label: 'DRBG' },
      { id: 'entropy', label: 'Entropy Source' },
      { id: 'seed', label: 'Random Seed' },
      { id: 'rng-validation', label: 'Hardware RNG Validation' },
    ],
  },
]

export const PROJECT_TYPES = [
  { id: 'body-ecu', label: 'Body ECU', icon: 'cpu' },
  { id: 'gateway-ecu', label: 'Gateway ECU', icon: 'network' },
  { id: 'adas-ecu', label: 'ADAS ECU', icon: 'radar' },
  { id: 'infotainment', label: 'Infotainment', icon: 'monitor' },
  { id: 'telematics', label: 'Telematics', icon: 'satellite-dish' },
  { id: 'v2x-unit', label: 'V2X Unit', icon: 'radio' },
  { id: 'central-compute', label: 'Central Compute', icon: 'server' },
  { id: 'custom', label: 'Custom Project', icon: 'settings-2' },
]

export const LIFETIMES = [
  { id: '5', label: '≤ 5 years', note: 'Short lifecycle. Classical cryptography remains appropriate for the deployment window.' },
  { id: '6-10', label: '6–10 years', note: 'Moderate lifecycle. Begin monitoring post-quantum standardization for future revisions.' },
  { id: '11-15', label: '11–15 years', note: 'Extended lifecycle. Cryptographic agility becomes important; plan a migration path.' },
  { id: '16-20', label: '16–20 years', note: 'Long lifecycle. Post-quantum migration planning is strongly recommended.' },
  { id: '20+', label: '20+ years', note: 'Long lifecycle increases the importance of cryptographic agility and post-quantum migration planning.' },
]

export const THREATS = [
  { id: 'standard', label: 'Standard', note: 'Normal cybersecurity requirements.' },
  { id: 'high', label: 'High', note: 'Elevated attack exposure and long-term protection requirements.' },
  { id: 'critical', label: 'Critical', note: 'High-impact systems requiring stronger security controls.' },
]

export const HARDWARE = [
  { id: 'constrained', label: 'Constrained ECU' },
  { id: 'standard', label: 'Standard ECU' },
  { id: 'hsm', label: 'ECU + HSM' },
  { id: 'high-perf', label: 'High-performance ECU' },
  { id: 'central', label: 'Central Compute' },
]

export const HSM_OPTIONS = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'unknown', label: 'Unknown' },
]

export const HW_ACCEL = [
  { id: 'aes', label: 'AES' },
  { id: 'sha', label: 'SHA' },
  { id: 'ecc', label: 'ECC' },
  { id: 'pqc', label: 'PQC' },
  { id: 'none', label: 'None / Unknown' },
]

export const PQC_READINESS = [
  { id: 'not-required', label: 'Not Required' },
  { id: 'monitor', label: 'Monitor Migration' },
  { id: 'plan', label: 'Plan Migration' },
  { id: 'ready', label: 'PQC Ready' },
]

export const MIGRATION_STRATEGY = [
  { id: 'hybrid', label: 'Hybrid Cryptography' },
  { id: 'agility', label: 'Crypto Agility' },
  { id: 'full-pqc', label: 'Full PQC Migration' },
  { id: 'undecided', label: 'Not Decided' },
]

export const REGULATORY = [
  { id: 'iso-21434', label: 'ISO/SAE 21434' },
  { id: 'r155', label: 'UNECE R155' },
  { id: 'r156', label: 'UNECE R156' },
  { id: 'autosar', label: 'AUTOSAR Security' },
  { id: 'internal', label: 'Internal Security Policy' },
  { id: 'other', label: 'Other' },
]

export const PERFORMANCE = [
  { id: 'low-latency', label: 'Low Latency', icon: 'zap' },
  { id: 'low-memory', label: 'Low Memory', icon: 'memory-stick' },
  { id: 'low-cpu', label: 'Low CPU Usage', icon: 'cpu' },
  { id: 'low-flash', label: 'Low Flash Usage', icon: 'hard-drive' },
  { id: 'strong-security', label: 'Strong Security', icon: 'shield' },
  { id: 'long-term', label: 'Long-term Security', icon: 'calendar-clock' },
  { id: 'pqc-ready', label: 'PQC Readiness', icon: 'atom' },
]

export const KNOWLEDGE_BASE = [
  { 
    id: 'aes-256-gcm', 
    algorithm: 'AES-256-GCM', 
    primaryUse: 'Authenticated encryption', 
    securityStatus: 'RECOMMENDED', 
    pqcStatus: 'Strong symmetric margin', 
    automotiveRelevance: 'ECU data protection / communications', 
    reference: 'NIST FIPS 197 / SP 800-38D, ISO/SAE 21434', 
    strength: 'High (256-bit)', 
    details: 'Advanced Encryption Standard (AES) in Galois/Counter Mode (GCM) provides both confidentiality and data origin authentication (AEAD). It is highly efficient on modern hardware and widely adopted across automotive Ethernet (e.g., MACsec, IPsec, TLS). Symmetric ciphers retain a strong security margin against quantum attacks; a 256-bit key provides an ample buffer against Grover-type speedups, effectively offering 128 bits of post-quantum security.' 
  },
  { 
    id: 'aes-cmac-128', 
    algorithm: 'AES-CMAC-128', 
    primaryUse: 'Message authentication (SecOC)', 
    securityStatus: 'RECOMMENDED', 
    pqcStatus: 'Strong symmetric margin', 
    automotiveRelevance: 'CAN / SecOC message authentication', 
    reference: 'NIST SP 800-38B, AUTOSAR SecOC', 
    strength: 'High (128-bit)', 
    details: 'Cipher-based Message Authentication Code (CMAC) based on AES. It provides efficient message authentication on constrained ECUs and is widely used in AUTOSAR SecOC for in-vehicle network authentication (e.g., CAN, LIN) combined with a freshness counter to prevent replay attacks. While a 128-bit key is currently sufficient against classical threats, systems with >15 year lifespans should consider migrating to 256-bit variants for long-term quantum resilience.' 
  },
  { 
    id: 'ecdsa-p256', 
    algorithm: 'ECDSA P-256', 
    primaryUse: 'Digital signatures', 
    securityStatus: 'MIGRATION PLANNED', 
    pqcStatus: 'Not quantum-resistant', 
    automotiveRelevance: 'Firmware / OTA / V2X signing', 
    reference: 'NIST FIPS 186-5', 
    strength: 'High (classical)', 
    details: 'Elliptic Curve Digital Signature Algorithm (ECDSA) using the NIST P-256 curve is a mature, well-supported scheme suitable for current automotive firmware signing, Secure Boot, and V2X message authorization. However, it relies on the discrete logarithm problem, making it vulnerable to Shor’s algorithm on a future quantum computer. Long-lifecycle vehicle programs must plan a hybrid or full PQC migration path (e.g., transitioning to ML-DSA) for assets that require long-term authenticity.' 
  },
  { 
    id: 'ecdh-p256', 
    algorithm: 'ECDH P-256', 
    primaryUse: 'Key exchange', 
    securityStatus: 'MIGRATION PLANNED', 
    pqcStatus: 'Not quantum-resistant', 
    automotiveRelevance: 'Session key establishment', 
    reference: 'NIST SP 800-56A', 
    strength: 'High (classical)', 
    details: 'Elliptic-Curve Diffie-Hellman (ECDH) is used for establishing shared secrets over an insecure channel, foundational for TLS and secure diagnostic sessions (UDS). Like ECDSA, it is vulnerable to future quantum attacks. The recommended migration strategy is to pair ECDH with ML-KEM in a hybrid key encapsulation construction to ensure confidentiality for long-lived automotive systems.' 
  },
  { 
    id: 'sha-256', 
    algorithm: 'SHA-256', 
    primaryUse: 'Hashing / integrity', 
    securityStatus: 'RECOMMENDED', 
    pqcStatus: 'Strong margin', 
    automotiveRelevance: 'Firmware & data integrity', 
    reference: 'NIST FIPS 180-4', 
    strength: 'High (256-bit)', 
    details: 'Secure Hash Algorithm 2 (SHA-2) with a 256-bit digest is a general-purpose cryptographic hash function with a strong security margin. It is ubiquitous in automotive for firmware integrity verification during Secure Boot, serving as the basis for HMAC, and providing message digests for ECDSA signatures. Hash functions are generally considered quantum-resistant, though collision resistance effectively halves to 128 bits under quantum Grover attacks.' 
  },
  { 
    id: 'sha-384', 
    algorithm: 'SHA-384', 
    primaryUse: 'Hashing / integrity', 
    securityStatus: 'RECOMMENDED', 
    pqcStatus: 'Strong margin', 
    automotiveRelevance: 'High-assurance integrity', 
    reference: 'NIST FIPS 180-4', 
    strength: 'High (384-bit)', 
    details: 'A variant of SHA-2 providing a 384-bit digest. This larger digest size provides an extra security margin for high-assurance or safety-critical automotive systems (ASIL-D) where a longer security horizon is required. It is commonly paired with ECDSA P-384 and forms part of the NSA Suite B Cryptography recommendations for top-secret data.' 
  },
  { 
    id: 'sha-512', 
    algorithm: 'SHA-512', 
    primaryUse: 'Hashing / integrity', 
    securityStatus: 'RECOMMENDED', 
    pqcStatus: 'Strong margin', 
    automotiveRelevance: 'High-performance 64-bit ECUs', 
    reference: 'NIST FIPS 180-4', 
    strength: 'High (512-bit)', 
    details: 'SHA-512 operates on 64-bit words, making it highly efficient on modern 64-bit platforms (e.g., central-compute nodes, high-end ADAS ECUs). It provides an exceptional security margin against all known classical and quantum cryptographic attacks, making it ideal for high-assurance integrity checks and long-term secure archival of vehicle telemetry.' 
  },
  { 
    id: 'ml-kem-768', 
    algorithm: 'ML-KEM-768', 
    primaryUse: 'Post-quantum key exchange', 
    securityStatus: 'PQC STANDARD', 
    pqcStatus: 'Quantum-resistant', 
    automotiveRelevance: 'Future key establishment', 
    reference: 'NIST FIPS 203 (CRYSTALS-Kyber)', 
    strength: 'High (PQC Level 3)', 
    details: 'Module-Lattice-Based Key Encapsulation Mechanism (formerly CRYSTALS-Kyber) standardized by NIST in FIPS 203. It is designed to resist attacks from cryptographically relevant quantum computers (CRQCs). ML-KEM-768 provides security equivalent to AES-192. It is highly recommended to implement this in a hybrid construction alongside ECDH during the transition period to guarantee security even if unforeseen weaknesses are found in the lattice mathematics.' 
  },
  { 
    id: 'ml-dsa-65', 
    algorithm: 'ML-DSA-65', 
    primaryUse: 'Post-quantum signatures', 
    securityStatus: 'PQC STANDARD', 
    pqcStatus: 'Quantum-resistant', 
    automotiveRelevance: 'Future firmware / OTA signing', 
    reference: 'NIST FIPS 204 (CRYSTALS-Dilithium)', 
    strength: 'High (PQC Level 3)', 
    details: 'Module-Lattice-Based Digital Signature Algorithm (formerly CRYSTALS-Dilithium) standardized by NIST in FIPS 204. It offers strong post-quantum security for firmware and OTA signing. However, ML-DSA has significantly larger key and signature sizes compared to ECDSA (e.g., kilobytes instead of bytes). OEMs must carefully evaluate flash storage constraints and verification latency on target ECUs (especially for Secure Boot) before broad adoption.' 
  },
  { 
    id: 'hmac', 
    algorithm: 'HMAC', 
    primaryUse: 'Keyed message authentication', 
    securityStatus: 'RECOMMENDED', 
    pqcStatus: 'Strong margin', 
    automotiveRelevance: 'Integrity with shared keys', 
    reference: 'NIST FIPS 198-1', 
    strength: 'High', 
    details: 'Hash-based Message Authentication Code (HMAC) uses a cryptographic hash function (like SHA-256) combined with a secret cryptographic key. It is widely used to verify both data integrity and authenticity of messages. HMAC maintains a strong post-quantum security margin when paired with a robust hash function (SHA-256 or SHA-384) and an adequate key length (≥256 bits).' 
  },
  { 
    id: 'trng', 
    algorithm: 'TRNG', 
    primaryUse: 'Entropy source', 
    securityStatus: 'RECOMMENDED', 
    pqcStatus: 'N/A', 
    automotiveRelevance: 'Seeding key generation', 
    reference: 'NIST SP 800-90B, AIS31', 
    strength: 'Depends on hardware source', 
    details: 'Hardware True Random Number Generators (TRNG) capture entropy from physical processes (e.g., thermal noise, ring oscillators). They are critical for seeding deterministic generators. In automotive HSMs, a TRNG must be rigorously validated against standards like NIST SP 800-90B or BSI AIS31 to ensure no predictable patterns exist before relying on it for high-value key generation.' 
  },
  { 
    id: 'drbg', 
    algorithm: 'DRBG', 
    primaryUse: 'Deterministic RNG', 
    securityStatus: 'RECOMMENDED', 
    pqcStatus: 'N/A', 
    automotiveRelevance: 'Cryptographic randomness', 
    reference: 'NIST SP 800-90A', 
    strength: 'High', 
    details: 'Deterministic Random Bit Generators (DRBG), such as CTR_DRBG or HMAC_DRBG, expand a secure seed (from a TRNG) into a continuous stream of cryptographic randomness. This is the standard, certified approach for generating nonces, session keys, and persistent cryptographic keys on ECUs. Proper reseeding intervals must be configured to maintain forward and backward secrecy.' 
  },
]

export const ARCHITECTURE_MAP = [
  { id: 'vehicle', label: 'Vehicle', detail: 'The complete connected platform' },
  { id: 'ecu', label: 'ECU', detail: 'Electronic control unit target' },
  { id: 'communication', label: 'Communication', detail: 'CAN, Ethernet, V2X, OTA channels' },
  { id: 'cryptography', label: 'Cryptography', detail: 'Signing, encryption, MAC, hashing' },
  { id: 'key-management', label: 'Key Management', detail: 'Provisioning, storage, rotation' },
  { id: 'hardware-protection', label: 'Hardware Protection', detail: 'HSM / secure key storage' },
  { id: 'pqc-migration', label: 'PQC Migration', detail: 'Long-term quantum resistance' },
]

export const ASSISTANT_PROMPTS = [
  'Recommend crypto for OTA signing',
  'Check SecOC for CAN',
  'Explain PQC migration',
  'Compare AES-GCM vs AES-CMAC',
  'What should an HSM protect?',
  'Explain this recommendation',
]
