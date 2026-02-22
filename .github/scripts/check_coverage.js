#!/usr/bin/env node
// Check that JS coverage meets a minimum threshold.
// Usage: node .github/scripts/check_coverage.js [--threshold <number>]
// Coverage data is read from coverage/coverage.json (written by test-browser.js).
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const thresholdIdx = args.indexOf('--threshold');
const THRESHOLD = thresholdIdx !== -1 ? parseFloat(args[thresholdIdx + 1]) : 80;

const coverageFile = path.join(process.cwd(), 'coverage', 'coverage.json');
if (!fs.existsSync(coverageFile)) {
  console.error('Coverage file not found at coverage/coverage.json');
  console.error('Run the test suite first: node scripts/test-browser.js');
  process.exit(1);
}

const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
let totalBytes = 0;
let coveredBytes = 0;

for (const entry of coverage) {
  // Only count source files
  if (!entry.url.includes('/src/')) continue;
  totalBytes += entry.text.length;
  for (const range of entry.ranges) {
    coveredBytes += range.end - range.start;
  }
}

const pct = totalBytes > 0 ? (coveredBytes / totalBytes) * 100 : 0;
console.log(`Coverage: ${pct.toFixed(1)}% of src/ bytes (threshold: ${THRESHOLD}%)`);

if (pct < THRESHOLD) {
  console.error(`FAIL: Coverage ${pct.toFixed(1)}% is below the required threshold of ${THRESHOLD}%`);
  process.exit(1);
}

console.log('PASS: Coverage meets threshold.');
process.exit(0);
