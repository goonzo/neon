// Combat screen
(function () {
  const G = globalThis.G;
  const h = G.h;
  const UI = G.UI;
  const A = G.A;
  const E = G.E;

  // feet positions inside the field (x center, y bottom of sprite)
  const HERO_SLOTS = [{ x: 410, y: 232 }, { x: 300, y: 262 }, { x: 190, y: 232 }, { x: 80, y: 262 }];
  const E_SLOTS = [{ x: 590, y: 232 }, { x: 710, y: 262 }, { x: 830, y: 232 }, { x: 650, y: 118 }, { x: 790, y: 118 }];
  const BIG_SLOT = { x: 760, y: 262 };
  const E_SLOTS_BIG = [{ x: 595, y: 262 }, { x: 900, y: 262 }, { x: 605, y: 128 }, { x: 900, y: 128 }];

  const ICON = { atk: '攻', def: '防', buf: '強', deb: '弱', hack: '害', heal: '癒', sum: '召' };

  function moveText(C, u, m) {
    const tgN = { E: '仲間1人に', AE: '仲間全員に', S: '自身に', AA: '敵全体に', LA: '最も弱った敵に' }[m.tg] || '';
    const parts = [];
    for (const fx of m.fx) {
      const args = fx.slice(1);
      let to = null;
      if (typeof args[args.length - 1] === 'string' && args[args.length - 1][0] === '@') to = args.pop().slice(1);
      const pre = to === 'S' ? '自身に' : tgN;
      const ref = E.effectiveTarget(C, u) || E.alive(C, 'H')[0];
      switch (fx[0]) {
        case 'dmg': parts.push(`${pre}${ref ? E.previewAttack(C, u, ref, args[0], {}) : args[0]}ダメージ${args[1] > 1 ? '×' + args[1] : ''}`); break;
        case 'drain': parts.push(`${pre}${ref ? E.previewAttack(C, u, ref, args[0], {}) : args[0]}ダメージ（与えた分回復）`); break;
        case 'blk': parts.push(`${pre}シールド${Math.round(args[0] * G.EK.blk)}`); break;
        case 'heal': parts.push(`${pre}HP${Math.round(args[0] * G.EK.heal)}回復`); break;
        case 'st': parts.push(`${pre}${G.ST[args[0]].n}${args[1]}`); break;
        case 'noise': parts.push(`${pre}ノイズカード${args[0]}枚を混入（ハッキング）`); break;
        case 'summon': parts.push(`${G.ENEMIES[args[0]].n}を${args[1] || 1}体呼ぶ`); break;
        case 'cleanse': parts.push('自身のデバフを解除'); break;
        default: break;
      }
    }
    return parts.join('。');
  }

  UI.combat = (group, kind, bonus) => {
    const run = G.run;
    const C = E.create(run, group, { kind });
    E.begin(C, { startBlock: G.meta.fac.core >= 2 ? 3 : 0 });
    G.speedMul = G.meta.settings.speed || 1;
    const s = UI.screen('combat');
    UI.actBg(s, run.act);
    A.bgm(kind === 'boss' || kind === 'elite' ? 'boss' : 'battle');
    if (kind === 'boss') A.sfx('boss');

    // ---------- layout ----------
    const turnbar = h('div', { class: 'turnbar' });
    const field = h('div', { class: 'field layer', style: { position: 'absolute', inset: 'auto', left: 0, right: 0, top: '34px', height: '300px' } });
    const whoBox = h('div', { class: 'who' });
    const handEl = h('div', { class: 'hand' });
    const endBtn = UI.btn('ターン終了', () => { if (!busy && inputHero) { endHeroTurn(); } }, 'big endbtn');
    const hud = h('div', { class: 'hud layer', style: { position: 'absolute', inset: 'auto', left: 0, right: 0, bottom: 0, height: '206px' } }, whoBox, handEl, endBtn);
    const hint = h('div', { class: 'hint' });
    s.appendChild(field); s.appendChild(hud); s.appendChild(turnbar); s.appendChild(hint);

    const els = {};
    const slotOf = {};
    let inputHero = null, sel = -1, busy = true, waitResolve = null, hoverUid = null;

    function assignSlot(u) {
      if (u.side === 'H') return HERO_SLOTS[u.idx];
      if (slotOf[u.uid]) return slotOf[u.uid];
      const big = u.boss || (u.elite && (u.def.scale || 4) >= 5);
      const hasBig = C.units.some((x) => x.side === 'E' && !x.dead && (x.boss || (x.elite && (x.def.scale || 4) >= 5)));
      if (big && !Object.values(slotOf).includes(BIG_SLOT)) { slotOf[u.uid] = BIG_SLOT; return BIG_SLOT; }
      const list = hasBig ? E_SLOTS_BIG : E_SLOTS;
      const used = C.units.filter((x) => x.side === 'E' && !x.dead && slotOf[x.uid]).map((x) => slotOf[x.uid]);
      let sl = list.find((p) => !used.includes(p));
      if (!sl) sl = list[G.rnd(list.length)];
      // hide dead units occupying this slot
      C.units.forEach((x) => { if (x.side === 'E' && x.dead && slotOf[x.uid] === sl && els[x.uid]) els[x.uid].root.classList.add('fled'); });
      slotOf[u.uid] = sl;
      return sl;
    }

    function mkUnit(u) {
      const sc = u.side === 'H' ? 4 : u.def.scale || 4;
      const spriteName = u.side === 'H' ? u.id : u.id;
      const img = G.sprImg(spriteName, sc, u.side === 'E' ? { flip: false } : null);
      const sz = G.sprSize(spriteName);
      const spr = h('div', { class: 'spr' }, img, h('div', { class: 'shadow' }));
      const blk = h('div', { class: 'blk hidden' });
      spr.appendChild(blk);
      const fill = h('div', { class: 'fill' });
      const bar = h('div', { class: 'hpbar ubar' }, fill);
      const hpt = h('div', { class: 'uhp' });
      const nm = h('div', { class: 'uname' }, u.n);
      const sts = h('div', { class: 'sts' });
      const intent = h('div', { class: 'intent hidden' });
      const root = h('div', { class: 'unit idle' + (u.summoned ? ' spawn' : '') }, intent, spr, nm, bar, hpt, sts);
      const pos = assignSlot(u);
      root.style.left = pos.x + 'px';
      root.style.top = pos.y - sz.h * sc + 'px';
      root.addEventListener('click', (e) => { e.stopPropagation(); onUnitClick(u); });
      root.addEventListener('mouseenter', () => { hoverUid = u.uid; markTargets(); });
      root.addEventListener('mouseleave', () => { if (hoverUid === u.uid) hoverUid = null; markTargets(); });
      field.appendChild(root);
      els[u.uid] = { root, spr, img, blk, fill, hpt, sts, intent, nm };
      return els[u.uid];
    }

    function updUnit(u) {
      const el = els[u.uid] || mkUnit(u);
      el.root.classList.toggle('dead', !!u.dead);
      if (u.fled) el.root.classList.add('fled');
      el.root.classList.toggle('cur', C.cur === u);
      const r = u.hp / u.maxHp;
      el.fill.style.width = Math.max(0, r * 100) + '%';
      el.fill.className = 'fill ' + (u.side === 'E' ? '' : r > 0.6 ? 'hi' : r > 0.3 ? 'mid' : '');
      el.hpt.textContent = u.dead ? (u.side === 'H' ? '戦闘不能' : '撃破') : `${u.hp}/${u.maxHp}`;
      if (u.blk > 0 && !u.dead) { el.blk.classList.remove('hidden'); el.blk.textContent = u.blk; } else el.blk.classList.add('hidden');
      el.sts.innerHTML = '';
      if (!u.dead) for (const k in u.st) {
        const d = G.ST[k];
        if (!d) continue;
        el.sts.appendChild(h('span', { class: 'st', style: { background: d.c }, 'data-tip': `<div class="tn">${d.n} ${u.st[k]}</div>${G.stDesc(k, u.st[k])}` }, d.g, h('sub', null, String(u.st[k]))));
      }
      if (u.side === 'E') {
        const info = !u.dead && E.intentInfo(C, u);
        if (info) {
          const m = info.m;
          let label = ICON[m.i] || '？';
          if (info.dmg != null) label += ` ${info.dmg}${info.hits > 1 ? '×' + info.hits : ''}`;
          el.intent.className = 'intent ' + m.i;
          el.intent.innerHTML = '';
          el.intent.appendChild(h('span', null, label));
          if (info.aoe) el.intent.appendChild(h('span', { class: 'tgt' }, '全体'));
          else if (info.t) el.intent.appendChild(h('span', { class: 'tgt' }, '→' + info.t.n));
          el.intent.dataset.tip = `<div class="tn">${m.n}</div>${moveText(C, u, m)}`;
        } else el.intent.className = 'intent hidden';
      }
    }

    function markTargets() {
      const vt = inputHero && sel >= 0 && inputHero.hand[sel] ? E.validTargets(C, inputHero, inputHero.hand[sel]) : [];
      // enemy intents targeting hovered hero
      for (const u of C.units) {
        const el = els[u.uid];
        if (!el) continue;
        el.root.classList.toggle('targetable', vt.includes(u.uid));
        let targeted = false;
        if (hoverUid && u.side === 'H') {
          const hov = E.unit(C, hoverUid);
          if (hov && hov.side === 'E' && !hov.dead) { const t = E.effectiveTarget(C, hov); targeted = (t && t.uid === u.uid) || (hov.intent && hov.intent.m.tg === 'AE'); }
        }
        el.root.classList.toggle('targeted', targeted);
      }
    }

    function renderTurnbar() {
      turnbar.innerHTML = '';
      turnbar.appendChild(h('span', { class: 'rnd' }, `ROUND ${C.round}`));
      const icon = (u, now) => {
        const sz = G.sprSize(u.id);
        const scl = 22 / Math.max(sz.w, sz.h * 0.8);
        return h('div', { class: 'ti ' + (u.side === 'H' ? 'h' : 'e') + (now ? ' now' : ''), 'data-tip': `${u.n}（速度${E.speed(u)}）` }, G.sprImg(u.id, scl));
      };
      if (C.cur && !C.cur.dead) turnbar.appendChild(icon(C.cur, true));
      E.upcoming(C).forEach((u) => turnbar.appendChild(icon(u, false)));
      turnbar.appendChild(h('span', { class: 'sub', style: { margin: '0 4px' } }, '│次R'));
      turnbar.appendChild(h('span', { class: 'grow' }));
      turnbar.appendChild(h('div', { class: 'relics' }, run.relics.map((r) => UI.relicChip(r))));
      turnbar.appendChild(UI.cred(run.credits));
      turnbar.appendChild(UI.btn('≡', menu, 'sm'));
    }

    function renderHud() {
      whoBox.innerHTML = '';
      handEl.innerHTML = '';
      const u = inputHero;
      if (!u) {
        endBtn.disabled = true;
        endBtn.classList.remove('glow');
        if (C.cur && C.cur.side === 'E') whoBox.appendChild(h('div', { style: { color: '#ff3d8b', fontSize: '16px', marginBottom: '60px' } }, '敵のターン'));
        return;
      }
      const d = G.HEROES[u.id];
      whoBox.appendChild(h('div', { class: 'col', style: { gap: '4px' } },
        h('div', { class: 'row' }, G.sprImg(u.id, 2), h('div', { class: 'col', style: { gap: '0' } }, h('span', { style: { fontSize: '15px', color: d.col } }, d.n), h('span', { class: 'sub', 'data-tip': `<div class="tn">${d.trait.n}</div>${d.trait.d}` }, '特性：' + d.trait.n))),
        h('div', { class: 'row' }, h('div', { class: 'energy' + (u.energy ? '' : ' zero'), 'data-tip': '<div class="tn">エナジー</div>カードを使うためのコスト。毎ターン3回復。' }, String(u.energy)),
          h('div', { class: 'piles col', style: { gap: '2px' } },
            h('span', { onclick: () => pileModal('山札', u.draw, true) }, `山札 ${u.draw.length}`),
            h('span', { onclick: () => pileModal('捨て札', u.disc) }, `捨札 ${u.disc.length}`),
            h('span', { onclick: () => pileModal('廃棄', u.exh) }, `廃棄 ${u.exh.length}`)))));
      const n = u.hand.length;
      handEl.className = 'hand' + (n > 8 ? ' vtight' : n > 6 ? ' tight' : '');
      let anyPlayable = false;
      u.hand.forEach((c, i) => {
        const can = E.canPlay(C, u, c);
        if (can && c.id !== 'noise') anyPlayable = true;
        const el = UI.card(c, { u, C, cls: (can ? '' : 'unplayable') + (i === sel ? ' selected' : '') });
        el.addEventListener('click', (e) => { e.stopPropagation(); selectCard(i); });
        el.dataset.k = String((i + 1) % 10);
        handEl.appendChild(el);
      });
      endBtn.disabled = busy;
      endBtn.classList.toggle('glow', !anyPlayable && !busy);
    }

    function renderHint() {
      if (inputHero && sel >= 0) {
        const c = inputHero.hand[sel];
        const d = c && E.cardDef(c);
        hint.textContent = d ? (d.tg === 'A' ? '対象の味方を選択（右クリックでキャンセル）' : d.tg === 'D' ? '蘇生する仲間を選択' : '対象の敵を選択（右クリックでキャンセル）') : '';
      } else if (inputHero) hint.textContent = `${inputHero.n}のターン — カードを選んでください`;
      else hint.textContent = '';
    }

    function render() {
      C.units.forEach(updUnit);
      renderTurnbar();
      renderHud();
      renderHint();
      markTargets();
    }

    function floatAt(uid, text, color, cls, dy) {
      const el = els[uid];
      if (!el) return;
      const p = UI.elTop(el.spr);
      UI.float(p.x + G.rint(-8, 8), p.y + (dy || 10), text, color, cls);
    }
    function flashClass(uid, cls, ms) {
      const el = els[uid];
      if (!el) return;
      el.root.classList.remove(cls);
      void el.root.offsetWidth;
      el.root.classList.add(cls);
      setTimeout(() => el.root.classList.remove(cls), ms || 300);
    }
    function sayBubble(uid, text) {
      const el = els[uid];
      if (!el) return;
      const p = UI.elTop(el.spr);
      const b = h('div', { class: 'say' }, text);
      document.getElementById('fx').appendChild(b);
      const w = Math.min(380, b.offsetWidth);
      b.style.left = Math.max(10, Math.min(UI.W - w - 10, p.x - w / 2)) + 'px';
      b.style.top = Math.max(40, p.y - b.offsetHeight - 10) + 'px';
      setTimeout(() => b.remove(), 2800 / (G.speedMul || 1));
    }

    async function flush() {
      const evs = C.ev.splice(0);
      render();
      let t = 0;
      const at = (ms, fn) => { setTimeout(fn, t / (G.speedMul || 1)); t += ms; };
      for (const ev of evs) {
        switch (ev.k) {
          case 'atk': at(120, () => { const u = E.unit(C, ev.uid); flashClass(ev.uid, u && u.side === 'H' ? 'lunge-r' : 'lunge-l', 300); }); break;
          case 'dmg': at(100, () => {
            if (ev.v > 0) { flashClass(ev.uid, 'hit', 320); floatAt(ev.uid, `-${ev.v}`, ev.dot ? G.ST[ev.dot].c : '#ff5d6c', ev.v >= 15 ? 'big' : ''); A.sfx(ev.v >= 15 ? 'bighit' : 'hit'); }
            else if (ev.blocked) { floatAt(ev.uid, '防御', '#9ec4ff', 'small'); A.sfx('block'); }
          }); break;
          case 'heal': at(80, () => { floatAt(ev.uid, `+${ev.v}`, '#7dffb0'); A.sfx('heal'); }); break;
          case 'blk': at(60, () => { floatAt(ev.uid, `盾+${ev.v}`, '#9ec4ff', 'small', 26); A.sfx('block'); }); break;
          case 'st': at(55, () => {
            const d = G.ST[ev.key];
            if (!d) return;
            floatAt(ev.uid, `${d.n}${ev.v > 0 ? '+' : ''}${ev.v}`, d.c, 'small', 36);
            A.sfx(d.k === 'debuff' ? 'debuff' : 'buff');
          }); break;
          case 'txt': at(80, () => floatAt(ev.uid, ev.s, ev.c, ev.small ? 'small' : '', 0)); break;
          case 'die': at(220, () => { A.sfx('die'); }); break;
          case 'say': at(1600, () => sayBubble(ev.uid, ev.s)); break;
          case 'act': at(260, () => { floatAt(ev.uid, ev.name, '#ffffff', '', -18); if (ev.i === 'hack') A.sfx('hack'); }); break;
          case 'play': at(40, () => floatAt(ev.uid, ev.name, '#ffd93d', 'small', -16)); break;
          case 'round': if (ev.v > 1) at(500, () => UI.banner(`ROUND ${ev.v}`)); break;
          case 'summon': at(160, () => A.sfx('buff')); break;
          default: break;
        }
      }
      await G.sleep(Math.min(t + 120, 2600));
    }

    // ---------- input ----------
    function selectCard(i) {
      if (busy || !inputHero) return;
      const c = inputHero.hand[i];
      if (!c) return;
      if (!E.canPlay(C, inputHero, c)) {
        A.sfx('debuff');
        const d = E.cardDef(c);
        hint.textContent = d.c == null ? 'このカードは使用できない' : inputHero.energy < d.c ? 'エナジーが足りない' : '今は使用できない';
        return;
      }
      if (E.needsTarget(c)) {
        A.sfx('click');
        sel = sel === i ? -1 : i;
        render();
        const vt = E.validTargets(C, inputHero, c);
        // single valid ally target (self) → still require click
        if (sel >= 0 && vt.length === 1 && E.cardDef(c).tg === 'E') { /* keep manual */ }
      } else play(i, null);
    }
    async function play(i, tuid) {
      busy = true;
      sel = -1;
      const ok = E.playCard(C, inputHero, i, tuid);
      if (ok) A.sfx('card');
      await flush();
      busy = false;
      if (C.over || (inputHero && inputHero.dead)) { endHeroTurn(); return; }
      render();
    }
    function onUnitClick(u) {
      if (busy || !inputHero || sel < 0) return;
      const c = inputHero.hand[sel];
      if (c && E.validTargets(C, inputHero, c).includes(u.uid)) play(sel, u.uid);
    }
    function endHeroTurn() {
      if (!waitResolve) return;
      const r = waitResolve;
      waitResolve = null;
      inputHero = null;
      sel = -1;
      r();
    }
    s.addEventListener('click', () => { if (sel >= 0) { sel = -1; render(); } });
    s.addEventListener('contextmenu', (e) => { e.preventDefault(); if (sel >= 0) { sel = -1; render(); } });
    const onKey = (e) => {
      if (document.getElementById('modal')) return;
      if (e.key === 'Escape') { if (sel >= 0) { sel = -1; render(); } return; }
      if ((e.key === 'e' || e.key === 'E' || e.key === ' ') && inputHero && !busy) { e.preventDefault(); endHeroTurn(); return; }
      if (/^[0-9]$/.test(e.key) && inputHero) { const i = e.key === '0' ? 9 : +e.key - 1; selectCard(i); }
    };
    document.addEventListener('keydown', onKey);
    UI.cleanup = () => document.removeEventListener('keydown', onKey);

    function pileModal(title, cards, sorted) {
      const list = sorted ? cards.slice().sort((a, b) => a.id.localeCompare(b.id)) : cards.slice().reverse();
      UI.modal(h('div', null, h('div', { class: 'row' }, h('span', { class: 'ttl' }, `${title}（${cards.length}）`), h('span', { class: 'grow' }), UI.btn('閉じる', UI.closeModal, 'sm')),
        sorted ? h('div', { class: 'sub' }, '※順番は伏せられています') : null,
        h('div', { class: 'cardgrid scroll', style: { maxHeight: '400px', marginTop: '8px', paddingTop: '6px' } }, list.length ? list.map((c) => UI.card(c)) : h('div', { class: 'sub' }, 'なし'))), { w: 820 });
    }
    function menu() {
      UI.modal(h('div', { class: 'col', style: { gap: '10px' } },
        h('div', { class: 'ttl' }, 'メニュー'),
        UI.btn('用語集', () => UI.glossary()),
        UI.btn('サウンド・速度の設定', () => UI.settingsModal()),
        UI.btn('任務を放棄する', () => UI.confirm('任務を放棄しますか？\n集めた資源の70%を持ち帰ります。', () => { stopped = true; UI.runEnd('lose', true); }, '放棄する'), 'pink'),
        UI.btn('閉じる', UI.closeModal, 'sm')), { w: 380 });
    }
    let stopped = false;

    function tutorial() {
      return new Promise((res) => {
        UI.modal(h('div', { class: 'col', style: { gap: '8px', fontSize: '14px', lineHeight: '1.7' } },
          h('div', { class: 'ttl' }, '戦い方'),
          h('div', null, '① 上部のバーは行動順。速度の高い順に、味方と敵が交互に行動します。'),
          h('div', null, '② 味方のターンが来たら、手札のカードをクリック。対象が必要なカードは、続けて敵や味方をクリックします。'),
          h('div', null, '③ カードにはエナジーが必要です（毎ターン3）。使い終わったら「ターン終了」。'),
          h('div', null, '④ 敵の頭上には「次の行動」が表示されます。', h('span', { style: { color: '#ff9e9e' } }, '攻'), '＝攻撃（→は狙われている仲間）、', h('span', { style: { color: '#9ec4ff' } }, '防'), '＝防御、', h('span', { style: { color: '#ff3d8b' } }, '害'), '＝ハッキング など。'),
          h('div', null, '⑤ シールドはダメージを肩代わりし、自分のターン開始時に消えます。タンクの「挑発」で攻撃を引きつけましょう。'),
          h('div', { class: 'sub' }, 'アイコンやキーワードにカーソルを合わせると説明が出ます（スマホはタップ）。キーボード：1〜0でカード、Eでターン終了。'),
          h('div', { style: { textAlign: 'right' } }, UI.btn('はじめる', () => { UI.closeModal(); res(); }, 'pink'))), { w: 640, noClose: true });
      });
    }

    // ---------- main loop ----------
    async function loop() {
      // boss / elite intro lines
      for (const e of E.alive(C, 'E')) if (e.def.intro) C.ev.push({ k: 'say', uid: e.uid, s: e.def.intro });
      render();
      await flush();
      if (!G.meta.flags.tut) { await tutorial(); G.meta.flags.tut = true; G.saveMeta(); }
      UI.banner(kind === 'boss' ? 'BOSS BATTLE' : kind === 'elite' ? 'ELITE' : 'BATTLE START', kind === 'boss' ? '#e8352e' : null);
      await G.sleep(700);
      while (!stopped) {
        const u = E.advance(C);
        await flush();
        if (stopped) return;
        if (!u) break;
        if (u.side === 'E') {
          render();
          await G.sleep(320);
          if (stopped) return;
          E.enemyAct(C, u);
          await flush();
          if (!C.over) { E.endTurn(C, u); await flush(); }
          continue;
        }
        inputHero = u;
        busy = false;
        A.sfx('turn');
        render();
        await new Promise((r) => (waitResolve = r));
        if (stopped) return;
        busy = true;
        if (!C.over) { E.endTurn(C, u); await flush(); }
      }
      if (stopped) return;
      await finish();
    }

    async function finish() {
      render();
      if (C.over === 'win') {
        A.sfx('win');
        UI.banner(kind === 'boss' ? 'BOSS DEFEATED' : 'VICTORY', '#b8ff3d');
        await G.sleep(1100);
        run.stats.fights++;
        if (kind === 'elite') run.stats.elites++;
        if (kind === 'boss') { run.stats.bosses++; G.setFlag(['a1boss', 'a2boss', 'a3boss'][run.act - 1]); }
        if (group.includes('mothercopy')) G.setFlag('copy');
        G.applyCombatToRun(run, C);
        const rw = G.combatRewards(run, C, kind, bonus);
        UI.reward(rw, kind);
      } else {
        A.sfx('lose');
        UI.banner('全滅……', '#e8352e');
        await G.sleep(1600);
        UI.runEnd('lose');
      }
    }

    // expose for testing
    UI._combat = { C, get inputHero() { return inputHero; }, get busy() { return busy; }, selectCard, onUnitClick, endHeroTurn, play };
    loop();
  };
})();
