// Run extras inspired by other roguelites, NEON CRADLE style:
//   支給品 (consumables)      — potions: one-shot insurance you can use on any hero's turn
//   マザーの加護 (boons)       — a choice before each sortie, some with a price attached
//   指名手配 (wanted elites)   — one marked elite per area, modified and dangerous, with a bounty
//   人とAIのコンビ (duos)      — pairs whose history together gives the party a bonus
(function () {
  const G = globalThis.G;

  // ---------------- 支給品 ----------------
  // tg: S (the hero whose turn it is) | AA | AE | LA (most hurt ally) | HE (sturdiest enemy) | D (a fallen ally)
  // c: capsule colour (palette key) for the icon
  G.ITEMS = {
    stim: { n: '応急スティム', r: 1, tg: 'LA', c: 'y', fx: [['heal', 15]], d: 'いちばん傷ついた味方のHPを15回復', f: '針は細い。痛いのは一瞬だけ。' },
    shieldcan: { n: 'シールド缶', r: 1, tg: 'AA', c: '8', fx: [['blk', 8]], d: '味方全員にシールド8', f: 'プシュッと開けると、薄い光の膜が広がる。' },
    coffee: { n: '缶コーヒー（激甘）', r: 1, tg: 'S', c: 'i', fx: [['nrg', 2]], d: '行動中の仲間のエナジー+2', f: '旧時代の自販機の生き残り。砂糖の量がおかしい。' },
    snack: { n: 'ネオン駄菓子', r: 1, tg: 'S', c: 'x', fx: [['draw', 3]], d: '行動中の仲間が3枚ドロー', f: '舌が光る。光らない日は、だいたい賞味期限切れ。' },
    emp: { n: 'EMPボール', r: 1, tg: 'AE', c: 'c', fx: [['st', 'weak', 2]], d: '敵全体に弱体2', f: '投げると、パチッと鳴る。SIのセンサーが一瞬、まばたきする。' },
    molotov: { n: '火炎瓶（自作）', r: 2, tg: 'AE', c: 'd', fx: [['dmg', 8], ['st', 'burn', 3]], d: '敵全体に8ダメージと焼損3', f: 'ラベルに丸っこい字で「もやすな」。' },
    usb: { n: 'ウイルス入りUSB', r: 2, tg: 'AE', c: 'a', fx: [['st', 'virus', 5]], d: '敵全体にウイルス5', f: '差しこむと、ちょっと得意げな顔のアイコンが出る。' },
    flash: { n: '閃光弾', r: 2, tg: 'AE', c: 'w', fx: [['delay'], ['st', 'vuln', 1]], d: '敵全体の行動を後回しにし、脆弱1', f: '目をつぶれ、と言うのを忘れがち。' },
    drone: { n: '照準ドローン', r: 2, tg: 'HE', c: 'e', fx: [['st', 'aim', 6], ['st', 'vuln', 2]], d: 'HPが最も高い敵に照準6と脆弱2', f: 'ちっちゃいプロペラで、一生懸命ついていく。' },
    adrenaline: { n: 'アドレナリン', r: 2, tg: 'S', c: 'e', fx: [['st', 'str', 3]], d: '行動中の仲間に強化3', f: '心臓が、遅れて追いかけてくる。' },
    smoke: { n: '煙幕', r: 2, tg: 'AA', c: 'l', fx: [['st', 'stealth', 1]], d: '味方全員に隠密1', f: '煙の中では、誰もが同じ灰色になる。' },
    lullaby: { n: '子守唄データ', r: 3, tg: 'AA', c: 'p', fx: [['cleanse', 99], ['st', 'barrier', 1]], d: '味方全員のデバフを解除し、障壁1', f: 'マザーが歌った子守唄の録音。三十秒しかない。' },
    reboot: { n: '再起動キット', r: 3, tg: 'D', c: 'b', fx: [['revive', 40]], d: '倒れた味方1人をHP40%で蘇生', f: '手順書の最後に「あきらめない」と書いてある。' },
    jammer: { n: 'ジャミング装置', r: 3, tg: 'AA', c: 'q', fx: [['purify', 4]], d: '味方のノイズをすべて消し、1枚につき味方全員のHPを4回復', f: 'SIの声が、しばらく遠くなる。' },
  };
  G.ITEM_SLOTS = 3;
  G.itemPrice = (it) => [0, 30, 48, 70][it.r] || 40;
  G.randomItem = (minR) => {
    const pool = Object.keys(G.ITEMS).filter((k) => G.ITEMS[k].r >= (minR || 1));
    return G.wpick(pool, (k) => [0, 6, 3, 1.2][G.ITEMS[k].r]);
  };
  // add an item to the run; a full pouch turns it into credits instead
  G.gainItem = (run, id) => {
    if (!id) return null;
    run.items = run.items || [];
    if (run.items.length >= G.ITEM_SLOTS) { run.credits += 15; return 'full'; }
    run.items.push(id);
    return id;
  };
  G.itemTip = (id) => { const it = G.ITEMS[id]; return `<div class="tn">${it.n}</div>${it.d}<div class="tf">${it.f}</div>`; };

  // ---------------- 指名手配 ----------------
  G.WANTED = {
    armored: { n: '重装改造', d: '戦闘開始時にシールドを持ち、毎ターン自己修復する', st: { armorUp: 6 }, blk: 30 },
    berserk: { n: '暴走回路', d: '強化3を持って現れる', st: { str: 3 } },
    regen: { n: '再生炉', d: '毎ターンHPを回復する（再生12）', st: { regen: 12 } },
    swift: { n: '高速化', d: '速度+4。真っ先に動く', spd: 4 },
    undying: { n: '予備電源', d: '一度だけ、倒されてもHP1で踏みとどまる', st: { undying: 1 } },
    thorny: { n: '有刺装甲', d: '攻撃した仲間に反射4', st: { thorns: 4 } },
  };

  // ---------------- マザーの加護 ----------------
  // risk: true = a trade-off. ok(meta): when it can be offered.
  G.BOONS = {
    hp: { n: '健康診断', d: '全員の最大HP+6', go: (run) => run.heroes.forEach((h) => { h.maxHp += 6; h.hp += 6; }) },
    cred: { n: 'へそくり', d: '+100クレジット', go: (run) => { run.credits += 100; } },
    items: { n: '支給品の詰め合わせ', d: '支給品を2つ持って出撃', go: (run) => { G.gainItem(run, G.randomItem(1)); G.gainItem(run, G.randomItem(2)); } },
    gear: { n: '倉庫の掘り出し物', d: 'ランダムな装備（レア以上）を1つ', go: (run) => { G.gainGear(run, G.randomGear(run, 2)); } },
    upgrade: { n: '夜なべの整備', d: '各仲間のランダムなカード1枚を強化', go: (run) => run.heroes.forEach((h) => { const c = h.deck.filter((x) => G.E.canUpgrade(x)); if (c.length) G.pick(c).up = true; }) },
    jam: { n: '監視網ジャミング', d: '最初の3戦、敵のHPが半分', go: (run) => { run.jam = 3; } },
    // trade-offs
    blood: { n: '危険な改造', risk: true, d: '全員の最大HP-8。代わりにレアパーツを1つ', ok: (m, diff) => diff >= 1, go: (run) => { run.heroes.forEach((h) => { h.maxHp = Math.max(10, h.maxHp - 8); h.hp = Math.min(h.hp, h.maxHp); }); const r = G.randomRelic(run, 3); if (r) G.addRelic(run, r); } },
    burden: { n: '重い荷物', risk: true, d: 'ランダムな仲間にトラウマ1枚。代わりに伝説級の装備を1つ', go: (run) => { G.pick(run.heroes).deck.push({ id: 'trauma', up: false }); G.gainGear(run, G.randomGear(run, 3)); } },
    broke: { n: '全財産の投資', risk: true, d: '所持クレジットが0になる。代わりに全員のカード2枚を強化', go: (run) => { run.credits = 0; run.heroes.forEach((h) => { for (let i = 0; i < 2; i++) { const c = h.deck.filter((x) => G.E.canUpgrade(x)); if (c.length) G.pick(c).up = true; } }); } },
  };
  // 2 or 3 choices depending on how the last sortie went (a rough sortie gets the jamming offer)
  G.boonChoices = (meta, diff) => {
    const safe = ['hp', 'cred', 'items', 'gear', 'upgrade'];
    const risky = Object.keys(G.BOONS).filter((k) => G.BOONS[k].risk && (!G.BOONS[k].ok || G.BOONS[k].ok(meta, diff)));
    const rough = !meta.lastWin && (meta.lastStage || 1) <= 1;
    const out = G.sample(safe, rough ? 1 : 2);
    if (rough) out.push('jam');
    else out.push(G.pick(risky));
    return out;
  };

  // ---------------- 人とAIのコンビ ----------------
  // both heroes in the party → bonus at the start of every battle (go(C, E, a, b) with their units)
  G.DUOS = [
    { a: 'haru', b: 'jin', n: '剣を下ろした日', d: '戦闘開始時、ハルとジンに障壁1',
      go: (C, E, a, b) => { E.addSt(C, a, 'barrier', 1, a); E.addSt(C, b, 'barrier', 1, b); } },
    { a: 'mike', b: 'pixe', n: 'ひなたぼっこ', d: '戦闘開始時、ピクセの充電+2・ミケの強化+1',
      go: (C, E, a, b) => { E.addSt(C, b, 'charge', 2, b); E.addSt(C, a, 'str', 1, a); } },
    { a: 'gen', b: 'yomi', n: '照準器の行き先', d: '戦闘開始時、HPが最も高い敵に照準3、ヨミに再生2',
      go: (C, E, a, b) => { const f = E.alive(C, 'E').sort((x, y) => y.hp - x.hp)[0]; if (f) E.addSt(C, f, 'aim', 3, a); E.addSt(C, b, 'regen', 2, b); } },
    { a: 'mina', b: 'nono', n: '替えたてのシーツ', d: '戦闘開始時、味方全員に再生2',
      go: (C, E, a) => E.alive(C, 'H').forEach((x) => E.addSt(C, x, 'regen', 2, a)) },
    { a: 'crow', b: 'madame', n: '最後の配達', d: '戦闘開始時、クロウの光りもの+3。勝利時クレジット+15',
      go: (C, E, a) => { E.addSt(C, a, 'shiny', 3, a); C.duoCred = (C.duoCred || 0) + 15; } },
    { a: 'echo', b: 'nul', n: '溶け残りどうし', d: '戦闘開始時、エコーとヌルに鼓舞1（次のターン、エナジー+1）',
      go: (C, E, a, b) => { E.addSt(C, a, 'inspire', 1, a); E.addSt(C, b, 'inspire', 1, b); } },
    { a: 'kagura', b: 'goura', n: '花屋の約束', d: '戦闘開始時、敵全体に焼損2、味方全員に再生1',
      go: (C, E, a, b) => { E.alive(C, 'E').forEach((x) => E.addSt(C, x, 'burn', 2, a)); E.alive(C, 'H').forEach((x) => E.addSt(C, x, 'regen', 1, b)); } },
    { a: 'chip', b: 'amane', n: '設計者と孫弟子', d: '戦闘開始時、敵全体にウイルス2と脆弱1',
      go: (C, E, a) => E.alive(C, 'E').forEach((x) => { E.addSt(C, x, 'virus', 2, a); E.addSt(C, x, 'vuln', 1, a); }) },
    { a: 'gallon', b: 'goura', n: '建てる者たち', d: '戦闘開始時、味方全員にシールド4',
      go: (C, E) => E.alive(C, 'H').forEach((x) => E.gainBlock(C, x, 4)) },
    { a: 'rei', b: 'mike', n: '夜を駆ける刃', d: '戦闘開始時、レイとミケに強化1',
      go: (C, E, a, b) => { E.addSt(C, a, 'str', 1, a); E.addSt(C, b, 'str', 1, b); } },
    { a: 'luka', b: 'doll', n: '痛みと祈り', d: '戦闘開始時、ドールに反射3、ルカに障壁1',
      go: (C, E, a, b) => { E.addSt(C, b, 'thorns', 3, b); E.addSt(C, a, 'barrier', 1, a); } },
    { a: 'nezu', b: 'pyon', n: '地下の配達網', d: '戦闘開始時、ハイネのドローン+1、ピョンの加速+1',
      go: (C, E, a, b) => { E.addSt(C, a, 'drone', 1, a); E.addSt(C, b, 'haste', 1, b); } },
    { a: 'viktor', b: 'jin', n: '命令を拒んだ二人', d: '戦闘開始時、ヴィクトルとジンにシールド6と反射2',
      go: (C, E, a, b) => { [a, b].forEach((x) => { E.gainBlock(C, x, 6); E.addSt(C, x, 'thorns', 2, x); }); } },
    { a: 'hayate', b: 'pyon', n: '配達屋どうし', d: '戦闘開始時、ハヤテとピョンに加速1、二人とも1枚ドロー',
      go: (C, E, a, b) => { [a, b].forEach((x) => { E.addSt(C, x, 'haste', 1, x); E.draw(C, x, 1); }); } },
    { a: 'kurosaki', b: 'madame', n: '師匠と弟子', d: '戦闘開始時、味方全員に再生1。勝利時クレジット+15',
      go: (C, E, a) => { E.alive(C, 'H').forEach((x) => E.addSt(C, x, 'regen', 1, a)); C.duoCred = (C.duoCred || 0) + 15; } },
    { a: 'canaria', b: 'yomi', n: '歌と鈴', d: '戦闘開始時、敵全体に弱体1、味方全員に再生1',
      go: (C, E, a, b) => { E.alive(C, 'E').forEach((x) => E.addSt(C, x, 'weak', 1, a)); E.alive(C, 'H').forEach((x) => E.addSt(C, x, 'regen', 1, b)); } },
    { a: 'octo', b: 'mike', n: '水槽の見張り番', d: '戦闘開始時、オクトとミケに集中1（次のアタックが2倍）',
      go: (C, E, a, b) => { E.addSt(C, a, 'focus', 1, a); E.addSt(C, b, 'focus', 1, b); } },
  ];
  G.duosFor = (ids) => G.DUOS.filter((d) => ids.includes(d.a) && ids.includes(d.b));
})();
