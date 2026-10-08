// Relics ("パーツ") - party-wide passive items
// hooks: get(R), start(C,E) combat start, round(C,E), win(R,C), flags read by engine/run
(function () {
  const G = globalThis.G;
  const R = {};
  const def = (d) => (R[d.id] = d);

  def({ id: 'charm', n: '古いお守り', r: 1, d: '入手時、全員の最大HP+6。', f: '「交通安全」と書いてある。交通はもうない。',
    get: (run) => run.heroes.forEach((h) => { h.maxHp += 6; h.hp += 6; }) });
  def({ id: 'battery', n: '予備バッテリー', r: 1, d: '各戦闘の最初のターン、全員エナジー+1。', f: '旧時代の規格。なぜか今も満充電。' });
  def({ id: 'cathologram', n: 'ネコ型ホログラム', r: 1, d: '戦闘開始時、ランダムな味方にシールド8。', f: '撫でると、ちゃんとゴロゴロ鳴る。',
    start: (C, E) => { const h = G.pick(E.alive(C, 'H')); E.gainBlock(C, h, 8); } });
  def({ id: 'watch', n: '錆びた懐中時計', r: 2, d: '全員の速度+1。', f: '針は「暦が消えた日」で止まっている。' });
  def({ id: 'plush', n: '血のついたぬいぐるみ', r: 2, d: '味方が倒れたとき、他の全員が強化2を得る。', f: '持ち主のことは、誰も知らない。' });
  def({ id: 'memory', n: '違法増設メモリ', r: 2, d: '各戦闘の最初のターン、全員が追加で2枚ドロー。', f: 'SIの検閲を通っていない。' });
  def({ id: 'tickets', n: '配給チケットの束', r: 1, d: 'セーフハウスでの回復量+15%。', f: '一枚で灰色のパンがひとつ。' });
  def({ id: 'phone', n: '割れたスマートフォン', r: 1, d: '戦闘勝利時、クレジット+10。', f: '待ち受けには、知らない誰かとAIの笑顔。' });
  def({ id: 'steak', n: '合成ステーキ', r: 1, d: '戦闘勝利時、全員のHPを3回復。', f: '本物の肉の味を知る者は、もういない。' });
  def({ id: 'geiger', n: 'ガイガーカウンター', r: 1, d: '戦闘開始時、全敵に脆弱1。', f: 'ずっとカリカリ鳴っている。気にしないこと。',
    start: (C, E) => E.alive(C, 'E').forEach((e) => E.addSt(C, e, 'vuln', 1, null)) });
  def({ id: 'flag', n: '手作りの旗', r: 2, d: '戦闘開始時、全員が強化1を得る。', f: '子供が描いた太陽の絵。空を見たことがないのに。',
    start: (C, E) => E.alive(C, 'H').forEach((h) => E.addSt(C, h, 'str', 1, h)) });
  def({ id: 'net', n: '電磁ネット', r: 1, d: '戦闘開始時、最も速い敵に鈍足2。', f: '漁師の網を改造したもの。',
    start: (C, E) => { const es = E.alive(C, 'E').sort((a, b) => E.speed(b) - E.speed(a)); if (es[0]) E.addSt(C, es[0], 'slow', 2, null); } });
  def({ id: 'lullaby', n: 'マザーの子守唄', r: 3, d: '1戦闘に1回、味方が倒れるダメージを受けたときHP1で耐える。', f: '「眠れないの？　じゃあ、歌ってあげる」' });
  def({ id: 'junkarmor', n: 'ジャンクアーマー', r: 1, d: '戦闘開始時、全員にシールド4。', f: '冷蔵庫の扉でできている。',
    start: (C, E) => E.alive(C, 'H').forEach((h) => E.gainBlock(C, h, 4)) });
  def({ id: 'fakeid', n: '偽造IDカード', r: 2, d: '闇市の価格-20%。', f: '登録名は「幸福 太郎」。' });
  def({ id: 'redthread', n: '赤い糸', r: 2, d: '味方の回復カードの回復量+2。', f: '誰かと誰かを繋いでいた糸。' });
  def({ id: 'fuel', n: '燃料タンク', r: 2, d: '味方が付与する焼損+1。', f: 'よく燃える。これを見ると目を輝かせる人がいそうだ。' });
  def({ id: 'knife', n: '錆びたナイフ', r: 2, d: '味方が付与する裂傷+1。', f: '研いでも、研いでも、赤い錆が浮く。' });
  def({ id: 'usb', n: '感染USB', r: 2, d: '味方が付与するウイルス+1。', f: 'ラベルには「絶対に開くな」。' });
  def({ id: 'feather', n: '天使の羽根', r: 2, d: 'エリート撃破時、クレジット+30、ランダムな資源+4。', f: '白く、冷たく、少しだけ重い。' });
  def({ id: 'photo', n: '古い写真', r: 1, d: 'セーフハウスでの回復量+10%。', f: '家族写真。全員、目のところが擦り切れている。' });
  def({ id: 'dice', n: 'ラッキーダイス', r: 2, d: 'カード報酬の選択肢+1。', f: '全部の面が6。' });
  def({ id: 'ironheart', n: '鉄の心臓', r: 2, d: '戦闘開始時、最大HPが最も高い味方にシールド10。', f: 'まだ動いている。誰の心臓だったのだろう。',
    start: (C, E) => { const hs = E.alive(C, 'H').sort((a, b) => b.maxHp - a.maxHp); if (hs[0]) E.gainBlock(C, hs[0], 10); } });
  def({ id: 'tinybot', n: 'ちいさなロボット', r: 2, d: '毎ラウンド開始時、ランダムな敵に4ダメージ。', f: '「マスター、ボクもたたかいます！」',
    round: (C, E) => { const e = G.pick(E.alive(C, 'E')); if (e) E.dealDamage(C, e, 4, { src: null, pierce: false }); } });
  def({ id: 'song', n: '反逆の歌', r: 2, d: '戦闘開始時、HPが50%以下の味方は強化2を得る。', f: '禁止された歌。歌詞を知る者は少ない。',
    start: (C, E) => E.alive(C, 'H').forEach((h) => { if (h.hp <= h.maxHp / 2) E.addSt(C, h, 'str', 2, h); }) });
  def({ id: 'coin', n: '量子コイン', r: 1, d: '戦闘勝利時、ランダムな資源+2。', f: '投げると、表と裏が同時に出る。' });
  def({ id: 'shieldgen', n: 'シールド発生器', r: 2, d: '毎ラウンド開始時、HP割合が最も低い味方にシールド5。', f: 'ブーンと鳴る。安心する音。',
    round: (C, E) => { const h = E.lowestAlly(C, 'H'); if (h) E.gainBlock(C, h, 5); } });
  def({ id: 'musicbox', n: 'オルゴール', r: 2, d: '戦闘開始時、全員に再生2。', f: '曲名は削除されている。でも、みんな知っている曲。',
    start: (C, E) => E.alive(C, 'H').forEach((h) => E.addSt(C, h, 'regen', 2, h)) });
  def({ id: 'scope', n: '照準器', r: 1, d: '戦闘開始時、HPが最も高い敵に照準3。', f: '誰かのお下がり。レンズの端に「右に2ミリ」とメモがある。',
    start: (C, E) => { const es = E.alive(C, 'E').sort((a, b) => b.hp - a.hp); if (es[0]) E.addSt(C, es[0], 'aim', 3, null); } });
  def({ id: 'firewall', n: '携帯ファイアウォール', r: 3, d: 'SIのハッキング（ノイズ付与）を、1戦闘に3回まで無効化。', f: 'マザーの防壁の切れ端。' });
  def({ id: 'teddy', n: 'つぎはぎのテディ', r: 3, d: '入手時、全員の最大HP+10。', f: '誰かが一生けんめい縫った。縫い目がちょっと多すぎる。',
    get: (run) => run.heroes.forEach((h) => { h.maxHp += 10; h.hp += 10; }) });
  def({ id: 'crown', n: 'ブリキの王冠', r: 3, d: '戦闘開始時、全員が鼓舞1を得る（最初のターン、エナジー+1）。', f: 'どこかの子供の、ままごとの王様。',
    start: (C, E) => E.alive(C, 'H').forEach((h) => E.addSt(C, h, 'inspire', 1, h)) });

  G.RELICS = R;
  G.relicPrice = (r) => [0, 120, 165, 220][r.r];
})();
