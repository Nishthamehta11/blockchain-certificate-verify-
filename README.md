# 🔗 Blockchain Certificate Verification System

A minimal, fully functional blockchain built in **pure Node.js** (no external dependencies) that issues and verifies tamper-proof academic certificates.

---

## 🎯 Problem Statement

Academic certificate fraud is a widespread problem. Fake degrees and forged transcripts cost organisations thousands in failed hires and legal disputes. Traditional databases are mutable — a dishonest administrator can silently alter records. This project uses a blockchain's immutability property to make certificate records **verifiable by anyone and alterable by no one**.

---

## 💡 Solution Overview

Each certificate is stored as a **block** in a local blockchain. Every block contains a SHA-256 hash of its own data **plus** the hash of the previous block. Changing any certificate's data invalidates its hash, which then breaks the chain link to every subsequent block — making tampering instantly detectable.

---

## 🛠 Tech Stack

| Layer       | Technology           |
|-------------|----------------------|
| Language    | JavaScript (Node.js) |
| Hashing     | Node `crypto` (built-in, no install) |
| Storage     | Local JSON file (`data/chain.json`) |
| Interface   | CLI (no framework needed) |
| Dependencies | **Zero** external packages |

---

## 📂 Folder Structure

```
blockchain-certificate-verify/
├── src/
│   ├── blockchain.js      # Core blockchain engine (Block + Blockchain classes)
│   └── index.js           # CLI entry point and command dispatcher
├── data/
│   └── chain.json         # Auto-generated — persisted blockchain data
├── docs/
│   └── report.md          # Project report (submission-ready)
├── package.json
└── README.md
```

---

## ⚡ Quick Start (copy-paste)

```bash
# 1. Clone or download the project
git clone https://github.com/your-username/blockchain-certificate-verify.git
cd blockchain-certificate-verify

# 2. No npm install needed — zero dependencies!

# 3. Run the demo (issues 3 sample certs and validates the chain)
node src/index.js

# 4. Issue a new certificate
node src/index.js issue CERT-101 "John Doe" "Machine Learning" "MIT"

# 5. Verify a certificate
node src/index.js verify CERT-101

# 6. List all certificates
node src/index.js list

# 7. Validate the full chain integrity
node src/index.js validate

# 8. Demo tamper detection (modifies block data without updating hash)
node src/index.js tamper 1
node src/index.js validate   # ← will now report chain broken
```

> **Requirement:** Node.js 14 or higher. Check with `node --version`.

---

## 📸 Sample Output

```
$ node src/index.js issue CERT-101 "Alice" "Data Science" "Stanford"

✅  Certificate Issued Successfully!
────────────────────────────────────────────────
  Block Index : 1
  Cert ID     : CERT-101
  Recipient   : Alice
  Course      : Data Science
  Issued By   : Stanford
  Block Hash  : a3f9c12e847d...

$ node src/index.js verify CERT-101

✅  Certificate Verified — Record is Authentic
────────────────────────────────────────────────
  Cert ID     : CERT-101
  Recipient   : Alice
  Course      : Data Science
  Issued By   : Stanford
  Chain Block : #1

$ node src/index.js tamper 1 && node src/index.js validate

⚠️   Tampering with Block #1 (demo)...
❌  Block #1 has been tampered — hash mismatch!
```

---

## 🔑 Key Concepts

- **Block:** Stores index, timestamp, certificate data, previous block's hash, and its own SHA-256 hash.
- **Chain:** Blocks are linked by `prevHash`. Altering any block breaks all subsequent links.
- **Validation:** Every block's stored hash is recomputed and compared; `prevHash` linkage is verified.
- **Persistence:** Chain is saved to `data/chain.json` so records survive process restarts.

---

## 📄 Licence

MIT — free for academic and personal use.
