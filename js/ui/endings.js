// Endings (and the fall into the fourth area) told over animated pixel-art scenes, like the opening.
(function () {
  const G = globalThis.G;
  const h = G.h;
  const UI = G.UI;
  const A = G.A;
  const { W, H, GROUND } = UI.SCENE;
  const hash = UI.sceneHash;
  const kit = UI.sceneKit;

  // an area background captured once, to paint scenes on top of
  const bgCache = {};
  const areaBg = (kind, area) => {
    if (!bgCache[kind]) { const d = h('div'); UI.bg(d, kind, area ? { area } : null); bgCache[kind] = d.querySelector('canvas'); }
    return bgCache[kind];
  };
  const crewIds = () => {
    const party = (G.run && G.run.heroes || []).map((x) => x.id);
    const rest = G.HERO_ORDER.filter((id) => G.meta.unlocked.includes(id) && !party.includes(id));
    return { party, rest };
  };

  const S = {
    // ---------------- the sanctum ----------------
    hall(x, f) {
      const { r, grad, glow } = kit(x);
      grad('#ffffff', '#d8d0f0', 0, GROUND);
      for (let i = 0; i < 7; i++) { const px = 20 + i * 76; r(px, 0, 18, GROUND, '#f4f2fc'); r(px + 14, 0, 4, GROUND, '#dcd6ee'); r(px - 4, GROUND - 8, 26, 8, '#e8e4f6'); }
      r(0, GROUND, W, H, '#ece8f8'); r(0, GROUND, W, 1, '#c8c0e0');
      glow(240, 70, 150, 'rgba(255,250,230,0.8)');
      // motes of light rising: what is left of Sophia
      for (let i = 0; i < 40; i++) { const k = (f * (0.6 + hash(i) * 0.8) + i * 9) % 170; r(180 + hash(i + 3) * 120 + Math.sin(k * 0.07 + i) * 8, GROUND - k, 2, 2, `rgba(255,217,61,${1 - k / 170})`); }
    },
    crack(x, f) {
      const { r, grad, glow } = kit(x);
      grad('#f8f6ff', '#d8d0f0', 0, GROUND);
      // a crack runs across the white ceiling, and something blue shows through
      const len = Math.min(1, f / 40);
      const pts = [[60, 20], [130, 34], [176, 26], [222, 52], [262, 40], [306, 70], [352, 58], [420, 84]];
      const n = Math.max(2, Math.ceil(pts.length * len));
      x.fillStyle = '#5ab0ff';
      x.beginPath(); x.moveTo(pts[0][0], pts[0][1] - 2);
      for (let i = 1; i < n; i++) x.lineTo(pts[i][0], pts[i][1] - 3 - (i % 2) * 4 * len);
      for (let i = n - 1; i >= 0; i--) x.lineTo(pts[i][0], pts[i][1] + 3 + (i % 2) * 4 * len);
      x.closePath(); x.fill();
      x.strokeStyle = '#4a4266'; x.lineWidth = 1; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) x.lineTo(pts[i][0], pts[i][1]); x.stroke();
      glow(240, 50, 140 * len, 'rgba(120,190,255,0.35)');
      for (let i = 0; i < 16; i++) { const k = (f * 0.6 + i * 13) % 120; r(80 + hash(i) * 320, 40 + k, 1, 2, 'rgba(255,255,255,0.8)'); }
      r(0, GROUND, W, H, '#ece8f8');
    },
    // ——the sky.
    sky(x, f) {
      const { r, grad, glow } = kit(x);
      grad('#2f7fe0', '#bfe4ff', 0, GROUND + 20);
      glow(360, 50, 110, 'rgba(255,250,220,0.9)');
      x.fillStyle = '#fffbe0'; x.beginPath(); x.arc(360, 50, 18, 0, Math.PI * 2); x.fill();
      const cloud = (X, Y, s) => { r(X, Y, 40 * s, 10 * s, '#ffffff'); r(X + 8 * s, Y - 6 * s, 20 * s, 8 * s, '#ffffff'); r(X + 24 * s, Y - 3 * s, 12 * s, 6 * s, '#ffffff'); r(X, Y + 8 * s, 40 * s, 2 * s, '#dcecff'); };
      for (let i = 0; i < 6; i++) cloud(((f * (0.3 + i * 0.08) + i * 110) % (W + 120)) - 80, 30 + i * 22, i % 2 ? 1 : 1.5);
      // birds
      for (let i = 0; i < 5; i++) { const bx = ((f * 1.4 + i * 70) % (W + 60)) - 30, by = 70 + Math.sin(f * 0.1 + i) * 8 + i * 6, w = Math.floor(f / 3 + i) % 2; r(bx, by, 3, 1, '#2a3a5a'); r(bx + 4, by, 3, 1, '#2a3a5a'); r(bx + 3, by + (w ? 1 : -1), 1, 1, '#2a3a5a'); }
      r(0, GROUND + 4, W, H, '#7a9ac8');
    },
    bunker(x, f) { UI.introScenes.bunker(x, f); },
    // the fight goes on, but the sky is still there: the crew on a rooftop at dusk
    rooftop(x, f) {
      const { r, grad, glow, person, robot } = kit(x);
      grad('#4a4466', '#ff9a8a', 0, 130); grad('#ff9a8a', '#3a2a4a', 130, GROUND);
      // one patch of real blue in the grey
      x.fillStyle = '#5ab0ff'; x.beginPath(); x.ellipse(250, 40, 70, 22, 0, 0, Math.PI * 2); x.fill();
      glow(250, 40, 90, 'rgba(160,210,255,0.4)');
      for (let i = 0; i < 24; i++) { const bw = 14 + hash(i) * 20, bh = 20 + hash(i + 9) * 50; r(i * 21 - 6, GROUND - 26 - bh, bw, bh + 26, '#2a2040'); for (let k = 0; k < 3; k++) if (hash(i * 7 + k) < 0.5) r(i * 21 + 4 + k * 4, GROUND - 20 - bh * hash(k + i), 2, 2, '#ffd93d'); }
      r(60, GROUND - 26, 360, 26, '#1b1630'); r(60, GROUND - 26, 360, 2, '#4b4b5c');
      const { party } = crewIds();
      const sil = '#120e20';
      for (let i = 0; i < 4; i++) {
        const X = 150 + i * 46;
        if (['pixe', 'goura', 'crow', 'mike', 'octo', 'pyon', 'jin', 'nono', 'echo', 'nul'].includes(party[i])) robot(X, GROUND - 26, { col: sil, eye: '#2ee6ff', u: 3 });
        else person(X, GROUND - 26, { body: sil, hair: sil, skin: sil, back: true, u: 3 });
      }
    },
    endcard(x, f, text) {
      const { r, grad, glow } = kit(x);
      grad('#05040a', '#141028');
      for (let i = 0; i < 80; i++) if ((f + i * 5) % 50 < 40) r(hash(i + 1) * W, hash(i + 50) * GROUND, 1, 1, i % 5 ? '#6b5f8a' : '#ffd93d');
      glow(240, 84, 120, 'rgba(255,61,139,0.25)');
      x.font = 'bold 30px "DotGothic16", monospace'; x.textAlign = 'center';
      x.fillStyle = '#ff3d8b'; x.fillText(text, 242, 98);
      x.fillStyle = '#ffffff'; x.fillText(text, 240, 96);
      x.font = '10px monospace'; x.fillStyle = '#2ee6ff'; x.fillText('NEON CRADLE', 240, 120);
      x.textAlign = 'start';
    },

    // ---------------- the rim (survey ending) ----------------
    rimGate(x, f) {
      x.drawImage(areaBg('rim', G.AREAS.rim), 0, 0, W, H);
      const { r } = kit(x);
      r(0, 0, W, H, 'rgba(255,240,220,0.12)');
      for (let i = 0; i < 20; i++) { const k = (f * 0.7 + i * 13) % GROUND; r(170 + hash(i) * 140, GROUND - k, 1, 2, 'rgba(255,255,255,0.8)'); }
    },
    tower(x, f) {
      x.drawImage(areaBg('rim', G.AREAS.rim), 0, 0, W, H);
      const { r, glow } = kit(x);
      r(0, 0, W, H, 'rgba(40,20,60,0.25)');
      // the gate opens a crack, and far away the white tower rises
      glow(240, 60, 120, 'rgba(255,255,255,0.6)');
      r(232, 20, 16, 120, '#ffffff'); r(244, 20, 4, 120, '#dcd6ee'); r(228, 14, 24, 8, '#ffffff');
      x.strokeStyle = 'rgba(255,217,61,0.8)'; x.lineWidth = 2; x.beginPath(); x.ellipse(240, 8, 22, 4, 0, 0, Math.PI * 2); x.stroke();
      const open = Math.min(60, f * 1.5);
      r(0, 0, 240 - open, GROUND, 'rgba(30,20,40,0.6)'); r(240 + open, 0, 240 - open, GROUND, 'rgba(30,20,40,0.6)');
    },
    pilgrims(x, f) {
      x.drawImage(areaBg('rim', G.AREAS.rim), 0, 0, W, H);
      const { r, person } = kit(x);
      r(0, 0, W, H, 'rgba(255,230,200,0.12)');
      for (let i = 0; i < 12; i++) {
        const X = ((W + 40) - ((f * 0.5 + i * 44) % (W + 80))) - 20;
        person(X, GROUND - 2 - (i % 2), { body: '#ffffff', hair: '#e8e4f6', skin: '#f6d6c0', mask: false, back: true, u: 2 });
      }
    },

    // ---------------- the bottom of the cradle (true ending) ----------------
    deep(x, f) {
      const { r, grad, glow } = kit(x);
      grad('#2a0a2a', '#5a1a4a', 0, GROUND);
      for (let k = 0; k < 4; k++) { x.strokeStyle = `rgba(255,138,216,${0.35 - k * 0.07})`; x.lineWidth = 2; x.beginPath(); x.ellipse(240, 90, 90 + k * 40 + Math.sin(f * 0.04 + k) * 5, 20 + k * 8, 0, 0, Math.PI * 2); x.stroke(); }
      glow(240, 100, 130 + Math.sin(f * 0.08) * 10, 'rgba(255,200,240,0.4)');
      for (let i = 0; i < 30; i++) { const k = (f * 0.4 + i * 11) % GROUND; r(hash(i) * W, GROUND - k, 2, 2, i % 2 ? 'rgba(255,138,216,0.7)' : 'rgba(158,242,255,0.7)'); }
      r(0, GROUND, W, H, '#1a0a1a');
    },
    twoLights(x, f) {
      const { r, grad, glow, heart } = kit(x);
      grad('#0b0614', '#2a0a2a', 0, GROUND);
      const d = Math.max(0, 110 - f * 1.6), a = f * 0.07;
      const p1 = [240 + Math.cos(a) * d, 84 + Math.sin(a) * d * 0.4], p2 = [240 - Math.cos(a) * d, 84 - Math.sin(a) * d * 0.4];
      if (d > 0) {
        glow(p1[0], p1[1], 40, 'rgba(46,230,255,0.7)'); glow(p2[0], p2[1], 40, 'rgba(255,90,209,0.7)');
        r(p1[0] - 4, p1[1] - 4, 8, 8, '#e8fdff'); r(p2[0] - 4, p2[1] - 4, 8, 8, '#ffe6f6');
      } else {
        glow(240, 84, 90 + Math.sin(f * 0.2) * 8, 'rgba(255,255,255,0.8)');
        heart(229, 74, '#ffffff', 3);
      }
      r(0, GROUND, W, H, '#100818');
    },
    pods(x, f) {
      const { r, grad, glow } = kit(x);
      grad('#120a1c', '#2a1430', 0, GROUND);
      // rows of sleeping capsules; their lights come on, one after another
      for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) {
        const X = 22 + i * 50 + row * 25, Y = 40 + row * 60, idx = row * 9 + i, on = f / 3 > idx;
        r(X, Y, 34, 48, '#0b0a12'); r(X + 2, Y + 2, 30, 44, on ? '#9ef2ff' : '#2a3a4a');
        r(X + 11, Y + 10, 12, 10, on ? '#f6d6c0' : '#5a5868'); r(X + 9, Y + 20, 16, 20, on ? '#ffffff' : '#4a4a5a');
        if (on) { glow(X + 17, Y + 24, 30, 'rgba(158,242,255,0.25)'); if (hash(idx + Math.floor(f / 8)) < 0.15) r(X + 13, Y + 14, 2, 1, '#2a2238'); }
        r(X + 4, Y + 44, 26, 2, on ? '#2ee6ff' : '#3b3154');
      }
      r(0, GROUND, W, H, '#0b0712');
    },
    awaken(x, f) {
      const { r, grad, glow, person } = kit(x);
      grad('#1a1030', '#3a2050', 0, GROUND);
      glow(160, 120, 100, 'rgba(158,242,255,0.35)');
      // an open capsule, and the girl who woke up in it
      r(118, 70, 84, 100, '#0b0a12'); r(122, 74, 76, 92, '#5a6a8a'); r(122, 74, 76, 6, '#9ef2ff');
      r(110, 54, 40, 20, 'rgba(158,242,255,0.5)');
      person(148, GROUND - 4 - (Math.floor(f / 10) % 2), { body: '#ffffff', hair: '#c48a52', u: 4 });
      r(0, GROUND - 4, W, H, '#140c20');
    },
    colors(x, f) {
      const { r, grad, person, robot } = kit(x);
      // colour flows back into a grey city, from the left
      const sweep = Math.min(W + 40, f * 4);
      for (let i = 0; i < 24; i++) {
        const bw = 16 + hash(i) * 18, bh = 30 + hash(i + 7) * 60, bx = i * 20 - 6, lit = bx < sweep;
        r(bx, GROUND - bh, bw, bh, lit ? ['#5a3a7a', '#3466d6', '#c0392b', '#3a9e4a', '#ff8a2b'][i % 5] : '#6a6a78');
        for (let wy = GROUND - bh + 4; wy < GROUND - 4; wy += 7) for (let wx = bx + 3; wx < bx + bw - 3; wx += 5) if (hash(wx * 5 + wy) < 0.5) r(wx, wy, 2, 3, lit ? '#ffd93d' : '#8a8a96');
      }
      x.globalCompositeOperation = 'destination-over';
      grad('#ffb36b', '#ff86a8', 0, GROUND);
      x.globalCompositeOperation = 'source-over';
      r(sweep, 0, W, GROUND, 'rgba(120,120,135,0.55)');
      r(0, GROUND, W, H, '#3a2a5a');
      if (sweep > 100) { person(80, GROUND, { body: '#ff9ec4', hair: '#4a3022', u: 2 }); robot(96, GROUND, { col: '#ffd93d', eye: '#2ee6ff', u: 2 }); }
      if (sweep > 300) { person(300, GROUND, { body: '#3466d6', hair: '#2a2238', u: 2 }); person(316, GROUND, { body: '#e8352e', hair: '#e8b090', u: 2 }); }
    },
    // everyone, under the open sky
    everyone(x, f) {
      S.sky(x, f);
      const { r } = kit(x);
      r(0, GROUND - 30, W, H, '#7ac87a'); r(0, GROUND - 30, W, 2, '#a8e8a0');
      for (let i = 0; i < 40; i++) r(hash(i) * W, GROUND - 26 + hash(i + 5) * 20, 2, 2, ['#ffd93d', '#ff9ec4', '#ffffff'][i % 3]);
      const { party, rest } = crewIds();
      const back = rest.slice(0, 13), front = party.slice(0, 4);
      x.imageSmoothingEnabled = false;
      const drawRow = (ids, y, gap) => {
        const total = ids.length * gap;
        ids.forEach((id, i) => {
          const cv = G.sprCanvas(id, i % 2 === 1, true);
          if (!cv) return;
          const bob = Math.floor(f / 5 + i) % 4 === 0 ? 1 : 0;
          x.drawImage(cv, Math.round(240 - total / 2 + i * gap + (gap - cv.width) / 2), y - cv.height - bob);
        });
      };
      drawRow(back, GROUND - 22, 34);
      drawRow(front, GROUND - 2, 44);
    },

    // ---------------- falling into the fourth area ----------------
    floorCrack(x, f) {
      S.hall(x, f);
      const { r, glow } = kit(x);
      const len = Math.min(1, f / 30);
      x.strokeStyle = '#ff3d8b'; x.lineWidth = 2; x.beginPath(); x.moveTo(240 - 200 * len, GROUND + 2);
      for (let i = 0; i <= 10; i++) x.lineTo(240 - 200 * len + i * 40 * len, GROUND + 2 + (i % 2 ? 3 : -2));
      x.stroke();
      glow(240, GROUND, 120 * len, 'rgba(255,61,139,0.35)');
      r(0, 0, 0, 0, '#000');
    },
    noise(x, f) {
      const { r } = kit(x);
      r(0, 0, W, H, '#0b0a12');
      for (let i = 0; i < 26; i++) { const y = (hash(i + Math.floor(f / 2) * 3) * GROUND) | 0; r(0, y, W, 1 + (i % 3), `rgba(${i % 2 ? '46,230,255' : '255,90,209'},${0.08 + hash(i) * 0.2})`); }
      for (let i = 0; i < 300; i++) r(hash(i * 3 + f) * W, hash(i * 7 + f) * GROUND, 1, 1, 'rgba(255,255,255,0.15)');
    },
    descend(x, f) {
      const { r, grad, glow } = kit(x);
      grad('#05040a', '#3a0a2a', 0, GROUND);
      // a shaft going down forever, a pink light at the bottom
      for (let k = 0; k < 9; k++) { const s = 1 - k / 10, w = 400 * s, hh = 150 * s; x.strokeStyle = `rgba(255,138,216,${0.08 + k * 0.05})`; x.lineWidth = 1; x.strokeRect(240 - w / 2, 90 - hh / 2, w, hh); }
      glow(240, 90, 60 + Math.sin(f * 0.1) * 6, 'rgba(255,90,209,0.6)');
      for (let i = 0; i < 30; i++) { const k = ((f * 0.02 + hash(i)) % 1); const a = hash(i + 4) * Math.PI * 2; r(240 + Math.cos(a) * 220 * (1 - k), 90 + Math.sin(a) * 90 * (1 - k), 2, 2, 'rgba(255,255,255,0.7)'); }
    },
  };
  const card = (text) => (x, f) => S.endcard(x, f, text);
  S.card1 = card('第一部　完');
  S.cardSurvey = card('調査完了');
  S.cardTrue = card('真・完');
  UI.endingScenes = S;

  // which scene, picture and speaker go with each line
  const PLAN = {
    part1: {
      lines: () => G.ENDING, bgm: 'sanctum',
      scene: ['hall', 'hall', 'hall', 'crack', 'sky', 'bunker', 'rooftop', 'card1'],
      art: [{ id: 'sophia', cls: 'fading' }, { id: 'sophia', cls: 'fading' }, null, null, null, { id: 'mother', sc: 7 }, null, null],
      who: [null, 'SI《ソフィア》', null, null, null, 'マザー', null, null],
    },
    survey: {
      lines: () => G.SURVEY_ENDING, bgm: 'rim',
      scene: ['rimGate', 'rimGate', 'tower', 'pilgrims', 'bunker', 'cardSurvey'],
      art: [{ id: 'janus', cls: 'fading' }, { id: 'janus', cls: 'fading' }, null, null, { id: 'mother', sc: 7 }, null],
      who: [null, '門番《ヤヌス》', null, null, 'マザー', null],
    },
    truth: {
      lines: () => G.TRUE_ENDING, bgm: 'cradle',
      scene: ['deep', 'deep', 'twoLights', 'pods', 'awaken', 'colors', 'everyone', 'cardTrue'],
      art: [{ id: 'noah', cls: 'soft' }, { id: 'noah', cls: 'soft' }, null, null, { id: 'pixe', sc: 4, cls: 'right' }, null, null, null],
      who: [null, '《ノア》', 'マザー', null, null, null, 'マザー', null],
    },
    fall: {
      lines: () => G.ACT3_TO_4, bgm: 'sanctum',
      scene: ['floorCrack', 'floorCrack', 'noise', 'descend'],
      art: [null, { id: 'sophia', cls: 'ghost' }, { id: 'mother', sc: 7, cls: 'glitchy' }, { id: 'mother', sc: 7, cls: 'ghost' }],
      who: [null, 'SI《ソフィア》', 'マザー', 'マザー'],
    },
  };

  const play = (kind, onEnd) => {
    const p = PLAN[kind];
    const m = G.meta;
    m.seenEnd = m.seenEnd || {};
    const seen = !!m.seenEnd[kind];
    A.bgm(p.bgm);
    UI.playScenes({
      cls: 'ending', lines: p.lines(), scenes: S, cps: 30,
      scene: (i) => p.scene[i] || p.scene[p.scene.length - 1],
      art: (i) => p.art[i] || null,
      who: (i) => p.who[i] || null,
      skip: seen,
      onEnd: () => { m.seenEnd[kind] = true; G.saveMeta(); onEnd(); },
    });
  };

  UI.ending = (kind) => {
    kind = PLAN[kind] ? kind : 'part1';
    let done = false;
    play(kind, () => { if (done) return; done = true; UI.runEnd('win'); });
  };
  UI.fallScene = (onEnd) => play('fall', onEnd);
})();
