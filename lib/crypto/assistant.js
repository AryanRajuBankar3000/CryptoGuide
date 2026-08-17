import { KNOWLEDGE_BASE } from './data'

function find(...keywords) {
  return KNOWLEDGE_BASE.filter((e) =>
    keywords.some(
      (k) =>
        e.algorithm.toLowerCase().includes(k) ||
        e.primaryUse.toLowerCase().includes(k) ||
        e.automotiveRelevance.toLowerCase().includes(k),
    ),
  )
}

export function answer(question) {
  const q = question.toLowerCase()

  if (/(ota|update)/.test(q)) {
    return {
      text: 'For OTA update security, sign packages with ECDSA P-256 and verify integrity with SHA-256 before installation. Encrypt packages in transit with AES-256-GCM and enforce anti-rollback. For long-lifecycle vehicles, plan a hybrid ECDSA + ML-DSA migration so update signing stays trustworthy against future quantum attacks.',
      refs: [
        { label: 'Signing', value: 'ECDSA P-256 (FIPS 186-5)' },
        { label: 'Integrity', value: 'SHA-256 (FIPS 180-4)' },
        { label: 'Encryption', value: 'AES-256-GCM (SP 800-38D)' },
      ],
    }
  }

  if (/(secoc|can|in-vehicle|network message|mac)/.test(q)) {
    return {
      text: 'For in-vehicle network authentication (AUTOSAR SecOC), use AES-CMAC-128 with a freshness counter to prevent replay. Symmetric MACs are efficient on constrained ECUs and retain a strong margin against quantum attacks, so no PQC migration is required for this control.',
      refs: [
        { label: 'MAC', value: 'AES-CMAC-128 (SP 800-38B)' },
        { label: 'Freshness', value: 'Monotonic counter / timestamp' },
      ],
    }
  }

  if (/(pqc|quantum|migration|post-quantum)/.test(q)) {
    return {
      text: 'Post-quantum migration is most urgent for asymmetric cryptography (ECDSA signing and ECDH key exchange), which is vulnerable to future quantum computers. The recommended path is: (1) adopt crypto-agility, (2) deploy hybrid schemes (ECDH + ML-KEM, ECDSA + ML-DSA), then (3) move to full PQC as ecosystem support matures. Symmetric primitives (AES-256, SHA-256) already have a strong quantum margin.',
      refs: [
        { label: 'PQC KEM', value: 'ML-KEM-768 (FIPS 203)' },
        { label: 'PQC Signature', value: 'ML-DSA-65 (FIPS 204)' },
      ],
    }
  }

  if (/(compare|vs|versus|difference)/.test(q) && /(gcm|cmac|aes)/.test(q)) {
    return {
      text: 'AES-256-GCM is authenticated encryption (confidentiality + integrity) used for protecting data at rest and in transit. AES-CMAC-128 provides only message authentication (integrity/authenticity, no confidentiality) and is preferred for lightweight in-vehicle SecOC. Use GCM when you must encrypt payloads; use CMAC when you only need to authenticate messages efficiently.',
      refs: [
        { label: 'AES-256-GCM', value: 'AEAD — encrypt + authenticate' },
        { label: 'AES-CMAC-128', value: 'MAC only — authenticate' },
      ],
    }
  }

  if (/(hsm|key storage|secure element|protect)/.test(q)) {
    return {
      text: 'An HSM (or hardware security module / secure element) should protect long-lived private and root keys, provide secure key generation and storage, and accelerate cryptographic operations. Key provisioning, signing keys for firmware and OTA, and root-of-trust material should never leave the HSM boundary. Verify the HSM firmware roadmap for PQC algorithm support before committing to a long-lifecycle design.',
      refs: [{ label: 'Standards', value: 'EVITA / AUTOSAR CSM' }],
    }
  }

  if (/(v2x|vehicle-to)/.test(q)) {
    return {
      text: 'V2X messages should be authenticated with ECDSA P-256 short-lived certificates, protected against replay with timestamps, and support pseudonymity for privacy. Use ECDH for session key establishment. Given the long infrastructure lifetime, plan a hybrid PQC path (ML-KEM for key exchange) for future deployments.',
      refs: [
        { label: 'Signing', value: 'ECDSA P-256' },
        { label: 'Key Exchange', value: 'ECDH → hybrid ML-KEM' },
      ],
    }
  }

  if (/(secure boot|boot|firmware)/.test(q)) {
    return {
      text: 'Secure boot verifies each firmware image with an ECDSA P-256 signature over a SHA-256 digest before execution, backed by anti-rollback protection and secure key storage (ideally an HSM). For extended vehicle lifetimes, prepare a hybrid signing scheme so the root of trust remains valid post-quantum.',
      refs: [
        { label: 'Signature', value: 'ECDSA P-256 + SHA-256' },
        { label: 'Storage', value: 'HSM / secure key storage' },
      ],
    }
  }

  const matches = find(...q.split(/\s+/).filter((w) => w.length > 2))
  if (matches.length) {
    const e = matches[0]
    return {
      text: `${e.algorithm} — ${e.details}`,
      refs: [
        { label: 'Primary Use', value: e.primaryUse },
        { label: 'PQC Status', value: e.pqcStatus },
        { label: 'Reference', value: e.reference },
      ],
    }
  }

  return {
    text: 'I can help with automotive cryptography selection — secure boot, OTA updates, V2X, SecOC/CAN authentication, data encryption, key exchange, hashing, RNG, HSM usage, and post-quantum migration. Try asking about one of these areas, or use a suggested prompt below.',
  }
}
