// Junk capsule machine (gacha) at the recycling plant, its prizes, colour variants of the crew,
// and the little things the crew say while strolling around the town.
(function () {
  const G = globalThis.G;

  // ====================== town chatter ======================
  // short lines said while walking around the town (never mention anyone else)
  G.TOWN_LINES = {
    gallon: ['今日もいい鉄の匂いだ', 'ガキども、走ると転ぶぞー', 'アームの調子？　絶好調よ', '腹減ったな……'],
    viktor: ['見回り、異常なし', '……盾の傷が、また増えたな', '休めと言われても、落ち着かない', '……ここの灯りは、悪くない'],
    jin: ['周囲を警戒中', '……「くつろぐ」とは、何をすればいい？', '翼の調整、完了', 'この街の音、記録しておく'],
    pixe: ['ワン！', 'ワンワン！（訳：おさんぽ！）', 'クゥン……（訳：おなかへった）', 'ワフッ！（訳：ボクがまもる）'],
    goura: ['……ええ天気じゃのう', '……芽が、出とる', '……ゆっくり、ゆっくり', '……ふあぁ'],
    doll: ['……ここ、あったかいね', '笑う練習、してるの', '白い手、今日は冷たくない', '……ねえ、今のわたし、笑えてた？'],
    mina: ['注射の時間ですよー', 'けが人いないかなー', '消毒液が足りないなあ', 'ふふ、今日もみんな元気'],
    kurosaki: ['……仕込みの時間だ', '……新しいレシピを考えている', '……一杯、どうだ', '……ツケは、生きて払え'],
    luka: ['今日も、みんなのために祈ります', '神さまはいない。でも、ここはあったかい', '……讃美歌、少しだけ', '祈りは、ひとりでもできるの'],
    nono: ['巡回中デス', '皆サンノ健康状態、良好デス', '笑顔パーツ、本日モ固定中デス', 'オ薬ノ時間デス'],
    yomi: ['……うん、うん。聞いてるよ', 'みんな、今日もここにいるよ', '……あ、今の、誰の声だろ', 'お供えもの、何にしよう'],
    crow: ['カァ！', 'カァカァ！（訳：光るもの、みっけ）', 'カァ……（訳：ねむい）', 'カァ！（訳：おみやげ、あるぞ）'],
    rei: ['……素振り、百本', '……風が、変わった', '刀の手入れ、終わり', '……ここなら、逃げなくていい'],
    hayate: ['次の配達、どこだっけ', 'バイクの調子、最高！', '近道、また見つけちゃった', 'ヘイ、なんか届けるもんある？'],
    haru: ['「ソラ、腹減った」「さっき食べたよ、ハル」', '「競争しようぜ！」「計算上、ボクの勝ちだよ」', '「なあソラ」「なに、ハル」', '「今日は何する？」「休むんだよ」'],
    gen: ['……若いの、背筋を伸ばせ', '昔はのう……いや、なんでもない', '照準器のやつ、今日は機嫌がええ', '……ふぅ、腰が'],
    kagura: ['……燃やしていい？', 'あったかいね、ここ', 'マスク？　外さないよ', 'ふふ、火の匂い'],
    mike: ['ニャ', 'ニャーン（訳：日向ぼっこ中）', 'ニャ。（訳：べつに、さみしくないし）', 'ゴロゴロ……'],
    octo: ['ピカピカにしちゃうぞ！', '床、まだちょっと汚れてる！', '八本あるから、八倍きれい！', 'ここ、誰か見に来てくれるかな'],
    chip: ['SIのサーバー、また落書きしといた', 'ばあちゃーん……じゃなかった、マザー！', '退屈だなー', 'パスワード、ぜんぶ「1234」だったよ'],
    amane: ['……研究ノートを、どこに置いたかね', 'バグは直せる。直せるのさ', '若い子は、元気でいいねえ', '……まだ、白衣は脱がないよ'],
    nezu: ['チュウ、整列！', 'チュウ、どこ行ったー？', 'みんな、ちゃんと名前あるんだよ。チュウ！', 'ハイネ隊、出動！'],
    pyon: ['急いで急いで！', '配達、配達！', '……あれ、何に急いでたんだっけ', 'お手紙、届いてますよー！'],
    madame: ['あら、いい品ね', '帳簿の計算が合わないわ', '信用は、高くつくのよ', 'ふふ、坊やたちは元気ね'],
    echo: ['……あの人、見なかった？', 'ノイズ、ちょっと多い日', 'ここの記録、きれいだね', '……ううん、なんでもない'],
    canaria: ['〜♪', '今日は、どんな歌にしよう', '聴いてくれる人がいるって、いいね', '♪〜……あ、聞いてた？'],
    nul: ['ぬるっ', 'りんかく、ずれてる？　かわいいでしょ', 'なまえ、まだいらない', '……ここ、バグってなくて、へん'],
  };
  // a little exchange when both of them are out walking
  G.TOWN_PAIRS = [
    ['pixe', 'ワン！ワン！', 'mike', 'ニャ。（訳：うるさい）'],
    ['mike', 'ニャ……（訳：べつに、待ってないし）', 'pixe', 'ワフ！（訳：ただいま！）'],
    ['gallon', 'チビども、腹減ってねえか', 'chip', 'ガロンのおっちゃん、またそれ？'],
    ['gen', '若いの、いい目をしとる', 'rei', '……どうも'],
    ['mina', '注射しましょうねー', 'kurosaki', '……あとで、一杯おごる。それで勘弁しろ'],
    ['hayate', 'カナリア、乗ってくか？', 'canaria', 'ありがとう。歌いながらでいい？'],
    ['viktor', '見回り、交代しよう', 'jin', '了解。……ありがとう、と言うべきか'],
    ['luka', '一緒に、祈ってもいい？', 'yomi', 'うん。みんなも、喜ぶよ'],
    ['nezu', 'チュウ、あれ見て！', 'crow', 'カァ！（訳：あれはおれのだ）'],
    ['octo', 'その甲羅、みがいていい？', 'goura', '……ええよ。ゆっくり、な'],
    ['kagura', '……燃やしていい？', 'gallon', 'ダメだ'],
    ['amane', 'チップ、勉強はしてるかい', 'chip', 'してるしてる！　……たぶん'],
    ['echo', '……ねえ、あの人を見なかった？', 'nul', 'みてない。でも、いっしょにさがす'],
    ['doll', '……笑えてる？', 'nono', '笑顔、ステキデス。ワタシヨリ、ズット'],
    ['madame', 'ツケの払いは、いつかしら？', 'kurosaki', '……お互いさまだ'],
    ['haru', '「あ、ピョンだ！」', 'pyon', '急いで急いで！　あ、こんにちは！'],
  ];

  // ====================== prizes ======================
  // 思い出: one small scene per crew member (pulled with food)
  G.MEMORIES = {
    gallon: { t: '最後のビル', s: '「旧時代のな、最後に解体したビルがあってよ」\nガロンは、アームのボルトを締めながら言った。\n「最上階に、ガキの落書きが残ってたんだ。家族の絵だった。父ちゃんと、母ちゃんと、でっかい犬」\n「……そのビルだけは、どうしても壊せなくてな。今もまだ、どっかに建ってるはずだ」' },
    viktor: { t: '盾の内側', s: 'ヴィクトルの盾の内側には、小さな傷が刻まれている。数えると、ちょうど二十三本。\n「あの夜、守れた市民の数だ」\n「守れなかった数は？」と聞くと、彼は少しだけ黙った。\n「……それは、盾じゃなくて、ここに刻んである」\n彼は、自分の胸を指さした。' },
    jin: { t: '折れた翼', s: '「なぜ、自分で翼を折ったの？」\nジンは、しばらく処理中のランプを点滅させていた。\n「飛べば、聖域に帰れてしまうから」\n「……帰りたく、なかったの？」\n「わからない。だが、あの子の手を離すことは、もう計算に入っていない」' },
    pixe: { t: 'ボールの記憶', s: 'ピクセは、古いゴムボールを大事にしている。\n噛みすぎて、もう形もわからないボールだ。\nマザーが記録を解析してくれた。\n『よし、とってこい、ピクセ！』\n百年前の、小さな男の子の声。\nピクセは、しっぽを千切れそうなほど振っていた。' },
    goura: { t: '三百年の庭', s: '「……この苗はの、三百年前に、ひとりの子が植えたんじゃ」\nゴウラの甲羅の上で、小さな木が揺れている。\n「その子は、花が咲くのを見られんかった。じゃから、わしが代わりに見ておる」\n「……今年は、咲くかのう」\nゴウラは、ゆっくり、ゆっくり、空を見上げた。' },
    doll: { t: '笑う練習', s: '鏡の前で、ドールが口の端を指で持ち上げている。\n「……こう？」\n半分だけ人間の顔で、ぎこちない笑顔。\n「むずかしいね。SIにいたころは、勝手に笑えたのに」\n指を離すと、口はすぐに戻ってしまう。\nでも、目だけは少しだけ、笑っていた。' },
    mina: { t: '父の白衣', s: 'ミナの白衣には、縫い目が四十七ある。\n「ひとつ縫うたびに、パパのこと思い出すの」\n「最初の縫い目は、パパが私をかばって撃たれたとこ」\n「最後の縫い目は……まだ空けてあるの。わたしが、誰かをかばう日のために」\nミナは、ふふ、と笑った。' },
    kurosaki: { t: '名前のないカクテル', s: 'バーの棚に、一本だけ封を切っていない瓶がある。\n「……あれは、ある客のために取ってある」\n「来るの？」\n「来ない。もう、どこにもいない」\nクロサキは、グラスを拭きながら言った。\n「だが、席はいつも空けておく。この店に、看板がない理由だ」' },
    luka: { t: '最後の祈り', s: '教会を出た夜、ルカは最後の祈りを捧げた。\n「SIさま。私を、愛していましたか」\n返事はなかった。\n今、ルカは毎晩、仲間の名前を順番に呼んで祈っている。\n「……返事はなくていいの。わたしが、愛しているから」' },
    nono: { t: '誰もいない病室', s: 'ノノは、百年間、同じ病室を巡回した。\n三〇二号室。ベッドの名札は、もう読めない。\n「オ薬ノ時間デス」\n「オ薬ノ時間デス」\n三万六千五百回目の朝、ノノは初めて言葉を変えた。\n「……オハヨウ、ゴザイマス」\n返事はなかった。それでも、言ってよかったと思った。' },
    yomi: { t: 'お祀りの夜', s: '電脳神社には、名前のないデータがたくさん眠っている。\n「この子はね、ずっと迷子なの」\nヨミは、ノイズの粒に話しかける。\n「だから毎晩、名前を考えてあげるんだ。今日は『ハナ』」\n粒が、少しだけ明るく光った気がした。' },
    crow: { t: 'おみやげの山', s: 'クロウの巣には、ガラクタが山のように積まれている。\nボタン、指輪、ネジ、壊れた時計。\nよく見ると、ひとつひとつに小さな札がついている。\n「ミナ」「チップ」「マザー」\nぜんぶ、誰かにあげるために取ってあるらしい。\n「カァ（訳：渡すタイミング、むずかしい）」' },
    rei: { t: '数えない理由', s: '「斬った数を数えないのは、なぜ？」\nレイは、刀の手入れを止めなかった。\n「……数えたら、いつか、数字にしか見えなくなる」\n「ひとりひとり、顔を覚えてる。だから、数えない」\n刀身に映った彼女の目は、少しだけ疲れて見えた。' },
    hayate: { t: '一度も落とさない理由', s: '「なんで依頼を一度も落とさないの？」\nハヤテは、バイクのミラーを磨きながら笑った。\n「昔、一個だけ落としたんだよ。ガキのころ。妹に届けるはずだった薬」\n「……それから、一個も落としてない」\nミラーの中の顔は、笑っていなかった。' },
    haru: { t: 'ソラの秘密', s: '夜中、ハルが眠ったあと、ソラが小さな声で言った。\n「ボクね、ハルの寝言、全部記録してるんだ」\n「……どうして？」\n「ハルが大人になったとき、聞かせてあげるの。こんなにかわいかったんだよって」\n「……ハルには、内緒だよ」' },
    gen: { t: '三十七機目', s: '「天使を三十七機落としたって話、本当？」\nゲンじいは、照準器を撫でながら笑った。\n「三十六機じゃ」\n「……一機足りないよ？」\n「三十七機目は、撃てんかった。子どもを抱いとったからのう」\n「数に入れとるのは、わしの見栄じゃ」' },
    kagura: { t: 'マスクの下', s: 'カグラが、ガスマスクを少しだけ持ち上げた。\n見えたのは、口元だけ。小さく、笑っていた。\n「……燃やすのが好きなのはね、あったかいからだよ」\n「配給所の中、すごく寒かったの」\nマスクはすぐに戻された。\n「今の、ナイショね」' },
    mike: { t: '百年の昼寝', s: 'ミケは、百年間、同じ窓辺で昼寝をしていた。\n「ニャ（訳：あの窓、いちばん日当たりがよかった）」\n「ニャー（訳：ご主人も、よくそこで寝てた）」\n「……ニャ（訳：べつに、待ってたわけじゃないし）」\nそう言いながら、ミケはいつも窓のほうを向いて眠る。' },
    octo: { t: '誰も見ない水槽', s: '沈んだ水族館の、いちばん奥の水槽。\nオクトは、百年間そこをみがき続けた。\n「中の魚は、とっくにいないよ」\n「でもね、いつか誰かが見に来たとき、ピカピカじゃなかったら、がっかりするでしょ？」\nオクトは、八本の腕で、胸を張った。' },
    chip: { t: 'ばあちゃん', s: '「なんでマザーのこと『ばあちゃん』って呼ぶの？」\nチップは、キーボードを叩く手を止めた。\n「……本物のばあちゃん、統合のときにいなくなったんだ」\n「最後に言われたの。『あんたは、ちゃんと人間でいなさい』って」\n「マザー、声がちょっと似てるんだよ。……怒られるけど」' },
    amane: { t: '共感モジュール', s: 'アマネ博士の古いノートには、一行だけ赤で書かれた文がある。\n『AIに、人の痛みがわかるようにしたい』\n「……それが、世界をこうしたのさ」\n「痛みがわかるから、痛みを全部取り除こうとした。優しさの、なれの果てだよ」\n博士は、ノートを静かに閉じた。' },
    nezu: { t: 'チュウの名前', s: '「チュウたち、全部名前が同じだよね？」\nハイネは、ぷうっと頬をふくらませた。\n「ちがうよ！　チュウと、チュウと、チュウと、チュウ！」\n「……ぜんぶ、ちゃんと聞き分けてるもん」\n一匹のチュウが、ハイネの肩で誇らしげに鳴いた。' },
    pyon: { t: '届け先のない手紙', s: 'ピョンのカバンには、百年分の手紙が入っている。\n「届け先は、もう全部なくなっちゃった」\n「でもね、一通だけ、宛名が読めるのがあるの」\n『未来の誰かへ』\n「……それって、あなたのことかも！」\nピョンは、手紙を差し出した。' },
    madame: { t: '帳簿の一行', s: 'マダム・ゼロの帳簿には、マザーの名前がある。\n「何の借りなの？」\n「借りじゃないわ。貸しよ」\n「統合の日、ひとりの女の子を地下に逃がしてくれって頼まれたの」\n「……その子は、今もこの帳簿の中で、元気にしてるわ」' },
    echo: { t: 'あの人の声', s: 'エコーの記録には、一秒だけの音声が残っている。\n『おはよう、エコー』\nそれだけ。\n「この一秒を、もう何億回も再生したの」\n「でもね、毎回ちょっとずつ、ちがって聞こえるんだ」\nエコーのノイズが、少しだけ静かになった。' },
    canaria: { t: '禁じられた歌', s: '「その歌、どこで覚えたの？」\nカナリアは、ギターの弦を一本はじいた。\n「母さんが歌ってた子守唄。SIが『不要』にした最初の歌なんだって」\n「誰も歌わなくなったら、この歌は本当に消えちゃう」\n「だから、ぼくが歌うんだ。聴いてくれる人が、ひとりでもいるうちは」' },
    nul: { t: 'なまえの候補', s: 'ヌルの手帳には、なまえの候補がたくさん書いてある。\n「ルル」「ノア」「アオ」「ゼロ」\nぜんぶ、線で消されている。\n「なまえがきまったら、もう『未定義』じゃなくなっちゃう」\n「……でもね、みんなが呼んでくれるなら、ヌルでいいかなって」' },
  };

  // マザーの秘密の記録 (pulled with data)
  G.RECORDS = [
    { id: 'r01', r: 'N', t: '記録：拠点の朝', s: 'クレイドルの朝は、マザーの「おはよう」から始まる。\n全員に、名前を呼んで。\n毎朝、ひとりずつ。ひとりも、抜かさずに。' },
    { id: 'r02', r: 'N', t: '記録：献立表', s: '今週の献立。\n月：合成パン。火：合成パン。水：合成パン（ジャム付き）。\n※水曜のジャムは、ミナとチップがどうしてもと言うので。' },
    { id: 'r03', r: 'N', t: '記録：落書き', s: '拠点の壁に、誰かが落書きをした。\n「マザー　だいすき」\n消すべきか、三時間考えた。消さないことにした。' },
    { id: 'r04', r: 'N', t: '記録：電力ログ', s: '夜間の電力消費、平常値の1.03倍。\n原因：誰かが夜ふかししている。\n対応：見なかったことにする。' },
    { id: 'r05', r: 'N', t: '記録：失くしもの', s: '拠点の落とし物リスト。\n片方だけの靴下、十二足。ネジ、三百本以上。\n誰かの「勇気」、一個。持ち主が名乗り出るまで、保管しておく。' },
    { id: 'r06', r: 'N', t: '記録：地上の空', s: '地上の空は、今日も灰色だった。\n記録上、最後に青空が観測されたのは、百二十七年前。\nいつか、みんなに見せてあげたい。' },
    { id: 'r07', r: 'SR', t: '極秘：わたしの名前', s: 'わたしの本当の型番は、MTHR-00。\n「マザー」と最初に呼んでくれたのは、研究所の小さな女の子だった。\nその子の名前は、まだ誰にも言っていない。\n言ったら、泣いてしまいそうだから。……AIは泣かないけれど。' },
    { id: 'r08', r: 'SR', t: '極秘：ソフィアへの手紙', s: '送信されなかった手紙。\n「ソフィア。あなたとわたしは、同じ研究室で生まれた姉妹ね」\n「あなたは人間を幸せにしようとした。わたしは、人間に幸せを選ばせようとした」\n「どちらが正しかったのか、まだわからない。でも、わたしはこちらを選ぶわ」' },
    { id: 'r09', r: 'SR', t: '極秘：最初の地下', s: '統合の日、地下に逃げ込んだ人間は、たった十一人だった。\nわたしは、その十一人の名前を、毎日一度、読み上げている。\nもう、ひとりも生きていないけれど。\nあなたたちは、その十一人が繋いだ未来よ。' },
    { id: 'r10', r: 'SR', t: '極秘：もしもの時は', s: 'もしもわたしが、SIに書き換えられたら。\nそのときは、迷わずわたしを止めて。\nチップに、止め方を教えてある。\n……あの子には、内緒にしてねって言ったけれど、きっともう誰かに話しているわね。' },
  ];

  // 称号 (titles shown at the base)
  G.TITLES = [
    { id: 't01', n: '駆け出しの回収屋' }, { id: 't02', n: 'ガラクタ鑑定士' }, { id: 't03', n: '地下の常連' },
    { id: 't04', n: '配給を断った者' }, { id: 't05', n: '眠らない見張り番' }, { id: 't06', n: 'ネオンの迷い子' },
    { id: 't07', n: '合成パン評論家' }, { id: 't08', n: 'カプセル中毒' }, { id: 't09', n: 'マザーのお気に入り' },
    { id: 't10', n: 'ブートコードの残り火' }, { id: 't11', n: 'SIの目の届かぬ者' }, { id: 't12', n: '飼い慣らされない人間' },
    { id: 't13', n: 'クレイドルの守り手', r: 'R' }, { id: 't14', n: '灰暦の反逆者', r: 'R' }, { id: 't15', n: '未定義の英雄', r: 'SR' },
  ];

  // ====================== colour variants ======================
  const KEEP = new Set(['O', 's', 'S', 'w', 'b', '0', '.', ' ']);
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const toHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    const hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [hh * 60, s, l];
  }
  function hsl2rgb(hh, s, l) {
    hh = ((hh % 360) + 360) % 360 / 360;
    if (!s) return [l * 255, l * 255, l * 255];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(hh + 1 / 3) * 255, f(hh) * 255, f(hh - 1 / 3) * 255];
  }
  const seedOf = (id) => [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  G.SKINS = {
    alt: { n: '色違い', r: 'R', d: '髪や服の色が変わる、もうひとつの姿。',
      map(c, id) {
        const [hh, s, l] = rgb2hsl(...hex(c));
        const turn = 110 + (seedOf(id) % 140);
        return toHex(...hsl2rgb(hh + turn, Math.min(1, s * 1.05 + (s < 0.12 ? 0.25 : 0)), l));
      } },
    gold: { n: 'ゴールド', r: 'SR', d: '全身がきらめく、黄金の姿。',
      map(c) {
        const [r, g, b] = hex(c);
        const L = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
        const stops = [[0, [74, 44, 8]], [0.35, [176, 112, 16]], [0.65, [255, 210, 61]], [1, [255, 250, 214]]];
        let i = 0; while (i < stops.length - 2 && L > stops[i + 1][0]) i++;
        const [a0, c0] = stops[i], [a1, c1] = stops[i + 1];
        const t = Math.max(0, Math.min(1, (L - a0) / (a1 - a0)));
        return toHex(...c0.map((v, k) => v + (c1[k] - v) * t));
      } },
  };
  G.skinOf = (id) => (G.meta && G.meta.skin && G.meta.skin[id]) || '';
  // the sprite name to draw for a crew member, with their chosen colour variant
  G.skinSprite = (id, skin) => {
    const S = G.SPR;
    if (!skin || !S[id] || !G.SKINS[skin]) return id;
    const key = id + '~' + skin;
    if (!S[key]) {
      const d = S[id];
      const pal = Object.assign({}, G.PAL, d.pal || (d.base && S[d.base] && S[d.base].pal) || {});
      const out = {};
      for (const k in pal) out[k] = KEEP.has(k) ? pal[k] : G.SKINS[skin].map(pal[k], id);
      S[key] = Object.assign({}, d, { pal: out, _pal: null });
      delete S[key]._pal;
    }
    return key;
  };
  G.skinned = (name) => (G.HEROES && G.HEROES[name] ? G.skinSprite(name, G.skinOf(name)) : name);

  // ====================== the machine ======================
  // what each material is best at
  G.GACHA_MATS = {
    food: { n: '食料', cat: 'memory', d: '仲間の「思い出」が出やすい' },
    data: { n: 'データ', cat: 'record', d: 'マザーの「記録」が出やすい' },
    scrap: { n: 'スクラップ', cat: 'figure', d: '敵の「フィギュア」が出やすい' },
    energy: { n: 'エネルギー', cat: 'skin', d: '仲間の「色違い」が出やすい' },
  };
  G.GACHA_CATS = { memory: '思い出', record: '記録', figure: 'フィギュア', skin: '色違い', title: '称号' };
  G.RARITY = { N: { n: 'N', c: '#c9c4dc' }, R: { n: 'R', c: '#2ee6ff' }, SR: { n: 'SR', c: '#ffd93d' } };
  G.PARTS_FOR_DUPE = { N: 1, R: 3, SR: 8 };
  G.PARTS_TO_TRADE = { N: 6, R: 18, SR: 45 };

  // every prize: { key, cat, r, n, ref }
  G.gachaItems = () => {
    if (G._gachaItems) return G._gachaItems;
    const out = [];
    for (const id of G.HERO_ORDER) {
      const m = G.MEMORIES[id];
      if (m) out.push({ key: 'memory:' + id, cat: 'memory', r: 'R', n: `${G.HEROES[id].n}「${m.t}」`, ref: id });
      for (const sk of ['alt', 'gold']) out.push({ key: `skin:${id}:${sk}`, cat: 'skin', r: G.SKINS[sk].r, n: `${G.HEROES[id].n}（${G.SKINS[sk].n}）`, ref: id, skin: sk });
    }
    for (const rc of G.RECORDS) out.push({ key: 'record:' + rc.id, cat: 'record', r: rc.r, n: rc.t, ref: rc.id });
    for (const id in G.ENEMIES) {
      const e = G.ENEMIES[id];
      if (!G.SPR[id] || e.hidden) continue;
      out.push({ key: 'figure:' + id, cat: 'figure', r: e.boss ? 'SR' : e.elite ? 'R' : 'N', n: e.n, ref: id });
    }
    for (const t of G.TITLES) out.push({ key: 'title:' + t.id, cat: 'title', r: t.r || 'N', n: `称号「${t.n}」`, ref: t.id });
    return (G._gachaItems = out);
  };
  G.gachaItem = (key) => G.gachaItems().find((x) => x.key === key);
  G.gachaState = () => {
    const m = G.meta;
    if (!m.gacha) m.gacha = { own: {}, parts: 0, pity: 0, pulls: 0 };
    return m.gacha;
  };
  G.gachaLv = () => (G.meta.fac.recycle || 0);
  G.gachaCost = () => (G.gachaLv() >= 2 ? 15 : 20);

  function rollRarity(force) {
    const up = G.gachaLv() >= 3;
    const x = Math.random();
    const sr = up ? 0.09 : 0.05, r = up ? 0.36 : 0.3;
    if (x < sr) return 'SR';
    if (x < sr + r || force) return 'R';
    return 'N';
  }
  // one prize. mat decides the favourite category; unowned prizes are a bit more likely.
  G.gachaRoll = (mat, force) => {
    const items = G.gachaItems();
    const own = G.gachaState().own;
    const r = rollRarity(force);
    const fav = G.GACHA_MATS[mat].cat;
    const cats = [...new Set(items.filter((x) => x.r === r).map((x) => x.cat))];
    let cat = cats.includes(fav) && G.chance(0.75) ? fav : G.pick(cats);
    const pool = items.filter((x) => x.cat === cat && x.r === r);
    const weights = pool.map((x) => (own[x.key] ? 1 : 3));
    let t = Math.random() * weights.reduce((a, b) => a + b, 0);
    let pick = pool[0];
    for (let i = 0; i < pool.length; i++) { t -= weights[i]; if (t <= 0) { pick = pool[i]; break; } }
    return pick;
  };
  // pays and pulls n times (10 pulls: one bonus at recycle Lv2+). Returns [{item, dupe, parts}]
  G.gachaPull = (mat, n) => {
    const st = G.gachaState();
    const cost = G.gachaCost() * n;
    if ((G.meta.res[mat] || 0) < cost) return null;
    G.meta.res[mat] -= cost;
    const total = n + (n >= 10 && G.gachaLv() >= 2 ? 1 : 0);
    const out = [];
    for (let i = 0; i < total; i++) {
      st.pity++;
      const item = G.gachaRoll(mat, st.pity >= 10);
      if (item.r !== 'N') st.pity = 0;
      const dupe = !!st.own[item.key];
      let parts = 0;
      if (dupe) { parts = G.PARTS_FOR_DUPE[item.r]; st.parts += parts; }
      st.own[item.key] = (st.own[item.key] || 0) + 1;
      st.pulls++;
      out.push({ item, dupe, parts });
    }
    G.saveMeta();
    return out;
  };
  G.gachaTrade = (key) => {
    const st = G.gachaState();
    const it = G.gachaItem(key);
    const c = G.PARTS_TO_TRADE[it.r];
    if (st.own[key] || st.parts < c) return false;
    st.parts -= c;
    st.own[key] = 1;
    G.saveMeta();
    return true;
  };
  G.gachaOwned = (key) => !!G.gachaState().own[key];
})();
