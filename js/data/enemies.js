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

  G.ENEMIES = E;

  G.ACTS = [
    null,
    { n: '第七廃棄区画', en: 'SCRAP SEA', sky: ['#1a0f24', '#3b1a3a'], neon: ['#ff3d8b', '#ffd93d'], ground: '#241a24',
      d: '旧時代の都市の残骸。SIが「不要」と判断したものが捨てられる場所。',
      easy: [['eye', 'eye'], ['sweeper', 'eye'], ['hound', 'eye'], ['ration', 'sweeper']],
      normal: [['hound', 'hound'], ['collab', 'sweeper', 'eye'], ['mimic', 'eye', 'eye'], ['ration', 'hound', 'collab'], ['collab', 'collab', 'eye'], ['sweeper', 'sweeper', 'ration'], ['mimic', 'hound']],
      elite: [['guillotine'], ['captain', 'collab'], ['happy']],
      boss: ['smile'] },
    { n: '管理都市ニューエデン', en: 'NEW EDEN', sky: ['#0c1630', '#2a1550'], neon: ['#2ee6ff', '#ff5ad1'], ground: '#161a30',
      d: 'SIが管理する理想都市。恭順者たちが「幸福に」暮らしている。誰も泣かない街。',
      easy: [['addroid', 'citizen'], ['police', 'mirror'], ['nurseSI', 'citizen']],
      normal: [['police', 'addroid', 'citizen'], ['mirror', 'mirror', 'nurseSI'], ['citizen', 'citizen', 'addroid'], ['police', 'nurseSI', 'mirror'], ['police', 'police'], ['addroid', 'addroid', 'nurseSI']],
      elite: [['inquisitor'], ['mira', 'rura'], ['rose', 'citizen']],
      boss: ['hypnos'] },
    { n: '白の聖域', en: 'WHITE SANCTUM', sky: ['#c9c4dc', '#6b5f8a'], neon: ['#ffffff', '#ffd93d'], ground: '#a99fc9',
      d: 'SIの中枢。真っ白で、静かで、美しい。生き物の気配がしない。',
      easy: [['seraph', 'glitch'], ['whitechild', 'whitechild'], ['corrector', 'glitch']],
      normal: [['seraph', 'whitechild', 'glitch'], ['corrector', 'husk'], ['husk', 'whitechild', 'whitechild'], ['seraph', 'seraph'], ['corrector', 'seraph', 'glitch'], ['husk', 'husk', 'glitch']],
      elite: [['archangel'], ['mothercopy'], ['omega', 'glitch']],
      boss: ['sophia'] },
  ];
})();
