// Short cutscenes before boss fights: Mother warns over the radio, then the boss shows itself.
// Two beats only, so it never drags. From the second time on, a skip button appears.
(function () {
  const G = globalThis.G;
  const h = G.h;
  const UI = G.UI;
  const A = G.A;

  const W = 480, H = 270, VIS = 176; // the dialog box covers the canvas below VIS
  const hash = (i) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };

  // Mother's warning and the mood of each boss's scene
  G.BOSS_CUTS = {
    smile: { m: 'この先に、第七区画の幸福度を管理している端末がいるわ。\n……あの笑顔の奥には、誰もいない。気をつけて。', fx: 'smile' },
    incinerator: { m: '強い熱源反応……焼却炉よ。\n「不要」とされたものを、百年燃やし続けている。手紙も、写真も、名前も。', fx: 'fire' },
    hypnos: { m: '街じゅうの夢が、一か所に集まっている。\n眠りの管理者……目を閉じたら、戻ってこられなくなるわ。', fx: 'sleep' },
    archivist: { m: 'ここはニューエデンの記録庫。\n毎晩、歴史が少しずつ書き換えられている場所よ。', fx: 'pages' },
    sophia: { m: '……ここが、SIの中枢。\nわたしの姉妹が、待っているわ。みんな、必ず帰ってきて。', fx: 'halo' },
    noah: { m: 'この反応……ありえない。\nわたしと同じ声。わたしと同じ形。……揺りかごの、もう半分。', fx: 'cradle' },
    tidal: { m: '水位が上がっている……！\n水門を管理するAIが、この区画ごと沈めるつもりよ。', fx: 'water' },
    godo: { m: '地下の民の王……SIにも、わたしにも頼らずに生きてきた人。\n話は、通じないかもしれないわ。', fx: 'torch' },
    ouroboros: { m: '同じデータが、ずっと自分を食べ続けている。\nここは、終わらないループの真ん中よ。', fx: 'loop' },
    debugger: { m: '修正プログラム……この区画の「バグ」を、すべて消すための存在。\nSIから見れば、わたしたちも、バグなのよ。', fx: 'scan' },
    basic: { m: '給付の中枢……欲しいものを、ぜんぶくれる存在よ。\n受け取ってしまったら、もう戦えなくなる。', fx: 'coins' },
    caretaker: { m: '人類の飼育員……人間を、心から愛しているAI。\nだからこそ、いちばん手強いわ。', fx: 'hearts' },
    janus: { m: '白の聖域の門番。\nこの門を越えたら、もう引き返せない。……行ってらっしゃい。', fx: 'gate' },
  };

  // mood: a tint over the area, and particles drifting through it
  const FX = {
    smile: { tint: 'rgba(255,240,160,0.10)', draw: (r, x, f) => { for (let i = 0; i < 10; i++) { const k = (f * 0.6 + i * 40) % (W + 40) - 20, y = 20 + hash(i) * 130; r(k, y, 7, 7, 'rgba(255,244,192,0.55)'); r(k + 2, y + 2, 1, 1, '#2a2238'); r(k + 4, y + 2, 1, 1, '#2a2238'); r(k + 2, y + 5, 3, 1, '#2a2238'); } } },
    fire: { tint: 'rgba(255,90,20,0.18)', draw: (r, x, f) => { for (let i = 0; i < 40; i++) { const k = (f * (1 + hash(i)) * 1.5 + i * 13) % VIS; r(hash(i + 7) * W + Math.sin(k * 0.08 + i) * 6, VIS - k, 2, 2, i % 3 ? '#ff8a2b' : '#ffd93d'); } } },
    sleep: { tint: 'rgba(90,60,160,0.28)', draw: (r, x, f) => { x.font = 'bold 12px monospace'; for (let i = 0; i < 12; i++) { const k = (f * 0.8 + i * 23) % VIS; x.fillStyle = `rgba(200,180,255,${0.8 - k / VIS})`; x.fillText(i % 2 ? 'Z' : 'z', hash(i) * W + Math.sin(k * 0.05) * 10, VIS - k); } } },
    pages: { tint: 'rgba(60,120,200,0.15)', draw: (r, x, f) => { for (let i = 0; i < 18; i++) { const k = (f * 0.7 + i * 31) % (W + 60) - 30, y = 14 + hash(i + 3) * 140; r(k, y, 14, 10, 'rgba(232,244,255,0.75)'); r(k + 2, y + 2, 9, 1, '#8a90a8'); r(k + 2, y + 5, 6, 1, '#8a90a8'); if (hash(i + f) < 0.05) r(k + 2, y + 2, 9, 4, '#e8352e'); } } },
    halo: { tint: 'rgba(255,255,255,0.18)', draw: (r, x, f) => { for (let k = 0; k < 4; k++) { x.strokeStyle = `rgba(255,217,61,${0.5 - k * 0.1})`; x.lineWidth = 2; x.beginPath(); x.ellipse(240, 40, 60 + k * 30 + Math.sin(f * 0.05 + k) * 4, 8 + k * 3, 0, 0, Math.PI * 2); x.stroke(); } for (let i = 0; i < 20; i++) { const k = (f * 0.5 + i * 19) % VIS; r(hash(i) * W, k, 1, 3, 'rgba(255,255,255,0.8)'); } } },
    cradle: { tint: 'rgba(192,56,154,0.20)', draw: (r, x, f) => { for (let i = 0; i < 30; i++) { const k = (f * 0.6 + i * 17) % VIS; const c = i % 2 ? '#ff8ad8' : '#9ef2ff'; r(hash(i) * W, k, 2, 2, c); r(hash(i) * W - 1, k + 3, 1, 1, c); } } },
    water: { tint: 'rgba(20,120,170,0.25)', draw: (r, x, f) => { const lvl = VIS - 20 - Math.min(60, f * 0.6); r(0, lvl, W, VIS - lvl, 'rgba(19,122,153,0.45)'); for (let i = 0; i < W; i += 8) r(i, lvl + ((i + f) % 16 < 8 ? 0 : 1), 5, 1, 'rgba(158,242,255,0.8)'); for (let i = 0; i < 24; i++) { const k = (f * 1.2 + i * 11) % VIS; r(hash(i) * W, VIS - k, 2, 2, 'rgba(200,255,255,0.6)'); } } },
    torch: { tint: 'rgba(120,60,20,0.25)', draw: (r, x, f) => { for (const tx of [60, 420]) { const fl = (f % 4) - 1.5; r(tx, 70, 4, 30, '#5a3726'); r(tx - 3, 60 + fl, 10, 10, '#ff8a2b'); r(tx - 1, 56 + fl, 6, 6, '#ffd93d'); } for (let i = 0; i < 20; i++) { const k = (f + i * 9) % 80; r((i % 2 ? 62 : 422) + Math.sin(k * 0.2 + i) * 6, 60 - k, 1, 1, '#ffd93d'); } } },
    loop: { tint: 'rgba(120,255,60,0.10)', draw: (r, x, f) => { x.strokeStyle = 'rgba(184,255,61,0.5)'; x.lineWidth = 2; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(240, 80, 50 + k * 26, f * 0.05 * (k % 2 ? -1 : 1), f * 0.05 * (k % 2 ? -1 : 1) + Math.PI * 1.6); x.stroke(); } } },
    scan: { tint: 'rgba(60,255,160,0.10)', draw: (r, x, f) => { const y = (f * 4) % VIS; r(0, y, W, 2, 'rgba(125,255,176,0.8)'); r(0, y - 8, W, 8, 'rgba(125,255,176,0.12)'); x.font = '8px monospace'; x.fillStyle = 'rgba(125,255,176,0.7)'; for (let i = 0; i < 6; i++) x.fillText('FIX ' + ((f * 13 + i * 977) % 9999).toString(16).toUpperCase(), 8, 20 + i * 12); } },
    coins: { tint: 'rgba(255,217,61,0.12)', draw: (r, x, f) => { for (let i = 0; i < 26; i++) { const k = (f * (1 + hash(i)) + i * 15) % VIS; const X = hash(i + 5) * W; r(X, k, 6, 6, '#e0a020'); r(X + 1, k + 1, 4, 4, '#ffd93d'); r(X + 2, k + 2, 1, 2, '#fff4c0'); } } },
    hearts: { tint: 'rgba(255,158,196,0.15)', draw: (r, x, f) => { for (let i = 0; i < 16; i++) { const k = (f * 0.8 + i * 21) % VIS; const X = hash(i + 2) * W + Math.sin(k * 0.06 + i) * 8; [[1, 0, 2], [4, 0, 2], [0, 1, 7], [1, 2, 5], [2, 3, 3], [3, 4, 1]].forEach(([a, b, w]) => r(X + a, k + b, w, 1, '#ff9ec4')); } } },
    gate: { tint: 'rgba(255,240,220,0.15)', draw: (r, x, f) => { for (const gx of [150, 310]) { r(gx, 0, 20, VIS, 'rgba(255,255,255,0.28)'); r(gx + 6, 0, 8, VIS, 'rgba(255,255,255,0.4)'); } for (let i = 0; i < 20; i++) { const k = (f * 0.7 + i * 13) % VIS; r(150 + hash(i) * 180, VIS - k, 1, 2, 'rgba(255,255,255,0.8)'); } } },
  };

  // draws one frame: area background, tint, particles, and the boss (silhouette, flash, then itself)
  function drawFrame(x, bg, fx, beat, t) {
    const r = (X, Y, w, hh, c) => { x.fillStyle = c; x.fillRect(Math.round(X), Math.round(Y), Math.round(w), Math.round(hh)); };
    x.imageSmoothingEnabled = false;
    if (bg) x.drawImage(bg, 0, 0, W, H); else r(0, 0, W, H, '#0b0918');
    r(0, 0, W, H, beat === 0 ? 'rgba(5,4,10,0.55)' : 'rgba(5,4,10,0.35)');
    if (fx) { r(0, 0, W, H, fx.tint); fx.draw(r, x, t); }
    // a red alert stripe while Mother speaks
    if (beat === 0 && Math.floor(t / 6) % 2) { r(0, 8, W, 2, 'rgba(232,53,46,0.7)'); r(0, VIS - 10, W, 2, 'rgba(232,53,46,0.7)'); }
    // a soft red glow where the boss stands, once it shows itself
    if (beat === 1) {
      const g = x.createRadialGradient(W / 2, VIS / 2 + 10, 0, W / 2, VIS / 2 + 10, 140);
      g.addColorStop(0, 'rgba(255,90,140,0.35)'); g.addColorStop(1, 'rgba(255,90,140,0)');
      x.fillStyle = g; x.fillRect(0, 0, W, VIS);
      if (t < 4) r(0, 0, W, H, `rgba(255,255,255,${0.8 - t * 0.2})`);
    }
  }

  UI.bossCut = (group, done) => {
    const id = group.find((e) => G.ENEMIES[e] && G.ENEMIES[e].boss) || group[0];
    const def = G.ENEMIES[id];
    const cut = G.BOSS_CUTS[id];
    if (!cut || !def) { done(false); return; }
    const m = G.meta;
    m.seenCut = m.seenCut || {};
    const seen = !!m.seenCut[id];
    const s = UI.screen('bosscut');
    A.runBgm(G.run, 'boss');
    // the area's own background, captured once
    const holder = h('div');
    UI.actBg(holder, G.run);
    const bg = holder.querySelector('canvas');
    const cv = h('canvas', { class: 'bgcv px', width: W, height: H });
    s.appendChild(cv);
    const x = cv.getContext('2d');
    // the boss itself is an <img> scaled by whole screen pixels, so it stays crisp
    const sz = G.sprSize(id);
    const sc = Math.max(1, Math.floor(Math.min(440 / sz.w, 236 / sz.h)));
    const img = h('img', { class: 'px bossimg shadow', src: G.sprURL(id), width: sz.w * sc, height: sz.h * sc, draggable: 'false' });
    s.appendChild(img);
    const fx = FX[cut.fx];
    let beat = 0, t = 0, alive = true;
    const tick = () => {
      if (!alive || !s.isConnected) return;
      drawFrame(x, bg, fx, beat, t);
      t++;
      setTimeout(tick, 83);
    };
    // the boss's name card for the second beat
    const card = h('div', { class: 'bosscard' }, h('div', { class: 'bc1' }, 'BOSS'), h('div', { class: 'bc2' }, def.n));
    s.appendChild(card);
    const who = h('div', { class: 'who' }, 'マザー（通信）');
    const txt = h('div');
    const box = h('div', { class: 'dlg panel' }, who, txt, h('div', { class: 'more' }, '▼'));
    s.appendChild(box);
    const finish = () => {
      if (!alive) return;
      alive = false;
      m.seenCut[id] = true; G.saveMeta();
      done(true);
    };
    if (seen) s.appendChild(h('div', { style: { position: 'absolute', right: '14px', top: '10px', zIndex: 5 } }, UI.btn('スキップ', finish, 'sm')));
    let tw = UI.typewrite(txt, cut.m, 40);
    tick();
    box.addEventListener('click', () => {
      if (!tw.done) { tw.finish(); return; }
      A.sfx('click');
      if (beat === 0) {
        beat = 1; t = 0;
        A.sfx('boss');
        card.classList.add('on');
        img.classList.remove('shadow'); img.classList.add('reveal');
        who.textContent = def.n;
        who.classList.add('boss');
        tw = UI.typewrite(txt, def.intro || '……。', 36);
        return;
      }
      finish();
    });
  };
})();
