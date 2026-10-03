// Bot plays complete runs through the real UI: node test/fullrun.js [runs] [diff]
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path');
const RUNS = +process.argv[2] || 1, DIFF = +(process.argv[3] || 0);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.stack));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_CERT')) errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.join(__dirname, '..', 'index.html'));
  await page.waitForTimeout(300);
  await page.evaluate((d) => {
    G.meta.seenIntro = true; G.meta.flags.tut = true; G.meta.settings.speed = 2.4; G.speedMul = 2.4; G.meta.settings.sfx = false; G.meta.settings.bgm = false;
    G.meta.diffMax = 3; G.meta.lastDiff = d; G.saveMeta();
  }, DIFF);
  for (let r = 0; r < RUNS; r++) {
    await page.evaluate(() => G.UI.sortie());
    await page.waitForTimeout(200);
    // random party
    await page.evaluate(() => {
      const ids = G.shuffle(G.meta.unlocked).slice(0, 4);
      G.meta.lastParty = ids; G.UI.sortie();
    });
    await page.click('text=出撃！');
    const seen = {};
    let last = '', same = 0;
    for (let step = 0; step < 20000; step++) {
      const scr = await page.evaluate(() => { const s = document.querySelector('.screen'); return s ? s.className.replace('screen ', '') : ''; });
      seen[scr] = (seen[scr] || 0) + 1;
      if (scr === 'runend') break;
      const modal = await page.$('#modal');
      if (modal) {
        const c = await page.$('#modal .card');
        if (c) { await c.click(); } else { const b = await page.$('#modal .btn.pink') || await page.$('#modal .btn'); if (b) await b.click(); }
        await page.waitForTimeout(80);
        continue;
      }
      const act = await page.evaluate((scr) => {
        const q = (s) => document.querySelector(s);
        const btnText = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.includes(t) && !b.disabled);
        const click = (el) => { if (el) { el.click(); return true; } return false; };
        switch (scr) {
          case 'relicpick': return click(q('.panel[style*="cursor: pointer"]')) || click(btnText('何も持っていかない'));
          case 'actintro': return click(q('.panel'));
          case 'map': { const n = [...document.querySelectorAll('.mnode.avail')]; return click(n[Math.floor(Math.random() * n.length)]); }
          case 'combat': {
            const cb = G.UI._combat;
            if (!cb || cb.busy || !cb.inputHero) return 'wait';
            const u = cb.inputHero, C = cb.C;
            const opts = u.hand.map((c, i) => i).filter((i) => G.E.canPlay(C, u, u.hand[i]));
            if (!opts.length) { cb.endHeroTurn(); return true; }
            const i = opts[Math.floor(Math.random() * opts.length)];
            const c = u.hand[i];
            if (G.E.needsTarget(c)) { const vt = G.E.validTargets(C, u, c); cb.play(i, vt[Math.floor(Math.random() * vt.length)]); } else cb.play(i, null);
            return true;
          }
          case 'reward': {
            const rp = [...document.querySelectorAll('.panel[style*="cursor: pointer"]')];
            if (rp.length) return click(rp[0]);
            const cards = [...document.querySelectorAll('.cardgrid .card')];
            if (cards.length && Math.random() < 0.8) return click(cards[Math.floor(Math.random() * cards.length)]);
            return click(btnText('進む')) || click(btnText('スキップ'));
          }
          case 'event': {
            const ch = [...document.querySelectorAll('.choice')].filter((b) => !b.disabled);
            if (ch.length) return click(ch[Math.floor(Math.random() * ch.length)]);
            return click(btnText('続ける')) || click(btnText('戦闘開始'));
          }
          case 'shop': {
            const cards = [...document.querySelectorAll('.cardgrid .card:not(.sold)')];
            if (cards.length && Math.random() < 0.3) return click(cards[0]);
            return click(btnText('店を出る'));
          }
          case 'rest': return click(btnText(Math.random() < 0.6 ? '休む' : '改造する')) || click(btnText('休む'));
          case 'treasure': return click(btnText('続ける'));
          case 'resnode': return click(btnText('続ける')) || click(btnText('戦闘開始')) || click([...document.querySelectorAll('.choice')][Math.floor(Math.random() * 2)]);
          case 'actclear': return click(btnText('区画へ'));
          case 'ending': return click(q('.dlg'));
          default: return 'unknown:' + scr;
        }
      }, scr);
      const sig = scr + ':' + act;
      if (sig === last) same++; else { same = 0; last = sig; }
      if (same > 400) { errors.push('STUCK at ' + sig); break; }
      await page.waitForTimeout(act === 'wait' ? 100 : 40);
    }
    const res = await page.evaluate(() => document.querySelector('.screen .panel') && document.querySelector('.screen .panel').innerText.split('\n').slice(0, 4).join(' | '));
    console.log(`run ${r + 1}:`, res, JSON.stringify(seen));
    await page.evaluate(() => G.UI.base());
  }
  console.log(errors.length ? errors.slice(0, 10).join('\n') : 'NO ERRORS');
  console.log('meta', await page.evaluate(() => JSON.stringify({ res: G.meta.res, runs: G.meta.runs, wins: G.meta.wins, flags: Object.keys(G.meta.flags) })));
  await browser.close();
})();
