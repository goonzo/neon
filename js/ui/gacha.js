// Junk capsule machine (base tab), capsule opening, and the collection (memories, records, figures, colours, titles)
(function () {
  const G = globalThis.G;
  const h = G.h;
  const UI = G.UI;
  const A = G.A;

  // a sprite <img> fitted into a box of `box` px (integer scale, crisp)
  function fitImg(name, box) {
    const sz = G.sprSize(name);
    const img = document.createElement('img');
    img.src = G.sprURL(name);
    img.className = 'px';
    const sc = Math.max(1, Math.floor(box / Math.max(sz.w, sz.h)));
    img.width = sz.w * sc; img.height = sz.h * sc;
    img.draggable = false;
    return img;
  }
  function prizeIcon(it, box) {
    box = box || 64;
    if (it.cat === 'memory') return fitImg(it.ref, box);
    if (it.cat === 'skin') return fitImg(G.skinSprite(it.ref, it.skin), box);
    if (it.cat === 'figure') return fitImg(it.ref, box);
    if (it.cat === 'record') return fitImg(it.r === 'SR' ? 'mother' : 'i_data', box);
    return h('div', { class: 'gt-title', style: { width: box + 'px', height: box + 'px' } }, '称号');
  }
  UI.prizeIcon = prizeIcon;

  function rarityTag(r) { return h('span', { class: 'grar grar-' + r }, r); }

  // the machine itself, drawn as a little pixel canvas
  function machineCanvas() {
    const W = 40, H = 56;
    const cv = h('canvas', { class: 'px', width: W, height: H, style: { width: W * 4 + 'px', height: H * 4 + 'px' } });
    const x = cv.getContext('2d');
    const r = (X, Y, w, hh, c) => { x.fillStyle = c; x.fillRect(X, Y, w, hh); };
    const O = '#0b0a12';
    // sign
    r(6, 0, 28, 8, O); r(7, 1, 26, 6, '#ff3d8b'); for (let i = 0; i < 6; i++) r(9 + i * 4, 3, 2, 2, '#ffe6f3');
    // dome
    r(4, 8, 32, 24, O); r(5, 9, 30, 22, '#9ef2ff'); r(5, 9, 30, 2, '#e8fdff'); r(7, 11, 2, 12, '#e8fdff');
    const caps = ['#ff3d8b', '#ffd93d', '#2ee6ff', '#7dffb0', '#ffffff', '#ff8a2b', '#b48cff'];
    let k = 0;
    for (let y = 26; y >= 13; y -= 5) for (let xx = 8 + ((y >> 1) % 3); xx < 31; xx += 6) { const c = caps[k++ % caps.length]; r(xx, y, 5, 4, O); r(xx + 1, y + 1, 3, 1, c); r(xx + 1, y + 2, 3, 1, '#ffffff'); }
    // body
    r(2, 32, 36, 22, O); r(3, 33, 34, 20, '#c0392b'); r(3, 33, 34, 2, '#e8635a'); r(3, 51, 34, 2, '#8a2418');
    r(24, 37, 9, 9, O); r(25, 38, 7, 7, '#ffd93d'); r(27, 40, 3, 3, '#e0a020'); // handle
    r(7, 41, 12, 8, O); r(8, 42, 10, 6, '#1b1630'); // prize door
    r(9, 37, 8, 2, O); // coin slot
    r(4, 54, 6, 2, O); r(30, 54, 6, 2, O);
    return cv;
  }

  UI.gachaTab = (main) => {
    const m = G.meta;
    const st = G.gachaState();
    let mat = m.gachaMat || 'scrap';
    const left = h('div', { class: 'col', style: { width: '210px', alignItems: 'center', gap: '6px' } });
    const right = h('div', { class: 'col grow', style: { gap: '8px' } });
    main.appendChild(h('div', { class: 'row', style: { alignItems: 'flex-start', gap: '14px' } }, left, right));
    const machine = machineCanvas();
    machine.classList.add('gmachine');
    left.appendChild(machine);
    const items = G.gachaItems();
    const own = Object.keys(st.own).length;
    left.appendChild(h('div', { class: 'sub' }, `コレクション ${own}/${items.length}`));
    left.appendChild(h('div', { class: 'row', style: { gap: '6px' } }, h('span', { style: { color: '#b8ff3d' } }, `部品 ${st.parts}`), h('span', { class: 'sub' }, `保証まで あと${Math.max(1, 10 - st.pity)}回`)));
    left.appendChild(UI.btn('コレクション', () => UI.collection(), 'sm'));

    const draw = () => {
      right.innerHTML = '';
      const cost = G.gachaCost();
      right.appendChild(h('div', { class: 'panel', style: { fontSize: '13px' } },
        h('div', { class: 'ttl', style: { fontSize: '16px' } }, 'ジャンクカプセル機'),
        h('div', null, '余った素材を入れてハンドルを回すと、カプセルが出てくる。入れる素材で、出やすい中身が変わる。'),
        h('div', { class: 'sub' }, `1回：素材${cost}個　10連：${cost * 10}個${G.gachaLv() >= 2 ? '（おまけ+1回）' : ''}　／　10回に1回はR以上が確定`)));
      right.appendChild(h('div', { class: 'gmats' }, Object.keys(G.GACHA_MATS).map((k) => {
        const d = G.GACHA_MATS[k];
        return h('div', { class: 'gmat panel' + (k === mat ? ' sel' : ''), onclick: () => { A.sfx('click'); mat = k; m.gachaMat = k; draw(); } },
          h('div', { class: 'row', style: { gap: '4px' } }, UI.resIcon(k), h('span', null, d.n), h('span', { class: 'grow' }), h('span', { class: 'sub' }, String(m.res[k] || 0))),
          h('div', { class: 'sub', style: { fontSize: '11px' } }, d.d));
      })));
      const have = m.res[mat] || 0;
      right.appendChild(h('div', { class: 'row', style: { gap: '10px', justifyContent: 'center', marginTop: '4px' } },
        UI.btn(`1回まわす（${G.GACHA_MATS[mat].n}${cost}）`, () => pull(1), 'pink', { disabled: have < cost }),
        UI.btn(`10連（${G.GACHA_MATS[mat].n}${cost * 10}）`, () => pull(10), 'big pink', { disabled: have < cost * 10 })));
      right.appendChild(h('div', { class: 'sub', style: { textAlign: 'center' } },
        `出現率　SR ${G.gachaLv() >= 3 ? 9 : 5}%　R ${G.gachaLv() >= 3 ? 36 : 30}%　N ${G.gachaLv() >= 3 ? 55 : 65}%　／　かぶりは「部品」になり、部品で好きなものと交換できる`));
    };
    const pull = (n) => {
      const res = G.gachaPull(mat, n);
      if (!res) return;
      machine.classList.remove('spin'); void machine.offsetWidth; machine.classList.add('spin');
      A.sfx('buff');
      setTimeout(() => openCapsules(res, () => UI.base('gacha')), 500);
    };
    draw();
  };

  // ---------------- opening ----------------
  const CAP = { N: ['#c9c4dc', '#8a84a8'], R: ['#2ee6ff', '#137a99'], SR: ['#ffd93d', '#ff3d8b'] };
  function capsuleEl(r) {
    const [a, b] = CAP[r];
    return h('div', { class: 'capsule cap-' + r, style: { '--ca': a, '--cb': b } }, h('div', { class: 'ctop' }), h('div', { class: 'cbot' }));
  }
  function resultCard(res, onRead) {
    const it = res.item;
    return h('div', { class: 'gres panel rar-b-' + it.r },
      h('div', { class: 'gicon' }, prizeIcon(it, 64)),
      h('div', { class: 'row', style: { gap: '4px', justifyContent: 'center' } }, rarityTag(it.r), h('span', { class: 'sub', style: { fontSize: '10px' } }, G.GACHA_CATS[it.cat])),
      h('div', { class: 'gname' }, it.n),
      res.dupe ? h('div', { class: 'sub', style: { color: '#b8ff3d', fontSize: '11px' } }, `かぶり → 部品+${res.parts}`) : h('div', { class: 'gnew' }, 'NEW!'),
      onRead && (it.cat === 'memory' || it.cat === 'record') ? UI.btn('読む', () => onRead(it), 'sm') : null);
  }
  function openCapsules(results, done) {
    // the rarest ones open last
    const rank = { N: 0, R: 1, SR: 2 };
    results = results.slice().sort((a, b) => rank[a.item.r] - rank[b.item.r]);
    const best = results.some((x) => x.item.r === 'SR') ? 'SR' : results.some((x) => x.item.r === 'R') ? 'R' : 'N';
    const grid = h('div', { class: 'ggrid' + (results.length === 1 ? ' one' : '') });
    const head = h('div', { class: 'ttl', style: { textAlign: 'center' } }, 'カプセルが出てきた！');
    const foot = h('div', { class: 'row', style: { justifyContent: 'center', gap: '10px', marginTop: '10px' } });
    const body = h('div', { class: 'gopen best-' + best }, head, grid, foot);
    UI.modal(body, { w: results.length === 1 ? 360 : 860 });
    const cells = results.map((res) => {
      const cell = h('div', { class: 'gcell' }, capsuleEl(res.item.r));
      grid.appendChild(cell);
      return cell;
    });
    let i = 0, skipping = false;
    const reveal = () => {
      if (i >= results.length) {
        foot.appendChild(UI.btn('閉じる', () => { UI.closeModal(); done(); }, 'pink'));
        return;
      }
      const cell = cells[i], res = results[i];
      cell.firstChild.classList.add('pop');
      if (res.item.r === 'SR') A.sfx('win'); else if (res.item.r === 'R') A.sfx('buff'); else A.sfx('click');
      setTimeout(() => {
        cell.innerHTML = '';
        cell.appendChild(resultCard(res, (it) => readPrize(it)));
        if (res.item.r === 'SR') cell.classList.add('shine');
        i++;
        setTimeout(reveal, skipping ? 40 : results.length === 1 ? 0 : 260);
      }, skipping ? 60 : 380);
    };
    if (results.length > 1) foot.appendChild(UI.btn('すぐ開ける', (e) => { skipping = true; e.currentTarget.remove(); }, 'sm'));
    head.textContent = best === 'SR' ? '★ 虹色のカプセルが出てきた！ ★' : 'カプセルが出てきた！';
    setTimeout(reveal, best === 'SR' ? 900 : 500);
  }

  // ---------------- reading ----------------
  function readPrize(it) {
    let t = '', s = '', spr = 'mother';
    if (it.cat === 'memory') { const mm = G.MEMORIES[it.ref]; t = mm.t; s = mm.s; spr = it.ref; }
    if (it.cat === 'record') { const rc = G.RECORDS.find((x) => x.id === it.ref); t = rc.t; s = rc.s; }
    const ov = h('div', { class: 'gread' },
      h('div', { class: 'panel col', style: { gap: '8px', width: '560px', alignItems: 'stretch' } },
        h('div', { class: 'row', style: { gap: '10px' } }, fitImg(spr, 80), h('div', { class: 'col' }, h('span', { class: 'ttl' }, t), h('span', { class: 'sub' }, it.cat === 'memory' ? `${G.HEROES[it.ref].n}の思い出` : 'マザーの記録'))),
        h('div', { class: 'lore-text', style: { whiteSpace: 'pre-wrap', fontSize: '14px' } }, s),
        h('div', { style: { textAlign: 'right' } }, UI.btn('閉じる', () => ov.remove(), 'sm'))));
    UI.root().appendChild(ov);
  }

  // ---------------- collection ----------------
  UI.collection = (cat) => {
    cat = cat || 'memory';
    const m = G.meta;
    const st = G.gachaState();
    const items = G.gachaItems();
    const body = h('div');
    const draw = () => {
      body.innerHTML = '';
      const cats = Object.keys(G.GACHA_CATS);
      body.appendChild(h('div', { class: 'row', style: { gap: '6px', flexWrap: 'wrap' } },
        h('span', { class: 'ttl' }, 'コレクション'),
        cats.map((c) => {
          const all = items.filter((x) => x.cat === c), got = all.filter((x) => st.own[x.key]).length;
          return UI.btn(`${G.GACHA_CATS[c]} ${got}/${all.length}`, () => { cat = c; draw(); }, 'sm' + (c === cat ? ' sel' : ''));
        }),
        h('span', { class: 'grow' }), h('span', { style: { color: '#b8ff3d' } }, `部品 ${st.parts}`), UI.btn('閉じる', UI.closeModal, 'sm')));
      const note = {
        memory: '仲間の思い出のひとかけら。クリックで読める。',
        record: 'マザーが拠点に残している記録。SRは極秘。',
        figure: '地上で戦った相手のフィギュア。マウスを重ねると説明が読める。',
        skin: '仲間の色違い。手に入れたら「着る」で、出撃や拠点でもその姿になる。',
        title: '拠点の上に表示される称号。',
      }[cat];
      body.appendChild(h('div', { class: 'sub', style: { margin: '6px 0' } }, note + `　未入手のものは部品で交換できる（N${G.PARTS_TO_TRADE.N}／R${G.PARTS_TO_TRADE.R}／SR${G.PARTS_TO_TRADE.SR}）`));
      const grid = h('div', { class: 'gcoll scroll' });
      for (const it of items.filter((x) => x.cat === cat)) {
        const got = !!st.own[it.key];
        const cost = G.PARTS_TO_TRADE[it.r];
        let act = null;
        if (got && (it.cat === 'memory' || it.cat === 'record')) act = UI.btn('読む', () => readPrize(it), 'sm');
        if (got && it.cat === 'skin') {
          const on = G.skinOf(it.ref) === it.skin;
          act = UI.btn(on ? '着ている' : '着る', () => { m.skin[it.ref] = on ? '' : it.skin; G.saveMeta(); draw(); }, 'sm' + (on ? ' sel' : ''));
        }
        if (got && it.cat === 'title') {
          const on = m.title === it.ref;
          act = UI.btn(on ? 'つけている' : 'つける', () => { m.title = on ? '' : it.ref; G.saveMeta(); draw(); }, 'sm' + (on ? ' sel' : ''));
        }
        if (!got) act = UI.btn(`交換 ${cost}`, () => { if (G.gachaTrade(it.key)) { A.sfx('buff'); draw(); } }, 'sm', { disabled: st.parts < cost });
        const tip = got && it.cat === 'figure' && G.ENEMIES[it.ref].lore ? G.ENEMIES[it.ref].lore : null;
        grid.appendChild(h('div', { class: 'gitem panel' + (got ? '' : ' locked'), 'data-tip': tip },
          h('div', { class: 'gicon' }, got ? prizeIcon(it, 56) : h('div', { class: 'gq' }, '？')),
          h('div', { class: 'row', style: { gap: '3px', justifyContent: 'center' } }, rarityTag(it.r)),
          h('div', { class: 'gname', style: got ? null : { color: '#6b5f8a' } }, it.cat === 'record' && !got && it.r === 'SR' ? '極秘記録' : it.n),
          act));
      }
      body.appendChild(grid);
    };
    draw();
    UI.modal(body, { w: 880 });
  };
})();
