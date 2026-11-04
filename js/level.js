/* Мои слова — проверка уровня: 10 карточек «знаю / не знаю» из слов разной сложности → уровень 1–5
   и подсказка, с чего начать (наборы, книги, диалоги, грамматика). Можно пропустить и пройти заново из Настроек. */
(function () {
  'use strict';
  const C = window.Core;
  const { S, h, $, icon, toast, go, routes, screen, Speech, saveSettings } = window.App;

  // Уровни — те же, что у книг и диалогов
  const LEVELS = { 1: ['Совсем просто', 'A0'], 2: ['Легко', 'A1'], 3: ['Средне', 'A2'], 4: ['Сложнее', 'B1'], 5: ['Продвинутый', 'B1+'] };
  // Слова по сложности: из каждой группы берём по 2 случайных — при повторной проверке слова другие
  const POOL = {
    1: [['cat', 'кошка'], ['water', 'вода'], ['house', 'дом'], ['mother', 'мама'], ['sun', 'солнце'], ['book', 'книга'], ['red', 'красный'], ['eat', 'есть, кушать']],
    2: [['kitchen', 'кухня'], ['weather', 'погода'], ['tired', 'уставший'], ['cheap', 'дешёвый'], ['always', 'всегда'], ['ticket', 'билет'], ['busy', 'занятой'], ['early', 'рано']],
    3: [['borrow', 'брать взаймы'], ['journey', 'поездка, путешествие'], ['polite', 'вежливый'], ['improve', 'улучшать'], ['decide', 'решать'], ['healthy', 'здоровый'], ['neighbour', 'сосед'], ['worried', 'обеспокоенный']],
    4: [['reliable', 'надёжный'], ['achieve', 'достигать'], ['avoid', 'избегать'], ['opportunity', 'возможность'], ['generous', 'щедрый'], ['complain', 'жаловаться'], ['purpose', 'цель, назначение'], ['suggest', 'предлагать']],
    5: [['reluctant', 'неохотный'], ['thorough', 'тщательный'], ['consequence', 'последствие'], ['inevitable', 'неизбежный'], ['scarce', 'скудный, редкий'], ['versatile', 'разносторонний'], ['undermine', 'подрывать'], ['feasible', 'осуществимый']],
  };
  // Что начать на каждом уровне
  const START = {
    1: { sets: ['talk', 'family', 'home'], gram: 'be' },
    2: { sets: ['time', 'cafe', 'city'], gram: 'ps1' },
    3: { sets: ['irregular', 'work', 'feelings'], gram: 'past' },
    4: { sets: ['irregular', 'body', 'hobby'], gram: 'freq' },
    5: { sets: ['irregular', 'hobby'], gram: 'perf' },
  };

  // 0–2 «знаю» → 1, 3–4 → 2, 5–6 → 3, 7–8 → 4, 9–10 → 5
  const levelOf = (known) => Math.min(5, Math.max(1, Math.floor((known + 1) / 2)));
  function pick() {
    const out = [];
    [1, 2, 3, 4, 5].forEach(lv => C.shuffle(POOL[lv].slice()).slice(0, 2).forEach(([en, ru]) => out.push({ en, ru, lv })));
    return out; // от простого к сложному
  }
  const label = (n) => 'Уровень ' + n + ' из 5 · ' + LEVELS[n][0] + ' (' + LEVELS[n][1] + ')';

  let R = null; // текущая проверка: { cards, idx, known: [] }
  let last = null; // ответы последней проверки — для списка «проверьте себя»

  // ---------- Карточка на «Сегодня» ----------
  function todayCard() {
    const st = S.settings;
    if (st.level || st.levelSkip) return null;
    return h('div', { class: 'card stack', id: 'level-offer' },
      h('h3', null, '🎯 Узнать свой уровень?'),
      h('p', { class: 'small muted', style: { margin: 0 } }, '10 слов, около минуты. Отвечайте «знаю» или «не знаю» — а я подскажу, какие наборы, книги и диалоги начать.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', id: 'level-go', onclick: () => go('level') }, 'Пройти проверку'),
        h('button', { class: 'btn ghost', id: 'level-skip', onclick: async () => { st.levelSkip = true; await saveSettings(); toast('Проверку можно пройти в Настройках'); routes.today(); } }, 'Пропустить')));
  }

  // ---------- Карточка в Настройках ----------
  function prefsCard() {
    const st = S.settings;
    return h('div', { class: 'card stack', id: 'level-prefs' }, h('h2', null, 'Мой уровень'),
      st.level ? h('p', { style: { margin: 0 } }, h('b', null, label(st.level)),
        st.levelAt ? h('span', { class: 'small muted' }, ' · проверено ' + new Date(st.levelAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })) : null)
        : h('p', { class: 'small muted', style: { margin: 0 } }, 'Пока не определён. Проверка — 10 слов, около минуты.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn' + (st.level ? '' : ' primary'), id: 'level-again', onclick: () => go('level') }, st.level ? 'Пройти заново' : 'Пройти проверку'),
        st.level ? h('button', { class: 'btn soft', id: 'level-tips', onclick: () => go('levelres') }, 'С чего начать') : null));
  }

  // ---------- Проверка ----------
  routes.level = function () {
    if (!R || R.idx >= R.cards.length) R = { cards: pick(), idx: 0, known: [] };
    const c = R.cards[R.idx];
    const root = $('#app'); root.innerHTML = '';
    const answer = (k) => {
      if (!R || R.cards[R.idx] !== c) return;
      R.known.push(k); R.idx++;
      if (R.idx >= R.cards.length) finish(); else routes.level();
    };
    const sayBtn = Speech.supported && App.soundOn()
      ? h('button', { class: 'icon-btn', 'aria-label': 'Произнести', onclick: () => Speech.say(c.en) }, icon('speaker')) : null;
    root.append(h('div', { class: 'session' },
      h('div', { class: 'sbar' },
        h('button', { class: 'icon-btn', 'aria-label': 'Отменить проверку', onclick: () => { R = null; go(S.settings.level ? 'prefs' : 'today'); } }, icon('close')),
        h('div', { class: 'meter' }, h('i', { style: { width: Math.round(R.idx / R.cards.length * 100) + '%' } })),
        h('span', { class: 'small muted num', id: 'level-count' }, (R.idx + 1) + '/' + R.cards.length)),
      h('div', { class: 'sbody' },
        h('div', { class: 'task' }, 'Знаете это слово? Отвечайте честно — это не экзамен'),
        h('div', { class: 'prompt' }, h('div', { class: 'big', lang: 'en', id: 'level-word' }, c.en), sayBtn),
        h('div', { class: 'actions' },
          h('button', { class: 'btn primary big block', id: 'level-yes', onclick: () => answer(true) }, 'Знаю'),
          h('button', { class: 'btn big block', id: 'level-no', onclick: () => answer(false) }, 'Не знаю')),
        h('p', { class: 'tiny muted', style: { textAlign: 'center' } }, '«Знаю» — если можете сказать перевод. Слова будут всё сложнее.'))));
  };

  async function finish() {
    const known = R.known.filter(Boolean).length;
    last = R.cards.map((c, i) => Object.assign({ ok: R.known[i] }, c));
    R = null;
    S.settings.level = levelOf(known);
    S.settings.levelAt = Date.now();
    S.settings.levelSkip = false;
    await saveSettings();
    go('levelres');
  }

  // ---------- Результат и что начать ----------
  routes.levelres = function () {
    const n = S.settings.level;
    if (!n) return go('level');
    const main = screen({ title: 'Ваш уровень', back: 'today' });
    main.append(h('div', { class: 'card stack', id: 'level-result', style: { alignItems: 'center', textAlign: 'center' } },
      h('div', { style: { fontSize: '44px', lineHeight: 1 } }, ['🌱', '🌿', '🌳', '🏔️', '🚀'][n - 1]),
      h('h2', { id: 'level-n' }, label(n)),
      h('p', { class: 'small muted', style: { margin: 0 } }, 'Это ориентир, а не оценка. Материалы любого уровня открыты — берите то, что интересно.')));

    const plan = START[n];
    const sets = plan.sets.map(id => (window.ReadySets || []).find(s => s.id === id)).filter(Boolean);
    const near = (list) => {
      const by = d => Math.abs(d.lvl - n) * 2 + (d.lvl > n ? 1 : 0); // свой уровень, потом проще, потом сложнее
      return list.slice().sort((a, b) => by(a) - by(b)).slice(0, 2);
    };
    const books = near(window.BOOKS || []);
    const dialogs = near(window.DIALOGS || []);
    const gram = window.Grammar && Grammar.LESSONS ? Grammar.LESSONS.find(l => l.id === plan.gram) : null;
    const tile = (ic, title, sub, href, cls) => h('button', { class: 'tile wide ' + (cls || ''), onclick: () => go(href.slice(1)) }, h('span', { class: 'tile-ic' }, ic),
      h('span', { class: 'tile-t grow' }, h('b', null, title), sub ? h('small', null, sub) : null));
    const box = h('div', { class: 'stack', id: 'level-start' });
    box.append(h('h3', null, 'С чего начать'));
    if (sets.length) {
      box.append(h('div', { class: 'section-title' }, n >= 4 ? 'Наборы слов — для повторения базы' : 'Готовые наборы слов'));
      sets.forEach(s => box.append(tile(s.icon, s.name, s.words.length + ' слов', '#set-' + s.id, 'lv-set')));
    }
    if (books.length) {
      box.append(h('div', { class: 'section-title' }, 'Книги'));
      books.forEach(b => box.append(tile(b.icon, b.title, b.ru + ' · уровень ' + b.lvl, '#book-' + b.id, 'lv-book')));
    }
    if (dialogs.length) {
      const T = window.DIALOG_TOPICS || {};
      box.append(h('div', { class: 'section-title' }, 'Диалоги'));
      dialogs.forEach(d => box.append(tile((T[d.topic] || ['💬'])[0], d.title, d.ru + ' · уровень ' + d.lvl, '#dialog-' + d.id, 'lv-dialog')));
    }
    if (gram) {
      box.append(h('div', { class: 'section-title' }, 'Грамматика'));
      box.append(tile(gram.icon || '📘', gram.title, gram.sub, '#gram-' + gram.id, 'lv-gram'));
    }
    main.append(box);

    if (last) main.append(h('div', { class: 'card stack', id: 'level-words' }, h('h3', null, 'Проверьте себя'),
      h('p', { class: 'small muted', style: { margin: 0 } }, 'Переводы слов из проверки. Если «знаю» оказалось не тем — пройдите проверку ещё раз.'),
      h('div', { class: 'stack', style: { gap: '4px' } }, last.map(c => h('div', { class: 'row nowrap', style: { justifyContent: 'space-between', gap: '8px' } },
        h('span', null, h('b', { lang: 'en' }, c.en), ' — ', c.ru),
        h('span', { class: 'pill ' + (c.ok ? 'solid' : '') }, c.ok ? 'знаю' : 'не знаю'))))));
    main.append(h('div', { class: 'stack' },
      h('button', { class: 'btn block', id: 'level-retry', onclick: () => { R = null; go('level'); } }, 'Пройти заново'),
      h('a', { class: 'btn ghost block', href: '#today' }, 'На «Сегодня»')));
  };

  window.Level = { todayCard, prefsCard, levelOf, LEVELS };
})();
