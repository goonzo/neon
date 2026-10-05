// Shared UI helpers
(function () {
  const G = globalThis.G;
  const h = G.h;
  const E = G.E;
  const UI = (G.UI = {});

  UI.W = 960; UI.H = 540;
  // touch devices get bigger text, tap-to-zoom cards and a fullscreen button
  UI.isTouch = typeof window !== 'undefined' && ((window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window);
  UI.bigUI = () => { const v = G.meta.settings.bigui; return v == null ? UI.isTouch : v; };
  UI.applyPrefs = () => {
    document.body.classList.toggle('bigui', UI.bigUI());
    document.body.classList.toggle('touch', UI.isTouch);
  };
  UI.canFullscreen = () => !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
  UI.isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  UI.toggleFullscreen = () => {
    const el = document.documentElement;
    if (UI.isFullscreen()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req) return;
    const p = req.call(el, { navigationUI: 'hide' });
    const lock = () => { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* not supported */ } };
    if (p && p.then) p.then(lock).catch(() => {}); else lock();
  };
  // small hint for iPhone, where the fullscreen API isn't available
  UI.isIOS = () => /iPhone|iPod/.test(navigator.userAgent || '');
  UI.root = () => document.getElementById('game');
  UI.scale = 1;

  UI.fit = () => {
    const wrap = document.getElementById('wrap');
    const s = Math.min(wrap.clientWidth / UI.W, wrap.clientHeight / UI.H);
    UI.scale = s;
    const r = UI.root();
    r.style.transform = `scale(${s})`;
    r.style.left = Math.floor((wrap.clientWidth - UI.W * s) / 2) + 'px';
    r.style.top = Math.floor((wrap.clientHeight - UI.H * s) / 2) + 'px';
  };
  // convert client coords to game coords
  UI.toGame = (cx, cy) => {
    const rr = UI.root().getBoundingClientRect();
    return { x: (cx - rr.left) / UI.scale, y: (cy - rr.top) / UI.scale };
  };
  UI.elCenter = (el) => {
    const r = el.getBoundingClientRect();
    return UI.toGame(r.left + r.width / 2, r.top + r.height / 2);
  };
  UI.elTop = (el) => {
    const r = el.getBoundingClientRect();
    return UI.toGame(r.left + r.width / 2, r.top);
  };

  // ---------- screens ----------
  UI.clear = () => {
    const r = UI.root();
    r.innerHTML = '';
    r.appendChild(h('div', { id: 'fx' }));
    UI.tipEl = h('div', { id: 'tip', class: 'hidden' });
    r.appendChild(UI.tipEl);
    UI.cleanup && UI.cleanup();
    UI.cleanup = null;
    UI.keyHandler = null;
  };
  UI.screen = (cls) => {
    UI.clear();
    const s = h('div', { class: 'screen ' + (cls || '') });
    UI.root().insertBefore(s, document.getElementById('fx'));
    return s;
  };

  // ---------- tooltip (delegated) ----------
  UI.initTip = () => {
    const r = UI.root();
    r.addEventListener('mousemove', (e) => {
      const tip = UI.tipEl;
      if (!tip) return;
      const t = e.target.closest && e.target.closest('[data-tip], .kw[data-st], [data-card]');
      if (!t) { tip.classList.add('hidden'); return; }
      let html = '';
      if (t.dataset.tip) html = t.dataset.tip;
      else if (t.dataset.st) html = G.stTip(t.dataset.st);
      if (!html) { tip.classList.add('hidden'); return; }
      tip.innerHTML = html;
      tip.classList.remove('hidden');
      const p = UI.toGame(e.clientX, e.clientY);
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      let x = p.x + 14, y = p.y + 14;
      if (x + tw > UI.W - 4) x = p.x - tw - 10;
      if (y + th > UI.H - 4) y = p.y - th - 10;
      tip.style.left = Math.max(2, x) + 'px';
      tip.style.top = Math.max(2, y) + 'px';
    });
    r.addEventListener('mouseleave', () => UI.tipEl && UI.tipEl.classList.add('hidden'));
    // touch: tap on a tooltip target shows it briefly
    let tt = null;
    r.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      const t = e.target.closest && e.target.closest('[data-tip], .kw[data-st]');
      if (!t) return;
      const tip = UI.tipEl;
      const html = t.dataset.tip || (t.dataset.st ? G.stTip(t.dataset.st) : '');
      if (!html || !tip) return;
      tip.innerHTML = html;
      tip.classList.remove('hidden');
      const p = UI.toGame(e.clientX, e.clientY);
      tip.style.left = Math.max(2, Math.min(UI.W - tip.offsetWidth - 4, p.x - tip.offsetWidth / 2)) + 'px';
      tip.style.top = Math.max(2, p.y - tip.offsetHeight - 18) + 'px';
      clearTimeout(tt);
      tt = setTimeout(() => tip.classList.add('hidden'), 2600);
    });
  };
  UI.hideTip = () => UI.tipEl && UI.tipEl.classList.add('hidden');

  // ---------- modal ----------
  UI.modal = (content, opts) => {
    opts = opts || {};
    UI.closeModal();
    const m = h('div', { id: 'modal' });
    const p = h('div', { class: 'panel', style: Object.assign({ width: (opts.w || 600) + 'px' }, opts.style || {}) }, content);
    m.appendChild(p);
    if (!opts.noClose) m.addEventListener('click', (e) => { if (e.target === m) UI.closeModal(); });
    UI.root().appendChild(m);
    UI.hideTip();
    return p;
  };
  UI.closeModal = () => { const m = document.getElementById('modal'); if (m) m.remove(); UI.hideTip(); };
  UI.confirm = (text, onYes, yesLabel) => {
    UI.modal(h('div', { class: 'col', style: { gap: '14px' } },
      h('div', { style: { whiteSpace: 'pre-wrap', fontSize: '15px' } }, text),
      h('div', { class: 'row', style: { justifyContent: 'flex-end' } },
        h('button', { class: 'btn', onclick: () => { G.A.sfx('click'); UI.closeModal(); } }, 'やめる'),
        h('button', { class: 'btn pink', onclick: () => { G.A.sfx('click'); UI.closeModal(); onYes(); } }, yesLabel || 'はい'))), { w: 440 });
  };

  // ---------- small widgets ----------
  UI.btn = (label, onclick, cls, attrs) => h('button', Object.assign({ class: 'btn ' + (cls || ''), onclick: (e) => { G.A.sfx('click'); onclick(e); } }, attrs || {}), label);
  UI.resIcon = (k) => G.sprImg(G.RES[k].icon, 2);
  UI.resRow = (res, opts) => {
    opts = opts || {};
    return h('div', { class: 'row', style: { gap: '12px' } }, G.RES_KEYS.filter((k) => !opts.nonzero || res[k]).map((k) =>
      h('span', { class: 'res', 'data-tip': `<div class="tn">${G.RES[k].n}</div>拠点の強化や仲間の勧誘に使う。` }, UI.resIcon(k), h('span', { style: { color: G.RES[k].c } }, (opts.plus ? '+' : '') + res[k]))));
  };
  UI.costRow = (cost) => h('span', { class: 'cost' }, Object.keys(cost).map((k) =>
    h('span', { class: 'res' + ((G.meta.res[k] || 0) < cost[k] ? ' no' : '') }, UI.resIcon(k), String(cost[k]))));
  UI.cred = (v) => h('span', { class: 'res', 'data-tip': '<div class="tn">クレジット</div>地上の闇市で使える通貨。拠点には持ち帰れない。' }, G.sprImg('i_cred', 2), h('span', { style: { color: '#ffd93d' } }, String(v)));
  UI.roleBadge = (role) => h('span', { class: 'rolebadge', style: { background: G.ROLES[role].c } }, G.ROLES[role].n);
  UI.hpbar = (hp, max, w) => {
    const r = max ? hp / max : 0;
    return h('div', { class: 'hpbar', style: { width: (w || 80) + 'px' } }, h('div', { class: 'fill ' + (r > 0.6 ? 'hi' : r > 0.3 ? 'mid' : ''), style: { width: Math.max(0, Math.min(100, r * 100)) + '%' } }));
  };
  UI.relicChip = (id) => {
    const r = G.RELICS[id];
    return h('div', { class: 'relic r' + r.r, style: { color: ['', '#e8e8f0', '#2ee6ff', '#ff5ad1'][r.r] }, 'data-tip': `<div class="tn">${r.n}</div>${r.d}<div class="tf">${r.f}</div>` }, r.n[0]);
  };
  UI.relicPanel = (id, onclick, extra) => {
    const r = G.RELICS[id];
    return h('div', { class: 'panel', style: { width: '220px', cursor: onclick ? 'pointer' : 'default' }, onclick: onclick ? () => { G.A.sfx('click'); onclick(); } : null },
      h('div', { class: 'row' }, UI.relicChip(id), h('span', { style: { fontSize: '15px', color: ['', '#fff', '#2ee6ff', '#ff5ad1'][r.r] } }, r.n)),
      h('div', { style: { fontSize: '13px', marginTop: '6px' } }, r.d),
      h('div', { class: 'sub', style: { marginTop: '4px' } }, r.f),
      extra || null);
  };

  const TGN = { E: '単体', AE: '敵全体', RE: 'ランダム', A: '味方1人', AA: '味方全体', AO: '他の味方', S: '自分', D: '倒れた味方', N: '' };
  const RC = ['', '#9a9cb2', '#2ee6ff', '#ff5ad1'];
  UI.card = (card, o) => {
    o = o || {};
    const d = E.cardDef(card);
    const hero = d.hero ? G.HEROES[d.hero] : null;
    const el = h('div', { class: `card t-${d.t}${card.up ? ' upg' : ''}${o.cls ? ' ' + o.cls : ''}`, style: { '--cc': hero ? hero.col : '#6b5f8a' } },
      h('div', { class: 'cbg' }),
      h('div', { class: 'cost' + (d.c == null ? ' x' : '') }, d.c == null ? '×' : String(d.c)),
      h('div', { class: 'cname' + ((d.n.length + (card.up ? 1 : 0)) > 7 ? ' long' : '') }, d.n + (card.up ? '+' : '')),
      h('div', { class: 'ctype' }, h('span', null, E.TYPE_N[d.t]), h('span', null, TGN[d.tg] || '')),
      h('div', { class: 'cdesc', html: E.cardText(card, o.u, o.C) }),
      hero ? h('div', { class: 'chero' }, hero.n) : d.t !== 'C' ? h('div', { class: 'chero' }, '汎用') : null,
      d.r > 0 ? h('div', { class: 'rar', style: { color: RC[d.r] } }, '◆'.repeat(d.r)) : null);
    if (o.onclick) el.addEventListener('click', o.onclick);
    if (o.preview && E.canUpgrade(card)) {
      const upc = { id: card.id, up: true };
      el.addEventListener('mouseenter', () => { el.querySelector('.cdesc').innerHTML = E.cardText(upc); el.querySelector('.cname').textContent = d.n + '+'; el.classList.add('upg'); const ud = E.cardDef(upc); el.querySelector('.cost').textContent = ud.c; });
      el.addEventListener('mouseleave', () => { el.querySelector('.cdesc').innerHTML = E.cardText(card); el.querySelector('.cname').textContent = d.n; el.classList.remove('upg'); el.querySelector('.cost').textContent = d.c; });
    }
    return el;
  };

  // ---------- floating fx ----------
  UI.float = (x, y, text, color, cls) => {
    const fx = document.getElementById('fx');
    if (!fx) return;
    const el = h('div', { class: 'float ' + (cls || ''), style: { left: x + 'px', top: y + 'px', color: color || '#fff' } }, text);
    fx.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  };
  UI.banner = (text, color) => {
    const fx = document.getElementById('fx');
    if (!fx) return;
    const el = h('div', { class: 'banner', style: color ? { textShadow: `3px 3px 0 ${color}, -2px -2px 0 #000` } : null }, text);
    fx.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  };

  // typewriter text
  UI.typewrite = (el, text, cps) => {
    let i = 0, done = false, tm = null;
    el.textContent = '';
    const step = () => {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i >= text.length) { done = true; return; }
      tm = setTimeout(step, 1000 / (cps || 45));
    };
    step();
    return {
      get done() { return done; },
      finish() { if (tm) clearTimeout(tm); el.textContent = text; done = true; },
    };
  };

  // ---------- procedural backgrounds ----------
  function lcg(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  UI.bg = (parent, kind, opts) => {
    opts = opts || {};
    const W = 480, H = 270;
    const cv = h('canvas', { class: 'bgcv px', width: W, height: H });
    const x = cv.getContext('2d');
    const R = lcg(opts.seed || 7);
    const grad = (c1, c2) => { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, W, H); };
    if (kind === 'bunker') {
      grad('#120f1e', '#07060c');
      // wall panels
      for (let i = 0; i < 12; i++) { x.fillStyle = i % 2 ? '#17142a' : '#141226'; x.fillRect(i * 40, 0, 40, 200); }
      x.fillStyle = '#0d0b18'; for (let i = 0; i <= 12; i++) x.fillRect(i * 40, 0, 2, 200);
      // pipes
      x.fillStyle = '#2b2440'; x.fillRect(0, 22, W, 6); x.fillRect(0, 34, W, 3);
      x.fillStyle = '#3b3154'; x.fillRect(0, 22, W, 1);
      for (let i = 0; i < 8; i++) { x.fillStyle = '#4b4b5c'; x.fillRect(30 + i * 60, 20, 4, 10); }
      // monitors
      for (let i = 0; i < 9; i++) {
        const mx = 150 + (i % 5) * 62 + (i > 4 ? 30 : 0), my = 60 + (i > 4 ? 52 : 0);
        x.fillStyle = '#0b0a12'; x.fillRect(mx - 2, my - 2, 40, 30);
        x.fillStyle = R() < 0.3 ? '#1a3a2a' : '#0f2a3a'; x.fillRect(mx, my, 36, 26);
        x.fillStyle = R() < 0.5 ? '#2ee6ff' : '#7dffb0';
        for (let l = 0; l < 4; l++) x.fillRect(mx + 3, my + 4 + l * 5, 6 + Math.floor(R() * 24), 2);
      }
      // floor
      x.fillStyle = '#0d0b16'; x.fillRect(0, 200, W, 70);
      x.fillStyle = '#1b1730'; for (let i = 0; i < W; i += 24) x.fillRect(i, 200, 22, 2);
      // cables
      x.strokeStyle = '#1f1a33'; x.lineWidth = 2;
      for (let i = 0; i < 6; i++) { x.beginPath(); const sx = R() * W; x.moveTo(sx, 37); x.quadraticCurveTo(sx + 20, 90 + R() * 60, sx + 40 + R() * 30, 37); x.stroke(); }
      // mother core glow
      const g = x.createRadialGradient(70, 120, 4, 70, 120, 90); g.addColorStop(0, 'rgba(46,230,255,0.35)'); g.addColorStop(1, 'rgba(46,230,255,0)');
      x.fillStyle = g; x.fillRect(0, 20, 180, 200);
    } else if (kind === 'cradle') {
      // the bottom of the cradle: a dark sea of sleeping capsules
      grad('#05040a', '#1a1030');
      for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(255,90,209,${0.1 + R() * 0.4})`; x.fillRect(Math.floor(R() * W), Math.floor(R() * 150), 1, 1); }
      for (let row = 0; row < 4; row++) {
        const y = 120 + row * 30, sc = 0.6 + row * 0.25;
        for (let i = 0; i < 12 - row * 2; i++) {
          const cx = Math.floor((i + (row % 2) * 0.5) * (W / (11 - row * 2))), w = Math.floor(14 * sc), hh = Math.floor(26 * sc);
          x.fillStyle = 'rgba(46,230,255,0.08)'; x.fillRect(cx - w / 2 - 2, y - hh - 2, w + 4, hh + 4);
          x.fillStyle = '#0d0b1e'; x.fillRect(cx - w / 2, y - hh, w, hh);
          x.fillStyle = 'rgba(46,230,255,0.35)'; x.fillRect(cx - w / 2, y - hh, w, 1); x.fillRect(cx - w / 2, y - 2, w, 1);
          x.fillStyle = 'rgba(255,217,186,0.25)'; x.fillRect(cx - 2, y - hh + 4, 4, 4);
        }
      }
      const g2 = x.createRadialGradient(240, 40, 4, 240, 40, 120); g2.addColorStop(0, 'rgba(255,90,209,0.25)'); g2.addColorStop(1, 'rgba(255,90,209,0)');
      x.fillStyle = g2; x.fillRect(0, 0, W, 160);
      x.fillStyle = '#0b0a12'; x.fillRect(0, 230, W, 40);
    } else if (kind === 'sanctum') {
      grad('#e8e4f4', '#9a90bc');
      for (let i = 0; i < 9; i++) { const px = 20 + i * 56; x.fillStyle = 'rgba(255,255,255,0.55)'; x.fillRect(px, 30, 18, 200); x.fillStyle = 'rgba(169,159,201,0.5)'; x.fillRect(px + 14, 30, 4, 200); }
      x.strokeStyle = 'rgba(255,217,61,0.6)'; x.lineWidth = 2;
      for (let i = 0; i < 3; i++) { x.beginPath(); x.ellipse(240, 40, 60 + i * 34, 10 + i * 6, 0, 0, Math.PI * 2); x.stroke(); }
      x.fillStyle = '#c9c4dc'; x.fillRect(0, 210, W, 60);
      x.fillStyle = '#b4acd0'; for (let i = 0; i < W; i += 32) x.fillRect(i, 210, 30, 1);
      // creepy eye
      x.fillStyle = 'rgba(255,255,255,0.9)'; x.beginPath(); x.ellipse(240, 40, 22, 9, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#e8352e'; x.beginPath(); x.arc(240, 40, 5, 0, Math.PI * 2); x.fill();
    } else {
      // city (act palette) / title
      const A = G.ACTS[opts.act || 1] || G.ACTS[1];
      const sky = kind === 'title' ? ['#0b0a12', '#2a1550'] : A.sky;
      const neon = kind === 'title' ? ['#ff3d8b', '#2ee6ff'] : A.neon;
      grad(sky[0], sky[1]);
      for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,255,255,${0.2 + R() * 0.6})`; x.fillRect(Math.floor(R() * W), Math.floor(R() * 120), 1, 1); }
      // the SI eye in the sky
      if (kind !== 'title' || true) {
        const ex = opts.eyeX || 360, ey = 46;
        x.fillStyle = 'rgba(255,255,255,0.08)'; x.beginPath(); x.ellipse(ex, ey, 46, 18, 0, 0, Math.PI * 2); x.fill();
        x.fillStyle = 'rgba(232,53,46,0.35)'; x.beginPath(); x.arc(ex, ey, 9, 0, Math.PI * 2); x.fill();
        x.fillStyle = 'rgba(232,53,46,0.8)'; x.fillRect(ex - 2, ey - 2, 4, 4);
      }
      const layer = (base, hmin, hmax, col, winCol, wp) => {
        let bx = -10;
        while (bx < W) {
          const bw = 18 + Math.floor(R() * 34), bh = hmin + Math.floor(R() * (hmax - hmin));
          x.fillStyle = col; x.fillRect(bx, base - bh, bw, bh + 80);
          if (R() < 0.3) { x.fillRect(bx + bw / 2 - 1, base - bh - 10, 2, 10); }
          for (let wy = base - bh + 4; wy < base - 4; wy += 6) for (let wx = bx + 3; wx < bx + bw - 3; wx += 5) {
            if (R() < wp) { x.fillStyle = R() < 0.15 ? neon[1] : winCol; x.fillRect(wx, wy, 2, 2); }
          }
          x.fillStyle = col;
          bx += bw + Math.floor(R() * 4);
        }
      };
      layer(200, 40, 120, 'rgba(20,16,36,0.9)', 'rgba(255,217,61,0.35)', 0.12);
      layer(220, 30, 90, '#120f20', 'rgba(255,217,61,0.5)', 0.18);
      // neon signs
      for (let i = 0; i < 7; i++) {
        const sx = Math.floor(R() * W), sy = 120 + Math.floor(R() * 70), sw = 6 + Math.floor(R() * 14), sh = 3 + Math.floor(R() * 12);
        const c = neon[i % 2];
        x.fillStyle = c; x.globalAlpha = 0.25; x.fillRect(sx - 2, sy - 2, sw + 4, sh + 4); x.globalAlpha = 1;
        x.fillRect(sx, sy, sw, sh);
        x.fillStyle = '#0b0a12'; for (let k = 2; k < sw - 1; k += 3) x.fillRect(sx + k, sy + 1, 1, sh - 2);
      }
      x.fillStyle = A.ground || '#120f20'; x.fillRect(0, 222, W, 48);
      x.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < W; i += 20) x.fillRect(i, 236, 12, 1);
      // reflections
      for (let i = 0; i < 20; i++) { x.fillStyle = R() < 0.5 ? neon[0] : neon[1]; x.globalAlpha = 0.2; x.fillRect(Math.floor(R() * W), 226 + Math.floor(R() * 40), 1 + Math.floor(R() * 5), 1); }
      x.globalAlpha = 1;
      // rain
      if (opts.rain !== false) {
        x.fillStyle = 'rgba(160,180,255,0.18)';
        for (let i = 0; i < 160; i++) { const rx = Math.floor(R() * W), ry = Math.floor(R() * H); x.fillRect(rx, ry, 1, 4); }
      }
    }
    parent.appendChild(cv);
    return cv;
  };
  UI.actBg = (parent, act) => {
    if (act === 4) return UI.bg(parent, 'cradle', { seed: 44 });
    if (act === 3) return UI.bg(parent, 'sanctum');
    return UI.bg(parent, 'city', { act, seed: act * 31 + 5 });
  };

  // deck viewer
  UI.deckView = (heroes, startIdx) => {
    let idx = startIdx || 0;
    const body = h('div');
    const draw = () => {
      body.innerHTML = '';
      const hh = heroes[idx];
      const def = G.HEROES[hh.id];
      body.appendChild(h('div', { class: 'row', style: { marginBottom: '8px', flexWrap: 'wrap' } },
        heroes.map((x, i) => UI.btn(G.HEROES[x.id].n, () => { idx = i; draw(); }, i === idx ? 'sel sm' : 'sm')),
        h('span', { class: 'grow' }),
        UI.btn('閉じる', UI.closeModal, 'sm')));
      body.appendChild(h('div', { class: 'sub', style: { marginBottom: '6px' } }, `${def.n}のデッキ（${hh.deck.length}枚）　特性：${def.trait.n} — ${def.trait.d}`));
      if (hh.gear) body.appendChild(h('div', { class: 'row sub', style: { marginBottom: '6px', gap: '4px' } }, '装備：', UI.gearChip(hh.gear), G.GEAR[hh.gear].n, '— ', G.GEAR[hh.gear].d));
      const sorted = hh.deck.slice().sort((a, b) => (G.CARDS[a.id].c || 0) - (G.CARDS[b.id].c || 0) || a.id.localeCompare(b.id));
      body.appendChild(h('div', { class: 'cardgrid scroll', style: { maxHeight: '380px', paddingTop: '6px' } }, sorted.map((c) => UI.card(c))));
    };
    draw();
    UI.modal(body, { w: 820 });
  };

  // generic card picker across party (for remove / upgrade)
  UI.pickCard = (run, mode, onDone, opts) => {
    opts = opts || {};
    let idx = 0;
    const body = h('div');
    const draw = () => {
      body.innerHTML = '';
      const hh = run.heroes[idx];
      body.appendChild(h('div', { class: 'row', style: { marginBottom: '6px', flexWrap: 'wrap' } },
        h('span', { class: 'ttl', style: { fontSize: '16px' } }, mode === 'remove' ? 'カードを削除' : 'カードを強化'),
        run.heroes.map((x, i) => UI.btn(G.HEROES[x.id].n, () => { idx = i; draw(); }, i === idx ? 'sel sm' : 'sm')),
        h('span', { class: 'grow' }),
        opts.cancel !== false ? UI.btn(opts.cancelLabel || 'やめる', () => { UI.closeModal(); onDone(null); }, 'sm') : null));
      body.appendChild(h('div', { class: 'sub', style: { marginBottom: '4px' } }, mode === 'upgrade' ? 'カードにカーソルを合わせると強化後の効果を確認できます。' : 'デッキから取り除くカードを選んでください。'));
      const list = hh.deck.map((c, i) => ({ c, i })).filter((o) => mode !== 'upgrade' || E.canUpgrade(o.c));
      body.appendChild(h('div', { class: 'cardgrid scroll', style: { maxHeight: '370px', paddingTop: '6px' } },
        list.length ? list.map((o) => UI.card(o.c, { preview: mode === 'upgrade', onclick: () => {
          G.A.sfx('card');
          UI.closeModal();
          if (mode === 'remove') hh.deck.splice(o.i, 1);
          else o.c.up = true;
          onDone({ hero: hh.id, card: o.c });
        } })) : h('div', { class: 'sub' }, '対象となるカードがありません。')));
    };
    draw();
    UI.modal(body, { w: 820, noClose: true });
  };
  // ---------- gear ----------
  const GEAR_RN = ['', 'コモン', 'アンコモン', 'レア', '専用装備'];
  UI.gearTip = (id) => {
    const g = G.GEAR[id];
    if (!g) return '';
    const who = g.hero ? `<div class="tf">${G.HEROES[g.hero].n}専用</div>` : '';
    return `<div class="tn">${g.n} <span style="color:${G.GEAR_RC[g.r]};font-size:11px">${GEAR_RN[g.r]}</span></div>${g.d}${who}<div class="tf">${g.f}</div>`;
  };
  UI.gearChip = (id, small) => {
    const g = G.GEAR[id];
    if (!g) return null;
    return h('span', { class: 'gearchip r' + g.r + (small ? ' sm' : ''), style: { color: G.GEAR_RC[g.r] }, 'data-tip': UI.gearTip(id) }, g.n[0]);
  };
  UI.gearPanel = (id, onclick, extra) => {
    const g = G.GEAR[id];
    return h('div', { class: 'panel gearpanel', style: { cursor: onclick ? 'pointer' : 'default' }, onclick: onclick ? () => { G.A.sfx('click'); onclick(); } : null },
      h('div', { class: 'row' }, UI.gearChip(id), h('span', { style: { fontSize: '14px', color: G.GEAR_RC[g.r] } }, g.n)),
      h('div', { style: { fontSize: '12px', marginTop: '4px' } }, g.d),
      g.hero ? h('div', { class: 'sub', style: { color: '#ffd93d' } }, `${G.HEROES[g.hero].n}専用`) : null,
      h('div', { class: 'sub', style: { marginTop: '2px' } }, g.f),
      extra || null);
  };
  // equip / unequip gear for the current run
  UI.gearView = (run, onClose) => {
    run.bag = run.bag || [];
    const body = h('div');
    const draw = () => {
      body.innerHTML = '';
      body.appendChild(h('div', { class: 'row', style: { marginBottom: '8px' } },
        h('span', { class: 'ttl', style: { fontSize: '17px' } }, '装備'),
        h('span', { class: 'sub' }, '仲間ひとりにつき1つ。任務中はいつでも付け替えられます。'),
        h('span', { class: 'grow' }), UI.btn('閉じる', () => { UI.closeModal(); if (onClose) onClose(); }, 'sm')));
      body.appendChild(h('div', { class: 'gearslots' }, run.heroes.map((hh, i) => {
        const d = G.HEROES[hh.id];
        const g = hh.gear && G.GEAR[hh.gear];
        return h('div', { class: 'panel gearslot' },
          h('div', { class: 'row' }, G.sprImg(hh.id, 2), h('div', { class: 'col', style: { gap: '0' } }, h('span', { style: { fontSize: '13px', color: d.col } }, d.n), h('span', { class: 'hptext' }, `HP ${hh.hp}/${hh.maxHp}`))),
          g ? h('div', { class: 'col', style: { gap: '3px', marginTop: '4px' } },
            h('div', { class: 'row' }, UI.gearChip(g.id), h('span', { style: { color: G.GEAR_RC[g.r], fontSize: '13px' } }, g.n)),
            h('div', { style: { fontSize: '11.5px' } }, g.d),
            UI.btn('外す', () => { G.unequipGear(run, i); G.saveRun(); draw(); }, 'sm'))
            : h('div', { class: 'sub', style: { marginTop: '8px' } }, '（なし）'));
      })));
      body.appendChild(h('div', { class: 'sub', style: { margin: '10px 0 4px' } }, `持ち物（${run.bag.length}）— 装備させる仲間を選んでください`));
      body.appendChild(h('div', { class: 'gearbag scroll' }, run.bag.length ? run.bag.map((id) => UI.gearPanel(id, null,
        h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '4px', marginTop: '6px' } }, run.heroes.map((hh, i) => G.canEquip(hh.id, id)
          ? UI.btn(`→${G.HEROES[hh.id].n}`, () => { G.equipGear(run, i, id); G.A.sfx('buff'); G.saveRun(); draw(); }, 'sm') : null))))
        : h('div', { class: 'sub' }, '持ち物は空です。エリートや宝箱、闇市で手に入ります。')));
    };
    draw();
    UI.modal(body, { w: 860, noClose: true });
  };

  // ---------- bond talk scene ----------
  UI.heartRow = (lv) => h('span', { class: 'hearts', 'data-tip': `<div class="tn">絆 Lv${lv}</div>セーフハウスで「語らう」と深まる。<div class="tf">Lv1：${G.BOND_REWARD[1]}<br>Lv2：${G.BOND_REWARD[2]}<br>Lv3：${G.BOND_REWARD[3]}</div>` }, '♥'.repeat(lv) + '♡'.repeat(3 - lv));
  const speakerName = (sp) => (sp === 'mother' ? 'マザー' : sp === 'sora' ? 'ソラ' : sp === 'narr' ? '' : G.HEROES[sp] ? G.HEROES[sp].n : sp);
  // plays one episode; onDone() after the last line
  UI.talkScene = (heroId, epIdx, onDone, opts) => {
    opts = opts || {};
    const ep = G.BONDS[heroId][epIdx];
    let i = 0;
    const portrait = h('div', { class: 'talkport' });
    const name = h('div', { class: 'talkname' });
    const txt = h('div', { class: 'talktext' });
    const more = h('div', { class: 'more' }, '▼');
    const box = h('div', { class: 'talkbox' }, portrait, h('div', { class: 'col grow', style: { gap: '4px' } }, name, txt), more);
    const head = h('div', { class: 'row', style: { marginBottom: '8px' } },
      h('span', { class: 'ttl', style: { fontSize: '16px', color: G.HEROES[heroId].col } }, `${G.HEROES[heroId].n}　絆 ${epIdx + 1}「${ep.t}」`),
      h('span', { class: 'grow' }),
      opts.replay ? UI.btn('閉じる', () => { UI.closeModal(); if (onDone) onDone(); }, 'sm') : null);
    let tw = null;
    const show = () => {
      const [sp, t] = ep.lines[i];
      portrait.innerHTML = '';
      if (sp === 'sora') portrait.appendChild(G.sprImg('i_data', 6));
      else if (sp !== 'narr') portrait.appendChild(G.sprImg(sp === 'mother' ? 'mother' : sp, sp === 'mother' ? 2 : 4));
      name.textContent = speakerName(sp);
      name.style.color = sp === 'mother' || sp === 'sora' ? '#2ee6ff' : G.HEROES[sp] ? G.HEROES[sp].col : '#a99fc9';
      txt.classList.toggle('narr', sp === 'narr');
      tw = UI.typewrite(txt, t, 50);
    };
    const panel = UI.modal(h('div', null, head, box), { w: 700, noClose: true });
    box.addEventListener('click', () => {
      if (tw && !tw.done) { tw.finish(); return; }
      G.A.sfx('click');
      i++;
      if (i >= ep.lines.length) { UI.closeModal(); if (onDone) onDone(); return; }
      show();
    });
    show();
    return panel;
  };
})();
