const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const url = 'http://localhost:8080/tests/index.html';
  try {
    const res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    if (!res || !res.ok()) {
      console.error('Failed to load tests page:', res && res.status());
      await browser.close();
      process.exit(2);
    }

    // Wait briefly for harness to run tests and render results
    await page.waitForSelector('#results', { timeout: 10000 });
    // give harness time to append results
    // page.waitForTimeout may not exist in all Puppeteer versions; use a plain sleep
    await new Promise((res) => setTimeout(res, 1000));

    const report = await page.evaluate(() => {
      const out = [];
      const results = document.getElementById('results');
      if (!results) return out;
      for (const child of results.children) {
        const text = child.textContent || '';
        out.push(text.trim());
      }
      // Also collect any <pre> stack traces appended
      const pres = Array.from(results.querySelectorAll('pre')).map(p => p.textContent || '');
      return { lines: out, stacks: pres };
    });

    const failures = report.lines.filter(l => l.startsWith('✗') || l.startsWith('✖'));
    if (failures.length) {
      console.error('Test failures:');
      for (const f of failures) console.error(f);
      for (const s of report.stacks) console.error('STACK:\n' + s);
      await browser.close();
      process.exit(1);
    }

    console.log('All tests passed.');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Error running browser tests:', err);
    await browser.close();
    process.exit(3);
  }
})();
