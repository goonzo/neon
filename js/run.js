// Meta progression (base), run creation, map generation, rewards, event API
(function () {
  const G = globalThis.G;
  const META_KEY = 'neoncradle_meta_v1';
  const RUN_KEY = 'neoncradle_run_v1';

  // ---------------- storage ----------------
  const store = {
    get(k) { try { return globalThis.localStorage ? localStorage.getItem(k) : null; } catch (e) { return null; } },
    set(k, v) { try { if (globalThis.localStorage) localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    del(k) { try { if (globalThis.localStorage) localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };

  function defaultMeta() {
    return {
      v: 1,
      res: { energy: 0, scrap: 0, food: 0, data: 0 },
      fac: { quarters: 0, clinic: 0, workshop: 0, farm: 0, core: 0, market: 0, recycle: 0 },
      unlocked: G.START_HEROES.slice(),
      diffMax: 1,
      clears: [0, 0, 0, 0],
      flags: {},
      lore: ['l_boot'],
      newLore: [],
      runs: 0, wins: 0, bestAct: 0,
      heroRuns: {},
      seenIntro: false,
      lastParty: G.START_HEROES.slice(),
      lastDiff: 0,
      settings: { sfx: true, bgm: true, speed: 1 },
      townSeen: null, // facility levels last shown in the town view (for the level-up sparkle)
      bonds: {}, // hero id -> bond level 0..3 (talks at safehouses)
      seenAreas: [], // middle areas visited at least once (unseen ones come up first)
      lastMid: null,
      gacha: { own: {}, parts: 0, pity: 0, pulls: 0 }, // junk capsule machine
      skin: {}, // hero id -> colour variant
      title: '', // chosen title id
    };
  }
  G.loadMeta = () => {
    let m = null;
    try { m = JSON.parse(store.get(META_KEY) || 'null'); } catch (e) { m = null; }
    const d = defaultMeta();
    if (!m) return d;
    for (const k in d) if (m[k] === undefined) m[k] = d[k];
    for (const k in d.fac) if (m.fac[k] === undefined) m.fac[k] = 0;
    for (const k in d.res) if (m.res[k] === undefined) m.res[k] = 0;
    for (const k in d.settings) if (m.settings[k] === undefined) m.settings[k] = d.settings[k];
    if (!m.bonds) m.bonds = {};
    // flags from before areas could change: the old 2nd/3rd acts were always New Eden / the Sanctum
    const f = m.flags;
    if (f.a2reach && !f.eden) f.eden = true;
    if (f.a2boss && !f.hypnos) f.hypnos = true;
    if (f.a3reach && !f.sanctum) f.sanctum = true;
    if (f.a1boss && !f.smile) f.smile = true;
    if (f.eden && !m.seenAreas.includes('eden')) m.seenAreas.push('eden');
    return m;
  };
  G.saveMeta = () => store.set(META_KEY, JSON.stringify(G.meta));
  G.resetAll = () => { store.del(META_KEY); store.del(RUN_KEY); G.meta = defaultMeta(); G.run = null; };
  G.saveRun = () => { if (G.run) store.set(RUN_KEY, JSON.stringify(G.run)); };
  G.loadRun = () => { try { return JSON.parse(store.get(RUN_KEY) || 'null'); } catch (e) { return null; } };
  G.clearRun = () => { store.del(RUN_KEY); G.run = null; };

  G.meta = G.loadMeta();

  // ---------------- facilities ----------------
  G.FAC = {
    quarters: { n: '居住区', spr: 'i_food', d: '仲間を受け入れる部屋。レベルに応じて勧誘できる仲間が増える。', lv: [
      { cost: { food: 15, scrap: 15 }, e: '勧誘Lv1の仲間を受け入れ可能に' },
      { cost: { food: 35, scrap: 30, energy: 15 }, e: '勧誘Lv2の仲間を受け入れ可能に' },
      { cost: { food: 60, scrap: 50, energy: 30, data: 20 }, e: '勧誘Lv3の仲間を受け入れ可能に' },
    ] },
    clinic: { n: '医療棟', spr: 'i_scrap', d: 'ミナの父が遺した医療設備。出撃メンバーの最大HPが上昇する。', lv: [
      { cost: { scrap: 20, food: 10 }, e: '全員の最大HP+4' },
      { cost: { scrap: 35, food: 25, data: 10 }, e: '全員の最大HP+8' },
      { cost: { scrap: 55, food: 40, data: 25 }, e: '全員の最大HP+12' },
    ] },
    workshop: { n: '工房', spr: 'i_scrap', d: 'ガロンの作業場。カードを強化する設備。', lv: [
      { cost: { scrap: 25, energy: 10 }, e: '出撃時、各メンバーのランダムなカード1枚を強化' },
      { cost: { scrap: 40, energy: 25, data: 15 }, e: 'カード報酬の選択肢+1' },
      { cost: { scrap: 60, energy: 40, data: 30 }, e: '出撃時の強化を2枚に' },
    ] },
    farm: { n: '水耕農園', spr: 'i_food', d: '地下の水耕栽培プラント。休息と回復が強化される。', lv: [
      { cost: { food: 15, energy: 15 }, e: 'セーフハウスでの回復+10%' },
      { cost: { food: 30, energy: 30 }, e: '戦闘勝利時、全員のHPを2回復' },
      { cost: { food: 50, energy: 45, data: 15 }, e: 'セーフハウスでの回復+20%（合計）' },
    ] },
    core: { n: 'マザーコア', spr: 'i_data', d: 'マザーの演算中枢。強化すると地上での支援が増える。', lv: [
      { cost: { energy: 25, data: 15 }, e: '出撃時、3つのパーツから1つを選んで持ち出せる' },
      { cost: { energy: 45, data: 30 }, e: '戦闘開始時、全員にシールド3' },
      { cost: { energy: 70, data: 50, scrap: 30 }, e: '持ち出せるパーツがレア以上に' },
    ] },
    market: { n: '闇市場', spr: 'i_cred', d: '闇市場への伝手。地上での買い物が有利になる。', lv: [
      { cost: { scrap: 20, data: 10 }, e: '初期クレジット+40' },
      { cost: { scrap: 35, data: 25, food: 15 }, e: '闇市の価格-15%' },
      { cost: { scrap: 55, data: 40, food: 30 }, e: '初期クレジット+100（合計）' },
    ] },
    recycle: { n: 'リサイクル炉', spr: 'i_scrap', d: '余った素材を溶かして、ガラクタのカプセルに詰め直す施設。カプセル機が置かれる。', lv: [
      { cost: { scrap: 30, energy: 20 }, e: 'ジャンクカプセル機が稼働（素材20個で1回）' },
      { cost: { scrap: 50, energy: 35, data: 20 }, e: '1回の素材が15個に・10連でおまけ+1回' },
      { cost: { scrap: 80, energy: 50, data: 40, food: 30 }, e: 'レア以上の出現率アップ' },
    ] },
  };
  G.FAC_ORDER = ['quarters', 'clinic', 'workshop', 'farm', 'core', 'market', 'recycle'];

  G.affordable = (cost) => Object.keys(cost).every((k) => (G.meta.res[k] || 0) >= cost[k]);
  G.pay = (cost) => { for (const k in cost) G.meta.res[k] -= cost[k]; };
  G.facNext = (key) => { const f = G.FAC[key]; const lv = G.meta.fac[key]; return lv < f.lv.length ? f.lv[lv] : null; };
  G.upgradeFac = (key) => {
    const nx = G.facNext(key);
    if (!nx || !G.affordable(nx.cost)) return false;
    G.pay(nx.cost);
    G.meta.fac[key]++;
    G.saveMeta();
    return true;
  };

  // ---------------- recruitment ----------------
  G.recruitInfo = (id) => {
    const u = G.UNLOCK[id];
    if (!u) return null;
    const q = G.meta.fac.quarters >= u.q;
    const cond = !u.cond || !!G.meta.flags[u.cond];
    const afford = G.affordable(u.cost);
    return { u, q, cond, afford, ok: q && cond && afford };
  };
  G.recruit = (id) => {
    const r = G.recruitInfo(id);
    if (!r || !r.ok || G.meta.unlocked.includes(id)) return false;
    G.pay(r.u.cost);
    G.meta.unlocked.push(id);
    G.saveMeta();
    return true;
  };

  // ---------------- lore ----------------
  G.checkLore = () => {
    const m = G.meta;
    const ok = (c) => {
      if (!c) return true;
      if (c === 'run1') return m.runs >= 1;
      if (c === 'loop3') return m.wins >= 3;
      if (c === 'abyss') return m.clears[3] >= 1;
      if (c.startsWith('bond_')) return (m.bonds[c.slice(5)] || 0) >= 3;
      return !!m.flags[c];
    };
    for (const l of G.LORE) {
      if (!m.lore.includes(l.id) && ok(l.c)) { m.lore.push(l.id); m.newLore.push(l.id); }
    }
  };
  G.setFlag = (f) => {
    if (!G.meta.flags[f]) { G.meta.flags[f] = true; G.checkLore(); G.saveMeta(); return true; }
    return false;
  };

  // ---------------- run creation ----------------
  G.expandDeck = (def) => {
    const out = [];
    for (const [id, n] of def.deck) for (let i = 0; i < n; i++) out.push({ id, up: false });
    return out;
  };

  G.newRun = (diff, party) => {
    const f = G.meta.fac;
    const hpBonus = [0, 4, 8, 12][f.clinic];
    const run = {
      diff, act: 1, floor: 0,
      heroes: party.map((id) => {
        const def = G.HEROES[id];
        const bond = G.meta.bonds[id] || 0;
        const sig = bond >= 3 ? G.sigGear(id) : null;
        const maxHp = def.hp + hpBonus + (bond >= 1 ? 4 : 0) + (sig ? G.GEAR[sig].hp || 0 : 0);
        const deck = G.expandDeck(def);
        if (bond >= 2) { const cand = deck.filter((c) => G.E.canUpgrade(c)); if (cand.length) G.pick(cand).up = true; }
        return { id, hp: maxHp, maxHp, deck, gear: sig };
      }),
      bag: [],
      items: [],
      route: G.makeRoute(diff, G.meta),
      credits: 70 + [0, 40, 40, 100][f.market],
      relics: [],
      res: { energy: 0, scrap: 0, food: 0, data: 0 },
      removeCost: 60,
      map: null, pos: null,
      stats: { fights: 0, elites: 0, bosses: 0, cards: 0, events: 0 },
      lastEnc: [],
      node: null,
    };
    const ups = f.workshop >= 3 ? 2 : f.workshop >= 1 ? 1 : 0;
    for (const h of run.heroes) {
      for (let i = 0; i < ups; i++) {
        const cand = h.deck.filter((c) => G.E.canUpgrade(c));
        if (cand.length) G.pick(cand).up = true;
      }
    }
    run.map = G.genMap(run, 1);
    G.gainItem(run, G.randomItem(1));
    const mid = run.route[1];
    if (!G.meta.seenAreas.includes(mid)) G.meta.seenAreas.push(mid);
    G.meta.lastMid = mid;
    G.meta.runs++;
    G.meta.lastParty = party.slice();
    G.meta.lastDiff = diff;
    for (const id of party) G.meta.heroRuns[id] = (G.meta.heroRuns[id] || 0) + 1;
    G.checkLore();
    G.saveMeta();
    return run;
  };

  G.startRelicChoices = () => {
    const lv = G.meta.fac.core;
    if (lv < 1) return [];
    let pool = Object.values(G.RELICS);
    if (lv >= 3) pool = pool.filter((r) => r.r >= 2);
    return G.sample(pool, 3).map((r) => r.id);
  };

  G.addRelic = (run, id) => {
    if (run.relics.includes(id)) return false;
    run.relics.push(id);
    const r = G.RELICS[id];
    if (r && r.get) r.get(run);
    return true;
  };
  G.randomRelic = (run, minR) => {
    const pool = Object.values(G.RELICS).filter((r) => !run.relics.includes(r.id) && r.r >= (minR || 1));
    if (!pool.length) return null;
    return G.wpick(pool, (r) => (r.r === 1 ? 5 : r.r === 2 ? 3 : 1)).id;
  };

  // ---------------- gear ----------------
  G.sigGear = (heroId) => { const g = Object.values(G.GEAR).find((x) => x.hero === heroId); return g ? g.id : null; };
  G.canEquip = (heroId, gid) => { const g = G.GEAR[gid]; return !!g && (!g.hero || g.hero === heroId); };
  G.ownedGear = (run) => run.heroes.map((h) => h.gear).filter(Boolean).concat(run.bag || []);
  G.randomGear = (run, minR, maxR) => {
    const own = G.ownedGear(run);
    const pool = Object.values(G.GEAR).filter((g) => !g.hero && g.r >= (minR || 1) && g.r <= (maxR || 3) && !own.includes(g.id));
    if (!pool.length) return null;
    return G.wpick(pool, (g) => (g.r === 1 ? 5 : g.r === 2 ? 3 : 1.4)).id;
  };
  G.gainGear = (run, id) => { if (id) (run.bag = run.bag || []).push(id); return id; };
  G.unequipGear = (run, hi) => {
    const h = run.heroes[hi];
    if (!h || !h.gear) return;
    const g = G.GEAR[h.gear];
    (run.bag = run.bag || []).push(h.gear);
    h.gear = null;
    if (g.hp) { h.maxHp = Math.max(10, h.maxHp - g.hp); h.hp = Math.max(1, Math.min(h.hp, h.maxHp)); }
  };
  G.equipGear = (run, hi, id) => {
    const h = run.heroes[hi];
    if (!h || !G.canEquip(h.id, id)) return false;
    const bi = (run.bag || []).indexOf(id);
    if (bi < 0) return false;
    run.bag.splice(bi, 1);
    if (h.gear) G.unequipGear(run, hi);
    h.gear = id;
    const g = G.GEAR[id];
    if (g.hp) { h.maxHp = Math.max(10, h.maxHp + g.hp); h.hp = Math.max(1, Math.min(h.maxHp, h.hp + Math.max(0, g.hp))); }
    return true;
  };
  // equip the bag item on the first hero who has nothing (used by the sim / quick-equip)
  G.autoEquip = (run, id) => {
    const hi = run.heroes.findIndex((h) => !h.gear && G.canEquip(h.id, id));
    if (hi >= 0) G.equipGear(run, hi, id);
    return hi;
  };
  G.finalAct = (run) => G.routeOf(run).length;
  // 安全区 is only a survey: no parts (relics) turn up on the surface
  G.partsOK = (run) => run.diff >= 1;

  // ---------------- map ----------------
  const NODE = {
    fight: { n: '戦闘', spr: 'n_fight', c: '#ff3d8b' },
    elite: { n: 'エリート', spr: 'n_elite', c: '#ff8a2b' },
    event: { n: '出来事', spr: 'n_event', c: '#ffd93d' },
    shop: { n: '闇市', spr: 'n_shop', c: '#c9a85a' },
    rest: { n: 'セーフハウス', spr: 'n_rest', c: '#7dffb0' },
    treasure: { n: '補給コンテナ', spr: 'n_treasure', c: '#2ee6ff' },
    res: { n: '物資回収', spr: 'n_res', c: '#9a9cb2' },
    boss: { n: 'ボス', spr: 'n_boss', c: '#e8352e' },
    bug: { n: '？？？', spr: 'n_bug', c: '#b8ff3d' },
  };
  G.NODE = NODE;

  G.genMap = (run, stage) => {
    const COLS = 9;
    const cols = [];
    for (let c = 0; c < COLS; c++) {
      let n;
      if (c === 0) n = G.rint(2, 3);
      else if (c === COLS - 1) n = 1;
      else n = G.rint(2, 4);
      const col = [];
      for (let i = 0; i < n; i++) {
        let t;
        if (c === 0) t = 'fight';
        else if (c === COLS - 1) t = 'boss';
        else if (c === COLS - 2) t = i === 0 && n > 2 ? 'shop' : 'rest';
        else if (c === 4 && i === Math.floor(n / 2)) t = 'treasure';
        else if (c === 1) t = G.wpick(['fight', 'event', 'res'], (x) => ({ fight: 5, event: 3, res: 2 }[x]));
        else t = G.wpick(['fight', 'event', 'elite', 'shop', 'res', 'rest'], (x) => ({ fight: 40, event: 22, elite: c >= 3 ? 14 : 0, shop: c >= 2 ? 9 : 0, res: 12, rest: c >= 4 ? 7 : 0 }[x]));
        col.push({ id: `${c}-${i}`, c, i, y: (i + 1) / (n + 1), t, to: [], done: false });
      }
      cols.push(col);
    }
    // avoid same special type repeated in a column
    for (let c = 1; c < COLS - 2; c++) {
      const col = cols[c];
      if (col.length > 1 && col.every((x) => x.t === col[0].t) && col[0].t !== 'fight') col[0].t = 'fight';
    }
    // edges
    for (let c = 0; c < COLS - 1; c++) {
      const a = cols[c], b = cols[c + 1];
      a.forEach((nd, i) => {
        const j = a.length === 1 ? Math.floor((b.length - 1) / 2) : Math.round((i * (b.length - 1)) / (a.length - 1));
        const add = (k) => { if (k >= 0 && k < b.length && !nd.to.includes(b[k].id)) nd.to.push(b[k].id); };
        add(j);
        if (G.chance(0.45)) add(j + (G.chance(0.5) ? 1 : -1));
        if (b.length === 1) add(0);
      });
      b.forEach((nb, k) => {
        if (!a.some((nd) => nd.to.includes(nb.id))) {
          let best = a[0], bd = 9;
          a.forEach((nd) => { const dd = Math.abs(nd.y - nb.y); if (dd < bd) { bd = dd; best = nd; } });
          best.to.push(nb.id);
        }
      });
    }
    // 指名手配: one elite per area carries a bounty (a mid fight becomes one if the map has no elite)
    const elites = cols.slice(2, COLS - 2).flat().filter((n) => n.t === 'elite');
    let wn = elites.length ? G.pick(elites) : null;
    if (!wn) { const f = cols.slice(3, COLS - 2).flat().filter((n) => n.t === 'fight'); if (f.length) { wn = G.pick(f); wn.t = 'elite'; } }
    if (wn) wn.wanted = G.pick(Object.keys(G.WANTED));
    // 深淵: some nodes are corrupted and hide what they are until entered
    if (run.diff >= 3) {
      for (let c = 1; c < COLS - 1; c++) for (const n of cols[c]) if (n.t !== 'boss' && G.chance(0.22)) n.q = true;
    }
    const A = G.areaAt(run, stage);
    return { act: stage, area: A.id, cols, boss: G.pick(A.bosses).slice() };
  };
  G.mapNode = (run, id) => {
    for (const col of run.map.cols) for (const n of col) if (n.id === id) return n;
    return null;
  };
  G.availableNodes = (run) => {
    if (!run.pos) return run.map.cols[0].map((n) => n.id);
    const cur = G.mapNode(run, run.pos);
    return cur ? cur.to.slice() : [];
  };

  // ---------------- encounters ----------------
  G.pickEncounter = (run, kind) => {
    const A = G.area(run);
    let table;
    if (kind === 'boss') return ((run.map && run.map.boss) || A.bosses[0]).slice();
    if (kind === 'elite') table = A.elite;
    else table = run.floor <= 2 ? A.easy : A.normal;
    let cand = table.filter((g) => !run.lastEnc.includes(g.join(',')));
    if (!cand.length) cand = table;
    const g = G.pick(cand);
    run.lastEnc.push(g.join(','));
    if (run.lastEnc.length > 3) run.lastEnc.shift();
    return g.slice();
  };

  // ---------------- rewards ----------------
  G.resGain = (run, key, v) => {
    const mult = G.DIFF[run.diff].res;
    // gains scale with the difficulty; costs (negative) are paid as written
    const n = v > 0 ? Math.max(1, Math.round(v * mult)) : v;
    run.res[key] = Math.max(0, run.res[key] + n);
    return n;
  };
  G.randomResKey = () => G.pick(G.RES_KEYS);

  G.rollCardChoices = (run, heroId, kind) => {
    const def = G.HEROES[heroId];
    const n = 3 + (G.meta.fac.workshop >= 2 ? 1 : 0) + (run.relics.includes('dice') ? 1 : 0);
    const w = kind === 'boss' ? [0, 0, 50, 50] : kind === 'elite' ? [0, 45, 40, 15] : [0, 64, 30, 6];
    const out = [];
    const pool = def.pool.slice();
    for (let i = 0; i < n && pool.length; i++) {
      const byR = (r) => pool.filter((id) => G.CARDS[id].r === r);
      let r = G.wpick([1, 2, 3], (x) => (byR(x).length ? w[x] : 0));
      let p = byR(r);
      if (!p.length) p = pool;
      let id = G.pick(p);
      pool.splice(pool.indexOf(id), 1);
      // now and then a neutral card shows up instead
      if (G.NEUTRAL && G.chance(0.1)) { const nc = G.NEUTRAL.filter((x) => !out.includes(x)); if (nc.length) id = G.pick(nc); }
      out.push(id);
    }
    // legendary cards: 危険 and above, from the third area on
    const leg = G.legendChance(run, kind);
    const lid = def.legend;
    if (lid && leg && G.chance(leg) && !out.includes(lid) && !G.run_has(run, heroId, lid)) out[out.length - 1] = lid;
    return out;
  };
  G.legendChance = (run, kind) => {
    if (run.diff < 2 || run.act < 3) return 0;
    const base = kind === 'boss' ? 0.5 : kind === 'elite' ? 0.25 : 0.04;
    return base + (run.diff >= 3 ? 0.1 : 0);
  };
  G.run_has = (run, heroId, cardId) => { const h = run.heroes.find((x) => x.id === heroId); return !!h && h.deck.some((c) => c.id === cardId); };

  // returns reward object after a won combat
  G.combatRewards = (run, C, kind, bonus) => {
    const rw = { credits: 0, res: {}, cards: [], relic: null, relicChoices: null, gear: null };
    const final = kind === 'boss' && run.act >= G.finalAct(run);
    const addRes = (k, v) => { const n = G.resGain(run, k, v); rw.res[k] = (rw.res[k] || 0) + n; };
    if (kind === 'boss') {
      rw.credits = 80 + G.rint(0, 20);
      G.RES_KEYS.forEach((k) => addRes(k, G.rint(4, 6) + run.act * 2));
      rw.relicChoices = [];
      if (!final) rw.gear = G.gainGear(run, G.randomGear(run, 2));
      if (!G.partsOK(run)) rw.credits += 40;
      if (final) {
        // final boss: nothing left to spend a relic or card on — bring back SI core data instead
        rw.final = true;
        addRes('data', 15); addRes('energy', 10);
      }
      for (let i = 0; i < (final || !G.partsOK(run) ? 0 : 3); i++) {
        const id = G.randomRelic({ relics: run.relics.concat(rw.relicChoices) }, 2);
        if (id) rw.relicChoices.push(id);
      }
    } else if (kind === 'elite') {
      rw.credits = 35 + G.rint(0, 15);
      addRes(G.randomResKey(), G.rint(4, 7) + run.act);
      addRes(G.randomResKey(), G.rint(3, 5) + run.act);
      rw.relic = G.partsOK(run) ? G.randomRelic(run, 1) : null;
      if (G.chance(G.partsOK(run) ? 0.6 : 0.85)) rw.gear = G.gainGear(run, G.randomGear(run, 1));
      if (!G.partsOK(run)) rw.credits += 20;
      if (run.relics.includes('feather')) { rw.credits += 30; addRes(G.randomResKey(), 4); }
    } else {
      rw.credits = 14 + G.rint(0, 10);
      addRes(G.randomResKey(), G.rint(2, 4) + run.act - 1);
      if (G.chance(0.5)) addRes(G.randomResKey(), G.rint(1, 3));
    }
    if (run.relics.includes('phone')) rw.credits += 10;
    if (run.relics.includes('coin')) addRes(G.randomResKey(), 2);
    if (run.heroes.some((h) => h.id === 'madame')) { rw.credits += 12; addRes(G.randomResKey(), 2); }
    run.heroes.forEach((h) => { const g = h.gear && G.GEAR[h.gear]; if (g && g.winCred) rw.credits += g.winCred; });
    if (C) {
      const loot = C.units.filter((u) => u.side === 'H').reduce((s, u) => s + (u.st.loot || 0), 0);
      if (loot) addRes('scrap', loot);
    }
    if (bonus) for (const k in bonus) addRes(k, bonus[k]);
    // bugged enemies drop corrupted data
    if (C && C.bugs) { addRes('data', 3 * C.bugs); rw.bugs = C.bugs; }
    // 支給品
    const itemChance = kind === 'boss' ? 1 : kind === 'elite' ? 0.5 : 0.22;
    if (!rw.final && G.chance(itemChance)) rw.item = G.gainItem(run, G.randomItem(kind === 'boss' ? 2 : 1));
    // 指名手配: the bounty
    if (C && C.wanted) {
      rw.bounty = 60;
      rw.credits += 60;
      rw.item2 = G.gainItem(run, G.randomItem(2));
      if (!rw.gear) rw.gear = G.gainGear(run, G.randomGear(run, 2));
      addRes(G.randomResKey(), 6 + run.act * 2);
      run.stats.bounties = (run.stats.bounties || 0) + 1;
    }
    if (C && C.duoCred) rw.credits += C.duoCred;
    run.credits += rw.credits;
    if (!rw.final) run.heroes.forEach((h) => {
      if (h.hp > 0) rw.cards.push({ hero: h.id, choices: G.rollCardChoices(run, h.id, C && C.wanted ? 'boss' : kind) });
    });
    return rw;
  };

  // write combat results back to the run (hp, downed revive)
  G.applyCombatToRun = (run, C) => {
    const heal = (run.relics.includes('steak') ? 3 : 0) + (G.meta.fac.farm >= 2 ? 2 : 0);
    C.units.filter((u) => u.side === 'H').forEach((u) => {
      const h = run.heroes[u.idx];
      h.maxHp = u.maxHp;
      if (u.dead) h.hp = Math.max(1, Math.floor(h.maxHp * 0.25));
      else h.hp = Math.min(h.maxHp, u.hp + heal);
    });
  };

  G.restHealPct = (run) => {
    let p = 0.3;
    const fl = G.meta.fac.farm;
    if (fl >= 3) p += 0.2; else if (fl >= 1) p += 0.1;
    if (run.relics.includes('tickets')) p += 0.15;
    if (run.relics.includes('photo')) p += 0.1;
    return p;
  };
  G.healParty = (run, pct) => {
    run.heroes.forEach((h) => { h.hp = Math.min(h.maxHp, h.hp + Math.ceil(h.maxHp * pct)); });
  };

  // ---------------- shop ----------------
  G.priceMult = (run) => {
    let m = 1;
    if (G.meta.fac.market >= 2) m -= 0.15;
    if (run.relics.includes('fakeid')) m -= 0.2;
    return m;
  };
  G.genShop = (run) => {
    const pm = G.priceMult(run);
    const cards = [];
    for (let i = 0; i < 6; i++) {
      const h = run.heroes[i % run.heroes.length];
      let id = G.rollCardChoices(run, h.id, 'normal')[0];
      if (i === 5 && G.NEUTRAL) id = G.pick(G.NEUTRAL);
      const r = G.CARDS[id].r;
      const base = [0, 45, 70, 105][r] + G.rint(-5, 8);
      cards.push({ hero: h.id, id, price: Math.round(base * pm), sold: false });
    }
    const relics = [];
    for (let i = 0; i < (G.partsOK(run) ? 3 : 0); i++) {
      const id = G.randomRelic({ relics: run.relics.concat(relics.map((r) => r.id)) }, 1);
      if (id) relics.push({ id, price: Math.round((G.relicPrice(G.RELICS[id]) + G.rint(-10, 10)) * pm), sold: false });
    }
    const gear = [];
    for (let i = 0; i < 2; i++) {
      const id = G.randomGear({ heroes: run.heroes, bag: (run.bag || []).concat(gear.map((g) => g.id)) }, 1);
      if (id) gear.push({ id, price: Math.round((G.gearPrice(G.GEAR[id]) + G.rint(-8, 8)) * pm), sold: false });
    }
    const items = [];
    for (let i = 0; i < 3; i++) {
      const id = G.randomItem(1);
      items.push({ id, price: Math.round((G.itemPrice(G.ITEMS[id]) + G.rint(-4, 6)) * pm), sold: false });
    }
    return { cards, relics, gear, items, removePrice: Math.round(run.removeCost * pm), healPrice: Math.round(45 * pm), healed: false, removed: false };
  };

  // ---------------- run end ----------------
  G.endRun = (run, result) => {
    const m = G.meta;
    // getting past Sophia counts as a clear even if the party falls later
    const route = G.routeOf(run);
    const cleared = result === 'win' || route.slice(0, run.act - 1).includes('sanctum');
    const keep = cleared ? 1 : 0.7;
    const brought = {};
    // leftover credits and parts are exchanged for base resources (same keep ratio)
    const conv = { energy: 0, scrap: 0, food: 0, data: 0 };
    const credUnits = Math.floor(run.credits / 10);
    for (let i = 0; i < credUnits; i++) conv[G.RES_KEYS[i % 4]]++;
    conv.scrap += run.relics.length * 3;
    const gearN = G.ownedGear(run).filter((id) => !G.GEAR[id].hero).length;
    conv.scrap += gearN * 2;
    conv.food += (run.items || []).length * 2;
    const exchange = { credits: run.credits, relics: run.relics.length, gear: gearN, res: {} };
    G.RES_KEYS.forEach((k) => {
      const got = Math.floor(run.res[k] * keep);
      const ex = Math.floor(conv[k] * keep);
      exchange.res[k] = ex;
      brought[k] = got + ex;
      m.res[k] += brought[k];
    });
    m.bestAct = Math.max(m.bestAct, run.act);
    m.lastStage = run.act;
    m.lastWin = cleared;
    let unlockedDiff = null;
    if (result === 'win' && run.diff >= 3) G.setFlag('abyssclear');
    if (result === 'win' && route[route.length - 1] === 'rim') G.setFlag('rimclear');
    if (cleared) {
      m.wins++;
      m.clears[run.diff] = (m.clears[run.diff] || 0) + 1;
      if (run.diff + 1 > m.diffMax && run.diff + 1 <= 3) { m.diffMax = run.diff + 1; unlockedDiff = m.diffMax; }
    }
    G.checkLore();
    G.saveMeta();
    G.clearRun();
    return { brought, keep, unlockedDiff, exchange };
  };

  // ---------------- event API ----------------
  G.mkEventAPI = (run, out) => {
    const heroName = (h) => G.HEROES[h.id].n;
    const randHero = () => G.pick(run.heroes);
    const R = {
      has: (id) => run.heroes.some((h) => h.id === id),
      credits: () => run.credits,
      cred: (v) => { run.credits = Math.max(0, run.credits + v); },
      res: (k, v) => { if (v) G.resGain(run, k, v); },
      healAll: (pct) => G.healParty(run, pct),
      hurt: (who, v) => {
        const hs = who === 'all' ? run.heroes : [randHero()];
        hs.forEach((h) => { h.hp = Math.max(1, h.hp - v); });
        return who === 'all' ? '全員' : heroName(hs[0]);
      },
      maxHp: (who, d) => {
        const hs = who === 'all' ? run.heroes : [randHero()];
        hs.forEach((h) => { h.maxHp = Math.max(10, h.maxHp + d); h.hp = Math.min(h.hp, h.maxHp); });
        return who === 'all' ? '全員' : heroName(hs[0]);
      },
      curse: () => { const h = randHero(); h.deck.push({ id: 'trauma', up: false }); return heroName(h); },
      removeCurse: () => {
        for (const h of run.heroes) {
          const i = h.deck.findIndex((c) => c.id === 'trauma');
          if (i >= 0) { h.deck.splice(i, 1); return true; }
        }
        return false;
      },
      relic: (id) => {
        if (!G.partsOK(run)) { run.credits += 30; out.notes.push('（安全区ではパーツは流通していない。代わりに30クレジットを得た）'); return; }
        let rid = id;
        if (id === 'random1') rid = G.randomRelic(run, 1);
        if (id === 'random3') rid = G.randomRelic(run, 3) || G.randomRelic(run, 1);
        if (rid && !run.relics.includes(rid)) { G.addRelic(run, rid); out.relics.push(rid); }
        else { run.credits += 30; out.notes.push('（既に持っていたので、30クレジットに換金した）'); }
      },
      upgradeRandom: (n) => {
        const names = [];
        for (let i = 0; i < n; i++) {
          const all = [];
          run.heroes.forEach((h) => h.deck.forEach((c) => { if (G.E.canUpgrade(c)) all.push([h, c]); }));
          if (!all.length) break;
          const [h, c] = G.pick(all);
          c.up = true;
          names.push(`${heroName(h)}の「${G.CARDS[c.id].n}」`);
        }
        return names.length ? names.join('、') + 'が強化された。' : '強化できるカードはなかった。';
      },
      giveRare: () => {
        const h = randHero();
        const def = G.HEROES[h.id];
        const pool = def.pool.filter((id) => G.CARDS[id].r === 3);
        const id = G.pick(pool);
        h.deck.push({ id, up: false });
        return `${heroName(h)}は「${G.CARDS[id].n}」を手に入れた。`;
      },
      gear: (id) => {
        let gid = id;
        if (id === 'random1') gid = G.randomGear(run, 1);
        if (id === 'random2') gid = G.randomGear(run, 2) || G.randomGear(run, 1);
        if (id === 'random3') gid = G.randomGear(run, 3) || G.randomGear(run, 2);
        if (gid) { G.gainGear(run, gid); (out.gear = out.gear || []).push(gid); }
        else { run.credits += 30; out.notes.push('（装備は見つからなかったので、30クレジットを拾った）'); }
      },
      flag: (f) => G.setFlag(f),
      encounter: () => G.pickEncounter(run, 'normal'),
      heroName: (id) => G.HEROES[id].n,
      healHero: (id, pct) => { const h = run.heroes.find((x) => x.id === id); if (h) h.hp = Math.min(h.maxHp, h.hp + Math.ceil(h.maxHp * pct)); },
      maxHpHero: (id, d) => { const h = run.heroes.find((x) => x.id === id); if (h) { h.maxHp = Math.max(10, h.maxHp + d); h.hp = Math.min(h.maxHp, Math.max(1, h.hp + Math.max(0, d))); } },
      addCard: (heroId, cardId) => { const h = heroId === 'rand' ? randHero() : run.heroes.find((x) => x.id === heroId); if (h) { h.deck.push({ id: cardId, up: false }); return heroName(h); } return ''; },
      fight: (group, bonus) => { out.next = { type: 'fight', group, bonus }; },
      item: (id) => {
        const got = G.gainItem(run, id === 'random' ? G.randomItem(1) : id);
        if (got === 'full') out.notes.push('（支給品がいっぱいだったので、15クレジットに換えた）');
        else if (got) (out.items = out.items || []).push(got);
      },
      // a capsule prize (R or better) straight into the collection
      prize: () => {
        const st = G.gachaState();
        const pool = G.gachaItems().filter((x) => x.r !== 'N');
        const fresh = pool.filter((x) => !st.own[x.key]);
        const it = G.pick(fresh.length ? fresh : pool);
        if (st.own[it.key]) { st.parts += G.PARTS_FOR_DUPE[it.r]; out.notes.push(`（もう持っていたので、部品+${G.PARTS_FOR_DUPE[it.r]}になった）`); }
        st.own[it.key] = (st.own[it.key] || 0) + 1;
        G.saveMeta();
        return it.n;
      },
      removePick: () => { out.next = { type: 'remove' }; },
      upgradePick: () => { out.next = { type: 'upgrade' }; },
    };
    return R;
  };

  G.availableEvents = (run) => {
    const seen = run.seenEvents || [];
    const ar = G.area(run);
    const ok = (e) => (e.acts.includes(ar.tag) || (ar.gen && e.acts.length >= 3 && e.acts.every((a) => typeof a === 'number' && a <= 3)))
      && (!e.need || run.heroes.some((h) => h.id === e.need)) && (!e.need2 || run.heroes.some((h) => h.id === e.need2)) && (!e.cond || e.cond(G.meta, run));
    let ev = G.EVENTS.filter((e) => ok(e) && !seen.includes(e.id));
    if (!ev.length) ev = G.EVENTS.filter(ok);
    return ev;
  };
  // crew stories and continuing stories come up more often; rare finds seldom
  G.eventWeight = (e) => (e.rare ? 0.25 : e.chain ? 2.5 : e.need2 ? 2.2 : e.need ? 1.6 : 1);
  G.pickEvent = (run) => G.wpick(G.availableEvents(run), G.eventWeight);
  // a little label shown above the event title
  G.eventBadge = (e) => {
    if (e.rare) return { t: '★ レアイベント', c: '#ffd93d' };
    if (e.chain) return { t: e.chain > 1 ? 'つづきの物語' : 'はじまりの物語', c: '#7dffb0' };
    if (e.need2) return { t: `${G.HEROES[e.need].n}と${G.HEROES[e.need2].n}`, c: '#ff9ec4' };
    if (e.need) return { t: `${G.HEROES[e.need].n}の物語`, c: '#ff9ec4' };
    return null;
  };
})();
