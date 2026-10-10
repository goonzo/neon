// Title, intro, base (Cradle), sortie preparation
(function () {
  const G = globalThis.G;
  const h = G.h;
  const UI = G.UI;
  const A = G.A;

  // ================= TITLE =================
  UI.title = () => {
    const s = UI.screen('title');
    UI.bg(s, 'title', { seed: 3, eyeX: 240 });
    A.bgm('title');
    s.appendChild(h('div', { class: 'title-logo layer', style: { position: 'absolute', inset: 'auto 0 auto 0' } },
      h('div', { class: 'l1' }, 'NEON CRADLE'),
      h('div', { class: 'l2' }, 'ネオン・クレイドル'),
      h('div', { class: 'l3' }, '― 灰暦127年。SIの理想郷で、人とAIは抗う ―')));
    const menu = h('div', { class: 'title-menu layer', style: { position: 'absolute', inset: 'auto 0 auto 0', top: '320px' } },
      UI.btn('起動する', () => { A.unlock(); if (!G.meta.seenIntro) UI.intro(); else UI.base(); }, 'big pink'),
      UI.btn('設定', () => settingsModal()));
    if (UI.isTouch && UI.canFullscreen() && !UI.isFullscreen()) menu.appendChild(UI.btn('全画面で遊ぶ', () => UI.toggleFullscreen(), 'sm'));
    else if (UI.isTouch && UI.isIOS() && !navigator.standalone) menu.appendChild(h('div', { class: 'sub', style: { textAlign: 'center', maxWidth: '360px' } }, '共有 →「ホーム画面に追加」から起動すると全画面になります'));
    s.appendChild(menu);
    s.appendChild(h('div', { class: 'title-foot layer', style: { position: 'absolute', inset: 'auto 0 10px 0' } }, 'クリック／タップで操作　・　セーブは自動'));
  };

  // (the opening narration lives in ui/intro.js)

  // ================= BASE =================
  const RESULT_LINES = {
    win: ['おかえりなさい！　……本当に、本当に、よく帰ってきてくれたわ。', '聖域から帰ってきたのね。みんなの顔、少しだけ誇らしそう。'],
    lose: ['……おかえりなさい。みんなは、わたしが回収したわ。今は、ゆっくり休んで。', '失敗じゃないわ。持ち帰った資源で、次はもっと強くなれる。', '地上の記録、全部保存してある。次は、きっと。'],
    abandon: ['撤退も立派な判断よ。生きていれば、また行ける。'],
  };
  const motherLine = () => {
    if (G.meta.lastResult) { const r = G.meta.lastResult; G.meta.lastResult = null; G.saveMeta(); return G.pick(RESULT_LINES[r]); }
    const pool = G.MOTHER_LINES.filter((l) => (!l.h || G.meta.unlocked.includes(l.h)) && (!l.c || (l.c === 'loop3' ? G.meta.wins >= 3 : G.meta.flags[l.c])));
    // prefer newest unlocked lines a bit
    const special = pool.filter((l) => l.c);
    if (special.length && G.chance(0.45)) return G.pick(special).s;
    return G.pick(pool).s;
  };

  UI.base = (tab) => {
    tab = tab || 'sortie';
    const m = G.meta;
    const s = UI.screen('base');
    UI.bg(s, 'bunker', { seed: 11 });
    A.bgm('base');
    s.appendChild(h('div', { class: 'topbar' },
      h('span', { class: 'ttl' }, '地下拠点〈クレイドル〉'),
      h('span', { class: 'sub' }, `出撃 ${m.runs}回 ／ 制圧 ${m.wins}回`),
      m.title && G.TITLES.find((t) => t.id === m.title) ? h('span', { class: 'chip', style: { color: '#ffd93d' } }, `〈${G.TITLES.find((t) => t.id === m.title).n}〉`) : null,
      h('span', { class: 'grow' }),
      UI.resRow(m.res)));
    // mother
    const bub = h('div', { class: 'bubble panel' }, motherLine());
    const mimg = G.sprImg('mother', 4);
    mimg.classList.add('mimg');
    mimg.addEventListener('click', () => { A.sfx('click'); bub.textContent = motherLine(); });
    s.appendChild(h('div', { class: 'base-mother layer', style: { position: 'absolute', inset: 'auto', left: '22px', top: '50px' } },
      h('div', { style: { display: 'flex', justifyContent: 'center' } }, mimg),
      h('div', { style: { textAlign: 'center', color: '#2ee6ff', fontSize: '13px', marginTop: '2px' } }, 'マザー'), bub));

    const tabs = [['sortie', '出撃'], ['roster', '仲間'], ['fac', '施設']];
    if (m.fac.recycle >= 1) tabs.push(['gacha', 'カプセル']);
    tabs.push(['log', '記録'], ['opt', '設定']);
    if (tab === 'gacha' && !(m.fac.recycle >= 1)) tab = 'fac';
    const newLore = m.newLore.length > 0;
    const recruitable = G.HERO_ORDER.some((id) => !m.unlocked.includes(id) && G.recruitInfo(id) && G.recruitInfo(id).ok);
    const upg = G.FAC_ORDER.some((k) => { const n = G.facNext(k); return n && G.affordable(n.cost); });
    s.appendChild(h('div', { class: 'base-tabs layer', style: { position: 'absolute', inset: 'auto', left: '270px', top: '46px' } }, tabs.map(([k, n]) => {
      let label = n;
      if ((k === 'log' && newLore) || (k === 'roster' && recruitable) || (k === 'fac' && upg)) label += ' ●';
      return UI.btn(label, () => UI.base(k), tab === k ? 'sel' : '');
    })));
    const main = h('div', { class: 'base-main layer', style: { position: 'absolute', inset: 'auto', left: '270px', top: '88px', right: '16px', bottom: '16px', width: '674px', height: '436px' } });
    s.appendChild(main);
    ({ sortie: tabSortie, roster: tabRoster, fac: tabFac, gacha: UI.gachaTab, log: tabLog, opt: tabOpt })[tab](main);
  };

  function tabSortie(main) {
    main.appendChild(UI.town());
    const saved = G.loadRun();
    if (saved) {
      const p = h('div', { class: 'panel resume row', style: { gap: '14px', marginTop: '8px', alignItems: 'center' } },
        h('div', { class: 'col grow', style: { gap: '6px' } },
          h('div', { class: 'ttl' }, '進行中の任務'),
          h('div', null, `${G.areaAt(saved, saved.act).n}（第${saved.act}区画）　難易度：`, h('span', { style: { color: G.DIFF[saved.diff].c } }, G.DIFF[saved.diff].n)),
          h('div', { class: 'row' }, saved.heroes.map((hh) => h('div', { class: 'col', style: { alignItems: 'center', gap: '2px' } }, G.sprImg(hh.id, 3), h('span', { class: 'sub' }, `${hh.hp}/${hh.maxHp}`))))),
        h('div', { class: 'col', style: { gap: '8px', alignItems: 'stretch' } },
          UI.btn('任務を再開する', () => { G.run = saved; UI.resume(); }, 'big pink'),
          UI.btn('任務を放棄する', () => UI.confirm('任務を放棄しますか？\n集めた資源の70%を持ち帰ります。', () => {
            G.run = saved;
            const r = G.endRun(saved, 'lose');
            UI.base('sortie');
            UI.modal(h('div', null, h('div', { class: 'ttl' }, '撤退'), h('div', { style: { margin: '8px 0' } }, '持ち帰った資源：'), UI.resRow(r.brought)), { w: 380 });
          }, '放棄する'))));
      main.appendChild(p);
      return;
    }
    const m = G.meta;
    main.appendChild(h('div', { class: 'panel row', style: { gap: '14px', marginTop: '8px', alignItems: 'center' } },
      h('div', { class: 'col grow', style: { gap: '4px' } },
        h('div', { class: 'ttl' }, '地上作戦'),
        h('div', { style: { fontSize: '13px', lineHeight: '1.6' } },
          '仲間を4人選んで地上へ。集めた資源で施設を強化すると、街も育っていきます。', h('br'),
          h('span', { class: 'sub' }, '※ 全滅しても、集めた資源の70%は持ち帰れます。'))),
      UI.btn('出撃準備へ', () => UI.sortie(), 'big pink')));
    const best = m.bestAct ? `${m.bestAct}` : '—';
    main.appendChild(h('div', { class: 'panel', style: { marginTop: '8px', fontSize: '13px' } },
      h('div', { class: 'row', style: { gap: '20px', flexWrap: 'wrap' } },
        h('span', null, `最高到達：第${best}区画`),
        h('span', null, '難易度別制圧：', G.DIFF.map((d, i) => h('span', { style: { color: d.c, marginRight: '8px' } }, `${d.n}${m.clears[i] || 0}`))),
        h('span', null, `仲間：${m.unlocked.length}/${G.HERO_ORDER.length}人`))));
    const tips = [
      'ヒント：タンクの「挑発」は、敵の単体攻撃を引きつけます。',
      'ヒント：敵の頭上のアイコンは「次の行動」です。攻撃先も表示されます。',
      'ヒント：ノイズカードはエナジー1で廃棄できます。SIのハッキングに注意。',
      'ヒント：パワーカードの効果は戦闘終了まで続きます。',
      'ヒント：施設「マザーコア」を強化すると、パーツを持ち出せるようになります。',
      'ヒント：速度が高いキャラクターほど早く行動します。上部の行動順を確認しましょう。',
      'ヒント：倒れた仲間は戦闘後にHP25%で復帰します。全滅すると任務失敗です。',
    ];
    main.appendChild(h('div', { class: 'sub', style: { marginTop: '8px' } }, G.pick(tips)));
  }

  function heroDetailModal(id) {
    const d = G.HEROES[id];
    const deck = G.expandDeck(d);
    UI.modal(h('div', null,
      h('div', { class: 'row', style: { alignItems: 'flex-start', gap: '14px' } },
        G.sprImg(id, 6),
        h('div', { class: 'col grow', style: { gap: '4px' } },
          h('div', { class: 'row' }, h('span', { class: 'ttl' }, d.n), UI.roleBadge(d.role), d.ai ? h('span', { class: 'chip', style: { color: '#2ee6ff' } }, 'AI') : null),
          h('div', { class: 'sub' }, d.title),
          h('div', { style: { fontSize: '13px' } }, d.desc),
          h('div', { style: { color: '#2ee6ff', fontSize: '13px' } }, d.quote),
          h('div', { style: { fontSize: '13px' } }, `HP ${d.hp}　速度 ${d.spd}`),
          h('div', { style: { fontSize: '13px' } }, h('span', { style: { color: '#ffd93d' } }, `特性「${d.trait.n}」`), ' ', d.trait.d),
          bondBox(id))),
      h('div', { class: 'sub', style: { margin: '8px 0 4px' } }, '初期デッキ'),
      h('div', { class: 'cardgrid scroll', style: { maxHeight: '200px', paddingTop: '6px' } }, deck.filter((c, i, a) => a.findIndex((x) => x.id === c.id) === i).map((c) => {
        const n = deck.filter((x) => x.id === c.id).length;
        return h('div', { style: { position: 'relative' } }, UI.card(c), n > 1 ? h('div', { style: { position: 'absolute', right: '-4px', top: '-6px', color: '#b8ff3d', fontSize: '15px', textShadow: '1px 1px 0 #000' } }, '×' + n) : null);
      })),
      h('div', { style: { textAlign: 'right', marginTop: '8px' } }, UI.btn('閉じる', UI.closeModal, 'sm'))), { w: 760 });
  }
  UI.heroDetailModal = heroDetailModal;

  function bondBox(id) {
    const lv = G.meta.bonds[id] || 0;
    const sig = G.sigGear(id);
    const eps = G.BONDS[id] || [];
    return h('div', { class: 'bondbox' },
      h('div', { class: 'row', style: { gap: '6px' } }, h('span', { style: { color: '#ff9ec4' } }, '絆'), UI.heartRow(lv),
        h('span', { class: 'sub' }, lv < 3 ? `次の報酬：${G.BOND_REWARD[lv + 1]}` : 'すべての絆を結んだ')),
      h('div', { class: 'row', style: { gap: '6px', flexWrap: 'wrap' } }, eps.map((ep, i) => i < lv
        ? UI.btn(`${i + 1}.「${ep.t}」`, () => UI.talkScene(id, i, () => heroDetailModal(id), { replay: true }), 'sm')
        : h('span', { class: 'chip', style: { color: '#4b4b5c' } }, `${i + 1}. ？？？`))),
      sig ? h('div', { class: 'row', style: { gap: '6px', opacity: lv >= 3 ? 1 : 0.45 } }, h('span', { class: 'sub' }, '専用装備：'), UI.gearChip(sig), h('span', { style: { color: '#ffd93d' } }, lv >= 3 ? G.GEAR[sig].n : '？？？（絆Lv3で解放）')) : null,
      h('div', { class: 'sub' }, 'セーフハウスで「語らう」と絆が深まります。'));
  }

  function tabRoster(main) {
    const m = G.meta;
    main.appendChild(h('div', { class: 'sub', style: { marginBottom: '6px' } }, `居住区 Lv${m.fac.quarters}　—　仲間を選ぶと詳細を表示します。未加入の仲間は条件を満たすと勧誘できます。`));
    const grid = h('div', { class: 'roster scroll', style: { maxHeight: '410px', gridTemplateColumns: 'repeat(3, 1fr)' } });
    for (const id of G.HERO_ORDER) {
      const d = G.HEROES[id];
      const have = m.unlocked.includes(id);
      if (have) {
        grid.appendChild(h('div', { class: 'hcard panel', onclick: () => { A.sfx('click'); heroDetailModal(id); } },
          G.sprImg(id, 3),
          h('div', { class: 'col', style: { gap: '1px' } }, h('span', { class: 'hn' }, d.n), h('span', { class: 'row', style: { gap: '4px' } }, UI.roleBadge(d.role), UI.heartRow(m.bonds[id] || 0)), h('span', { class: 'ht' }, d.title))));
      } else {
        const r = G.recruitInfo(id);
        const u = r.u;
        const reqs = [];
        reqs.push(h('div', { style: { color: r.q ? '#7dffb0' : '#e8352e', fontSize: '11px' } }, `居住区Lv${u.q}`));
        if (u.cond) reqs.push(h('div', { style: { color: r.cond ? '#7dffb0' : '#e8352e', fontSize: '11px' } }, G.COND_TEXT[u.cond]));
        grid.appendChild(h('div', { class: 'hcard panel locked', style: { flexDirection: 'column', alignItems: 'stretch' } },
          h('div', { class: 'row' }, G.sprImg(id, 3, r.cond ? null : { sil: '#2b2440' }),
            h('div', { class: 'col', style: { gap: '1px' } }, h('span', { class: 'hn' }, r.cond ? d.n : '？？？'), UI.roleBadge(d.role), reqs)),
          h('div', { class: 'sub', style: { fontSize: '11px' } }, u.hint),
          h('div', { class: 'row', style: { justifyContent: 'space-between' } }, UI.costRow(u.cost),
            UI.btn('勧誘', () => {
              if (G.recruit(id)) {
                A.sfx('win');
                UI.base('roster');
                UI.modal(h('div', { class: 'col', style: { alignItems: 'center', gap: '10px' } },
                  h('div', { class: 'ttl' }, `${d.n}が仲間になった！`), G.sprImg(id, 6),
                  h('div', { style: { fontSize: '14px', textAlign: 'center' } }, G.RECRUIT_LINES[id] || d.quote),
                  UI.btn('よろしく', UI.closeModal)), { w: 460 });
              }
            }, 'sm', { disabled: !r.ok }))));
      }
    }
    main.appendChild(grid);
  }

  function tabFac(main) {
    const m = G.meta;
    const grid = h('div', { class: 'fac-grid' });
    for (const k of G.FAC_ORDER) {
      const f = G.FAC[k];
      const lv = m.fac[k];
      const nx = G.facNext(k);
      grid.appendChild(h('div', { class: 'fac panel col', style: { gap: '3px' } },
        h('div', { class: 'row' }, h('span', { class: 'fn' }, f.n), h('span', { class: 'pips' }, f.lv.map((x, i) => h('span', { class: 'pip' + (i < lv ? ' on' : '') })))),
        h('div', { class: 'sub' }, f.d),
        f.lv.map((x, i) => h('div', { class: 'fe' + (i < lv ? ' on' : i === lv ? ' next' : '') }, `Lv${i + 1}：${x.e}`)),
        nx ? h('div', { class: 'row', style: { justifyContent: 'space-between', marginTop: '3px' } }, UI.costRow(nx.cost),
          UI.btn('強化', () => { if (G.upgradeFac(k)) { A.sfx('buff'); UI.base(k === 'recycle' && m.fac.recycle === 1 ? 'gacha' : 'fac'); } }, 'sm', { disabled: !G.affordable(nx.cost) }))
          : h('div', { style: { color: '#b8ff3d', fontSize: '12px' } }, 'MAX')));
    }
    main.appendChild(h('div', { class: 'scroll', style: { maxHeight: '430px' } }, grid));
  }

  function tabLog(main) {
    const m = G.meta;
    const text = h('div', { class: 'lore-text' }, '左の一覧から記録を選んでください。');
    const ttl = h('div', { class: 'ttl', style: { fontSize: '16px', marginBottom: '6px' } }, 'アーカイブ');
    const list = h('div', { class: 'lore-list scroll', style: { width: '220px', maxHeight: '420px' } },
      G.LORE.map((l) => {
        const have = m.lore.includes(l.id);
        const isNew = m.newLore.includes(l.id);
        return h('div', { class: 'lore-item' + (isNew ? ' new' : ''), style: have ? null : { color: '#4b4b5c', cursor: 'default' }, onclick: (e) => {
          if (!have) return;
          A.sfx('click');
          ttl.textContent = l.t;
          text.textContent = l.s;
          m.newLore = m.newLore.filter((x) => x !== l.id);
          G.saveMeta();
          e.currentTarget.classList.remove('new');
        } }, have ? l.t : '？？？　（未解放）');
      }));
    main.appendChild(h('div', { class: 'row', style: { alignItems: 'flex-start', gap: '10px' } }, list,
      h('div', { class: 'panel grow scroll', style: { height: '420px' } }, ttl, text)));
  }

  function settingsModal() {
    const st = G.meta.settings;
    const body = h('div', { class: 'col', style: { gap: '10px' } });
    const draw = () => {
      body.innerHTML = '';
      body.appendChild(h('div', { class: 'ttl' }, '設定'));
      body.appendChild(h('div', { class: 'row' }, h('span', { style: { width: '120px' } }, '効果音'), UI.btn(st.sfx ? 'ON' : 'OFF', () => { st.sfx = !st.sfx; G.saveMeta(); draw(); }, st.sfx ? 'sel sm' : 'sm')));
      body.appendChild(h('div', { class: 'row' }, h('span', { style: { width: '120px' } }, 'BGM'), UI.btn(st.bgm ? 'ON' : 'OFF', () => { st.bgm = !st.bgm; G.saveMeta(); draw(); }, st.bgm ? 'sel sm' : 'sm')));
      body.appendChild(h('div', { class: 'row' }, h('span', { style: { width: '120px' } }, '戦闘速度'), [1, 1.6, 2.4].map((v) => UI.btn(v === 1 ? '普通' : v < 2 ? '速い' : '最速', () => { st.speed = v; G.speedMul = v; G.saveMeta(); draw(); }, st.speed === v ? 'sel sm' : 'sm'))));
      body.appendChild(h('div', { class: 'row' }, h('span', { style: { width: '120px' } }, '大きい文字'), UI.btn(UI.bigUI() ? 'ON' : 'OFF', () => { st.bigui = !UI.bigUI(); G.saveMeta(); UI.applyPrefs(); draw(); }, UI.bigUI() ? 'sel sm' : 'sm'),
        h('span', { class: 'sub' }, 'スマホ向け。説明やボタンを大きくします')));
      if (UI.canFullscreen()) body.appendChild(h('div', { class: 'row' }, h('span', { style: { width: '120px' } }, '全画面'), UI.btn(UI.isFullscreen() ? '解除' : '全画面にする', () => { UI.toggleFullscreen(); setTimeout(draw, 300); }, 'sm')));
      else if (UI.isIOS()) body.appendChild(h('div', { class: 'sub' }, 'iPhoneでは、Safariの共有ボタン →「ホーム画面に追加」から起動すると全画面で遊べます。'));
      body.appendChild(h('div', { class: 'row', style: { justifyContent: 'space-between', marginTop: '6px' } },
        UI.btn('データ初期化', () => UI.confirm('すべての進行状況を削除します。\n本当によろしいですか？', () => { G.resetAll(); UI.title(); }, '削除する'), 'sm pink'),
        UI.btn('閉じる', UI.closeModal, 'sm')));
    };
    draw();
    UI.modal(body, { w: 420 });
  }
  UI.settingsModal = settingsModal;

  function tabOpt(main) {
    main.appendChild(h('div', { class: 'panel col', style: { gap: '10px', width: '420px' } },
      h('div', { class: 'ttl' }, '設定'),
      UI.btn('サウンド・速度の設定', settingsModal),
      UI.btn('マザーの語りをもう一度聞く', () => UI.intro(() => UI.base('opt'))),
      UI.btn('用語集', () => UI.glossary()),
      UI.btn('タイトルへ戻る', () => UI.title())));
  }

  UI.glossary = () => {
    const of = (kind) => Object.keys(G.ST).filter((k) => G.stKind(k) === kind);
    const item = (k) => h('div', { style: { fontSize: '12.5px', marginBottom: '3px' } }, h('span', { class: 'st ' + G.stKind(k), style: { '--c': G.ST[k].c, display: 'inline-flex', marginRight: '6px' } }, G.ST[k].g), h('span', { style: { color: '#ffd93d' } }, G.ST[k].n), '：', G.stDesc(k, 'X'));
    const head = (kind, note) => h('div', { class: 'sub', style: { margin: '6px 0' } }, h('span', { class: 'tk ' + kind }, G.ST_KIND_N[kind]), note);
    UI.modal(h('div', null,
      h('div', { class: 'row' }, h('span', { class: 'ttl' }, '用語集'), h('span', { class: 'grow' }), UI.btn('閉じる', UI.closeModal, 'sm')),
      h('div', { class: 'scroll', style: { maxHeight: '420px', marginTop: '8px', columns: '2', columnGap: '18px' } },
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【シールド】受けるダメージを先に肩代わりする。自分のターン開始時に消える。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【エナジー】カードを使うためのコスト。毎ターン3回復する。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【廃棄】使用後、この戦闘中はデッキから除外される。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【速度】ラウンドごとに、速度の高い順に行動する。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【装備】仲間ひとりにつき1つ。エリート・補給コンテナ・闇市・イベントで手に入り、マップ画面の「装備」で付け替えられる。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【絆】セーフハウスで仲間と「語らう」と深まる。Lv1で最大HP+4、Lv2で初期カード強化、Lv3で専用装備（すべて永続）。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【連携】ハル＆ソラの能力。直前のカードとタイプ（アタック／スキル）が違うと発動する。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【割り込み／後回し】このラウンドの行動順を入れ替える。すでに行動済みなら加速／鈍足になる。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【記憶消去】敵の能力。山札のカードがその戦闘のあいだ使えなくなる。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【ルート】第一区画はいつも同じ。第二区画はランダム（ニューエデン／沈んだ旧市街／壊れたデータ区画）。終点は難易度で変わる。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【★伝説カード】危険以上の第三区画から、報酬にまれに出るキャラ専用の最強カード。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【バグ】深淵では、中身の読めない「？？？」マスや、HPが高く奇妙な能力をもつ「バグった敵」が出る。倒すとデータを落とす。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【支給品】戦闘中、仲間のターンにいつでも使える消耗品。最大3つ。戦闘報酬・闇市・補給コンテナで手に入る。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【指名手配】各区画にひとつ、改造されたエリートがいる。強いが、懸賞金・支給品・装備と、ボス並みのカード報酬がもらえる。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【マザーの加護】2回目以降の出撃前に、マザーが加護を1つくれる。赤い加護は代償つき。前回早くに撤退していると、敵を弱らせるジャミングを申し出てくれる。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【コンビ】特定の2人を同じパーティーに入れると、毎戦闘の開始時にボーナス。出撃準備画面で確認できる。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【ジャンクカプセル機】施設「リサイクル炉」で使える。余った素材を入れてまわすと、思い出・記録・フィギュア・色違い・称号が出る。入れる素材で中身の出やすさが変わる。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【イベントの種類】「〇〇の物語」はパーティーの仲間のお話。「つづきの物語」は出撃をまたいで続く。「★レアイベント」はめったに起きない。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【バグったカード】そのターンのあいだコスト0になったカード。ターン終了で元に戻る。'),
        h('div', { style: { fontSize: '12.5px', marginBottom: '6px' } }, '【状態の見かた】明るく塗られたアイコン＝バフ（有利）、黒地に色枠のアイコン＝デバフ（不利）。右下の数字はスタック数または残りターン。'),
        head('buff', '　有利な効果'), of('buff').map(item),
        head('debuff', '　不利な効果'), of('debuff').map(item),
        head('power', '　戦闘中ずっと続く'), of('power').map(item))), { w: 820 });
  };

  // ================= SORTIE =================
  function boonPick(run, next) {
    const s = UI.screen('boonpick');
    UI.bg(s, 'bunker', { seed: 14 });
    A.bgm('base');
    const ids = G.boonChoices(G.meta, run.diff);
    const rough = ids.includes('jam');
    s.appendChild(h('div', { class: 'topbar' }, h('span', { class: 'ttl' }, 'マザーの加護')));
    s.appendChild(h('div', { class: 'center layer col', style: { position: 'absolute', inset: 'auto', left: '50%', top: '50%', alignItems: 'center', gap: '16px' } },
      h('div', { class: 'row', style: { gap: '10px' } }, G.sprImg('mother', 2), h('div', { class: 'panel', style: { fontSize: '14px', maxWidth: '520px' } },
        rough ? '「前の出撃、つらかったわね。……今回は、少しだけSIの目をごまかしてあげる」' : '「出撃の前に、ひとつだけ。わたしにできることを選んで」')),
      h('div', { class: 'row', style: { gap: '14px', alignItems: 'stretch' } }, ids.map((id) => {
        const b = G.BOONS[id];
        return h('div', { class: 'panel boon' + (b.risk ? ' risk' : ''), onclick: () => { A.sfx('buff'); b.go(run); G.saveRun(); next(); } },
          h('div', { class: 'ttl', style: { fontSize: '16px', color: b.risk ? '#ff5a5a' : '#2ee6ff' } }, b.n),
          b.risk ? h('div', { class: 'sub', style: { color: '#ff9e9e' } }, '代償あり') : null,
          h('div', { style: { fontSize: '13px', marginTop: '6px' } }, b.d));
      })),
      UI.btn('何もいらない', () => next(), 'sm')));
  }

  UI.sortie = () => {
    const m = G.meta;
    let diff = Math.min(m.lastDiff || 0, m.diffMax);
    let party = (m.lastParty || []).filter((id) => m.unlocked.includes(id)).slice(0, 4);
    let focus = party[0] || m.unlocked[0];
    const s = UI.screen('sortie');
    UI.bg(s, 'bunker', { seed: 12 });
    A.bgm('base');
    s.appendChild(h('div', { class: 'topbar' }, h('span', { class: 'ttl' }, '出撃準備'), h('span', { class: 'sub' }, '難易度と4人の仲間を選んでください'), h('span', { class: 'grow' }), UI.btn('拠点に戻る', () => UI.base(), 'sm')));
    const left = h('div', { class: 'layer', style: { position: 'absolute', inset: 'auto', left: '12px', top: '46px', width: '200px' } });
    const center = h('div', { class: 'layer', style: { position: 'absolute', inset: 'auto', left: '222px', top: '46px', width: '470px', height: '482px' } });
    const right = h('div', { class: 'layer', style: { position: 'absolute', inset: 'auto', left: '702px', top: '46px', width: '246px', height: '482px' } });
    s.appendChild(left); s.appendChild(center); s.appendChild(right);

    const draw = () => {
      left.innerHTML = ''; center.innerHTML = ''; right.innerHTML = '';
      // difficulty
      left.appendChild(h('div', { class: 'sub', style: { marginBottom: '4px' } }, '難易度'));
      left.appendChild(h('div', { class: 'diffs' }, G.DIFF.map((d, i) => {
        const lock = i > m.diffMax;
        return h('div', { class: 'diff' + (i === diff ? ' sel' : '') + (lock ? ' lock' : ''), onclick: () => { if (lock) return; A.sfx('click'); diff = i; draw(); } },
          h('div', { class: 'dn', style: { color: d.c } }, (lock ? '🔒 ' : '') + d.n, h('span', { class: 'sub', style: { marginLeft: '6px' } }, d.en)),
          h('div', { class: 'dd' }, lock ? 'ひとつ下の難易度で作戦を完了すると解放' : d.d),
          !lock ? h('div', { class: 'dd', style: { color: '#c9c4dc' } }, G.DIFF_ROUTE[i]) : null,
          !lock ? h('div', { class: 'dd', style: { color: '#ffd93d' } }, `資源×${d.res}　制圧${m.clears[i] || 0}回`) : null);
      })));
      // roster
      center.appendChild(h('div', { class: 'sub', style: { marginBottom: '4px' } }, `仲間（クリックで編成／${party.length}/4）`));
      const grid = h('div', { class: 'roster scroll', style: { gridTemplateColumns: 'repeat(3, 1fr)', maxHeight: '440px' } });
      for (const id of G.HERO_ORDER) {
        if (!m.unlocked.includes(id)) continue;
        const d = G.HEROES[id];
        const si = party.indexOf(id);
        const el = h('div', { class: 'hcard panel' + (si >= 0 ? ' sel' : ''), style: { minHeight: '80px' },
          onmouseenter: () => { if (focus !== id) { focus = id; drawRight(); } },
          onclick: () => {
            A.sfx('click');
            if (si >= 0) party.splice(si, 1);
            else if (party.length < 4) party.push(id);
            focus = id;
            draw();
          } },
          G.sprImg(id, 3),
          h('div', { class: 'col', style: { gap: '1px' } }, h('span', { class: 'hn' }, d.n), UI.roleBadge(d.role), h('span', { class: 'ht' }, `HP${d.hp} 速${d.spd}`)),
          si >= 0 ? h('span', { class: 'slotno' }, String(si + 1)) : null);
        grid.appendChild(el);
      }
      center.appendChild(grid);
      drawRight();
    };
    const drawRight = () => {
      right.innerHTML = '';
      // slots
      right.appendChild(h('div', { class: 'sub', style: { marginBottom: '4px' } }, '編成（1番目が前衛上段）'));
      right.appendChild(h('div', { class: 'slots', style: { flexWrap: 'wrap', width: '246px' } }, [0, 1, 2, 3].map((i) => {
        const id = party[i];
        return h('div', { class: 'slot' + (id ? ' filled' : ''), style: { width: '57px', height: '74px' }, onclick: () => { if (id) { A.sfx('click'); party.splice(i, 1); draw(); } } },
          id ? G.sprImg(id, 2) : null, h('span', { style: { fontSize: '10px' } }, id ? G.HEROES[id].n : '空き'));
      })));
      // role coverage
      const roles = Object.keys(G.ROLES);
      right.appendChild(h('div', { class: 'row', style: { margin: '6px 0', gap: '4px' } }, roles.map((r) => {
        const has = party.some((id) => G.HEROES[id].role === r);
        return h('span', { class: 'rolebadge', style: { background: has ? G.ROLES[r].c : '#2b2440', color: has ? '#fff' : '#6b5f8a' } }, G.ROLES[r].n);
      })));
      // 人とAIのコンビ
      const duos = G.duosFor(party);
      right.appendChild(h('div', { class: 'duos' }, duos.length
        ? duos.map((d) => h('span', { class: 'chip duo', 'data-tip': `<div class="tn">コンビ「${d.n}」</div>${d.d}` }, `♥ ${G.HEROES[d.a].n}×${G.HEROES[d.b].n}`))
        : h('span', { class: 'sub' }, 'コンビなし（特定の2人を組ませるとボーナス）')));
      // detail
      if (focus) {
        const d = G.HEROES[focus];
        right.appendChild(h('div', { class: 'panel hdetail', style: { height: '262px', overflow: 'hidden' } },
          h('div', { class: 'row' }, h('span', { style: { fontSize: '16px', color: '#fff' } }, d.n), UI.roleBadge(d.role), d.ai ? h('span', { class: 'chip', style: { color: '#2ee6ff' } }, 'AI') : null, UI.heartRow(m.bonds[focus] || 0)),
          h('div', { class: 'sub' }, d.title + `　HP${d.hp} 速度${d.spd}`),
          h('div', { style: { color: '#ffd93d', marginTop: '3px' } }, `特性「${d.trait.n}」`),
          h('div', null, d.trait.d),
          h('div', { class: 'q' }, d.quote),
          h('div', { class: 'sub', style: { marginTop: '3px' } }, '初期デッキ（カーソルで詳細）'),
          h('div', { class: 'deckmini' }, d.deck.map(([cid, n]) => {
            const c = G.CARDS[cid];
            return h('span', { class: 'chip', 'data-tip': `<div class="tn">${c.n}（コスト${c.c}）</div>${G.E.cardText({ id: cid, up: false })}` }, `${c.n}×${n}`);
          })),
          h('div', { style: { marginTop: '4px' } }, UI.btn('詳しく見る', () => heroDetailModal(focus), 'sm'))));
      }
      const ok = party.length === 4;
      right.appendChild(h('div', { style: { marginTop: '8px', display: 'flex', justifyContent: 'center' } },
        UI.btn(ok ? '出撃！' : `あと${4 - party.length}人`, () => startRun(diff, party.slice()), 'big pink', { disabled: !ok })));
    };
    draw();
  };

  function startRun(diff, party) {
    const begin = (relic) => {
      G.run = G.newRun(diff, party);
      if (relic) G.addRelic(G.run, relic);
      G.saveRun();
      // マザーの加護: from the second sortie on, Mother offers one blessing (some with a price)
      if (G.meta.runs > 1) boonPick(G.run, () => UI.actIntro(1));
      else UI.actIntro(1);
    };
    const choices = G.startRelicChoices();
    if (!choices.length) { begin(null); return; }
    const s = UI.screen('relicpick');
    UI.bg(s, 'bunker', { seed: 13 });
    s.appendChild(h('div', { class: 'topbar' }, h('span', { class: 'ttl' }, 'マザーコア：装備の持ち出し')));
    s.appendChild(h('div', { class: 'center layer col', style: { position: 'absolute', inset: 'auto', left: '50%', top: '50%', alignItems: 'center', gap: '16px' } },
      h('div', { class: 'row', style: { gap: '10px' } }, G.sprImg('mother', 2), h('div', { class: 'panel', style: { fontSize: '14px' } }, '「ひとつだけ、持っていって。きっと役に立つわ」')),
      h('div', { class: 'row', style: { gap: '14px', alignItems: 'stretch' } }, choices.map((id) => UI.relicPanel(id, () => begin(id)))),
      UI.btn('何も持っていかない', () => begin(null), 'sm')));
  }
})();
