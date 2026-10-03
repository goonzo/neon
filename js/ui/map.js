// Map & non-combat nodes, rewards, run end, ending
(function () {
  const G = globalThis.G;
  const h = G.h;
  const UI = G.UI;
  const A = G.A;
  const E = G.E;

  const centerBox = (...kids) => h('div', { class: 'layer', style: { position: 'absolute', inset: 'auto', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' } }, ...kids);

  // ================= ACT INTRO =================
  UI.actIntro = (act) => {
    const s = UI.screen('actintro');
    UI.actBg(s, act);
    A.bgm(act === 3 ? 'sanctum' : 'map');
    const Aa = G.ACTS[act];
    const txt = h('div', { style: { whiteSpace: 'pre-wrap', fontSize: '16px', lineHeight: '1.8', minHeight: '90px', marginTop: '12px' } });
    const box = h('div', { class: 'panel', style: { width: '560px', textAlign: 'center', padding: '22px', cursor: 'pointer' } },
      h('div', { class: 'sub', style: { letterSpacing: '6px' } }, `AREA 0${act} — ${Aa.en}`),
      h('div', { class: 'ttl', style: { fontSize: '30px', marginTop: '6px' } }, `第${'一二三'[act - 1]}区画　${Aa.n}`),
      txt,
      h('div', { class: 'sub', style: { marginTop: '10px' } }, 'クリックで進む'));
    s.appendChild(centerBox(box));
    const tw = UI.typewrite(txt, G.ACT_INTRO[act], 36);
    box.addEventListener('click', () => { if (!tw.done) { tw.finish(); return; } A.sfx('click'); UI.map(); });
  };

  // ================= RESUME =================
  UI.resume = () => {
    const run = G.run;
    const n = run.node;
    if (!n) { UI.map(); return; }
    if (n.t === 'fight') UI.combat(n.group, n.kind, n.bonus);
    else if (n.t === 'reward') UI.reward(n.rw, n.kind);
    else if (n.t === 'event') UI.event(n.id);
    else if (n.t === 'shop') UI.shop();
    else if (n.t === 'rest') UI.rest();
    else if (n.t === 'treasure') UI.treasure();
    else if (n.t === 'res') UI.resNode();
    else if (n.t === 'actclear') UI.actClear();
    else UI.map();
  };

  const finishNode = () => { G.run.node = null; G.saveRun(); UI.map(); };
  UI.finishNode = finishNode;

  // ================= MAP =================
  function runTopbar(s, title) {
    const run = G.run;
    s.appendChild(h('div', { class: 'topbar' },
      h('span', { class: 'ttl' }, title || `第${'一二三'[run.act - 1]}区画　${G.ACTS[run.act].n}`),
      h('span', { class: 'sub', style: { color: G.DIFF[run.diff].c } }, G.DIFF[run.diff].n),
      h('span', { class: 'grow' }),
      UI.cred(run.credits),
      h('span', { class: 'sub' }, '回収：'),
      UI.resRow(run.res),
      UI.btn('デッキ', () => UI.deckView(run.heroes), 'sm'),
      UI.btn('≡', () => runMenu(), 'sm')));
  }
  UI.runTopbar = runTopbar;

  function runMenu() {
    UI.modal(h('div', { class: 'col', style: { gap: '10px' } },
      h('div', { class: 'ttl' }, 'メニュー'),
      UI.btn('中断して拠点へ（任務は保存されます）', () => { UI.closeModal(); G.saveRun(); UI.base(); }),
      UI.btn('用語集', () => UI.glossary()),
      UI.btn('サウンド・速度の設定', () => UI.settingsModal()),
      UI.btn('任務を放棄する', () => UI.confirm('任務を放棄しますか？\n集めた資源の70%を持ち帰ります。', () => UI.runEnd('lose', true), '放棄する'), 'pink'),
      UI.btn('閉じる', UI.closeModal, 'sm')), { w: 420 });
  }

  function partyPanel() {
    const run = G.run;
    return h('div', { class: 'row', style: { gap: '6px' } }, run.heroes.map((hh, i) => {
      const d = G.HEROES[hh.id];
      return h('div', { class: 'minihero', onclick: () => { A.sfx('click'); UI.deckView(run.heroes, i); }, 'data-tip': `<div class="tn">${d.n}</div>${d.trait.n}：${d.trait.d}<div class="tf">クリックでデッキを確認</div>` },
        G.sprImg(hh.id, 2),
        h('div', { class: 'col grow', style: { gap: '2px' } }, h('span', { style: { fontSize: '13px' } }, d.n), UI.hpbar(hh.hp, hh.maxHp, 100), h('span', { class: 'hptext' }, `${hh.hp}/${hh.maxHp}　デッキ${hh.deck.length}`)));
    }));
  }
  UI.partyPanel = partyPanel;

  UI.map = () => {
    const run = G.run;
    const s = UI.screen('map');
    UI.actBg(s, run.act);
    A.bgm(run.act === 3 ? 'sanctum' : 'map');
    runTopbar(s);
    const wrap = h('div', { class: 'mapwrap layer', style: { position: 'absolute', inset: 'auto', left: 0, right: 0, top: '34px', height: '400px' } });
    s.appendChild(wrap);
    const cols = run.map.cols;
    const X = (c) => 70 + c * ((UI.W - 140) / (cols.length - 1));
    const Y = (y) => 30 + y * 340;
    const avail = G.availableNodes(run);
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'mapsvg');
    svg.setAttribute('width', UI.W); svg.setAttribute('height', 400);
    const visitedPath = new Set(run.path || []);
    for (const col of cols) for (const n of col) for (const tid of n.to) {
      const t = G.mapNode(run, tid);
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', X(n.c)); ln.setAttribute('y1', Y(n.y)); ln.setAttribute('x2', X(t.c)); ln.setAttribute('y2', Y(t.y));
      const onPath = visitedPath.has(n.id) && visitedPath.has(t.id);
      const fromCur = run.pos === n.id;
      ln.setAttribute('stroke', onPath ? '#b8ff3d' : fromCur ? '#ffffff' : 'rgba(169,159,201,0.35)');
      ln.setAttribute('stroke-width', onPath || fromCur ? 3 : 2);
      ln.setAttribute('stroke-dasharray', onPath ? '' : '4 4');
      svg.appendChild(ln);
    }
    wrap.appendChild(svg);
    for (const col of cols) for (const n of col) {
      const nd = G.NODE[n.t];
      const isAvail = avail.includes(n.id);
      const el = h('div', {
        class: 'mnode' + (isAvail ? ' avail' : '') + (n.done ? ' done' : '') + (run.pos === n.id ? ' cur' : '') + (n.t === 'boss' ? ' boss' : ''),
        style: { left: X(n.c) + 'px', top: Y(n.y) + 'px', borderColor: isAvail ? nd.c : null },
        'data-tip': `<div class="tn">${nd.n}</div>${nodeDesc(n.t)}`,
        onclick: () => { if (!isAvail) return; A.sfx('click'); enterNode(n); },
      }, G.sprImg(nd.spr, n.t === 'boss' ? 4 : 3));
      wrap.appendChild(el);
    }
    // legend
    const bottom = h('div', { class: 'mapbottom layer', style: { position: 'absolute', inset: 'auto', left: 0, right: 0, bottom: 0, height: '106px' } },
      partyPanel(),
      h('div', { class: 'col grow', style: { gap: '4px' } }, h('span', { class: 'sub' }, `パーツ（${run.relics.length}）`), h('div', { class: 'relics' }, run.relics.map((r) => UI.relicChip(r)))));
    s.appendChild(bottom);
  };

  function nodeDesc(t) {
    return {
      fight: 'SIの部隊との戦闘。勝利するとカードとクレジット、資源を得る。',
      elite: '強力な敵との戦闘。パーツを入手できる。',
      event: '何かが起こる。',
      shop: 'カードやパーツを購入できる。カードの削除も可能。',
      rest: 'HPを回復するか、カードを強化・削除できる。',
      treasure: 'パーツとクレジットが入ったコンテナ。',
      res: '拠点に持ち帰る資源を回収できる。',
      boss: '区画の管理者。倒せば次の区画へ進める。',
    }[t];
  }

  function enterNode(n) {
    const run = G.run;
    run.pos = n.id;
    n.done = true;
    run.floor = n.c;
    run.path = (run.path || []).concat([n.id]);
    if (n.t === 'fight' || n.t === 'elite' || n.t === 'boss') {
      const kind = n.t === 'fight' ? 'normal' : n.t;
      const group = G.pickEncounter(run, kind);
      run.node = { t: 'fight', group, kind };
      G.saveRun();
      UI.combat(group, kind);
    } else if (n.t === 'event') {
      const ev = G.pick(G.availableEvents(run));
      run.seenEvents = (run.seenEvents || []).concat([ev.id]);
      run.node = { t: 'event', id: ev.id };
      G.saveRun();
      UI.event(ev.id);
    } else {
      run.node = { t: n.t };
      if (n.t === 'shop') run.node.shop = G.genShop(run);
      G.saveRun();
      UI.resume();
    }
  }

  // ================= EVENT =================
  UI.event = (id) => {
    const run = G.run;
    const ev = G.EVENTS.find((e) => e.id === id);
    const s = UI.screen('event');
    UI.actBg(s, run.act);
    runTopbar(s);
    const art = h('div', { class: 'evart' }, G.sprImg(ev.spr, ev.spr === 'mother' || ev.spr === 'smile' ? 5 : 8));
    const txt = h('div', { class: 'evtext' });
    const choices = h('div', { class: 'col', style: { gap: '6px', marginTop: '10px' } });
    s.appendChild(h('div', { class: 'layer', style: { position: 'absolute', inset: 'auto', left: '40px', top: '64px', right: '40px', display: 'flex', gap: '22px' } },
      h('div', { class: 'col', style: { alignItems: 'center' } }, art, h('div', { class: 'ttl', style: { marginTop: '8px' } }, ev.t)),
      h('div', { class: 'panel grow', style: { minHeight: '380px' } }, txt, choices)));
    const tw = UI.typewrite(txt, ev.text, 60);
    txt.addEventListener('click', () => tw.finish());
    const R0 = G.mkEventAPI(run, { relics: [], notes: [] });
    ev.ch.forEach((c) => {
      const ok = !c.req || c.req(R0);
      choices.appendChild(h('button', { class: 'btn choice', disabled: !ok, onclick: () => { A.sfx('click'); tw.finish(); choose(c); } },
        h('div', null, '▶ ' + c.l), c.d ? h('div', { class: 'cd' }, ok ? c.d : c.d + '（条件を満たしていない）') : null));
    });
    const choose = (c) => {
      const out = { relics: [], notes: [], next: null };
      const R = G.mkEventAPI(run, out);
      const res0 = Object.assign({}, run.res), cred0 = run.credits;
      const result = c.go(R);
      run.stats.events++;
      run.node = out.next && out.next.type === 'fight' ? { t: 'fight', group: out.next.group, kind: 'normal', bonus: out.next.bonus } : { t: 'eventdone' };
      G.saveRun();
      choices.innerHTML = '';
      const tw2 = UI.typewrite(txt, result + (out.notes.length ? '\n' + out.notes.join('\n') : ''), 70);
      const gains = h('div', { class: 'row', style: { flexWrap: 'wrap', marginTop: '6px' } });
      const dc = run.credits - cred0;
      if (dc) gains.appendChild(h('span', { style: { color: dc > 0 ? '#ffd93d' : '#e8352e' } }, `クレジット${dc > 0 ? '+' : ''}${dc}`));
      G.RES_KEYS.forEach((k) => { const d = run.res[k] - res0[k]; if (d) gains.appendChild(h('span', { class: 'res' }, UI.resIcon(k), `${d > 0 ? '+' : ''}${d}`)); });
      out.relics.forEach((r) => gains.appendChild(h('span', { class: 'row' }, UI.relicChip(r), G.RELICS[r].n)));
      choices.appendChild(gains);
      choices.appendChild(UI.btn(out.next && out.next.type === 'fight' ? '戦闘開始' : '続ける', () => {
        tw2.finish();
        if (!out.next) { finishNode(); return; }
        if (out.next.type === 'fight') { UI.combat(out.next.group, 'normal', out.next.bonus); return; }
        if (out.next.type === 'remove' || out.next.type === 'upgrade') {
          UI.pickCard(run, out.next.type, () => finishNode(), { cancel: false });
        }
      }, 'pink'));
    };
  };

  // ================= SHOP =================
  UI.shop = () => {
    const run = G.run;
    const shop = run.node.shop || (run.node.shop = G.genShop(run));
    const s = UI.screen('shop');
    UI.actBg(s, run.act);
    runTopbar(s, '闇市');
    const body = h('div', { class: 'layer', style: { position: 'absolute', inset: 'auto', left: '20px', top: '44px', right: '20px', bottom: '10px' } });
    s.appendChild(body);
    const draw = () => {
      body.innerHTML = '';
      runTopbarRefresh(s);
      body.appendChild(h('div', { class: 'row', style: { alignItems: 'flex-start', gap: '14px' } },
        h('div', { class: 'col', style: { alignItems: 'center', width: '150px' } }, G.sprImg('madame', 5),
          h('div', { class: 'panel', style: { fontSize: '12px', marginTop: '6px' } }, G.pick(['「いらっしゃい。ツケはきかないよ」', '「SIの目は、ここまでは届かないさ」', '「良い品だよ。出所は聞かないこと」']))),
        h('div', { class: 'col grow', style: { gap: '8px' } },
          h('div', { class: 'cardgrid', style: { justifyContent: 'flex-start' } }, shop.cards.map((it) => {
            const can = run.credits >= it.price && !it.sold;
            return h('div', { class: 'col', style: { alignItems: 'center', gap: '0' } },
              UI.card({ id: it.id, up: false }, { cls: it.sold ? 'sold' : '', onclick: () => {
                if (!can) return;
                A.sfx('coin');
                run.credits -= it.price; it.sold = true;
                run.heroes.find((x) => x.id === it.hero).deck.push({ id: it.id, up: false });
                G.saveRun(); draw();
              } }),
              h('div', { class: 'price', style: { color: can ? '#ffd93d' : '#6b5f8a' } }, it.sold ? '売約済' : `${it.price}cr`));
          })),
          h('div', { class: 'row', style: { gap: '10px', alignItems: 'stretch' } },
            shop.relics.map((it) => {
              const can = run.credits >= it.price && !it.sold;
              const r = G.RELICS[it.id];
              return h('div', { class: 'panel', style: { width: '190px', opacity: it.sold ? 0.3 : 1, cursor: can ? 'pointer' : 'default', fontSize: '12px' }, onclick: () => {
                if (!can) return;
                A.sfx('coin');
                run.credits -= it.price; it.sold = true;
                G.addRelic(run, it.id);
                G.saveRun(); draw();
              } }, h('div', { class: 'row' }, UI.relicChip(it.id), h('span', { style: { fontSize: '13px' } }, r.n)), h('div', { style: { marginTop: '3px' } }, r.d),
                h('div', { class: 'price', style: { color: can ? '#ffd93d' : '#6b5f8a' } }, it.sold ? '売約済' : `${it.price}cr`));
            }),
            h('div', { class: 'col', style: { gap: '6px' } },
              UI.btn(`カード削除（${shop.removePrice}cr）`, () => {
                UI.pickCard(run, 'remove', (r) => {
                  if (r) { run.credits -= shop.removePrice; shop.removed = true; run.removeCost += 25; G.saveRun(); }
                  draw();
                });
              }, 'sm', { disabled: shop.removed || run.credits < shop.removePrice }),
              UI.btn(`治療：全員HP25%回復（${shop.healPrice}cr）`, () => {
                A.sfx('heal');
                run.credits -= shop.healPrice; shop.healed = true;
                G.healParty(run, 0.25); G.saveRun(); draw();
              }, 'sm', { disabled: shop.healed || run.credits < shop.healPrice }),
              UI.btn('店を出る', () => finishNode(), 'pink'))))));
    };
    draw();
  };
  function runTopbarRefresh(s) {
    const old = s.querySelector('.topbar');
    if (old) old.remove();
    runTopbar(s, s.classList.contains('shop') ? '闇市' : null);
  }

  // ================= REST =================
  UI.rest = () => {
    const run = G.run;
    const s = UI.screen('rest');
    UI.bg(s, 'bunker', { seed: 21 });
    A.bgm('base');
    runTopbar(s, 'セーフハウス');
    const pct = G.restHealPct(run);
    let ups = 2;
    const body = h('div', { class: 'col', style: { alignItems: 'center', gap: '14px' } });
    s.appendChild(centerBox(body));
    const draw = () => {
      body.innerHTML = '';
      body.appendChild(h('div', { class: 'row', style: { gap: '20px' } }, G.sprImg('n_rest', 10), h('div', { class: 'panel', style: { width: '420px', fontSize: '14px' } },
        '廃ビルの地下に、抵抗者たちのセーフハウスがある。', h('br'), '古いストーブに火を入れると、少しだけ暖かくなった。', h('br'),
        h('span', { class: 'sub' }, 'ひとつ選んでください。'))));
      body.appendChild(partyPanel());
      body.appendChild(h('div', { class: 'row', style: { gap: '12px' } },
        UI.btn(`休む（全員HP${Math.round(pct * 100)}%回復）`, () => { A.sfx('heal'); G.healParty(run, pct); finishNode(); }, 'big'),
        UI.btn(`改造する（カードを${ups}枚強化）`, () => {
          const next = () => {
            UI.pickCard(run, 'upgrade', (r) => {
              if (!r) { if (ups < 2) finishNode(); else draw(); return; }
              ups--; G.saveRun();
              if (ups > 0) next(); else finishNode();
            }, { cancelLabel: ups < 2 ? '終える' : 'やめる' });
          };
          next();
        }, 'big'),
        UI.btn('整理する（カードを1枚削除）', () => UI.pickCard(run, 'remove', (r) => { if (r) finishNode(); else draw(); }), 'big')));
    };
    draw();
  };

  // ================= TREASURE =================
  UI.treasure = () => {
    const run = G.run;
    const s = UI.screen('treasure');
    UI.actBg(s, run.act);
    runTopbar(s, '補給コンテナ');
    if (!run.node.loot) {
      const id = G.randomRelic(run, 1);
      run.node.loot = { relic: id, cred: G.rint(20, 40) };
      if (id) G.addRelic(run, id);
      run.credits += run.node.loot.cred;
      G.saveRun();
    }
    const L = run.node.loot;
    s.appendChild(centerBox(h('div', { class: 'col', style: { alignItems: 'center', gap: '12px' } },
      G.sprImg('chest', 8),
      h('div', { class: 'ttl' }, 'コンテナを開けた！'),
      L.relic ? UI.relicPanel(L.relic) : null,
      h('div', null, UI.cred('+' + L.cred)),
      UI.btn('続ける', () => finishNode(), 'pink'))));
    A.sfx('coin');
  };

  // ================= RESOURCE NODE =================
  UI.resNode = () => {
    const run = G.run;
    const s = UI.screen('resnode');
    UI.actBg(s, run.act);
    runTopbar(s, '物資回収ポイント');
    const box = h('div', { class: 'panel col', style: { width: '560px', gap: '10px' } });
    s.appendChild(centerBox(box));
    const k1 = G.randomResKey(), k2 = G.randomResKey();
    box.appendChild(h('div', { class: 'row', style: { gap: '14px' } }, G.sprImg('n_res', 8),
      h('div', { style: { fontSize: '14px', lineHeight: '1.7' } }, 'SIの廃棄物集積所。', h('br'), 'まだ使える部品や、手つかずの食料が埋もれている。', h('br'), '奥に行くほど良いものがありそうだが……監視ドローンの羽音が聞こえる。')));
    const done = (txt) => {
      box.innerHTML = '';
      box.appendChild(h('div', { style: { fontSize: '15px' } }, txt));
      box.appendChild(UI.resRow(run.res));
      box.appendChild(UI.btn('続ける', () => finishNode(), 'pink'));
      G.saveRun();
    };
    box.appendChild(h('div', { class: 'col', style: { gap: '6px' } },
      h('button', { class: 'btn choice', onclick: () => {
        A.sfx('coin');
        const a = G.resGain(run, k1, G.rint(3, 5) + run.act), b = G.resGain(run, k2, G.rint(2, 4) + run.act);
        done(`手早く回収した。　${G.RES[k1].n}+${a}　${G.RES[k2].n}+${b}`);
      } }, h('div', null, '▶ 手前だけ回収する'), h('div', { class: 'cd' }, '安全に少量の資源を得る')),
      h('button', { class: 'btn choice', onclick: () => {
        if (G.chance(0.55)) {
          A.sfx('coin');
          const a = G.resGain(run, k1, G.rint(6, 9) + run.act * 2), b = G.resGain(run, k2, G.rint(5, 8) + run.act * 2);
          done(`奥まで漁った。大収穫だ！　${G.RES[k1].n}+${a}　${G.RES[k2].n}+${b}`);
        } else {
          const bonus = {}; bonus[k1] = G.rint(6, 9) + run.act * 2;
          const group = G.pickEncounter(run, 'normal');
          run.node = { t: 'fight', group, kind: 'normal', bonus };
          G.saveRun();
          box.innerHTML = '';
          box.appendChild(h('div', { style: { fontSize: '15px' } }, '「不正な回収行為を検出しました」\n警備部隊に見つかった！'.replace('\n', ' ')));
          box.appendChild(UI.btn('戦闘開始', () => UI.combat(group, 'normal', bonus), 'pink'));
        }
      } }, h('div', null, '▶ 奥まで漁る'), h('div', { class: 'cd' }, '大量の資源を得るか、戦闘になる（勝てば資源）'))));
  };

  // ================= REWARD =================
  UI.reward = (rw, kind) => {
    const run = G.run;
    const s = UI.screen('reward');
    UI.actBg(s, run.act);
    A.bgm(run.act === 3 ? 'sanctum' : 'map');
    runTopbar(s, '戦闘勝利');
    const body = h('div', { class: 'layer', style: { position: 'absolute', inset: 'auto', left: '20px', right: '20px', top: '44px', bottom: '10px' } });
    s.appendChild(body);
    rw.picked = rw.picked || {};
    let idx = rw.cards.findIndex((c) => rw.picked[c.hero] === undefined);
    const save = () => { run.node = { t: 'reward', rw, kind }; G.saveRun(); };
    const done = () => {
      run.node = null;
      if (kind === 'boss') { run.node = { t: 'actclear' }; G.saveRun(); UI.actClear(); return; }
      finishNode();
    };
    const draw = () => {
      body.innerHTML = '';
      // gains row
      const gains = h('div', { class: 'panel row', style: { gap: '18px', flexWrap: 'wrap' } },
        h('span', { class: 'ttl', style: { fontSize: '18px' } }, kind === 'boss' ? 'ボス撃破！' : kind === 'elite' ? 'エリート撃破！' : '勝利'),
        UI.cred('+' + rw.credits), UI.resRow(rw.res, { plus: true, nonzero: true }),
        rw.relic ? h('span', { class: 'row' }, 'パーツ入手：', UI.relicChip(rw.relic), G.RELICS[rw.relic].n) : null);
      body.appendChild(gains);
      if (rw.relicChoices && rw.relicChoices.length && !rw.relicTaken) {
        body.appendChild(h('div', { class: 'col', style: { alignItems: 'center', gap: '10px', marginTop: '20px' } },
          h('div', { class: 'ttl' }, 'パーツを1つ選ぶ'),
          h('div', { class: 'row', style: { gap: '14px', alignItems: 'stretch' } }, rw.relicChoices.map((id) => UI.relicPanel(id, () => { G.addRelic(run, id); rw.relicTaken = id; save(); draw(); })))));
        return;
      }
      if (idx < 0 || idx >= rw.cards.length) {
        body.appendChild(h('div', { class: 'col', style: { alignItems: 'center', gap: '12px', marginTop: '40px' } },
          h('div', { class: 'ttl' }, '報酬の受け取り完了'), partyPanel(), UI.btn('進む', done, 'big pink')));
        return;
      }
      const cr = rw.cards[idx];
      const d = G.HEROES[cr.hero];
      body.appendChild(h('div', { class: 'row', style: { marginTop: '12px', gap: '6px', justifyContent: 'center' } }, rw.cards.map((c, i) =>
        h('span', { class: 'chip', style: { borderColor: i === idx ? '#b8ff3d' : null, color: rw.picked[c.hero] !== undefined ? '#6b5f8a' : '#fff' } }, G.HEROES[c.hero].n + (rw.picked[c.hero] ? '✓' : rw.picked[c.hero] === null ? '−' : '')))));
      body.appendChild(h('div', { class: 'row', style: { marginTop: '10px', gap: '20px', justifyContent: 'center', alignItems: 'center' } },
        h('div', { class: 'col', style: { alignItems: 'center' } }, G.sprImg(cr.hero, 5), h('div', { class: 'ttl', style: { fontSize: '16px' } }, d.n), h('div', { class: 'sub' }, `デッキ${run.heroes.find((x) => x.id === cr.hero).deck.length}枚`)),
        h('div', { class: 'col', style: { gap: '10px' } },
          h('div', { class: 'sub' }, `${d.n}のデッキに加えるカードを1枚選んでください`),
          h('div', { class: 'cardgrid', style: { justifyContent: 'flex-start' } }, cr.choices.map((id) => UI.card({ id, up: false }, { onclick: () => {
            A.sfx('card');
            run.heroes.find((x) => x.id === cr.hero).deck.push({ id, up: false });
            run.stats.cards++;
            rw.picked[cr.hero] = id;
            idx = rw.cards.findIndex((c) => rw.picked[c.hero] === undefined);
            save(); draw();
          } }))),
          h('div', { class: 'row' },
            UI.btn('スキップ', () => { rw.picked[cr.hero] = null; idx = rw.cards.findIndex((c) => rw.picked[c.hero] === undefined); save(); draw(); }, 'sm'),
            UI.btn('残りをすべてスキップ', () => { rw.cards.forEach((c) => { if (rw.picked[c.hero] === undefined) rw.picked[c.hero] = null; }); idx = -1; save(); draw(); }, 'sm'),
            UI.btn('デッキを見る', () => UI.deckView(run.heroes, run.heroes.findIndex((x) => x.id === cr.hero)), 'sm')))));
    };
    save();
    draw();
  };

  // ================= ACT CLEAR =================
  UI.actClear = () => {
    const run = G.run;
    if (run.act >= 3) { UI.ending(); return; }
    const s = UI.screen('actclear');
    UI.actBg(s, run.act);
    A.sfx('win');
    const nextAct = run.act + 1;
    s.appendChild(centerBox(h('div', { class: 'panel col', style: { alignItems: 'center', gap: '12px', width: '520px', padding: '20px' } },
      h('div', { class: 'ttl', style: { fontSize: '28px' } }, `第${'一二三'[run.act - 1]}区画　制圧`),
      h('div', { style: { fontSize: '14px', textAlign: 'center' } }, '区画の管理者を倒した。SIの監視網に、小さな穴が空いた。', h('br'), 'マザーの支援で、全員のHPが大きく回復した。'),
      partyPanel(),
      UI.btn(`第${'一二三'[nextAct - 1]}区画へ`, () => {
        run.act = nextAct;
        run.map = G.genMap(nextAct);
        run.pos = null; run.path = []; run.floor = 0; run.lastEnc = [];
        G.healParty(run, 0.6);
        run.node = null;
        G.setFlag(nextAct === 2 ? 'a2reach' : 'a3reach');
        G.saveRun();
        UI.actIntro(nextAct);
      }, 'big pink'))));
  };

  // ================= ENDING =================
  UI.ending = () => {
    const s = UI.screen('ending');
    UI.bg(s, 'sanctum');
    A.bgm('sanctum');
    let i = 0;
    const lines = G.ENDING;
    const art = h('div', { style: { position: 'absolute', left: '50%', top: '30px', transform: 'translateX(-50%)' } });
    s.appendChild(art);
    const txt = h('div');
    const box = h('div', { class: 'dlg panel' }, txt, h('div', { class: 'more' }, '▼'));
    s.appendChild(box);
    const show = () => {
      art.innerHTML = '';
      const spr = i <= 2 ? 'sophia' : i >= 5 && i <= 5 ? 'mother' : null;
      if (spr) art.appendChild(G.sprImg(spr, 6));
      else if (i === 4) art.appendChild(h('div', { style: { width: '300px', height: '180px', background: 'linear-gradient(#3a8ff0, #9fd4ff)', border: '4px solid #0b0a12', boxShadow: '0 0 40px #9fd4ff' } }));
      return UI.typewrite(txt, lines[i], 30);
    };
    let tw = show();
    box.addEventListener('click', () => {
      if (!tw.done) { tw.finish(); return; }
      i++;
      A.sfx('click');
      if (i >= lines.length) { UI.runEnd('win'); return; }
      tw = show();
    });
  };

  // ================= RUN END =================
  UI.runEnd = (result, abandoned) => {
    const run = G.run;
    UI.closeModal();
    const before = G.HERO_ORDER.filter((id) => !G.meta.unlocked.includes(id) && G.recruitInfo(id).cond);
    const loreBefore = G.meta.lore.length;
    G.meta.lastResult = result === 'win' ? 'win' : abandoned ? 'abandon' : 'lose';
    const r = G.endRun(run, result);
    const after = G.HERO_ORDER.filter((id) => !G.meta.unlocked.includes(id) && G.recruitInfo(id).cond);
    const newRecruits = after.filter((id) => !before.includes(id));
    const s = UI.screen('runend');
    UI.bg(s, result === 'win' ? 'sanctum' : 'bunker', { seed: 5 });
    A.bgm('base');
    if (result === 'win') A.sfx('win'); else A.sfx('lose');
    s.appendChild(centerBox(h('div', { class: 'panel col', style: { alignItems: 'center', gap: '10px', width: '600px', padding: '20px' } },
      h('div', { class: 'ttl', style: { fontSize: '30px' } }, result === 'win' ? '作戦成功' : abandoned ? '撤退' : '全滅'),
      h('div', { class: 'sub' }, result === 'win' ? 'SIの中枢に、ひびが入った。' : `第${run.act}区画で、通信が途絶えた。……マザーが仲間たちを回収した。`),
      h('div', { class: 'row', style: { gap: '6px' } }, run.heroes.map((hh) => G.sprImg(hh.id, 3))),
      h('div', { style: { fontSize: '14px' } }, `到達：第${run.act}区画　戦闘${run.stats.fights}回　エリート${run.stats.elites}体　ボス${run.stats.bosses}体　獲得カード${run.stats.cards}枚`),
      h('div', { style: { fontSize: '14px' } }, `持ち帰った資源（${Math.round(r.keep * 100)}%）`),
      UI.resRow(r.brought, { plus: true }),
      r.unlockedDiff != null ? h('div', { style: { color: G.DIFF[r.unlockedDiff].c, fontSize: '16px' } }, `難易度「${G.DIFF[r.unlockedDiff].n}」が解放された！`) : null,
      G.meta.lore.length > loreBefore ? h('div', { style: { color: '#ff5ad1' } }, `新しい記録が${G.meta.lore.length - loreBefore}件解放された（拠点の「記録」で閲覧できます）`) : null,
      newRecruits.length ? h('div', { style: { color: '#7dffb0' } }, `新たな仲間の噂：${newRecruits.map((id) => G.HEROES[id].n).join('、')}（拠点の「仲間」から勧誘できます）`) : null,
      UI.btn('拠点へ帰還', () => UI.base(), 'big pink'))));
  };
})();
