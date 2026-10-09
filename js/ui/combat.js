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

  const ICON = { atk: '攻', def: '防', buf: '強', deb: '弱', hack: '害', heal: '癒', sum: '召', steal: '盗', flee: '逃', boom: '爆' };

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
        case 'dmg': parts.push(`${pre}${ref ? E.previewAttack(C, u, ref, args[0], args[2] || {}) : args[0]}ダメージ${args[1] > 1 ? '×' + args[1] : ''}${args[2] && args[2].ai ? `（AIの仲間には${args[2].ai}倍）` : ''}`); break;
        case 'drain': parts.push(`${pre}${ref ? E.previewAttack(C, u, ref, args[0], {}) : args[0]}ダメージ（与えた分回復）`); break;
        case 'blk': parts.push(`${pre}シールド${Math.round(args[0] * G.EK.blk)}`); break;
        case 'heal': parts.push(`${pre}HP${Math.round(args[0] * G.EK.heal)}回復`); break;
        case 'st': parts.push(`${pre}${G.ST[args[0]].n}${args[1]}`); break;
        case 'noise': parts.push(`${pre}ノイズカード${args[0]}枚を混入（ハッキング）`); break;
        case 'summon': parts.push(`${G.ENEMIES[args[0]].n}を${args[1] || 1}体呼ぶ`); break;
        case 'cleanse': parts.push('自身のデバフを解除'); break;
        case 'selfdestruct': parts.push(`自爆し、仲間全員に${ref ? E.previewAttack(C, u, ref, args[0], {}) : args[0]}ダメージ`); break;
        case 'stealCred': parts.push(`クレジットを${args[0]}盗む（倒せば取り返せる）`); break;
        case 'flee': parts.push('盗んだものを持って逃走する'); break;
        case 'erase': parts.push(`${pre}山札のカード${args[0]}枚を、この戦闘のあいだ消去する`); break;
        case 'strip': parts.push(`${pre}バフ（永続でないもの）をすべて消す`); break;
        default: break;
      }
    }
    return parts.join('。');
  }

  UI.combat = (group, kind, bonus, extra) => {
    const run = G.run;
    extra = extra || {};
    const C = E.create(run, group, { kind, wanted: extra.wanted, jam: extra.jam });
    C.viz = true;
    const snap0 = E.snap(C);
    E.begin(C, { startBlock: G.meta.fac.core >= 2 ? 3 : 0 });
    G.speedMul = G.meta.settings.speed || 1;
    const s = UI.screen('combat');
    UI.actBg(s, run);
    A.runBgm(run, kind === 'boss' ? 'boss' : kind === 'elite' ? 'elite' : 'battle');
    if (kind === 'boss') A.sfx('boss');

    // ---------- layout ----------
    const turnbar = h('div', { class: 'turnbar' });
    const field = h('div', { class: 'field layer', style: { position: 'absolute', inset: 'auto', left: 0, right: 0, top: '34px', height: '300px' } });
    const whoBox = h('div', { class: 'who' });
    const handEl = h('div', { class: 'hand' });
    const endBtn = UI.btn('ターン終了', () => { if (!busy && inputHero) { endHeroTurn(); } }, 'big endbtn');
    const itemBox = h('div', { class: 'hitems' });
    const hud = h('div', { class: 'hud layer', style: { position: 'absolute', inset: 'auto', left: 0, right: 0, bottom: 0, height: '206px' } }, whoBox, handEl, itemBox, endBtn);
    const hint = h('div', { class: 'hint' });
    const zoom = h('div', { class: 'cardzoom hidden' });
    s.appendChild(field); s.appendChild(hud); s.appendChild(turnbar); s.appendChild(hint); s.appendChild(zoom);
    let lastPT = 'mouse'; // pointer type of the last press on a card

    const els = {};
    const slotOf = {};
    let inputHero = null, sel = -1, busy = true, waitResolve = null, hoverUid = null;
    let kcur = null, lastFoe = null; // keyboard target cursor (uid) / last enemy targeted

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
      const root = h('div', { class: 'unit idle' + (u.summoned ? ' spawn' : '') + (u.bug ? ' bugged' : '') }, intent, spr, nm, bar, hpt, sts);
      const pos = assignSlot(u);
      root.style.left = pos.x + 'px';
      root.style.top = pos.y - sz.h * G.sprScale(spriteName, sc) + 'px';
      root.dataset.uid = String(u.uid);
      root.addEventListener('click', (e) => { e.stopPropagation(); onUnitClick(u); });
      root.addEventListener('mouseenter', () => { hoverUid = u.uid; if (selTargets().includes(u.uid)) kcur = u.uid; markTargets(); });
      root.addEventListener('mouseleave', () => { if (hoverUid === u.uid) hoverUid = null; markTargets(); });
      field.appendChild(root);
      els[u.uid] = { root, spr, img, blk, fill, hpt, sts, intent, nm };
      return els[u.uid];
    }

    const KIND_ORDER = { buff: 0, power: 1, debuff: 2 };
    // v: optional snapshot (hp/blk/st/dead) from an engine event; without it, the live state is drawn
    function updUnit(u, v) {
      const el = els[u.uid] || mkUnit(u);
      const s = v || u;
      el.root.classList.toggle('dead', !!s.dead);
      if (s.fled) el.root.classList.add('fled');
      if (!v) el.root.classList.toggle('cur', C.cur === u);
      const r = s.hp / s.maxHp;
      el.fill.style.width = Math.max(0, r * 100) + '%';
      el.fill.className = 'fill ' + (u.side === 'E' ? '' : r > 0.6 ? 'hi' : r > 0.3 ? 'mid' : '');
      el.hpt.textContent = s.dead ? (u.side === 'H' ? '戦闘不能' : '撃破') : `${s.hp}/${s.maxHp}`;
      if (s.blk > 0 && !s.dead) { el.blk.classList.remove('hidden'); el.blk.textContent = s.blk; } else el.blk.classList.add('hidden');
      // status chips: buffs → powers → debuffs; a chip pops when it is new or grows
      const prev = el.prevSt || {};
      const st = s.dead ? {} : s.st;
      const keys = Object.keys(st).filter((k) => G.ST[k]).sort((a, b) => KIND_ORDER[G.stKind(a)] - KIND_ORDER[G.stKind(b)]);
      const sig = keys.map((k) => k + st[k]).join(',');
      if (sig !== el.stSig) {
        el.stSig = sig;
        el.sts.innerHTML = '';
        let lastKind = null;
        for (const k of keys) {
          const d = G.ST[k];
          const kind = G.stKind(k);
          if (lastKind && kind === 'debuff' && lastKind !== 'debuff') el.sts.appendChild(h('span', { class: 'stsep' }));
          lastKind = kind;
          const grew = !(k in prev) || st[k] > prev[k];
          el.sts.appendChild(h('span', { class: `st ${kind}${grew && el.prevSt ? ' pop' : ''}`, style: { '--c': d.c }, 'data-tip': G.stTip(k, st[k]) }, d.g, h('sub', null, String(st[k]))));
        }
      }
      el.prevSt = Object.assign({}, st);
      if (u.side === 'E' && !v) {
        const info = !u.dead && E.intentInfo(C, u);
        if (info) {
          const m = info.m;
          el.intent.className = 'intent ' + m.i;
          el.intent.innerHTML = '';
          el.intent.appendChild(h('span', null, ICON[m.i] || '？'));
          if (info.dmg != null) {
            const cls = info.dmg > info.base ? 'up' : info.dmg < info.base ? 'dn' : '';
            el.intent.appendChild(h('span', { class: 'idmg ' + cls }, `${info.dmg}${info.hits > 1 ? '×' + info.hits : ''}`));
          }
          if (info.aoe) el.intent.appendChild(h('span', { class: 'tgt' }, '全体'));
          else if (info.t) el.intent.appendChild(h('span', { class: 'tgt' }, '→' + info.t.n));
          const mods = info.mods && info.mods.length ? `<div class="tf">${info.mods.map((x) => `<span class="${x.up ? 'mup' : 'mdn'}">${x.s}</span>`).join('<br>')}</div>` : '';
          el.intent.dataset.tip = `<div class="tn">${m.n}</div>${moveText(C, u, m)}${mods}`;
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
        el.root.classList.toggle('kbsel', vt.includes(u.uid) && kcur === u.uid);
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
        h('div', { class: 'row' }, G.sprImg(u.id, 2), h('div', { class: 'col', style: { gap: '0' } }, h('span', { style: { fontSize: '15px', color: d.col } }, d.n), h('span', { class: 'sub', 'data-tip': `<div class="tn">${d.trait.n}</div>${d.trait.d}` }, '特性：' + d.trait.n), u.gear ? h('span', { class: 'sub row', style: { gap: '3px' } }, UI.gearChip(u.gear.id, true), u.gear.n) : null)),
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
        el.addEventListener('click', (e) => { e.stopPropagation(); if (justDragged) return; if (lastPT === 'touch') touchCard(i); else selectCard(i); });
        el.addEventListener('pointerdown', (e) => startDrag(e, i, el));
        el.dataset.k = String((i + 1) % 10);
        handEl.appendChild(el);
      });
      endBtn.disabled = busy;
      endBtn.classList.toggle('glow', !anyPlayable && !busy);
      renderItems();
    }
    // 支給品 pouch: usable on any hero's turn
    function renderItems() {
      itemBox.innerHTML = '';
      if (!(run.items || []).length) return;
      itemBox.appendChild(UI.itemRow(run, (i) => useItem(i)));
    }
    async function useItem(i) {
      if (busy || !inputHero) return;
      const id = run.items[i];
      if (!E.canUseItem(C, inputHero, id)) { UI.float(480, 300, '今は使えない', '#9a9cb2'); return; }
      busy = true;
      sel = -1;
      A.sfx('buff');
      E.useItem(C, inputHero, i);
      G.saveRun();
      await flush();
      busy = false;
      if (C.over || (inputHero && inputHero.dead)) { endHeroTurn(); return; }
      render();
    }

    function renderHint() {
      if (inputHero && sel >= 0) {
        const c = inputHero.hand[sel];
        const d = c && E.cardDef(c);
        hint.textContent = !d ? '' : !E.needsTarget(c) ? '「使う」か、もう一度カードをタップで発動' : (d.tg === 'A' ? '対象の味方を' : d.tg === 'D' ? '蘇生する仲間を' : '対象の敵を') + (UI.isTouch ? 'タップ' : 'クリック（キーボード：←→で選択、Enter／同じ数字で決定）');
      } else if (inputHero) hint.textContent = UI.isTouch ? `${inputHero.n}のターン — カードをタップで拡大／キャラをタップで詳細` : `${inputHero.n}のターン — カードをクリック、またはドラッグして使用`;
      else hint.textContent = '';
    }

    function render() {
      C.units.forEach((u) => updUnit(u));
      renderChrome();
      renderZoom();
    }
    // touch: a tapped card is shown large so it can be read before using it
    let zoomOn = false;
    function renderZoom() {
      const c = zoomOn && inputHero && sel >= 0 ? inputHero.hand[sel] : null;
      zoom.classList.toggle('hidden', !c);
      zoom.innerHTML = '';
      if (!c) return;
      const needs = E.needsTarget(c);
      zoom.appendChild(UI.card(c, { u: inputHero, C, cls: 'big' }));
      zoom.appendChild(h('div', { class: 'col', style: { gap: '6px', alignItems: 'stretch' } },
        needs ? h('div', { class: 'zhint' }, '対象をタップ') : UI.btn('使う', () => { const i = sel; zoomOn = false; play(i, null); }, 'pink'),
        needs && selTargets().includes(kcur) ? UI.btn(`▶の対象に使う`, () => { const i = sel; zoomOn = false; play(i, kcur); }, 'sm') : null,
        UI.btn('やめる', () => { sel = -1; zoomOn = false; render(); }, 'sm')));
    }
    function touchCard(i) {
      if (busy || !inputHero) return;
      const c = inputHero.hand[i];
      if (!c) return;
      if (!E.canPlay(C, inputHero, c)) { selectCard(i); return; }
      if (sel === i) {
        // second tap on the same card uses it (on the ▶ target for targeted cards)
        if (!E.needsTarget(c)) { zoomOn = false; play(i, null); return; }
        if (selTargets().includes(kcur)) { zoomOn = false; play(i, kcur); }
        return;
      }
      A.sfx('click');
      sel = i;
      zoomOn = true;
      kcur = E.needsTarget(c) ? defaultTarget(c) : null;
      render();
    }
    // everything except unit bars/statuses (those follow the event snapshots during flush)
    function renderChrome() {
      for (const u of C.units) if (els[u.uid]) els[u.uid].root.classList.toggle('cur', C.cur === u);
      renderTurnbar();
      renderHud();
      renderHint();
      markTargets();
    }
    function applySnap(snap) {
      for (const sv of snap) { const u = E.unit(C, sv.uid); if (u) updUnit(u, sv); }
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
    let sayEl = null, sayTm = null;
    function sayBubble(uid, text) {
      const u = E.unit(C, uid);
      if (!u) return;
      if (sayEl) sayEl.remove();
      clearTimeout(sayTm);
      sayEl = h('div', { class: 'say' }, h('div', { class: 'sayn' }, u.n), text);
      document.getElementById('fx').appendChild(sayEl);
      flashClass(uid, 'speaking', 3200);
      const b = sayEl;
      sayTm = setTimeout(() => { b.remove(); if (sayEl === b) sayEl = null; }, 3400 / (G.speedMul || 1));
    }

    // Plays queued engine events in order. Each event carries a snapshot of the battle state right after
    // it happened, so HP bars / shields / statuses change exactly when the matching animation plays.
    async function flush() {
      const evs = C.ev.splice(0);
      renderChrome();
      const steps = [];
      const at = (ms, fn, ev) => steps.push({ ms, fn, snap: ev.snap, say: ev.k === 'say' });
      for (const ev of evs) {
        switch (ev.k) {
          case 'atk': at(120, () => { const u = E.unit(C, ev.uid); flashClass(ev.uid, u && u.side === 'H' ? 'lunge-r' : 'lunge-l', 300); }, ev); break;
          case 'dmg': at(ev.v > 0 || ev.blocked ? 160 : 0, () => {
            if (ev.blocked) { flashBlk(ev.uid); floatAt(ev.uid, `盾-${ev.blocked}`, '#9ec4ff', 'small', ev.v > 0 ? 30 : 10); }
            if (ev.v > 0) { flashClass(ev.uid, 'hit', 320); floatAt(ev.uid, `-${ev.v}`, ev.dot ? G.ST[ev.dot].c : '#ff5d6c', ev.v >= 15 ? 'big' : ''); A.sfx(ev.v >= 15 ? 'bighit' : 'hit'); }
            else if (ev.blocked) A.sfx('block');
          }, ev); break;
          case 'heal': at(80, () => { floatAt(ev.uid, `+${ev.v}`, '#7dffb0'); A.sfx('heal'); }, ev); break;
          case 'blk': at(60, () => { floatAt(ev.uid, `盾+${ev.v}`, '#9ec4ff', 'small', 26); A.sfx('block'); }, ev); break;
          case 'st': at(70, () => {
            const d = G.ST[ev.key];
            if (!d) return;
            const neg = d.k === 'debuff';
            // ▲ = good for the unit, ▼ = bad (a buff going down counts as bad)
            const good = neg ? ev.v < 0 : ev.v > 0;
            floatAt(ev.uid, `${good ? '▲' : '▼'}${d.n}${ev.v > 0 ? '+' : ''}${ev.v}`, d.c, 'small st-' + (good ? 'good' : 'bad'), 36);
            A.sfx(neg ? 'debuff' : 'buff');
          }, ev); break;
          case 'txt': at(80, () => floatAt(ev.uid, ev.s, ev.c, ev.small ? 'small' : '', 0), ev); break;
          case 'die': at(220, () => { A.sfx('die'); }, ev); break;
          case 'say': at(1600, () => sayBubble(ev.uid, ev.s), ev); break;
          case 'act': at(260, () => { floatAt(ev.uid, ev.name, '#ffffff', '', -18); if (ev.i === 'hack') A.sfx('hack'); }, ev); break;
          case 'play': at(40, () => floatAt(ev.uid, ev.name, '#ffd93d', 'small', -16), ev); break;
          case 'round': at(ev.v > 1 ? 500 : 0, ev.v > 1 ? () => UI.banner(`ROUND ${ev.v}`) : null, ev); break;
          case 'summon': at(160, () => A.sfx('buff'), ev); break;
          default: at(0, null, ev); break;
        }
      }
      // long chains are compressed (dialogue keeps its reading time) so a turn never drags
      const busyMs = steps.reduce((s, x) => s + (x.say ? 0 : x.ms), 0);
      const k = busyMs > 2600 ? 2600 / busyMs : 1;
      const mul = G.speedMul || 1;
      let t = 0;
      for (const st of steps) {
        setTimeout(() => { if (st.snap) applySnap(st.snap); if (st.fn) st.fn(); }, t / mul);
        t += st.say ? st.ms : st.ms * k;
      }
      await G.sleep(t + 120);
      render();
    }
    function flashBlk(uid) {
      const el = els[uid];
      if (!el) return;
      el.blk.classList.remove('bhit');
      void el.blk.offsetWidth;
      el.blk.classList.add('bhit');
    }

    // ---------- input ----------
    function selectCard(i, fromKey) {
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
        // pressing the same number key again plays the card on the cursor target
        if (fromKey && sel === i && selTargets().includes(kcur)) { play(i, kcur); return; }
        A.sfx('click');
        sel = sel === i ? -1 : i;
        if (sel >= 0) kcur = defaultTarget(c);
        render();
      } else play(i, null);
    }
    // valid targets of the selected card, ordered left → right on screen
    function selTargets() {
      const c = inputHero && sel >= 0 ? inputHero.hand[sel] : null;
      if (!c) return [];
      const x = (uid) => (els[uid] ? parseFloat(els[uid].root.style.left) : 0);
      return E.validTargets(C, inputHero, c).slice().sort((a, b) => x(a) - x(b));
    }
    function defaultTarget(c) {
      const vt = selTargets();
      if (!vt.length) return null;
      const d = E.cardDef(c);
      if (d.tg === 'E') return vt.includes(lastFoe) ? lastFoe : vt[0];
      if (d.tg === 'A') return vt.map((id) => E.unit(C, id)).reduce((a, b) => (b.hp / b.maxHp < a.hp / a.maxHp ? b : a)).uid;
      return vt[0];
    }
    function moveCursor(step) {
      const vt = selTargets();
      if (!vt.length) return;
      const i = vt.indexOf(kcur);
      kcur = vt[(i < 0 ? 0 : i + step + vt.length) % vt.length];
      A.sfx('click');
      markTargets();
    }
    async function play(i, tuid) {
      busy = true;
      sel = -1;
      zoomOn = false;
      const tu = tuid != null && E.unit(C, tuid);
      if (tu && tu.side === 'E') lastFoe = tuid;
      const ok = E.playCard(C, inputHero, i, tuid);
      if (ok) A.sfx('card');
      await flush();
      busy = false;
      if (C.over || (inputHero && inputHero.dead)) { endHeroTurn(); return; }
      render();
    }
    // ---- drag & drop: drag a card onto a target (or onto the field for untargeted cards) ----
    let drag = null, justDragged = false;
    function unitAt(cx, cy) {
      const el = document.elementFromPoint(cx, cy);
      const r = el && el.closest && el.closest('.unit');
      return r ? E.unit(C, +r.dataset.uid) : null;
    }
    function startDrag(e, i, el) {
      lastPT = e.pointerType || 'mouse';
      if (busy || !inputHero || e.button > 0) return;
      const c = inputHero.hand[i];
      if (!c) return;
      drag = { i, el, x0: e.clientX, y0: e.clientY, on: false, ghost: null, over: null };
      document.addEventListener('pointermove', onDragMove);
      document.addEventListener('pointerup', onDragEnd);
      document.addEventListener('pointercancel', cancelDrag);
    }
    function onDragMove(e) {
      if (!drag) return;
      if (!drag.on) {
        if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
        const c = inputHero && inputHero.hand[drag.i];
        if (!c || busy || !E.canPlay(C, inputHero, c)) { if (c) selectCard(drag.i); cancelDrag(); return; }
        drag.on = true;
        drag.needs = E.needsTarget(c);
        sel = drag.i;
        render();
        drag.ghost = UI.card(c, { u: inputHero, C, cls: 'ghost' });
        document.getElementById('fx').appendChild(drag.ghost);
      }
      const p = UI.toGame(e.clientX, e.clientY);
      drag.ghost.style.left = p.x + 'px';
      drag.ghost.style.top = p.y + 'px';
      const u = drag.needs ? unitAt(e.clientX, e.clientY) : null;
      const ok = u && E.validTargets(C, inputHero, inputHero.hand[drag.i]).includes(u.uid);
      const over = ok ? u.uid : null;
      if (over !== drag.over) {
        if (drag.over && els[drag.over]) els[drag.over].root.classList.remove('droptarget');
        if (over && els[over]) els[over].root.classList.add('droptarget');
        drag.over = over;
      }
      const inField = p.y < 360;
      drag.ghost.classList.toggle('armed', drag.needs ? !!over : inField);
    }
    function onDragEnd(e) {
      if (!drag) return;
      const d = drag;
      cleanupDrag();
      if (!d.on) return;
      justDragged = true;
      setTimeout(() => { justDragged = false; }, 0);
      const p = UI.toGame(e.clientX, e.clientY);
      if (d.needs) {
        if (d.over) play(d.i, d.over);
        else { sel = -1; render(); }
      } else if (p.y < 360) play(d.i, null);
      else { sel = -1; render(); }
    }
    function cleanupDrag() {
      if (!drag) return;
      if (drag.ghost) drag.ghost.remove();
      if (drag.over && els[drag.over]) els[drag.over].root.classList.remove('droptarget');
      drag = null;
      document.removeEventListener('pointermove', onDragMove);
      document.removeEventListener('pointerup', onDragEnd);
      document.removeEventListener('pointercancel', cancelDrag);
    }
    function cancelDrag() { cleanupDrag(); }

    function onUnitClick(u) {
      if (sel < 0 || busy || !inputHero) { if (!drag) unitInfo(u); return; }
      const c = inputHero.hand[sel];
      if (c && E.validTargets(C, inputHero, c).includes(u.uid)) { zoomOn = false; play(sel, u.uid); }
    }
    function unitInfo(u) {
      if (u.dead) return;
      A.sfx('click');
      const sts = Object.keys(u.st).filter((k) => G.ST[k]);
      const info = u.side === 'E' && E.intentInfo(C, u);
      const d = u.side === 'H' ? G.HEROES[u.id] : null;
      UI.modal(h('div', { class: 'unitinfo col', style: { gap: '8px' } },
        h('div', { class: 'row', style: { gap: '14px', alignItems: 'flex-start' } },
          G.sprImg(u.id, G.sprSize(u.id).w > 20 ? 3 : 5),
          h('div', { class: 'col grow', style: { gap: '4px' } },
            h('div', { class: 'row' }, h('span', { class: 'ttl', style: { fontSize: '20px', color: d ? d.col : '#ff9e9e' } }, u.n), h('span', { class: 'grow' }), UI.btn('閉じる', UI.closeModal, 'sm')),
            h('div', null, `HP ${u.hp}/${u.maxHp}`, u.blk ? h('span', { style: { color: '#9ec4ff', marginLeft: '12px' } }, `シールド ${u.blk}`) : null, h('span', { class: 'sub', style: { marginLeft: '12px' } }, `速度 ${E.speed(u)}`)),
            d ? h('div', null, h('span', { style: { color: '#ffd93d' } }, `特性「${d.trait.n}」`), ' ', d.trait.d) : null,
            u.gear ? h('div', { class: 'row' }, '装備：', UI.gearChip(u.gear.id), u.gear.n, h('span', { class: 'sub' }, u.gear.d)) : null,
            info ? h('div', { class: 'intentbox' }, h('span', { style: { color: '#ff9e9e' } }, `次の行動「${info.m.n}」`), h('div', null, moveText(C, u, info.m))) : null,
            u.side === 'E' && u.def.lore ? h('div', { class: 'sub' }, u.def.lore) : null)),
        h('div', { class: 'col', style: { gap: '4px' } }, sts.length ? sts.map((k) => h('div', { class: 'row', style: { gap: '8px' } },
          h('span', { class: 'st ' + G.stKind(k), style: { '--c': G.ST[k].c } }, G.ST[k].g, h('sub', null, String(u.st[k]))),
          h('span', { style: { color: G.ST[k].c } }, G.ST[k].n), h('span', null, G.stDesc(k, u.st[k])))) : h('div', { class: 'sub' }, '状態異常なし'))), { w: 620 });
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
      // a targeted card is selected: ←→ / A D / Tab move the cursor, Enter / Space play it
      if (sel >= 0 && inputHero && !busy) {
        const k = e.key;
        if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'a' || k === 'A' || (k === 'Tab' && e.shiftKey)) { e.preventDefault(); moveCursor(-1); return; }
        if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'd' || k === 'D' || k === 'Tab') { e.preventDefault(); moveCursor(1); return; }
        if (k === 'Enter' || k === ' ') { e.preventDefault(); if (selTargets().includes(kcur)) play(sel, kcur); return; }
      }
      if ((e.key === 'e' || e.key === 'E' || e.key === ' ') && inputHero && !busy) { e.preventDefault(); endHeroTurn(); return; }
      if (/^[0-9]$/.test(e.key) && inputHero) { const i = e.key === '0' ? 9 : +e.key - 1; selectCard(i, true); }
    };
    document.addEventListener('keydown', onKey);
    UI.cleanup = () => { document.removeEventListener('keydown', onKey); cleanupDrag(); };

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
          h('div', null, '② 味方のターンが来たら、手札のカードを使います。カードを対象（敵・味方）へドラッグ＆ドロップするか、カード→対象の順にクリック。対象のないカードは場へドラッグするかクリックで発動。'),
          h('div', null, '③ カードにはエナジーが必要です（毎ターン3）。使い終わったら「ターン終了」。'),
          h('div', null, '④ 敵の頭上には「次の行動」が表示されます。', h('span', { style: { color: '#ff9e9e' } }, '攻'), '＝攻撃（→は狙われている仲間）、', h('span', { style: { color: '#9ec4ff' } }, '防'), '＝防御、', h('span', { style: { color: '#ff3d8b' } }, '害'), '＝ハッキング など。'),
          h('div', null, '⑤ シールドはダメージを肩代わりし、自分のターン開始時に消えます。タンクの「挑発」で攻撃を引きつけましょう。'),
          h('div', { class: 'sub' }, 'アイコンやキーワードにカーソルを合わせると説明が出ます（スマホはタップ）。キーボード：1〜0でカード → ←→で対象 → Enter（同じ数字でも可）、Eでターン終了。'),
          h('div', { style: { textAlign: 'right' } }, UI.btn('はじめる', () => { UI.closeModal(); res(); }, 'pink'))), { w: 640, noClose: true });
      });
    }

    // ---------- main loop ----------
    async function loop() {
      // boss / elite intro lines
      for (const e of E.alive(C, 'E')) if (e.def.intro) C.ev.push({ k: 'say', uid: e.uid, s: e.def.intro, snap: E.snap(C) });
      applySnap(snap0); // start from the pre-battle state so opening shields/statuses animate in
      renderChrome();
      await flush();
      if (!G.meta.flags.tut) { await tutorial(); G.meta.flags.tut = true; G.saveMeta(); }
      UI.banner(kind === 'boss' ? 'BOSS BATTLE' : C.wanted ? 'WANTED' : kind === 'elite' ? 'ELITE' : 'BATTLE START', kind === 'boss' || C.wanted ? '#e8352e' : null);
      if (C.wanted) UI.float(480, 200, `指名手配：${G.WANTED[C.wanted].n}`, '#ff5a5a');
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
        if (kind === 'boss') {
          run.stats.bosses++;
          if (run.act <= 2) G.setFlag(['a1boss', 'a2boss'][run.act - 1]);
          if (group.includes('sophia')) G.setFlag('a3boss');
          if (group.includes('noah')) G.setFlag('a4boss');
          G.setFlag(group[0]);
        }
        if (group.includes('incinerator')) G.setFlag('hestia');
        if (group.includes('archivist')) G.setFlag('mnemo');
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
    UI._combat = { C, get inputHero() { return inputHero; }, get busy() { return busy; }, selectCard, onUnitClick, endHeroTurn, play, render };
    loop();
  };
})();
