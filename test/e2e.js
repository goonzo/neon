// Headless smoke test: node test/e2e.js [outdir]
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path');
const OUT = process.argv[2] || path.join(__dirname, 'shots');
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.stack));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.join(__dirname, '..', 'index.html'));
  await page.waitForTimeout(500);
  const shot = (n) => page.screenshot({ path: path.join(OUT, n + '.png') });
  await shot('01_title');
  await page.click('text=起動する');
  await page.waitForTimeout(600);
  await shot('02_intro');
  await page.click('text=スキップ');
  await page.waitForTimeout(400);
  await shot('03_base');
  for (const t of ['仲間', '施設', '記録']) { await page.click(`.base-tabs >> text=${t}`); await page.waitForTimeout(200); await shot('04_base_' + t); }
  await page.click('.base-tabs >> text=出撃');
  await page.click('text=出撃準備へ');
  await page.waitForTimeout(300);
  await shot('05_sortie');
  await page.click('text=出撃！');
  await page.waitForTimeout(400);
  await shot('06_actintro');
  await page.click('.panel >> text=クリックで進む');
  await page.waitForTimeout(100);
  await page.click('.panel >> text=クリックで進む');
  await page.waitForTimeout(200);
  if (await page.$('.actintro')) await page.click('.panel >> text=クリックで進む');
  await page.waitForTimeout(400);
  await shot('07_map');
  await page.click('.mnode.avail');
  await page.waitForTimeout(1200);
  await shot('08a_tutorial');
  await page.click('text=はじめる');
  await page.waitForTimeout(1800);
  await shot('08_combat');
  // auto-play the combat via exposed hooks
  for (let step = 0; step < 400; step++) {
    const st = await page.evaluate(() => {
      const cb = G.UI._combat;
      if (!document.querySelector('.combat')) return 'done';
      if (!cb || cb.busy || !cb.inputHero) return 'wait';
      const u = cb.inputHero, C = cb.C;
      const i = u.hand.findIndex((c) => G.E.canPlay(C, u, c));
      if (i < 0) { cb.endHeroTurn(); return 'end'; }
      const c = u.hand[i];
      if (G.E.needsTarget(c)) { const t = G.E.validTargets(C, u, c)[0]; cb.play(i, t); } else cb.play(i, null);
      return 'play';
    });
    if (st === 'done') break;
    if (step === 6) await shot('09_combat_mid');
    await page.waitForTimeout(st === 'wait' ? 250 : 120);
  }
  await page.waitForTimeout(800);
  await shot('10_after_combat');
  // reload mid-run and resume
  const before = await page.evaluate(() => document.querySelector('.screen').className);
  await page.reload();
  await page.waitForTimeout(400);
  await page.click('text=起動する');
  await page.waitForTimeout(300);
  await shot('11_base_resume');
  await page.click('text=任務を再開する');
  await page.waitForTimeout(400);
  await shot('12_resumed');
  console.log('before reload:', before, ' after resume:', await page.evaluate(() => document.querySelector('.screen').className));
  console.log('screen classes:', await page.evaluate(() => document.querySelector('.screen') && document.querySelector('.screen').className));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await browser.close();
})();
