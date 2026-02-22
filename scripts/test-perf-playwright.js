// Optional perf/integration test harness using Playwright.
// Requires: npm install playwright
// NOT run in CI. Use for manual performance verification only.
// See scripts/test-browser.js for the canonical gating test suite.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8081;

function contentType(filePath){
  const ext = path.extname(filePath).toLowerCase();
  switch(ext){
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.mjs': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.svg': return 'image/svg+xml';
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    case '.ico': return 'image/x-icon';
    case '.mp4': return 'video/mp4';
    case '.webm': return 'video/webm';
    case '.mp3': return 'audio/mpeg';
    case '.ogg': return 'audio/ogg';
    default: return 'application/octet-stream';
  }
}

function safeJoin(root, requestPath){
  const p = path.normalize(decodeURIComponent(requestPath.split('?')[0].split('#')[0]));
  const full = path.join(root, p);
  if (!full.startsWith(root)) return root; // prevent path traversal
  return full;
}

function createServer(){
  const server = http.createServer((req, res) => {
    try {
      let filePath = safeJoin(ROOT, req.url || '/');
      // If directory, try index.html
      let stat;
      if (fs.existsSync(filePath)) stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) filePath = path.join(filePath, 'index.html');
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType(filePath) });
      fs.createReadStream(filePath).pipe(res);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Server error');
    }
  });
  return server;
}

(async () => {
  const base = `http://localhost:${PORT}`;
  const server = createServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[dev-server] Serving ${ROOT} at ${base}`);

  const results = {};
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('console', msg => {
      try { console.log('PAGE-LOG:', msg.text()); } catch (e) {}
    });

    // Helper to run a harness page and capture #out innerText
    async function runHarness(pth, waitForTextRegex, timeout = 15000) {
      const url = `${base}${pth}`;
      console.log(`Navigating to ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });

      // Click Run button
      const runBtn = await page.$('#runBtn');
      if (!runBtn) {
        console.log('Run button not found on page.');
        return { success: false, reason: 'no-run-btn' };
      }
      await runBtn.click();

      // Wait for output area to include matching text
      try {
        await page.waitForFunction((regexSource) => {
          const out = document.getElementById('out');
          if (!out) return false;
          const txt = out.innerText || out.textContent || '';
          try { return new RegExp(regexSource, 'i').test(txt); } catch(e) { return false; }
        }, waitForTextRegex.source, { timeout });
      } catch (e) {
        // timed out
      }

      // read output
      const outHandle = await page.$('#out');
      const outText = outHandle ? (await outHandle.innerText()) : '(no #out)';
      return { success: true, out: outText };
    }

    // Perf harness
    results.perf = await runHarness('/tests/perf/imageLightbox-perf.html', /Average latency|no lightbox detected|FAIL/);

    // Integration harness
    results.integration = await runHarness('/tests/integration/imageLightbox-metrics.html', /ESC closed|lightbox image not found|FAIL/);

    console.log('--- HARNESS RESULTS ---');
    console.log('Perf result:');
    console.log(results.perf.out || JSON.stringify(results.perf));
    console.log('Integration result:');
    console.log(results.integration.out || JSON.stringify(results.integration));

    // Basic success detection
    const perfPass = /Average latency:\s*\d+\.\d+ms\s*—\s*(PASS|FAIL)/i.test(results.perf.out || '');
    const integrationMention = /ESC closed|lightbox image not found|FAIL/i.test(results.integration.out || '');
    if (!perfPass || !integrationMention) process.exitCode = 1;
  } catch (err) {
    console.error('Error running harnesses:', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
    server.close();
  }
})();
