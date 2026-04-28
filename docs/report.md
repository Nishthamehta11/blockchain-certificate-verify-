# Project Report

**Title:** Blockchain-Based Academic Certificate Verification System  
**Technology:** Node.js | SHA-256 Hashing | CLI Application  
**Submission Type:** Mini Project / Practical Assignment  

---

## 1. Introduction

The integrity of academic credentials is fundamental to hiring, admissions, and professional licensing. Yet certificate fraud remains alarmingly common — surveys suggest that nearly 30% of job applicants misrepresent their qualifications in some form. Traditional centralised databases, while convenient, present a single point of failure: a compromised or complicit administrator can silently alter records with no audit trail. This project proposes a blockchain-based solution that makes certificate records immutable and publicly verifiable without relying on any central authority.

---

## 2. Problem Statement

Educational institutions issue thousands of certificates annually. These certificates travel across borders and organisations, yet recipients and verifiers often have no reliable way to confirm authenticity beyond contacting the original issuer — a slow, manual, and error-prone process. The core problems are:

- **Mutability:** Records in conventional databases can be changed without detection.
- **Single Point of Trust:** Verification depends entirely on the issuing institution being reachable and cooperative.
- **No Audit Trail:** Modifications leave no cryptographic proof of tampering.
- **Cost and Delay:** Manual verification via email or post takes days to weeks.

A system is needed where once a certificate is issued, no party — including the issuer — can alter it retroactively without the change being immediately detectable.

---

## 3. Solution Overview

This project implements a minimal blockchain using Node.js and the built-in `crypto` module. Each certificate is stored as a **block** in an append-only chain. Every block contains:

1. The certificate payload (ID, recipient, course, issuer, date)
2. A SHA-256 hash computed from that payload and the previous block's hash
3. The previous block's hash (the "chain link")

Because each block's hash depends on its predecessor, modifying any historical record invalidates that block's hash and every subsequent link — making tampering instantly detectable by anyone running the `validate` command. The chain is persisted to a local JSON file, so records survive process restarts and can be committed to version control as an immutable audit log.

---

## 4. Tech Stack

| Component        | Tool / Library             | Reason                                      |
|------------------|----------------------------|---------------------------------------------|
| Language         | JavaScript (Node.js 14+)   | Widely available, beginner-friendly         |
| Hashing          | Node.js built-in `crypto`  | No external install; SHA-256 is industry standard |
| Persistence      | JSON file (fs module)      | Zero dependencies; human-readable           |
| Interface        | CLI (process.argv)         | Lightweight; no UI framework needed         |
| External packages | **None**                  | Runs on a bare Node.js installation         |

---

## 5. System Architecture

```
  ┌──────────────────────────────────────────────┐
  │                  CLI (index.js)               │
  │   issue | verify | list | validate | tamper  │
  └────────────────────┬─────────────────────────┘
                       │
  ┌────────────────────▼─────────────────────────┐
  │            Blockchain Engine (blockchain.js)  │
  │                                              │
  │  ┌─────────┐   ┌─────────┐   ┌─────────┐   │
  │  │ Block 0 │◄──│ Block 1 │◄──│ Block N │   │
  │  │ Genesis │   │ Cert A  │   │ Cert Z  │   │
  │  └─────────┘   └─────────┘   └─────────┘   │
  └────────────────────┬─────────────────────────┘
                       │
  ┌────────────────────▼─────────────────────────┐
  │          Persistence Layer (chain.json)       │
  └──────────────────────────────────────────────┘
```

Each block's hash is computed as:

```
hash = SHA256(index + timestamp + JSON(data) + prevHash)
```

---

## 6. Key Features Implemented

| Feature                  | Description                                                      |
|--------------------------|------------------------------------------------------------------|
| Certificate Issuance     | Appends a new block with certificate data to the chain           |
| Duplicate Prevention     | Rejects a second certificate with the same ID                    |
| Certificate Lookup       | Searches the chain by certificate ID                             |
| Tamper Detection         | Re-hashes every block and checks chain linkage on `validate`     |
| Data Persistence         | Saves chain to `data/chain.json` between runs                    |
| Demo Tamper Command      | Deliberately corrupts a block to demonstrate detection           |

---

## 7. How the Blockchain Prevents Fraud

Consider a certificate stored in Block #3. An attacker who gains access to `chain.json` and changes `recipient` from "Alice" to "Attacker" faces the following problem:

1. Block #3's stored hash was computed including "Alice". Changing it to "Attacker" changes the hash.
2. Block #4's `prevHash` field now no longer matches Block #3's new hash.
3. The `validate` command immediately reports: *"Block #3 has been tampered — hash mismatch."*

To cover the attack, the attacker would need to recompute the hash for Block #3, then update Block #4's `prevHash`, recompute Block #4's hash, and so on for every subsequent block — a computationally expensive chain rewrite that becomes infeasible as the chain grows, especially in a distributed setting with multiple node copies.

---

## 8. Sample Interaction

```
$ node src/index.js issue CERT-2024-001 "Priya Sharma" "Blockchain Basics" "TechAcademy"
✅  Certificate Issued Successfully!
  Block Index : 1 | Cert ID: CERT-2024-001 | Recipient: Priya Sharma

$ node src/index.js verify CERT-2024-001
✅  Certificate Verified — Record is Authentic

$ node src/index.js tamper 1
⚠️   Tampering with Block #1 (demo)...

$ node src/index.js validate
❌  Block #1 has been tampered — hash mismatch!
```

---

## 9. Limitations and Future Scope

**Current Limitations:**
- Single-node only — no peer-to-peer network; a single file can be replaced entirely.
- No digital signatures — the issuer's identity is stored as plain text, not cryptographically proved.
- No Proof-of-Work — blocks are added instantly; no mining/consensus mechanism.

**Future Enhancements:**
- Add RSA/ECDSA digital signatures so only the issuer's private key can issue certificates.
- Implement a REST API (Express.js) to allow remote verification via HTTP.
- Migrate to a distributed ledger (e.g., Hyperledger Fabric) for a production deployment.
- Add a QR code on PDF certificates that encodes the cert ID for one-scan verification.

---

## 10. Conclusion

This project demonstrates that even a minimal blockchain implementation meaningfully improves the integrity and verifiability of academic records compared to a conventional database. Using only Node.js built-in modules, the system issues certificates as tamper-evident chain entries and exposes a simple CLI for issuance, lookup, and validation. The core principles — hash chaining, immutability, and transparent validation — are identical to those used in production blockchain platforms, making this a valuable educational foundation for further study.

---

*Submitted as part of [Course Name] | [Institution] | [Semester/Year]*
