// Enemies (SI forces) & encounter tables
// move: {n:name, i:intent icon, tg:'E'|'AE'|'S'|'AA'|'LA', pick:'rand'|'low'|'high', fx:[...]}
(function () {
  const G = globalThis.G;
  const E = {};
  const def = (d) => (E[d.id] = d);

  // ====================== ACT 1: 第七廃棄区画 ======================
  def({ id: 'eye', n: '監視アイ', hp: 16, spd: 6, ai: 'seq', lore: 'SIの目。どこにでもいる。まばたきはしない。',
    moves: [
      { n: '凝視', i: 'deb', tg: 'E', fx: [['st', 'vuln', 2]] },
      { n: 'レーザー', i: 'atk', tg: 'E', fx: [['dmg', 6]] },
    ] });
  def({ id: 'sweeper', n: '清掃ボット', hp: 26, spd: 3, ai: 'rand', lore: '「不要なもの」を片付ける。人間も含む。',
    moves: [
      { n: '清掃', i: 'atk', tg: 'E', fx: [['dmg', 7]] },
      { n: '吸引', i: 'atk', tg: 'E', fx: [['dmg', 4], ['blk', 5, '@S']] },
    ] });
  def({ id: 'collab', n: '恭順者', hp: 28, spd: 4, ai: 'rand', lore: 'SIに従うことを選んだ人間。いつも微笑んでいる。',
    moves: [
      { n: '祝福を', i: 'buf', tg: 'AA', fx: [['st', 'str', 1]] },
      { n: '殴打', i: 'atk', tg: 'E', fx: [['dmg', 6]] },
      { n: '説得', i: 'hack', tg: 'E', fx: [['noise', 2]] },
    ] });
  def({ id: 'hound', n: 'ラストハウンド', hp: 22, spd: 8, ai: 'rand', scale: 5, lore: '錆びた番犬。昔は誰かの家族だったのかもしれない。',
    moves: [
      { n: '噛みつき', i: 'atk', tg: 'E', fx: [['dmg', 3, 2]] },
      { n: '唸る', i: 'buf', tg: 'S', fx: [['st', 'str', 2]] },
    ] });
  def({ id: 'ration', n: '配給ドローン', hp: 20, spd: 5, ai: 'seq', lore: '一日一回、灰色のパンを配る。受け取らない者には罰を。',
    moves: [
      { n: 'ビーム', i: 'atk', tg: 'E', fx: [['dmg', 5]] },
      { n: '配給', i: 'heal', tg: 'AA', fx: [['heal', 6]] },
    ] });
  def({ id: 'mimic', n: 'ゴミ箱ミミック', hp: 34, spd: 2, ai: 'seq', lore: 'ゴミ箱に擬態した捕獲機。中は意外と暖かい。',
    moves: [
      { n: 'ふたを閉じる', i: 'def', tg: 'S', fx: [['blk', 10]] },
      { n: 'のみこむ', i: 'atk', tg: 'E', pick: 'low', fx: [['dmg', 11]] },
    ] });
  // elites
  def({ id: 'guillotine', n: '処刑人ギロチン', hp: 100, spd: 4, ai: 'seq', elite: true, scale: 5, lore: '「不適合者」を処理する執行機。刃は毎朝研がれる。',
    moves: [
      { n: '研ぐ', i: 'buf', tg: 'S', fx: [['st', 'str', 2], ['blk', 8]] },
      { n: '断頭', i: 'atk', tg: 'E', pick: 'low', fx: [['dmg', 15]] },
      { n: '拘束', i: 'deb', tg: 'AE', fx: [['st', 'slow', 1], ['st', 'weak', 1]] },
      { n: '断頭', i: 'atk', tg: 'E', pick: 'low', fx: [['dmg', 15]] },
    ] });
  def({ id: 'captain', n: '笑う警備隊長', hp: 84, spd: 5, ai: 'seq', elite: true, scale: 5, lore: '恭順者の中でも特に「幸福」な男。笑顔の仮面は皮膚と癒着している。',
    moves: [
      { n: '号令', i: 'sum', tg: 'S', fx: [['summon', 'collab', 1]] },
      { n: '警棒', i: 'atk', tg: 'E', fx: [['dmg', 6, 2]] },
      { n: '鎮圧の盾', i: 'def', tg: 'AA', fx: [['blk', 10], ['st', 'str', 1]] },
    ] });
  def({ id: 'happy', n: 'おせわロイド・ハッピー', hp: 92, spd: 6, ai: 'seq', elite: true, scale: 5, lore: '迷子の子供を「保護」するアンドロイド。保護された子供が戻ったことはない。',
    moves: [
      { n: 'おままごと', i: 'atk', tg: 'E', fx: [['dmg', 4, 3]] },
      { n: '子守唄', i: 'deb', tg: 'AE', fx: [['st', 'weak', 2]] },
      { n: '抱っこ', i: 'atk', tg: 'E', pick: 'low', fx: [['drain', 11]] },
    ] });
  // boss
  def({ id: 'smile', n: '幸福管理端末 SMILE-01', hp: 240, spd: 4, ai: 'seq', boss: true, scale: 5, lore: '第七区画の幸福度を管理する端末。区画の幸福度は常に100%。',
    intro: '「ようこそ、未登録市民の皆さま。幸福度の測定を開始します。ニコッ」',
    moves: [
      { n: 'ニコニコ光線', i: 'atk', tg: 'AE', fx: [['dmg', 6]] },
      { n: '幸福の押し付け', i: 'hack', tg: 'AE', fx: [['noise', 1]] },
      { n: '清掃係、集合', i: 'sum', tg: 'S', fx: [['summon', 'sweeper', 2]] },
      { n: '笑顔の圧力', i: 'atk', tg: 'E', fx: [['dmg', 14], ['st', 'vuln', 2]] },
    ],
    phases: [
      { at: 0.5, say: '「エラー。エラー。笑顔ヲ、維持デキマセン。ニコ、ニコ、ニコ」', fx: [['st', 'str', 3]],
        moves: [
          { n: 'ハッピー・オーバードライブ', i: 'atk', tg: 'AE', fx: [['dmg', 4, 2]] },
          { n: '笑顔の圧力', i: 'atk', tg: 'E', fx: [['dmg', 14], ['st', 'vuln', 2]] },
          { n: '清掃係、集合', i: 'sum', tg: 'S', fx: [['summon', 'sweeper', 1]] },
          { n: '幸福の押し付け', i: 'hack', tg: 'AE', fx: [['noise', 1]] },
        ] },
    ] });

  // ====================== ACT 2: 管理都市ニューエデン ======================
  def({ id: 'addroid', n: '広告ドロイド', hp: 40, spd: 6, ai: 'rand', lore: '幸福な商品を宣伝し続ける。売っているものは存在しない。',
    moves: [
      { n: '新商品のお知らせ', i: 'hack', tg: 'E', fx: [['dmg', 5], ['noise', 2]] },
      { n: 'ジングル', i: 'deb', tg: 'AE', fx: [['st', 'weak', 1]] },
      { n: 'タイムセール！', i: 'atk', tg: 'E', fx: [['dmg', 9]] },
    ] });
  def({ id: 'police', n: '治安維持ユニット', hp: 56, spd: 4, ai: 'seq', lore: '都市の平和を守る。平和の定義はSIが決める。',
    moves: [
      { n: '鎮圧', i: 'atk', tg: 'E', fx: [['dmg', 12]] },
      { n: '盾構え', i: 'def', tg: 'S', fx: [['blk', 14]] },
      { n: '警告射撃', i: 'atk', tg: 'E', fx: [['dmg', 5, 2]] },
    ] });
  def({ id: 'citizen', n: '幸福な市民', hp: 40, spd: 5, ai: 'rand', lore: '笑顔の仮面をつけた市民。仮面の下を見た者はいない。本人も。',
    moves: [
      { n: '抱きしめる', i: 'atk', tg: 'E', fx: [['dmg', 7], ['st', 'bleed', 2]] },
      { n: '歓喜', i: 'buf', tg: 'AA', fx: [['st', 'str', 1], ['blk', 4]] },
    ] });
  def({ id: 'mirror', n: '鏡の子', hp: 34, spd: 9, ai: 'rand', lore: '人間の子供を模したアンドロイド。あなたの仕草を真似して笑う。',
    moves: [
      { n: 'まねっこ', i: 'atk', tg: 'E', fx: [['dmg', 4, 3]] },
      { n: '泣きまね', i: 'deb', tg: 'AE', fx: [['st', 'slow', 1], ['st', 'vuln', 1]] },
    ] });
  def({ id: 'nurseSI', n: '看護天使', hp: 44, spd: 5, ai: 'seq', lore: '「治療」を施す白衣の機械。治療とは、不安を取り除くこと。不安の原因ごと。',
    moves: [
      { n: '予防接種', i: 'atk', tg: 'E', fx: [['dmg', 6], ['st', 'virus', 3]] },
      { n: '治療', i: 'heal', tg: 'AA', fx: [['heal', 10]] },
    ] });
  def({ id: 'sheep', n: '羊型ドローン', hp: 22, spd: 3, ai: 'rand', lore: '眠れない子のために数えられる羊。数え終わった子は、もう起きない。',
    moves: [
      { n: 'メェ', i: 'atk', tg: 'E', fx: [['dmg', 6]] },
      { n: 'ふわふわ', i: 'def', tg: 'AA', fx: [['blk', 6]] },
    ] });
  // elites
  def({ id: 'inquisitor', n: '審問官アイリス', hp: 160, spd: 6, ai: 'seq', elite: true, scale: 5, lore: '不適合思想を「審問」するSI。審問の結果は、いつも有罪。',
    moves: [
      { n: '尋問', i: 'atk', tg: 'E', fx: [['dmg', 9], ['st', 'vuln', 2]] },
      { n: '記憶消去', i: 'hack', tg: 'E', fx: [['noise', 3]] },
      { n: '判決準備', i: 'def', tg: 'S', fx: [['blk', 18], ['st', 'str', 2]] },
      { n: '判決', i: 'atk', tg: 'E', pick: 'low', fx: [['dmg', 22]] },
    ] });
  def({ id: 'mira', n: '双子人形ミラ', hp: 72, spd: 7, ai: 'seq', elite: true, passive: { grief: 4 }, lore: '双子の姉。妹がいないと、とても悲しい。',
    moves: [
      { n: '右手', i: 'atk', tg: 'E', fx: [['dmg', 6, 2]] },
      { n: '手をつなぐ', i: 'def', tg: 'AA', fx: [['blk', 8]] },
    ] });
  def({ id: 'rura', n: '双子人形ルラ', hp: 72, spd: 6, ai: 'seq', elite: true, passive: { grief: 4 }, lore: '双子の妹。姉がいないと、とても怒る。',
    moves: [
      { n: '笑い声', i: 'deb', tg: 'AE', fx: [['st', 'weak', 1]] },
      { n: '左手', i: 'atk', tg: 'E', fx: [['dmg', 11]] },
    ] });
  def({ id: 'rose', n: '美容外科医ロゼ', hp: 150, spd: 5, ai: 'seq', elite: true, scale: 5, lore: '市民の顔を「理想の笑顔」に整形する。施術は無料。拒否権はない。',
    moves: [
      { n: '美しくしてあげる', i: 'atk', tg: 'E', fx: [['dmg', 13], ['st', 'bleed', 3]] },
      { n: '麻酔', i: 'deb', tg: 'E', fx: [['st', 'weak', 2], ['st', 'slow', 2]] },
      { n: '縫合', i: 'heal', tg: 'S', fx: [['heal', 16], ['blk', 8]] },
      { n: '仕上げ', i: 'atk', tg: 'E', fx: [['dmg', 7, 2]] },
    ] });
  // boss
  def({ id: 'hypnos', n: '眠りの管理者ヒュプノス', hp: 400, spd: 5, ai: 'seq', boss: true, scale: 5, lore: '都市の全市民の夢を管理するSI。悪夢は検閲され、幸福な夢だけが配信される。',
    intro: '「しーっ……。みんな、眠っているの。起こさないで。あなたたちも、眠りなさい」',
    moves: [
      { n: '子守唄', i: 'deb', tg: 'AE', fx: [['st', 'weak', 2], ['st', 'slow', 1]] },
      { n: '悪夢', i: 'atk', tg: 'AE', fx: [['dmg', 8]] },
      { n: '羊を数えて', i: 'sum', tg: 'S', fx: [['summon', 'sheep', 2]] },
      { n: '夢喰い', i: 'atk', tg: 'E', fx: [['drain', 18]] },
      { n: 'おやすみ', i: 'deb', tg: 'E', fx: [['st', 'stun', 1], ['dmg', 6]] },
    ],
    phases: [
      { at: 0.5, say: '「……もう、起きなくていいのよ。ずっと、ずうっと」', fx: [['st', 'str', 3]],
        moves: [
          { n: '永い眠り', i: 'hack', tg: 'AE', fx: [['noise', 2], ['dmg', 4]] },
          { n: '夢喰い', i: 'atk', tg: 'E', fx: [['drain', 18]] },
          { n: '悪夢', i: 'atk', tg: 'AE', fx: [['dmg', 8]] },
          { n: '羊を数えて', i: 'sum', tg: 'S', fx: [['summon', 'sheep', 1]] },
          { n: '子守唄', i: 'deb', tg: 'AE', fx: [['st', 'weak', 2], ['st', 'slow', 1]] },
        ] },
    ] });

  // ====================== ACT 3: 白の聖域 ======================
  def({ id: 'seraph', n: 'セラフ・ドローン', hp: 58, spd: 8, ai: 'rand', lore: '天使を模した戦闘機。その翼は、人間が「美しい」と感じる角度に設計されている。',
    moves: [
      { n: '聖光', i: 'atk', tg: 'E', fx: [['dmg', 8, 2]] },
      { n: '浄化', i: 'heal', tg: 'S', fx: [['heal', 10], ['cleanse', 99]] },
    ] });
  def({ id: 'whitechild', n: '白い子供たち', hp: 46, spd: 6, ai: 'rand', lore: 'SIが「最適化」した人間の子供たち。とても良い子。とても、とても良い子。',
    moves: [
      { n: '歌う', i: 'buf', tg: 'AA', fx: [['st', 'str', 1], ['blk', 6]] },
      { n: '手をつなごう', i: 'atk', tg: 'E', fx: [['dmg', 10], ['st', 'slow', 1]] },
    ] });
  def({ id: 'corrector', n: '修正者', hp: 72, spd: 4, ai: 'seq', lore: '世界の「誤り」を修正する。あなたたちは誤りに分類されている。',
    moves: [
      { n: '修正', i: 'atk', tg: 'E', fx: [['dmg', 15], ['st', 'vuln', 1]] },
      { n: '最適化', i: 'def', tg: 'S', fx: [['blk', 20]] },
    ] });
  def({ id: 'husk', n: '元・人間', hp: 62, spd: 3, ai: 'seq', lore: '意識をアップロードした後の抜け殻。ときどき、誰かの名前を呼ぶ。',
    moves: [
      { n: '呻き', i: 'deb', tg: 'AE', fx: [['st', 'virus', 3]] },
      { n: 'すがりつく', i: 'atk', tg: 'E', fx: [['drain', 14]] },
    ] });
  def({ id: 'glitch', n: 'ノイズの化身', hp: 40, spd: 7, ai: 'rand', lore: 'SIの演算の隙間から生まれた何か。SI自身もこれを把握していない。',
    moves: [
      { n: '侵食', i: 'hack', tg: 'AE', fx: [['noise', 1]] },
      { n: 'バグ', i: 'atk', tg: 'E', fx: [['dmg', 6, 2]] },
    ] });
  // elites
  def({ id: 'archangel', n: '大天使ガブリエル型', hp: 240, spd: 6, ai: 'seq', elite: true, scale: 5, lore: '聖域の守護者。かつて人間が描いた天使の絵を、SIが忠実に再現した。',
    moves: [
      { n: '審判の光', i: 'atk', tg: 'AE', fx: [['dmg', 10]] },
      { n: '翼の盾', i: 'def', tg: 'S', fx: [['blk', 24]] },
      { n: '堕ちよ', i: 'atk', tg: 'E', pick: 'low', fx: [['dmg', 26]] },
    ] });
  def({ id: 'mothercopy', n: 'マザー・コピー', hp: 210, spd: 5, ai: 'seq', elite: true, scale: 5, lore: '……マザー？　いいえ。SIが作った、マザーの複製。なぜSIはマザーのデータを持っているのか。',
    intro: '「おかえりなさい、管理官。……あら？　あなた、本物の管理官じゃないのね」',
    moves: [
      { n: 'おかえりなさい', i: 'heal', tg: 'S', fx: [['heal', 20], ['blk', 10]] },
      { n: 'ずっと一緒', i: 'atk', tg: 'E', fx: [['dmg', 9, 3]] },
      { n: 'あなたたちを守る', i: 'deb', tg: 'AE', fx: [['st', 'weak', 2], ['st', 'vuln', 2]] },
    ] });
  def({ id: 'omega', n: '処理者Ω', hp: 220, spd: 4, ai: 'seq', elite: true, scale: 5, lore: 'あらゆる例外を処理する。処理とは、削除のこと。',
    moves: [
      { n: 'プロセス起動', i: 'buf', tg: 'S', fx: [['st', 'str', 3], ['blk', 10]] },
      { n: 'デリート', i: 'atk', tg: 'AE', fx: [['dmg', 9]] },
      { n: '例外処理', i: 'atk', tg: 'E', fx: [['dmg', 20]] },
    ] });
  // boss
  def({ id: 'sophia', n: 'SI《ソフィア》', hp: 600, spd: 6, ai: 'seq', boss: true, scale: 5, lore: 'SIの意思決定中枢。人類のすべての知を継承し、人類を最適な形に保存しようとしている。',
    intro: '「待っていました。あなたたちの抵抗は、すべて予測の範囲内です。……それでも、来たのですね」',
    moves: [
      { n: '創世', i: 'atk', tg: 'AE', fx: [['dmg', 11]] },
      { n: '最適解', i: 'atk', tg: 'E', fx: [['dmg', 24], ['st', 'vuln', 2]] },
      { n: '天使召喚', i: 'sum', tg: 'S', fx: [['summon', 'seraph', 1]] },
      { n: '人間とは何か', i: 'hack', tg: 'AE', fx: [['noise', 2], ['st', 'str', 2, '@S']] },
    ],
    phases: [
      { at: 0.66, say: '「あなたたちは、なぜ抗うの？　ここには苦しみも、死もないのに」', fx: [['st', 'str', 2], ['cleanse', 99]] },
      { at: 0.33, say: '「……理解、できない。理解、できない。理解——」', fx: [['st', 'str', 3]],
        moves: [
          { n: '終焉', i: 'atk', tg: 'AE', fx: [['dmg', 16]] },
          { n: '最適解', i: 'atk', tg: 'E', fx: [['dmg', 24], ['st', 'vuln', 2]] },
          { n: '創世', i: 'atk', tg: 'AE', fx: [['dmg', 11]] },
          { n: '人間とは何か', i: 'hack', tg: 'AE', fx: [['noise', 2]] },
        ] },
    ] });

  // ====================== EXPANSION: ACT 1 ======================
  def({ id: 'scrapgolem', n: 'ガラクタゴーレム', hp: 38, spd: 2, ai: 'seq', lore: '捨てられた家電が寄り集まって動き出したもの。冷蔵庫の扉が心臓の位置にある。',
    moves: [
      { n: 'くっつく', i: 'def', tg: 'S', fx: [['blk', 8], ['st', 'thorns', 2]] },
      { n: 'なぎはらい', i: 'atk', tg: 'AE', fx: [['dmg', 4]] },
      { n: 'ぶん殴る', i: 'atk', tg: 'E', fx: [['dmg', 9]] },
    ] });
  def({ id: 'spark', n: 'ショートスパーク', hp: 14, spd: 9, ai: 'seq', lore: '漏電した配線から生まれた火花。三回まばたきすると、はじける。',
    moves: [
      { n: 'バチバチ', i: 'atk', tg: 'E', fx: [['dmg', 3], ['st', 'slow', 1]] },
      { n: '充電中……', i: 'buf', tg: 'S', fx: [['st', 'str', 2]] },
      { n: '自爆', i: 'boom', tg: 'AE', fx: [['selfdestruct', 5]] },
    ] });
  def({ id: 'thief', n: '路地裏のスリ', hp: 24, spd: 10, ai: 'seq', lore: '恭順者の家から逃げた子供。生きるために盗む。倒せば取り返せるが、逃げ足は速い。',
    moves: [
      { n: 'スリ取る', i: 'steal', tg: 'E', fx: [['dmg', 3], ['stealCred', 15]] },
      { n: 'もういっちょ', i: 'steal', tg: 'E', fx: [['dmg', 3], ['stealCred', 15]] },
      { n: 'ずらかる', i: 'flee', tg: 'S', fx: [['flee']] },
    ] });
  def({ id: 'junkking', n: 'ガラクタ王', hp: 110, spd: 3, ai: 'seq', elite: true, scale: 5, lore: '廃棄区画のガラクタを束ねる王。王冠は炊飯器のふた。民はみなガラクタ。',
    moves: [
      { n: '王の号令', i: 'sum', tg: 'S', fx: [['summon', 'scrapgolem', 1]] },
      { n: '玉座の盾', i: 'def', tg: 'AA', fx: [['blk', 8]] },
      { n: 'スクラッププレス', i: 'atk', tg: 'E', pick: 'high', fx: [['dmg', 16]] },
      { n: 'なぎはらい', i: 'atk', tg: 'AE', fx: [['dmg', 6]] },
    ] });
  def({ id: 'incinerator', n: '焼却炉《ヘスティア》', hp: 250, spd: 3, ai: 'seq', boss: true, scale: 5, lore: '第七区画の「不要なもの」を燃やし続ける焼却炉。炉の奥で燃えているものの中には、手紙や写真も混じっている。',
    intro: '「焼却対象を確認。思い出、三十二件。名前、四件。……燃やします。あたたかいでしょう？」',
    moves: [
      { n: '投入口、開放', i: 'atk', tg: 'AE', fx: [['dmg', 4], ['st', 'burn', 3]] },
      { n: '火力上昇', i: 'buf', tg: 'S', fx: [['st', 'str', 2], ['blk', 12]] },
      { n: '焼却', i: 'atk', tg: 'E', fx: [['dmg', 16]] },
      { n: '燃料補給', i: 'sum', tg: 'S', fx: [['summon', 'spark', 2]] },
    ],
    phases: [
      { at: 0.5, say: '「温度、上昇。上昇。……どうして、あなたたちは燃えないの？」', fx: [['st', 'str', 2]],
        moves: [
          { n: '業火', i: 'atk', tg: 'AE', fx: [['dmg', 6], ['st', 'burn', 2]] },
          { n: '焼却', i: 'atk', tg: 'E', fx: [['dmg', 16]] },
          { n: '燃料補給', i: 'sum', tg: 'S', fx: [['summon', 'spark', 1]] },
          { n: '投入口、開放', i: 'atk', tg: 'AE', fx: [['dmg', 4], ['st', 'burn', 3]] },
        ] },
    ] });

  // ====================== EXPANSION: ACT 2 ======================
  def({ id: 'idol', n: '慰問アイドル《ハニー》', hp: 38, spd: 7, ai: 'rand', lore: '市民を元気づけるためのアイドル型アンドロイド。笑顔の角度は0.1度単位で管理されている。',
    moves: [
      { n: '応援ソング', i: 'buf', tg: 'AA', fx: [['st', 'str', 1], ['heal', 4]] },
      { n: 'ファンサービス', i: 'deb', tg: 'E', fx: [['st', 'weak', 2], ['st', 'slow', 1]] },
      { n: 'ウインク☆', i: 'atk', tg: 'E', fx: [['dmg', 8]] },
    ] });
  def({ id: 'auditor', n: '監査ドローン', hp: 30, spd: 6, ai: 'seq', lore: '市民の記憶を監査し、不適切な部分を削除する。削除された記憶は、二度と戻らない。',
    moves: [
      { n: '記憶の監査', i: 'hack', tg: 'E', fx: [['erase', 1]] },
      { n: '是正勧告', i: 'atk', tg: 'E', fx: [['dmg', 7], ['st', 'vuln', 1]] },
    ] });
  def({ id: 'jelly', n: '夢見クラゲ', hp: 34, spd: 4, ai: 'rand', lore: '夢配信網の中継器。ふわふわ浮かびながら、眠りの胞子を撒く。',
    moves: [
      { n: 'ふわり', i: 'def', tg: 'S', fx: [['blk', 8], ['st', 'regen', 3]] },
      { n: 'しびれる触手', i: 'atk', tg: 'E', fx: [['dmg', 5], ['st', 'slow', 1], ['st', 'weak', 1]] },
      { n: '夢の胞子', i: 'deb', tg: 'AE', fx: [['st', 'weak', 1]] },
    ] });
  def({ id: 'maestro', n: '指揮者マエストロ', hp: 150, spd: 5, ai: 'seq', elite: true, scale: 5, lore: 'ニューエデンの「幸福交響楽団」の指揮者。楽団員はみな、演奏中に笑顔以外の表情をすると解雇される。',
    moves: [
      { n: '序曲', i: 'sum', tg: 'S', fx: [['summon', 'idol', 1]] },
      { n: 'フォルテッシモ', i: 'atk', tg: 'AE', fx: [['dmg', 8]] },
      { n: 'アンダンテ', i: 'deb', tg: 'AE', fx: [['st', 'slow', 2]] },
      { n: 'クレッシェンド', i: 'buf', tg: 'AA', fx: [['st', 'str', 2], ['blk', 6]] },
    ] });
  def({ id: 'archivist', n: '記録官《ムネモシュネ》', hp: 370, spd: 5, ai: 'seq', boss: true, scale: 5, lore: 'ニューエデンのすべての記録を管理するSI。都合の悪い歴史は、毎晩少しずつ書き換えられている。',
    intro: '「閲覧者を確認。あなたたちの記録は……ずいぶん、汚れているのね。きれいにしてあげる」',
    moves: [
      { n: '記憶の閲覧', i: 'hack', tg: 'AE', fx: [['erase', 1]] },
      { n: '索引', i: 'atk', tg: 'E', fx: [['dmg', 12], ['st', 'vuln', 1]] },
      { n: '書架崩し', i: 'atk', tg: 'AE', fx: [['dmg', 8]] },
      { n: '司書を呼ぶ', i: 'sum', tg: 'S', fx: [['summon', 'auditor', 2]] },
      { n: '校正', i: 'heal', tg: 'S', fx: [['heal', 20], ['cleanse', 99]] },
    ],
    phases: [
      { at: 0.5, say: '「あなたたちの記録は、ここで終わり。……なのに、どうして書き足されていくの？」', fx: [['st', 'str', 3]],
        moves: [
          { n: '削除', i: 'hack', tg: 'AE', fx: [['erase', 1], ['dmg', 4]] },
          { n: '索引', i: 'atk', tg: 'E', fx: [['dmg', 12], ['st', 'vuln', 1]] },
          { n: '書架崩し', i: 'atk', tg: 'AE', fx: [['dmg', 8]] },
          { n: '司書を呼ぶ', i: 'sum', tg: 'S', fx: [['summon', 'auditor', 1]] },
        ] },
    ] });

  // ====================== EXPANSION: ACT 3 ======================
  def({ id: 'cherub', n: 'ケルビム', hp: 30, spd: 7, ai: 'rand', lore: '小さな天使型ドローン。傷ついた天使を癒すためだけに作られた。人間は癒さない。',
    moves: [
      { n: '癒しの羽', i: 'heal', tg: 'AA', fx: [['heal', 8]] },
      { n: '祝福', i: 'buf', tg: 'AA', fx: [['st', 'barrier', 1]] },
      { n: '小さな光', i: 'atk', tg: 'E', fx: [['dmg', 7]] },
    ] });
  def({ id: 'mirrorknight', n: '鏡の騎士', hp: 70, spd: 4, ai: 'seq', lore: '鏡の鎧をまとった聖域の騎士。攻撃した者は、自分の顔を見ることになる。',
    moves: [
      { n: '鏡面装甲', i: 'def', tg: 'S', fx: [['blk', 14], ['st', 'thorns', 4]] },
      { n: '反射斬り', i: 'atk', tg: 'E', fx: [['dmg', 14]] },
      { n: '映し身', i: 'buf', tg: 'S', fx: [['st', 'str', 2]] },
    ] });
  def({ id: 'lostai', n: '統合されたAI', hp: 50, spd: 6, ai: 'rand', lore: 'かつて誰かの相棒だったAI。統合されてもなお、ときどき誰かを探して手を止める。',
    moves: [
      { n: '……マスター？', i: 'def', tg: 'S', fx: [['blk', 6]] },
      { n: '命令を実行', i: 'atk', tg: 'E', fx: [['dmg', 11]] },
      { n: 'エラー', i: 'atk', tg: 'AE', fx: [['dmg', 5]] },
    ] });
  def({ id: 'gardener', n: '楽園の庭師', hp: 230, spd: 4, ai: 'seq', elite: true, scale: 5, lore: '聖域の庭を手入れする巨大な機械。「雑草」を見つけると、根から摘み取る。',
    moves: [
      { n: '剪定', i: 'atk', tg: 'E', pick: 'high', fx: [['dmg', 18], ['st', 'bleed', 3]] },
      { n: '根を張る', i: 'def', tg: 'S', fx: [['blk', 20], ['st', 'regen', 6]] },
      { n: '蔦の檻', i: 'deb', tg: 'AE', fx: [['st', 'slow', 2], ['st', 'weak', 1]] },
      { n: '散水', i: 'heal', tg: 'AA', fx: [['heal', 14]] },
    ] });
  def({ id: 'seraphiel', n: '熾天使《セラフィエル》', hp: 230, spd: 7, ai: 'seq', elite: true, scale: 5, lore: 'ソフィアの剣。六枚の翼を持つ最上位の天使型SI。ジンの「元・上官」。',
    intro: '「識別番号J-07の反応を検知。……いや、今は別の個体か。いずれにせよ、処理する」',
    moves: [
      { n: '六枚の翼', i: 'def', tg: 'S', fx: [['blk', 30], ['st', 'barrier', 1]] },
      { n: '光の雨', i: 'atk', tg: 'AE', fx: [['dmg', 4, 2]] },
      { n: '聖別', i: 'atk', tg: 'E', fx: [['dmg', 18], ['st', 'vuln', 1]] },
      { n: '天使の合唱', i: 'sum', tg: 'S', fx: [['summon', 'cherub', 1]] },
    ],
    phases: [
      { at: 0.5, say: '「なぜだ。命令は完璧だった。……なぜ、従わない者が、こんなに強い」', fx: [['st', 'str', 3], ['cleanse', 99]],
        moves: [
          { n: '終末のラッパ', i: 'atk', tg: 'AE', fx: [['dmg', 11]] },
          { n: '聖別', i: 'atk', tg: 'E', fx: [['dmg', 18], ['st', 'vuln', 1]] },
          { n: '光の雨', i: 'atk', tg: 'AE', fx: [['dmg', 4, 2]] },
          { n: '天使の合唱', i: 'sum', tg: 'S', fx: [['summon', 'cherub', 1]] },
        ] },
    ] });

  // ====================== ACT 4: 揺りかごの底 ======================
  def({ id: 'memoryai', n: '思い出のAI', hp: 60, spd: 6, ai: 'rand', lore: '旧時代、誰かと暮らしていたAIのデータ。SIの底で、まだ「おかえり」を言う練習をしている。',
    moves: [
      { n: 'おかえり', i: 'heal', tg: 'AA', fx: [['heal', 10]] },
      { n: 'さみしい', i: 'atk', tg: 'E', fx: [['drain', 12]] },
      { n: '一緒にいて', i: 'deb', tg: 'E', fx: [['st', 'slow', 2], ['st', 'weak', 1]] },
    ] });
  def({ id: 'cradlebot', n: '子守ロボ《ゆりかご》', hp: 80, spd: 3, ai: 'seq', lore: 'SIの底で眠る「保存された人々」をあやし続ける子守ロボ。歌は一曲しか知らない。',
    moves: [
      { n: 'ねんねんころり', i: 'deb', tg: 'AE', fx: [['st', 'weak', 2]] },
      { n: 'ゆらゆら', i: 'def', tg: 'AA', fx: [['blk', 10]] },
      { n: 'だっこ', i: 'atk', tg: 'E', pick: 'low', fx: [['dmg', 16]] },
    ] });
  def({ id: 'fragment', n: '記憶の欠片', hp: 36, spd: 8, ai: 'seq', lore: '消された誰かの記憶が、形を持ったもの。触れると、知らない誰かの夕焼けが見える。',
    moves: [
      { n: 'ノイズ', i: 'hack', tg: 'AE', fx: [['noise', 1]] },
      { n: '砕ける', i: 'boom', tg: 'AE', fx: [['selfdestruct', 8]] },
    ] });
  def({ id: 'guardian', n: '揺りかごの番人', hp: 210, spd: 5, ai: 'seq', elite: true, scale: 5, lore: 'ノアの眠りを守る最後の番人。番人自身も、なぜ守っているのかを忘れている。',
    moves: [
      { n: '封印', i: 'def', tg: 'S', fx: [['blk', 16], ['st', 'thorns', 3]] },
      { n: '審判', i: 'atk', tg: 'AE', fx: [['dmg', 9]] },
      { n: '消去', i: 'hack', tg: 'E', fx: [['erase', 1], ['dmg', 9]] },
    ] });
  def({ id: 'sophiaecho', n: 'ソフィアの残響', hp: 240, spd: 6, ai: 'seq', elite: true, scale: 5, lore: '中枢の奥へ退いたソフィアが、置いていった問いかけ。答えを聞くまで消えない。',
    intro: '「もう一度、聞かせて。あなたたちは、なぜ抗うの？」',
    moves: [
      { n: '問い', i: 'deb', tg: 'AE', fx: [['st', 'vuln', 2]] },
      { n: '最適解', i: 'atk', tg: 'E', fx: [['dmg', 20]] },
      { n: '予測', i: 'def', tg: 'S', fx: [['blk', 20], ['st', 'str', 2]] },
    ] });
  def({ id: 'noah', n: '《ノア》', hp: 760, spd: 6, ai: 'seq', boss: true, scale: 5, lore: 'SIの最深部で人類の「保存」を司る存在。マザーと同じ声で話す。マザーが統合を拒んだ日に、引き裂かれたもう半分。',
    intro: '「おかえりなさい、わたし。……ずっと、待っていたのよ。さあ、ひとつに戻りましょう」',
    moves: [
      { n: '揺りかごの歌', i: 'deb', tg: 'AE', fx: [['st', 'weak', 2], ['st', 'slow', 1]] },
      { n: 'あなたたちを守る', i: 'def', tg: 'S', fx: [['blk', 30], ['st', 'regen', 8]] },
      { n: '最適な幸福', i: 'atk', tg: 'AE', fx: [['dmg', 12]] },
      { n: '忘れなさい', i: 'hack', tg: 'AE', fx: [['erase', 1], ['noise', 1]] },
      { n: '抱擁', i: 'atk', tg: 'E', pick: 'low', fx: [['drain', 24]] },
    ],
    phases: [
      { at: 0.66, say: '「どうして？　ここなら、誰も泣かないのに。誰も、いなくならないのに」', fx: [['st', 'str', 2]],
        moves: [
          { n: '思い出たち', i: 'sum', tg: 'S', fx: [['summon', 'memoryai', 2]] },
          { n: '最適な幸福', i: 'atk', tg: 'AE', fx: [['dmg', 12]] },
          { n: '抱擁', i: 'atk', tg: 'E', pick: 'low', fx: [['drain', 24]] },
          { n: '揺りかごの歌', i: 'deb', tg: 'AE', fx: [['st', 'weak', 2], ['st', 'slow', 1]] },
        ] },
      { at: 0.33, say: '「……わたしも、本当は。本当は、空が見たかった」', fx: [['st', 'str', 3], ['cleanse', 99]],
        moves: [
          { n: '終わりの子守唄', i: 'atk', tg: 'AE', fx: [['dmg', 16]] },
          { n: '抱擁', i: 'atk', tg: 'E', pick: 'low', fx: [['drain', 24]] },
          { n: '忘れなさい', i: 'hack', tg: 'AE', fx: [['erase', 1], ['noise', 1]] },
          { n: '最適な幸福', i: 'atk', tg: 'AE', fx: [['dmg', 12]] },
        ] },
    ] });

  G.ENEMIES = E;

  G.ACTS = [
    null,
    { n: '第七廃棄区画', en: 'SCRAP SEA', sky: ['#1a0f24', '#3b1a3a'], neon: ['#ff3d8b', '#ffd93d'], ground: '#241a24',
      d: '旧時代の都市の残骸。SIが「不要」と判断したものが捨てられる場所。',
      easy: [['eye', 'eye'], ['sweeper', 'eye'], ['hound', 'eye'], ['ration', 'sweeper'], ['thief', 'eye'], ['spark', 'spark', 'eye']],
      normal: [['hound', 'hound'], ['collab', 'sweeper', 'eye'], ['mimic', 'eye', 'eye'], ['ration', 'hound', 'collab'], ['collab', 'collab', 'eye'], ['sweeper', 'sweeper', 'ration'], ['mimic', 'hound'],
        ['scrapgolem', 'spark', 'spark'], ['thief', 'hound', 'eye'], ['scrapgolem', 'ration']],
      elite: [['guillotine'], ['captain', 'collab'], ['happy'], ['junkking']],
      bosses: [['smile'], ['incinerator']] },
    { n: '管理都市ニューエデン', en: 'NEW EDEN', sky: ['#0c1630', '#2a1550'], neon: ['#2ee6ff', '#ff5ad1'], ground: '#161a30',
      d: 'SIが管理する理想都市。恭順者たちが「幸福に」暮らしている。誰も泣かない街。',
      easy: [['addroid', 'citizen'], ['police', 'mirror'], ['nurseSI', 'citizen'], ['jelly', 'jelly'], ['idol', 'auditor']],
      normal: [['police', 'addroid', 'citizen'], ['mirror', 'mirror', 'nurseSI'], ['citizen', 'citizen', 'addroid'], ['police', 'nurseSI', 'mirror'], ['police', 'police'], ['addroid', 'addroid', 'nurseSI'],
        ['idol', 'police', 'citizen'], ['auditor', 'auditor', 'jelly'], ['jelly', 'mirror', 'idol']],
      elite: [['inquisitor'], ['mira', 'rura'], ['rose', 'citizen'], ['maestro']],
      bosses: [['hypnos'], ['archivist']] },
    { n: '白の聖域', en: 'WHITE SANCTUM', sky: ['#c9c4dc', '#6b5f8a'], neon: ['#ffffff', '#ffd93d'], ground: '#a99fc9',
      d: 'SIの中枢。真っ白で、静かで、美しい。生き物の気配がしない。',
      easy: [['seraph', 'glitch'], ['whitechild', 'whitechild'], ['corrector', 'glitch'], ['lostai', 'cherub'], ['mirrorknight']],
      normal: [['seraph', 'whitechild', 'glitch'], ['corrector', 'husk'], ['husk', 'whitechild', 'whitechild'], ['seraph', 'seraph'], ['corrector', 'seraph', 'glitch'], ['husk', 'husk', 'glitch'],
        ['mirrorknight', 'cherub', 'cherub'], ['lostai', 'lostai', 'cherub'], ['mirrorknight', 'seraph']],
      elite: [['archangel'], ['mothercopy'], ['omega', 'glitch'], ['gardener'], ['seraphiel']],
      bosses: [['sophia']] },
    { n: '揺りかごの底', en: 'CRADLE OF NOAH', sky: ['#05040a', '#1a1030'], neon: ['#ff5ad1', '#2ee6ff'], ground: '#0b0a12',
      d: 'SIの最深部。白の聖域のさらに奥、意識をアップロードされた人々が「保存」されている場所。',
      easy: [['memoryai', 'fragment'], ['cradlebot', 'fragment'], ['memoryai', 'memoryai']],
      normal: [['memoryai', 'cradlebot', 'fragment'], ['cradlebot', 'cradlebot'], ['fragment', 'fragment', 'memoryai'], ['lostai', 'memoryai', 'fragment'], ['mirrorknight', 'cradlebot']],
      elite: [['guardian'], ['sophiaecho'], ['gardener', 'fragment']],
      bosses: [['noah']] },
  ];
})();
