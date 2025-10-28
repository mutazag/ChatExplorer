const { chromium } = require('playwright');

(async () => {
  const base = 'http://localhost:8081';
  const results = {};
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('console', msg => {
      try { console.log('PAGE-LOG:', msg.text()); } catch (e) {}
    });

    // Helper to run a harness page and capture #out innerText
    async function runHarness(path, waitForTextRegex, timeout = 15000) {
      const url = `${base}${path}`;
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
  } catch (err) {
    console.error('Error running harnesses:', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
