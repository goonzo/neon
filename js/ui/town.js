// Cradle town: a small pixel-art underground town that grows with the facility levels.
// Static scenery is drawn once to an offscreen canvas; lights, smoke and the walking crew animate on top.
(function () {
  const G = globalThis.G;
  const h = G.h;
  const UI = G.UI;

  const W = 336, H = 116, GY = 96, SC = 2;
  const SLOTS = {
    quarters: { x: 6, w: 58 }, farm: { x: 68, w: 46 }, clinic: { x: 118, w: 46 },
    core: { x: 168, w: 40 }, workshop: { x: 212, w: 54 }, market: { x: 270, w: 62 },
    recycle: { x: 157, w: 13, small: true }, // a capsule machine standing in front of the street
  };
  const ANIMALS = new Set(['pixe', 'goura', 'crow', 'mike', 'octo', 'pyon']);
  const FG = 4; // the crew is drawn on a finer overlay so the new sprites keep their detail
  const OUT = '#0b0a12';

  function lcg(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  // lighten (a > 0) / darken (a < 0) a #rrggbb color
  function tint(c, a) {
    const n = parseInt(c.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(a > 0 ? v + (255 - v) * a : v * (1 + a))));
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('');
  }

  // ---------------- static scenery ----------------
  function drawStatic(x, fac, total, A) {
    const R = lcg(127);
    const r = (X, Y, w, hh, c) => { x.fillStyle = c; x.fillRect(Math.round(X), Math.round(Y), Math.round(w), Math.round(hh)); };
    const box = (X, Y, w, hh, c) => { r(X, Y, w, hh, OUT); r(X + 1, Y + 1, w - 2, hh - 2, c); r(X + 1, Y + 1, w - 2, 1, tint(c, 0.35)); r(X + 1, Y + hh - 2, w - 2, 1, tint(c, -0.35)); };
    const env = { r, box, A, R };

    // cavern
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b0918'); g.addColorStop(0.85, '#1c1634');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) r(R() * W, 12 + R() * 80, 1 + Math.floor(R() * 2), 1, R() < 0.5 ? '#231d3c' : '#15112a');
    // ruins of the old city, far behind
    for (let i = 0; i < 12; i++) { const bw = 12 + R() * 22, bh = 12 + R() * 30; const bx = R() * W; r(bx, GY - bh, bw, bh, '#151229'); for (let k = 0; k < 3; k++) r(bx + 2 + R() * (bw - 4), GY - bh + 3 + R() * (bh - 6), 1, 1, '#2a2348'); }
    // ceiling + stalactites + pipes
    r(0, 0, W, 10, '#06050c');
    for (let X = 0; X < W; X += 3) r(X, 10, 3, Math.floor(R() * 4), '#06050c');
    for (let i = 0; i < 16; i++) { const sx = R() * W, sl = 3 + Math.floor(R() * 8); for (let k = 0; k < sl; k++) { const ww = Math.max(1, Math.round(3 * (1 - k / sl))); r(sx - ww / 2, 10 + k, ww, 1, '#06050c'); } }
    r(0, 13, W, 2, '#2b2440'); r(0, 13, W, 1, '#3b3154');
    for (let X = 14; X < W; X += 46) r(X, 12, 3, 4, '#4b4b5c');
    // hanging lamps: more lamps as the town grows
    const lamps = 3 + Math.floor(total / 2);
    for (let i = 0; i < lamps; i++) {
      const lx = Math.round(((i + 0.5) / lamps) * W + (R() - 0.5) * 8), ly = 20 + Math.floor(R() * 8);
      r(lx, 15, 1, ly - 15, '#2b2440');
      r(lx - 1, ly, 3, 2, '#5f6075');
      A.push({ t: 'lamp', x: lx, y: ly + 2, p: R() });
    }
    // ground
    r(0, GY, W, H - GY, '#120f20');
    r(0, GY, W, 1, '#3b3154');
    for (let X = 0; X < W; X += 12) r(X, GY + 1, 1, H - GY, '#1a1630');
    r(0, GY + 10, W, 1, '#1a1630');

    for (const k of G.FAC_ORDER) if (DRAW[k]) DRAW[k](env, SLOTS[k], fac[k] || 0);
  }

  // a little "planned site" signboard for level-0 facilities
  function sign(env, X) {
    const { r } = env;
    r(X + 2, GY - 9, 1, 9, '#5a3726');
    r(X, GY - 12, 9, 5, OUT); r(X + 1, GY - 11, 7, 3, '#c9a85a'); r(X + 2, GY - 10, 5, 1, '#5a3726');
  }

  const DRAW = {
    quarters(env, s, lv) {
      const { r, box, A, R } = env;
      if (lv === 0) {
        // tarp tent + campfire
        const tx = s.x + 8, tw = 24, th = 14;
        for (let k = 0; k < th; k++) { const ww = Math.round((tw * (k + 1)) / th); r(tx + (tw - ww) / 2, GY - th + k, ww, 1, k < 2 ? '#ff8a2b' : '#c25e1c'); }
        r(tx + tw / 2 - 2, GY - 6, 4, 6, '#2b1a12');
        r(s.x + 40, GY - 2, 7, 2, '#5a3726');
        A.push({ t: 'fire', x: s.x + 41, y: GY - 3 });
        sign(env, s.x + 48);
        return;
      }
      const cols = ['#3466d6', '#c0392b', '#3a9e4a'];
      let top = GY;
      for (let f = 0; f < lv; f++) {
        const bw = 36 - f * 2, bh = 16, bx = s.x + 3 + (f % 2) * 6, by = GY - bh * (f + 1);
        top = by;
        box(bx, by, bw, bh, cols[f]);
        for (let i = 3; i < bw - 2; i += 3) r(bx + i, by + 2, 1, bh - 4, tint(cols[f], -0.2));
        for (let i = 0; i < 3; i++) { const wx = bx + 4 + i * 8; r(wx - 1, by + 4, 6, 6, OUT); A.push({ t: 'win', x: wx, y: by + 5, w: 4, h: 4, p: R() }); }
        if (f === 0) { r(bx + bw - 9, by + 5, 6, 11, OUT); r(bx + bw - 8, by + 6, 4, 10, '#2b1a12'); r(bx + bw - 5, by + 11, 1, 1, '#ffd93d'); }
      }
      if (lv >= 2) {
        // ladder + laundry line
        const lx = s.x + 44;
        r(lx, top + 2, 1, GY - top - 2, '#9a9cb2'); r(lx + 4, top + 2, 1, GY - top - 2, '#9a9cb2');
        for (let y = top + 4; y < GY; y += 4) r(lx, y, 5, 1, '#9a9cb2');
        r(s.x + 40, GY - 26, 18, 1, '#5f6075');
        [['#ff9ec4', 0], ['#ffffff', 5], ['#2ee6ff', 10]].forEach(([c, dx]) => r(s.x + 42 + dx, GY - 25, 4, 5, c));
      }
      if (lv >= 3) {
        // rooftop antenna + neon sign
        r(s.x + 12, top - 9, 1, 9, '#9a9cb2'); r(s.x + 10, top - 9, 5, 1, '#9a9cb2');
        A.push({ t: 'blink', x: s.x + 12, y: top - 11, w: 1, h: 2, c: '#e8352e', p: 0.2, rate: 0.12 });
        r(s.x + 24, top - 7, 12, 7, OUT);
        A.push({ t: 'neon', x: s.x + 25, y: top - 6, w: 10, h: 5, c: '#ff3d8b', p: R() });
      }
    },

    farm(env, s, lv) {
      const { r, A, R } = env;
      if (lv === 0) {
        for (let i = 0; i < 3; i++) {
          const px = s.x + 6 + i * 9;
          r(px, GY - 4, 6, 4, '#8f5b43'); r(px, GY - 4, 6, 1, '#d39a76');
          r(px + 2, GY - 8, 1, 4, '#3a9e4a'); r(px + 1, GY - 7, 1, 1, '#7dffb0'); r(px + 3, GY - 9, 1, 1, '#7dffb0');
        }
        sign(env, s.x + 34);
        return;
      }
      const racks = lv;
      const rw = 11, gap = 3, totalW = racks * rw + (racks - 1) * gap, x0 = s.x + Math.floor((s.w - totalW) / 2);
      const tiers = lv >= 3 ? 4 : 3, th = 8;
      if (lv >= 2) {
        // greenhouse glass
        const gx = x0 - 4, gw = totalW + 8, gh = tiers * th + 6;
        r(gx, GY - gh, gw, gh, 'rgba(125,255,176,0.10)');
        r(gx, GY - gh, 1, gh, '#2fae63'); r(gx + gw - 1, GY - gh, 1, gh, '#2fae63');
        for (let k = 0; k < 6; k++) { const ww = Math.round(gw * (1 - k / 6)); r(gx + (gw - ww) / 2, GY - gh - k, ww, 1, k === 0 ? '#2fae63' : 'rgba(125,255,176,0.18)'); }
        for (let X = gx + 6; X < gx + gw - 2; X += 7) r(X, GY - gh, 1, gh, 'rgba(47,174,99,0.5)');
      }
      for (let i = 0; i < racks; i++) {
        const rx = x0 + i * (rw + gap);
        r(rx, GY - tiers * th, 1, tiers * th, '#5f6075'); r(rx + rw - 1, GY - tiers * th, 1, tiers * th, '#5f6075');
        for (let t = 0; t < tiers; t++) {
          const sy = GY - t * th - 1;
          r(rx, sy, rw, 1, '#9a9cb2');
          for (let p = 1; p < rw - 1; p += 2) { const ph = 2 + Math.floor(R() * 3); r(rx + p, sy - ph, 1, ph, R() < 0.5 ? '#3a9e4a' : '#7dffb0'); if (R() < 0.25) r(rx + p, sy - ph - 1, 1, 1, '#e8352e'); }
          A.push({ t: 'grow', x: rx + 1, y: sy - th + 1, w: rw - 2, c: lv >= 3 ? '#ff5ad1' : '#a05cff', p: R() });
        }
      }
      if (lv >= 3) {
        const tx = x0 + totalW + 5;
        r(tx, GY - 16, 7, 16, OUT); r(tx + 1, GY - 15, 5, 14, '#137a99'); r(tx + 1, GY - 9, 5, 8, '#2ee6ff');
        A.push({ t: 'drip', x: tx + 3, y: GY - 1 });
      }
    },

    clinic(env, s, lv) {
      const { r, box, A } = env;
      const cross = (X, Y, n, c) => { r(X + n, Y, n, n * 3, c); r(X, Y + n, n * 3, n, c); };
      if (lv === 0) {
        box(s.x + 10, GY - 10, 14, 10, '#e8e8f0');
        cross(s.x + 14, GY - 8, 2, '#e8352e');
        r(s.x + 28, GY - 16, 1, 16, '#9a9cb2'); r(s.x + 29, GY - 16, 6, 4, '#e8e8f0'); r(s.x + 31, GY - 15, 1, 2, '#e8352e'); r(s.x + 30, GY - 14, 3, 1, '#e8352e');
        sign(env, s.x + 34);
        return;
      }
      const dims = [null, [28, 20], [38, 24], [40, 38]][lv];
      const bw = dims[0], bh = dims[1], bx = s.x + Math.floor((s.w - bw) / 2), by = GY - bh;
      box(bx, by, bw, bh, '#e8e8f0');
      r(bx + 1, by + bh - 6, bw - 2, 1, '#a99fc9');
      // door
      r(bx + bw / 2 - 3, GY - 9, 6, 9, OUT); r(bx + bw / 2 - 2, GY - 8, 4, 8, '#2ee6ff'); r(bx + bw / 2 - 2, GY - 8, 4, 2, '#9ef2ff');
      const winRow = (y) => { for (const wx of [bx + 4, bx + bw - 10]) { r(wx - 1, y - 1, 7, 6, OUT); A.push({ t: 'win', x: wx, y, w: 5, h: 4, p: wx * 0.01, c: '#9ef2ff' }); } };
      if (lv >= 2) winRow(GY - 16);
      if (lv >= 3) { winRow(GY - 30); r(bx + 1, GY - 21, bw - 2, 1, '#a99fc9'); }
      // red cross sign on the roof
      const cs = lv >= 3 ? 3 : 2;
      const cx = bx + bw / 2 - (cs * 3) / 2, cy = by - cs * 3 - 2;
      r(cx - 1, cy - 1, cs * 3 + 2, cs * 3 + 2, OUT); r(cx, cy, cs * 3, cs * 3, '#ffffff');
      if (lv >= 3) A.push({ t: 'cross', x: cx, y: cy, n: cs });
      else cross(cx, cy, cs, '#e8352e');
      if (lv >= 2) { r(bx + 3, by - 3, 3, 3, OUT); A.push({ t: 'siren', x: bx + 4, y: by - 2 }); }
      if (lv >= 3) { r(bx - 8, GY - 4, 7, 2, '#8f5b43'); r(bx - 8, GY - 2, 1, 2, '#5a3726'); r(bx - 2, GY - 2, 1, 2, '#5a3726'); }
    },

    core(env, s, lv) {
      const { r, box, A } = env;
      const cx = s.x + s.w / 2;
      // base platform
      r(cx - 16, GY - 3, 32, 3, OUT); r(cx - 15, GY - 2, 30, 2, '#3b3154'); r(cx - 15, GY - 2, 30, 1, '#6b5f8a');
      if (lv === 0) {
        box(cx - 8, GY - 15, 16, 12, '#2b2440');
        r(cx - 6, GY - 13, 12, 7, '#0f2a3a');
        A.push({ t: 'term', x: cx - 5, y: GY - 12 });
        sign(env, s.x + 30);
        return;
      }
      const ph = [0, 30, 50, 80][lv], pw = [0, 10, 12, 14][lv];
      const top = GY - 3 - ph;
      if (lv >= 3) {
        // cables up into the ceiling
        for (const dx of [-5, 0, 5]) r(cx + dx, 15, 1, top - 15, '#2b2440');
        A.push({ t: 'beam', x: cx, y0: 15, y1: top });
      }
      box(cx - pw / 2, top, pw, ph, '#1b2a4a');
      for (let y = top + 4; y < GY - 6; y += 6) A.push({ t: 'stripe', x: cx - pw / 2 + 2, y, w: pw - 4, p: (y - top) / ph });
      A.push({ t: 'orb', x: cx, y: top - 4, rad: 3 + lv, ring: lv >= 2 });
    },

    workshop(env, s, lv) {
      const { r, box, A, R } = env;
      const anvil = (X) => { r(X, GY - 5, 8, 2, '#5f6075'); r(X + 2, GY - 3, 4, 3, '#4b4b5c'); r(X - 1, GY - 5, 2, 1, '#5f6075'); };
      if (lv === 0) {
        for (let i = 0; i < 14; i++) r(s.x + 4 + R() * 20, GY - 2 - R() * 8, 2 + R() * 4, 2 + R() * 3, R() < 0.5 ? '#5f6075' : '#9a9cb2');
        anvil(s.x + 30);
        A.push({ t: 'spark', x: s.x + 33, y: GY - 6 });
        sign(env, s.x + 44);
        return;
      }
      const bw = 32, bh = 22, bx = s.x + 4, by = GY - bh;
      if (lv >= 3) {
        // chimney with smoke
        r(bx + 4, by - 12, 6, 12, OUT); r(bx + 5, by - 11, 4, 11, '#8f5b43'); r(bx + 4, by - 13, 6, 2, '#5f6075');
        A.push({ t: 'smoke', x: bx + 7, y: by - 14 });
      }
      box(bx, by, bw, bh, '#5f6075');
      for (let i = 2; i < bw - 2; i += 2) r(bx + i, by + 2, 1, 4, '#4b4b5c');
      // roller door
      r(bx + 6, GY - 13, 20, 13, OUT);
      for (let y = GY - 12; y < GY; y += 2) { r(bx + 7, y, 18, 1, '#9a9cb2'); r(bx + 7, y + 1, 18, 1, '#6b5f8a'); }
      r(bx + 7, GY - 4, 18, 4, '#1b1030');
      A.push({ t: 'spark', x: bx + 16, y: GY - 3 });
      if (lv >= 3) {
        // gear sign
        r(bx + bw - 10, by + 3, 7, 7, OUT); r(bx + bw - 9, by + 4, 5, 5, '#ffd93d'); r(bx + bw - 7, by + 6, 1, 1, OUT);
      }
      if (lv >= 2) {
        // crane arm with a hanging crate
        const px = bx + bw + 6;
        r(px, GY - 40, 2, 40, '#ffd93d');
        for (let y = GY - 38; y < GY; y += 4) r(px, y, 2, 1, '#2b1a12');
        r(px - 22, GY - 42, 30, 2, '#ffd93d');
        for (let X = px - 20; X < px + 8; X += 4) r(X, GY - 42, 1, 2, '#2b1a12');
        A.push({ t: 'hook', x: px - 14, y: GY - 40 });
      }
    },

    market(env, s, lv) {
      const { r, box, A, R } = env;
      if (lv === 0) {
        box(s.x + 8, GY - 9, 14, 9, '#8f5b43');
        r(s.x + 9, GY - 6, 12, 1, '#5a3726');
        r(s.x + 25, GY - 14, 1, 14, '#5a3726');
        A.push({ t: 'lantern', x: s.x + 24, y: GY - 17 });
        sign(env, s.x + 40);
        return;
      }
      const awn = [['#ff3d8b', '#fff1d6'], ['#2ee6ff', '#fff1d6'], ['#ffd93d', '#fff1d6']];
      const sw = 18, x0 = s.x + Math.floor((s.w - lv * (sw + 2)) / 2);
      for (let i = 0; i < lv; i++) {
        const sx = x0 + i * (sw + 2);
        r(sx + 1, GY - 22, 1, 22, '#5a3726'); r(sx + sw - 2, GY - 22, 1, 22, '#5a3726');
        box(sx, GY - 9, sw, 9, '#8f5b43');
        // goods on the counter
        for (let p = 2; p < sw - 2; p += 3) r(sx + p, GY - 11, 2, 2, ['#e8352e', '#ffd93d', '#7dffb0', '#2ee6ff', '#ff9ec4'][Math.floor(R() * 5)]);
        // striped awning with a scalloped edge
        for (let p = 0; p < sw; p++) r(sx + p, GY - 25, 1, 4, awn[i][Math.floor(p / 3) % 2]);
        for (let p = 0; p < sw; p += 3) r(sx + p + 1, GY - 21, 1, 1, awn[i][0]);
        r(sx - 1, GY - 26, sw + 2, 1, OUT);
      }
      if (lv >= 2) {
        // neon sign
        const nw = lv * (sw + 2) - 8, nx = x0 + 3;
        r(nx - 1, GY - 36, nw + 2, 8, OUT);
        A.push({ t: 'neon', x: nx, y: GY - 35, w: nw, h: 6, c: '#ff3d8b', p: 0.5, bars: true });
      }
      if (lv >= 3) {
        // string lights across the stalls
        for (let X = x0 - 2; X < x0 + lv * (sw + 2); X += 4) {
          const sag = Math.round(2 * Math.sin(((X - x0) / (lv * (sw + 2))) * Math.PI));
          A.push({ t: 'bulb', x: X, y: GY - 28 + sag, i: X });
        }
      }
    },
  };

  // the recycling plant shows up as a junk capsule machine on the street
  DRAW.recycle = (env, s, lv) => {
    if (lv === 0) return;
    const { r, box, A } = env;
    const X = s.x, B = GY + 6; // feet
    box(X, B - 9, 12, 9, '#c0392b');
    r(X + 2, B - 6, 8, 3, OUT); r(X + 3, B - 5, 6, 1, '#1b1630'); // prize slot
    r(X + 9, B - 8, 2, 2, '#ffd93d'); // the handle
    // glass dome full of capsules
    r(X + 1, B - 19, 10, 10, OUT);
    r(X + 2, B - 18, 8, 8, '#9ef2ff');
    const caps = ['#ff3d8b', '#ffd93d', '#2ee6ff', '#7dffb0', '#ffffff', '#ff8a2b'];
    [[3, -12], [6, -12], [4, -14], [7, -15], [3, -16], [6, -17]].forEach(([dx, dy], i) => { r(X + dx, B + dy, 2, 2, caps[i]); });
    r(X + 3, B - 18, 1, 3, '#e8fdff');
    r(X + 3, B - 20, 6, 1, OUT); r(X + 4, B - 21, 4, 1, '#c0392b');
    if (lv >= 2) { r(X - 1, B - 26, 14, 5, OUT); A.push({ t: 'gsign', x: X, y: B - 25 }); }
    if (lv >= 3) A.push({ t: 'gsparkle', x: X + 6, y: B - 22 });
  };

  // ---------------- animated layer ----------------
  function drawAnim(x, A, f) {
    const r = (X, Y, w, hh, c) => { x.fillStyle = c; x.fillRect(Math.round(X), Math.round(Y), Math.round(w), Math.round(hh)); };
    for (const a of A) {
      switch (a.t) {
        case 'lamp': {
          const on = Math.sin(f * 0.07 + a.p * 40) > -0.95;
          r(a.x - 1, a.y, 3, 1, on ? '#ffd93d' : '#5f6075');
          if (on) {
            const g = x.createRadialGradient(a.x + 0.5, a.y + 1, 0, a.x + 0.5, a.y + 1, 9);
            g.addColorStop(0, 'rgba(255,217,61,0.35)'); g.addColorStop(1, 'rgba(255,217,61,0)');
            x.fillStyle = g; x.fillRect(a.x - 9, a.y - 8, 19, 18);
          }
          break;
        }
        case 'win': {
          const lit = Math.sin(f * 0.013 + a.p * 50) > -0.55;
          r(a.x, a.y, a.w, a.h, lit ? a.c || '#ffd93d' : '#1b2a4a');
          if (lit) r(a.x, a.y, 1, 1, '#fff1d6');
          break;
        }
        case 'fire': {
          const k = f % 4;
          r(a.x + 1, a.y - 1 - (k % 2), 3, 2 + (k % 2), '#ff8a2b'); r(a.x + 2, a.y - 3 - (k >> 1), 1, 2, '#ffd93d');
          x.fillStyle = 'rgba(255,138,43,0.12)'; x.fillRect(a.x - 6, a.y - 8, 17, 12);
          break;
        }
        case 'blink': if (Math.floor(f * a.rate + a.p * 10) % 2) r(a.x, a.y, a.w, a.h, a.c); break;
        case 'neon': {
          const on = (Math.floor(f / 3) + Math.floor(a.p * 7)) % 23 !== 0;
          r(a.x, a.y, a.w, a.h, on ? a.c : '#3b1030');
          if (on) {
            if (a.bars) for (let X = a.x + 2; X < a.x + a.w - 2; X += 4) r(X, a.y + 2, 2, 2, '#fff1d6');
            else { r(a.x + 2, a.y + 2, a.w - 4, 1, '#fff1d6'); }
            x.fillStyle = 'rgba(255,61,139,0.15)'; x.fillRect(a.x - 3, a.y - 3, a.w + 6, a.h + 6);
          }
          break;
        }
        case 'grow': {
          const k = 0.55 + 0.25 * Math.sin(f * 0.08 + a.p * 9);
          x.globalAlpha = k; r(a.x, a.y, a.w, 1, a.c);
          x.globalAlpha = k * 0.18; r(a.x, a.y + 1, a.w, 5, a.c);
          x.globalAlpha = 1;
          break;
        }
        case 'drip': { const k = f % 12; if (k < 8) r(a.x, a.y + 1 + (k >> 1), 1, 1, '#2ee6ff'); break; }
        case 'siren': r(a.x, a.y, 1, 1, Math.floor(f / 4) % 2 ? '#e8352e' : '#3466d6'); break;
        case 'cross': {
          const c = Math.floor(f / 6) % 2 ? '#ff3d4f' : '#e8352e';
          r(a.x + a.n, a.y, a.n, a.n * 3, c); r(a.x, a.y + a.n, a.n * 3, a.n, c);
          x.fillStyle = 'rgba(255,61,79,0.12)'; x.fillRect(a.x - 3, a.y - 3, a.n * 3 + 6, a.n * 3 + 6);
          break;
        }
        case 'term': for (let l = 0; l < 3; l++) r(a.x, a.y + l * 2, 2 + ((f + l * 3) % 9), 1, l === 2 && f % 8 < 4 ? '#7dffb0' : '#2ee6ff'); break;
        case 'stripe': { const on = Math.floor(f / 2 + a.p * 12) % 6 === 0; r(a.x, a.y, a.w, 1, on ? '#9ef2ff' : '#2ee6ff'); break; }
        case 'beam': {
          const y = a.y1 - ((f * 2) % (a.y1 - a.y0));
          r(a.x - 1, y, 3, 3, '#9ef2ff');
          break;
        }
        case 'orb': {
          const pr = a.rad + Math.sin(f * 0.15) * 0.8;
          const g = x.createRadialGradient(a.x, a.y, 0, a.x, a.y, pr * 4);
          g.addColorStop(0, 'rgba(46,230,255,0.45)'); g.addColorStop(1, 'rgba(46,230,255,0)');
          x.fillStyle = g; x.fillRect(a.x - pr * 4, a.y - pr * 4, pr * 8, pr * 8);
          x.fillStyle = '#2ee6ff'; x.beginPath(); x.arc(a.x, a.y, pr, 0, Math.PI * 2); x.fill();
          x.fillStyle = '#e8fdff'; x.fillRect(Math.round(a.x - 1), Math.round(a.y - 1), 2, 2);
          if (a.ring) {
            // a ring of dots orbiting the orb
            for (let i = 0; i < 8; i++) {
              const ang = f * 0.06 + (i / 8) * Math.PI * 2;
              const rx = a.x + Math.cos(ang) * (pr + 7), ry = a.y + Math.sin(ang) * (pr + 7) * 0.35;
              r(rx, ry, 1, 1, Math.sin(ang) > 0 ? '#9ef2ff' : '#137a99');
            }
          }
          break;
        }
        case 'spark': if (f % 9 < 3) { for (let i = 0; i < 3; i++) r(a.x + ((f * 7 + i * 5) % 7) - 3, a.y - ((f + i * 2) % 4), 1, 1, i % 2 ? '#ffd93d' : '#fff1d6'); } break;
        case 'smoke': for (let i = 0; i < 4; i++) { const k = (f * 0.5 + i * 6) % 24; x.fillStyle = `rgba(169,159,201,${0.35 * (1 - k / 24)})`; x.fillRect(Math.round(a.x - 2 + Math.sin(k * 0.3 + i) * 2 + k * 0.3), Math.round(a.y - k), 3 + Math.floor(k / 8), 3); } break;
        case 'hook': {
          const sw = Math.round(Math.sin(f * 0.05) * 2);
          r(a.x + sw / 2, a.y, 1, 14, '#5f6075');
          r(a.x - 4 + sw, a.y + 14, 9, 7, OUT); r(a.x - 3 + sw, a.y + 15, 7, 5, '#c9a85a'); r(a.x - 3 + sw, a.y + 17, 7, 1, '#8f5b43');
          break;
        }
        case 'lantern': {
          const on = Math.sin(f * 0.3) > -0.8;
          r(a.x, a.y, 3, 4, OUT); r(a.x + 1, a.y + 1, 1, 2, on ? '#ffd93d' : '#8f5b43');
          if (on) { x.fillStyle = 'rgba(255,217,61,0.12)'; x.fillRect(a.x - 5, a.y - 4, 13, 12); }
          break;
        }
        case 'gsign': {
          const on = Math.floor(f / 6) % 4 !== 3;
          r(a.x, a.y, 12, 3, on ? '#ff3d8b' : '#5a1a3a');
          if (on) { for (let i = 0; i < 3; i++) r(a.x + 2 + i * 4, a.y + 1, 2, 1, '#ffe6f3'); }
          break;
        }
        case 'gsparkle': {
          const k = f % 24;
          if (k < 8) { const c = ['#ffffff', '#ffd93d', '#2ee6ff'][Math.floor(f / 24) % 3]; r(a.x + (k % 2 ? 3 : -4), a.y - (k >> 1), 1, 1, c); r(a.x - 1 + (f % 3), a.y - 2 - (k >> 2), 1, 1, '#ffffff'); }
          break;
        }
        case 'bulb': r(a.x, a.y, 1, 1, ['#ff3d8b', '#ffd93d', '#2ee6ff', '#7dffb0'][(Math.floor(f / 5) + a.i) % 4]); break;
        default: break;
      }
    }
  }

  // ---------------- walkers (a few of the crew strolling around) ----------------
  const sprW = (id) => (ANIMALS.has(id) ? 2 : 3); // overlay pixels per sprite pixel
  function mkWalkers(ids, R) {
    // only a handful come out at a time; who is out changes every visit
    const pool = ids.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const n = Math.min(pool.length, 3 + Math.floor(R() * 3));
    const picked = pool.slice(0, n);
    // Pixe and Mike like to come out together (Mike would never admit it)
    if (picked.includes('pixe') && !picked.includes('mike') && ids.includes('mike') && R() < 0.6) picked[picked[0] === 'pixe' ? picked.length - 1 : 0] = 'mike';
    const ws = picked.map((id, i) => ({
      id, x: 10 + R() * (W - 40), y: GY + 2 + Math.floor(R() * 12), dir: R() < 0.5 ? -1 : 1,
      spd: 0.25 + R() * 0.3, rest: Math.floor(R() * 40), seed: i, w: (29 * sprW(id)) / FG, talk: 0,
    }));
    const pixe = ws.find((w) => w.id === 'pixe'), mike = ws.find((w) => w.id === 'mike');
    if (pixe && mike) { mike.x = Math.min(W - 24, pixe.x + 16); mike.y = Math.min(GY + 13, pixe.y + 2); }
    return ws;
  }
  function stepWalkers(ws, f, R) {
    const pixe = ws.find((w) => w.id === 'pixe');
    for (const w of ws) {
      if (w.talk > 0) { w.talk--; continue; }
      if (w.rest > 0) { w.rest--; continue; }
      // Mike never strays far from Pixe (and pretends not to care)
      if (w.id === 'mike' && pixe && Math.abs(w.x - pixe.x) > 30) w.dir = pixe.x > w.x ? 1 : -1;
      w.x += w.dir * w.spd;
      if (w.x < 2) { w.x = 2; w.dir = 1; }
      if (w.x > W - w.w - 2) { w.x = W - w.w - 2; w.dir = -1; }
      if (R() < 0.012) { w.rest = 20 + Math.floor(R() * 60); if (R() < 0.5) w.dir *= -1; }
    }
  }
  const spriteH = (w) => { const cv = G.sprCanvas(w.id, false, true); return cv ? (cv.height * sprW(w.id)) / FG : 20; };
  function drawWalkers(x, ws, f) {
    x.clearRect(0, 0, W * FG, H * FG);
    x.imageSmoothingEnabled = false;
    for (const w of ws.slice().sort((a, b) => a.y - b.y)) {
      const cv = G.sprCanvas(w.id, w.dir < 0, true);
      if (!cv) continue;
      const k = sprW(w.id);
      const walking = w.rest <= 0 && !(w.talk > 0);
      const bob = walking && Math.floor(f / 3 + w.seed) % 2 ? 2 : 0;
      const X = Math.round(w.x * FG), Y = Math.round(w.y * FG);
      x.fillStyle = 'rgba(0,0,0,0.35)';
      x.fillRect(X + 4 * k, Y - 1, cv.width * k - 8 * k, 3);
      x.drawImage(cv, X, Y - cv.height * k - bob, cv.width * k, cv.height * k);
    }
  }
  // speech bubbles above the walkers
  function say(wrap, w, text, ms) {
    const el = h('div', { class: 'town-say' }, text);
    wrap.appendChild(el);
    w.talk = Math.ceil(ms / 100) + 4;
    const place = () => { el.style.left = (w.x + w.w / 2) * SC + 'px'; el.style.top = (w.y - spriteH(w)) * SC - 4 + 'px'; };
    place();
    const iv = setInterval(() => { if (!el.isConnected) { clearInterval(iv); return; } place(); }, 100);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); clearInterval(iv); }, 300); }, ms);
  }
  function chatter(wrap, ws, R) {
    if (!ws.length || wrap.querySelector('.town-say')) return;
    const here = (id) => ws.find((w) => w.id === id);
    const pairs = (G.TOWN_PAIRS || []).filter((p) => here(p[0]) && here(p[2]));
    if (pairs.length && R() < 0.4) {
      const p = pairs[Math.floor(R() * pairs.length)];
      const a = here(p[0]), b = here(p[2]);
      say(wrap, a, p[1], 2600);
      b.talk = 60;
      setTimeout(() => { if (wrap.isConnected) say(wrap, b, p[3], 2800); }, 2700);
      return;
    }
    const w = ws[Math.floor(R() * ws.length)];
    const lines = (G.TOWN_LINES || {})[w.id];
    if (lines) say(wrap, w, lines[Math.floor(R() * lines.length)], 3000);
  }

  // ---------------- level-up sparkles ----------------
  function drawSparkles(x, sp, f) {
    for (const s of sp) {
      if (f > s.until) continue;
      for (let i = 0; i < 10; i++) {
        const k = (f * 0.6 + i * 7) % 30;
        const sx = s.x + ((i * 37) % s.w), sy = GY - 4 - k * 1.6;
        const c = i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#ffd93d' : '#b8ff3d';
        x.fillStyle = c;
        x.fillRect(Math.round(sx), Math.round(sy), 1, 1);
        if (k < 12) { x.fillRect(Math.round(sx - 1), Math.round(sy), 3, 1); x.fillRect(Math.round(sx), Math.round(sy - 1), 1, 3); }
      }
    }
  }

  // Builds the town widget. Returns a DOM element (672x232).
  UI.town = () => {
    const m = G.meta;
    const fac = m.fac;
    const total = G.FAC_ORDER.reduce((s, k) => s + (fac[k] || 0), 0);
    const maxTotal = G.FAC_ORDER.reduce((s, k) => s + G.FAC[k].lv.length, 0);

    const stat = document.createElement('canvas');
    stat.width = W; stat.height = H;
    const A = [];
    drawStatic(stat.getContext('2d'), fac, total, A);

    const cv = h('canvas', { class: 'town-cv px', width: W, height: H });
    const x = cv.getContext('2d');
    const fg = h('canvas', { class: 'town-fg px', width: W * FG, height: H * FG });
    const xf = fg.getContext('2d');
    const wrap = h('div', { class: 'town' }, cv, fg);
    wrap.appendChild(h('div', { class: 'town-ttl' }, 'クレイドルの街', h('span', null, ` 発展度 ${total}/${maxTotal}`)));

    // hover / click hotspots for each facility
    const ups = [];
    const seen = m.townSeen;
    for (const k of G.FAC_ORDER) {
      const s = SLOTS[k], lv = fac[k] || 0, f = G.FAC[k];
      if (!s || (s.small && lv === 0)) continue;
      const nx = lv < f.lv.length ? `<div class="tf">次：${f.lv[lv].e}</div>` : '<div class="tf">MAX</div>';
      const box = s.small ? { left: s.x * SC + 'px', width: s.w * SC + 'px', top: (GY - 22) * SC + 'px', height: 28 * SC + 'px', zIndex: 2 }
        : { left: s.x * SC + 'px', width: s.w * SC + 'px', top: '24px', bottom: '24px' };
      wrap.appendChild(h('div', {
        class: 'town-hot', style: box,
        'data-tip': `<div class="tn">${f.n} Lv${lv}${lv === 0 ? '（建設予定地）' : ''}</div>${f.d}${nx}${s.small ? '<div class="tf">クリックでカプセル機へ</div>' : ''}`,
        onclick: () => { G.A.sfx('click'); UI.base(s.small ? 'gacha' : 'fac'); },
      }));
      if (seen && lv > (seen[k] || 0) && !s.small) ups.push(k);
    }
    m.townSeen = Object.assign({}, fac);
    G.saveMeta();

    const R = lcg(Date.now() & 0xffff);
    const walkers = mkWalkers(m.unlocked.filter((id) => G.SPR[id]), R);
    let frame = 0;
    let nextTalk = 25 + Math.floor(R() * 30);
    // tap someone to hear what they have to say
    wrap.addEventListener('click', (e) => {
      const rc = wrap.getBoundingClientRect();
      const px = ((e.clientX - rc.left) / rc.width) * W, py = ((e.clientY - rc.top) / rc.height) * H;
      const hit = walkers.slice().sort((a, b) => b.y - a.y).find((w) => px >= w.x - 2 && px <= w.x + w.w + 2 && py <= w.y + 3 && py >= w.y - spriteH(w) - 2);
      if (!hit) return;
      e.stopPropagation();
      wrap.querySelectorAll('.town-say').forEach((el) => el.remove());
      const lines = (G.TOWN_LINES || {})[hit.id];
      if (lines) { G.A.sfx('click'); say(wrap, hit, lines[Math.floor(Math.random() * lines.length)], 3000); }
    }, true);
    const sparkles = ups.map((k) => ({ x: SLOTS[k].x + 2, w: SLOTS[k].w - 4, until: 70 }));
    ups.forEach((k, i) => setTimeout(() => {
      if (!wrap.isConnected) return;
      const s = SLOTS[k];
      const el = h('div', { class: 'town-up', style: { left: (s.x + s.w / 2) * SC + 'px' } }, `${G.FAC[k].n} Lv${fac[k]}!`);
      wrap.appendChild(el);
      G.A.sfx('buff');
      setTimeout(() => el.remove(), 2600);
    }, 300 + i * 500));

    const tick = () => {
      if (!cv.isConnected && frame > 0) return;
      x.drawImage(stat, 0, 0);
      drawAnim(x, A, frame);
      stepWalkers(walkers, frame, R);
      drawWalkers(xf, walkers, frame);
      if (--nextTalk <= 0) { chatter(wrap, walkers, R); nextTalk = 45 + Math.floor(R() * 50); }
      drawSparkles(x, sparkles, frame);
      frame++;
      setTimeout(tick, 100);
    };
    tick();
    return wrap;
  };
})();
