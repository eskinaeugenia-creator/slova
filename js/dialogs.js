/* Мои слова — диалоги-ситуации по уровням и темам: два голоса, интерактивный текст,
   ключевые фразы в словарь, вопросы на понимание, ролевая игра. */
(function () {
  'use strict';
  const C = window.Core;
  const { S, h, $, icon, toast, go, routes, screen, Speech, saveWord, newWord, wordsArr, ensureSet, kvGet, kvSet } = window.App;
  const LEVELS = { 1: 'Совсем просто', 2: 'Легко', 3: 'Средне', 4: 'Сложнее', 5: 'Продвинутый' };
  const T = () => window.DIALOG_TOPICS || {};
  const all = () => window.DIALOGS || [];
  const byId = (id) => all().find(d => d.id === id);

  // ---------- Два голоса ----------
  const MALE = /alex|daniel|fred|tom|aaron|arthur|rishi|oliver|gordon|reed|rocko|eddy|grandpa|ralph|\bmale|guy|james|david|mark|george|lee|evan|nathan|ryan|christopher|eric|brian/i;
  const FEMALE = /samantha|karen|moira|tessa|nicky|martha|victoria|allison|ava|susan|zoe|kate|serena|fiona|catherine|female|flo|shelley|sandy|grandma|joanna|aria|jenny|libby|sonia|emma|natasha|olivia|amy|salli|kimberly|ivy/i;
  function voiceFor(g) {
    const main = Speech.voice(); const vs = Speech.voices || [];
    const re = g === 'm' ? MALE : FEMALE;
    const lang = main ? main.lang.slice(0, 5) : 'en-US';
    const v = vs.find(x => re.test(x.name) && x.lang.slice(0, 5) === lang && x.localService) || vs.find(x => re.test(x.name) && x.lang.slice(0, 5) === lang) || vs.find(x => re.test(x.name));
    if (v) return { voice: v, pitch: 1 };
    // одного голоса мало — различаем высотой
    return { voice: main, pitch: g === 'm' ? 0.8 : 1.25 };
  }
  let token = 0;
  function stop() { token++; try { speechSynthesis.cancel(); } catch (e) { /* нет озвучки */ } }
  function sayAs(text, g, slow) {
    return new Promise(resolve => {
      if (!text || !Speech.supported || !S.settings.sound) { setTimeout(() => resolve(true), 500); return; }
      const my = ++token;
      try {
        const u = new SpeechSynthesisUtterance(String(text));
        const vv = voiceFor(g); if (vv.voice) { u.voice = vv.voice; u.lang = vv.voice.lang; } else u.lang = 'en-US';
        u.pitch = vv.pitch; u.rate = slow ? S.settings.slowRate : S.settings.rate;
        let done = false; const fin = () => { if (done) return; done = true; resolve(my === token); };
        u.onend = fin; u.onerror = fin;
        setTimeout(fin, 1500 + String(text).length * 120);
        speechSynthesis.speak(u);
      } catch (e) { resolve(true); }
    });
  }

  // ---------- Прогресс ----------
  async function prog() { return (await kvGet('dialogProgress')) || {}; }
  async function mark(id, patch) { const p = await prog(); p[id] = Object.assign({}, p[id], patch, { last: Date.now() }); await kvSet('dialogProgress', p); }

  // ---------- Список ----------
  routes.dialogs = async function () {
    stop();
    const main = screen({ title: 'Диалоги', back: 'train' });
    const p = await prog();
    const topic = S.ui.dlgTopic || 'all';
    main.append(h('p', { class: 'muted small' }, 'Короткие разговоры из жизни. Слушайте двумя голосами, нажимайте на слова, отвечайте на вопросы и сыграйте роль сами.'));
    const chips = h('div', { class: 'chips', style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
      [['all', '✨', 'Все']].concat(Object.keys(T()).map(k => [k, T()[k][0], T()[k][1]])).map(([k, ic, name]) =>
        h('button', { class: 'chip', 'aria-pressed': String(topic === k), onclick: () => { S.ui.dlgTopic = k; routes.dialogs(); } }, ic + ' ' + name)));
    main.append(chips);
    const list = all().filter(d => topic === 'all' || d.topic === topic);
    Object.keys(LEVELS).forEach(lv => {
      const ds = list.filter(d => String(d.lvl) === lv); if (!ds.length) return;
      main.append(h('div', { class: 'section-title' }, 'Уровень ' + lv + ' · ' + LEVELS[lv]));
      ds.forEach(d => {
        const r = p[d.id] || {};
        const pill = r.role != null ? h('span', { class: 'pill solid' }, '✓ ' + r.role + '%') : r.read ? h('span', { class: 'pill learning' }, 'прочитан') : null;
        main.append(h('button', { class: 'tile wide', onclick: () => go('dialog-' + d.id) },
          h('span', { class: 'tile-ic' }, (T()[d.topic] || ['💬'])[0]), h('span', { class: 'tile-t grow' }, h('b', { lang: 'en' }, d.title), h('small', null, d.ru + ' · ' + (T()[d.topic] || ['', ''])[1].toLowerCase())), pill));
      });
    });
    if (!list.length) main.append(h('p', { class: 'muted' }, 'В этой теме пока нет диалогов.'));
  };

  // ---------- Диалог ----------
  function lineEl(d, ln, i, showTr) {
    const [who, en, ru] = ln;
    const body = h('p', { class: 'rp-text' });
    en.split(/([A-Za-z]+(?:['’][A-Za-z]+)?)/).forEach((part, k) => {
      if (k % 2 === 1) body.append(h('span', { class: 'rw', 'data-w': part }, part));
      else if (part) body.append(document.createTextNode(part));
    });
    const tr = h('div', { class: 'rp-tr', lang: 'ru', hidden: !showTr }, ru);
    const el = h('div', { class: 'bubble ' + (who === 'A' ? 'a' : 'b') + ' rp', 'data-i': i },
      h('div', { class: 'who' }, d.who[who][0]),
      body, tr,
      h('div', { class: 'rp-tools' }, h('button', { class: 'btn ghost sm', 'aria-label': 'Прослушать реплику', onclick: () => sayAs(en, d.who[who][1]) }, icon('speaker')),
        h('button', { class: 'btn ghost sm', onclick: () => { tr.hidden = !tr.hidden; } }, 'Перевод')));
    el._en = en;
    return el;
  }
  routes.dialog = async function (id) {
    stop();
    const d = byId(id); if (!d) return go('dialogs');
    const main = screen({ title: 'Диалог', back: 'dialogs' });
    const known = new Set(wordsArr().filter(w => !w.archived).map(w => C.keyEn(w.en)));
    const showTr = () => S.ui.dlgTr === true;
    const lines = d.lines.map((ln, i) => lineEl(d, ln, i, showTr()));
    lines.forEach(el => el.querySelectorAll('.rw').forEach(s => { if (window.Books && known.has(C.keyEn(Books.lookup(s.dataset.w).lemma))) s.classList.add('known'); }));
    const chat = h('div', { class: 'chat' }, lines);
    chat.addEventListener('click', e => { const t = e.target.closest('.rw'); if (t && window.Books) Books.wordSheet(t, { title: d.title, source: 'Диалог «' + d.title + '»', set: 'Из диалогов' }); });
    let playing = false;
    const playBtn = h('button', { class: 'btn primary', id: 'dlg-play', onclick: () => playing ? halt() : play() }, icon('speaker'), 'Слушать диалог');
    function halt() { playing = false; stop(); lines.forEach(l => l.classList.remove('reading')); playBtn.lastChild.textContent = 'Слушать диалог'; }
    async function play() {
      stop(); playing = true; playBtn.lastChild.textContent = 'Стоп';
      for (let i = 0; i < d.lines.length && playing; i++) {
        lines.forEach(l => l.classList.remove('reading')); lines[i].classList.add('reading');
        lines[i].scrollIntoView({ block: 'center', behavior: 'smooth' });
        const ok = await sayAs(d.lines[i][1], d.who[d.lines[i][0]][1], !!S.ui.dlgSlow);
        if (!ok) { playing = false; break; }
        await new Promise(r => setTimeout(r, 250));
      }
      if (playing) { halt(); mark(d.id, { read: true }); } else lines.forEach(l => l.classList.remove('reading'));
    }
    const slow = h('label', { class: 'chip' }, h('input', { type: 'checkbox', checked: !!S.ui.dlgSlow, style: { marginRight: '6px' }, onchange: e => { S.ui.dlgSlow = e.target.checked; } }), 'медленно');
    const trSw = h('label', { class: 'chip' }, h('input', { type: 'checkbox', checked: showTr(), style: { marginRight: '6px' }, onchange: e => { S.ui.dlgTr = e.target.checked; lines.forEach(l => { l.querySelector('.rp-tr').hidden = !e.target.checked; }); } }), 'перевод');
    const topic = T()[d.topic] || ['💬', ''];
    main.append(h('div', { class: 'card stack' },
      h('div', { class: 'row', style: { justifyContent: 'space-between', alignItems: 'baseline' } }, h('h2', { lang: 'en' }, d.title), h('span', { class: 'pill' }, 'уровень ' + d.lvl)),
      h('p', { class: 'muted', style: { margin: 0 } }, topic[0] + ' ' + d.ru),
      h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '8px' } }, playBtn, slow, trSw),
      h('p', { class: 'tiny muted' }, 'Нажмите на слово — перевод и «в словарь».')),
      h('div', { class: 'card' }, chat));

    // Ключевые фразы
    const keyBox = h('div', { class: 'stack', style: { gap: '6px' } });
    const inDict = (en) => wordsArr().some(w => !w.archived && C.keyEn(w.en) === C.keyEn(en));
    const drawKeys = () => {
      keyBox.innerHTML = '';
      d.keys.forEach(([en, ru]) => keyBox.append(h('div', { class: 'row nowrap', style: { gap: '8px', alignItems: 'center' } },
        h('button', { class: 'icon-btn', 'aria-label': 'Произнести', onclick: () => Speech.say(en) }, icon('speaker')),
        h('div', { class: 'grow' }, h('b', { lang: 'en' }, en), h('div', { class: 'small muted' }, ru)),
        inDict(en) ? h('span', { class: 'small muted' }, '✓ в словаре') : h('button', { class: 'btn sm soft', onclick: () => addPhrases([[en, ru]]) }, '+ в словарь'))));
    };
    async function addPhrases(list) {
      const setId = await ensureSet('Из диалогов');
      const fresh = list.filter(([en]) => !inDict(en));
      for (const [en, ru] of fresh) {
        const ex = (d.lines.find(l => l[1].toLowerCase().includes(en.replace(/[.?!…]+$/, '').toLowerCase())) || [])[1] || '';
        const ln = d.lines.find(l => l[1] === ex);
        await saveWord(newWord({ en, ru, example: ex !== en ? ex : '', exampleRu: ex !== en && ln ? ln[2] : '', source: 'Диалог «' + d.title + '»', setIds: [setId], pos: 'phrase' }));
      }
      toast(fresh.length ? 'Добавлено в словарь: ' + fresh.length : 'Всё уже в словаре');
      drawKeys();
    }
    drawKeys();
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Ключевые фразы'), keyBox,
      h('button', { class: 'btn block', id: 'dlg-keys-all', onclick: () => addPhrases(d.keys) }, 'Добавить все фразы в словарь')));

    // Вопросы
    const qBox = h('div', { class: 'card stack' }, h('h2', null, 'Проверьте понимание'));
    d.q.forEach(([q, opts, a]) => {
      const order = C.shuffle(opts.map((o, i) => i));
      const box = h('div', { class: 'options' });
      order.forEach(i => box.append(h('button', { class: 'opt', onclick: (e) => {
        [...box.children].forEach((b, k) => { b.disabled = true; if (order[k] === a) b.classList.add('right'); });
        if (i !== a) e.currentTarget.classList.add('wrong');
      } }, opts[i])));
      qBox.append(h('div', { class: 'stack', style: { gap: '8px' } }, h('b', null, q), box));
    });
    main.append(qBox);
    const me = d.who[d.role][0];
    main.append(h('button', { class: 'btn primary big block', id: 'dlg-role', onclick: () => { halt(); mark(d.id, { read: true }); go('drole-' + d.id); } }, '🎭 Ролевая игра: вы — ' + me));
  };

  // ---------- Ролевая игра ----------
  routes.drole = async function (id) {
    stop();
    const d = byId(id); if (!d) return go('dialogs');
    const meKey = d.role, other = meKey === 'A' ? 'B' : 'A';
    let i = 0, score = 0, tries = 0;
    const root = $('#app');
    const myLines = all().filter(x => x.lvl === d.lvl || Math.abs(x.lvl - d.lvl) === 1).flatMap(x => x.lines.map(l => l[1]));
    async function step() {
      root.innerHTML = '';
      const pct = Math.round(i / d.lines.length * 100);
      const body = h('div', { class: 'sbody' });
      root.append(h('div', { class: 'session' }, h('div', { class: 'sbar' },
        h('button', { class: 'icon-btn', 'aria-label': 'Выйти', onclick: () => { stop(); go('dialog-' + d.id); } }, icon('close')),
        h('div', { class: 'meter' }, h('i', { style: { width: pct + '%' } })), h('span', { class: 'small muted num' }, Math.min(i + 1, d.lines.length) + '/' + d.lines.length)), body));
      if (i >= d.lines.length) return finish(body);
      // уже прошедшие реплики
      const chat = h('div', { class: 'chat' });
      d.lines.slice(Math.max(0, i - 2), i).forEach(([w, en]) => chat.append(h('div', { class: 'bubble ' + (w === 'A' ? 'a' : 'b') }, h('div', { class: 'who' }, d.who[w][0]), h('p', { class: 'rp-text', lang: 'en' }, en))));
      body.append(chat);
      const [who, en, ru] = d.lines[i];
      if (who === other) {
        const b = h('div', { class: 'bubble ' + (who === 'A' ? 'a' : 'b') + ' reading' }, h('div', { class: 'who' }, d.who[who][0]), h('p', { class: 'rp-text', lang: 'en' }, en), h('div', { class: 'rp-tr' }, ru));
        chat.append(b);
        const nb = h('button', { class: 'btn primary big block', id: 'role-next', onclick: () => { stop(); i++; step(); } }, 'Дальше');
        body.append(h('div', { class: 'actions' }, h('button', { class: 'btn block', onclick: () => sayAs(en, d.who[who][1]) }, icon('speaker'), 'Ещё раз'), nb));
        setTimeout(() => nb.focus(), 30);
        sayAs(en, d.who[who][1]);
        return;
      }
      // ваша реплика
      tries++;
      body.append(h('div', { class: 'task' }, 'Ваша реплика — скажите по-английски'), h('div', { class: 'prompt' }, h('div', { class: 'mid' }, ru)));
      const fb = h('div'); const actions = h('div', { class: 'actions' });
      const words = en.replace(/[.?!]+$/, '').split(' ');
      const reveal = (ok) => {
        if (ok) score++;
        fb.innerHTML = '';
        fb.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') }, h('div', { class: 'title' }, ok ? 'Верно!' : 'Вот как правильно'),
          h('div', { lang: 'en' }, h('b', null, en)), h('div', { class: 'small muted' }, 'Повторите вслух вслед за голосом — так фраза запоминается.')));
        sayAs(en, d.who[meKey][1]);
        actions.innerHTML = '';
        const nb = h('button', { class: 'btn primary big block', id: 'role-next', onclick: () => { stop(); i++; step(); } }, 'Дальше');
        actions.append(h('button', { class: 'btn block', onclick: () => sayAs(en, d.who[meKey][1], true) }, icon('slow'), 'Медленно'), nb);
        setTimeout(() => nb.focus(), 30);
      };
      if (words.length <= 9) {
        const tiles = C.shuffle(words.map((t, k) => ({ t, k })));
        const chosen = []; let locked = false;
        const line = h('div', { class: 'answer-line' }); const pool = h('div', { class: 'tiles' });
        const draw = () => {
          line.innerHTML = ''; pool.innerHTML = '';
          chosen.forEach((c, k) => line.append(h('button', { class: 'tile', onclick: () => { if (locked) return; chosen.splice(k, 1); draw(); } }, c.t)));
          tiles.forEach(c => pool.append(h('button', { class: 'tile' + (chosen.includes(c) ? ' used' : ''), onclick: () => { if (locked || chosen.includes(c)) return; chosen.push(c); draw(); } }, c.t)));
        };
        draw();
        body.append(h('div', { class: 'small muted' }, 'Соберите фразу из слов'), line, pool, fb, actions);
        actions.append(h('button', { class: 'btn primary big block', id: 'role-check', onclick: () => {
          if (locked || !chosen.length) return; locked = true;
          reveal(C.norm(chosen.map(c => c.t).join(' ')) === C.norm(words.join(' ')));
        } }, 'Проверить'), h('button', { class: 'btn ghost block', onclick: () => { if (!locked) { locked = true; reveal(false); } } }, 'Показать ответ'));
      } else {
        const others = C.shuffle(myLines.filter(x => x !== en && x.split(' ').length > 5)).slice(0, 2);
        const opts = C.shuffle([en].concat(others));
        const box = h('div', { class: 'options' });
        opts.forEach(o => box.append(h('button', { class: 'opt', lang: 'en', onclick: (e) => {
          [...box.children].forEach((b, k) => { b.disabled = true; if (opts[k] === en) b.classList.add('right'); });
          if (o !== en) e.currentTarget.classList.add('wrong');
          reveal(o === en);
        } }, o)));
        body.append(h('div', { class: 'small muted' }, 'Выберите, что сказать'), box, fb, actions);
      }
    }
    async function finish(body) {
      const pct = tries ? Math.round(score / tries * 100) : 100;
      await mark(d.id, { read: true, role: pct });
      body.append(h('div', { class: 'card stack', style: { textAlign: 'center' } }, h('div', { style: { fontSize: '48px' } }, '🎭'), h('h1', null, 'Роль сыграна!'),
        h('p', null, 'Верно с первого раза: ' + score + ' из ' + tries + ' (' + pct + '%)'),
        h('p', { class: 'small muted' }, pct >= 80 ? 'Отлично! Попробуйте следующий диалог или уровень повыше.' : 'Попробуйте ещё раз завтра — во второй раз фразы вспоминаются легче.')),
        h('div', { class: 'stack' }, h('button', { class: 'btn primary big block', onclick: () => go('dialogs') }, 'К диалогам'), h('button', { class: 'btn block', onclick: () => go('drole-' + d.id) }, 'Сыграть ещё раз')));
    }
    step();
  };

  window.Dialogs = { voiceFor, sayAs, stop };
})();
