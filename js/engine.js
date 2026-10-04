// Combat engine (pure logic; UI reads C.ev for animations)
(function () {
  const G = globalThis.G;
  const E = {};
  G.E = E;

  const HAND_MAX = 10;
  const DRONE_MAX = 10;
  const ENEMY_MAX = 5;
  // global enemy tuning (party of four outputs a lot of damage)
  const EK = (G.EK = { hp: 2.3, dmg: 1.6, blk: 1.8, heal: 2.0, hpAct: [1, 1, 1.1, 0.9], dmgAct: [1, 1, 1.12, 0.88] });

  // ---------- card helpers ----------
  E.cardDef = (card) => {
    const b = G.CARDS[card.id];
    if (!card.up) return b;
    return Object.assign({}, b, {
      fx: b.u || b.fx,
      c: b.uc !== undefined ? b.uc : b.c,
      x: b.ux !== undefined ? b.ux : b.x,
      upgraded: true,
    });
  };
  E.canUpgrade = (card) => {
    const b = G.CARDS[card.id];
    return !card.up && b && b.r >= 0 && (b.u || b.uc !== undefined || b.ux !== undefined);
  };

  // ---------- unit queries ----------
  E.alive = (C, side) => C.units.filter((u) => u.side === side && !u.dead);
  E.allies = (C, u) => E.alive(C, u.side);
  E.foes = (C, u) => E.alive(C, u.side === 'H' ? 'E' : 'H');
  E.unit = (C, uid) => C.units.find((u) => u.uid === uid);
  E.speed = (u) => Math.max(0, u.spd + (u.st.haste > 0 ? 3 : 0) - (u.st.slow > 0 ? 3 : 0));
  E.lowestAlly = (C, side) => {
    const a = E.alive(C, side);
    if (!a.length) return null;
    return a.reduce((m, u) => (u.hp / u.maxHp < m.hp / m.maxHp ? u : m));
  };
  E.hasRelic = (C, id) => C.run.relics.includes(id);
  // C.viz: attach a per-event snapshot so the UI can update bars in sync with each animation
  const push = (C, ev) => { if (C.viz) ev.snap = E.snap(C); C.ev.push(ev); };
  E.snap = (C) => C.units.map((u) => ({ uid: u.uid, hp: u.hp, maxHp: u.maxHp, blk: u.blk, st: Object.assign({}, u.st), dead: !!u.dead, fled: !!u.fled }));

  // ---------- creation ----------
  function mkHero(C, h, i) {
    const def = G.HEROES[h.id];
    const u = {
      uid: C.seq++, side: 'H', id: h.id, def, n: def.n, idx: i,
      hp: h.hp, maxHp: h.maxHp, blk: 0, st: {}, fresh: {},
      spd: def.spd + (E.hasRelic(C, 'watch') ? 1 : 0),
      draw: G.shuffle(h.deck.map((c) => ({ id: c.id, up: c.up, cid: C.seq++ }))),
      hand: [], disc: [], exh: [], energy: 0, played: 0, firstTurn: true, ref: h,
    };
    return u;
  }
  function mkEnemy(C, id) {
    const def = G.ENEMIES[id];
    const d = C.diff;
    const hp = Math.round(def.hp * d.hp * EK.hp * EK.hpAct[C.run.act || 1]);
    const u = {
      uid: C.seq++, side: 'E', id, def, n: def.n, hp, maxHp: hp, blk: 0, st: {}, fresh: {},
      spd: def.spd, moves: def.moves, mi: 0, phase: 0, boss: !!def.boss, elite: !!def.elite,
      intent: null, lastMove: -1, sameCount: 0,
    };
    if (def.passive) Object.assign(u.st, def.passive);
    if ((u.boss || u.elite) && C.run.diff >= 3) u.st.str = (u.st.str || 0) + 2;
    return u;
  }

  E.create = (run, group, opts) => {
    opts = opts || {};
    const C = {
      run, kind: opts.kind || 'normal', units: [], round: 0, queue: [], cur: null,
      ev: [], over: null, seq: 1, diff: G.DIFF[run.diff], lullabyUsed: false,
      firewall: run.relics.includes('firewall') ? 3 : 0, credGained: 0, lootScrap: 0,
    };
    run.heroes.forEach((h, i) => C.units.push(mkHero(C, h, i)));
    group.forEach((id) => C.units.push(mkEnemy(C, id)));
    return C;
  };

  E.begin = (C, opts) => {
    opts = opts || {};
    for (const u of E.alive(C, 'H')) {
      if (u.id === 'gallon') { E.addSt(C, u, 'taunt', 2, u); E.gainBlock(C, u, 6); }
      if (u.id === 'doll') E.addSt(C, u, 'thorns', 2, u);
      if (u.id === 'chip') E.alive(C, 'E').forEach((e) => E.addSt(C, e, 'virus', 3, u));
      if (u.id === 'pixe') E.addSt(C, u, 'charge', 3, u);
      if (u.id === 'nezu') E.addSt(C, u, 'drone', 2, u);
      if (u.id === 'mike') E.addSt(C, u, 'stealth', 1, u);
      if (opts.startBlock) E.gainBlock(C, u, opts.startBlock);
    }
    for (const rid of C.run.relics) {
      const r = G.RELICS[rid];
      if (r && r.start) r.start(C, E);
    }
    for (const e of E.alive(C, 'E')) pickIntent(C, e);
  };

  // ---------- turn flow ----------
  function startRound(C) {
    C.round++;
    const order = C.units.filter((u) => !u.dead);
    order.sort((a, b) => E.speed(b) - E.speed(a) || (a.side === b.side ? a.uid - b.uid : a.side === 'H' ? -1 : 1));
    C.queue = order.map((u) => u.uid);
    push(C, { k: 'round', v: C.round });
    for (const rid of C.run.relics) {
      const r = G.RELICS[rid];
      if (r && r.round) r.round(C, E);
    }
    checkEnd(C);
  }
  E.upcoming = (C) => C.queue.map((uid) => E.unit(C, uid)).filter((u) => u && !u.dead);

  // returns the unit ready to act (hero waits for input) or null when combat over
  E.advance = (C) => {
    for (let guard = 0; guard < 200; guard++) {
      if (C.over) return null;
      if (!C.queue.length) startRound(C);
      if (C.over) return null;
      const u = E.unit(C, C.queue.shift());
      if (!u || u.dead) continue;
      C.cur = u;
      u.fresh = {};
      const ok = startTurn(C, u);
      checkEnd(C);
      if (C.over) return null;
      if (!ok) { E.endTurn(C, u); continue; }
      return u;
    }
    return null;
  };

  function noDecayActive(C, u) {
    return u.side === 'E' && E.alive(C, 'H').some((h) => h.st.noDecay);
  }

  function startTurn(C, u) {
    if (!(u.st.fortify > 0)) u.blk = 0;
    push(C, { k: 'turn', uid: u.uid });
    // damage over time
    if (u.st.burn > 0) { const v = u.st.burn; E.dealDamage(C, u, v, { pierce: true, dot: 'burn' }); u.st.burn = Math.floor(v / 2); }
    if (!u.dead && u.st.virus > 0) { const v = u.st.virus; E.dealDamage(C, u, v, { pierce: true, dot: 'virus' }); if (!noDecayActive(C, u)) u.st.virus = v - 1; }
    if (!u.dead && u.st.regen > 0) { E.heal(C, null, u, u.st.regen); u.st.regen--; }
    cleanZero(u);
    if (u.dead) return false;
    // powers
    const s = u.st;
    if (s.plating) E.gainBlock(C, u, s.plating);
    if (s.armorUp) E.gainBlock(C, u, s.armorUp);
    if (s.medic) E.allies(C, u).forEach((a) => E.heal(C, u, a, s.medic));
    if (s.nurse) { const a = E.lowestAlly(C, u.side); if (a) E.heal(C, u, a, s.nurse); }
    if (s.guardian) E.allies(C, u).forEach((a) => E.gainBlock(C, a, s.guardian));
    if (s.dynamo) E.addSt(C, u, 'charge', s.dynamo, u);
    if (s.backdoor) E.foes(C, u).forEach((f) => E.addSt(C, f, 'virus', s.backdoor, u));
    if (s.nest) E.addSt(C, u, 'drone', s.nest, u);
    if (s.rage) { E.loseHp(C, u, 2); E.addSt(C, u, 'str', s.rage, u); }
    if (s.possess) { E.loseHp(C, u, 2); E.allies(C, u).forEach((a) => E.heal(C, u, a, s.possess)); }
    if (s.dividend) { gainCred(C, 3); E.allies(C, u).forEach((a) => E.gainBlock(C, a, s.dividend)); }
    // traits
    if (u.id === 'mina') { const a = E.lowestAlly(C, 'H'); if (a && a.hp < a.maxHp) E.heal(C, u, a, 2); }
    if (u.id === 'echo') { const nx = E.upcoming(C).find((x) => x.side === 'H' && x !== u) || E.alive(C, 'H').find((x) => x !== u); if (nx) E.addSt(C, nx, 'inspire', 1, u); }
    if (u.id === 'gen') { const f = E.foes(C, u).sort((a, b) => b.hp - a.hp)[0]; if (f) E.addSt(C, f, 'aim', 3, u); }
    checkEnd(C);
    if (u.dead || C.over) return false;
    // stun
    if (u.st.stun > 0) {
      u.st.stun--;
      cleanZero(u);
      push(C, { k: 'txt', uid: u.uid, s: '行動不能', c: '#ffd93d' });
      return false;
    }
    if (u.side === 'H') {
      let en = 3;
      if (u.st.inspire) { en += u.st.inspire; delete u.st.inspire; }
      let dr = 5 + (u.st.extraDraw || 0);
      if (u.firstTurn) {
        if (E.hasRelic(C, 'battery')) en += 1;
        if (E.hasRelic(C, 'memory')) dr += 2;
      }
      u.energy = en;
      u.played = 0;
      u.firstTurn = false;
      E.draw(C, u, dr);
    }
    return true;
  }

  E.endTurn = (C, u) => {
    if (u.side === 'H' && !u.dead) {
      const n = u.st.drone || 0;
      for (let i = 0; i < n; i++) {
        const f = G.pick(E.foes(C, u));
        if (!f) break;
        push(C, { k: 'txt', uid: u.uid, s: 'チュウ!', c: '#9a9cb2', small: 1 });
        const nullified = f.st.barrier > 0;
        E.dealDamage(C, f, 3 + (u.st.droneUp || 0), { src: u });
        if (!nullified) openWound(C, f, u);
        if (u.st.ratKing) { const a = E.lowestAlly(C, 'H'); if (a) E.gainBlock(C, a, u.st.ratKing); }
      }
      while (u.hand.length) u.disc.push(u.hand.pop());
    }
    for (const k in u.st) {
      const d = G.ST[k];
      if (d && d.dur && !u.fresh[k]) u.st[k]--;
    }
    cleanZero(u);
    u.fresh = {};
    if (C.cur === u) C.cur = null;
    push(C, { k: 'endturn', uid: u.uid });
    checkEnd(C);
  };

  function cleanZero(u) {
    for (const k in u.st) if (!u.st[k] || u.st[k] <= 0) delete u.st[k];
  }

  E.draw = (C, u, n) => {
    for (let i = 0; i < n; i++) {
      if (u.hand.length >= HAND_MAX) break;
      if (!u.draw.length) {
        if (!u.disc.length) break;
        u.draw = G.shuffle(u.disc);
        u.disc = [];
      }
      u.hand.push(u.draw.pop());
    }
  };

  function checkEnd(C) {
    if (C.over) return;
    if (!E.alive(C, 'E').length) C.over = 'win';
    else if (!E.alive(C, 'H').length) C.over = 'lose';
  }
  E.checkEnd = checkEnd;

  // ---------- core actions ----------
  function gainCred(C, v) {
    C.run.credits = Math.max(0, C.run.credits + v);
    if (v > 0) C.credGained += v;
  }

  E.gainBlock = (C, u, v) => {
    if (!u || u.dead || v <= 0) return;
    u.blk += v;
    push(C, { k: 'blk', uid: u.uid, v });
  };

  E.addSt = (C, t, key, v, src) => {
    if (!t || t.dead || !v) return;
    if (key === 'stun' && t.boss) {
      push(C, { k: 'txt', uid: t.uid, s: '耐性', c: '#9a9cb2' });
      key = 'weak'; v = 1;
    }
    if (src && src.side === 'H' && v > 0) {
      if (key === 'burn' && E.hasRelic(C, 'fuel')) v += 1;
      if (key === 'bleed' && E.hasRelic(C, 'knife')) v += 1;
      if (key === 'virus' && E.hasRelic(C, 'usb')) v += 1;
    }
    t.st[key] = (t.st[key] || 0) + v;
    if (key === 'drone') t.st[key] = Math.min(DRONE_MAX, t.st[key]);
    if (t.st[key] <= 0) delete t.st[key];
    if (C.cur === t) t.fresh[key] = true;
    push(C, { k: 'st', uid: t.uid, key, v });
  };

  E.heal = (C, src, t, v, o) => {
    o = o || {};
    if (!t || t.dead || v <= 0) return 0;
    if (src && src.side === 'H' && !o.noBonus && E.hasRelic(C, 'redthread')) v += 2;
    const gain = Math.min(v, t.maxHp - t.hp);
    t.hp += gain;
    if (gain > 0) push(C, { k: 'heal', uid: t.uid, v: gain });
    const over = v - gain;
    if (src && src.id === 'nono' && !o.noBonus && over > 0) E.gainBlock(C, t, over);
    return gain;
  };

  E.loseHp = (C, u, v) => {
    if (u.dead) return;
    const loss = Math.min(v, u.hp - 1);
    if (loss > 0) { u.hp -= loss; push(C, { k: 'dmg', uid: u.uid, v: loss, self: 1 }); }
    if (u.id === 'yomi') E.allies(C, u).forEach((a) => E.addSt(C, a, 'regen', 1, u));
  };

  E.dealDamage = (C, t, d, o) => {
    o = o || {};
    if (!t || t.dead || d <= 0) return 0;
    if (t.st.barrier > 0) {
      t.st.barrier--;
      if (!t.st.barrier) delete t.st.barrier;
      push(C, { k: 'txt', uid: t.uid, s: '障壁', c: '#2ee6ff' });
      return 0;
    }
    let blocked = 0;
    if (!o.pierce) { blocked = Math.min(t.blk, d); t.blk -= blocked; }
    const hpd = d - blocked;
    t.hp -= hpd;
    push(C, { k: 'dmg', uid: t.uid, v: hpd, blocked, dot: o.dot });
    if (t.hp <= 0) {
      if (t.st.undying > 0) {
        t.hp = 1; t.st.undying--; if (!t.st.undying) delete t.st.undying;
        push(C, { k: 'txt', uid: t.uid, s: '不死身！', c: '#ff5ad1' });
      } else if (t.side === 'H' && E.hasRelic(C, 'lullaby') && !C.lullabyUsed) {
        t.hp = 1; C.lullabyUsed = true;
        push(C, { k: 'txt', uid: t.uid, s: 'マザーの子守唄', c: '#2ee6ff' });
      } else kill(C, t);
    }
    if (!t.dead && t.side === 'E') checkPhase(C, t);
    return hpd;
  };

  function kill(C, u) {
    u.hp = 0; u.dead = true; u.blk = 0;
    push(C, { k: 'die', uid: u.uid });
    if (u.side === 'E') {
      if (u.st.virus > 0) {
        const others = E.alive(C, 'E');
        if (others.length) {
          const o = G.pick(others);
          push(C, { k: 'txt', uid: o.uid, s: '感染', c: '#b8ff3d' });
          E.addSt(C, o, 'virus', u.st.virus, null);
        }
      }
      for (const o of E.alive(C, 'E')) if (o.st.grief) E.addSt(C, o, 'str', o.st.grief, o);
    } else {
      if (E.hasRelic(C, 'plush')) E.alive(C, 'H').forEach((h) => E.addSt(C, h, 'str', 2, h));
    }
    u.st = {};
    checkEnd(C);
  }

  function checkPhase(C, u) {
    const ph = u.def.phases;
    if (!ph) return;
    while (u.phase < ph.length && !u.dead && u.hp <= u.maxHp * ph[u.phase].at) {
      const p = ph[u.phase];
      u.phase++;
      push(C, { k: 'say', uid: u.uid, s: p.say });
      if (p.fx) for (const fx of p.fx) runFx(C, u, fx, [u], { mul: 1, tg: 'S' });
      if (p.moves) { u.moves = p.moves; u.mi = 0; pickIntent(C, u); }
    }
  }

  // attack damage (with modifiers & on-hit effects)
  function calcAttack(C, src, t, base, o, preview) {
    let d = base + (src ? src.st.str || 0 : 0);
    if (src && src.id === 'kagura' && t.st.burn > 0) d += 3;
    if (src && src.id === 'mike' && src.st.stealth > 0) d += 2;
    if (o.hid && src && src.st.stealth > 0) d *= o.hid;
    if (o.aim && t.st.aim > 0) d += o.aim;
    if (o.elite && (t.elite || t.boss)) d *= o.elite;
    if (src && src.st.weak > 0) d = Math.floor(d * 0.75);
    if (src && src.side === 'E') d = Math.round(d * C.diff.dmg * EK.dmg * EK.dmgAct[C.run.act || 1]);
    if (t.st.vuln > 0) d = Math.floor(d * 1.5);
    if (t.st.aim > 0) d += t.st.aim * (3 + (src ? src.st.marksman || 0 : 0));
    return Math.max(0, d);
  }
  E.previewAttack = (C, src, t, base, o) => calcAttack(C, src, t, base, o || {}, true);
  // human-readable list of statuses currently changing an attack's damage (for tooltips)
  E.attackMods = (C, src, t) => {
    const m = [];
    if (src && src.st.str) m.push({ up: 1, s: `${G.ST.str.n}：+${src.st.str}` });
    if (src && src.st.weak > 0) m.push({ up: 0, s: `${G.ST.weak.n}：-25%` });
    if (t && t.st.vuln > 0) m.push({ up: 1, s: `${t.n}が${G.ST.vuln.n}：×1.5` });
    if (t && t.st.aim > 0) m.push({ up: 1, s: `${t.n}に${G.ST.aim.n}：+${t.st.aim * (3 + (src ? src.st.marksman || 0 : 0))}` });
    return m;
  };

  // 裂傷 (bleed): every landed hit opens the wound for extra pierce damage, then it shrinks by 1
  // (Rei's hits keep it open)
  function openWound(C, t, src) {
    if (!t || t.dead || !(t.st.bleed > 0)) return;
    const v = t.st.bleed;
    E.dealDamage(C, t, v, { pierce: true, dot: 'bleed' });
    if (t.dead || (src && src.id === 'rei')) return;
    t.st.bleed = v - 1;
    if (!t.st.bleed) delete t.st.bleed;
  }

  function attack(C, src, t, base, o) {
    o = o || {};
    if (!t || t.dead) return 0;
    const d = calcAttack(C, src, t, base, o);
    if (t.st.aim > 0) delete t.st.aim;
    if (src) push(C, { k: 'atk', uid: src.uid, tuid: t.uid });
    const nullified = t.st.barrier > 0;
    const hp = E.dealDamage(C, t, d, { src });
    if (src && o.drain && hp > 0 && !src.dead) E.heal(C, src, src, hp, { noBonus: true });
    if (!nullified) openWound(C, t, src);
    if (!t.dead) {
      if (src && src.st.ignite) E.addSt(C, t, 'burn', src.st.ignite, src);
      if (src && src.st.bloodlust) E.addSt(C, t, 'bleed', src.st.bloodlust, src);
      if (src && src.st.marking) E.addSt(C, t, 'aim', src.st.marking, src);
      if (t.st.spikeshell) E.gainBlock(C, t, t.st.spikeshell);
      if (t.id === 'pixe') E.addSt(C, t, 'charge', 1, t);
    }
    if (src && src.id === 'doll' && !src.dead) E.heal(C, src, src, 1, { noBonus: true });
    if (t.st.thorns > 0 && src && !src.dead) {
      push(C, { k: 'txt', uid: src.uid, s: '反射', c: '#c9a85a', small: 1 });
      E.dealDamage(C, src, t.st.thorns, { thorns: true });
    }
    return hp;
  }

  function amount(C, u, what) {
    switch (what) {
      case 'blk': return u.blk;
      case 'charge': return u.st.charge || 0;
      case 'drone': return u.st.drone || 0;
      case 'lost': return u.maxHp - u.hp;
      case 'cred': return Math.min(400, C.run.credits);
      default: return 0;
    }
  }
  E.amount = amount;

  // ---------- effect ops ----------
  function resolve(C, u, code, T) {
    switch (code) {
      case 'S': return [u];
      case 'AA': return E.allies(C, u);
      case 'AE': return E.foes(C, u);
      case 'RE': { const f = E.foes(C, u); return f.length ? [G.pick(f)] : []; }
      case 'LA': { const a = E.lowestAlly(C, u.side); return a ? [a] : []; }
      default: return T;
    }
  }

  const OPS = {
    dmg(C, u, T, [v, n = 1, o = {}], ctx) {
      for (const t0 of T) {
        for (let i = 0; i < n; i++) {
          let t = t0;
          if (ctx.tg === 'RE' && n > 1) t = G.pick(E.foes(C, u));
          if (!t || t.dead) continue;
          attack(C, u, t, v * ctx.mul, o);
          if (C.over || u.dead) return;
        }
      }
    },
    drain(C, u, T, [v, n = 1], ctx) { OPS.dmg(C, u, T, [v, n, { drain: true }], ctx); },
    dmgX(C, u, T, [what, k, base = 0, n = 1], ctx) {
      for (const t of T) {
        if (t.dead) continue;
        const amt = what === 'tvirus' ? t.st.virus || 0 : amount(C, u, what);
        const v = base + Math.floor(k * amt);
        for (let i = 0; i < n; i++) { if (!t.dead) attack(C, u, t, v * ctx.mul, {}); }
        if (C.over || u.dead) return;
      }
    },
    blk(C, u, T, [v]) { if (u.side === 'E') v = Math.round(v * EK.blk); T.forEach((t) => E.gainBlock(C, t, v)); },
    blkX(C, u, T, [what, k, base = 0]) { const v = base + Math.floor(k * amount(C, u, what)); T.forEach((t) => E.gainBlock(C, t, v)); },
    heal(C, u, T, [v]) { if (u.side === 'E') v = Math.round(v * EK.heal); T.forEach((t) => E.heal(C, u, t, v)); },
    st(C, u, T, [key, v]) { T.forEach((t) => E.addSt(C, t, key, v, u)); },
    stX(C, u, T, [key, what, k]) { const v = Math.floor(k * amount(C, u, what)); if (v > 0) T.forEach((t) => E.addSt(C, t, key, v, u)); },
    mul(C, u, T, [key, f]) {
      T.forEach((t) => {
        if (t.dead || !(t.st[key] > 0)) return;
        const add = Math.floor(t.st[key] * f) - t.st[key];
        t.st[key] += add;
        if (key === 'drone') t.st[key] = Math.min(DRONE_MAX, t.st[key]);
        push(C, { k: 'st', uid: t.uid, key, v: add });
      });
    },
    det(C, u, T, [key, k]) {
      T.forEach((t) => {
        if (t.dead) return;
        const v = (t.st[key] || 0) * k;
        if (v <= 0) return;
        delete t.st[key];
        push(C, { k: 'txt', uid: t.uid, s: '爆発', c: '#ff8a2b' });
        E.dealDamage(C, t, v, { pierce: true, src: u });
      });
    },
    consume(C, u, T, [key]) { delete u.st[key]; },
    spend(C, u, T, [key, v]) { u.st[key] = Math.max(0, (u.st[key] || 0) - v); if (!u.st[key]) delete u.st[key]; },
    draw(C, u, T, [v]) { if (u.side === 'H') E.draw(C, u, v); },
    nrg(C, u, T, [v]) { u.energy += v; push(C, { k: 'txt', uid: u.uid, s: `エナジー+${v}`, c: '#ffd93d', small: 1 }); },
    cred(C, u, T, [v]) { gainCred(C, v); push(C, { k: 'txt', uid: u.uid, s: `+${v}cr`, c: '#c9a85a', small: 1 }); },
    pay(C, u, T, [v]) { gainCred(C, -v); },
    cleanse(C, u, T, [v]) {
      T.forEach((t) => {
        let n = v;
        for (const k of Object.keys(t.st)) {
          if (n <= 0) break;
          if (G.isDebuff(k)) { delete t.st[k]; n--; }
        }
        push(C, { k: 'txt', uid: t.uid, s: '浄化', c: '#7dffb0', small: 1 });
      });
    },
    lose(C, u, T, [v]) { E.loseHp(C, u, v); },
    noise(C, u, T, [v]) {
      T.forEach((t) => {
        if (t.side !== 'H' || t.dead) return;
        if (C.firewall > 0) { C.firewall--; push(C, { k: 'txt', uid: t.uid, s: '防壁', c: '#2ee6ff' }); return; }
        for (let i = 0; i < v; i++) {
          const pos = G.rnd(t.draw.length + 1);
          t.draw.splice(pos, 0, { id: 'noise', up: false, cid: C.seq++, tmp: true });
        }
        push(C, { k: 'txt', uid: t.uid, s: `ノイズ+${v}`, c: '#ff5ad1' });
      });
    },
    summon(C, u, T, [id, n = 1]) {
      for (let i = 0; i < n; i++) {
        if (E.alive(C, 'E').length >= ENEMY_MAX) break;
        const e = mkEnemy(C, id);
        e.summoned = true;
        C.units.push(e);
        pickIntent(C, e);
        push(C, { k: 'summon', uid: e.uid });
      }
    },
    revive(C, u, T, [pct]) {
      T.forEach((t) => {
        if (!t.dead) return;
        t.dead = false;
        t.hp = Math.max(1, Math.floor((t.maxHp * pct) / 100));
        t.st = {}; t.blk = 0;
        push(C, { k: 'txt', uid: t.uid, s: '蘇生', c: '#7dffb0' });
        push(C, { k: 'heal', uid: t.uid, v: t.hp });
      });
    },
    copy(C, u, T, [v]) {
      for (let i = 0; i < v; i++) {
        const src = u.hand.filter((c) => c.id !== 'noise' && c.id !== 'trauma');
        if (!src.length || u.hand.length >= HAND_MAX) break;
        const c = G.pick(src);
        u.hand.push({ id: c.id, up: c.up, cid: C.seq++, tmp: true });
      }
      push(C, { k: 'txt', uid: u.uid, s: '複製', c: '#a05cff', small: 1 });
    },
    recall(C, u, T, [v]) {
      for (let i = 0; i < v; i++) {
        if (!u.disc.length || u.hand.length >= HAND_MAX) break;
        const j = G.rnd(u.disc.length);
        u.hand.push(u.disc.splice(j, 1)[0]);
      }
    },
    execute(C, u, T, [pct, alt], ctx) {
      T.forEach((t) => {
        if (t.dead) return;
        if (!t.boss && !t.elite && t.hp <= (t.maxHp * pct) / 100) {
          push(C, { k: 'txt', uid: t.uid, s: '安楽処置', c: '#7dffb0' });
          E.dealDamage(C, t, t.hp + t.blk + 99, { pierce: true, src: u });
        } else attack(C, u, t, alt * ctx.mul, {});
      });
    },
    steal(C, u, T, [key]) {
      T.forEach((t) => {
        const v = t.st[key] || 0;
        if (v > 0) { delete t.st[key]; E.addSt(C, u, key, v, u); push(C, { k: 'txt', uid: t.uid, s: '奪取', c: '#c9a85a' }); }
      });
    },
    dismiss(C, u, T) {
      T.forEach((t) => {
        if (t.dead || t.boss || t.elite) return;
        t.dead = true; t.fled = true; t.hp = 0;
        push(C, { k: 'txt', uid: t.uid, s: '買収成立', c: '#c9a85a' });
        push(C, { k: 'die', uid: t.uid, fled: 1 });
      });
      checkEnd(C);
    },
    chargeHeal(C, u, T, [k]) { const v = (u.st.charge || 0) * k; delete u.st.charge; E.heal(C, u, u, v); },
    nop() {},
  };
  E.OPS = OPS;

  function runFx(C, u, fx, T, ctx) {
    if (C.over) return;
    const args = fx.slice(1);
    let to = null;
    if (typeof args[args.length - 1] === 'string' && args[args.length - 1][0] === '@') to = args.pop().slice(1);
    const targets = to ? resolve(C, u, to, T) : T;
    const op = OPS[fx[0]];
    if (op) op(C, u, targets, args, ctx);
    checkEnd(C);
  }

  // ---------- player actions ----------
  E.cardCost = (u, card) => E.cardDef(card).c;
  E.canPlay = (C, u, card) => {
    const d = E.cardDef(card);
    if (d.c == null) return false;
    if (u.energy < d.c) return false;
    if (d.req && d.req.st && (u.st[d.req.st] || 0) < d.req.v) return false;
    for (const fx of d.fx) if (fx[0] === 'pay' && C.run.credits < fx[1]) return false;
    if (d.tg === 'D' && !C.units.some((x) => x.side === 'H' && x.dead)) return false;
    if (needsTarget(d) && !E.validTargets(C, u, card).length) return false;
    return true;
  };
  function needsTarget(d) { return d.tg === 'E' || d.tg === 'A' || d.tg === 'D'; }
  E.needsTarget = (card) => needsTarget(E.cardDef(card));
  E.validTargets = (C, u, card) => {
    const d = E.cardDef(card);
    if (d.tg === 'E') {
      let f = E.foes(C, u);
      if (d.fx.some((x) => x[0] === 'dismiss')) f = f.filter((e) => !e.boss && !e.elite);
      return f.map((x) => x.uid);
    }
    if (d.tg === 'A') return E.allies(C, u).map((x) => x.uid);
    if (d.tg === 'D') return C.units.filter((x) => x.side === 'H' && x.dead).map((x) => x.uid);
    return [];
  };

  E.playCard = (C, u, idx, tuid) => {
    const card = u.hand[idx];
    if (!card || C.over || C.cur !== u) return false;
    const d = E.cardDef(card);
    if (!E.canPlay(C, u, card)) return false;
    let T = [];
    if (needsTarget(d)) {
      if (!E.validTargets(C, u, card).includes(tuid)) return false;
      T = [E.unit(C, tuid)];
    } else if (d.tg === 'S') T = [u];
    else if (d.tg === 'AA') T = E.allies(C, u);
    else if (d.tg === 'AE') T = E.foes(C, u);
    else if (d.tg === 'RE') { const f = E.foes(C, u); T = f.length ? [G.pick(f)] : []; }
    u.energy -= d.c;
    u.hand.splice(idx, 1);
    const ctx = { mul: 1, tg: d.tg, card: d };
    if (d.t === 'A' && u.st.focus) { ctx.mul = 2; delete u.st.focus; }
    push(C, { k: 'play', uid: u.uid, name: d.n, t: d.t });
    for (const fx of d.fx) {
      runFx(C, u, fx, T, ctx);
      if (C.over) break;
    }
    if (d.x || d.t === 'P') u.exh.push(card);
    else u.disc.push(card);
    u.played++;
    checkEnd(C);
    return true;
  };

  // ---------- enemy AI ----------
  function pickIntent(C, u) {
    const moves = u.moves;
    const full = E.alive(C, 'E').length >= ENEMY_MAX;
    let mi;
    if (u.def.ai === 'seq') {
      mi = u.mi % moves.length;
      u.mi++;
      if (full && moves[mi].fx.some((f) => f[0] === 'summon')) { mi = u.mi % moves.length; u.mi++; }
    } else {
      const cand = moves.map((m, i) => i).filter((i) => !(full && moves[i].fx.some((f) => f[0] === 'summon')));
      mi = G.pick(cand);
      if (mi === u.lastMove && u.sameCount >= 1 && cand.length > 1) mi = G.pick(cand.filter((i) => i !== mi));
      u.sameCount = mi === u.lastMove ? u.sameCount + 1 : 0;
      u.lastMove = mi;
    }
    const m = moves[mi];
    u.intent = { m, tuid: m.tg === 'E' ? chooseTarget(C, m) : null };
  }
  E.pickIntent = pickIntent;

  function chooseTarget(C, m) {
    let hs = E.alive(C, 'H').filter((h) => !(h.st.stealth > 0));
    if (!hs.length) hs = E.alive(C, 'H');
    if (!hs.length) return null;
    if (m.pick === 'low') return hs.reduce((a, b) => (b.hp < a.hp ? b : a)).uid;
    if (m.pick === 'high') return hs.reduce((a, b) => (b.hp > a.hp ? b : a)).uid;
    return G.pick(hs).uid;
  }

  E.effectiveTarget = (C, u) => {
    if (!u.intent || u.intent.m.tg !== 'E') return null;
    const hs = E.alive(C, 'H');
    const taunters = hs.filter((h) => h.st.taunt > 0 && !(h.st.stealth > 0));
    if (taunters.length) return taunters.reduce((a, b) => (b.st.taunt > a.st.taunt ? b : a));
    let t = E.unit(C, u.intent.tuid);
    if (!t || t.dead || t.st.stealth > 0) {
      u.intent.tuid = chooseTarget(C, u.intent.m);
      t = E.unit(C, u.intent.tuid);
    }
    return t;
  };

  E.intentInfo = (C, u) => {
    if (!u.intent) return null;
    const m = u.intent.m;
    const t = E.effectiveTarget(C, u);
    let dmg = null, hits = 0, base = null, mods = [];
    for (const fx of m.fx) {
      if (fx[0] === 'dmg' || fx[0] === 'drain') {
        const ref = t || E.alive(C, 'H')[0];
        if (ref) { dmg = E.previewAttack(C, u, ref, fx[1], {}); mods = E.attackMods(C, u, ref); }
        base = Math.round(fx[1] * C.diff.dmg * EK.dmg * EK.dmgAct[C.run.act || 1]);
        hits = fx[2] || 1;
        break;
      }
    }
    return { m, t, dmg, base, mods, hits, aoe: m.tg === 'AE' };
  };

  E.enemyAct = (C, u) => {
    if (u.dead || !u.intent) return;
    const m = u.intent.m;
    push(C, { k: 'act', uid: u.uid, name: m.n, i: m.i });
    let T;
    if (m.tg === 'E') { const t = E.effectiveTarget(C, u); T = t ? [t] : []; }
    else if (m.tg === 'AE') T = E.alive(C, 'H');
    else if (m.tg === 'S') T = [u];
    else if (m.tg === 'AA') T = E.alive(C, 'E');
    else if (m.tg === 'LA') { const a = E.lowestAlly(C, 'E'); T = a ? [a] : []; }
    if (u.st.confuse > 0 && (m.tg === 'E' || m.tg === 'AE')) {
      const all = C.units.filter((x) => !x.dead && x !== u);
      T = all.length ? [G.pick(all)] : [];
      delete u.st.confuse;
      push(C, { k: 'txt', uid: u.uid, s: '混乱！', c: '#a05cff' });
    }
    for (const fx of m.fx) {
      runFx(C, u, fx, T, { mul: 1, tg: m.tg });
      if (C.over || u.dead) break;
    }
    if (!u.dead && !C.over) pickIntent(C, u);
  };

  // ---------- card text ----------
  const W = { blk: 'シールド値', charge: '充電', drone: 'ドローン数', lost: '失ったHP', cred: '所持クレジット', tvirus: '対象のウイルス' };
  const PRE = { AE: '敵全体に', AA: '味方全体に', RE: 'ランダムな敵に', S: '', E: '', A: '', D: '', N: '', LA: 'HP最低の味方に' };
  const PRE_O = { S: '自分に', AA: '味方全体に', AE: '敵全体に', RE: 'ランダムな敵に', LA: 'HP最低の味方に' };

  E.cardText = (card, u, C) => {
    const d = E.cardDef(card);
    if (d.desc) return d.desc;
    const parts = [];
    const mul = u && d.t === 'A' && u.st && u.st.focus ? 2 : 1;
    let hid = 0;
    const dmgVal = (v) => {
      if (!u || !u.st) return { v, mod: 0 };
      let x = v * mul + (u.st.str || 0);
      if (u.st.stealth > 0) { if (u.id === 'mike') x += 2; if (hid) x *= hid; }
      if (u.st.weak > 0) x = Math.floor(x * 0.75);
      return { v: x, mod: x > v ? 1 : x < v ? -1 : 0 };
    };
    const num = (o) => (o.mod ? `<b class="${o.mod > 0 ? 'up' : 'dn'}">${o.v}</b>` : `<b>${o.v}</b>`);
    for (const fx of d.fx) {
      const args = fx.slice(1);
      let to = null;
      if (typeof args[args.length - 1] === 'string' && args[args.length - 1][0] === '@') to = args.pop().slice(1);
      const pre = to ? PRE_O[to] || '' : PRE[d.tg] || '';
      const [a, b, c, e] = args;
      const stn = (k) => `<i class="kw" data-st="${k}">${G.ST[k] ? G.ST[k].n : k}</i>`;
      switch (fx[0]) {
        case 'dmg': {
          hid = c && c.hid ? c.hid : 0;
          let s = `${pre}${num(dmgVal(a))}ダメージ${b > 1 ? '×' + b : ''}`;
          if (c && c.aim) s += `（照準中なら+${c.aim}）`;
          if (c && c.elite) s += `（エリート・ボスに${c.elite}倍）`;
          if (c && c.hid) s += `（${stn('stealth')}中なら${c.hid}倍）`;
          hid = 0;
          parts.push(s); break;
        }
        case 'drain': parts.push(`${pre}${num(dmgVal(a))}ダメージ${b > 1 ? '×' + b : ''}。与えたダメージ分HP回復`); break;
        case 'dmgX': {
          let s = `${pre}${c ? c + '+' : ''}${W[a]}${b === 1 ? '' : '×' + b}のダメージ${e > 1 ? '×' + e : ''}`;
          if (u && u.st && a !== 'tvirus' && C) s += `（現在${dmgVal((c || 0) + Math.floor(b * amount(C, u, a))).v}）`;
          parts.push(s); break;
        }
        case 'blk': parts.push(`${pre}シールド<b>${a}</b>`); break;
        case 'blkX': parts.push(`${pre}${c ? c + '+' : ''}${W[a]}×${b}のシールド`); break;
        case 'heal': parts.push(`${pre}HP<b>${a}</b>回復`); break;
        case 'st': parts.push(`${pre}${stn(a)}<b>${b}</b>`); break;
        case 'stX': parts.push(`${pre}${W[b]}${c === 1 ? '' : '×' + c}の${stn(a)}`); break;
        case 'mul': parts.push(`${pre}${stn(a)}を<b>${b}</b>倍にする`); break;
        case 'det': parts.push(`${pre}${stn(a)}を消費し、その<b>${b}</b>倍のダメージ`); break;
        case 'consume': parts.push(`${stn(a)}をすべて消費`); break;
        case 'spend': parts.push(`${stn(a)}を${b}消費`); break;
        case 'draw': parts.push(`<b>${a}</b>枚ドロー`); break;
        case 'nrg': parts.push(`エナジー+<b>${a}</b>`); break;
        case 'cred': parts.push(`クレジット+<b>${a}</b>`); break;
        case 'pay': parts.push(`クレジット${a}を支払う`); break;
        case 'cleanse': parts.push(`${pre}${a >= 99 ? 'デバフをすべて解除' : `デバフを${a}つ解除`}`); break;
        case 'lose': parts.push(`HPを<b>${a}</b>支払う`); break;
        case 'revive': parts.push(`倒れた味方をHP${a}%で蘇生`); break;
        case 'copy': parts.push(`手札のランダムなカード${a}枚を複製`); break;
        case 'recall': parts.push(`捨て札からランダムに${a}枚を手札に戻す`); break;
        case 'execute': parts.push(`HP${a}%以下の通常敵を即死させる。それ以外には${num(dmgVal(b))}ダメージ`); break;
        case 'steal': parts.push(`対象の${stn(a)}をすべて奪う`); break;
        case 'dismiss': parts.push('通常敵1体を戦闘から離脱させる（エリート・ボス不可）'); break;
        case 'chargeHeal': parts.push(`${stn('charge')}×${a}のHPを回復し、充電を消費`); break;
        default: break;
      }
    }
    let s = parts.join('。');
    if (s) s += '。';
    if (d.x) s += '<span class="ex">廃棄</span>';
    return s;
  };

  E.TYPE_N = { A: 'アタック', S: 'スキル', P: 'パワー', C: 'ノイズ' };
})();
