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
    id: 'gallon', n: 'ガロン', role: 'tank', hp: 64, spd: 3, col: '#ff8a2b',
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
    { id: 'gal_heavy', n: 'ヘビーアーム', c: 2, t: 'A', tg: 'E', r: 0, fx: [['dmg', 10], ['blk', 4, '@S']], u: [['dmg', 13], ['blk', 6, '@S']] },
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
    { id: 'yom_blood', n: '血の供物', c: 0, t: 'S', tg: 'AA', r: 0, fx: [['lose', 4], ['heal', 4]], u: [['lose', 3], ['heal', 6]] },
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
    { id: 'yom_rite', n: '生贄の儀', c: 1, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['lose', 10], ['heal', 15]], u: [['lose', 6], ['heal', 15]] },
    { id: 'yom_prayer', n: '千年の祈り', c: 2, t: 'S', tg: 'AA', r: 3, x: 1, fx: [['st', 'regen', 5]], u: [['st', 'regen', 7]] },
    { id: 'yom_onryo', n: '怨霊', c: 2, t: 'A', tg: 'E', r: 3, fx: [['dmgX', 'lost', 0.5, 4]], u: [['dmgX', 'lost', 0.7, 4]] },
  ]);

  // ======================= ATTACKERS =======================
  hero({
    id: 'rei', n: 'レイ', role: 'attacker', hp: 33, spd: 8, col: '#2ee6ff',
    title: 'ネオン刀の逃亡者',
    trait: { n: '紅刃', d: 'レイの攻撃が出血状態の敵にヒットするたび、出血+1。' },
    desc: 'ネオン刀を背負う少女。SIの監視網から三年逃げ続けている。斬った相手の数は数えないことにしている。',
    quote: '「斬れば、解る。」',
    deck: [['rei_slash', 3], ['rei_parry', 2], ['rei_double', 1], ['rei_blood', 1], ['rei_gale', 1], ['rei_iai', 1]],
  }, [
    { id: 'rei_slash', n: '斬撃', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 6]], u: [['dmg', 9]] },
    { id: 'rei_parry', n: '受け流し', c: 1, t: 'S', tg: 'S', r: 0, fx: [['blk', 5]], u: [['blk', 8]] },
    { id: 'rei_double', n: '二段斬り', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 3, 2]], u: [['dmg', 5, 2]] },
    { id: 'rei_blood', n: '血刃', c: 1, t: 'A', tg: 'E', r: 0, fx: [['dmg', 4], ['st', 'bleed', 3]], u: [['dmg', 5], ['st', 'bleed', 4]] },
    { id: 'rei_gale', n: '疾風', c: 0, t: 'S', tg: 'S', r: 0, fx: [['st', 'haste', 2], ['draw', 1]], u: [['st', 'haste', 2], ['draw', 2]] },
    { id: 'rei_iai', n: '居合', c: 0, t: 'A', tg: 'E', r: 0, fx: [['dmg', 3]], u: [['dmg', 6]] },
    { id: 'rei_tsubame', n: '燕返し', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 4, 2]], u: [['dmg', 6, 2]] },
    { id: 'rei_shadow', n: '残像', c: 1, t: 'S', tg: 'S', r: 1, fx: [['st', 'stealth', 1], ['blk', 4]], u: [['st', 'stealth', 1], ['blk', 7]] },
    { id: 'rei_lacer', n: '裂傷', c: 1, t: 'A', tg: 'E', r: 1, fx: [['dmg', 3], ['st', 'bleed', 5]], u: [['dmg', 3], ['st', 'bleed', 7]] },
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
    echo: { q: 3, cost: { data: 60, energy: 50 }, cond: 'a3reach', hint: '白の聖域の手前で、ノイズ混じりの声が誰かを呼んでいる。' },
  };

  G.HEROES = H;
  G.CARDS = CARDS;
  G.UNLOCK = UNLOCK;
  G.HERO_ORDER = ['gallon', 'pixe', 'doll', 'mina', 'nono', 'yomi', 'rei', 'gen', 'kagura', 'chip', 'nezu', 'madame', 'echo'];
  G.START_HEROES = ['gallon', 'mina', 'rei', 'chip'];
  G.COND_TEXT = {
    a1boss: '第一区画のボスを撃破',
    a2reach: '第二区画に到達',
    a2boss: '第二区画のボスを撃破',
    a3reach: '第三区画に到達',
    a3boss: '第三区画のボスを撃破',
  };
})();
