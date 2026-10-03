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
  const N = (n) => 440 * Math.pow(2, (n - 69) / 12); // midi -> Hz
  const SONGS = {
    title: { bpm: 84, bass: [45, 0, 45, 0, 41, 0, 41, 0, 43, 0, 43, 0, 40, 0, 40, 0], lead: [69, 72, 76, 72, 65, 69, 72, 69, 67, 71, 74, 71, 64, 67, 71, 67], lt: 'triangle', bt: 'sine' },
    base: { bpm: 72, bass: [38, 0, 0, 0, 34, 0, 0, 0, 36, 0, 0, 0, 33, 0, 0, 0], lead: [62, 0, 65, 69, 0, 65, 0, 0, 64, 0, 67, 72, 0, 69, 0, 0], lt: 'triangle', bt: 'sine' },
    map: { bpm: 96, bass: [40, 40, 0, 40, 43, 0, 43, 0, 38, 38, 0, 38, 36, 0, 38, 0], lead: [64, 0, 67, 0, 71, 0, 69, 67, 62, 0, 66, 0, 69, 0, 67, 66], lt: 'square', bt: 'triangle' },
    battle: { bpm: 138, bass: [33, 33, 45, 33, 33, 45, 33, 43, 31, 31, 43, 31, 31, 43, 31, 41], lead: [69, 0, 72, 69, 76, 0, 74, 72, 67, 0, 71, 67, 74, 72, 71, 67], lt: 'square', bt: 'sawtooth' },
    boss: { bpm: 150, bass: [28, 28, 40, 28, 29, 29, 41, 29, 28, 28, 40, 28, 26, 26, 38, 27], lead: [76, 75, 76, 0, 71, 0, 72, 74, 76, 0, 79, 77, 76, 74, 72, 71], lt: 'square', bt: 'sawtooth' },
    sanctum: { bpm: 66, bass: [40, 0, 0, 0, 0, 0, 0, 0, 36, 0, 0, 0, 0, 0, 0, 0], lead: [76, 0, 0, 79, 0, 0, 83, 0, 72, 0, 0, 76, 0, 0, 79, 0], lt: 'sine', bt: 'triangle' },
  };
  function startLoop() {
    const c = ensure(); if (!c) return;
    if (timer) clearInterval(timer);
    nextT = c.currentTime + 0.05;
    timer = setInterval(() => {
      const s = SONGS[curBgm];
      if (!s || !G.meta.settings.bgm || c.state !== 'running') return;
      const dt = 60 / s.bpm / 2;
      while (nextT < c.currentTime + 0.2) {
        const i = step % 16;
        const b = s.bass[i], l = s.lead[i];
        if (b) tone(s.bt, N(b), N(b), dt * 0.95, 0.5, nextT, bgmGain);
        if (l) tone(s.lt, N(l), N(l), dt * 0.8, 0.22, nextT, bgmGain);
        if ((curBgm === 'battle' || curBgm === 'boss') && i % 4 === 0) noise(0.05, 0.25, nextT, 4000, bgmGain);
        if ((curBgm === 'battle' || curBgm === 'boss') && i % 4 === 2) noise(0.03, 0.12, nextT, 7000, bgmGain);
        nextT += dt;
        step++;
      }
    }, 50);
  }
  A.bgm = (name) => {
    if (curBgm === name) return;
    curBgm = name;
    step = 0;
    if (ctx && ctx.state === 'running') startLoop();
  };
  A.stop = () => { curBgm = null; if (timer) clearInterval(timer); timer = null; };
})();
