// NEON CRADLE - core utilities & shared definitions
(function () {
  const G = (globalThis.G = globalThis.G || {});

  // ---------- random / array utils ----------
  G.rnd = (n) => Math.floor(Math.random() * n);
  G.rint = (a, b) => a + G.rnd(b - a + 1);
  G.pick = (arr) => arr[G.rnd(arr.length)];
  G.chance = (p) => Math.random() < p;
  G.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = G.rnd(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  G.wpick = (items, wfn) => {
    const ws = items.map(wfn);
    const tot = ws.reduce((s, w) => s + w, 0);
    let r = Math.random() * tot;
    for (let i = 0; i < items.length; i++) {
      r -= ws[i];
      if (r < 0) return items[i];
    }
    return items[items.length - 1];
  };
  G.sample = (arr, n) => G.shuffle(arr).slice(0, n);
  G.deep = (o) => JSON.parse(JSON.stringify(o));

  // ---------- resources ----------
  G.RES = {
    energy: { n: 'エネルギー', icon: 'i_energy', c: '#ffd93d' },
    scrap: { n: 'スクラップ', icon: 'i_scrap', c: '#9a9cb2' },
    food: { n: '合成食料', icon: 'i_food', c: '#7dffb0' },
    data: { n: 'データ', icon: 'i_data', c: '#2ee6ff' },
  };
  G.RES_KEYS = ['energy', 'scrap', 'food', 'data'];

  // ---------- roles ----------
  G.ROLES = {
    tank: { n: 'タンク', c: '#3466d6', icon: '盾' },
    healer: { n: 'ヒーラー', c: '#3a9e4a', icon: '癒' },
    attacker: { n: 'アタッカー', c: '#e8352e', icon: '剣' },
    special: { n: '特殊', c: '#a05cff', icon: '奇' },
  };

  // ---------- difficulty ----------
  G.DIFF = [
    { n: '安全区', en: 'SAFE', hp: 0.8, dmg: 0.8, res: 0.8, c: '#7dffb0',
      d: '敵のHPと攻撃力が低い。はじめての出撃に。' },
    { n: '標準', en: 'NORMAL', hp: 1.0, dmg: 1.0, res: 1.0, c: '#2ee6ff',
      d: 'SIの通常警戒レベル。' },
    { n: '危険', en: 'HAZARD', hp: 1.2, dmg: 1.15, res: 1.4, c: '#ff8a2b',
      d: '敵が強化される。持ち帰る資源×1.4。' },
    { n: '深淵', en: 'ABYSS', hp: 1.4, dmg: 1.3, res: 1.8, c: '#ff3d8b',
      d: '敵が大幅に強化され、エリートとボスは強化2を持つ。資源×1.8。' },
  ];

  // ---------- status effects ----------
  // k: kind -> 'buff' | 'debuff'
  // dur: decrements at end of owner's turn
  G.ST = {
    str: { n: '強化', k: 'buff', c: '#ff8a2b', g: '力', d: '攻撃ダメージ+{v}' },
    weak: { n: '弱体', k: 'debuff', dur: 1, c: '#9a9cb2', g: '弱', d: '与える攻撃ダメージ-25%（残り{v}ターン）' },
    vuln: { n: '脆弱', k: 'debuff', dur: 1, c: '#ff3d8b', g: '脆', d: '受ける攻撃ダメージ+50%（残り{v}ターン）' },
    slow: { n: '鈍足', k: 'debuff', dur: 1, c: '#3466d6', g: '鈍', d: '速度-3（残り{v}ターン）' },
    haste: { n: '加速', k: 'buff', dur: 1, c: '#2ee6ff', g: '速', d: '速度+3（残り{v}ターン）' },
    taunt: { n: '挑発', k: 'buff', dur: 1, c: '#e8352e', g: '挑', d: '敵の単体攻撃を引きつける（残り{v}ターン）' },
    stealth: { n: '隠密', k: 'buff', dur: 1, c: '#6b5f8a', g: '隠', d: '敵の単体攻撃の対象にならない（残り{v}ターン）' },
    fortify: { n: '鋼鉄', k: 'buff', dur: 1, c: '#9a9cb2', g: '鋼', d: 'ターン開始時にシールドが消えない（残り{v}ターン）' },
    stun: { n: 'スタン', k: 'debuff', c: '#ffd93d', g: '眩', d: '次のターン行動できない' },
    confuse: { n: '混乱', k: 'debuff', c: '#a05cff', g: '惑', d: '次の行動の対象がランダムになる（敵味方問わず）' },
    virus: { n: 'ウイルス', k: 'debuff', c: '#b8ff3d', g: '毒', d: 'ターン開始時{v}ダメージ（防御無視）、その後-1。倒れると別の敵に感染する' },
    burn: { n: '焼損', k: 'debuff', c: '#ff8a2b', g: '焼', d: 'ターン開始時{v}ダメージ（防御無視）、その後半減' },
    bleed: { n: '裂傷', k: 'debuff', c: '#e8352e', g: '裂', d: '攻撃を受けるたび、追加で{v}ダメージ（防御無視）を受け、その後-1。肉も装甲も、裂け目から崩れる' },
    aim: { n: '照準', k: 'debuff', c: '#ff3d8b', g: '的', d: '次に受ける攻撃のダメージ+{v}×3。命中で消費' },
    regen: { n: '再生', k: 'buff', c: '#7dffb0', g: '再', d: 'ターン開始時HP{v}回復、その後-1' },
    thorns: { n: '反射', k: 'buff', c: '#c9a85a', g: '棘', d: '攻撃を受けると攻撃者に{v}ダメージ' },
    barrier: { n: '障壁', k: 'buff', c: '#2ee6ff', g: '障', d: '次に受けるダメージを無効化（{v}回）' },
    shiny: { n: '光りもの', k: 'buff', c: '#ffd93d', g: '光', d: '拾い集めた光りもの。一部のカードで消費する（{v}個）' },
    charge: { n: '充電', k: 'buff', c: '#ffd93d', g: '電', d: '電力。一部のカードで消費する（{v}）' },
    drone: { n: 'ドローン', k: 'buff', c: '#9a9cb2', g: '鼠', d: 'ターン終了時、ドローン1機につきランダムな敵に3ダメージ（{v}機）' },
    inspire: { n: '鼓舞', k: 'buff', c: '#ffd93d', g: '鼓', d: '次のターン開始時エナジー+{v}' },
    focus: { n: '集中', k: 'buff', c: '#ff3d8b', g: '集', d: '次に使う攻撃カードのダメージ2倍' },
    undying: { n: '不死身', k: 'buff', c: '#ff5ad1', g: '不', d: '致死ダメージを受けてもHP1で耐える（{v}回）' },
    // powers (permanent, with hooks)
    plating: { n: '装甲', k: 'buff', pw: 1, c: '#9a9cb2', g: '甲', d: 'ターン開始時シールド+{v}' },
    medic: { n: '救急体制', k: 'buff', pw: 1, c: '#7dffb0', g: '救', d: 'ターン開始時、味方全員のHPを{v}回復' },
    nurse: { n: '定期検診', k: 'buff', pw: 1, c: '#7dffb0', g: '診', d: 'ターン開始時、HP割合が最も低い味方のHPを{v}回復' },
    guardian: { n: '番犬', k: 'buff', pw: 1, c: '#3466d6', g: '番', d: 'ターン開始時、味方全員にシールド{v}' },
    dynamo: { n: '磁気', k: 'buff', pw: 1, c: '#ffd93d', g: '磁', d: 'ターン開始時、充電+{v}' },
    backdoor: { n: 'バックドア', k: 'buff', pw: 1, c: '#b8ff3d', g: '門', d: 'ターン開始時、全敵にウイルス{v}' },
    nest: { n: '巣', k: 'buff', pw: 1, c: '#9a9cb2', g: '巣', d: 'ターン開始時、ドローン+{v}' },
    droneUp: { n: '改造', k: 'buff', pw: 1, c: '#9a9cb2', g: '改', d: 'ドローン1機の攻撃ダメージ+{v}' },
    ratKing: { n: '王', k: 'buff', pw: 1, c: '#c9a85a', g: '王', d: 'ドローンが攻撃するたび、HP割合が最も低い味方にシールド{v}' },
    hoard: { n: '光の巣', k: 'buff', pw: 1, c: '#ffd93d', g: '巣', d: 'ターン開始時、光りもの+{v}' },
    marking: { n: 'マーキング', k: 'buff', pw: 1, c: '#ffb36b', g: '印', d: '攻撃ヒット時、照準{v}を付与' },
    ignite: { n: '炎上体質', k: 'buff', pw: 1, c: '#ff8a2b', g: '炎', d: '攻撃ヒット時、焼損{v}を付与' },
    bloodlust: { n: '血の舞', k: 'buff', pw: 1, c: '#e8352e', g: '舞', d: '攻撃ヒット時、裂傷{v}を付与' },
    marksman: { n: '熟練', k: 'buff', pw: 1, c: '#ff3d8b', g: '熟', d: '照準1スタックあたりのボーナス+{v}' },
    rage: { n: '暴走', k: 'buff', pw: 1, c: '#e8352e', g: '暴', d: 'ターン開始時、HPを2失い強化+{v}' },
    spikeshell: { n: '茨の檻', k: 'buff', pw: 1, c: '#c9a85a', g: '檻', d: '攻撃を受けるたびシールド+{v}' },
    possess: { n: '神降ろし', k: 'buff', pw: 1, c: '#ff5ad1', g: '神', d: 'ターン開始時、HPを2支払い味方全員のHPを{v}回復' },
    dividend: { n: '配当', k: 'buff', pw: 1, c: '#c9a85a', g: '配', d: 'ターン開始時、クレジット+3・味方全員にシールド{v}' },
    extraDraw: { n: '呼び声', k: 'buff', pw: 1, c: '#a05cff', g: '呼', d: 'ターン開始時、追加で{v}枚ドロー' },
    noDecay: { n: '自己増殖', k: 'buff', pw: 1, c: '#b8ff3d', g: '殖', d: '敵のウイルスが減少しない' },
    loot: { n: '横流し', k: 'buff', pw: 1, c: '#c9a85a', g: '横', d: '戦闘勝利時、スクラップ+{v}' },
    // enemy passives
    armorUp: { n: '自己修復', k: 'buff', pw: 1, c: '#9a9cb2', g: '修', d: 'ターン開始時シールド+{v}' },
    grief: { n: '共鳴', k: 'buff', pw: 1, c: '#ff5ad1', g: '鳴', d: '仲間が倒れると強化+{v}' },
  };

  G.isDebuff = (key) => G.ST[key] && G.ST[key].k === 'debuff';
  G.stDesc = (key, v) => {
    const s = G.ST[key];
    if (!s) return key;
    return s.d.replace(/\{v\}/g, v);
  };
  // 'buff' | 'debuff' | 'power' (permanent buff)
  G.stKind = (key) => { const s = G.ST[key]; return !s ? 'buff' : s.k === 'debuff' ? 'debuff' : s.pw ? 'power' : 'buff'; };
  G.ST_KIND_N = { buff: '▲バフ', debuff: '▼デバフ', power: '★パワー（永続）' };
  G.stTip = (key, v) => {
    const s = G.ST[key];
    if (!s) return key;
    const kind = G.stKind(key);
    const val = v == null ? '' : ` ${v}`;
    return `<div class="tn">${s.n}${val} <span class="tk ${kind}">${G.ST_KIND_N[kind]}</span></div>${G.stDesc(key, v == null ? 'X' : v)}`;
  };

  // tiny DOM helper (browser only)
  G.h = (tag, attrs, ...kids) => {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'style' && typeof v === 'object') { for (const p in v) { if (p.startsWith('--')) el.style.setProperty(p, v[p]); else el.style[p] = v[p]; } }
        else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
        else if (k === 'html') el.innerHTML = v;
        else el.setAttribute(k, v);
      }
    }
    for (const kid of kids.flat(3)) {
      if (kid == null || kid === false) continue;
      el.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid);
    }
    return el;
  };

  G.sleep = (ms) => new Promise((r) => setTimeout(r, ms / (G.speedMul || 1)));
})();
