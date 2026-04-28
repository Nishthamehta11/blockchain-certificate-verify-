/**
 * blockchain.js
 * Core blockchain engine for certificate verification system.
 * Implements a minimal but functional blockchain with:
 *   - SHA-256 hashing via Node's built-in 'crypto' module
 *   - Block chaining (each block stores previous block's hash)
 *   - Chain integrity validation
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/chain.json");

// ---------------------------------------------------------------------------
// Block class — the fundamental unit of the chain
// ---------------------------------------------------------------------------
class Block {
  /**
   * @param {number}  index      - Position in the chain (0 = genesis)
   * @param {string}  timestamp  - ISO date string of block creation
   * @param {object}  data       - The certificate payload stored in this block
   * @param {string}  prevHash   - Hash of the immediately preceding block
   */
  constructor(index, timestamp, data, prevHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.prevHash = prevHash;
    // Hash is computed AFTER all fields are set
    this.hash = this.computeHash();
  }

  /**
   * Produces a deterministic SHA-256 fingerprint of this block's contents.
   * Any change to data, timestamp, or prevHash will produce a completely
   * different hash — this is what makes tampering detectable.
   */
  computeHash() {
    const content =
      this.index +
      this.timestamp +
      JSON.stringify(this.data) +
      this.prevHash;
    return crypto.createHash("sha256").update(content).digest("hex");
  }
}

// ---------------------------------------------------------------------------
// Blockchain class — manages the ordered list of blocks
// ---------------------------------------------------------------------------
class Blockchain {
  constructor() {
    // Try to load an existing chain from disk; otherwise start fresh
    this.chain = this._load();
  }

  /** Creates the first block (genesis block) with no previous hash. */
  _createGenesis() {
    return new Block(0, new Date().toISOString(), { note: "Genesis Block" }, "0");
  }

  /** Persists the chain to a JSON file so data survives between runs. */
  _save() {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(this.chain, null, 2));
  }

  /** Loads chain from disk, or returns a fresh chain with only genesis. */
  _load() {
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE));
      // Re-hydrate plain objects into Block instances
      return raw.map(
        (b) => Object.assign(new Block(0, "", {}, ""), b)
      );
    }
    const genesis = this._createGenesis();
    return [genesis];
  }

  /** Convenience getter for the most recently added block. */
  getLatest() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Adds a new certificate record to the chain.
   * @param {object} certData - Certificate fields (id, recipient, course, date, issuer)
   * @returns {Block} The newly created block
   */
  addCertificate(certData) {
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      certData,
      this.getLatest().hash          // chain link: store predecessor's hash
    );
    this.chain.push(newBlock);
    this._save();                    // persist immediately
    return newBlock;
  }

  /**
   * Validates the entire chain by checking two rules for every block
   * (except genesis):
   *   1. The stored hash still matches a freshly computed hash
   *      (detects data tampering inside a block).
   *   2. prevHash matches the actual hash of the prior block
   *      (detects block reordering or insertion attacks).
   * @returns {{ valid: boolean, message: string }}
   */
  validateChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // Rule 1: internal integrity
      if (current.hash !== current.computeHash()) {
        return {
          valid: false,
          message: `Block #${i} has been tampered — hash mismatch!`,
        };
      }

      // Rule 2: chain linkage
      if (current.prevHash !== previous.hash) {
        return {
          valid: false,
          message: `Block #${i} is broken from the chain — prevHash mismatch!`,
        };
      }
    }
    return { valid: true, message: "Chain is valid. All records are intact." };
  }

  /**
   * Looks up a certificate by its unique ID.
   * @param {string} certId - The certificate ID to search for
   * @returns {Block|null} The block containing the certificate, or null
   */
  findCertificate(certId) {
    return (
      this.chain.find(
        (block) => block.data && block.data.certId === certId
      ) || null
    );
  }

  /** Returns a summary of every certificate (skips genesis block). */
  listAll() {
    return this.chain.slice(1); // index 0 is genesis
  }
}

module.exports = { Blockchain, Block };
