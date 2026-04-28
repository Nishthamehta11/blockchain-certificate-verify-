#!/usr/bin/env node
/**
 * index.js — CLI entry point for the Certificate Verification Blockchain
 *
 * Commands:
 *   node index.js issue   <certId> <recipient> <course> <issuer>
 *   node index.js verify  <certId>
 *   node index.js list
 *   node index.js validate
 *   node index.js tamper  <blockIndex>   (demo only — shows tamper detection)
 *
 * Run `node index.js` with no arguments for an interactive demo.
 */

const { Blockchain } = require("./blockchain");

// Colourful console helpers (no external dependency — plain ANSI codes)
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
};

const chain = new Blockchain();
const [,, command, ...args] = process.argv;

// ---------------------------------------------------------------------------
// Command dispatcher
// ---------------------------------------------------------------------------
switch (command) {

  // ── ISSUE ─────────────────────────────────────────────────────────────────
  case "issue": {
    const [certId, recipient, course, issuer] = args;
    if (!certId || !recipient || !course || !issuer) {
      console.error(c.red("Usage: node index.js issue <certId> <recipient> <course> <issuer>"));
      process.exit(1);
    }

    // Check for duplicate certificate ID
    if (chain.findCertificate(certId)) {
      console.error(c.red(`Certificate ID "${certId}" already exists on chain.`));
      process.exit(1);
    }

    const block = chain.addCertificate({ certId, recipient, course, issuer, issuedOn: new Date().toISOString() });

    console.log(c.green("\n✅  Certificate Issued Successfully!"));
    console.log("─".repeat(48));
    console.log(`  Block Index : ${block.index}`);
    console.log(`  Cert ID     : ${c.cyan(block.data.certId)}`);
    console.log(`  Recipient   : ${block.data.recipient}`);
    console.log(`  Course      : ${block.data.course}`);
    console.log(`  Issued By   : ${block.data.issuer}`);
    console.log(`  Issued On   : ${block.data.issuedOn}`);
    console.log(`  Block Hash  : ${c.yellow(block.hash.substring(0, 32))}...`);
    console.log("─".repeat(48));
    break;
  }

  // ── VERIFY ────────────────────────────────────────────────────────────────
  case "verify": {
    const [certId] = args;
    if (!certId) {
      console.error(c.red("Usage: node index.js verify <certId>"));
      process.exit(1);
    }

    const block = chain.findCertificate(certId);
    if (!block) {
      console.log(c.red(`\n❌  Certificate "${certId}" NOT FOUND on the blockchain.`));
      break;
    }

    // Even if found, confirm the chain hasn't been tampered with
    const { valid } = chain.validateChain();
    if (!valid) {
      console.log(c.red("\n⚠️   Chain integrity compromised — certificate cannot be trusted!"));
      break;
    }

    console.log(c.green("\n✅  Certificate Verified — Record is Authentic"));
    console.log("─".repeat(48));
    console.log(`  Cert ID     : ${c.cyan(block.data.certId)}`);
    console.log(`  Recipient   : ${block.data.recipient}`);
    console.log(`  Course      : ${block.data.course}`);
    console.log(`  Issued By   : ${block.data.issuer}`);
    console.log(`  Issued On   : ${block.data.issuedOn}`);
    console.log(`  Chain Block : #${block.index}`);
    console.log(`  Block Hash  : ${c.yellow(block.hash.substring(0, 32))}...`);
    console.log("─".repeat(48));
    break;
  }

  // ── LIST ──────────────────────────────────────────────────────────────────
  case "list": {
    const certs = chain.listAll();
    if (certs.length === 0) {
      console.log(c.yellow("\nNo certificates issued yet."));
      break;
    }
    console.log(c.bold(`\n📋  All Certificates on Chain (${certs.length} total)`));
    console.log("─".repeat(60));
    certs.forEach((block) => {
      const d = block.data;
      console.log(
        `  [Block #${block.index}]  ${c.cyan(d.certId)}  |  ${d.recipient}  |  ${d.course}  |  ${d.issuer}`
      );
    });
    console.log("─".repeat(60));
    break;
  }

  // ── VALIDATE ──────────────────────────────────────────────────────────────
  case "validate": {
    const result = chain.validateChain();
    if (result.valid) {
      console.log(c.green(`\n✅  ${result.message}`));
    } else {
      console.log(c.red(`\n❌  ${result.message}`));
    }
    console.log(`   Chain length: ${chain.chain.length} block(s)`);
    break;
  }

  // ── TAMPER (demo only) ────────────────────────────────────────────────────
  case "tamper": {
    // This command intentionally corrupts a block to show tamper detection.
    const idx = parseInt(args[0]);
    if (isNaN(idx) || idx < 1 || idx >= chain.chain.length) {
      console.error(c.red(`Provide a block index between 1 and ${chain.chain.length - 1}`));
      process.exit(1);
    }

    console.log(c.yellow(`\n⚠️   Tampering with Block #${idx} (demo)...`));
    chain.chain[idx].data.recipient = "HACKED_NAME";
    // NOTE: We intentionally do NOT recompute the hash — simulating a real attack
    console.log(c.red("   Data changed. Hash NOT updated (simulating real attack)."));
    console.log(c.yellow("   Now run: node index.js validate   to see detection."));
    break;
  }

  // ── DEFAULT: run full interactive demo ────────────────────────────────────
  default: {
    console.log(c.bold(c.cyan("\n🔗  Blockchain Certificate Verifier — Demo\n")));

    // Issue three sample certificates
    const samples = [
      ["CERT-2024-001", "Alice Johnson",    "Web Development Bootcamp",    "TechAcademy"],
      ["CERT-2024-002", "Bob Sharma",       "Data Science Fundamentals",   "DataInstitute"],
      ["CERT-2024-003", "Priya Patel",      "Cybersecurity Essentials",    "CyberCampus"],
    ];

    console.log("Issuing 3 sample certificates...\n");
    for (const s of samples) {
      if (!chain.findCertificate(s[0])) {
        const b = chain.addCertificate({
          certId: s[0], recipient: s[1], course: s[2], issuer: s[3],
          issuedOn: new Date().toISOString(),
        });
        console.log(`  Issued: ${c.cyan(s[0])} → Block #${b.index}`);
      } else {
        console.log(`  Skipped (already on chain): ${c.cyan(s[0])}`);
      }
    }

    // Validate the chain
    console.log("\n" + c.bold("Running chain validation..."));
    const { valid, message } = chain.validateChain();
    console.log(valid ? c.green(`  ✅ ${message}`) : c.red(`  ❌ ${message}`));

    // Verify one certificate
    console.log(`\n${c.bold("Verifying CERT-2024-002...")}`);
    const found = chain.findCertificate("CERT-2024-002");
    if (found) {
      console.log(c.green(`  ✅ Found: ${found.data.recipient} | ${found.data.course}`));
    }

    console.log(c.yellow("\nTry these commands:"));
    console.log("  node index.js issue  CERT-001 'John Doe' 'AI Basics' 'MIT'");
    console.log("  node index.js verify CERT-001");
    console.log("  node index.js list");
    console.log("  node index.js validate");
    console.log("  node index.js tamper 1    ← demo tamper detection\n");
    break;
  }
}
