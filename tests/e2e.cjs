// End-to-end check: every lesson in both books renders, every task's solution
// passes its own check, every quiz can be answered, and core interactions work.
const { chromium } = require(process.env.PW_PATH || 'playwright');
const BASE = process.env.BASE_URL || 'http://localhost:8765';

(async () => {
  const browser = await chromium.launch();
  let failures = 0;
  const fail = (m) => { failures++; console.log('FAIL', m); };

  for (const track of ['excel', 'sheets']) {
    const page = await browser.newPage();
    page.on('pageerror', (e) => fail(`${track} pageerror: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') fail(`${track} console: ${m.text()}`); });
    page.on('dialog', (d) => d.accept());
    await page.goto(`${BASE}/book.html?track=${track}`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    const ids = await page.$$eval('#toc a[data-id]', (as) => as.map((a) => a.dataset.id));
    console.log(`${track}: ${ids.length} lessons`);
    for (const id of ids) {
      await page.goto(`${BASE}/book.html?track=${track}#${id}`);
      await page.waitForSelector('.lesson h1');
      const grids = await page.$$('.sg');
      for (let gi = 0; gi < grids.length; gi++) {
        const solves = await grids[gi].$$('[data-solve]');
        for (const b of solves) await b.click();
        const states = await grids[gi].$$eval('.sg-task', (ls) => ls.map((l) => l.classList.contains('done')));
        states.forEach((d, i) => { if (!d) fail(`${track}/${id} grid ${gi} task ${i + 1} not done after solutions`); });
        const errs = await grids[gi].$$eval('td.sg-err', (t) => t.map((x) => x.dataset.a + '=' + x.textContent));
        if (errs.length && id !== 'autosum-errors') fail(`${track}/${id} error cells: ${errs.join(', ')}`);
      }
      const quizzes = await page.$$('.quiz');
      for (const q of quizzes) {
        const n = (await q.$$('.quiz-opt')).length;
        let ok = false;
        for (let i = 0; i < n && !ok; i++) {
          const opt = (await q.$$('.quiz-opt'))[i];
          if (await opt.isDisabled()) continue;
          await opt.click();
          ok = await q.$eval('.quiz-fb', (f) => f.classList.contains('ok'));
        }
        if (!ok) fail(`${track}/${id} quiz could not be answered`);
      }
      if (grids.length || quizzes.length) {
        const done = await page.$eval(`#toc a[data-id="${id}"]`, (a) => a.classList.contains('done'));
        if (!done) fail(`${track}/${id} not marked complete after all exercises`);
      }
    }
    // Persistence: reload a lesson and confirm solved work survived
    await page.goto(`${BASE}/book.html?track=${track}#basic-functions`);
    await page.reload();
    await page.waitForSelector('.sg');
    const kept = await page.$$eval('.sg-task.done', (l) => l.length);
    if (kept !== 5) fail(`${track} persistence: expected 5 done tasks after reload, got ${kept}`);
    await page.close();
  }

  // ---- Real interactions (keyboard + mouse) on a fresh profile ----
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on('pageerror', (e) => fail(`interaction pageerror: ${e.message}`));
  await page.goto(`${BASE}/book.html?track=excel#relative`);
  await page.waitForSelector('.sg');
  const cell = (a) => page.locator(`.sg td[data-a="${a}"]`).first();
  await cell('D2').click();
  await page.keyboard.type('=b2*c2');
  await page.keyboard.press('Enter');
  if ((await cell('D2').textContent()) !== '10') fail('typed formula did not compute: ' + await cell('D2').textContent());
  await cell('D2').click();
  await cell('D6').click({ modifiers: ['Shift'] });
  await page.keyboard.press('Control+d');
  if ((await cell('D6').textContent()) !== '12') fail('Ctrl+D fill down failed: ' + await cell('D6').textContent());
  // formula bar shows shifted formula
  await cell('D5').click();
  const fb = await page.inputValue('.sg-finput');
  if (fb !== '=B5*C5') fail('formula bar shows ' + fb);
  // click-to-insert reference while typing
  await cell('D7').click();
  await page.keyboard.type('=SUM(');
  await cell('D2').hover();
  await page.mouse.down();
  await cell('D6').hover();
  await page.mouse.up();
  await page.keyboard.press('Enter');
  if ((await cell('D7').textContent()) !== '68') fail('click/drag reference insert failed: ' + await cell('D7').textContent());
  const doneCount = await page.$$eval('.sg-task.done', (l) => l.length);
  if (doneCount !== 3) fail('relative lesson tasks done via interaction: ' + doneCount);

  // Fill handle drag on the AutoFill lesson
  await page.goto(`${BASE}/book.html?track=excel#copy-fill`);
  await page.waitForSelector('.sg');
  await cell('A2').click();
  const h = page.locator('.sg-handle').first();
  const hb = await h.boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.mouse.down();
  await cell('A7').hover();
  await page.mouse.up();
  if ((await cell('A7').textContent()) !== 'Jun') fail('fill handle series failed: ' + await cell('A7').textContent());
  // Copy/paste
  await cell('D2').click();
  await page.keyboard.press('Control+c');
  await cell('D3').click();
  await cell('D5').click({ modifiers: ['Shift'] });
  await page.keyboard.press('Control+v');
  if ((await cell('D5').textContent()) !== 'Hi') fail('copy/paste failed');
  // Undo
  await page.keyboard.press('Control+z');
  if ((await cell('D5').textContent()) !== '') fail('undo failed');

  // F4 toggles $ while editing
  await page.goto(`${BASE}/book.html?track=excel#absolute`);
  await page.waitForSelector('.sg');
  await cell('C4').click();
  await page.keyboard.type('=B4*B1');
  await page.keyboard.press('F4');
  await page.keyboard.press('Enter');
  await cell('C4').click();
  if ((await page.inputValue('.sg-finput')) !== '=B4*$B$1') fail('F4 toggle failed: ' + await page.inputValue('.sg-finput'));

  // Sheets: Enter starts editing
  await page.goto(`${BASE}/book.html?track=sheets#cells`);
  await page.waitForSelector('.sg');
  await cell('B2').click();
  await page.keyboard.type('Hello');
  await page.keyboard.press('Enter');
  await cell('B2').click();
  await page.keyboard.press('Enter');
  if (!(await page.locator('.sg-editor').first().isVisible())) fail('sheets Enter did not start editing');
  await page.keyboard.press('Escape');

  // Landing page
  await page.goto(`${BASE}/index.html`);
  const cards = await page.$$('.book-card');
  if (cards.length !== 2) fail('landing cards: ' + cards.length);

  // Mobile layout smoke test
  const m = await browser.newPage({ viewport: { width: 390, height: 800 } });
  m.on('pageerror', (e) => fail(`mobile pageerror: ${e.message}`));
  await m.goto(`${BASE}/book.html?track=sheets#vlookup`);
  await m.waitForSelector('.sg');
  await m.click('#nav-toggle');
  if (!(await m.evaluate(() => document.body.classList.contains('nav-open')))) fail('mobile nav did not open');
  await m.waitForTimeout(400);
  await m.screenshot({ path: 'tests/shot-mobile-nav.png' });
  await m.click('#nav-scrim', { position: { x: 370, y: 400 } });
  await m.waitForTimeout(400);
  const sw = await m.evaluate(() => document.documentElement.scrollWidth);
  if (sw > 392) fail('mobile horizontal overflow: scrollWidth ' + sw);
  await m.screenshot({ path: 'tests/shot-mobile.png', fullPage: false });

  const d = await browser.newPage({ viewport: { width: 1360, height: 900 } });
  await d.goto(`${BASE}/book.html?track=excel#budget`);
  await d.waitForSelector('.sg');
  await d.screenshot({ path: 'tests/shot-desktop.png' });
  await d.goto(`${BASE}/index.html`);
  await d.screenshot({ path: 'tests/shot-landing.png' });

  await browser.close();
  console.log(failures ? `\n${failures} failure(s)` : '\nALL E2E CHECKS PASSED');
  process.exit(failures ? 1 : 0);
})();
