// Visit every screen type and auto-play boss fights: node test/screens.js [outdir]
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path');
const OUT = process.argv[2] || path.join(__dirname, 'shots');
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.stack));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_CERT')) errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.join(__dirname, '..', 'index.html'));
  await page.waitForTimeout(300);
  const shot = (n) => page.screenshot({ path: path.join(OUT, n + '.png') });
  const autoplay = async (maxSteps) => {
    for (let step = 0; step < (maxSteps || 1500); step++) {
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
      if (st === 'done') return true;
      await page.waitForTimeout(st === 'wait' ? 120 : 40);
    }
    return false;
  };
  await page.evaluate(() => {
    G.meta.seenIntro = true; G.meta.flags.tut = true;
    G.meta.settings.speed = 2.4; G.speedMul = 2.4;
    G.meta.res = { energy: 200, scrap: 200, food: 200, data: 200 };
    G.meta.unlocked = G.HERO_ORDER.slice();
    G.meta.fac.core = 3;
    G.run = G.newRun(1, ['doll', 'yomi', 'kagura', 'nezu']);
    ['charm', 'tinybot', 'shieldgen', 'flag', 'crown', 'musicbox'].forEach((r) => G.addRelic(G.run, r));
  });
  // events
  const evs = await page.evaluate(() => G.EVENTS.map((e) => e.id));
  for (const id of evs.slice(0, 3)) {
    await page.evaluate((id) => { G.run.node = { t: 'event', id }; G.UI.event(id); }, id);
    await page.waitForTimeout(300);
    await shot('ev_' + id);
    await page.click('.choice >> nth=0');
    await page.waitForTimeout(300);
    await shot('ev_' + id + '_res');
  }
  // all events: choose each option headlessly to check for errors
  for (const id of evs) {
    const n = await page.evaluate((id) => G.EVENTS.find((e) => e.id === id).ch.length, id);
    for (let c = 0; c < n; c++) {
      await page.evaluate((id) => { G.run.credits = 200; G.UI.event(id); }, id);
      const dis = await page.evaluate((c) => document.querySelectorAll('.choice')[c].disabled, c);
      if (dis) continue;
      await page.evaluate((c) => document.querySelectorAll('.choice')[c].click(), c);
      await page.waitForTimeout(50);
      await page.evaluate(() => G.UI.closeModal());
    }
  }
  // shop / rest / treasure / res
  await page.evaluate(() => { G.run.credits = 300; G.run.node = { t: 'shop', shop: G.genShop(G.run) }; G.UI.shop(); });
  await page.waitForTimeout(200); await shot('shop');
  await page.click('.cardgrid .card >> nth=0'); await page.waitForTimeout(100);
  await page.click('text=カード削除'); await page.waitForTimeout(200); await shot('shop_remove');
  await page.click('#modal .card >> nth=0'); await page.waitForTimeout(100);
  await page.evaluate(() => { G.run.node = { t: 'rest' }; G.UI.rest(); }); await page.waitForTimeout(200); await shot('rest');
  await page.click('text=改造する'); await page.waitForTimeout(200); await shot('rest_upgrade');
  await page.hover('#modal .card >> nth=1'); await page.waitForTimeout(100); await shot('rest_upgrade_hover');
  await page.click('#modal .card >> nth=1'); await page.waitForTimeout(150);
  await page.click('#modal .card >> nth=1'); await page.waitForTimeout(150);
  await page.evaluate(() => { G.run.node = { t: 'treasure' }; G.UI.treasure(); }); await page.waitForTimeout(200); await shot('treasure');
  await page.evaluate(() => { G.run.node = { t: 'res' }; G.UI.resNode(); }); await page.waitForTimeout(200); await shot('resnode');
  // boss fights for each act
  for (const act of [1, 2, 3]) {
    await page.evaluate((act) => { G.run.act = act; G.run.map = G.genMap(act); G.run.heroes.forEach((h) => { h.maxHp += 60; h.hp = h.maxHp; }); const g = G.ACTS[act].boss.slice(); G.run.node = { t: 'fight', group: g, kind: 'boss' }; G.UI.combat(g, 'boss'); }, act);
    await page.waitForTimeout(2500);
    await shot('boss' + act);
    const ok = await autoplay(3000);
    await page.waitForTimeout(500);
    await shot('boss' + act + '_end');
    console.log('boss', act, 'finished', ok, await page.evaluate(() => document.querySelector('.screen').className));
  }
  // elites
  for (const g of [['captain', 'collab'], ['mira', 'rura'], ['mothercopy'], ['omega', 'glitch']]) {
    await page.evaluate((g) => { G.run.heroes.forEach((h) => { h.hp = h.maxHp; }); G.run.node = { t: 'fight', group: g, kind: 'elite' }; G.UI.combat(g, 'elite'); }, g);
    await page.waitForTimeout(1500);
    await shot('elite_' + g[0]);
    await autoplay(3000);
  }
  await page.evaluate(() => { G.run.act = 1; G.run.node = { t: 'actclear' }; G.UI.actClear(); }); await page.waitForTimeout(200); await shot('actclear');
  await page.evaluate(() => { G.run.act = 3; G.UI.ending(); }); await page.waitForTimeout(300); await shot('ending');
  for (let i = 0; i < 20; i++) { if (!(await page.$('.ending'))) break; await page.click('.dlg'); await page.waitForTimeout(60); }
  await page.waitForTimeout(300); await shot('runend_win');
  await page.click('text=拠点へ帰還'); await page.waitForTimeout(200);
  await page.click('.base-tabs >> text=記録'); await page.waitForTimeout(200); await shot('base_log');
  await page.click('.lore-item >> nth=2'); await page.waitForTimeout(100); await shot('base_log_read');
  await page.click('.base-tabs >> text=仲間'); await page.waitForTimeout(200); await shot('base_roster_full');
  console.log('meta', await page.evaluate(() => JSON.stringify({ diffMax: G.meta.diffMax, wins: G.meta.wins, lore: G.meta.lore.length, flags: G.meta.flags })));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await browser.close();
})();
