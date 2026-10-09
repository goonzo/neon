// Gear ("装備") - one slot per hero, kept for the whole run.
// r: 1-3 rarity, 4 = signature gear (hero-only, unlocked by bonds)
// fields (all optional):
//   hp     max HP bonus            spd    speed bonus
//   atk    attack damage bonus     heal   bonus to this hero's heals
//   blk    bonus to shields this hero grants
//   st     {status: v} gained at combat start
//   startBlk  shield at combat start
//   foe    [status, v, 'all'|'high'] applied to enemies at combat start
//   ally   [status, v] applied to every ally at combat start
//   onHit  [status, v] applied to the target whenever this hero's attack lands
//   turnHeal  heal self at the start of each own turn
//   nrg / draw  extra energy / cards on the first turn
//   winCred credits after each won combat
(function () {
  const G = globalThis.G;
  const GEAR = {};
  const def = (d) => (GEAR[d.id] = d);

  // ---------------- common ----------------
  def({ id: 'pipe', n: '鉄パイプ', r: 1, atk: 1, d: '攻撃ダメージ+1', f: '人類最古の武器、の、だいぶ後継機。' });
  def({ id: 'vest', n: '防弾ベスト', r: 1, hp: 8, d: '最大HP+8', f: '前の持ち主の名前が、マジックで書いてある。' });
  def({ id: 'shoes', n: 'ランニングシューズ', r: 1, spd: 2, d: '速度+2', f: '片方だけ、靴ひもが蛍光ピンク。' });
  def({ id: 'toolbelt', n: '工具ベルト', r: 1, blk: 2, d: 'このキャラが付与するシールド+2', f: 'ガムテープは万能。' });
  def({ id: 'pouch', n: '救急ポーチ', r: 1, heal: 2, d: 'このキャラの回復量+2', f: '中身の半分は絆創膏。残りの半分も絆創膏。' });
  def({ id: 'goggles', n: '暗視ゴーグル', r: 1, foe: ['aim', 3, 'high'], d: '戦闘開始時、HPが最も高い敵に照準3', f: '世界が緑色に見える。' });
  def({ id: 'potlid', n: '鍋のふたの盾', r: 1, startBlk: 7, d: '戦闘開始時、シールド7', f: '今夜のスープは、ふたなしで。' });
  def({ id: 'scarf', n: '赤いマフラー', r: 1, hp: 4, spd: 1, d: '最大HP+4、速度+1', f: 'ヒーローはマフラーを巻くもの、らしい。' });
  def({ id: 'candy', n: '飴玉の缶', r: 1, turnHeal: 2, d: 'ターン開始時、HPを2回復', f: 'ハッカ味だけが最後まで残る。' });
  // ---------------- uncommon ----------------
  def({ id: 'taser', n: 'スタンガン', r: 2, onHit: ['weak', 1], d: '攻撃ヒット時、対象に弱体1', f: 'バチッ。' });
  def({ id: 'needle', n: '毒針', r: 2, onHit: ['virus', 1], d: '攻撃ヒット時、対象にウイルス1', f: '針の中身は、チップの自作ウイルス。' });
  def({ id: 'flint', n: '火打ち石', r: 2, onHit: ['burn', 1], d: '攻撃ヒット時、対象に焼損1', f: 'カグラが三つ持っていた。四つ目は誰も知らない。' });
  def({ id: 'razor', n: 'カミソリワイヤー', r: 2, onHit: ['bleed', 1], d: '攻撃ヒット時、対象に裂傷1', f: '指に巻くと危ない。とても危ない。' });
  def({ id: 'mirror', n: '割れた鏡', r: 2, st: { thorns: 3 }, d: '戦闘開始時、反射3', f: '映った自分が、少しだけ笑っている。' });
  def({ id: 'drink', n: 'エナジードリンク', r: 2, nrg: 1, draw: 1, d: '最初のターン、エナジー+1・1枚多くドロー', f: '翼は生えない。' });
  def({ id: 'cloak', n: '迷彩マント', r: 2, st: { stealth: 1 }, d: '戦闘開始時、隠密1', f: '背景がSIの広告柄。街に溶け込む。' });
  def({ id: 'exo', n: '強化外骨格', r: 2, hp: 5, atk: 1, d: '最大HP+5、攻撃ダメージ+1', f: '工事現場の払い下げ品。' });
  def({ id: 'beads', n: '祈りの数珠', r: 2, turnHeal: 3, d: 'ターン開始時、HPを3回復', f: 'ヨミが「いい子たちがついてる」と言っていた。' });
  def({ id: 'helmet', n: '防爆ヘルメット', r: 2, st: { barrier: 1 }, d: '戦闘開始時、障壁1', f: '「安全第一」。標語はまだ生きている。' });
  def({ id: 'smilemask', n: '笑顔の仮面', r: 2, atk: 3, hp: -8, d: '攻撃ダメージ+3、最大HP-8', f: '恭順者の仮面。外すと、少しだけ寂しくなる。' });
  // ---------------- rare ----------------
  def({ id: 'nano', n: 'ナノマシン注射器', r: 3, hp: 6, st: { regen: 4 }, d: '最大HP+6、戦闘開始時に再生4', f: '針は痛くない。痛くないのが、少し怖い。' });
  def({ id: 'qblade', n: '量子ブレード', r: 3, atk: 3, d: '攻撃ダメージ+3', f: '斬る前から、斬れている。' });
  def({ id: 'reactive', n: '反応装甲', r: 3, st: { fortify: 2 }, startBlk: 8, d: '戦闘開始時、シールド8と鋼鉄2', f: '叩かれるほど硬くなる。' });
  def({ id: 'oracle', n: '予知チップ', r: 3, st: { extraDraw: 1 }, d: '毎ターン、追加で1枚ドロー', f: 'SIの予測エンジンの欠片。三秒先までなら見える。' });
  def({ id: 'cape', n: '王者のマント', r: 3, st: { str: 2 }, d: '戦闘開始時、強化2', f: '裏地に「ブリキの王国」と刺繍がある。' });
  def({ id: 'wings', n: '機械の翼', r: 3, spd: 3, draw: 1, d: '速度+3、最初のターン1枚多くドロー', f: '飛べはしない。でも、飛べる気がする。' });
  def({ id: 'heart2', n: '第二の心臓', r: 3, hp: 12, turnHeal: 2, d: '最大HP+12、ターン開始時にHPを2回復', f: 'トクン、トクン。二つ分の鼓動。' });

  // ---------------- signature (bond Lv3) ----------------
  def({ id: 'sig_gallon', hero: 'gallon', n: '親方のヘルメット', r: 4, startBlk: 10, blk: 2, d: '戦闘開始時シールド10、付与するシールド+2', f: '「解体業組合」のステッカー。組合はもう、ない。' });
  def({ id: 'sig_pixe', hero: 'pixe', n: '迷子札', r: 4, hp: 6, st: { charge: 3 }, d: '最大HP+6、戦闘開始時に充電+3', f: '裏に飼い主の住所。その住所に、もう家はない。' });
  def({ id: 'sig_doll', hero: 'doll', n: '片方だけのリボン', r: 4, st: { thorns: 3 }, turnHeal: 2, d: '戦闘開始時に反射3、ターン開始時にHPを2回復', f: 'もう片方は、妹が持っている。' });
  def({ id: 'sig_mina', hero: 'mina', n: '父の聴診器', r: 4, heal: 3, d: 'ミナの回復量+3', f: 'まだ少し、父の手の温度が残っている気がする。' });
  def({ id: 'sig_nono', hero: 'nono', n: '最後のナースキャップ', r: 4, heal: 2, ally: ['regen', 1], d: '回復量+2、戦闘開始時に味方全員に再生1', f: '病棟の最後の看護師が、ノノにくれた。' });
  def({ id: 'sig_yomi', hero: 'yomi', n: '鈴の髪飾り', r: 4, hp: 4, st: { regen: 3 }, d: '最大HP+4、戦闘開始時に再生3', f: '鳴らすと、誰かが返事をする。' });
  def({ id: 'sig_crow', hero: 'crow', n: 'ガラクタの王冠', r: 4, st: { shiny: 3 }, winCred: 10, d: '戦闘開始時に光りもの+3、勝利時クレジット+10', f: 'ビール瓶のふたでできている。本人はとても気に入っている。' });
  def({ id: 'sig_rei', hero: 'rei', n: 'ネオン刀・紅月', r: 4, atk: 1, onHit: ['bleed', 1], d: '攻撃ダメージ+1、攻撃ヒット時に裂傷1', f: '刀身の赤は、ネオンの色。……ということにしている。' });
  def({ id: 'sig_gen', hero: 'gen', n: '相棒の照準器', r: 4, atk: 1, foe: ['aim', 4, 'high'], d: '攻撃ダメージ+1、戦闘開始時にHPが最も高い敵に照準4', f: '照準器のAIは「ゲンじい、右に2ミリ」としか言わない。' });
  def({ id: 'sig_kagura', hero: 'kagura', n: 'ガスマスク・改', r: 4, hp: 4, onHit: ['burn', 1], d: '最大HP+4、攻撃ヒット時に焼損1', f: 'マスクの内側に、小さな花の絵が描いてある。' });
  def({ id: 'sig_mike', hero: 'mike', n: '鈴つき首輪', r: 4, spd: 2, atk: 1, d: '速度+2、攻撃ダメージ+1', f: '鳴らないように、中に綿が詰めてある。' });
  def({ id: 'sig_chip', hero: 'chip', n: 'ステッカーだらけのノートPC', r: 4, draw: 2, foe: ['virus', 2, 'all'], d: '最初のターン2枚多くドロー、戦闘開始時に全敵にウイルス2', f: '一番大きいステッカーは「ばあちゃん」。' });
  def({ id: 'sig_nezu', hero: 'nezu', n: 'チュウの巣箱', r: 4, st: { drone: 2 }, hp: 4, d: '最大HP+4、戦闘開始時にドローン+2', f: '表札には「チュウ」が十二個。' });
  def({ id: 'sig_madame', hero: 'madame', n: '金の扇子', r: 4, st: { str: 1 }, winCred: 15, d: '戦闘開始時に強化1、勝利時クレジット+15', f: '開くと「商売繁盛」。閉じると「一期一会」。' });
  def({ id: 'sig_echo', hero: 'echo', n: 'あの人の写真', r: 4, hp: 4, nrg: 1, draw: 1, d: '最大HP+4、最初のターンにエナジー+1・1枚多くドロー', f: 'ピントが合っていない。でも、笑っているのはわかる。' });
  def({ id: 'sig_goura', hero: 'goura', n: '甲羅の盆栽', r: 4, hp: 8, ally: ['regen', 2], d: '最大HP+8、戦闘開始時に味方全員に再生2', f: '樹齢三百年の松。ゴウラより年上。' });
  def({ id: 'sig_pyon', hero: 'pyon', n: '遅刻しない懐中時計', r: 4, spd: 3, st: { haste: 2 }, d: '速度+3、戦闘開始時に加速2', f: '「急がなきゃ」が口ぐせになったのは、この時計のせい。' });
  def({ id: 'sig_octo', hero: 'octo', n: '水族館のバケツ', r: 4, hp: 6, atk: 1, d: '最大HP+6、攻撃ダメージ+1', f: '「ご自由にお使いください」。百年、律儀に使っている。' });

  def({ id: 'sig_jin', hero: 'jin', n: '自分で折った片翼', r: 4, hp: 8, startBlk: 8, st: { thorns: 2 }, d: '最大HP+8、戦闘開始時にシールド8と反射2', f: '羽根の一枚一枚に、識別番号が刻まれている。全部、削った。' });
  def({ id: 'sig_luka', hero: 'luka', n: '折れたロザリオ', r: 4, heal: 2, st: { barrier: 1 }, d: '回復量+2、戦闘開始時に障壁1', f: '祈る相手はいなくなった。祈る理由は増えた。' });
  def({ id: 'sig_haru', hero: 'haru', n: 'ソラの腕時計', r: 4, atk: 1, draw: 1, d: '攻撃ダメージ+1、最初のターン1枚多くドロー', f: '時刻表示はずっと狂っている。ソラいわく「わざと」。' });
  def({ id: 'sig_amane', hero: 'amane', n: '手書きの設計図', r: 4, draw: 2, foe: ['vuln', 1, 'all'], d: '最初のターン2枚多くドロー、戦闘開始時に全敵に脆弱1', f: '余白に「ごめんね」と、何度も書いては消した跡。' });
  def({ id: 'sig_viktor', hero: 'viktor', n: '外した治安バッジ', r: 4, hp: 8, st: { taunt: 1, thorns: 2 }, d: '最大HP+8、戦闘開始時に挑発1と反射2', f: '裏に、彼が守れなかった市民の名前が刻んである。' });
  def({ id: 'sig_hayate', hero: 'hayate', n: '親父の配達車のキー', r: 4, spd: 3, atk: 1, d: '速度+3、攻撃ダメージ+1', f: '鍵穴の合う車は、もうない。でも、毎朝エンジンをかける真似をする。' });
  def({ id: 'sig_kurosaki', hero: 'kurosaki', n: '古いシェイカー', r: 4, heal: 2, draw: 1, d: '回復量+2、最初のターン1枚多くドロー', f: '内側に、二人分のイニシャル。' });
  def({ id: 'sig_canaria', hero: 'canaria', n: '窓辺のハーモニカ', r: 4, nrg: 1, draw: 1, st: { regen: 2 }, d: '最初のターンにエナジー+1・1枚多くドロー、戦闘開始時に再生2', f: 'ある朝、あの窓の下に置いてあった。' });
  def({ id: 'sig_nul', hero: 'nul', n: '欠けた星のヘアピン', r: 4, draw: 1, st: { barrier: 1, bugnest: 1 }, d: '最初のターン1枚多くドロー、戦闘開始時に障壁1とバグ増殖1', f: '拾いものの髪飾り。欠けた星が、ずっと点滅している。' });
  G.GEAR = GEAR;
  G.GEAR_RC = ['', '#e8e8f0', '#2ee6ff', '#ff5ad1', '#ffd93d'];
  G.gearPrice = (g) => [0, 70, 110, 160, 0][g.r];
})();
