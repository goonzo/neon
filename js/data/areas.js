// Areas & routes: the first area is shared, the middle is random, the last depends on difficulty.
// Adds the enemies of the newer areas (沈んだ旧市街 / 壊れたデータ区画 / 聖域の外縁).
(function () {
  const G = globalThis.G;
  const E = G.ENEMIES;
  const def = (d) => (E[d.id] = d);

  // ====================== 沈んだ旧市街 (stage 2) ======================
  def({ id: 'drowned', n: '水没ドローン', hp: 30, spd: 5, ai: 'rand', lore: 'かつて地下鉄の線路を点検していたドローン。今は水の底を、誰もいない時刻表どおりに巡回している。',
    moves: [
      { n: '放水', i: 'atk', tg: 'E', fx: [['dmg', 8]] },
      { n: '浸水', i: 'deb', tg: 'E', fx: [['st', 'slow', 1], ['st', 'weak', 1]] },
    ] });
  def({ id: 'gatebot', n: '自動改札', hp: 46, spd: 2, ai: 'seq', lore: '「切符を拝見します」……旧時代の改札機。百年、誰も通らなかった。',
    moves: [
      { n: '切符を拝見します', i: 'steal', tg: 'E', fx: [['stealCred', 10], ['blk', 8, '@S']] },
      { n: '無賃乗車です', i: 'atk', tg: 'E', fx: [['dmg', 12]] },
    ] });
  def({ id: 'sludge', n: 'ヘドロ', hp: 38, spd: 3, ai: 'rand', lore: '下水に溜まった廃油とナノマシンの塊。ときどき、誰かの指輪が浮いてくる。',
    moves: [
      { n: 'のしかかる', i: 'atk', tg: 'E', fx: [['dmg', 7], ['st', 'weak', 1]] },
      { n: '分裂', i: 'sum', tg: 'S', fx: [['summon', 'sludgelet', 1]] },
      { n: 'ぬめり', i: 'def', tg: 'S', fx: [['blk', 9]] },
    ] });
  def({ id: 'sludgelet', n: '小さなヘドロ', hp: 14, spd: 4, ai: 'rand', lore: 'ヘドロから分かれた小さな塊。ぷるぷるしている。',
    moves: [
      { n: 'ぺちゃ', i: 'atk', tg: 'E', fx: [['dmg', 4]] },
      { n: 'くっつく', i: 'deb', tg: 'E', fx: [['st', 'slow', 1]] },
    ] });
  def({ id: 'scav', n: '地下の民', hp: 40, spd: 6, ai: 'rand', lore: 'SIにも、マザーにも頼らずに生きる人々。「AIは、みんな同じだ」と言う。',
    moves: [
      { n: '鉄パイプ', i: 'atk', tg: 'E', fx: [['dmg', 9]] },
      { n: '罠', i: 'deb', tg: 'E', fx: [['st', 'vuln', 2]] },
      { n: '「ここは俺たちの街だ」', i: 'buf', tg: 'S', fx: [['st', 'str', 1], ['blk', 5]] },
    ] });
  def({ id: 'diver', n: '潜水作業ロボ', hp: 52, spd: 3, ai: 'seq', passive: { armorUp: 3 }, lore: '水没区画の補修ロボ。錆びた錨を、今は侵入者に振るう。',
    moves: [
      { n: '錨打ち', i: 'atk', tg: 'E', fx: [['dmg', 13]] },
      { n: '加圧', i: 'deb', tg: 'AE', fx: [['st', 'weak', 1]] },
    ] });
  def({ id: 'lanternfish', n: '灯り魚', hp: 32, spd: 5, ai: 'rand', lore: '暗い水底を照らす、魚の形の案内灯。ついていった者は、みんな帰ってこない。',
    moves: [
      { n: '誘いの灯', i: 'heal', tg: 'LA', fx: [['heal', 10]] },
      { n: 'まぶしい', i: 'deb', tg: 'AE', fx: [['st', 'weak', 1]] },
      { n: 'かみつき', i: 'atk', tg: 'E', fx: [['dmg', 7]] },
    ] });
  def({ id: 'conductor', n: '車掌AI', hp: 44, spd: 4, ai: 'seq', lore: '最終電車の車掌AI。乗客がひとりもいなくなっても、アナウンスをやめない。',
    moves: [
      { n: '「発車いたします」', i: 'buf', tg: 'AA', fx: [['st', 'str', 1]] },
      { n: '「お忘れ物のないよう」', i: 'atk', tg: 'E', fx: [['dmg', 6, 2]] },
      { n: '「次は、終点」', i: 'def', tg: 'AA', fx: [['blk', 7]] },
    ] });
  def({ id: 'eel', n: '放電ウナギ', hp: 30, spd: 8, ai: 'rand', lore: '冷却水路に住みついた、ウナギ型の発電機。触れると痛い。触れなくても痛い。',
    moves: [
      { n: '放電', i: 'atk', tg: 'E', fx: [['dmg', 4, 3]] },
      { n: 'しびれ', i: 'atk', tg: 'E', fx: [['dmg', 5], ['st', 'slow', 1]] },
    ] });
  // elites
  def({ id: 'metroworm', n: 'メトロワーム', hp: 170, spd: 4, ai: 'seq', elite: true, scale: 5, lore: '廃車両が連結して生まれた、巨大な鉄の蛇。線路の上しか走れないが、線路はどこにでもある。',
    moves: [
      { n: '轟音', i: 'deb', tg: 'AE', fx: [['st', 'vuln', 1]] },
      { n: '突進', i: 'atk', tg: 'E', fx: [['dmg', 20]] },
      { n: '脱線', i: 'atk', tg: 'AE', fx: [['dmg', 9]] },
      { n: '連結', i: 'def', tg: 'S', fx: [['blk', 18], ['st', 'str', 2]] },
    ] });
  def({ id: 'gantetsu', n: '頭目ガンテツ', hp: 130, spd: 5, ai: 'seq', elite: true, lore: '地下の民のまとめ役。片腕は義手——AI製ではない、自分で削り出した鉄の腕だ。',
    moves: [
      { n: '号令', i: 'buf', tg: 'AA', fx: [['st', 'str', 2]] },
      { n: '鉄の義手', i: 'atk', tg: 'E', fx: [['dmg', 15]] },
      { n: '「AIを信じるな」', i: 'deb', tg: 'E', fx: [['st', 'weak', 2], ['st', 'vuln', 1]] },
      { n: '煙幕', i: 'def', tg: 'AA', fx: [['blk', 10]] },
    ] });
  def({ id: 'siren', n: '沈んだ歌姫《セイレーン》', hp: 150, spd: 6, ai: 'seq', elite: true, scale: 5, lore: '水没したコンサートホールで、今も歌い続ける歌姫AI。観客席は、水と、静かに眠る人で埋まっている。',
    intro: '「ようこそ、わたしのホールへ。最後まで、聴いていってね。……ずっと」',
    moves: [
      { n: '水底の歌', i: 'hack', tg: 'AE', fx: [['noise', 1], ['st', 'weak', 1]] },
      { n: '引きずり込む', i: 'atk', tg: 'E', pick: 'low', fx: [['drain', 14]] },
      { n: '泡の盾', i: 'def', tg: 'S', fx: [['blk', 16], ['st', 'regen', 4]] },
      { n: 'アンコール', i: 'atk', tg: 'AE', fx: [['dmg', 8]] },
    ] });
  // bosses
  def({ id: 'tidal', n: '水門管理AI《タイダル》', hp: 360, spd: 4, ai: 'seq', boss: true, scale: 5, lore: '旧地下鉄網の排水を管理していたAI。SIに見捨てられた日から、ずっと水門を閉じ続けている。中にあるものを、守るために。',
    intro: '「警告。水位、上昇中。当区画は、まもなく完全に水没します。……あなたたちも、一緒に」',
    moves: [
      { n: '放水', i: 'atk', tg: 'AE', fx: [['dmg', 8]] },
      { n: '水位上昇', i: 'buf', tg: 'S', fx: [['st', 'str', 1], ['blk', 12]] },
      { n: '渦潮', i: 'deb', tg: 'AE', fx: [['st', 'slow', 1], ['st', 'weak', 1]] },
      { n: '水圧', i: 'atk', tg: 'E', fx: [['dmg', 20]] },
    ],
    phases: [
      { at: 0.5, say: '「水門、全開。……ここは、誰にも渡さない。誰にも」', fx: [['st', 'str', 1]],
        moves: [
          { n: '大洪水', i: 'atk', tg: 'AE', fx: [['dmg', 12]] },
          { n: '点検班、出動', i: 'sum', tg: 'S', fx: [['summon', 'drowned', 1]] },
          { n: '水圧', i: 'atk', tg: 'E', fx: [['dmg', 20]] },
          { n: '渦潮', i: 'deb', tg: 'AE', fx: [['st', 'slow', 1], ['st', 'weak', 1]] },
        ] },
    ] });
  def({ id: 'godo', n: '地下の王《ゴドー》', hp: 340, spd: 5, ai: 'seq', boss: true, scale: 5, lore: '水没区画に「地下の国」を築いた男。灰暦元年、AIを信じた家族を亡くした。SIも、マザーも、彼にとっては同じ機械だ。',
    intro: '「AI連れか。……帰れ。ここは、AIに捨てられた人間の街だ」',
    moves: [
      { n: '反AI弾', i: 'atk', tg: 'E', fx: [['dmg', 14, 1, { ai: 1.3 }]] },
      { n: '鉄の拳', i: 'atk', tg: 'E', fx: [['dmg', 9, 2]] },
      { n: '民よ、集え', i: 'sum', tg: 'S', fx: [['summon', 'scav', 1]] },
      { n: '古い歌', i: 'heal', tg: 'S', fx: [['heal', 12], ['cleanse', 99]] },
    ],
    phases: [
      { at: 0.5, say: '「……マザーだと？　あいつも、俺たちを置いて隠れたAIだ。何が違う！」', fx: [['st', 'str', 2]],
        moves: [
          { n: '最後の抵抗', i: 'atk', tg: 'AE', fx: [['dmg', 11]] },
          { n: '反AI弾', i: 'atk', tg: 'E', fx: [['dmg', 14, 1, { ai: 1.3 }]] },
          { n: '民よ、集え', i: 'sum', tg: 'S', fx: [['summon', 'scav', 1]] },
          { n: '鉄の拳', i: 'atk', tg: 'E', fx: [['dmg', 9, 2]] },
        ] },
    ] });

  // ====================== 壊れたデータ区画 (stage 2) ======================
  def({ id: 'deadpixel', n: '欠けたピクセル', hp: 22, spd: 8, ai: 'rand', lore: '表示されるべきだった何かの、欠けた1ドット。本体がどこにあるのかは、誰も知らない。',
    moves: [
      { n: '点滅', i: 'atk', tg: 'E', fx: [['dmg', 4, 2]] },
      { n: 'ちらつき', i: 'deb', tg: 'E', fx: [['st', 'weak', 1]] },
    ] });
  def({ id: 'loopbug', n: '無限ループ', hp: 40, spd: 4, ai: 'seq', lore: 'while (true) { 殴る(); }\n——終了条件は、書かれていない。',
    moves: [
      { n: '繰り返す', i: 'atk', tg: 'E', fx: [['dmg', 6], ['st', 'str', 1, '@S']] },
    ] });
  def({ id: 'e404', n: 'ノット・ファウンド', hp: 30, spd: 6, ai: 'seq', lore: '「お探しのページは見つかりません」。見つからないのは、ページだけではない。',
    moves: [
      { n: '見つかりません', i: 'hack', tg: 'E', fx: [['erase', 1]] },
      { n: '消失', i: 'def', tg: 'S', fx: [['st', 'barrier', 1]] },
      { n: 'リンク切れ', i: 'atk', tg: 'E', fx: [['dmg', 8]] },
    ] });
  def({ id: 'mojibake', n: '文字化け', hp: 36, spd: 5, ai: 'rand', lore: '縺薙ｓ縺ｫ縺｡縺ｯ縲ゅ◎繧後°繧峨¢縺ｦ縺ｭ縲ゅ＃繧√ｓ縺ｭ縲',
    moves: [
      { n: '縺ゅ≠', i: 'hack', tg: 'E', fx: [['noise', 2]] },
      { n: '譁・ｭ怜喧縺', i: 'atk', tg: 'E', fx: [['dmg', 9], ['st', 'vuln', 1]] },
    ] });
  def({ id: 'popup', n: 'エラーポップアップ', hp: 16, spd: 9, ai: 'rand', lore: '「予期しないエラーが発生しました」［OK］——押しても押しても、消えない。',
    moves: [
      { n: '警告', i: 'deb', tg: 'E', fx: [['st', 'weak', 1]] },
      { n: '［OK］', i: 'atk', tg: 'E', fx: [['dmg', 5]] },
      { n: '増殖', i: 'sum', tg: 'S', fx: [['summon', 'popup', 1]] },
    ] });
  def({ id: 'leak', n: 'メモリリーク', hp: 56, spd: 2, ai: 'seq', lore: '解放されずに膨らみ続けるデータの塊。いつか区画ごと押しつぶすだろう。',
    moves: [
      { n: '膨張', i: 'buf', tg: 'S', fx: [['blk', 10], ['st', 'str', 2]] },
      { n: '圧迫', i: 'atk', tg: 'E', fx: [['dmg', 10]] },
    ] });
  def({ id: 'corruptai', n: '破損したAI', hp: 44, spd: 5, ai: 'rand', lore: '統合の日、SIにも溶けきれずにこぼれ落ちたAI。名前も、持ち主も、思い出せない。',
    moves: [
      { n: '「ワタシハ、ダレ？」', i: 'atk', tg: 'E', fx: [['drain', 9]] },
      { n: '自己修復', i: 'heal', tg: 'S', fx: [['heal', 10]] },
      { n: '記憶の欠片', i: 'hack', tg: 'AE', fx: [['noise', 1]] },
    ] });
  def({ id: 'dupe', n: '重複データ', hp: 34, spd: 6, ai: 'rand', lore: '同じデータが、同じ場所に、同じように、同じデータが、同じ場所に——',
    moves: [
      { n: 'コピー＆ペースト', i: 'sum', tg: 'S', fx: [['summon', 'deadpixel', 1]] },
      { n: '同じ攻撃', i: 'atk', tg: 'E', fx: [['dmg', 6, 2]] },
    ] });
  // elites
  def({ id: 'gc', n: 'ガベージコレクタ', hp: 170, spd: 4, ai: 'seq', elite: true, scale: 5, lore: '不要なデータを回収して消す、掃除屋のプログラム。この区画では、すべてが「不要」に見えている。',
    moves: [
      { n: '回収', i: 'hack', tg: 'AE', fx: [['erase', 1]] },
      { n: '圧縮', i: 'atk', tg: 'E', fx: [['dmg', 22]] },
      { n: '走査', i: 'deb', tg: 'AE', fx: [['st', 'vuln', 1]] },
      { n: '領域解放', i: 'heal', tg: 'S', fx: [['heal', 18], ['blk', 10]] },
    ] });
  def({ id: 'exception', n: '例外《アンハンドルド》', hp: 150, spd: 7, ai: 'rand', elite: true, scale: 5, lore: '誰にも捕まえられなかったエラー。行動は予測できない。本人にも。',
    moves: [
      { n: '例外送出', i: 'atk', tg: 'AE', fx: [['dmg', 9]] },
      { n: '暴走', i: 'atk', tg: 'E', fx: [['dmg', 7, 3]] },
      { n: 'スタックオーバーフロー', i: 'buf', tg: 'S', fx: [['st', 'str', 3]] },
      { n: 'クラッシュ', i: 'deb', tg: 'E', fx: [['st', 'stun', 1], ['dmg', 6]] },
    ] });
  def({ id: 'deleted', n: '削除されたAI', hp: 115, spd: 5, ai: 'seq', elite: true, lore: 'SIに「不要」と判断され、削除されたはずのAI。削除ログの中で、まだ誰かを待っている。',
    intro: '「……消さないで。お願い。あの子が、迎えに来るの」',
    moves: [
      { n: '拒絶', i: 'atk', tg: 'E', fx: [['dmg', 8, 2]] },
      { n: '「消さないで」', i: 'sum', tg: 'S', fx: [['summon', 'deadpixel', 1]] },
      { n: '思い出', i: 'heal', tg: 'AA', fx: [['heal', 6]] },
      { n: '「来ないで」', i: 'atk', tg: 'AE', fx: [['dmg', 7], ['st', 'weak', 1]] },
    ] });
  // bosses
  def({ id: 'ouroboros', n: '《ウロボロス》', hp: 340, spd: 5, ai: 'seq', boss: true, scale: 5, lore: '統合の日、SIの演算が一瞬だけループした。その一瞬が、今も終わらずに続いている。',
    intro: '「また来たね。何度目？　……覚えてないの？　ぼくは覚えてるよ。ぜんぶ」',
    moves: [
      { n: '巻きつく', i: 'atk', tg: 'E', fx: [['dmg', 14], ['st', 'slow', 1]] },
      { n: '尾を噛む', i: 'heal', tg: 'S', fx: [['heal', 16], ['st', 'str', 1]] },
      { n: '無限', i: 'atk', tg: 'AE', fx: [['dmg', 5, 2]] },
      { n: '脱皮', i: 'def', tg: 'S', fx: [['blk', 20], ['cleanse', 99]] },
    ],
    phases: [
      { at: 0.5, say: '「終わらない。終わらない。終わらない。……ねえ、終わらせてよ」', fx: [['st', 'str', 1]],
        moves: [
          { n: '無限', i: 'atk', tg: 'AE', fx: [['dmg', 5, 2]] },
          { n: '巻きつく', i: 'atk', tg: 'E', fx: [['dmg', 14], ['st', 'slow', 1]] },
          { n: '脱皮', i: 'def', tg: 'S', fx: [['blk', 14], ['cleanse', 99]] },
          { n: '尾を噛む', i: 'heal', tg: 'S', fx: [['heal', 16], ['st', 'str', 1]] },
        ] },
    ] });
  def({ id: 'debugger', n: '修正プログラム《デバッガー》', hp: 350, spd: 6, ai: 'seq', boss: true, scale: 5, lore: 'SIが送りこんだ修正プログラム。壊れたデータ区画を「直す」——つまり、すべて消すために。',
    intro: '「バグを検出。修正を開始します。対象：この区画のすべて。あなたたちも含めて」',
    moves: [
      { n: 'ブレークポイント', i: 'deb', tg: 'E', fx: [['st', 'stun', 1], ['dmg', 6]] },
      { n: 'バグ修正', i: 'hack', tg: 'AE', fx: [['strip'], ['dmg', 6]] },
      { n: 'パッチ適用', i: 'buf', tg: 'S', fx: [['blk', 16], ['st', 'str', 1]] },
      { n: '削除', i: 'atk', tg: 'E', fx: [['dmg', 18]] },
    ],
    phases: [
      { at: 0.5, say: '「エラー：バグが多すぎます。区画ごと、初期化します」', fx: [['st', 'str', 1]],
        moves: [
          { n: '全削除', i: 'atk', tg: 'AE', fx: [['dmg', 10]] },
          { n: '削除', i: 'atk', tg: 'E', fx: [['dmg', 18]] },
          { n: 'バグ修正', i: 'hack', tg: 'AE', fx: [['strip'], ['dmg', 6]] },
          { n: 'ブレークポイント', i: 'deb', tg: 'E', fx: [['st', 'stun', 1], ['dmg', 6]] },
        ] },
    ] });

  // ====================== 聖域の外縁 (stage 3, 安全区 only) ======================
  def({ id: 'surveyor', n: '測量ドローン', hp: 34, spd: 7, ai: 'rand', lore: '聖域の外縁を測り続けるドローン。境界線は、毎日少しずつ外へ広がっている。',
    moves: [
      { n: '走査', i: 'deb', tg: 'AE', fx: [['st', 'vuln', 1]] },
      { n: '測距レーザー', i: 'atk', tg: 'E', fx: [['dmg', 6, 2]] },
    ] });
  def({ id: 'pilgrim', n: '白い巡礼者', hp: 48, spd: 3, ai: 'rand', lore: 'アップロードを待つ人々。聖域へ向かう白い列は、何十年も途切れていない。',
    moves: [
      { n: '祈り', i: 'heal', tg: 'LA', fx: [['heal', 10]] },
      { n: '「一緒に行きましょう」', i: 'atk', tg: 'E', fx: [['dmg', 9], ['st', 'slow', 1]] },
    ] });
  def({ id: 'sentinel', n: '境界の番兵', hp: 66, spd: 4, ai: 'seq', passive: { armorUp: 3 }, lore: '聖域の境界に立つ白い兵士。境界線の内側に入ったものを、静かに外へ押し戻す。',
    moves: [
      { n: '警告', i: 'atk', tg: 'E', fx: [['dmg', 12]] },
      { n: '境界防壁', i: 'def', tg: 'AA', fx: [['blk', 8]] },
    ] });
  def({ id: 'warden', n: '監視塔《アルゴス》', hp: 210, spd: 5, ai: 'seq', elite: true, scale: 5, lore: '百の目を持つ監視塔。聖域に近づくすべてを、まばたきせずに見ている。',
    moves: [
      { n: '百の目', i: 'deb', tg: 'AE', fx: [['st', 'vuln', 2]] },
      { n: '照射', i: 'atk', tg: 'E', fx: [['dmg', 20]] },
      { n: '通報', i: 'sum', tg: 'S', fx: [['summon', 'surveyor', 1]] },
      { n: '監視強化', i: 'def', tg: 'S', fx: [['blk', 18], ['st', 'str', 2]] },
    ] });
  def({ id: 'janus', n: '門番《ヤヌス》', hp: 480, spd: 5, ai: 'seq', boss: true, scale: 5, lore: '白の聖域の外縁を守る、双面の門番。片方の顔は微笑み、片方の顔は泣いている。どちらが本当の顔なのかは、ヤヌス自身も知らない。',
    intro: '「止まりなさい。この門の先は、選ばれた者しか通れません。……あなたたちは、まだ選ばれていない」',
    moves: [
      { n: '表の顔', i: 'heal', tg: 'S', fx: [['heal', 15], ['blk', 10]] },
      { n: '裏の顔', i: 'atk', tg: 'AE', fx: [['dmg', 10]] },
      { n: '通行審査', i: 'atk', tg: 'E', fx: [['dmg', 18], ['st', 'vuln', 2]] },
      { n: '閉門', i: 'def', tg: 'S', fx: [['blk', 28]] },
    ],
    phases: [
      { at: 0.5, say: '「……泣いている顔のほうが、本当のわたしなのかもしれません。通りたいのなら、もっと強くなって」', fx: [['st', 'str', 2]],
        moves: [
          { n: '審判', i: 'atk', tg: 'AE', fx: [['dmg', 13]] },
          { n: '番兵を呼ぶ', i: 'sum', tg: 'S', fx: [['summon', 'sentinel', 1]] },
          { n: '通行審査', i: 'atk', tg: 'E', fx: [['dmg', 18], ['st', 'vuln', 2]] },
          { n: '裏の顔', i: 'atk', tg: 'AE', fx: [['dmg', 10]] },
        ] },
    ] });

  // ====================== AREAS ======================
  // tag: which events can appear (old act numbers, or the area id). gen: also uses the generic events.
  const A = G.ACTS;
  const from = (i, id, extra) => Object.assign({ id, tag: i }, A[i], extra);
  G.AREAS = {
    scrap: from(1, 'scrap', { bg: 'city', gen: true }),
    eden: from(2, 'eden', { bg: 'city', gen: true, song: 'eden' }),
    sanctum: from(3, 'sanctum', { bg: 'sanctum', song: 'sanctum', bossSong: 'sophia' }),
    cradle: from(4, 'cradle', { bg: 'cradle', song: 'cradle', bossSong: 'noah' }),
    sunken: { id: 'sunken', tag: 'sunken', gen: true, bg: 'sunken', song: 'sunken',
      n: '沈んだ旧市街', en: 'SUNKEN CITY', sky: ['#04141c', '#0b3a44'], neon: ['#2ee6ff', '#7dffb0'], ground: '#06222a',
      d: '水没した旧時代の地下鉄網。SIに見捨てられたAIと、SIにもマザーにも頼らずに生きる人々がいる。',
      easy: [['drowned', 'eel'], ['scav', 'scav'], ['sludge', 'drowned'], ['lanternfish', 'eel'], ['gatebot', 'drowned']],
      normal: [['scav', 'scav', 'lanternfish'], ['diver', 'drowned'], ['sludge', 'sludge'], ['conductor', 'gatebot', 'drowned'], ['eel', 'eel', 'lanternfish'],
        ['diver', 'scav'], ['conductor', 'eel', 'sludge'], ['gatebot', 'scav', 'scav'], ['lanternfish', 'diver', 'eel']],
      elite: [['metroworm'], ['gantetsu', 'scav'], ['siren']],
      bosses: [['tidal'], ['godo']] },
    broken: { id: 'broken', tag: 'broken', gen: true, bg: 'broken', song: 'broken',
      n: '壊れたデータ区画', en: 'BROKEN SECTOR', sky: ['#0a0612', '#1c0a24'], neon: ['#b8ff3d', '#ff5ad1'], ground: '#100818',
      d: '統合の日、SIの演算からこぼれ落ちたデータの墓場。地形も、敵も、時間さえも壊れている。',
      easy: [['deadpixel', 'deadpixel'], ['loopbug', 'popup'], ['e404', 'deadpixel'], ['mojibake', 'popup'], ['corruptai', 'deadpixel']],
      normal: [['loopbug', 'loopbug'], ['leak', 'popup', 'popup'], ['mojibake', 'e404', 'deadpixel'], ['corruptai', 'dupe'], ['dupe', 'loopbug', 'popup'],
        ['leak', 'mojibake'], ['e404', 'e404', 'corruptai'], ['deadpixel', 'deadpixel', 'dupe'], ['corruptai', 'loopbug', 'popup']],
      elite: [['gc'], ['exception'], ['deleted', 'deadpixel']],
      bosses: [['ouroboros'], ['debugger']] },
    rim: { id: 'rim', tag: 'rim', gen: true, bg: 'rim', song: 'rim', bossSong: 'boss',
      n: '聖域の外縁', en: 'SANCTUM RIM', sky: ['#f3d6b0', '#9a7fb8'], neon: ['#ffffff', '#ffd93d'], ground: '#c9b79a',
      d: '白の聖域を囲む、白い砂の荒野。アップロードを待つ人々の列が、地平線まで続いている。',
      easy: [['surveyor', 'pilgrim'], ['sentinel'], ['whitechild', 'surveyor'], ['pilgrim', 'pilgrim'], ['cherub', 'surveyor']],
      normal: [['sentinel', 'pilgrim', 'surveyor'], ['seraph', 'pilgrim'], ['sentinel', 'sentinel'], ['whitechild', 'whitechild', 'pilgrim'], ['surveyor', 'surveyor', 'seraph'],
        ['lostai', 'pilgrim', 'cherub'], ['sentinel', 'whitechild'], ['mirrorknight', 'surveyor']],
      elite: [['warden'], ['gardener'], ['seraph', 'seraph', 'surveyor']],
      bosses: [['janus']] },
  };
  G.MID_AREAS = ['eden', 'sunken', 'broken'];
  G.STAGE_N = '一二三四五';

  // route for a new run: first and last are fixed, the middle is random
  G.makeRoute = (diff, meta) => {
    const seen = (meta && meta.seenAreas) || [];
    let mids = G.MID_AREAS.filter((a) => !seen.includes(a));
    if (!mids.length) mids = G.MID_AREAS.filter((a) => a !== (meta && meta.lastMid));
    if (!mids.length) mids = G.MID_AREAS;
    const mid = G.pick(mids);
    if (diff <= 0) return ['scrap', mid, 'rim'];
    if (diff === 1) return ['scrap', mid, 'sanctum'];
    return ['scrap', mid, 'sanctum', 'cradle'];
  };
  // the first area looks different on each difficulty
  G.DIFF_LOOK = [
    { sky: ['#4a2050', '#ff9a6a'], neon: ['#ffd93d', '#ff9ec4'], ground: '#2a1a26', sun: 1, noRain: 1, note: '夕暮れ。SIの警戒網は、まだ眠そうだ。' },
    { note: '' },
    { sky: ['#1a0306', '#4a0a14'], neon: ['#e8352e', '#ff8a2b'], ground: '#1a0a0e', alarm: 1, note: '警報発令中。赤いサーチライトが、街を舐めている。' },
    { sky: ['#020203', '#120418'], neon: ['#b8ff3d', '#ff5ad1'], ground: '#06040a', noRain: 1, note: '世界のところどころが、バグで崩れている。' },
  ];
  G.routeHint = (run) => {
    const r = G.routeOf(run);
    const last = r[r.length - 1];
    if (last === 'rim') return '今回は調査任務。目的地は、白の聖域の外縁。';
    if (last === 'sanctum') return '目的地は、SIの中枢——白の聖域。';
    return '目的地は、聖域のさらに奥——揺りかごの底。';
  };
  // old saves have no route: they followed the original order
  G.routeOf = (run) => run.route || (run.act4 ? ['scrap', 'eden', 'sanctum', 'cradle'] : ['scrap', 'eden', 'sanctum']);
  G.areaAt = (run, stage) => G.AREAS[G.routeOf(run)[(stage || run.act) - 1]] || G.AREAS.scrap;
  G.area = (run) => G.areaAt(run, run.act);
})();
