"use client";

import { useState } from "react";
import {
  Shield, Hash, Radio, Key, Lock, Fingerprint, Layers, Shuffle,
  Settings, Factory, ExternalLink, AlertTriangle, CheckCircle2, Search,
} from "lucide-react";

const ICON_MAP = {
  SecureBoot: Shield,
  Integrity: Hash,
  Communication: Radio,
  KeyExchange: Key,
  DataEncryption: Lock,
  MAC_SecOC: Fingerprint,
  Signatures: Layers,
  RNG: Shuffle,
  KeyManagement: Settings,
  HSMProvisioning: Factory,
};

const KB = {
  SecureBoot: {
    useCase: "Secure Boot", algorithm: "RSA-3072 or ECDSA P-256",
    rationale: "Secure Boot requires a well-vetted signature scheme with hardware support across most automotive MCUs. ECDSA P-256 is preferred for constrained hardware.",
    keyLength: "3072-bit (RSA) / 256-bit (ECDSA)", mode: "Digital Signature",
    lifespan: "Secure until ~2030", riskFlags: ["Long vehicle lifetimes exceed algorithm confidence window"],
    standards: ["NIST FIPS 186-5", "ISO 21434"],
    pqc: "Migrate to CRYSTALS-Dilithium if lifetime exceeds 15 years",
    risk: "medium",
  },
  Integrity: {
    useCase: "Integrity", algorithm: "SHA-256 or SHA-3-256",
    rationale: "SHA-256 is the industry-standard hash with broad hardware acceleration support in automotive SoCs.",
    keyLength: "N/A (256-bit output)", mode: "Cryptographic Hash",
    lifespan: "Secure beyond 2035", riskFlags: [],
    standards: ["NIST FIPS 180-4", "ISO 21434"],
    pqc: "Not quantum-vulnerable; SHA-256 remains adequate",
    risk: "low",
  },
  Communication: {
    useCase: "Communication (V2X)", algorithm: "AES-128-GCM + ECDHE P-256",
    rationale: "AES-GCM provides authenticated encryption for real-time V2X; ECDHE gives forward secrecy.",
    keyLength: "128-bit (AES), 256-bit (ECDHE)", mode: "Authenticated Encryption",
    lifespan: "Secure until ~2030", riskFlags: ["ECDHE is quantum-vulnerable"],
    standards: ["IEEE 1609.2", "NIST SP 800-38D"],
    pqc: "Replace ECDHE with CRYSTALS-Kyber; AES-128 can remain",
    risk: "medium",
  },
  KeyExchange: {
    useCase: "Key Exchange", algorithm: "ECDH P-256 / CRYSTALS-Kyber",
    rationale: "ECDH is efficient and widely supported but broken by quantum computers via Shor's algorithm.",
    keyLength: "256-bit (ECDH), Kyber-768 (PQC)", mode: "Key Agreement",
    lifespan: "Short-term only; not beyond 2030", riskFlags: ["Harvest now, decrypt later quantum threat"],
    standards: ["NIST SP 800-56A", "NIST PQC Round 3"],
    pqc: "Adopt hybrid ECDH+Kyber immediately for 10+ year lifetime",
    risk: "high",
  },
  DataEncryption: {
    useCase: "Data Encryption", algorithm: "AES-256-GCM",
    rationale: "AES-256 provides strong margin against brute-force and Grover's quantum speedup.",
    keyLength: "256-bit", mode: "Authenticated Encryption (GCM)",
    lifespan: "Secure beyond 2040", riskFlags: [],
    standards: ["NIST FIPS 197", "NIST SP 800-38D"],
    pqc: "No migration needed; symmetric AES-256 is quantum-resistant",
    risk: "low",
  },
  MAC_SecOC: {
    useCase: "MAC / SecOC", algorithm: "AES-CMAC / CBC-MAC",
    rationale: "AUTOSAR SecOC standardizes AES-CMAC for in-vehicle message authentication with low overhead.",
    keyLength: "128-bit", mode: "Message Authentication Code",
    lifespan: "Secure until ~2035", riskFlags: ["Key freshness critical to prevent replay attacks"],
    standards: ["AUTOSAR SecOC", "NIST SP 800-38B"],
    pqc: "Symmetric MAC not quantum-vulnerable; no urgent migration",
    risk: "low",
  },
  Signatures: {
    useCase: "Signatures (OTA)", algorithm: "ECDSA P-256 or Ed25519",
    rationale: "Ed25519 offers strong security with fast verification for OTA update signing.",
    keyLength: "256-bit", mode: "Digital Signature",
    lifespan: "Secure until ~2030", riskFlags: ["Fully broken by quantum Shor's algorithm"],
    standards: ["RFC 8032", "NIST FIPS 186-5"],
    pqc: "Migrate to CRYSTALS-Dilithium or Falcon for 15+ year lifetime",
    risk: "medium",
  },
  RNG: {
    useCase: "RNG", algorithm: "Hardware TRNG + CTR_DRBG",
    rationale: "Cryptographic operations require properly seeded DRBG; software PRNGs are unsuitable.",
    keyLength: "N/A", mode: "Random Number Generation",
    lifespan: "Long-term valid if TRNG certified", riskFlags: ["Weak RNG undermines all other crypto"],
    standards: ["NIST SP 800-90A/B/C", "ISO 21434"],
    pqc: "Not applicable; RNG independent of PQC transition",
    risk: "low",
  },
  KeyManagement: {
    useCase: "Key Management", algorithm: "HSM + AES-256 key wrapping",
    rationale: "Strong algorithm with poor key handling is still insecure. HSM-backed storage is essential.",
    keyLength: "256-bit (wrapping key)", mode: "Key Wrapping / Storage",
    lifespan: "Depends on HSM lifecycle (10-15y)", riskFlags: ["No key rotation = common failure point"],
    standards: ["NIST SP 800-57", "ISO 21434"],
    pqc: "Ensure HSM firmware upgradable for PQC algorithms",
    risk: "medium",
  },
  HSMProvisioning: {
    useCase: "HSM Provisioning", algorithm: "ECC P-256 + AES-128 channel",
    rationale: "Covers manufacturing-time key injection — compromised provisioning undermines all downstream crypto.",
    keyLength: "256-bit (ECC), 128-bit (AES)", mode: "Secure Provisioning",
    lifespan: "Secure until ~2030", riskFlags: ["Factory provisioning is a common attack target"],
    standards: ["ISO 21434", "SAE J3101"],
    pqc: "Migrate provisioning key exchange to Kyber when tooling matures",
    risk: "medium",
  },
};

