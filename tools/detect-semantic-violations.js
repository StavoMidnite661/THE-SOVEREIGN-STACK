#!/usr/bin/env node
/**
 * SOVR Semantic Violation Detector
 * Scans codebase for SOVR_BLACKLIST_V2.md violations
 * 
 * Usage: node detect-semantic-violations.js [directory]
 */

const fs = require('fs');
const path = require('path');

// SOVR BLACKLIST V2 - Forbidden Terms
const FORBIDDEN_TERMS = {
  'System Authority': [
    'source of truth database',
    'central ledger',
    'master record',
    'authoritative source',
    'primary system'
  ],
  'Payment Processing': [
    'payment processor',
    'payment gateway',
    'payment system',
    'payment network',
    'payment rail'
  ],
  'Custodial Language': [
    'user funds',
    'system balance',
    'shared pool',
    'reserve account',
    'custody wallet'
  ],
  'Balance Mutation': [
    'account balance update',
    'manual adjustment',
    'admin override',
    'discretionary edit',
    'force settlement'
  ],
  'Fiat Privilege': [
    'fiat-backed',
    'usd-backed',
    'dollar-pegged',
    'redemption in usd'
  ],
  'Reversal Operations': [
    'chargeback',
    'refund',
    'rollback',
    'reversal',
    'undo transaction'
  ]
};

// Allowed exceptions (account names, etc)
const ALLOWED_EXCEPTIONS = [
  'ach-settlement',  // Account name
  'stripe-settlement', // Account name  
  'settlement_reference', // External identifier
  'settlementref' // External identifier
];

function isException(match, context) {
  const lowerContext = context.toLowerCase();
  return ALLOWED_EXCEPTIONS.some(ex => lowerContext.includes(ex));
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];
  const lines = content.split('\n');

  Object.entries(FORBIDDEN_TERMS).forEach(([category, terms]) => {
    terms.forEach(term => {
      lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes(term.toLowerCase())) {
          // Check if it's an exception
          if (!isException(term, line)) {
            violations.push({
              file: filePath,
              line: index + 1,
              category,
              term,
              context: line.trim()
            });
          }
        }
      });
    });
  });

  return violations;
}

function scanDirectory(dir, violations = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip node_modules, .git,  archives
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'archive') {
      continue;
    }

    if (entry.isDirectory()) {
      scanDirectory(fullPath, violations);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      // Scan code files only
      if (['.ts', '.tsx', '.js', '.jsx', '.sol', '.py'].includes(ext)) {
        const fileViolations = scanFile(fullPath);
        violations.push(...fileViolations);
      }
    }
  }

  return violations;
}

// Main execution
const targetDir = process.argv[2] || '.';
console.log(`🔍 Scanning ${targetDir} for SOVR blacklist violations...\\n`);

const violations = scanDirectory(targetDir);

if (violations.length === 0) {
  console.log('✅ No blacklist violations found!');
} else {
  console.log(`❌ Found ${violations.length} violations:\\n`);
  
  // Group by category
  const byCategory = {};
  violations.forEach(v => {
    if (!byCategory[v.category]) byCategory[v.category] = [];
    byCategory[v.category].push(v);
  });

  Object.entries(byCategory).forEach(([category, vList]) => {
    console.log(`\\n### ${category} (${vList.length} violations)`);
    vList.forEach(v => {
      console.log(`  ${v.file}:${v.line}`);
      console.log(`    Term: "${v.term}"`);
      console.log(`    Context: ${v.context.substring(0, 80)}...`);
    });
  });
  
  process.exit(1);
}
