// Headless combat simulation: node test/sim.js [runs]
// Loads game logic into a VM context and plays battles with a greedy AI.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const files = ['js/core.js', 'js/data/heroes.js', 'js/data/enemies.js', 'js/data/relics.js', 'js/data/events.js', 'js/data/story.js', 'js/sprites.js', 'js/engine.js', 'js/run.js'];
const ctx = { console, Math, JSON, setTimeout, Promise };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const G = ctx.G;
const E = G.E;
if (process.env.HPACT) G.EK.hpAct = JSON.parse(process.env.HPACT);
if (process.env.DMGACT) G.EK.dmgAct = JSON.parse(process.env.DMGACT);
const deathAt = {};
if (process.env.FAC) for (const k in G.meta.fac) G.meta.fac[k] = +process.env.FAC;
const heroStat = {};

function scoreCard(C, u, card) {
  const d = E.cardDef(card);
  const hs = E.alive(C, 'H');
  const low = hs.reduce((a, b) => (b.hp / b.maxHp < a.hp / a.maxHp ? b : a));
  const incoming = E.alive(C, 'E').reduce((s, e) => { const i = E.intentInfo(C, e); return s + (i && i.dmg ? i.dmg * (i.hits || 1) * (i.aoe ? hs.length : 1) : 0); }, 0);
  let s = 1;
  for (const fx of d.fx) {
    if ((fx[0] === 'heal' || (fx[0] === 'spendHeal' && (u.st[fx[1]] || 0) >= 3)) && low.hp / low.maxHp < 0.7) s += 5;
    if (fx[0] === 'blk' && incoming > 6) s += 3;
    if (fx[0] === 'dmg' || fx[0] === 'dmgX' || fx[0] === 'drain') s += 4;
    if (fx[0] === 'st' && G.ST[fx[1]] && G.ST[fx[1]].pw) s += 6;
    if (fx[0] === 'revive') s += 10;
  }
  if (d.id === 'noise') s = 0.1;
  return s;
}

function pickTarget(C, u, card) {
  const d = E.cardDef(card);
  const vt = E.validTargets(C, u, card).map((id) => E.unit(C, id));
  if (!vt.length) return null;
  if (d.tg === 'E') { const aimed = d.t === 'A' && vt.find((x) => x.st.aim > 0); if (aimed) return aimed.uid; return vt.reduce((a, b) => (b.hp < a.hp ? b : a)).uid; }
  if (d.tg === 'A') return vt.reduce((a, b) => (b.hp / b.maxHp < a.hp / a.maxHp ? b : a)).uid;
  return vt[0].uid;
}

function heroTurn(C, u) {
  for (let g = 0; g < 30; g++) {
    if (C.over || u.dead) return;
    const opts = u.hand.map((c, i) => ({ c, i })).filter((o) => E.canPlay(C, u, o.c));
    if (!opts.length) return;
    opts.sort((a, b) => scoreCard(C, u, b.c) - scoreCard(C, u, a.c));
    const o = opts[0];
    if (scoreCard(C, u, o.c) < 0.5) return;
    const t = E.needsTarget(o.c) ? pickTarget(C, u, o.c) : null;
    if (!E.playCard(C, u, o.i, t)) return;
  }
}

function fight(run, group, kind) {
  const C = E.create(run, group, { kind });
  E.begin(C, { startBlock: G.meta.fac.core >= 2 ? 3 : 0 });
  let turns = 0;
  while (!C.over && turns < 400) {
    const u = E.advance(C);
    if (!u) break;
    if (u.side === 'H') heroTurn(C, u);
    else E.enemyAct(C, u);
    if (!C.over) E.endTurn(C, u);
    turns++;
    C.ev.length = 0;
  }
  return C;
}

const N = +process.argv[2] || 30;
const diff = +(process.argv[3] || 1);
const ids = G.HERO_ORDER;
let stats = { runs: 0, reachAct: [0, 0, 0, 0], wins: 0, errors: 0 };
for (let r = 0; r < N; r++) {
  // pick a party with one of each role-ish
  const byRole = (role) => ids.filter((id) => G.HEROES[id].role === role);
  const party = process.env.PARTY ? process.env.PARTY.split(',') : [G.pick(byRole('tank')), G.pick(byRole('healer')), G.pick(byRole('attacker')), G.pick(byRole('special'))];
  const run = G.newRun(diff, party);
  if (process.env.FAC >= 2) G.addRelic(run, G.randomRelic(run, 2));
  run.credits = 0;
  let alive = true;
  try {
    for (let act = 1; act <= 3 && alive; act++) {
      run.act = act;
      stats.reachAct[act]++;
      const plan = ['fight', 'fight', 'fight', 'elite', 'fight', 'rest', 'fight', 'elite', 'rest', 'boss'];
      for (let fi = 0; fi < plan.length; fi++) {
        run.floor = fi;
        const k = plan[fi];
        if (k === 'rest') { G.healParty(run, 0.35); continue; }
        const g = G.pickEncounter(run, k === 'fight' ? 'normal' : k);
        const C = fight(run, g, k);
        if (C.over !== 'win') { alive = false; const key = act + ':' + k; deathAt[key] = (deathAt[key] || 0) + 1; break; }
        G.applyCombatToRun(run, C);
        const rw = G.combatRewards(run, C, k);
        // take a random card for each hero, upgrade one card per fight
        rw.cards.forEach((cr) => { const h = run.heroes.find((x) => x.id === cr.hero); if (G.chance(0.7)) h.deck.push({ id: G.pick(cr.choices), up: false }); });
        if (rw.relic) G.addRelic(run, rw.relic);
        if (rw.relicChoices && rw.relicChoices.length) G.addRelic(run, rw.relicChoices[0]);
      }
      if (alive) G.healParty(run, 0.5);
      if (alive && act === 3) stats.wins++;
      if (act === 3 || !alive) party.forEach((id) => { const hs = heroStat[id] || (heroStat[id] = { n: 0, w: 0, acts: 0 }); hs.n++; hs.w += alive && act === 3 ? 1 : 0; hs.acts += alive ? act : act - 1; });
    }
  } catch (e) {
    stats.errors++;
    console.error('ERROR', party.join(','), e.stack);
    alive = false;
  }
  stats.runs++;
}
console.log(JSON.stringify(deathAt));
if (process.env.HEROES) for (const id of Object.keys(heroStat).sort((a, b) => heroStat[b].w / heroStat[b].n - heroStat[a].w / heroStat[a].n)) { const s = heroStat[id]; console.log(id.padEnd(8), G.HEROES[id].role.padEnd(9), 'runs', s.n, 'win%', Math.round((100 * s.w) / s.n), 'avgActs', (s.acts / s.n).toFixed(2)); }
console.log(`diff=${G.DIFF[diff].n} runs=${stats.runs} reach act1/2/3=${stats.reachAct.slice(1).join('/')} wins=${stats.wins} errors=${stats.errors}`);
