#!/usr/bin/env node
// Canonical browser test runner for ChatExplorer.
// Uses Puppeteer. Run locally: node scripts/test-browser.js
// Also used by CI (.github/workflows/browser-tests.yml).
//
// Environment variables:
//   TEST_PORT  — HTTP server port (default: 8080)
'use strict';
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PORT = process.env.TEST_PORT || 8080;
const TEST_URL = `http://localhost:${PORT}/tests/index.html`;

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  // Forward browser console errors/warnings to Node stdout for debugging
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`[browser:${type}]`, msg.text());
    }
  });

  try {
    // Start JS coverage collection
    await page.coverage.startJSCoverage({ includeRawScriptCoverage: false });

    const res = await page.goto(TEST_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    if (!res || !res.ok()) {
      console.error(`Failed to load tests page (HTTP ${res && res.status()}): ${TEST_URL}`);
      await browser.close();
      process.exit(2);
    }

    // Wait for harness to run and render results
    await page.waitForSelector('#results', { timeout: 10000 });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const report = await page.evaluate(() => {
      const out = [];
      const results = document.getElementById('results');
      if (!results) return { lines: out, stacks: [] };
      for (const child of results.children) {
        out.push((child.textContent || '').trim());
      }
      const pres = Array.from(results.querySelectorAll('pre')).map(p => p.textContent || '');
      return { lines: out, stacks: pres };
    });

    // Stop coverage and write to disk
    const coverage = await page.coverage.stopJSCoverage();
    const coverageDir = path.join(process.cwd(), 'coverage');
    if (!fs.existsSync(coverageDir)) fs.mkdirSync(coverageDir, { recursive: true });
    fs.writeFileSync(
      path.join(coverageDir, 'coverage.json'),
      JSON.stringify(coverage, null, 2)
    );

    // Compute and print coverage summary
    let totalBytes = 0;
    let coveredBytes = 0;
    for (const entry of coverage) {
      if (!entry.url.includes('/src/')) continue;
      totalBytes += entry.text.length;
      for (const range of entry.ranges) {
        coveredBytes += range.end - range.start;
      }
    }
    const pct = totalBytes > 0 ? ((coveredBytes / totalBytes) * 100).toFixed(1) : '0.0';
    console.log(`Coverage: ${pct}% of src/ bytes (${coveredBytes}/${totalBytes})`);

    // Append to GitHub Actions step summary if available
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (summaryFile) {
      fs.appendFileSync(summaryFile, `## Coverage\n\n**${pct}%** of src/ bytes covered by tests.\n`);
    }

    // Report test results
    const failures = report.lines.filter(l => l.startsWith('✗') || l.startsWith('✖'));
    if (failures.length) {
      console.error(`\n${failures.length} test failure(s):`);
      for (const f of failures) console.error(`  ${f}`);
      for (const s of report.stacks) console.error('STACK:\n' + s);
      await browser.close();
      process.exit(1);
    }

    const passing = report.lines.filter(l => l.startsWith('✓') || l.startsWith('✔')).length;
    console.log(`All ${passing} tests passed.`);
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Error running browser tests:', err.message || err);
    await browser.close();
    process.exit(3);
  }
})();
