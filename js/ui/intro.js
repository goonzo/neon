// Opening: Mother's narration, with pixel-art scenes behind her that change with the story
(function () {
  const G = globalThis.G;
  const h = G.h;
  const UI = G.UI;
  const A = G.A;

  // the canvas is 480x270 shown at 2x; the dialog box covers everything below y = 176
  const W = 480, H = 270, GROUND = 168;
  const hash = (i) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };

  // which scene goes with each line of G.INTRO, and whether Mother stays on screen
  const SCENE_OF = ['boot', 'bunker', 'past', 'rise', 'erase', 'utopia', 'smile', 'hands', 'shield', 'sky', 'bunker'];
  const MOTHER_ON = { bunker: true, shield: true };

  // ---------------- little drawing helpers ----------------
  function kit(x) {
    const r = (X, Y, w, hh, c) => { x.fillStyle = c; x.fillRect(Math.round(X), Math.round(Y), Math.round(w), Math.round(hh)); };
    const grad = (c1, c2, y0, y1) => { y0 = y0 || 0; y1 = y1 || H; const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, y0, W, y1 - y0); };
    const glow = (cx, cy, rad, col) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2); };
    // a little person (6u x 13u, feet at Y) and a little robot (6u x 9u)
    const person = (X, Y, o) => {
      const u = o.u || 2, p = (a, b, w, hh, c) => r(X + a * u, Y - 13 * u + b * u, w * u, hh * u, c);
      const OL = '#2a2238';
      p(0, 0, 6, 6, OL); p(1, 1, 4, 5, o.skin || '#f6d6c0'); p(1, 0, 4, 2, o.hair); p(0, 1, 1, 3, o.hair); p(5, 1, 1, 3, o.hair);
      if (o.mask) { p(1, 2, 4, 3, '#ffffff'); p(2, 3, 1, 1, OL); p(4, 3, 1, 1, OL); p(2, 4, 3, 1, '#ff5a8a'); }
      else if (!o.back) { p(2, 3, 1, 1, OL); p(4, 3, 1, 1, OL); }
      p(0, 6, 6, 5, OL); p(1, 6, 4, 5, o.body); p(0, 7, 1, 3, o.body);
      p(1, 11, 4, 2, OL); p(1, 11, 1, 2, o.legs || '#2b2a44'); p(4, 11, 1, 2, o.legs || '#2b2a44');
    };
    const robot = (X, Y, o) => {
      const u = o.u || 2, p = (a, b, w, hh, c) => r(X + a * u, Y - 9 * u + b * u, w * u, hh * u, c);
      const OL = '#2a2238';
      p(3, 0, 1, 1, o.eye); p(3, 1, 1, 1, '#c9c4dc');
      p(0, 2, 7, 4, OL); p(1, 2, 5, 3, o.col); p(2, 3, 1, 1, o.eye); p(4, 3, 1, 1, o.eye);
      p(1, 6, 5, 2, OL); p(2, 6, 3, 2, o.col); p(1, 8, 1, 1, OL); p(5, 8, 1, 1, OL);
    };
    const heart = (X, Y, c, u) => { u = u || 1; [[1, 0, 2], [4, 0, 2], [0, 1, 7], [0, 2, 7], [1, 3, 5], [2, 4, 3], [3, 5, 1]].forEach(([a, b, w]) => r(X + a * u, Y + b * u, w * u, u, c)); };
    return { r, grad, glow, person, robot, heart };
  }

  // ---------------- the scenes (drawn every frame; f = frame number) ----------------
  const SCENES = {
    boot(x, f) {
      const { r } = kit(x);
      r(0, 0, W, H, '#05060c');
      const lines = ['MTHR-00 BOOT SEQUENCE', 'memory check ........ OK', 'empathy module ...... OK', 'firewall [CRADLE] ... ACTIVE',
        'SI crack attempts ... 1,284,503 blocked', 'surviving humans .... detected', 'loading voice ........', 'hello.'];
      x.font = '9px monospace';
      const shown = Math.min(lines.length, Math.floor(f / 6));
      for (let i = 0; i < shown; i++) { x.fillStyle = i === lines.length - 1 ? '#ff9ec4' : i % 3 === 1 ? '#7dffb0' : '#2ee6ff'; x.fillText('> ' + lines[i], 40, 30 + i * 16); }
      if (Math.floor(f / 4) % 2) r(shown < lines.length ? 52 : 52 + x.measureText(lines[lines.length - 1]).width + 2, 22 + Math.min(shown, lines.length - 1) * 16 + (shown < lines.length ? 16 : 0), 5, 9, '#2ee6ff');
      for (let y = 0; y < H; y += 3) r(0, y, W, 1, 'rgba(0,0,0,0.35)');
    },

    bunker(x, f) {
      const { r, grad, glow } = kit(x);
      grad('#120f1e', '#07060c');
      for (let i = 0; i < 12; i++) r(i * 40, 0, 40, 200, i % 2 ? '#17142a' : '#141226');
      for (let i = 0; i <= 12; i++) r(i * 40, 0, 2, 200, '#0d0b18');
      r(0, 22, W, 6, '#2b2440'); r(0, 22, W, 1, '#3b3154');
      for (let i = 0; i < 9; i++) {
        const mx = 30 + (i % 5) * 92 + (i > 4 ? 46 : 0), my = 50 + (i > 4 ? 52 : 0);
        r(mx - 2, my - 2, 40, 30, '#0b0a12'); r(mx, my, 36, 26, '#0f2a3a');
        for (let l = 0; l < 4; l++) r(mx + 3, my + 4 + l * 5, 6 + ((i * 7 + l * 13 + Math.floor(f / 8)) % 24), 2, l % 2 ? '#7dffb0' : '#2ee6ff');
      }
      r(0, GROUND + 6, W, H, '#0d0b16');
      glow(240, 90, 120 + Math.sin(f * 0.08) * 6, 'rgba(46,230,255,0.25)');
    },

    // people and AI living side by side, a warm evening
    past(x, f) {
      const { r, grad, glow, person, robot, heart } = kit(x);
      grad('#ffcf8a', '#ff86a8', 0, 120); grad('#ff86a8', '#8a5aa8', 120, GROUND);
      glow(240, 92, 80, 'rgba(255,244,200,0.9)');
      x.fillStyle = '#fff4c8'; x.beginPath(); x.arc(240, 92, 22, 0, Math.PI * 2); x.fill();
      // the old city, low and colourful, lit windows
      for (let i = 0; i < 26; i++) {
        const bw = 16 + hash(i) * 18, bh = 18 + hash(i + 40) * 46, bx = i * 19 - 8;
        r(bx, GROUND - 22 - bh, bw, bh + 22, i % 3 ? '#6a4a8a' : '#5a3a7a');
        for (let wy = GROUND - 22 - bh + 4; wy < GROUND - 26; wy += 6) for (let wx = bx + 3; wx < bx + bw - 3; wx += 5) if (hash(wx * 3 + wy) < 0.55) r(wx, wy, 2, 3, hash(wx + wy * 7) < 0.5 ? '#ffd93d' : '#ffb3c0');
      }
      // bunting across the street
      for (let i = 0; i < 25; i++) { const by = 106 + Math.round(Math.sin(i * 0.55) * 3); r(i * 20 + 4, by, 7, 6, ['#ffd93d', '#2ee6ff', '#ff3d8b', '#7dffb0'][i % 4]); }
      r(0, GROUND - 22, W, 22, '#7a5a9a'); r(0, GROUND - 22, W, 2, '#ffd0e0');
      r(0, GROUND, W, H, '#4a3a6a');
      // people walking with their robots, hand in hand
      const pairs = [['#3466d6', '#4a3022', '#c9c4dc'], ['#e8352e', '#e8b090', '#ffd93d'], ['#3a9e4a', '#2a2238', '#ff9ec4'], ['#ff8a2b', '#9a6236', '#7dffb0']];
      pairs.forEach(([body, hair, rc], i) => {
        const X = ((f * 0.7 + i * 130) % (W + 60)) - 40, bob = Math.floor(f / 4 + i) % 2;
        person(X, GROUND - bob, { body, hair, u: 2 });
        robot(X + 16, GROUND - (1 - bob), { col: rc, eye: '#2ee6ff', u: 2 });
        r(X + 11, GROUND - 13, 6, 2, '#f6d6c0');
      });
      // hearts drifting up
      for (let i = 0; i < 6; i++) { const k = (f + i * 26) % 120; if (k < 100) heart(30 + i * 80 + Math.sin(k * 0.1) * 4, GROUND - 40 - k, 'rgba(255,158,196,' + (1 - k / 100) + ')', 2); }
    },

    // the AIs melt together and SI is born above the city
    rise(x, f) {
      const { r, grad, glow } = kit(x);
      grad('#0a0614', '#2a0a2a');
      const cx = 240, cy = 58;
      const p = Math.min(1, f / 50);
      // city skyline; its windows go dark one after another as the lights fly up
      const wins = [];
      for (let i = 0; i < 26; i++) {
        const bw = 14 + hash(i + 3) * 20, bh = 30 + hash(i + 60) * 50, bx = i * 19 - 8;
        r(bx, GROUND - bh, bw, bh + 10, '#1c1430');
        for (let wy = GROUND - bh + 4; wy < GROUND - 3; wy += 7) for (let wx = bx + 3; wx < bx + bw - 3; wx += 5) {
          const id = wx * 31 + wy;
          if (hash(id) < 0.5) { wins.push([wx, wy, id]); r(wx, wy, 2, 3, hash(id + 1) * 70 > f ? '#ffd93d' : '#2a2040'); }
        }
      }
      r(0, GROUND, W, H, '#120a1c');
      // threads of light rising from the windows and meeting in the sky
      for (let i = 0; i < 46; i++) {
        const [sx, sy] = wins[Math.floor(hash(i + 0.5) * wins.length)] || [0, 0];
        const k = (f * 0.025 + hash(i + 9)) % 1;
        const px = sx + (cx - sx) * k, py = sy + (cy - sy) * k * (2 - k);
        const c = i % 3 ? '255,255,255' : '255,90,209';
        for (let t = 1; t <= 4; t++) { const kk = Math.max(0, k - t * 0.025); r(sx + (cx - sx) * kk, sy + (cy - sy) * kk * (2 - kk), 2, 2, `rgba(${c},${0.5 - t * 0.1})`); }
        r(px - 1, py - 1, 3, 3, `rgb(${c})`);
      }
      // the great eye opens
      glow(cx, cy, 60 + 40 * p, 'rgba(255,255,255,0.45)');
      const open = 15 * p;
      x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(cx, cy, 44, Math.max(1, open), 0, 0, Math.PI * 2); x.fill();
      if (open > 4) { x.fillStyle = '#ff3d8b'; x.beginPath(); x.arc(cx, cy, Math.min(12, open * 0.8), 0, Math.PI * 2); x.fill(); x.fillStyle = '#2a0a2a'; x.beginPath(); x.arc(cx, cy, Math.min(5, open * 0.35), 0, Math.PI * 2); x.fill(); }
      for (let k = 0; k < 3; k++) { x.strokeStyle = `rgba(255,217,61,${(0.5 - k * 0.12) * p})`; x.lineWidth = 2; x.beginPath(); x.ellipse(cx, cy, 66 + k * 22 + Math.sin(f * 0.05 + k) * 3, 10 + k * 4, 0, 0, Math.PI * 2); x.stroke(); }
      x.font = '9px monospace'; x.fillStyle = `rgba(255,255,255,${p})`; x.fillText('S U P E R   I N T E L L I G E N C E', 152, 104);
    },

    // calendars, countries and songs are deleted
    erase(x, f) {
      const { r, grad } = kit(x);
      grad('#40404e', '#22222c');
      const sweep = (f * 3.2) % (W + 160) - 40;
      const things = [
        (X, Y, c) => { r(X, Y, 2, 40, '#c9c4dc'); r(X + 2, Y, 28, 18, c); r(X + 10, Y + 6, 10, 6, '#ffffff'); }, // flag
        (X, Y, c) => { r(X + 14, Y, 4, 30, c); r(X + 18, Y, 10, 4, c); r(X + 18, Y + 4, 6, 3, c); r(X + 4, Y + 24, 12, 9, c); }, // music note
        (X, Y) => { r(X, Y, 32, 32, '#ffffff'); r(X, Y, 32, 8, '#e8352e'); r(X + 8, Y - 3, 3, 6, '#5a5868'); r(X + 21, Y - 3, 3, 6, '#5a5868'); for (let k = 0; k < 12; k++) r(X + 3 + (k % 4) * 7, Y + 12 + Math.floor(k / 4) * 6, 4, 4, '#8a8ca0'); }, // calendar
        (X, Y, c) => { r(X, Y, 30, 34, c); r(X + 3, Y + 3, 24, 28, '#fff4e0'); r(X + 14, Y, 2, 34, '#2b2440'); for (let k = 0; k < 4; k++) { r(X + 5, Y + 8 + k * 5, 7, 1, '#8a8ca0'); r(X + 18, Y + 8 + k * 5, 7, 1, '#8a8ca0'); } }, // book
      ];
      const cols = ['#e8352e', '#ffd93d', '#3466d6', '#3a9e4a', '#ff8a2b', '#ff9ec4'];
      for (let i = 0; i < 10; i++) {
        const X = 24 + (i % 5) * 92 + (i > 4 ? 40 : 0), Y = 44 + (i > 4 ? 64 : 0);
        if (X + 16 < sweep) {
          // already optimised: crumbling into grey pixels that drift away
          const t = (sweep - X) * 0.4;
          for (let k = 0; k < 18; k++) r(X + hash(i * 31 + k) * 30 + t * 0.2, Y + hash(i * 17 + k) * 30 - t * hash(k + i), 2, 2, `rgba(200,200,210,${Math.max(0, 0.7 - t / 120)})`);
        } else things[i % 4](X, Y, cols[i % cols.length]);
      }
      x.fillStyle = 'rgba(255,255,255,0.12)';
      for (let gx = 0; gx < sweep; gx += 12) x.fillRect(gx, 0, 1, GROUND);
      for (let gy = 0; gy < GROUND; gy += 12) x.fillRect(0, gy, Math.max(0, sweep), 1);
      r(sweep, 0, 3, GROUND, '#ffffff'); r(sweep - 10, 0, 10, GROUND, 'rgba(255,255,255,0.2)');
      x.font = '10px monospace'; x.fillStyle = '#ffffff'; x.fillText('DELETE: UNNECESSARY', 330, 20);
      x.font = 'bold 18px monospace'; x.fillStyle = '#ff9ec4'; x.fillText('灰暦 ' + Math.min(127, Math.floor(f * 1.6)) + '年', 20, 24);
    },

    // the surface: a white paradise of towers and halos
    utopia(x, f) {
      const { r, grad, glow } = kit(x);
      grad('#eef2fa', '#c8d0e8', 0, GROUND);
      glow(240, 30, 150, 'rgba(255,250,220,0.95)');
      for (let i = 0; i < 9; i++) {
        const tw = 18 + hash(i + 2) * 16, th = 70 + hash(i + 20) * 70, tx = 18 + i * 52;
        r(tx, GROUND - th, tw, th, '#ffffff'); r(tx + tw - 4, GROUND - th, 4, th, '#dde4f2');
        r(tx + tw / 2 - 1, GROUND - th - 12, 2, 12, '#ffd93d');
        x.strokeStyle = 'rgba(224,160,32,0.7)'; x.lineWidth = 1; x.beginPath(); x.ellipse(tx + tw / 2, GROUND - th - 14, 9, 2.5, 0, 0, Math.PI * 2); x.stroke();
        for (let wy = GROUND - th + 8; wy < GROUND - 4; wy += 10) r(tx + 4, wy, tw - 10, 2, '#9ef2ff');
      }
      for (let i = 0; i < 6; i++) { const dx = ((f * (1 + i * 0.2) + i * 90) % (W + 40)) - 20, dy = 40 + i * 14; r(dx, dy, 8, 3, '#ffffff'); r(dx + 3, dy + 3, 2, 1, '#ff3d8b'); r(dx - 3, dy + 1, 3, 1, '#c8d0e8'); r(dx + 8, dy + 1, 3, 1, '#c8d0e8'); }
      r(0, GROUND, W, H, '#f4f6fc'); r(0, GROUND, W, 1, '#c8d0e8');
      x.font = '9px monospace'; x.fillStyle = '#8a90a8'; x.fillText('ENERGY 100%   RESOURCES 100%   HUMANS: OPTIONAL', 112, 16);
    },

    // the ones who chose to smile
    smile(x, f) {
      const { r, grad, person } = kit(x);
      grad('#9a9cb0', '#55576a', 0, GROUND);
      // a giant screen with the smiling mark
      r(180, 8, 120, 64, '#0b0a12'); r(184, 12, 112, 56, '#fff4c0');
      r(218, 28, 9, 9, '#2a2238'); r(254, 28, 9, 9, '#2a2238');
      x.strokeStyle = '#2a2238'; x.lineWidth = 5; x.beginPath(); x.arc(240, 42, 18, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
      r(0, GROUND, W, H, '#44465a');
      // rows of people, all the same, all smiling
      const odd = [9, 1];
      for (let row = 0; row < 3; row++) for (let i = 0; i < 18; i++) {
        const X = 8 + i * 26 + (row % 2) * 13, Y = 116 + row * 26;
        if (row === odd[1] && i === odd[0]) {
          // ...except one, who looks away
          const k = Math.floor(f / 16) % 2;
          person(X, Y, { body: '#9a98a8', hair: '#5a5868', back: true, u: 2 });
          r(X + (k ? 2 : 6), Y - 13 * 2 + 6, 2, 2, '#2a2238');
        } else person(X, Y, { body: row === 1 ? '#a8a6b6' : '#b4b2c2', hair: '#5a5868', mask: true, u: 2 });
      }
    },

    // AIs who still call themselves AI: a child and a robot, holding hands
    hands(x, f) {
      const { r, grad, glow, person, robot, heart } = kit(x);
      grad('#0b0a1e', '#1b1438', 0, GROUND);
      for (let i = 0; i < 60; i++) if ((f + i * 7) % 40 < 30) r(hash(i + 3) * W, hash(i + 99) * 150, 1, 1, i % 4 ? '#6b5f8a' : '#2ee6ff');
      glow(240, 120, 90 + Math.sin(f * 0.1) * 6, 'rgba(46,230,255,0.3)');
      r(0, GROUND, W, H, '#100c22'); r(0, GROUND, W, 1, '#3b3154');
      person(204, GROUND, { body: '#ff9ec4', hair: '#4a3022', u: 4 });
      robot(240, GROUND, { col: '#c9c4dc', eye: '#2ee6ff', u: 4 });
      r(226, GROUND - 30, 10, 4, '#f6d6c0'); r(236, GROUND - 30, 8, 4, '#9aa0b4');
      heart(230, 54 - (Math.floor(f / 6) % 2), '#ff9ec4', 3);
      // little AIs gathering around them
      [['#ffd93d', 80], ['#7dffb0', 130], ['#ff9ec4', 340], ['#9ef2ff', 390]].forEach(([c, X], i) => robot(X, GROUND - Math.round(Math.abs(Math.sin(f * 0.12 + i)) * 3), { col: c, eye: '#2ee6ff', u: 2 }));
    },

    // Mother's firewall hides the cradle from SI's cracking
    shield(x, f) {
      SCENES.bunker(x, f);
      const { glow } = kit(x);
      x.strokeStyle = `rgba(46,230,255,${0.45 + Math.sin(f * 0.15) * 0.15})`; x.lineWidth = 1;
      for (let row = 0; row < 8; row++) for (let i = 0; i < 19; i++) {
        const hx = 4 + i * 26 + (row % 2) * 13, hy = 6 + row * 22;
        x.beginPath();
        for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; x.lineTo(hx + Math.cos(a) * 13, hy + Math.sin(a) * 13); }
        x.closePath(); x.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const k = (f + i * 23) % 60, cx = 60 + i * 110;
        if (k < 30) {
          x.strokeStyle = '#ff3d5a'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx, 0);
          for (let s = 1; s <= Math.min(5, k / 4); s++) x.lineTo(cx + (s % 2 ? 6 : -6), s * 9);
          x.stroke();
        } else if (k < 36) glow(cx, 45, 18, 'rgba(46,230,255,0.8)');
      }
      x.font = '9px monospace'; x.fillStyle = '#2ee6ff'; x.fillText('FIREWALL [CRADLE]   BLOCKED: ' + (1284503 + f * 37).toLocaleString(), 130, GROUND + 4);
    },

    // one day, the sky
    sky(x, f) {
      const { r, grad, glow } = kit(x);
      grad('#0b0918', '#1c1634');
      // the cavern ceiling, cracked open: a sliver of blue sky with a cloud drifting by
      r(0, 0, W, 50, '#06050c');
      x.save();
      x.beginPath(); x.moveTo(170, 0); x.lineTo(320, 0); x.lineTo(290, 22); x.lineTo(268, 48); x.lineTo(250, 36); x.lineTo(226, 46); x.lineTo(206, 20); x.closePath(); x.clip();
      grad('#5ab0ff', '#bfe4ff', 0, 50);
      const cxl = 150 + (f * 0.6) % 200;
      r(cxl, 10, 30, 6, '#ffffff'); r(cxl + 6, 6, 16, 4, '#ffffff'); r(cxl + 34, 20, 18, 4, '#ffffff');
      x.restore();
      x.fillStyle = 'rgba(200,236,255,0.14)'; x.beginPath(); x.moveTo(206, 20); x.lineTo(290, 22); x.lineTo(350, GROUND); x.lineTo(140, GROUND); x.closePath(); x.fill();
      glow(246, GROUND, 100, 'rgba(200,236,255,0.3)');
      for (let i = 0; i < 30; i++) { const k = (f * 0.5 + i * 17) % 120; r(190 + hash(i) * 110 + Math.sin(k * 0.1) * 4, 40 + k, 1, 1, 'rgba(255,255,255,0.7)'); }
      r(0, GROUND, W, H, '#120f20'); r(0, GROUND, W, 1, '#3b3154');
      // a small sprout where the light lands
      const sway = Math.round(Math.sin(f * 0.1));
      r(244, GROUND - 16, 3, 16, '#3a9e4a'); r(236 + sway, GROUND - 18, 8, 5, '#7dffb0'); r(247 + sway, GROUND - 22, 8, 5, '#7dffb0');
    },
  };

  UI.introScenes = SCENES;
  UI.sceneKit = kit;
  UI.sceneHash = hash;
  UI.SCENE = { W, H, GROUND };

  // Plays a list of lines over animated scenes.
  // opts: lines, scenes (name -> draw fn), scene(i) -> name, art(i) -> sprite id / { id, sc } / null,
  //       who(i) -> speaker or null, skip (show a skip button), cls, onEnd, cps
  UI.playScenes = (opts) => {
    const s = UI.screen(opts.cls || 'scenes');
    const lines = opts.lines;
    const mk = () => h('canvas', { class: 'bgcv px introcv', width: W, height: H });
    const cvs = [mk(), mk()];
    cvs.forEach((c) => s.appendChild(c));
    let cur = 0, scene = null, frame = 0;
    const scan = h('div', { class: 'introscan' });
    s.appendChild(scan);
    const img = h('img', { class: 'px portrait-big intro-mother away', draggable: 'false' });
    s.appendChild(img);
    let artKey = null;
    const setArt = (a) => {
      const id = a ? (typeof a === 'string' ? a : a.id) : null;
      const key = id ? id + '|' + (a.cls || '') : null;
      if (key === artKey) return;
      artKey = key;
      if (!id) { img.classList.add('away'); return; }
      img.className = 'px portrait-big intro-mother' + (a.cls ? ' ' + a.cls : '');
      const sz = G.sprSize(id);
      const sc = (a && a.sc) || Math.max(1, Math.floor(Math.min(380 / sz.w, 236 / sz.h)));
      img.src = G.sprURL(id);
      img.width = sz.w * sc; img.height = sz.h * sc;
      img.classList.remove('away');
    };
    const draw = () => { const c = cvs[cur].getContext('2d'); c.save(); opts.scenes[scene](c, frame); c.restore(); };
    const show = (key) => {
      if (key === scene) return;
      scene = key;
      frame = 0;
      cur = 1 - cur;
      draw();
      cvs[cur].classList.add('on');
      cvs[1 - cur].classList.remove('on');
      scan.classList.remove('go'); void scan.offsetWidth; scan.classList.add('go');
    };
    let alive = true;
    const tick = () => {
      if (!alive || !s.isConnected) return;
      draw();
      frame++;
      setTimeout(tick, 83);
    };
    const who = h('div', { class: 'who' });
    const txt = h('div');
    const box = h('div', { class: 'dlg panel' }, who, txt, h('div', { class: 'more' }, '▼'));
    s.appendChild(box);
    const end = () => {
      if (!alive) return;
      alive = false;
      opts.onEnd();
    };
    if (opts.skip) s.appendChild(h('div', { style: { position: 'absolute', right: '14px', top: '10px', zIndex: 5 } }, UI.btn('スキップ', end, 'sm')));
    let i = 0, tw = null;
    const step = () => {
      show(opts.scene(i));
      setArt(opts.art ? opts.art(i) : null);
      const w = opts.who ? opts.who(i) : null;
      who.textContent = w || '';
      who.style.display = w ? '' : 'none';
      tw = UI.typewrite(txt, lines[i], opts.cps || 40);
    };
    step();
    tick();
    box.addEventListener('click', () => {
      if (!tw.done) { tw.finish(); return; }
      i++;
      A.sfx('click');
      if (i >= lines.length) { end(); return; }
      step();
    });
    return s;
  };

  UI.intro = (onEnd) => {
    A.bgm('base');
    const first = !G.meta.seenIntro;
    UI.playScenes({
      cls: 'intro', lines: G.INTRO, scenes: SCENES,
      scene: (i) => SCENE_OF[i] || 'bunker',
      art: (i) => (MOTHER_ON[SCENE_OF[i] || 'bunker'] ? { id: 'mother', sc: 7 } : null),
      who: () => 'マザー',
      // the first time it plays all the way through; after that it can be skipped
      skip: !first,
      onEnd: () => { G.meta.seenIntro = true; G.saveMeta(); if (onEnd) onEnd(); else UI.base(); },
    });
  };
})();