export default function KnowledgePage() {
  const [flipped, setFlipped] = useState({});
  const [search, setSearch] = useState("");

  const toggle = (key) => setFlipped((p) => ({ ...p, [key]: !p[key] }));

  const entries = Object.entries(KB).filter(([, v]) =>
    `${v.useCase} ${v.algorithm} ${v.mode}`.toLowerCase().includes(search.toLowerCase())
  );

  const riskBorder = (risk) => {
    if (risk === "high") return "glow-border-red";
    if (risk === "medium") return "glow-border-yellow";
    return "glow-border-green";
  };

  const riskBadge = (risk) => {
    if (risk === "high") return "bg-red-500/15 text-red-400";
    if (risk === "medium") return "bg-yellow-500/15 text-yellow-400";
    return "bg-green-500/15 text-green-400";
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 fade-in">
          <h1 className="text-3xl font-bold mb-3">
            <span className="gradient-text">Knowledge Base</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Explore all 10 cryptographic use case categories. Click a card to reveal algorithm details, standards, and PQC migration paths.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8 fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search use cases, algorithms..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-glass)] bg-[rgba(15,15,35,0.6)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-all"
            />
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger">
          {entries.map(([key, data]) => {
            const Icon = ICON_MAP[key] || Shield;
            const isFlipped = flipped[key];

            return (
              <div key={key} className={`flip-card ${isFlipped ? "flipped" : ""}`} style={{ minHeight: 280 }} onClick={() => toggle(key)}>
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className={`flip-card-front glass-card p-6 flex flex-col items-center justify-center text-center gap-4 ${riskBorder(data.risk)}`}>
                    <div className="p-3 rounded-xl bg-[rgba(56,189,248,0.08)] border border-[rgba(56,189,248,0.12)]">
                      <Icon className="w-8 h-8 text-[var(--accent-blue)]" />
                    </div>
                    <h3 className="text-lg font-semibold">{data.useCase}</h3>
                    <p className="font-mono text-sm text-[var(--accent-cyan)]">{data.algorithm}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${riskBadge(data.risk)}`}>
                      {data.risk} risk
                    </span>
                    <p className="text-[10px] text-[var(--text-muted)]">Click to flip →</p>
                  </div>

                  {/* Back */}
                  <div className="flip-card-back glass-card p-5 flex flex-col gap-2 overflow-y-auto text-left">
                    <h4 className="text-sm font-semibold gradient-text">{data.useCase}</h4>
                    <div className="text-[11px] space-y-1.5 text-[var(--text-secondary)]">
                      <p><strong className="text-[var(--text-muted)]">Mode:</strong> {data.mode}</p>
                      <p><strong className="text-[var(--text-muted)]">Key:</strong> {data.keyLength}</p>
                      <p><strong className="text-[var(--text-muted)]">Lifespan:</strong> {data.lifespan}</p>
                      <p className="leading-relaxed">{data.rationale}</p>
                      {data.riskFlags.length > 0 && (
                        <div className="flex items-start gap-1.5 text-yellow-400">
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>{data.riskFlags[0]}</span>
                        </div>
                      )}
                      <div className="pt-1 border-t border-[var(--border-glass)]">
                        <p className="text-[var(--accent-purple)]"><strong>PQC:</strong> {data.pqc}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {data.standards.map((s, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded border border-[var(--border-glass)] text-[var(--text-muted)]">{s}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-auto">Click to flip back</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
