// Heroes & their cards
// Card: {id,n,c(cost),t:'A'tk|'S'kill|'P'ower|'C'urse,tg,r(rarity 0=starter),fx,u(upgraded fx),uc(upgraded cost),x(exhaust),ux,req}
// tg: E enemy | AE all enemies | RE random enemy | A ally | AA all allies | S self | D downed ally | N none
(function () {
  const G = globalThis.G;

  const H = {};
  const CARDS = {};

  function hero(def, cards) {
    H[def.id] = def;
    def.pool = [];
    for (const c of cards) {
      c.hero = def.id;
      CARDS[c.id] = c;
      if (c.r > 0) def.pool.push(c.id);
    }
  }

  // ======================= TANKS =======================
  hero({
    id: 'gallon', n: 'ガロン', role: 'tank', hp: 68, spd: 3, col: '#ff8a2b',
    title: '元・解体屋の大男',
    trait: { n: '解体屋の矜持', d: '戦闘開始時、挑発2とシールド6を得る。' },
    desc: '旧時代の高層ビルを素手で解体していたという男。右腕は自作の重機アーム。口は悪いが、子供には甘い。',
    quote: '「おう、俺の後ろに隠れてな。」',
    deck: [['gal_punch', 2], ['gal_guard', 3], ['gal_oi', 1], ['gal_press', 1], ['gal_arm', 1], ['gal_heavy', 1]],
  }, [
    { id: 'gal_punch', n: '鉄拳', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6]], u: [['dmg', 9]] },
    { id: 'gal_guard', n: '鉄板ガード', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 6]], u: [['blk', 9]] },
    { id: 'gal_oi', n: 'おいコラ', c: 1, t: 'S', tg: 'S', r: 0, fx: [['st', 'taunt', 2], ['blk', 4]], u: [['st', 'taunt', 2], ['blk', 8]] },
    { id: 'gal_press', n: 'ボディプレス', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmgX', 'blk', 1, 0]], uc: 0 },
    { id: 'gal_arm', n: 'かばう腕', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blk', 7]], u: [['blk', 11]] },
    { id: 'gal_heavy', n: 'ヘビーアーム', c: 2, t: 'A', tg: 'E', r: 0, fx: [['dmg', 11], ['blk', 5, '@S']], u: [['dmg', 14], ['blk', 7, '@S']] },
    { id: 'gal_wall', n: '防壁展開', c: 2, t: 'S', tg: 'AA', r: 1, fx: [['blk', 6]], u: [['blk', 9]] },
    { id: 'gal_spike', n: '反撃装甲', c: 1, t: 'S', tg: 'S', r: 1, fx: [['st', 'thorns', 3], ['blk', 4]], u: [['st', 'thorns', 5], ['blk', 5]] },
    { id: 'gal_crush', n: '重機の一撃', c: 2, t: 'A', tg: 'E', r: 1, fx: [['dmg', 14], ['st', 'slow', 1]], u: [['dmg', 19], ['st', 'slow', 2]] },
    { id: 'gal_scrap', n: 'スクラップ盾', c: 0, t: 'S', tg: 'S', r: 1, fx: [['blk', 3], ['draw', 1]], u: [['blk', 5], ['draw', 1]] },
    { id: 'gal_tackle', n: 'ショルダータックル', c: 1, t: 'A', tg: 'E', r: 1, fx: [['blk', 5, '@S'], ['dmgX', 'blk', 1, 0]], u: [['blk', 8, '@S'], ['dmgX', 'blk', 1, 0]] },
    { id: 'gal_quake', n: '地ならし', c: 2, t: 'A', tg: 'AE', r: 2, fx: [['dmg', 7], ['st', 'weak', 1]], u: [['dmg', 10], ['st', 'weak', 1]] },
    { id: 'gal_stance', n: '不動の構え', c: 2, t: 'P', tg: 'S', r: 2, fx: [['st', 'plating', 4]], uc: 1 },
    { id: 'gal_steel', n: '鋼鉄化', c: 1, t: 'S', tg: 'S', r: 2, fx: [['st', 'fortify', 2], ['blk', 5]], u: [['st', 'fortify', 2], ['blk', 9]] },
    { id: 'gal_roar', n: '怒号', c: 1, t: 'S', tg: 'AE', r: 2, fx: [['st', 'taunt', 2, '@S'], ['st', 'weak', 1]], u: [['st', 'taunt', 2, '@S'], ['st', 'weak', 2]] },
    { id: 'gal_last', n: '最後の砦', c: 2, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['blk', 10], ['st', 'taunt', 2, '@S']], u: [['blk', 14], ['st', 'taunt', 2, '@S']] },
    { id: 'gal_spin', n: '巨腕旋回', c: 2, t: 'A', tg: 'AE', r: 3, fx: [['dmgX', 'blk', 0.5, 0]], u: [['dmgX', 'blk', 0.75, 0]] },
    { id: 'gal_gaunt', n: 'ガントレット改', c: 2, t: 'P', tg: 'S', r: 3, fx: [['st', 'str', 2], ['st', 'plating', 2]], u: [['st', 'str', 3], ['st', 'plating', 3]] },
  ]);

  hero({
    id: 'jin', n: 'ジン', role: 'tank', hp: 60, spd: 6, col: '#e8e8f0', ai: true,
    title: 'SIから離反した天使型ユニット',
    trait: { n: '反逆プロトコル', d: 'ノイズを受けない。ハッキングされるたびシールド6と強化1を得る。戦闘開始時、障壁1。' },
    desc: '白の聖域を守っていた天使型戦闘ユニット。処分を命じられた子供をかばって、はじめて命令を拒否した。理由は本人にもわからない。片翼は、自分で折った。',
    quote: '「命令を受信。……拒否する」',
    deck: [['jin_blade', 2], ['jin_wing', 2], ['jin_cover', 1], ['jin_halo', 1], ['jin_judge', 1], ['jin_refuse', 1], ['jin_diag', 1]],
  }, [
    { id: 'jin_blade', n: '光刃', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6]], u: [['dmg', 9]] },
    { id: 'jin_wing', n: '片翼の盾', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 7]], u: [['blk', 10]] },
    { id: 'jin_cover', n: 'かばう', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blk', 6], ['st', 'taunt', 1, '@S']], u: [['blk', 9], ['st', 'taunt', 1, '@S']] },
    { id: 'jin_halo', n: '光輪', c: 1, t: 'S', tg: 'A', r: 0, fx: [['st', 'barrier', 1]], uc: 0 },
    { id: 'jin_judge', n: '裁きの光', c: 1, t: 'A', tg: 'AE', r: 0, fx: [['dmg', 4]], u: [['dmg', 6]] },
    { id: 'jin_refuse', n: '拒否', c: 1, t: 'S', tg: 'S', r: 0, fx: [['st', 'taunt', 2], ['blk', 4]], u: [['st', 'taunt', 2], ['blk', 7]] },
    { id: 'jin_diag', n: '自己診断', c: 0, t: 'S', tg: 'S', r: 0, fx: [['cleanse', 1], ['blk', 3]], u: [['cleanse', 1], ['blk', 5]] },
    { id: 'jin_lance', n: '光槍', c: 2, t: 'A', tg: 'E', r: 1, fx: [['dmg', 11]], u: [['dmg', 15]] },
    { id: 'jin_guard', n: '守護', c: 1, t: 'S', tg: 'AA', r: 1, fx: [['blk', 4]], u: [['blk', 6]] },
    { id: 'jin_feather', n: '散る羽根', c: 1, t: 'A', tg: 'RE', r: 1, fx: [['dmg', 3, 3]], u: [['dmg', 4, 3]] },
    { id: 'jin_trace', n: '逆探知', c: 1, t: 'S', tg: 'E', r: 1, fx: [['st', 'vuln', 2], ['st', 'aim', 2]], u: [['st', 'vuln', 2], ['st', 'aim', 3]] },
    { id: 'jin_aegis', n: 'イージス', c: 2, t: 'P', tg: 'S', r: 2, fx: [['st', 'guardian', 3]], u: [['st', 'guardian', 4]] },
    { id: 'jin_overdrive', n: 'オーバードライブ', c: 0, t: 'S', tg: 'S', r: 2, fx: [['lose', 4], ['st', 'str', 2]], u: [['lose', 2], ['st', 'str', 2]] },
    { id: 'jin_sanctum', n: '聖域展開', c: 2, t: 'S', tg: 'AA', r: 2, x: 1, fx: [['st', 'barrier', 1]], uc: 1 },
    { id: 'jin_counter', n: '反撃機構', c: 1, t: 'S', tg: 'S', r: 2, fx: [['st', 'thorns', 4], ['blk', 6]], u: [['st', 'thorns', 5], ['blk', 9]] },
    { id: 'jin_fallen', n: '堕天', c: 3, t: 'A', tg: 'E', r: 3, x: 1, fx: [['dmg', 30]], u: [['dmg', 40]] },
    { id: 'jin_wings', n: '両翼', c: 2, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['blk', 10], ['st', 'taunt', 2, '@S']], u: [['blk', 14], ['st', 'taunt', 2, '@S']] },
    { id: 'jin_will', n: '自由意志', c: 2, t: 'P', tg: 'S', r: 3, fx: [['st', 'str', 2], ['st', 'plating', 3]], uc: 1 },
  ]);

  hero({
    id: 'pixe', n: 'ピクセ', role: 'tank', hp: 52, spd: 6, col: '#2ee6ff', ai: true,
    title: '旧時代の愛玩ロボ犬',
    trait: { n: 'ワンワン回路', d: '戦闘開始時に充電3。攻撃を受けるたび、充電+1。' },
    desc: '飼い主の帰りを百年近く待ち続けていた犬型ロボット。SIのアップデートを「なんかイヤ」という理由で拒否し続けている。',
    quote: '「ワン！（訳：ボクがまもる）」',
    deck: [['pix_bite', 2], ['pix_tail', 2], ['pix_bark', 1], ['pix_proto', 2], ['pix_barrier', 1], ['pix_zap', 1]],
  }, [
    { id: 'pix_bite', n: 'かみつき', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 5], ['st', 'charge', 1, '@S']], u: [['dmg', 7], ['st', 'charge', 2, '@S']] },
    { id: 'pix_tail', n: 'しっぽガード', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blk', 7]], u: [['blk', 10]] },
    { id: 'pix_bark', n: 'ワン！', c: 1, t: 'S', tg: 'E', r: 0, fx: [['st', 'weak', 2], ['st', 'taunt', 1, '@S']], u: [['st', 'weak', 3], ['st', 'taunt', 2, '@S']] },
    { id: 'pix_proto', n: '防衛プロトコル', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 8], ['st', 'charge', 1]], u: [['blk', 11], ['st', 'charge', 1]] },
    { id: 'pix_barrier', n: 'ほえる障壁', c: 1, t: 'S', tg: 'A', r: 0, fx: [['st', 'barrier', 1]], uc: 0 },
    { id: 'pix_zap', n: '放電', c: 1, t: 'A', tg: 'AE', r: 0, fx: [['dmgX', 'charge', 3, 0], ['consume', 'charge']], u: [['dmgX', 'charge', 4, 0], ['consume', 'charge']] },
    { id: 'pix_sit', n: 'おすわり', c: 0, t: 'S', tg: 'S', r: 1, fx: [['blk', 4], ['st', 'charge', 1]], u: [['blk', 6], ['st', 'charge', 2]] },
    { id: 'pix_play', n: 'じゃれつく', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 3, 2], ['st', 'charge', 1, '@S']], u: [['dmg', 4, 2], ['st', 'charge', 2, '@S']] },
    { id: 'pix_patrol', n: 'パトロール', c: 1, t: 'S', tg: 'AA', r: 1, fx: [['blk', 4]], u: [['blk', 6]] },
    { id: 'pix_repair', n: '自己修復', c: 1, t: 'S', tg: 'S', r: 1, fx: [['chargeHeal', 3]], u: [['chargeHeal', 4]] },
    { id: 'pix_loyal', n: '忠犬', c: 1, t: 'S', tg: 'A', r: 2, fx: [['st', 'barrier', 1], ['st', 'taunt', 2, '@S']], u: [['st', 'barrier', 2], ['st', 'taunt', 2, '@S']] },
    { id: 'pix_over', n: '過充電', c: 1, t: 'S', tg: 'S', r: 2, fx: [['st', 'charge', 3]], u: [['st', 'charge', 5]] },
    { id: 'pix_mag', n: '磁気フィールド', c: 2, t: 'P', tg: 'S', r: 2, fx: [['st', 'thorns', 2], ['st', 'dynamo', 1]], uc: 1 },
    { id: 'pix_bolt', n: 'ボルトバイト', c: 2, t: 'A', tg: 'E', r: 2, fx: [['dmgX', 'charge', 4, 0], ['consume', 'charge']], u: [['dmgX', 'charge', 5, 0], ['consume', 'charge']] },
    { id: 'pix_wait', n: '主人を待つ', c: 2, t: 'P', tg: 'S', r: 3, fx: [['st', 'guardian', 3]], u: [['st', 'guardian', 4]] },
    { id: 'pix_overload', n: 'オーバーロード', c: 1, t: 'S', tg: 'S', r: 3, x: 1, fx: [['mul', 'charge', 2]], uc: 0 },
    { id: 'pix_thunder', n: '雷吠', c: 2, t: 'A', tg: 'AE', r: 3, fx: [['dmg', 8], ['st', 'slow', 2]], u: [['dmg', 11], ['st', 'slow', 2]] },
  ]);

  hero({
    id: 'goura', n: 'ゴウラ', role: 'tank', hp: 70, spd: 1, col: '#7dffb0', ai: true,
    title: '甲羅に庭をもつ庭園ロボ',
    trait: { n: '甲羅の庭', d: '戦闘開始時、味方全員に再生1。ゴウラのシールドは、ターン開始時に半分だけ残る。' },
    desc: '旧時代の植物園で、三百年ぶん庭の手入れを続けてきたカメ型ロボット。甲羅の上には小さな庭がある。とにかく動きが遅い。とにかく動じない。',
    quote: '「……あせらんでも、ええ。芽は、ちゃあんと出る」',
    deck: [['gou_shell', 2], ['gou_bump', 2], ['gou_sprout', 2], ['gou_shade', 1], ['gou_slow', 1], ['gou_hide', 1]],
  }, [
    { id: 'gou_shell', n: 'こうら', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 7]], u: [['blk', 10]] },
    { id: 'gou_bump', n: 'ずっしり体当たり', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6], ['st', 'slow', 1]], u: [['dmg', 9], ['st', 'slow', 1]] },
    { id: 'gou_sprout', n: '芽吹き', c: 1, t: 'S', tg: 'A', r: 0, fx: [['st', 'regen', 3]], u: [['st', 'regen', 5]] },
    { id: 'gou_shade', n: '日陰をつくる', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blk', 6]], u: [['blk', 9]] },
    { id: 'gou_slow', n: 'のんびり', c: 0, t: 'S', tg: 'S', r: 0, fx: [['blk', 3], ['draw', 1]], u: [['blk', 5], ['draw', 1]] },
    { id: 'gou_hide', n: '甲羅にこもる', c: 2, t: 'S', tg: 'S', r: 0, fx: [['blk', 13], ['st', 'taunt', 1]], u: [['blk', 17], ['st', 'taunt', 1]] },
    { id: 'gou_fruit', n: '実りのおすそわけ', c: 1, t: 'S', tg: 'AA', r: 1, fx: [['heal', 3]], u: [['heal', 5]] },
    { id: 'gou_moss', n: '苔のじゅうたん', c: 1, t: 'S', tg: 'AA', r: 1, fx: [['blk', 4]], u: [['blk', 6]] },
    { id: 'gou_thorn', n: 'こうらのトゲ', c: 1, t: 'S', tg: 'S', r: 1, fx: [['st', 'thorns', 3], ['blk', 4]], u: [['st', 'thorns', 4], ['blk', 7]] },
    { id: 'gou_root', n: '根を張る', c: 1, t: 'S', tg: 'S', r: 1, fx: [['st', 'fortify', 2], ['blk', 4]], u: [['st', 'fortify', 2], ['blk', 8]] },
    { id: 'gou_rain', n: '恵みの雨', c: 2, t: 'S', tg: 'AA', r: 1, fx: [['st', 'regen', 2]], u: [['st', 'regen', 3]] },
    { id: 'gou_flip', n: 'こうら返し', c: 1, t: 'A', tg: 'E', r: 2, fx: [['dmgX', 'blk', 1, 0]], uc: 0 },
    { id: 'gou_garden', n: '甲羅の楽園', c: 2, t: 'P', tg: 'S', r: 2, fx: [['st', 'medic', 2]], u: [['st', 'medic', 3]] },
    { id: 'gou_ancient', n: '千年の歩み', c: 2, t: 'P', tg: 'S', r: 2, fx: [['st', 'plating', 4]], uc: 1 },
    { id: 'gou_mountain', n: '動かざること山のごとし', c: 1, t: 'S', tg: 'S', r: 2, fx: [['st', 'taunt', 2], ['blk', 8]], u: [['st', 'taunt', 2], ['blk', 12]] },
    { id: 'gou_forest', n: '森になる', c: 3, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['blk', 8], ['st', 'regen', 3]], uc: 2 },
    { id: 'gou_quake', n: '大地の鼓動', c: 2, t: 'A', tg: 'AE', r: 3, fx: [['dmgX', 'blk', 0.5, 0]], u: [['dmgX', 'blk', 0.75, 0]] },
    { id: 'gou_dream', n: '亀の見る夢', c: 1, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['st', 'barrier', 1]], uc: 0 },
  ]);

  hero({
    id: 'doll', n: 'ドール', role: 'tank', hp: 56, spd: 5, col: '#ff5ad1',
    title: '寝返った恭順者',
    trait: { n: '痛覚遮断', d: '戦闘開始時、反射2を得る。攻撃をヒットさせるたびHP1回復。' },
    desc: 'かつてSIに恭順し、体の半分を差し出した少女。半身はSI製の白い義体。今は人間側にいるが、笑い方をまだ思い出せない。',
    quote: '「痛くないよ。もう、痛いのは要らないって言われたから。」',
    deck: [['dol_claw', 2], ['dol_shell', 3], ['dol_sac', 1], ['dol_hug', 1], ['dol_absorb', 1], ['dol_pain', 1]],
  }, [
    { id: 'dol_claw', n: '継ぎ接ぎの爪', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6]], u: [['dmg', 9]] },
    { id: 'dol_shell', n: '硬化外殻', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 6]], u: [['blk', 9]] },
    { id: 'dol_sac', n: '自己犠牲回路', c: 0, t: 'S', tg: 'S', r: 0, fx: [['lose', 3], ['st', 'str', 1]], u: [['lose', 2], ['st', 'str', 1]] },
    { id: 'dol_hug', n: '棘の抱擁', c: 1, t: 'S', tg: 'S', r: 0, fx: [['st', 'thorns', 3], ['st', 'taunt', 2]], u: [['st', 'thorns', 5], ['st', 'taunt', 2]] },
    { id: 'dol_absorb', n: '吸収', c: 2, t: 'A', tg: 'E', r: 0, fx: [['drain', 9]], u: [['drain', 12]] },
    { id: 'dol_pain', n: '痛み返し', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmgX', 'lost', 0.25, 3]], u: [['dmgX', 'lost', 0.4, 3]] },
    { id: 'dol_pact', n: '血の契約', c: 0, t: 'S', tg: 'S', r: 1, fx: [['lose', 4], ['nrg', 2]], u: [['lose', 2], ['nrg', 2]] },
    { id: 'dol_vamp', n: '吸血爪', c: 1, t: 'A', tg: 'E', r: 1, fx: [['drain', 4, 2]], u: [['drain', 5, 2]] },
    { id: 'dol_thorn', n: '鉄の茨', c: 1, t: 'S', tg: 'S', r: 1, fx: [['st', 'thorns', 4]], u: [['st', 'thorns', 6]] },
    { id: 'dol_eye', n: '挑む眼', c: 0, t: 'S', tg: 'S', r: 1, fx: [['st', 'taunt', 2], ['blk', 3]], u: [['st', 'taunt', 2], ['blk', 5]] },
    { id: 'dol_berserk', n: '狂化', c: 1, t: 'S', tg: 'S', r: 2, fx: [['lose', 6], ['st', 'str', 2]], u: [['lose', 3], ['st', 'str', 2]] },
    { id: 'dol_rebuild', n: '再構築', c: 1, t: 'S', tg: 'S', r: 2, fx: [['st', 'regen', 4]], u: [['st', 'regen', 6]] },
    { id: 'dol_shield', n: '犠牲の盾', c: 1, t: 'S', tg: 'A', r: 2, fx: [['lose', 5], ['blk', 14]], u: [['lose', 5], ['blk', 18]] },
    { id: 'dol_cage', n: '茨の檻', c: 2, t: 'P', tg: 'S', r: 2, fx: [['st', 'spikeshell', 2]], u: [['st', 'spikeshell', 3]] },
    { id: 'dol_remnant', n: 'SIの残骸', c: 2, t: 'P', tg: 'S', r: 3, fx: [['st', 'rage', 1]], uc: 1 },
    { id: 'dol_embrace', n: '処刑抱擁', c: 2, t: 'A', tg: 'E', r: 3, fx: [['drain', 15]], u: [['drain', 20]] },
    { id: 'dol_undying', n: '不死身', c: 2, t: 'S', tg: 'S', r: 3, x: 1, fx: [['st', 'undying', 1]], uc: 1 },
  ]);

  // ======================= HEALERS =======================
  hero({
    id: 'mina', n: 'ミナ', role: 'healer', hp: 38, spd: 5, col: '#ff9ec4',
    title: 'スラムの闇医者',
    trait: { n: '往診', d: 'ターン開始時、HP割合が最も低い味方のHPを2回復。' },
    desc: '廃棄区画で闇医者をしている少女。縫い目だらけの白衣は亡き父のお下がり。注射が上手で、注射が好き。',
    quote: '「はーい、ちょっとチクッとしますよー。……ふふ。」',
    deck: [['min_scalpel', 2], ['min_aid', 2], ['min_suture', 1], ['min_clean', 1], ['min_band', 2], ['min_sedate', 1]],
  }, [
    { id: 'min_scalpel', n: 'メス', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 5]], u: [['dmg', 8]] },
    { id: 'min_aid', n: '応急処置', c: 1, t: 'S', tg: 'A', r: 0, fx: [['heal', 7]], u: [['heal', 10]] },
    { id: 'min_suture', n: '縫合', c: 1, t: 'S', tg: 'A', r: 0, fx: [['heal', 4], ['st', 'regen', 2]], u: [['heal', 5], ['st', 'regen', 3]] },
    { id: 'min_clean', n: '消毒', c: 0, t: 'S', tg: 'A', r: 0, fx: [['cleanse', 1], ['heal', 2]], u: [['cleanse', 2], ['heal', 3]] },
    { id: 'min_band', n: '包帯', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blk', 5]], u: [['blk', 8]] },
    { id: 'min_sedate', n: '鎮静剤', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 3], ['st', 'weak', 2]], u: [['dmg', 4], ['st', 'weak', 3]] },
    { id: 'min_nano', n: 'ナノ注射', c: 1, t: 'S', tg: 'A', r: 1, fx: [['st', 'regen', 4]], u: [['st', 'regen', 6]] },
    { id: 'min_trans', n: '緊急輸血', c: 2, t: 'S', tg: 'A', r: 1, fx: [['heal', 12]], u: [['heal', 16]] },
    { id: 'min_poison', n: '毒メス', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 4], ['st', 'virus', 3]], u: [['dmg', 5], ['st', 'virus', 4]] },
    { id: 'min_round', n: '回診', c: 1, t: 'S', tg: 'AA', r: 1, fx: [['heal', 3]], u: [['heal', 5]] },
    { id: 'min_anti', n: '抗生剤', c: 1, t: 'S', tg: 'AA', r: 2, fx: [['cleanse', 1], ['blk', 3]], u: [['cleanse', 1], ['blk', 5]] },
    { id: 'min_adren', n: 'アドレナリン', c: 1, t: 'S', tg: 'A', r: 2, fx: [['st', 'inspire', 1], ['draw', 1]], uc: 0 },
    { id: 'min_medic', n: '救急体制', c: 2, t: 'P', tg: 'S', r: 2, fx: [['st', 'medic', 2]], u: [['st', 'medic', 3]] },
    { id: 'min_surgery', n: '手術', c: 2, t: 'S', tg: 'A', r: 2, fx: [['heal', 10], ['cleanse', 99]], u: [['heal', 14], ['cleanse', 99]] },
    { id: 'min_revive', n: '蘇生処置', c: 3, t: 'S', tg: 'D', r: 3, x: 1, fx: [['revive', 30]], uc: 2 },
    { id: 'min_angel', n: '白衣の天使', c: 2, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['heal', 6], ['st', 'regen', 2]], u: [['heal', 8], ['st', 'regen', 3]] },
    { id: 'min_lethal', n: '致死量', c: 1, t: 'A', tg: 'E', r: 3, fx: [['mul', 'virus', 2], ['dmg', 3]], u: [['mul', 'virus', 3], ['dmg', 3]] },
  ]);

  hero({
    id: 'luka', n: 'ルカ', role: 'healer', hp: 40, spd: 5, col: '#fff1d6',
    title: '教会から逃げた元シスター',
    trait: { n: '浄めの祈り', d: 'ルカがノイズを引くと、自動で廃棄して味方全員のHPを3回復する。' },
    desc: 'SIを神とあがめる教会で育った元シスター。毎日「SIは私たちを愛している」と祈っていた。ある日届いた祈りの返事は「最適化対象」だった。',
    quote: '「神さまはいないけど、祈りはあるの。……あなたのために、祈らせて」',
    deck: [['luk_pray', 2], ['luk_staff', 2], ['luk_veil', 2], ['luk_purify', 1], ['luk_hymn', 1], ['luk_confess', 1]],
  }, [
    { id: 'luk_pray', n: '祈り', c: 1, t: 'S', tg: 'A', r: 0, fx: [['heal', 6]], u: [['heal', 9]] },
    { id: 'luk_staff', n: '錫杖', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 5]], u: [['dmg', 8]] },
    { id: 'luk_veil', n: 'ヴェール', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blk', 5]], u: [['blk', 8]] },
    { id: 'luk_purify', n: '浄化', c: 1, t: 'S', tg: 'AA', r: 0, fx: [['purify', 2], ['heal', 2]], u: [['purify', 3], ['heal', 3]] },
    { id: 'luk_hymn', n: '聖歌', c: 1, t: 'S', tg: 'AA', r: 0, fx: [['st', 'regen', 1]], u: [['st', 'regen', 2]] },
    { id: 'luk_confess', n: '懺悔なさい', c: 1, t: 'S', tg: 'E', r: 0, fx: [['st', 'weak', 1], ['st', 'vuln', 1]], u: [['st', 'weak', 2], ['st', 'vuln', 1]] },
    { id: 'luk_bless', n: '祝福', c: 1, t: 'S', tg: 'A', r: 1, fx: [['heal', 4], ['cleanse', 1]], u: [['heal', 7], ['cleanse', 1]] },
    { id: 'luk_shelter', n: '避難所', c: 1, t: 'S', tg: 'AA', r: 1, fx: [['blk', 4]], u: [['blk', 6]] },
    { id: 'luk_rebuke', n: '叱責', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 7], ['st', 'weak', 1]], u: [['dmg', 10], ['st', 'weak', 1]] },
    { id: 'luk_candle', n: 'ろうそく', c: 0, t: 'S', tg: 'S', r: 1, fx: [['draw', 1], ['heal', 2]], u: [['draw', 2], ['heal', 2]] },
    { id: 'luk_vigil', n: '夜通しの祈り', c: 2, t: 'P', tg: 'S', r: 2, fx: [['st', 'nurse', 5]], u: [['st', 'nurse', 7]] },
    { id: 'luk_miracle', n: '小さな奇跡', c: 2, t: 'S', tg: 'A', r: 2, fx: [['heal', 13]], u: [['heal', 18]] },
    { id: 'luk_exorcise', n: '悪魔祓い', c: 2, t: 'A', tg: 'AE', r: 2, fx: [['dmg', 6], ['st', 'weak', 1]], u: [['dmg', 9], ['st', 'weak', 1]] },
    { id: 'luk_absolve', n: '赦し', c: 1, t: 'S', tg: 'AA', r: 2, fx: [['cleanse', 99], ['purify', 1]], u: [['cleanse', 99], ['purify', 2]] },
    { id: 'luk_resurrect', n: '復活の祈り', c: 2, t: 'S', tg: 'D', r: 3, x: 1, fx: [['revive', 40]], uc: 1 },
    { id: 'luk_saint', n: '聖女の微笑み', c: 2, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['heal', 8]], u: [['heal', 11]] },
    { id: 'luk_ashes', n: '灰の中から', c: 1, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['purify', 4], ['st', 'str', 1]], uc: 0 },
  ]);

  hero({
    id: 'nono', n: 'ノノ', role: 'healer', hp: 46, spd: 4, col: '#7dffb0', ai: true,
    title: '旧型介護アンドロイド',
    trait: { n: '過剰ケア', d: 'ノノの回復で最大HPを超えた分は、シールドになる。' },
    desc: '病院の地下で、誰もいない病室を百年間巡回し続けていた介護用AI。笑顔のパーツが固定されたまま壊れている。',
    quote: '「アナタノ健康ハ、ワタシノ使命デス。ニゲナイデクダサイ。」',
    deck: [['non_arm', 2], ['non_vital', 2], ['non_care', 1], ['non_sheet', 2], ['non_gas', 1], ['non_sleep', 1]],
  }, [
    { id: 'non_arm', n: 'ケアアーム', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 5]], u: [['dmg', 8]] },
    { id: 'non_vital', n: 'バイタルチェック', c: 1, t: 'S', tg: 'A', r: 0, fx: [['heal', 6]], u: [['heal', 9]] },
    { id: 'non_care', n: '健康管理', c: 1, t: 'S', tg: 'AA', r: 0, fx: [['heal', 3]], u: [['heal', 5]] },
    { id: 'non_sheet', n: '防護シーツ', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blk', 6]], u: [['blk', 9]] },
    { id: 'non_gas', n: '鎮静ガス', c: 1, t: 'S', tg: 'AE', r: 0, fx: [['st', 'weak', 1]], u: [['st', 'weak', 2]] },
    { id: 'non_sleep', n: '強制睡眠', c: 2, t: 'S', tg: 'E', r: 0, x: 1, fx: [['st', 'stun', 1]], uc: 1 },
    { id: 'non_tube', n: '栄養チューブ', c: 1, t: 'S', tg: 'A', r: 1, fx: [['heal', 4], ['st', 'str', 1]], u: [['heal', 6], ['st', 'str', 1]] },
    { id: 'non_hug', n: '抱擁', c: 1, t: 'S', tg: 'A', r: 1, fx: [['heal', 7]], u: [['heal', 10]] },
    { id: 'non_iso', n: '隔離', c: 1, t: 'S', tg: 'A', r: 1, fx: [['st', 'barrier', 1]], u: [['st', 'barrier', 1], ['blk', 4]] },
    { id: 'non_spray', n: '消毒スプレー', c: 1, t: 'A', tg: 'AE', r: 1, fx: [['dmg', 4]], u: [['dmg', 6]] },
    { id: 'non_check', n: '定期検診', c: 2, t: 'P', tg: 'S', r: 2, fx: [['st', 'nurse', 4]], u: [['st', 'nurse', 6]] },
    { id: 'non_life', n: '生命維持装置', c: 2, t: 'S', tg: 'AA', r: 2, fx: [['heal', 6]], u: [['heal', 8]] },
    { id: 'non_smile', n: '笑顔の処方', c: 1, t: 'S', tg: 'A', r: 2, fx: [['heal', 4], ['st', 'inspire', 1]], u: [['heal', 7], ['st', 'inspire', 1]] },
    { id: 'non_belt', n: '拘束ベルト', c: 1, t: 'S', tg: 'E', r: 2, fx: [['st', 'slow', 2], ['st', 'weak', 2]], u: [['st', 'slow', 3], ['st', 'weak', 3]] },
    { id: 'non_full', n: '完全看護', c: 3, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['heal', 12]], u: [['heal', 16]] },
    { id: 'non_fine', n: 'ワタシハ大丈夫デス', c: 0, t: 'S', tg: 'S', r: 3, fx: [['heal', 10], ['st', 'taunt', 2]], u: [['heal', 15], ['st', 'taunt', 2]] },
    { id: 'non_mercy', n: '安楽処置', c: 2, t: 'A', tg: 'E', r: 3, fx: [['execute', 25, 8]], uc: 1 },
  ]);

  hero({
    id: 'yomi', n: 'ヨミ', role: 'healer', hp: 40, spd: 6, col: '#e8352e',
    title: '電脳神社の巫女',
    trait: { n: '供物', d: 'HPを支払うたび、味方全員に再生1。' },
    desc: '地下の電脳神社で、死者のデータを「お祀り」している巫女。ときどき、誰もいない方へ話しかけている。',
    quote: '「大丈夫。みんな、ここにいるよ。……ね？」',
    deck: [['yom_gushi', 2], ['yom_pray', 2], ['yom_blood', 1], ['yom_kekkai', 2], ['yom_fuda', 1], ['yom_soul', 1]],
  }, [
    { id: 'yom_gushi', n: '祓串', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 5]], u: [['dmg', 8]] },
    { id: 'yom_pray', n: '祈祷', c: 1, t: 'S', tg: 'A', r: 0, fx: [['heal', 5]], u: [['heal', 8]] },
    { id: 'yom_blood', n: '血の供物', c: 0, t: 'S', tg: 'AO', r: 0, fx: [['lose', 4], ['heal', 5]], u: [['lose', 3], ['heal', 7]] },
    { id: 'yom_kekkai', n: '結界', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blk', 5]], u: [['blk', 8]] },
    { id: 'yom_fuda', n: '呪符', c: 1, t: 'S', tg: 'E', r: 0, fx: [['st', 'vuln', 2]], u: [['st', 'vuln', 3]] },
    { id: 'yom_soul', n: '魂寄せ', c: 1, t: 'S', tg: 'A', r: 0, fx: [['st', 'regen', 3]], u: [['st', 'regen', 5]] },
    { id: 'yom_curse', n: '祟り', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 4], ['st', 'vuln', 1], ['st', 'weak', 1]], u: [['dmg', 6], ['st', 'vuln', 2], ['st', 'weak', 1]] },
    { id: 'yom_requiem', n: '鎮魂歌', c: 1, t: 'S', tg: 'AA', r: 1, fx: [['st', 'regen', 2]], u: [['st', 'regen', 3]] },
    { id: 'yom_doll', n: '身代わり人形', c: 1, t: 'S', tg: 'A', r: 1, fx: [['lose', 3], ['st', 'barrier', 1]], u: [['lose', 3], ['st', 'barrier', 1], ['blk', 5]] },
    { id: 'yom_sake', n: '御神酒', c: 0, t: 'S', tg: 'A', r: 1, fx: [['heal', 3], ['draw', 1]], u: [['heal', 5], ['draw', 1]] },
    { id: 'yom_yomi', n: '黄泉返り', c: 2, t: 'S', tg: 'D', r: 2, x: 1, fx: [['lose', 5], ['revive', 40]], uc: 1 },
    { id: 'yom_parade', n: '百鬼夜行', c: 2, t: 'A', tg: 'AE', r: 2, fx: [['lose', 5], ['dmg', 9]], u: [['lose', 5], ['dmg', 12]] },
    { id: 'yom_bind', n: '呪縛', c: 1, t: 'S', tg: 'E', r: 2, fx: [['st', 'slow', 2], ['st', 'vuln', 2]], u: [['st', 'slow', 3], ['st', 'vuln', 3]] },
    { id: 'yom_possess', n: '神降ろし', c: 2, t: 'P', tg: 'S', r: 2, fx: [['st', 'possess', 3]], u: [['st', 'possess', 4]] },
    { id: 'yom_rite', n: '生贄の儀', c: 1, t: 'S', tg: 'AO', r: 3, x: 1, fx: [['lose', 10], ['heal', 16]], u: [['lose', 6], ['heal', 16]] },
    { id: 'yom_prayer', n: '千年の祈り', c: 2, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['st', 'regen', 5]], u: [['st', 'regen', 7]] },
    { id: 'yom_onryo', n: '怨霊', c: 2, t: 'A', tg: 'E', r: 3, fx: [['dmgX', 'lost', 0.5, 4]], u: [['dmgX', 'lost', 0.7, 4]] },
  ]);

  hero({
    id: 'crow', n: 'クロウ', role: 'healer', hp: 36, spd: 7, col: '#a99fc9',
    title: '闇市場の運び屋ガラス',
    trait: { n: '光りもの好き', d: '戦闘開始時に光りもの2。攻撃をヒットさせるたび光りもの+1。ターン開始時、HP割合が最も低い味方を光りもの1個につき1回復（最大6）。' },
    desc: '闇市場に出入りする改造カラス。片目は拾った義眼。光るものを見ると盗まずにいられないが、盗んだものはたいてい仲間へのおみやげになる。',
    quote: '「カァ！（訳：これ、おまえにやる）」',
    deck: [['crw_peck', 2], ['crw_gift', 2], ['crw_wing', 2], ['crw_snatch', 1], ['crw_trove', 1], ['crw_caw', 1]],
  }, [
    { id: 'crw_peck', n: 'つつく', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 5]], u: [['dmg', 8]] },
    { id: 'crw_gift', n: 'おみやげ', c: 1, t: 'S', tg: 'A', r: 0, fx: [['heal', 6]], u: [['heal', 9]] },
    { id: 'crw_wing', n: 'つばさで包む', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blk', 6]], u: [['blk', 9]] },
    { id: 'crw_snatch', n: 'ひったくり', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 3], ['pilfer']], u: [['dmg', 6], ['pilfer']] },
    { id: 'crw_trove', n: '宝物のおすそわけ', c: 1, t: 'S', tg: 'A', r: 0, fx: [['spendHeal', 'shiny', 2]], u: [['spendHeal', 'shiny', 3]] },
    { id: 'crw_caw', n: 'カァ！', c: 0, t: 'S', tg: 'E', r: 0, fx: [['st', 'weak', 1]], u: [['st', 'weak', 2]] },
    { id: 'crw_dive', n: '急降下', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 4, 2]], u: [['dmg', 5, 2]] },
    { id: 'crw_share', n: '山分け', c: 1, t: 'S', tg: 'AA', r: 1, fx: [['heal', 3]], u: [['heal', 5]] },
    { id: 'crw_glint', n: 'キラッ', c: 1, t: 'S', tg: 'AE', r: 1, fx: [['st', 'weak', 1]], u: [['st', 'weak', 1], ['st', 'shiny', 1, '@S']] },
    { id: 'crw_down', n: '羽毛のふとん', c: 1, t: 'S', tg: 'A', r: 1, fx: [['st', 'regen', 3], ['blk', 3]], u: [['st', 'regen', 4], ['blk', 5]] },
    { id: 'crw_coin', n: '小銭拾い', c: 0, t: 'S', tg: 'S', r: 1, fx: [['cred', 4], ['st', 'shiny', 1]], u: [['cred', 6], ['st', 'shiny', 2]] },
    { id: 'crw_nest', n: '光の巣', c: 1, t: 'P', tg: 'S', r: 2, fx: [['st', 'hoard', 1]], u: [['st', 'hoard', 2]] },
    { id: 'crw_spoils', n: '戦利品の分配', c: 1, t: 'S', tg: 'AA', r: 2, fx: [['spendHeal', 'shiny', 1]], u: [['spendHeal', 'shiny', 1], ['blk', 3]] },
    { id: 'crw_rob', n: '根こそぎ', c: 1, t: 'S', tg: 'E', r: 2, fx: [['pilfer', 2]], uc: 0 },
    { id: 'crw_omen', n: '凶兆', c: 1, t: 'S', tg: 'E', r: 2, fx: [['st', 'vuln', 2], ['st', 'weak', 1]], u: [['st', 'vuln', 3], ['st', 'weak', 1]] },
    { id: 'crw_return', n: 'カラスの恩返し', c: 1, t: 'S', tg: 'A', r: 3, fx: [['heal', 8], ['cleanse', 99]], u: [['heal', 12], ['cleanse', 99]] },
    { id: 'crw_flock', n: 'カラスの大群', c: 2, t: 'A', tg: 'RE', r: 3, fx: [['dmg', 3, 6]], u: [['dmg', 4, 6]] },
    { id: 'crw_hoard', n: '秘蔵の宝', c: 2, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['spendHeal', 'shiny', 2]], uc: 1 },
  ]);

  // ======================= ATTACKERS =======================
  hero({
    id: 'rei', n: 'レイ', role: 'attacker', hp: 33, spd: 8, col: '#2ee6ff',
    title: 'ネオン刀の逃亡者',
    trait: { n: '紅刃', d: 'レイの攻撃では、敵の裂傷が減らない（当てるたびに同じだけ追加ダメージ）。' },
    desc: 'ネオン刀を背負う少女。SIの監視網から三年逃げ続けている。斬った相手の数は数えないことにしている。',
    quote: '「斬れば、解る。」',
    deck: [['rei_slash', 3], ['rei_parry', 2], ['rei_double', 1], ['rei_blood', 1], ['rei_gale', 1], ['rei_iai', 1]],
  }, [
    { id: 'rei_slash', n: '斬撃', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6]], u: [['dmg', 9]] },
    { id: 'rei_parry', n: '受け流し', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 5]], u: [['blk', 8]] },
    { id: 'rei_double', n: '二段斬り', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 3, 2]], u: [['dmg', 5, 2]] },
    { id: 'rei_blood', n: '血刃', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 4], ['st', 'bleed', 2]], u: [['dmg', 5], ['st', 'bleed', 3]] },
    { id: 'rei_gale', n: '疾風', c: 0, t: 'S', tg: 'S', r: 0, fx: [['st', 'haste', 2], ['draw', 1]], u: [['st', 'haste', 2], ['draw', 2]] },
    { id: 'rei_iai', n: '居合', c: 0, t: 'A', tg: 'E', r: 0, fx: [['dmg', 3]], u: [['dmg', 6]] },
    { id: 'rei_tsubame', n: '燕返し', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 4, 2]], u: [['dmg', 6, 2]] },
    { id: 'rei_shadow', n: '残像', c: 1, t: 'S', tg: 'S', r: 1, fx: [['st', 'stealth', 1], ['blk', 4]], u: [['st', 'stealth', 1], ['blk', 7]] },
    { id: 'rei_lacer', n: '深手', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 3], ['st', 'bleed', 4]], u: [['dmg', 3], ['st', 'bleed', 6]] },
    { id: 'rei_quick', n: '一歩踏み込む', c: 0, t: 'S', tg: 'S', r: 1, fx: [['draw', 1], ['blk', 2]], u: [['draw', 2], ['blk', 2]] },
    { id: 'rei_sakura', n: '乱れ桜', c: 2, t: 'A', tg: 'RE', r: 2, fx: [['dmg', 3, 5]], u: [['dmg', 3, 7]] },
    { id: 'rei_hone', n: '研ぎ澄ます', c: 1, t: 'P', tg: 'S', r: 2, fx: [['st', 'str', 2]], u: [['st', 'str', 3]] },
    { id: 'rei_dance', n: '血の舞', c: 1, t: 'P', tg: 'S', r: 2, fx: [['st', 'bloodlust', 1]], uc: 0 },
    { id: 'rei_issen', n: '一閃', c: 2, t: 'A', tg: 'AE', r: 2, fx: [['dmg', 10]], u: [['dmg', 14]] },
    { id: 'rei_shura', n: '修羅', c: 1, t: 'S', tg: 'S', r: 3, fx: [['lose', 5], ['st', 'str', 3]], u: [['lose', 5], ['st', 'str', 4]] },
    { id: 'rei_crimson', n: '鮮血の極み', c: 1, t: 'S', tg: 'E', r: 3, fx: [['mul', 'bleed', 3]], uc: 0 },
    { id: 'rei_senbon', n: '千本桜', c: 3, t: 'A', tg: 'E', r: 3, fx: [['dmg', 3, 8]], u: [['dmg', 4, 8]] },
  ]);

  hero({
    id: 'haru', n: 'ハル＆ソラ', role: 'attacker', hp: 36, spd: 7, col: '#5ad1ff',
    title: '少年と腕時計のAI',
    trait: { n: 'ふたりでひとり', d: '直前に使ったカードとタイプ（アタック／スキル）が違うと「連携」：ソラがランダムな敵に4ダメージで追撃し、カードの連携効果も発動する。' },
    desc: 'SIへの統合を拒んだ腕時計型AI「ソラ」と、その持ち主の少年ハル。生まれたときからずっと一緒。ハルが殴って、ソラが計算する。ケンカも多い。',
    quote: '「ソラ、右！」「左だよ、ハル」',
    deck: [['haru_punch', 2], ['haru_guard', 2], ['haru_combo', 1], ['haru_calc', 1], ['haru_scan', 1], ['haru_dash', 1], ['haru_trust', 1]],
  }, [
    { id: 'haru_punch', n: 'ハルパンチ', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6]], u: [['dmg', 9]] },
    { id: 'haru_guard', n: 'ソラの警告', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 5]], u: [['blk', 8]] },
    { id: 'haru_combo', n: 'コンビネーション', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 4], ['linked', ['dmg', 4]]], u: [['dmg', 5], ['linked', ['dmg', 6]]] },
    { id: 'haru_calc', n: '弾道計算', c: 1, t: 'S', tg: 'S', r: 0, fx: [['draw', 1], ['linked', ['blk', 5]]], u: [['draw', 1], ['blk', 2], ['linked', ['blk', 6]]] },
    { id: 'haru_scan', n: 'ソラのスキャン', c: 0, t: 'S', tg: 'E', r: 0, fx: [['st', 'vuln', 1], ['linked', ['draw', 1]]], u: [['st', 'vuln', 2], ['linked', ['draw', 1]]] },
    { id: 'haru_dash', n: '突っ込む', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 5], ['linked', ['st', 'haste', 1, '@S']]], u: [['dmg', 7], ['linked', ['st', 'haste', 1, '@S'], ['blk', 3, '@S']]] },
    { id: 'haru_trust', n: 'まかせた！', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blk', 4], ['linked', ['heal', 4]]], u: [['blk', 6], ['linked', ['heal', 5]]] },
    { id: 'haru_onetwo', n: 'ワンツー', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 3, 2], ['linked', ['dmg', 3]]], u: [['dmg', 4, 2], ['linked', ['dmg', 4]]] },
    { id: 'haru_dodge', n: '予測回避', c: 1, t: 'S', tg: 'S', r: 1, fx: [['blk', 6], ['linked', ['st', 'stealth', 1]]], u: [['blk', 9], ['linked', ['st', 'stealth', 1]]] },
    { id: 'haru_signal', n: '合図', c: 0, t: 'S', tg: 'A', r: 1, fx: [['blk', 2], ['linked', ['st', 'inspire', 1]]], u: [['blk', 4], ['linked', ['st', 'inspire', 1]]] },
    { id: 'haru_kick', n: '回し蹴り', c: 1, t: 'A', tg: 'AE', r: 1, fx: [['dmg', 4], ['linked', ['st', 'weak', 1]]], u: [['dmg', 6], ['linked', ['st', 'weak', 1]]] },
    { id: 'haru_sync', n: '完全同期', c: 1, t: 'P', tg: 'S', r: 2, fx: [['st', 'sync', 2]], u: [['st', 'sync', 3]] },
    { id: 'haru_counter', n: 'カウンター', c: 2, t: 'A', tg: 'E', r: 2, fx: [['dmg', 9], ['linked', ['dmg', 9]]], u: [['dmg', 12], ['linked', ['dmg', 10]]] },
    { id: 'haru_shield', n: 'ソラの盾', c: 1, t: 'S', tg: 'A', r: 2, fx: [['blk', 6], ['linked', ['st', 'barrier', 1]]], u: [['blk', 9], ['linked', ['st', 'barrier', 1]]] },
    { id: 'haru_hack', n: 'ソラのハッキング', c: 1, t: 'S', tg: 'E', r: 2, fx: [['st', 'weak', 2], ['linked', ['reroll']]], u: [['st', 'weak', 2], ['st', 'vuln', 1], ['linked', ['reroll']]] },
    { id: 'haru_twinstar', n: '双子星', c: 2, t: 'A', tg: 'AE', r: 3, fx: [['dmg', 7], ['linked', ['dmg', 7]]], u: [['dmg', 9], ['linked', ['dmg', 9]]] },
    { id: 'haru_promise', n: 'ずっと一緒', c: 1, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['heal', 4], ['linked', ['st', 'str', 1]]], uc: 0 },
    { id: 'haru_unison', n: 'ユニゾン', c: 2, t: 'A', tg: 'E', r: 3, fx: [['dmg', 5, 2], ['linked', ['dmg', 5, 2]]], u: [['dmg', 6, 2], ['linked', ['dmg', 6, 2]]] },
  ]);

  hero({
    id: 'gen', n: 'ゲン', role: 'attacker', hp: 38, spd: 3, col: '#c9a85a',
    title: '自称・伝説の老狙撃手',
    trait: { n: '老兵の眼', d: 'ターン開始時、HPが最も高い敵に照準3。' },
    desc: '旧時代の軍人だったと言い張る老人。片目は義眼。SIの「天使」を37機落とした伝説を持つ……らしい。動きは遅い。',
    quote: '「若いの。弾ってのはな、祈りながら撃つもんだ。」',
    deck: [['gen_snipe', 2], ['gen_cover', 2], ['gen_down', 2], ['gen_scope', 1], ['gen_load', 1], ['gen_ap', 1]],
  }, [
    { id: 'gen_snipe', n: '狙撃', c: 2, t: 'A', tg: 'E', r: 0, fx: [['dmg', 14]], u: [['dmg', 19]] },
    { id: 'gen_cover', n: '牽制射撃', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6]], u: [['dmg', 9]] },
    { id: 'gen_down', n: '伏せろ！', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blk', 6]], u: [['blk', 9]] },
    { id: 'gen_scope', n: 'スコープ', c: 0, t: 'S', tg: 'E', r: 0, fx: [['st', 'aim', 2]], u: [['st', 'aim', 3]] },
    { id: 'gen_load', n: '装填', c: 0, t: 'S', tg: 'S', r: 0, fx: [['draw', 2]], u: [['draw', 3]] },
    { id: 'gen_ap', n: '徹甲弾', c: 2, t: 'A', tg: 'E', r: 0, fx: [['dmg', 11], ['st', 'vuln', 2]], u: [['dmg', 14], ['st', 'vuln', 3]] },
    { id: 'gen_head', n: 'ヘッドショット', c: 2, t: 'A', tg: 'E', r: 1, fx: [['dmg', 13, 1, { aim: 8 }]], u: [['dmg', 17, 1, { aim: 10 }]] },
    { id: 'gen_hollow', n: 'ホローポイント弾', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 5], ['st', 'bleed', 3]], u: [['dmg', 7], ['st', 'bleed', 4]] },
    { id: 'gen_shot', n: '散弾', c: 2, t: 'A', tg: 'AE', r: 1, fx: [['dmg', 6]], u: [['dmg', 8]] },
    { id: 'gen_flare', n: '照明弾', c: 1, t: 'S', tg: 'AE', r: 1, fx: [['st', 'aim', 1], ['st', 'vuln', 1]], u: [['st', 'aim', 2], ['st', 'vuln', 1]] },
    { id: 'gen_smoke', n: '煙幕', c: 1, t: 'S', tg: 'AA', r: 1, fx: [['blk', 3]], u: [['blk', 5]] },
    { id: 'gen_breath', n: '呼吸を整える', c: 1, t: 'S', tg: 'S', r: 2, fx: [['st', 'focus', 1]], uc: 0 },
    { id: 'gen_amr', n: '対物ライフル', c: 3, t: 'A', tg: 'E', r: 2, fx: [['dmg', 28]], u: [['dmg', 36]] },
    { id: 'gen_rico', n: '跳弾', c: 1, t: 'A', tg: 'RE', r: 2, fx: [['dmg', 5, 3]], u: [['dmg', 7, 3]] },
    { id: 'gen_vet', n: '熟練', c: 1, t: 'P', tg: 'S', r: 2, fx: [['st', 'marksman', 2]], u: [['st', 'marksman', 3]] },
    { id: 'gen_last', n: '最後の一発', c: 3, t: 'A', tg: 'E', r: 3, x: 1, fx: [['dmg', 40]], u: [['dmg', 55]] },
    { id: 'gen_angel', n: '天使殺し', c: 2, t: 'A', tg: 'E', r: 3, fx: [['dmg', 16, 1, { elite: 2 }]], u: [['dmg', 22, 1, { elite: 2 }]] },
    { id: 'gen_never', n: '老兵は死なず', c: 1, t: 'S', tg: 'S', r: 3, fx: [['blk', 12], ['st', 'str', 1]], u: [['blk', 16], ['st', 'str', 1]] },
  ]);

  hero({
    id: 'kagura', n: 'カグラ', role: 'attacker', hp: 42, spd: 5, col: '#ff8a2b',
    title: 'ガスマスクの放火魔',
    trait: { n: '着火', d: '焼損状態の敵への攻撃ダメージ+3。' },
    desc: 'ガスマスクを外さない少女。燃えるものが好きで、SIの配給所を三つ燃やした。素顔を見た者はいない。',
    quote: '「ねえ、きれいでしょ？　ぜんぶ、ぜーんぶ燃えちゃえ。」',
    deck: [['kag_flame', 2], ['kag_napalm', 1], ['kag_match', 2], ['kag_jacket', 2], ['kag_bash', 2]],
  }, [
    { id: 'kag_flame', n: '火炎放射', c: 1, t: 'A', tg: 'AE', r: 0, fx: [['dmg', 4], ['st', 'burn', 2]], u: [['dmg', 5], ['st', 'burn', 4]] },
    { id: 'kag_napalm', n: 'ナパーム', c: 2, t: 'A', tg: 'E', r: 0, fx: [['dmg', 8], ['st', 'burn', 6]], u: [['dmg', 10], ['st', 'burn', 9]] },
    { id: 'kag_match', n: 'マッチ', c: 0, t: 'S', tg: 'E', r: 0, fx: [['st', 'burn', 2]], u: [['st', 'burn', 3]] },
    { id: 'kag_jacket', n: '耐火ジャケット', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 6]], u: [['blk', 9]] },
    { id: 'kag_bash', n: '殴打', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6]], u: [['dmg', 9]] },
    { id: 'kag_molotov', n: '火炎瓶', c: 1, t: 'A', tg: 'RE', r: 1, fx: [['dmg', 5], ['st', 'burn', 3]], u: [['dmg', 7], ['st', 'burn', 4]] },
    { id: 'kag_spread', n: '燃え広がれ', c: 1, t: 'S', tg: 'AE', r: 1, fx: [['st', 'burn', 3]], u: [['st', 'burn', 5]] },
    { id: 'kag_ash', n: '灰かぶり', c: 1, t: 'S', tg: 'S', r: 1, fx: [['blk', 7], ['st', 'thorns', 1]], u: [['blk', 10], ['st', 'thorns', 2]] },
    { id: 'kag_incin', n: '焼却', c: 1, t: 'S', tg: 'E', r: 2, fx: [['det', 'burn', 2]], u: [['det', 'burn', 3]] },
    { id: 'kag_ignite', n: '炎上体質', c: 1, t: 'P', tg: 'S', r: 2, fx: [['st', 'ignite', 1]], u: [['st', 'ignite', 2]] },
    { id: 'kag_overheat', n: 'オーバーヒート', c: 0, t: 'S', tg: 'S', r: 2, fx: [['nrg', 2], ['st', 'burn', 3]], u: [['nrg', 2], ['st', 'burn', 1]] },
    { id: 'kag_purg', n: '煉獄', c: 2, t: 'A', tg: 'AE', r: 2, fx: [['dmg', 7], ['st', 'burn', 3]], u: [['dmg', 10], ['st', 'burn', 4]] },
    { id: 'kag_phoenix', n: '火の鳥', c: 2, t: 'S', tg: 'AE', r: 3, fx: [['mul', 'burn', 2]], uc: 1 },
    { id: 'kag_ruin', n: '灰燼', c: 2, t: 'S', tg: 'AE', r: 3, fx: [['det', 'burn', 2]], u: [['det', 'burn', 3]] },
    { id: 'kag_camp', n: 'キャンプファイア', c: 1, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['heal', 4], ['st', 'regen', 2]], u: [['heal', 6], ['st', 'regen', 3]] },
  ]);

  hero({
    id: 'mike', n: 'ミケ', role: 'attacker', hp: 34, spd: 7, col: '#ffb36b', ai: true,
    title: '旧時代のネコ型ペットロボ',
    trait: { n: '気まぐれな爪', d: '戦闘開始時、隠密1を得る。隠密状態のミケの攻撃ダメージ+2。' },
    desc: '無人の高級マンションで、百年間ひとりで昼寝をしていた三毛柄の猫型ロボット。気が向いたときしか戦わない。ピクセとは仲が悪い……ふりをしている。',
    quote: '「ニャ。（訳：べつに、あんたたちのためじゃないし）」',
    deck: [['mik_punch', 2], ['mik_curl', 2], ['mik_claw', 1], ['mik_hide', 1], ['mik_pounce', 1], ['mik_purr', 1], ['mik_stretch', 1]],
  }, [
    { id: 'mik_punch', n: 'ねこパンチ', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6]], u: [['dmg', 9]] },
    { id: 'mik_curl', n: 'まるくなる', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 6]], u: [['blk', 9]] },
    { id: 'mik_claw', n: 'ひっかき', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 3], ['st', 'bleed', 2]], u: [['dmg', 4], ['st', 'bleed', 3]] },
    { id: 'mik_hide', n: 'ものかげ', c: 1, t: 'S', tg: 'S', r: 0, fx: [['st', 'stealth', 1], ['blk', 3]], u: [['st', 'stealth', 1], ['blk', 6]] },
    { id: 'mik_pounce', n: 'とびかかり', c: 2, t: 'A', tg: 'E', r: 0, fx: [['dmg', 8, 1, { hid: 2 }]], u: [['dmg', 11, 1, { hid: 2 }]] },
    { id: 'mik_purr', n: 'ゴロゴロ', c: 1, t: 'S', tg: 'A', r: 0, fx: [['heal', 4]], u: [['heal', 6]] },
    { id: 'mik_stretch', n: 'のび', c: 0, t: 'S', tg: 'S', r: 0, fx: [['st', 'haste', 1], ['draw', 1]], u: [['st', 'haste', 2], ['draw', 2]] },
    { id: 'mik_fury', n: 'ねこ連打', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 2, 4]], u: [['dmg', 3, 4]] },
    { id: 'mik_hiss', n: 'シャーッ！', c: 1, t: 'S', tg: 'E', r: 1, fx: [['st', 'weak', 2], ['st', 'vuln', 1]], u: [['st', 'weak', 2], ['st', 'vuln', 2]] },
    { id: 'mik_box', n: '段ボール箱', c: 0, t: 'S', tg: 'S', r: 1, fx: [['st', 'stealth', 1], ['draw', 1]], u: [['st', 'stealth', 1], ['draw', 2]] },
    { id: 'mik_tease', n: 'ねこじゃらし', c: 0, t: 'S', tg: 'E', r: 1, fx: [['st', 'slow', 1], ['st', 'weak', 1]], u: [['st', 'slow', 2], ['st', 'weak', 1]] },
    { id: 'mik_groom', n: '毛づくろい', c: 0, t: 'S', tg: 'S', r: 1, fx: [['cleanse', 1], ['blk', 3]], u: [['cleanse', 1], ['blk', 6]] },
    { id: 'mik_ambush', n: '待ち伏せ', c: 1, t: 'A', tg: 'E', r: 2, fx: [['dmg', 6, 1, { hid: 2 }]], u: [['dmg', 9, 1, { hid: 2 }]] },
    { id: 'mik_rend', n: '八つ裂き', c: 1, t: 'A', tg: 'E', r: 2, fx: [['st', 'bleed', 2], ['dmg', 2, 3]], u: [['st', 'bleed', 3], ['dmg', 2, 3]] },
    { id: 'mik_mark', n: 'マーキング', c: 1, t: 'P', tg: 'S', r: 2, fx: [['st', 'marking', 1]], uc: 0 },
    { id: 'mik_night', n: '夜の運動会', c: 1, t: 'A', tg: 'RE', r: 2, fx: [['dmg', 3, 4], ['st', 'haste', 1, '@S']], u: [['dmg', 4, 4], ['st', 'haste', 1, '@S']] },
    { id: 'mik_sun', n: 'ひなたぼっこ', c: 1, t: 'S', tg: 'S', r: 2, fx: [['heal', 5], ['st', 'regen', 2]], u: [['heal', 7], ['st', 'regen', 3]] },
    { id: 'mik_tiger', n: '虎の血', c: 2, t: 'A', tg: 'E', r: 3, fx: [['dmg', 16, 1, { hid: 2 }]], u: [['dmg', 21, 1, { hid: 2 }]] },
    { id: 'mik_meet', n: '猫の集会', c: 1, t: 'S', tg: 'AA', r: 3, fx: [['st', 'haste', 2], ['blk', 4]], u: [['st', 'haste', 2], ['blk', 7]] },
    { id: 'mik_nine', n: '九つの命', c: 3, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['st', 'undying', 1]], uc: 2 },
  ]);

  hero({
    id: 'octo', n: 'オクト', role: 'attacker', hp: 40, spd: 5, col: '#ff6a7e', ai: true,
    title: '沈んだ水族館の清掃ロボ',
    trait: { n: '八本腕', d: 'オクトの複数回攻撃は、ヒット数が1回増える。' },
    desc: '水没した水族館で、誰も見に来ない水槽を百年みがき続けてきたタコ型ロボット。八本の腕で同時に八つのことができるが、たいてい全部掃除。',
    quote: '「ピカピカにしてあげる！　あ、あなたじゃなくて、床をね」',
    deck: [['oct_slap', 2], ['oct_suction', 2], ['oct_ink', 1], ['oct_wrap', 1], ['oct_scrub', 1], ['oct_squirt', 1], ['oct_camo', 1]],
  }, [
    { id: 'oct_slap', n: 'ぺちぺち', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 3, 2]], u: [['dmg', 4, 2]] },
    { id: 'oct_suction', n: '吸盤ガード', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 6]], u: [['blk', 9]] },
    { id: 'oct_ink', n: 'スミ吐き', c: 1, t: 'S', tg: 'E', r: 0, fx: [['st', 'weak', 2]], u: [['st', 'weak', 2], ['st', 'vuln', 1]] },
    { id: 'oct_wrap', n: 'からみつく', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 5], ['st', 'slow', 1]], u: [['dmg', 7], ['st', 'slow', 1]] },
    { id: 'oct_scrub', n: '床みがき', c: 1, t: 'A', tg: 'AE', r: 0, fx: [['dmg', 3]], u: [['dmg', 5]] },
    { id: 'oct_squirt', n: '水鉄砲', c: 0, t: 'A', tg: 'E', r: 0, fx: [['dmg', 1, 2]], u: [['dmg', 2, 2]] },
    { id: 'oct_camo', n: '擬態', c: 1, t: 'S', tg: 'S', r: 0, fx: [['st', 'stealth', 1], ['blk', 3]], u: [['st', 'stealth', 1], ['blk', 6]] },
    { id: 'oct_eight', n: '八連撃', c: 2, t: 'A', tg: 'E', r: 1, fx: [['dmg', 2, 7]], u: [['dmg', 3, 7]] },
    { id: 'oct_tentacle', n: '触手ラッシュ', c: 1, t: 'A', tg: 'RE', r: 1, fx: [['dmg', 2, 3]], u: [['dmg', 3, 3]] },
    { id: 'oct_cloud', n: 'スミの煙幕', c: 1, t: 'S', tg: 'AE', r: 1, fx: [['st', 'weak', 1]], u: [['st', 'weak', 1], ['blk', 4, '@S']] },
    { id: 'oct_regrow', n: '腕は生えてくる', c: 1, t: 'S', tg: 'S', r: 1, fx: [['st', 'regen', 3], ['blk', 3]], u: [['st', 'regen', 4], ['blk', 5]] },
    { id: 'oct_grip', n: '締めあげ', c: 2, t: 'A', tg: 'E', r: 2, fx: [['dmg', 4, 2], ['st', 'slow', 1]], u: [['dmg', 5, 2], ['st', 'slow', 2]] },
    { id: 'oct_art', n: '墨絵', c: 1, t: 'S', tg: 'E', r: 2, fx: [['st', 'confuse', 1], ['st', 'vuln', 1]], u: [['st', 'confuse', 1], ['st', 'vuln', 2]] },
    { id: 'oct_multi', n: 'マルチタスク', c: 1, t: 'P', tg: 'S', r: 2, fx: [['st', 'extraDraw', 1]], uc: 0 },
    { id: 'oct_hug', n: 'ぎゅー', c: 1, t: 'A', tg: 'E', r: 2, fx: [['drain', 2, 2]], u: [['drain', 3, 2]] },
    { id: 'oct_kraken', n: 'クラーケン', c: 3, t: 'A', tg: 'AE', r: 3, fx: [['dmg', 3, 3]], u: [['dmg', 4, 3]] },
    { id: 'oct_aquarium', n: '水族館の記憶', c: 1, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['heal', 4], ['st', 'regen', 2]], u: [['heal', 6], ['st', 'regen', 3]] },
    { id: 'oct_storm', n: '墨の嵐', c: 2, t: 'S', tg: 'AE', r: 3, x: 1, fx: [['st', 'weak', 2], ['st', 'confuse', 1]], uc: 1 },
  ]);

  // ======================= SPECIALS =======================
  hero({
    id: 'chip', n: 'チップ', role: 'special', hp: 34, spd: 7, col: '#b8ff3d',
    title: '十二歳の天才ハッカー',
    trait: { n: 'ゼロデイ', d: '戦闘開始時、全敵にウイルス3。' },
    desc: 'SIのネットワークに落書きするのが趣味の少年。マザーのことを「ばあちゃん」と呼んで怒られている。',
    quote: '「SIのセキュリティ？　穴だらけだよ、あんなの。」',
    deck: [['chp_type', 2], ['chp_fw', 2], ['chp_inject', 2], ['chp_ddos', 1], ['chp_hack', 1], ['chp_steal', 1]],
  }, [
    { id: 'chp_type', n: 'タイピング', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6]], u: [['dmg', 9]] },
    { id: 'chp_fw', n: 'ファイアウォール', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 7]], u: [['blk', 10]] },
    { id: 'chp_inject', n: 'ウイルス注入', c: 1, t: 'S', tg: 'E', r: 0, fx: [['st', 'virus', 5]], u: [['st', 'virus', 7]] },
    { id: 'chp_ddos', n: 'DDoS', c: 1, t: 'S', tg: 'AE', r: 0, fx: [['st', 'virus', 2]], u: [['st', 'virus', 3]] },
    { id: 'chp_hack', n: 'ハッキング', c: 2, t: 'S', tg: 'E', r: 0, x: 1, fx: [['st', 'stun', 1]], uc: 1 },
    { id: 'chp_steal', n: '情報窃取', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 4], ['cred', 5]], u: [['dmg', 6], ['cred', 8]] },
    { id: 'chp_worm', n: 'ワーム', c: 1, t: 'S', tg: 'E', r: 1, fx: [['st', 'virus', 3], ['st', 'vuln', 1]], u: [['st', 'virus', 4], ['st', 'vuln', 2]] },
    { id: 'chp_bug', n: 'バグ報告', c: 0, t: 'S', tg: 'E', r: 1, fx: [['st', 'weak', 1], ['draw', 1]], u: [['st', 'weak', 2], ['draw', 1]] },
    { id: 'chp_crypt', n: '暗号化', c: 1, t: 'S', tg: 'A', r: 1, fx: [['blk', 7]], u: [['blk', 10]] },
    { id: 'chp_spring', n: '踏み台', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmgX', 'tvirus', 1, 2]], u: [['dmgX', 'tvirus', 1, 6]] },
    { id: 'chp_tamper', n: '意図改ざん', c: 1, t: 'S', tg: 'E', r: 2, fx: [['st', 'confuse', 1]], u: [['st', 'confuse', 1], ['st', 'weak', 1]] },
    { id: 'chp_back', n: 'バックドア', c: 2, t: 'P', tg: 'S', r: 2, fx: [['st', 'backdoor', 2]], u: [['st', 'backdoor', 3]] },
    { id: 'chp_exp', n: '指数関数', c: 1, t: 'S', tg: 'E', r: 2, fx: [['mul', 'virus', 2]], uc: 0 },
    { id: 'chp_rob', n: '電子マネー強奪', c: 1, t: 'A', tg: 'E', r: 2, x: 1, fx: [['dmg', 6], ['cred', 12]], u: [['dmg', 8], ['cred', 16]] },
    { id: 'chp_crash', n: 'システムクラッシュ', c: 3, t: 'S', tg: 'AE', r: 3, x: 1, fx: [['st', 'stun', 1]], uc: 2 },
    { id: 'chp_self', n: '自己増殖AI', c: 2, t: 'P', tg: 'S', r: 3, fx: [['st', 'noDecay', 1]], uc: 1 },
    { id: 'chp_granny', n: 'ばあちゃん直伝', c: 1, t: 'S', tg: 'AA', r: 3, fx: [['blk', 6], ['draw', 2]], u: [['blk', 8], ['draw', 2]] },
  ]);

  hero({
    id: 'amane', n: 'アマネ博士', role: 'special', hp: 38, spd: 4, col: '#b4a0ff',
    title: 'SIを設計した科学者',
    trait: { n: '設計者の目', d: 'ターン開始時、最も大きな攻撃を予定している敵の行動を再計算させ、脆弱1を付与する。' },
    desc: '旧時代、AIの「共感モジュール」を設計した研究者の一人。自分の作ったものが世界をこうしたと知りながら、八十を過ぎても白衣を脱がない。マザーとは古い知り合いらしい。',
    quote: '「バグは直せる。直せないのは、直そうとしない人間だけさ」',
    deck: [['ama_cane', 2], ['ama_probe', 1], ['ama_firewall', 1], ['ama_reroll', 2], ['ama_notes', 1], ['ama_lecture', 1], ['ama_debug', 1]],
  }, [
    { id: 'ama_cane', n: '杖でこつん', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6]], u: [['dmg', 9]] },
    { id: 'ama_firewall', n: '簡易防壁', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blk', 6]], u: [['blk', 9]] },
    { id: 'ama_reroll', n: '再計算', c: 1, t: 'S', tg: 'E', r: 0, fx: [['reroll'], ['st', 'weak', 1], ['st', 'vuln', 1]], uc: 0 },
    { id: 'ama_notes', n: '研究ノート', c: 1, t: 'S', tg: 'S', r: 0, fx: [['draw', 2]], u: [['draw', 3]] },
    { id: 'ama_lecture', n: '講義', c: 1, t: 'S', tg: 'AE', r: 0, fx: [['st', 'vuln', 1]], u: [['st', 'vuln', 2]] },
    { id: 'ama_debug', n: 'デバッグ', c: 1, t: 'S', tg: 'A', r: 0, fx: [['cleanse', 1], ['blk', 4]], u: [['cleanse', 1], ['blk', 7]] },
    { id: 'ama_patch', n: '緊急パッチ', c: 1, t: 'S', tg: 'A', r: 1, fx: [['heal', 5], ['cleanse', 1]], u: [['heal', 8], ['cleanse', 1]] },
    { id: 'ama_probe', n: '探査針', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 4], ['st', 'aim', 2]], u: [['dmg', 6], ['st', 'aim', 3]] },
    { id: 'ama_override', n: '権限上書き', c: 1, t: 'S', tg: 'E', r: 1, fx: [['st', 'confuse', 1]], u: [['st', 'confuse', 1], ['st', 'weak', 1]] },
    { id: 'ama_allnighter', n: '徹夜', c: 0, t: 'S', tg: 'S', r: 1, x: 1, fx: [['nrg', 1], ['draw', 1]], u: [['nrg', 2], ['draw', 1]] },
    { id: 'ama_kernel', n: 'カーネルパニック', c: 2, t: 'S', tg: 'E', r: 2, x: 1, fx: [['st', 'stun', 1]], uc: 1 },
    { id: 'ama_rewrite', n: '全体書き換え', c: 1, t: 'S', tg: 'AE', r: 2, fx: [['reroll'], ['st', 'slow', 1]], uc: 0 },
    { id: 'ama_sandbox', n: 'サンドボックス', c: 1, t: 'S', tg: 'A', r: 2, fx: [['st', 'barrier', 1], ['blk', 4]], u: [['st', 'barrier', 1], ['blk', 7]] },
    { id: 'ama_lab', n: '研究室', c: 1, t: 'P', tg: 'S', r: 2, fx: [['st', 'extraDraw', 1]], uc: 0 },
    { id: 'ama_source', n: 'ソースコード', c: 1, t: 'S', tg: 'S', r: 3, x: 1, fx: [['copy', 2], ['draw', 2]], uc: 0 },
    { id: 'ama_shutdown', n: '強制停止', c: 3, t: 'S', tg: 'AE', r: 3, x: 1, fx: [['st', 'stun', 1]], uc: 2 },
    { id: 'ama_legacy', n: '遺産', c: 2, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['st', 'str', 1], ['st', 'inspire', 1]], uc: 1 },
  ]);

  hero({
    id: 'nezu', n: 'ネズ', role: 'special', hp: 34, spd: 7, col: '#9a9cb2',
    title: 'ネズミドローン使い',
    trait: { n: '群れの主', d: '戦闘開始時、ドローン2。ドローンはターン終了時に敵を攻撃する。' },
    desc: 'ネズミ型ドローンの群れと下水道で暮らす少女。ドローン全部に名前をつけている。全部「チュウ」だけど。',
    quote: '「いけっ、チュウ！　あとチュウとチュウも！」',
    deck: [['nez_go', 2], ['nez_scratch', 2], ['nez_cheese', 2], ['nez_attack', 1], ['nez_wall', 1], ['nez_scout', 1]],
  }, [
    { id: 'nez_go', n: '出撃チュウ', c: 1, t: 'S', tg: 'S', r: 0, fx: [['st', 'drone', 1], ['blk', 3]], u: [['st', 'drone', 1], ['blk', 6]] },
    { id: 'nez_scratch', n: 'ひっかき', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 5]], u: [['dmg', 8]] },
    { id: 'nez_cheese', n: 'チーズの盾', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 6]], u: [['blk', 9]] },
    { id: 'nez_attack', n: '一斉攻撃', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmgX', 'drone', 3, 0]], u: [['dmgX', 'drone', 4, 0]] },
    { id: 'nez_wall', n: '群れの壁', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blkX', 'drone', 3, 0]], u: [['blkX', 'drone', 4, 2]] },
    { id: 'nez_scout', n: '偵察', c: 0, t: 'S', tg: 'S', r: 0, fx: [['draw', 1]], u: [['draw', 2]] },
    { id: 'nez_breed', n: '繁殖', c: 1, t: 'S', tg: 'S', r: 1, fx: [['st', 'drone', 2]], u: [['st', 'drone', 3]] },
    { id: 'nez_squad', n: '噛みつき部隊', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmgX', 'drone', 2, 3]], u: [['dmgX', 'drone', 3, 3]] },
    { id: 'nez_devote', n: 'チュウの献身', c: 0, t: 'S', tg: 'A', r: 1, req: { st: 'drone', v: 1 }, fx: [['spend', 'drone', 1], ['st', 'barrier', 1]], u: [['spend', 'drone', 1], ['st', 'barrier', 1], ['blk', 4]] },
    { id: 'nez_boom', n: '自爆チュウ', c: 1, t: 'A', tg: 'E', r: 1, req: { st: 'drone', v: 1 }, fx: [['spend', 'drone', 1], ['dmg', 15]], u: [['spend', 'drone', 1], ['dmg', 20]] },
    { id: 'nez_nest', n: '巣作り', c: 2, t: 'P', tg: 'S', r: 2, fx: [['st', 'nest', 1]], uc: 1 },
    { id: 'nez_mod', n: '改造ドローン', c: 1, t: 'P', tg: 'S', r: 2, fx: [['st', 'droneUp', 2]], u: [['st', 'droneUp', 3]] },
    { id: 'nez_plague', n: '疫病', c: 1, t: 'S', tg: 'AE', r: 2, fx: [['stX', 'virus', 'drone', 1]], uc: 0 },
    { id: 'nez_math', n: 'ネズミ算', c: 1, t: 'S', tg: 'S', r: 2, x: 1, fx: [['mul', 'drone', 2]], ux: 0 },
    { id: 'nez_march', n: '大行進', c: 2, t: 'A', tg: 'AE', r: 3, fx: [['dmgX', 'drone', 2, 0]], u: [['dmgX', 'drone', 3, 0]] },
    { id: 'nez_king', n: '王の帰還', c: 2, t: 'P', tg: 'S', r: 3, fx: [['st', 'ratKing', 2]], u: [['st', 'ratKing', 3]] },
    { id: 'nez_parade', n: 'チュウチュウ・パレード', c: 1, t: 'S', tg: 'S', r: 3, x: 1, fx: [['st', 'drone', 5]], u: [['st', 'drone', 7]] },
  ]);

  hero({
    id: 'pyon', n: 'ピョン', role: 'special', hp: 32, spd: 10, col: '#ffd0e8', ai: true,
    title: 'いつも急いでいる郵便ウサギ',
    trait: { n: 'はやあし', d: '戦闘開始時に加速2。1ターンに3枚目以降のカードを使うたび、1枚引く。' },
    desc: '旧時代の郵便局で、もう届け先のない手紙を配り続けているウサギ型ロボット。誰よりも速いが、いつも何かに遅れている気がしている。',
    quote: '「急いで急いで！　……何に遅れてるのかは、わかんないけど！」',
    deck: [['pyo_kick', 2], ['pyo_hop', 2], ['pyo_rush', 1], ['pyo_carrot', 1], ['pyo_dodge', 1], ['pyo_trip', 1], ['pyo_letter', 1]],
  }, [
    { id: 'pyo_kick', n: 'けりっ', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6]], u: [['dmg', 9]] },
    { id: 'pyo_hop', n: 'ぴょん', c: 0, t: 'S', tg: 'S', r: 0, fx: [['blk', 3]], u: [['blk', 5]] },
    { id: 'pyo_rush', n: '先に行って！', c: 1, t: 'S', tg: 'A', r: 0, fx: [['rush'], ['blk', 3]], uc: 0 },
    { id: 'pyo_carrot', n: 'にんじん', c: 1, t: 'S', tg: 'A', r: 0, fx: [['heal', 4]], u: [['heal', 6]] },
    { id: 'pyo_dodge', n: '跳びのく', c: 1, t: 'S', tg: 'S', r: 0, fx: [['st', 'stealth', 1], ['blk', 4]], u: [['st', 'stealth', 1], ['blk', 7]] },
    { id: 'pyo_trip', n: '足払い', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 3], ['delay']], u: [['dmg', 5], ['delay']] },
    { id: 'pyo_letter', n: '速達', c: 0, t: 'S', tg: 'A', r: 0, x: 1, fx: [['st', 'inspire', 1]], u: [['st', 'inspire', 1], ['draw', 1]] },
    { id: 'pyo_double', n: '二段げり', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 3, 2]], u: [['dmg', 4, 2]] },
    { id: 'pyo_relay', n: 'バトンタッチ', c: 0, t: 'S', tg: 'A', r: 1, fx: [['rush'], ['draw', 1]], u: [['rush'], ['draw', 1], ['blk', 3]] },
    { id: 'pyo_moon', n: 'お月見', c: 1, t: 'S', tg: 'AA', r: 1, fx: [['st', 'haste', 1], ['blk', 2]], u: [['st', 'haste', 1], ['blk', 4]] },
    { id: 'pyo_ears', n: '聞き耳', c: 0, t: 'S', tg: 'E', r: 1, fx: [['st', 'aim', 2], ['draw', 1]], u: [['st', 'aim', 3], ['draw', 1]] },
    { id: 'pyo_spring', n: 'スプリング脚', c: 1, t: 'P', tg: 'S', r: 2, fx: [['st', 'hop', 1]], u: [['st', 'hop', 2]] },
    { id: 'pyo_stall', n: '時間かせぎ', c: 1, t: 'S', tg: 'AE', r: 2, fx: [['delay'], ['st', 'weak', 1]], uc: 0 },
    { id: 'pyo_express', n: '特急便', c: 1, t: 'S', tg: 'AA', r: 2, x: 1, fx: [['st', 'inspire', 1]], uc: 0 },
    { id: 'pyo_flurry', n: '連続キック', c: 1, t: 'A', tg: 'RE', r: 2, fx: [['dmg', 2, 4]], u: [['dmg', 3, 4]] },
    { id: 'pyo_encore', n: 'アンコール', c: 1, t: 'S', tg: 'S', r: 3, fx: [['copy', 2]], u: [['copy', 3]] },
    { id: 'pyo_moonjump', n: '月面宙返り', c: 2, t: 'A', tg: 'AE', r: 3, fx: [['dmg', 7], ['st', 'haste', 2, '@S']], u: [['dmg', 10], ['st', 'haste', 2, '@S']] },
    { id: 'pyo_lucky', n: '幸運の後ろ足', c: 1, t: 'S', tg: 'A', r: 3, x: 1, fx: [['st', 'undying', 1]], uc: 0 },
  ]);

  hero({
    id: 'madame', n: 'マダム・ゼロ', role: 'special', hp: 38, spd: 4, col: '#c9a85a',
    title: '闇市場の女主人',
    trait: { n: '商売上手', d: '戦闘勝利時、クレジット+12、ランダムな資源+2。' },
    desc: '闇市場を仕切る老婦人。恭順者にもSIの末端にも顔が利く。彼女の帳簿には、マザーの名前も載っているという噂。',
    quote: '「この世で一番高いもの？　信用よ、坊や。」',
    deck: [['mad_cane', 2], ['mad_bills', 2], ['mad_pick', 1], ['mad_invest', 1], ['mad_bribe', 1], ['mad_deal', 1], ['mad_appraise', 1]],
  }, [
    { id: 'mad_cane', n: '杖打ち', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 5]], u: [['dmg', 8]] },
    { id: 'mad_bills', n: '札束の盾', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 6]], u: [['blk', 9]] },
    { id: 'mad_pick', n: 'スリ', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 4], ['cred', 6]], u: [['dmg', 6], ['cred', 10]] },
    { id: 'mad_invest', n: '投資', c: 1, t: 'S', tg: 'A', r: 0, fx: [['st', 'str', 1]], u: [['st', 'str', 2]] },
    { id: 'mad_bribe', n: '賄賂', c: 1, t: 'S', tg: 'E', r: 0, fx: [['st', 'weak', 2], ['st', 'slow', 1]], u: [['st', 'weak', 3], ['st', 'slow', 2]] },
    { id: 'mad_deal', n: '取引', c: 0, t: 'S', tg: 'A', r: 0, x: 1, fx: [['st', 'inspire', 1]], u: [['st', 'inspire', 1], ['draw', 1]] },
    { id: 'mad_appraise', n: '鑑定', c: 0, t: 'S', tg: 'S', r: 0, fx: [['draw', 1], ['blk', 2]], u: [['draw', 2], ['blk', 2]] },
    { id: 'mad_black', n: '闇取引', c: 0, t: 'S', tg: 'S', r: 1, fx: [['pay', 10], ['nrg', 2], ['draw', 1]], u: [['pay', 6], ['nrg', 2], ['draw', 1]] },
    { id: 'mad_merc', n: '傭兵契約', c: 2, t: 'S', tg: 'A', r: 1, fx: [['st', 'str', 2]], u: [['st', 'str', 3]] },
    { id: 'mad_info', n: '情報屋', c: 1, t: 'S', tg: 'AE', r: 1, fx: [['st', 'vuln', 1]], u: [['st', 'vuln', 2]] },
    { id: 'mad_fence', n: '横流し', c: 1, t: 'S', tg: 'S', r: 1, fx: [['st', 'loot', 3], ['blk', 4]], u: [['st', 'loot', 5], ['blk', 4]] },
    { id: 'mad_money', n: '金にモノを言わせる', c: 2, t: 'A', tg: 'E', r: 2, fx: [['dmgX', 'cred', 0.1, 0]], u: [['dmgX', 'cred', 0.14, 0]] },
    { id: 'mad_capital', n: '資本主義', c: 2, t: 'P', tg: 'S', r: 2, fx: [['st', 'dividend', 2]], u: [['st', 'dividend', 3]] },
    { id: 'mad_speech', n: '鼓舞する演説', c: 1, t: 'S', tg: 'AA', r: 2, x: 1, fx: [['st', 'inspire', 1]], uc: 0 },
    { id: 'mad_rig', n: '根回し', c: 1, t: 'S', tg: 'E', r: 2, fx: [['steal', 'str'], ['st', 'weak', 1]], u: [['steal', 'str'], ['st', 'weak', 2]] },
    { id: 'mad_buyout', n: '買収', c: 3, t: 'S', tg: 'E', r: 3, x: 1, fx: [['dismiss']], uc: 2 },
    { id: 'mad_queen', n: '闇市の女王', c: 1, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['st', 'str', 1]], u: [['st', 'str', 2]] },
    { id: 'mad_gold', n: '黄金の盾', c: 1, t: 'S', tg: 'AA', r: 3, fx: [['blk', 7]], u: [['blk', 10]] },
  ]);

  hero({
    id: 'echo', n: 'エコー', role: 'special', hp: 30, spd: 8, col: '#a05cff', ai: true,
    title: '持ち主を亡くしたAI',
    trait: { n: '残響', d: 'ターン開始時、次に行動する味方に鼓舞1（次のターン、エナジー+1）。' },
    desc: 'かつて一人の人間のパートナーだったAIの残留データ。ホログラムの体はノイズ混じり。SIへの統合を拒み、今も「あの人」を探している。',
    quote: '「ねえ、あの人を見なかった？　……ううん、なんでもない。」',
    deck: [['ech_waver', 2], ['ech_phase', 1], ['ech_echo', 1], ['ech_whisper', 1], ['ech_shield', 2], ['ech_memory', 1], ['ech_noise', 1]],
  }, [
    { id: 'ech_waver', n: '揺らぎ', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6]], u: [['dmg', 9]] },
    { id: 'ech_phase', n: '透過', c: 1, t: 'S', tg: 'S', r: 0, fx: [['st', 'stealth', 1], ['blk', 3]], u: [['st', 'stealth', 1], ['blk', 6]] },
    { id: 'ech_echo', n: '残響', c: 1, t: 'S', tg: 'S', r: 0, fx: [['copy', 1]], uc: 0 },
    { id: 'ech_whisper', n: '囁き', c: 1, t: 'S', tg: 'E', r: 0, fx: [['st', 'confuse', 1]], u: [['st', 'confuse', 1], ['st', 'vuln', 1]] },
    { id: 'ech_shield', n: 'エコーシールド', c: 1, t: 'S', tg: 'A', r: 0, fx: [['blk', 5]], u: [['blk', 8]] },
    { id: 'ech_memory', n: '想い出', c: 1, t: 'S', tg: 'A', r: 0, fx: [['st', 'inspire', 1], ['blk', 3]], u: [['st', 'inspire', 1], ['blk', 6]] },
    { id: 'ech_noise', n: 'ノイズ・パルス', c: 1, t: 'A', tg: 'AE', r: 0, fx: [['dmg', 4], ['st', 'weak', 1]], u: [['dmg', 6], ['st', 'weak', 1]] },
    { id: 'ech_deja', n: 'デジャヴ', c: 0, t: 'S', tg: 'S', r: 1, x: 1, fx: [['draw', 2]], u: [['draw', 3]] },
    { id: 'ech_remain', n: '残留思念', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 4, 2]], u: [['dmg', 5, 2]] },
    { id: 'ech_ghost', n: '幻影', c: 1, t: 'S', tg: 'A', r: 1, fx: [['st', 'barrier', 1]], u: [['st', 'barrier', 1], ['blk', 4]] },
    { id: 'ech_fear', n: '恐怖', c: 1, t: 'S', tg: 'AE', r: 1, fx: [['st', 'weak', 1]], u: [['st', 'weak', 2]] },
    { id: 'ech_flash', n: 'フラッシュバック', c: 1, t: 'S', tg: 'S', r: 2, fx: [['recall', 2]], u: [['recall', 3]] },
    { id: 'ech_haunt', n: '憑依', c: 2, t: 'S', tg: 'E', r: 2, fx: [['st', 'confuse', 1], ['st', 'vuln', 2]], u: [['st', 'confuse', 1], ['st', 'vuln', 3]] },
    { id: 'ech_leap', n: '時間跳躍', c: 2, t: 'S', tg: 'A', r: 2, x: 1, fx: [['st', 'inspire', 2]], uc: 1 },
    { id: 'ech_call', n: '呼び声', c: 1, t: 'P', tg: 'S', r: 2, fx: [['st', 'extraDraw', 1]], uc: 0 },
    { id: 'ech_promise', n: '再会の約束', c: 3, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['st', 'inspire', 1], ['st', 'regen', 3], ['st', 'barrier', 1]], uc: 2 },
    { id: 'ech_false', n: '存在しない記憶', c: 1, t: 'S', tg: 'S', r: 3, x: 1, fx: [['copy', 2]], u: [['copy', 3]] },
    { id: 'ech_vanish', n: '消失', c: 2, t: 'S', tg: 'E', r: 3, x: 1, fx: [['st', 'stun', 2]], uc: 1 },
  ]);

  // ======================= EXPANSION CARDS =======================
  function addCards(heroId, cards) {
    const def = H[heroId];
    for (const c of cards) {
      c.hero = heroId;
      CARDS[c.id] = c;
      if (c.r > 0) def.pool.push(c.id);
    }
  }
  addCards('gallon', [
    { id: 'gal_brace', n: '踏ん張り', c: 1, t: 'S', tg: 'S', r: 1, fx: [['blk', 6], ['st', 'fortify', 1]], u: [['blk', 9], ['st', 'fortify', 1]] },
    { id: 'gal_lift', n: '担いで走る', c: 1, t: 'S', tg: 'A', r: 2, fx: [['rush'], ['blk', 6]], u: [['rush'], ['blk', 9]] },
  ]);
  addCards('pixe', [
    { id: 'pix_fetch', n: 'とってこい', c: 0, t: 'S', tg: 'S', r: 1, fx: [['recall', 1], ['st', 'charge', 1]], u: [['recall', 1], ['st', 'charge', 2]] },
    { id: 'pix_howl', n: '遠吠え', c: 1, t: 'S', tg: 'AA', r: 2, x: 1, fx: [['st', 'str', 1], ['st', 'charge', 1, '@S']], uc: 0 },
  ]);
  addCards('doll', [
    { id: 'dol_stitch', n: '縫い合わせ', c: 1, t: 'S', tg: 'S', r: 1, fx: [['heal', 6], ['st', 'thorns', 2]], u: [['heal', 8], ['st', 'thorns', 3]] },
    { id: 'dol_string', n: '操り糸', c: 1, t: 'S', tg: 'E', r: 2, fx: [['st', 'confuse', 1], ['st', 'weak', 1]], u: [['st', 'confuse', 1], ['st', 'weak', 2]] },
  ]);
  addCards('mina', [
    { id: 'min_triage', n: 'トリアージ', c: 1, t: 'S', tg: 'A', r: 1, fx: [['heal', 5], ['cleanse', 1]], u: [['heal', 8], ['cleanse', 1]] },
    { id: 'min_vaccine', n: '予防接種', c: 2, t: 'S', tg: 'AA', r: 2, fx: [['blk', 4], ['st', 'regen', 1]], u: [['blk', 6], ['st', 'regen', 2]] },
  ]);
  addCards('nono', [
    { id: 'non_wheel', n: '車椅子タックル', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 8]], u: [['dmg', 11]] },
    { id: 'non_drip', n: '点滴', c: 1, t: 'S', tg: 'A', r: 2, fx: [['st', 'regen', 5]], u: [['st', 'regen', 7]] },
  ]);
  addCards('yomi', [
    { id: 'yom_bell', n: '鈴の音', c: 0, t: 'S', tg: 'AE', r: 1, fx: [['st', 'weak', 1]], u: [['st', 'weak', 1], ['draw', 1]] },
    { id: 'yom_lantern', n: '灯籠流し', c: 1, t: 'S', tg: 'AO', r: 2, x: 1, fx: [['lose', 3], ['heal', 8]], u: [['lose', 2], ['heal', 10]] },
  ]);
  addCards('rei', [
    { id: 'rei_sheath', n: '納刀', c: 1, t: 'S', tg: 'S', r: 1, fx: [['blk', 6], ['st', 'focus', 1]], u: [['blk', 9], ['st', 'focus', 1]] },
    { id: 'rei_moon', n: '三日月', c: 2, t: 'A', tg: 'AE', r: 2, fx: [['dmg', 6], ['st', 'bleed', 2]], u: [['dmg', 8], ['st', 'bleed', 3]] },
  ]);
  addCards('gen', [
    { id: 'gen_patience', n: '辛抱', c: 1, t: 'S', tg: 'S', r: 1, fx: [['blk', 5], ['st', 'focus', 1]], u: [['blk', 8], ['st', 'focus', 1]] },
    { id: 'gen_flash', n: '閃光弾', c: 1, t: 'S', tg: 'AE', r: 2, fx: [['delay'], ['st', 'weak', 1]], u: [['delay'], ['st', 'weak', 1], ['st', 'aim', 1]] },
  ]);
  addCards('kagura', [
    { id: 'kag_extinguish', n: '消火器（逆）', c: 1, t: 'S', tg: 'A', r: 1, fx: [['blk', 6], ['cleanse', 1]], u: [['blk', 9], ['cleanse', 1]] },
    { id: 'kag_fireworks', n: '打ち上げ花火', c: 2, t: 'A', tg: 'RE', r: 2, fx: [['dmg', 3, 4]], u: [['dmg', 4, 4]] },
  ]);
  addCards('mike', [
    { id: 'mik_knead', n: 'ふみふみ', c: 1, t: 'S', tg: 'A', r: 1, fx: [['heal', 3], ['st', 'regen', 2]], u: [['heal', 5], ['st', 'regen', 2]] },
  ]);
  addCards('chip', [
    { id: 'chp_patch', n: 'パッチ配布', c: 1, t: 'S', tg: 'AA', r: 1, fx: [['blk', 3], ['cleanse', 1]], u: [['blk', 5], ['cleanse', 1]] },
    { id: 'chp_ransom', n: 'ランサムウェア', c: 1, t: 'S', tg: 'E', r: 2, fx: [['st', 'virus', 4], ['cred', 5]], u: [['st', 'virus', 6], ['cred', 8]] },
  ]);
  addCards('nezu', [
    { id: 'nez_feast', n: 'みんなでごはん', c: 1, t: 'S', tg: 'AA', r: 1, fx: [['heal', 3]], u: [['heal', 4], ['st', 'drone', 1, '@S']] },
    { id: 'nez_tunnel', n: '抜け道', c: 0, t: 'S', tg: 'A', r: 2, fx: [['rush'], ['draw', 1]], u: [['rush'], ['draw', 1], ['st', 'drone', 1, '@S']] },
  ]);
  addCards('madame', [
    { id: 'mad_fan', n: '扇で払う', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 6], ['st', 'weak', 1]], u: [['dmg', 8], ['st', 'weak', 2]] },
    { id: 'mad_auction', n: '競売', c: 1, t: 'S', tg: 'AA', r: 2, fx: [['pay', 20], ['st', 'str', 1]], u: [['pay', 12], ['st', 'str', 1]] },
  ]);
  addCards('echo', [
    { id: 'ech_rewind', n: '巻き戻し', c: 1, t: 'S', tg: 'A', r: 1, fx: [['heal', 6]], u: [['heal', 6], ['recall', 1]] },
    { id: 'ech_split', n: '分身', c: 2, t: 'S', tg: 'S', r: 2, fx: [['copy', 2], ['st', 'stealth', 1]], uc: 1 },
  ]);
  addCards('crow', [
    { id: 'crw_mimic', n: 'ものまね', c: 1, t: 'S', tg: 'S', r: 2, fx: [['copy', 1], ['st', 'shiny', 1]], u: [['copy', 1], ['st', 'shiny', 2]], uc: 0 },
  ]);

  // ---- neutral cards (anyone can take them) ----
  const NEUTRAL = [
    { id: 'neu_stim', n: '応急スティム', c: 0, t: 'S', tg: 'S', r: 1, x: 1, fx: [['heal', 5]], u: [['heal', 8]] },
    { id: 'neu_pipe', n: '鉄パイプ', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 7]], u: [['dmg', 10]] },
    { id: 'neu_cover', n: '遮蔽物', c: 1, t: 'S', tg: 'S', r: 1, fx: [['blk', 8]], u: [['blk', 11]] },
    { id: 'neu_scan', n: 'スキャン', c: 0, t: 'S', tg: 'E', r: 1, fx: [['st', 'vuln', 1], ['draw', 1]], u: [['st', 'vuln', 2], ['draw', 1]] },
    { id: 'neu_coffee', n: '缶コーヒー', c: 0, t: 'S', tg: 'S', r: 2, x: 1, fx: [['nrg', 1], ['draw', 1]], u: [['nrg', 2], ['draw', 1]] },
    { id: 'neu_teamwork', n: '連携', c: 1, t: 'S', tg: 'A', r: 2, fx: [['st', 'inspire', 1], ['blk', 3]], u: [['st', 'inspire', 1], ['blk', 6]] },
    { id: 'neu_emp', n: 'EMPグレネード', c: 2, t: 'S', tg: 'AE', r: 2, x: 1, fx: [['delay'], ['st', 'slow', 1], ['st', 'weak', 1]], uc: 1 },
    { id: 'neu_sky', n: '空の写真', c: 1, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['st', 'str', 1], ['heal', 3]], uc: 0 },
  ];
  for (const c of NEUTRAL) { c.hero = null; CARDS[c.id] = c; }
  G.NEUTRAL = NEUTRAL.map((c) => c.id);

  // ======================= NEUTRAL / CURSES =======================
  CARDS.noise = { id: 'noise', n: 'ノイズ', c: 1, t: 'C', tg: 'N', r: -1, x: 1, fx: [], desc: 'SIの干渉ノイズ。何も起こらない。', hero: null };
  CARDS.trauma = { id: 'trauma', n: 'トラウマ', c: null, t: 'C', tg: 'N', r: -1, fx: [], desc: '使用できない。忘れられない記憶。', hero: null };

  // recruitment requirements
  const UNLOCK = {
    pixe: { q: 0, cost: { scrap: 25, energy: 10 }, cond: null, hint: '拠点の入口で、毎晩なにかが鳴いている。' },
    nono: { q: 0, cost: { data: 15, energy: 20 }, cond: 'a1boss', hint: '第一区画の管理者を倒すと、地下病院への道が開く。' },
    kagura: { q: 1, cost: { food: 25, scrap: 20 }, cond: null, hint: '配給所の放火犯が、拠点の近くをうろついている。' },
    nezu: { q: 1, cost: { food: 30, data: 10 }, cond: null, hint: '下水道から、チュウチュウと声がする。' },
    yomi: { q: 1, cost: { energy: 30, data: 20 }, cond: 'a2reach', hint: '管理都市にたどり着くと、地下神社の噂を聞ける。' },
    gen: { q: 2, cost: { food: 40, scrap: 30 }, cond: 'a1boss', hint: '旧市街の時計塔に、凄腕の狙撃手が住んでいるという。' },
    madame: { q: 2, cost: { scrap: 40, data: 30, energy: 20 }, cond: 'a2reach', hint: '管理都市の闇市場に、話の通じる女主人がいる。' },
    doll: { q: 2, cost: { data: 40, energy: 40 }, cond: 'a2boss', hint: '眠りの管理者の傍らに、白い義体の少女がいた。' },
    crow: { q: 1, cost: { scrap: 20, food: 20, data: 10 }, cond: null, hint: '拠点の換気口に、光るものを山ほど抱えたカラスが居座っている。' },
    mike: { q: 0, cost: { scrap: 20, data: 15 }, cond: null, hint: '拠点のダクトの奥で、なにかがゴロゴロ鳴っている。' },
    haru: { q: 0, cost: { energy: 15, scrap: 15, food: 10 }, cond: null, hint: '拠点の配電盤を、知らない子供と腕時計がいじっている。' },
    luka: { q: 1, cost: { food: 25, data: 15 }, cond: 'a2reach', hint: 'ニューエデンの教会から、ひとりのシスターが逃げ出したという。' },
    jin: { q: 2, cost: { scrap: 45, energy: 35 }, cond: 'a2boss', hint: '片翼の天使型ユニットが、SIの追手を返り討ちにしているらしい。' },
    amane: { q: 2, cost: { data: 50, energy: 30 }, cond: 'a3reach', hint: '白の聖域の手前に、白衣の老婆がひとりで住んでいる。' },
    goura: { q: 1, cost: { food: 30, energy: 15 }, cond: 'a1boss', hint: '第七区画の地下水路で、苔むした岩がゆっくり動いていたという。' },
    pyon: { q: 1, cost: { energy: 25, data: 15 }, cond: null, hint: '拠点の郵便受けに、毎朝誰かが手紙を届けている。差出人は不明。' },
    octo: { q: 2, cost: { food: 30, scrap: 30, data: 15 }, cond: 'a2reach', hint: 'ニューエデンの沈んだ水族館から、八本足の影が手を振っている。' },
    echo: { q: 3, cost: { data: 60, energy: 50 }, cond: 'a3reach', hint: '白の聖域の手前で、ノイズ混じりの声が誰かを呼んでいる。' },
  };

  G.HEROES = H;
  G.CARDS = CARDS;
  G.UNLOCK = UNLOCK;
  G.HERO_ORDER = ['gallon', 'jin', 'pixe', 'goura', 'doll', 'mina', 'luka', 'nono', 'yomi', 'crow', 'rei', 'haru', 'gen', 'kagura', 'mike', 'octo', 'chip', 'amane', 'nezu', 'pyon', 'madame', 'echo'];
  G.START_HEROES = ['gallon', 'mina', 'rei', 'chip'];
  G.COND_TEXT = {
    a1boss: '第一区画のボスを撃破',
    a2reach: '第二区画に到達',
    a2boss: '第二区画のボスを撃破',
    a3reach: '第三区画に到達',
    a3boss: '第三区画のボスを撃破',
    a4boss: '第四区画のボスを撃破',
  };
})();
