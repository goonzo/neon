// Tiny WebAudio chiptune: SFX + procedural BGM loops
(function () {
  const G = globalThis.G;
  const A = {};
  G.A = A;
  let ctx = null, master = null, bgmGain = null, sfxGain = null;
  let timer = null, curBgm = null, step = 0, nextT = 0;

  function ensure() {
    if (ctx) return ctx;
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    bgmGain = ctx.createGain(); bgmGain.gain.value = 0.16; bgmGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.5; sfxGain.connect(master);
    return ctx;
  }
  A.unlock = () => { const c = ensure(); if (c && c.state === 'suspended') c.resume(); if (curBgm && !timer) startLoop(); };

  function tone(type, f0, f1, dur, vol, when, dest) {
    const c = ensure(); if (!c) return;
    const t = when || c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(dest || sfxGain);
    o.start(t); o.stop(t + dur + 0.02);
  }
  let noiseBuf = null;
  function noise(dur, vol, when, hp, dest) {
    const c = ensure(); if (!c) return;
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = when || c.currentTime;
    const s = c.createBufferSource(); s.buffer = noiseBuf;
    const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 800;
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || sfxGain);
    s.start(t); s.stop(t + dur + 0.02);
  }

  const SFX = {
    click: () => tone('square', 880, 660, 0.05, 0.15),
    hover: () => tone('square', 1320, 1320, 0.02, 0.05),
    card: () => { tone('square', 520, 1040, 0.07, 0.15); },
    hit: () => { noise(0.12, 0.35, 0, 600); tone('square', 180, 60, 0.12, 0.25); },
    bighit: () => { noise(0.25, 0.5, 0, 300); tone('sawtooth', 120, 40, 0.25, 0.3); },
    block: () => { tone('triangle', 660, 990, 0.08, 0.25); },
    heal: () => { const c = ensure(); if (!c) return; [523, 659, 784].forEach((f, i) => tone('sine', f, f, 0.12, 0.2, c.currentTime + i * 0.05)); },
    buff: () => { tone('square', 440, 880, 0.12, 0.12); },
    debuff: () => { tone('square', 660, 220, 0.16, 0.12); },
    die: () => { noise(0.4, 0.3, 0, 200); tone('sawtooth', 400, 50, 0.4, 0.2); },
    coin: () => { const c = ensure(); if (!c) return; tone('square', 988, 988, 0.06, 0.12); tone('square', 1319, 1319, 0.12, 0.12, c.currentTime + 0.06); },
    win: () => { const c = ensure(); if (!c) return; [523, 659, 784, 1047].forEach((f, i) => tone('square', f, f, 0.18, 0.14, c.currentTime + i * 0.11)); },
    lose: () => { const c = ensure(); if (!c) return; [392, 330, 262, 196].forEach((f, i) => tone('triangle', f, f * 0.98, 0.3, 0.2, c.currentTime + i * 0.22)); },
    hack: () => { const c = ensure(); if (!c) return; for (let i = 0; i < 5; i++) tone('square', 200 + Math.random() * 1600, 100, 0.04, 0.08, c.currentTime + i * 0.03); },
    turn: () => tone('triangle', 784, 784, 0.06, 0.12),
    boss: () => { tone('sawtooth', 80, 60, 0.9, 0.25); noise(0.9, 0.12, 0, 120); },
  };
  A.sfx = (name) => {
    if (!G.meta || !G.meta.settings.sfx) return;
    const c = ensure(); if (!c || c.state !== 'running') return;
    if (SFX[name]) SFX[name]();
  };

  // ---- BGM ----
  // songs: { bpm, ch: [{ t: wave, v: volume, d: note length (steps), n: notes, echo }], dr: { k, s, h }, glitch }
  // notes are written as text: 'e4 g4*2 . c5' ('.' = rest, '*n' = hold n steps); every step is an 8th note
  const N = (n) => 440 * Math.pow(2, (n - 69) / 12); // midi -> Hz
  const NOTE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const P = (str) => {
    const out = [];
    for (const tok of str.trim().split(/[\s|]+/)) {
      if (!tok) continue;
      if (tok === '.') { out.push(0); continue; }
      const m = tok.match(/^([a-g])(#|b)?(\d)(?:\*(\d+))?$/);
      if (!m) { out.push(0); continue; }
      const n = 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
      const len = +(m[4] || 1);
      out.push(len > 1 ? [n, len] : n);
      for (let i = 1; i < len; i++) out.push(0);
    }
    return out;
  };
  A.P = P;
  // the original short loops
  const old = (bpm, bass, lead, lt, bt, dr) => ({ bpm, dr, ch: [{ t: bt, v: 0.5, d: 0.95, n: bass }, { t: lt, v: 0.22, d: 0.8, n: lead }] });
  const SONGS = {
    title: old(84, [45, 0, 45, 0, 41, 0, 41, 0, 43, 0, 43, 0, 40, 0, 40, 0], [69, 72, 76, 72, 65, 69, 72, 69, 67, 71, 74, 71, 64, 67, 71, 67], 'triangle', 'sine'),
    base: old(72, [38, 0, 0, 0, 34, 0, 0, 0, 36, 0, 0, 0, 33, 0, 0, 0], [62, 0, 65, 69, 0, 65, 0, 0, 64, 0, 67, 72, 0, 69, 0, 0], 'triangle', 'sine'),
    map: old(96, [40, 40, 0, 40, 43, 0, 43, 0, 38, 38, 0, 38, 36, 0, 38, 0], [64, 0, 67, 0, 71, 0, 69, 67, 62, 0, 66, 0, 69, 0, 67, 66], 'square', 'triangle'),
    battle: old(138, [33, 33, 45, 33, 33, 45, 33, 43, 31, 31, 43, 31, 31, 43, 31, 41], [69, 0, 72, 69, 76, 0, 74, 72, 67, 0, 71, 67, 74, 72, 71, 67], 'square', 'sawtooth', { k: 'k...', h: '..h.' }),
    boss: old(150, [28, 28, 40, 28, 29, 29, 41, 29, 28, 28, 40, 28, 26, 26, 38, 27], [76, 75, 76, 0, 71, 0, 72, 74, 76, 0, 79, 77, 76, 74, 72, 71], 'square', 'sawtooth', { k: 'k...', h: '..h.' }),
    sanctum: old(66, [40, 0, 0, 0, 0, 0, 0, 0, 36, 0, 0, 0, 0, 0, 0, 0], [76, 0, 0, 79, 0, 0, 83, 0, 72, 0, 0, 76, 0, 0, 79, 0], 'sine', 'triangle'),

    // ---- first area: one song per difficulty ----
    scrap_safe: { bpm: 88, dr: { k: 'k.......', h: '....h...' }, ch: [
      { t: 'triangle', v: 0.45, d: 0.95, n: P('c3 . g2 . c3 . g2 . | a2 . e2 . a2 . e2 . | f2 . c3 . f2 . c3 . | g2 . d3 . g2 . b2 .') },
      { t: 'triangle', v: 0.26, d: 0.85, n: P('e5*2 d5 c5 g4*2 . c5 | e5*2 g5 e5 d5*3 . | c5*2 a4 c5 f5*2 e5 d5 | d5*3 . g4*2 b4 d5') },
      { t: 'square', v: 0.05, d: 0.6, n: P('c4 e4 g4 e4 c4 e4 g4 e4 | a3 c4 e4 c4 a3 c4 e4 c4 | f3 a3 c4 a3 f3 a3 c4 a3 | g3 b3 d4 b3 g3 b3 d4 b3') },
    ] },
    scrap_hazard: { bpm: 116, dr: { k: 'k...k...', s: '....s...', h: 'h.h.h.h.' }, ch: [
      { t: 'sawtooth', v: 0.3, d: 0.8, n: P('a2 a2 a3 a2 a2 a3 a2 g2 | f2 f2 f3 f2 f2 f3 f2 e2 | d2 d2 d3 d2 d2 d3 d2 e2 | e2 e2 e3 e2 g#2 g#2 b2 e3') },
      { t: 'square', v: 0.2, d: 0.8, n: P('a4*2 . c5 e5*2 d5 c5 | f5*3 e5 d5*2 c5 a4 | d5*2 . f5 a5*2 g5 f5 | e5*4 g#4*2 b4 .') },
      { t: 'sine', v: 0.07, d: 0.9, n: P('e6*2 . . . . . . | . . . . . . . . | e6*2 . . . . . . | d#6*2 . . . . . .') },
    ] },
    scrap_abyss: { bpm: 100, glitch: 1, dr: { k: 'k..k..k.', h: '...h...h' }, ch: [
      { t: 'square', v: 0.32, d: 0.9, n: P('d2 . d2 . d#2 . d2 . | d2 . d2 . a1 . c2 .') },
      { t: 'sawtooth', v: 0.14, d: 0.8, n: P('a4 . g#4 . d5*2 . c#5 | . a4 . f4 e4*2 d4 . | a4 . g#4 . d5*2 . f5 | e5 . c#5 . a4*3 .') },
    ] },
    // ---- other areas ----
    eden: { bpm: 100, dr: { k: 'k...k...', h: '..h...h.' }, ch: [
      { t: 'triangle', v: 0.45, d: 0.9, n: P('f2 . f3 . c3 . f3 . | d2 . d3 . a2 . d3 . | bb1 . bb2 . f2 . bb2 . | c2 . c3 . g2 . e3 .') },
      { t: 'square', v: 0.17, d: 0.75, n: P('a4 c5 f5 . e5 c5 a4 . | b4 d5 f5 . a5*2 g5 f5 | d5*2 bb4 d5 f5*2 e5 d5 | c5*3 . e5 g5 b5*2') },
    ] },
    sunken: { bpm: 76, dr: { h: '.......h' }, ch: [
      { t: 'sine', v: 0.5, d: 0.95, n: P('e2*6 . . | c2*6 . . | a1*6 . . | b1*4 d2*2 f#2*2') },
      { t: 'triangle', v: 0.24, d: 0.9, echo: 3, n: P('e5 . b4 . g5 . f#5 e5 | . . e5 . b4 . g4 . | a4 . c5 . e5 . d5 c5 | b4*4 . . f#4 .') },
      { t: 'sine', v: 0.05, d: 0.5, n: P('e6 . . . b5 . . . | g5 . . . b5 . . .') },
    ] },
    broken: { bpm: 126, glitch: 1, dr: { k: 'k..k.k..', s: '....s...', h: 'hhhhhhhh' }, ch: [
      { t: 'square', v: 0.28, d: 0.7, n: P('c#2 c#3 c#2 c#3 b1 b2 b1 b2 | a1 a2 a1 a2 g#1 g#2 g#1 g#2') },
      { t: 'square', v: 0.18, d: 0.7, n: P('c#5 e5 g#5 c#6 b5 g#5 e5 . | a4 c#5 e5 a5 g#5*2 d#5 . | c#5 . c#5 e5 . e5 g#5 . | f#5 e5 d#5 b4 c5*2 . .') },
    ] },
    rim: { bpm: 70, ch: [
      { t: 'triangle', v: 0.45, d: 0.95, n: P('d2*8 | c2*8 | bb1*8 | a1*4 c2*4') },
      { t: 'sine', v: 0.26, d: 0.9, echo: 4, n: P('a4*2 d5 e5 f5*3 e5 | d5*2 c5 a4 g4*4 | f4*2 g4 a4 d5*2 c5 bb4 | a4*6 . .') },
      { t: 'triangle', v: 0.05, d: 0.6, n: P('d5 . a5 . d6 . a5 .') },
    ] },
    // ミドルライン: pleasant, hollow elevator music
    middle: { bpm: 96, dr: { k: 'k.......', h: '..h...h.' }, ch: [
      { t: 'triangle', v: 0.42, d: 0.9, n: P('c3 . . g2 c3 . . . | a2 . . e2 a2 . . . | d3 . . a2 d3 . . . | g2 . . d3 g2 . b2 .') },
      { t: 'sine', v: 0.24, d: 0.85, echo: 3, n: P('e5 . g5 b5*2 a5 g5 . | e5*2 c5 . a4*3 . | f5 . a5 c6*2 b5 a5 . | g5*3 f5 d5*3 .') },
      { t: 'triangle', v: 0.05, d: 0.6, n: P('c4 e4 g4 b4 c4 e4 g4 b4 | a3 c4 e4 g4 a3 c4 e4 g4 | d4 f4 a4 c5 d4 f4 a4 c5 | g3 b3 d4 f4 g3 b3 d4 f4') },
    ] },
    cradle: { bpm: 64, ch: [
      { t: 'triangle', v: 0.4, d: 0.9, n: P('g2 . d3 . g3 . d3 . | c3 . g3 . c4 . g3 . | b2 . d3 . g3 . d3 . | d3 . a3 . d4 . f#3 .') },
      { t: 'sine', v: 0.24, d: 0.9, echo: 3, n: P('b5 . d6 . b5 a5 g5*2 | a5 . b5 . a5 g5 e5*2 | d5 . g5 . b5 . a5 g5 | f#5*3 a5 g5*4') },
    ] },
    // ---- battles: one per difficulty ----
    battle_safe: { bpm: 124, dr: { k: 'k...k...', s: '....s...', h: '..h...h.' }, ch: [
      { t: 'triangle', v: 0.5, d: 0.8, n: P('d2 d3 d2 d3 a1 a2 a1 a2 | b1 b2 b1 b2 g1 g2 a1 a2') },
      { t: 'square', v: 0.2, d: 0.75, n: P('f#4 a4 d5 . e5 d5 a4 . | g4 b4 d5 . f#5 e5 d5 c#5 | f#4 a4 d5 . e5 f#5 g5 . | f#5 e5 d5 b4 a4*2 . .') },
    ] },
    battle_hazard: { bpm: 152, dr: { k: 'k.k.k.k.', s: '....s..s', h: 'hhhhhhhh' }, ch: [
      { t: 'sawtooth', v: 0.3, d: 0.75, n: P('e2 e2 e3 e2 f2 f2 f3 f2 | e2 e2 e3 e2 d2 d2 d3 c2') },
      { t: 'square', v: 0.2, d: 0.75, n: P('e5 . g5 f5 e5 . b4 c5 | d5 . f5 e5 d5 c5 b4 . | e5 . g5 b5 a5 g5 f5 e5 | f5*2 e5 d5 e5*4') },
    ] },
    battle_abyss: { bpm: 140, glitch: 1, dr: { k: 'k..kk..k', s: '....s...', h: '.h.h.h.h' }, ch: [
      { t: 'square', v: 0.3, d: 0.75, n: P('c2 c2 c#2 c2 c2 g1 f#1 g1 | c2 c2 c#2 c2 d#2 d2 c#2 c2') },
      { t: 'sawtooth', v: 0.13, d: 0.75, n: P('c5 . d#5 . f#5 . g5 f#5 | d#5 . c5 . b4 c5 d#5 . | c6 . b5 . f#5 . g5 . | d#5 d5 c#5 c5 b4*2 c5 .') },
    ] },
    elite: { bpm: 144, dr: { k: 'k..k..k.', s: '....s...', h: 'h.h.h.h.' }, ch: [
      { t: 'sawtooth', v: 0.3, d: 0.75, n: P('a1 a2 a1 a2 c2 c3 c2 c3 | d2 d3 d2 d3 e2 e3 e2 g#2') },
      { t: 'square', v: 0.2, d: 0.75, n: P('a4 . e5 . a5 g5 e5 . | f5 . e5 d5 e5 . b4 . | c5 . a4 c5 d5 . f5 . | e5*4 g#4*2 b4 .') },
    ] },
    sophia: { bpm: 132, dr: { k: 'k...k.k.', s: '....s...', h: '..h...h.' }, ch: [
      { t: 'sawtooth', v: 0.28, d: 0.8, n: P('c2 c3 c2 c3 ab1 ab2 ab1 ab2 | f1 f2 f1 f2 g1 g2 g1 b1') },
      { t: 'square', v: 0.19, d: 0.8, n: P('g5*2 c6 g5 eb5*2 d5 c5 | ab5*2 g5 f5 eb5*2 d5 eb5 | f5*2 ab5 f5 d5*2 c5 b4 | c5*3 g4 c5*2 d5 eb5') },
      { t: 'sine', v: 0.12, d: 0.95, n: P('c4*8 | ab3*8 | f3*8 | g3*8') },
    ] },
    noah: { bpm: 120, dr: { k: 'k.....k.', s: '....s...', h: 'h.h.h.h.' }, ch: [
      { t: 'triangle', v: 0.5, d: 0.85, n: P('g2 g3 g2 g3 eb2 eb3 eb2 eb3 | c2 c3 c2 c3 d2 d3 d2 f#2') },
      { t: 'square', v: 0.18, d: 0.8, n: P('bb4 . d5 . g5*2 f#5 g5 | a5 . g5 . eb5*2 d5 . | c5 . eb5 . g5*2 f5 eb5 | d5*4 f#4*2 a4 d5') },
      { t: 'sine', v: 0.07, d: 0.5, n: P('g6 . d6 . bb5 . d6 .') },
    ] },
  };
  A.SONGS = SONGS;

  function drum(kind, t) {
    if (kind === 'k') tone('sine', 150, 40, 0.12, 0.7, t, bgmGain);
    else if (kind === 's') { noise(0.09, 0.3, t, 1500, bgmGain); tone('triangle', 220, 160, 0.06, 0.2, t, bgmGain); }
    else if (kind === 'h') noise(0.03, 0.14, t, 7000, bgmGain);
  }
  let glitchOn = false;
  function startLoop() {
    const c = ensure(); if (!c) return;
    if (timer) clearInterval(timer);
    nextT = c.currentTime + 0.05;
    timer = setInterval(() => {
      const s = SONGS[curBgm];
      if (!s || !G.meta.settings.bgm || c.state !== 'running') return;
      const dt = 60 / s.bpm / 2;
      const glitch = s.glitch || glitchOn;
      while (nextT < c.currentTime + 0.2) {
        for (const ch of s.ch) {
          const v = ch.n[step % ch.n.length];
          if (!v) continue;
          let n = v, len = 1;
          if (Array.isArray(v)) { n = v[0]; len = v[1]; }
          let f = N(n);
          // 深淵: notes now and then drop out or jump to a wrong pitch
          if (glitch && Math.random() < 0.045) { if (Math.random() < 0.4) continue; f *= G.pick([0.5, 2, 1.5, 0.94, 1.06]); }
          tone(ch.t, f, f, dt * (len - 1 + (ch.d || 0.8)), ch.v, nextT, bgmGain);
          if (ch.echo) tone(ch.t, f, f, dt * 0.8, ch.v * 0.35, nextT + dt * ch.echo, bgmGain);
        }
        if (s.dr) for (const k of ['k', 's', 'h']) { const pat = s.dr[k]; if (pat && pat[step % pat.length] !== '.') drum(k, nextT); }
        if (glitch && Math.random() < 0.012) noise(0.04, 0.08, nextT, 2500 + Math.random() * 5000, bgmGain);
        nextT += dt;
        step++;
      }
    }, 50);
  }
  // opts.glitch: the 深淵 arrangement (random dropouts / wrong notes on any song)
  A.bgm = (name, opts) => {
    const g = !!(opts && opts.glitch);
    if (curBgm === name && glitchOn === g) return;
    if (curBgm !== name) step = 0;
    curBgm = name;
    glitchOn = g;
    if (ctx && ctx.state === 'running') startLoop();
  };
  // which song plays where during a run ('map' | 'battle' | 'elite' | 'boss')
  G.songFor = (run, where) => {
    const ar = G.area(run);
    const d = run.diff;
    if (where === 'battle') return ['battle_safe', 'battle', 'battle_hazard', 'battle_abyss'][d] || 'battle';
    if (where === 'elite') return 'elite';
    if (where === 'boss') return ar.bossSong || 'boss';
    if (ar.id === 'scrap') return ['scrap_safe', 'map', 'scrap_hazard', 'scrap_abyss'][d] || 'map';
    return ar.song || 'map';
  };
  A.runBgm = (run, where) => A.bgm(G.songFor(run, where || 'map'), { glitch: run.diff >= 3 });
  A.stop = () => { curBgm = null; if (timer) clearInterval(timer); timer = null; };
})();
