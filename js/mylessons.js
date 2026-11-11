/* Мои слова — «Мои занятия»: разбор занятий с преподавателем.
   Пакет занятий (packs/<имя>.json) подключается ссылкой #myimport-<имя> и хранится только на этом устройстве (kv 'myLessons').
   У каждого занятия: темы (ссылки на уроки грамматики), короткое правило, мои ошибки (✗ → ✓, почему),
   задания на правило и ошибки (тот же тренажёр, что в грамматике) и слова/фразы → отдельный набор в словаре. */
(function () {
  'use strict';
  const C = window.Core;
  const { S, h, toast, go, routes, screen, wordsArr, kvSet, kvGet, newWord, saveWords, ensureSet } = window.App;

  async function load() { try { return (await kvGet('myLessons')) || null; } catch (e) { return null; } }
  async function save(d) { await kvSet('myLessons', d); }
  const fmtDate = (d) => { try { return new Date(d + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }); } catch (e) { return d; } };
  const setNameOf = (l) => 'Занятие ' + fmtDate(l.date) + ': ' + l.title;
  const gramL = (id) => window.Grammar && Grammar.LESSONS.find(x => x.id === id);
  const keyOf = (en) => C.keyEn(en);

  // Слить пакет: занятия с тем же id заменяются новой версией, свои отметки (seen) сохраняются
  function merge(old, pack) {
    const out = { title: pack.title || (old && old.title) || 'Мои занятия', updated: Date.now(), lessons: [] };
    const byId = new Map(((old && old.lessons) || []).map(l => [l.id, l]));
    (pack.lessons || []).forEach(l => { const prev = byId.get(l.id); byId.set(l.id, Object.assign({}, l, { seen: prev ? prev.seen : false })); });
    out.lessons = [...byId.values()].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return out;
  }
  // Подключение по ссылке: #myimport-<имя пакета>
  routes.myimport = async function (name) {
    const main = screen({ title: 'Мои занятия', back: 'today' });
    main.append(h('p', { class: 'muted' }, 'Загружаю занятия…'));
    if (!/^[\w-]{3,80}$/.test(name || '')) { main.innerHTML = ''; main.append(h('p', null, 'Ссылка на занятия неверная.')); return; }
    try {
      const r = await fetch('packs/' + name + '.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      const pack = await r.json();
      const d = merge(await load(), pack); d.source = name; await save(d);
      toast('Занятия загружены: ' + d.lessons.length);
      history.replaceState(null, '', '#mylessons'); go('mylessons');
    } catch (e) {
      main.innerHTML = ''; main.append(h('div', { class: 'card stack' }, h('h2', null, 'Не получилось загрузить'), h('p', { class: 'small muted' }, 'Проверьте интернет и откройте ссылку ещё раз.')));
    }
  };

  function lessonState(l) {
    const have = new Set(wordsArr().map(w => keyOf(w.en)));
    const words = (l.words || []);
    const added = words.filter(w => have.has(keyOf(w[0]))).length;
    const p = window.Grammar ? (Grammar.progress || {})['my-' + l.id] : null;
    return { words: words.length, added, best: p ? p.best : null };
  }

  routes.mylessons = async function () {
    const main = screen({ title: 'Мои занятия', back: 'train' });
    const d = await load();
    if (!d || !d.lessons || !d.lessons.length) {
      main.append(h('div', { class: 'card empty' }, h('div', { class: 'glyph' }, '🎓'), h('h2', null, 'Пока пусто'),
        h('p', { class: 'muted' }, 'Сюда попадают разборы ваших занятий с преподавателем: темы, правила, ошибки и слова. Пришлите Claude ссылку на доску занятий — он подготовит ссылку для загрузки.')));
      return;
    }
    if (window.Grammar) await Grammar.loadProgress();
    // Все темы, которые проходили: быстрый вход в правила
    const topicIds = [...new Set(d.lessons.flatMap(l => l.topics || []))].filter(gramL);
    if (topicIds.length) {
      main.append(h('div', { class: 'section-title' }, 'Темы, которые мы проходим'));
      main.append(h('div', { class: 'row topic-chips', style: { gap: '6px' } }, topicIds.map(id => topicChip(id))));
    }
    main.append(h('div', { class: 'section-title' }, 'Занятия'));
    d.lessons.forEach(l => {
      const st = lessonState(l);
      main.append(h('button', { class: 'card my-lesson', 'data-id': l.id, onclick: () => go('mylesson-' + l.id) },
        h('div', { class: 'row', style: { justifyContent: 'space-between', alignItems: 'baseline' } },
          h('span', { class: 'pill new' }, fmtDate(l.date) + (l.kind ? ' · ' + l.kind : '')), !l.seen ? h('span', { class: 'pill due' }, 'новое') : null),
        h('h3', { style: { margin: '6px 0 2px' } }, l.title),
        l.sub ? h('div', { class: 'small muted' }, l.sub) : null,
        h('div', { class: 'row', style: { gap: '6px', marginTop: '8px' } }, (l.topics || []).filter(gramL).map(id => h('span', { class: 'chip sm' }, gramL(id).title))),
        h('div', { class: 'tiny muted', style: { marginTop: '8px' } },
          (st.words ? 'слов и фраз ' + st.words + (st.added ? ' (в словаре ' + st.added + ')' : '') : '') +
          ((l.mistakes || []).length ? ' · ошибок ' + l.mistakes.length : '') +
          (st.best != null ? ' · тренировка ' + st.best + '%' : ''))));
    });
  };

  function topicChip(id) {
    const g = gramL(id); if (!g) return null;
    const st = window.Grammar ? Grammar.stateOf(id, Date.now()) : 'new';
    const mark = st === 'done' ? ' ✓' : st === 'due' ? ' ↻' : '';
    return h('a', { class: 'chip topic-chip ' + st, href: '#gram-' + id, 'data-topic': id }, (g.icon ? g.icon + ' ' : '') + g.title + mark);
  }

  routes.mylesson = async function (id) {
    const d = await load(); const l = d && d.lessons.find(x => x.id === id);
    if (!l) return go('mylessons');
    if (!l.seen) { l.seen = true; save(d); }
    if (window.Grammar) await Grammar.loadProgress();
    const main = screen({ title: l.title, back: 'mylessons' });
    main.append(h('p', { class: 'muted', style: { margin: 0 } }, fmtDate(l.date) + (l.kind ? ' · ' + l.kind : '') + (l.sub ? ' · ' + l.sub : '')));

    // 1) Темы занятия — подсвечены, ведут в правило и практику
    const topics = (l.topics || []).filter(gramL);
    if (topics.length) main.append(h('div', { class: 'card stack my-topics' }, h('h2', null, '📌 Темы занятия'),
      h('p', { class: 'small muted', style: { margin: 0 } }, 'Нажмите тему — откроется правило и практика. ✓ — пройдена, ↻ — пора повторить.'),
      h('div', { class: 'row', style: { gap: '6px' } }, topics.map(topicChip))));

    // 2) Правило коротко + мои ошибки + тренировка
    const custom = { id: 'my-' + l.id, custom: true, back: 'mylesson-' + l.id, title: 'Занятие: ' + l.title, theory: l.rules || [], mistakes: l.mistakes || [], items: l.items || [] };
    if (window.Grammar && custom.items.length) main.append(h('button', { class: 'btn primary big block', id: 'my-train', onclick: () => Grammar.practice(custom, false) },
      'Тренировать правило и ошибки · ' + custom.items.length + ' ' + C.plural(custom.items.length, 'задание', 'задания', 'заданий')));
    if (window.Grammar) Grammar.theoryCards(custom).forEach(c => main.append(c));

    // 3) Слова и фразы занятия → отдельный набор
    const words = l.words || [];
    if (words.length) {
      const have = new Map(wordsArr().map(w => [keyOf(w.en), w]));
      const missing = words.filter(w => !have.has(keyOf(w[0])));
      const setName = setNameOf(l);
      const card = h('div', { class: 'card stack' }, h('h2', null, '🗂 Слова и фразы занятия · ' + words.length));
      const act = h('button', { class: 'btn primary big block', id: 'my-words', onclick: async () => {
        act.disabled = true;
        const setId = await ensureSet(setName);
        const list = missing.map(([en, ru, ex, exRu]) => newWord({ en, ru, example: ex || '', exampleRu: exRu || '', setIds: [setId], source: setName }));
        const old = words.map(w => have.get(keyOf(w[0]))).filter(w => w && !w.setIds.includes(setId));
        old.forEach(w => w.setIds.push(setId));
        await saveWords(list.concat(old));
        if (list.length) toast('Добавлено в словарь: ' + list.length);
        Train.startSet(setId);
      } }, missing.length ? 'Добавить в словарь и учить · ' + missing.length : 'Учить слова занятия');
      card.append(act, h('div', { class: 'wlist my-words' }, words.map(([en, ru]) => h('div', { class: 'my-word' + (have.has(keyOf(en)) ? ' known' : '') },
        h('button', { class: 'btn ghost sm', 'aria-label': 'Послушать', onclick: () => App.Speech && App.Speech.say(en) }, '🔊'),
        h('div', { class: 'grow' }, h('b', { lang: 'en' }, en), h('div', { class: 'small muted' }, ru)),
        have.has(keyOf(en)) ? h('span', { class: 'tiny muted' }, 'в словаре') : null))));
      main.append(card);
    }
  };

  // Вход: карточка над плитками «Тренировок» и баннер на «Сегодня», только если занятия загружены
  async function entryCard() {
    const d = await load(); if (!d || !d.lessons || !d.lessons.length) return null;
    const fresh = d.lessons.filter(l => !l.seen).length;
    return h('button', { class: 'tile wide my-entry', id: 'my-entry', onclick: () => go('mylessons') },
      h('span', { class: 'tile-ic' }, '🎓'),
      h('span', { class: 'tile-t' }, h('b', null, 'Мои занятия'), h('small', null, d.lessons.length + ' ' + C.plural(d.lessons.length, 'занятие', 'занятия', 'занятий') + (fresh ? ' · новых ' + fresh : '') + ' · темы, ошибки, слова')));
  }
  const origTrain = routes.train;
  routes.train = async function () {
    await origTrain.apply(this, arguments);
    const e = await entryCard(); const main = document.querySelector('main');
    if (e && main) { const grid = main.querySelector('.tiles-grid'); if (grid) grid.before(e); else main.append(e); }
  };
  const origToday = routes.today;
  routes.today = async function () {
    await origToday.apply(this, arguments);
    const d = await load(); if (!d || !d.lessons) return;
    const fresh = d.lessons.filter(l => !l.seen);
    const main = document.querySelector('main'); if (!main || !fresh.length) return;
    const hero = main.querySelector('.hero'), anchor = hero || main.querySelector('.card');
    const ins = (el) => hero ? hero.after(el) : anchor ? anchor.before(el) : main.append(el);
    ins(h('div', { class: 'banner', id: 'my-banner' }, h('div', { class: 'grow' },
      h('b', null, '🎓 Разбор занятия: «' + fresh[0].title + '»'),
      h('span', null, 'Темы, ваши ошибки и слова с занятия' + (fresh.length > 1 ? ' · ещё новых: ' + (fresh.length - 1) : '') + '.'),
      h('div', { class: 'row' }, h('button', { class: 'btn sm primary', onclick: () => go('mylesson-' + fresh[0].id) }, 'Открыть')))));
  };

  // Код занятий вручную: Настройки → «Мои занятия» (на случай, если ссылка открылась не в том приложении)
  const origPrefs = routes.prefs;
  routes.prefs = async function () {
    await origPrefs.apply(this, arguments);
    const main = document.querySelector('main'); if (!main) return;
    const inp = h('input', { class: 'input', id: 'my-code', placeholder: 'Код занятий, например jane-a1-xxxx', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false' });
    const d = await load();
    const card = h('div', { class: 'card stack', id: 'my-prefs' }, h('h2', null, '🎓 Мои занятия'),
      h('p', { class: 'small muted' }, 'Разборы занятий с преподавателем: темы, правила, ваши ошибки и слова. Вставьте код, который прислал Claude.' + (d && d.lessons ? ' Сейчас загружено занятий: ' + d.lessons.length + '.' : '')),
      h('form', { class: 'row nowrap', onsubmit: e => { e.preventDefault(); const v = inp.value.trim().replace(/^.*myimport[-_]/, ''); if (v) go('myimport-' + v); } }, h('div', { class: 'grow' }, inp), h('button', { class: 'btn', type: 'submit' }, 'Загрузить')),
      d && d.lessons ? h('a', { class: 'btn soft block', href: '#mylessons' }, 'Открыть мои занятия') : null);
    const first = main.querySelector('.card'); if (first) first.after(card); else main.append(card);
  };
  // Запуск из Telegram со ссылкой t.me/<бот>?startapp=myimport_<код>
  try {
    const sp = window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.start_param;
    if (sp && /^myimport_[\w-]+$/.test(sp) && !sessionStorage.getItem('slova-sp')) { sessionStorage.setItem('slova-sp', '1'); setTimeout(() => go('myimport-' + sp.slice(9)), 300); }
  } catch (e) { /* не в Telegram */ }

  window.MyLessons = { load, merge };
})();
