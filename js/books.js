/* Мои слова — книжная полка: книги по уровням, свои тексты, интерактивный текст
   (нажали на слово — перевод, озвучка, в словарь), чтение вслух с подсветкой, вопросы после главы. */
(function () {
  'use strict';
  const C = window.Core;
  const { S, h, icon, toast, dialog, sheet, go, routes, screen, Speech, saveWord, newWord, wordsArr, ensureSet, kvGet, kvSet } = window.App;

  const LEVELS = { 1: 'Совсем просто', 2: 'Легко', 3: 'Средне', 4: 'Сложнее', 5: 'Продвинутый' };
  const G = (window.BOOK_GLOSS || {}).G || {}, F = (window.BOOK_GLOSS || {}).F || {};
  let readySet = null; // en → ru из готовых наборов
  const sayP = (t, o) => window.Extra ? Extra.sayP(t, o) : Promise.resolve(true);
  const stopSpeech = () => { if (window.Extra && Extra.stopSpeech) Extra.stopSpeech(); else try { speechSynthesis.cancel(); } catch (e) { /* нет */ } };

  // ---------- Данные ----------
  async function myBooks() { return (await kvGet('mybooks')) || []; }
  async function progress() { return (await kvGet('bookProgress')) || {}; }
  async function setProgress(id, ch) {
    const p = await progress(); const r = p[id] || { done: [] };
    if (!r.done.includes(ch)) r.done.push(ch); r.last = Date.now(); p[id] = r; await kvSet('bookProgress', p);
  }
  function splitParas(text) {
    const parts = String(text || '').replace(/\r/g, '').split(/\n\s*\n/).map(s => s.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
    return parts.length > 1 ? parts : String(text || '').split('\n').map(s => s.trim()).filter(Boolean);
  }
  async function getBook(id) {
    const b = (window.BOOKS || []).find(x => x.id === id);
    if (b) return b;
    const m = (await myBooks()).find(x => x.id === id);
    if (!m) return null;
    return { id: m.id, mine: true, icon: '📄', title: m.title, ru: 'Свой текст', chapters: [{ title: m.title, p: splitParas(m.text).map(t => [t, null]), q: [] }] };
  }

  // ---------- Поиск перевода слова ----------
  function stems(f) {
    const out = [f];
    const add = (x) => { if (x && x.length > 1 && !out.includes(x)) out.push(x); };
    if (/ies$/.test(f)) add(f.slice(0, -3) + 'y');
    if (/es$/.test(f)) add(f.slice(0, -2));
    if (/s$/.test(f)) add(f.slice(0, -1));
    if (/ied$/.test(f)) add(f.slice(0, -3) + 'y');
    if (/ed$/.test(f)) { add(f.slice(0, -2)); add(f.slice(0, -1)); if (/(.)\1ed$/.test(f)) add(f.slice(0, -3)); }
    if (/ing$/.test(f)) { add(f.slice(0, -3)); add(f.slice(0, -3) + 'e'); if (/(.)\1ing$/.test(f)) add(f.slice(0, -4)); }
    if (/er$/.test(f)) { add(f.slice(0, -2)); add(f.slice(0, -1)); }
    if (/est$/.test(f)) { add(f.slice(0, -3)); add(f.slice(0, -2)); }
    if (/ly$/.test(f)) add(f.slice(0, -2));
    return out;
  }
  function userWord(lemma) { const k = C.keyEn(lemma); return wordsArr().find(w => !w.archived && C.keyEn(w.en) === k) || null; }
  function lookup(raw) {
    const f = raw.toLowerCase().replace(/[’]/g, "'").replace(/'s$/, '');
    const base = F[f] || f;
    // 1) уже в словаре
    for (const s of [base].concat(stems(f))) { const w = userWord(s); if (w) return { lemma: w.en, ru: w.ru, word: w, form: raw }; }
    // 2) словарик книг
    if (G[base]) return { lemma: base, ru: G[base], form: raw };
    // 3) готовые наборы
    if (!readySet) { readySet = {}; (window.ReadySets || []).forEach(rs => rs.words.forEach(w => { readySet[w.en.toLowerCase()] = w.ru; })); }
    for (const s of stems(f)) { if (G[s]) return { lemma: s, ru: G[s], form: raw }; if (readySet[s]) return { lemma: s, ru: readySet[s], form: raw }; }
    // 4) неправильные глаголы: went → go
    if (C.irregularAll) { const v = C.irregularAll().find(x => [x.v2, x.v3].some(z => String(z).split('/').map(t => t.trim()).includes(f))); if (v) return { lemma: v.v1, ru: G[v.v1] || readySet[v.v1] || v.ru || '', form: raw }; }
    return { lemma: base, ru: '', form: raw };
  }
  async function onlineTranslate(text) {
    const cache = (await kvGet('tcache')) || {};
    if (cache[text]) return cache[text];
    if (!navigator.onLine) throw new Error('нет интернета');
    const r = await Add.Svc.translate(text, 'en', 'ru');
    cache[text] = r.main; await kvSet('tcache', cache);
    return r.main;
  }
  async function translateParagraph(p) {
    const parts = p.match(/[^.!?]+[.!?'"’”]*\s*/g) || [p];
    const out = [];
    for (const s of parts) { const t = s.trim(); if (t) out.push(await onlineTranslate(t.slice(0, 480))); }
    return out.join(' ');
  }

  // ---------- Полка ----------
  routes.books = async function () {
    stopSpeech();
    const main = screen({ title: 'Книжная полка', back: 'train' });
    const prog = await progress();
    const mine = await myBooks();
    main.append(h('p', { class: 'muted small' }, 'Сказки, басни и классика по уровням. Нажмите на любое слово — перевод, озвучка и «в словарь». Можно слушать текст целиком.'));
    const books = window.BOOKS || [];
    Object.keys(LEVELS).forEach(lv => {
      const list = books.filter(b => String(b.lvl) === lv);
      if (!list.length) return;
      main.append(h('div', { class: 'section-title' }, 'Уровень ' + lv + ' · ' + LEVELS[lv]));
      list.forEach(b => main.append(bookTile(b, prog[b.id])));
    });
    main.append(h('div', { class: 'section-title' }, 'Свои тексты'));
    mine.forEach(m => main.append(bookTile({ id: m.id, icon: '📄', title: m.title, ru: 'свой текст', words: String(m.text).split(/\s+/).length, chapters: [1] }, prog[m.id])));
    main.append(h('button', { class: 'btn block', id: 'mybook-add', onclick: addMyBook }, icon('plus'), 'Добавить свой текст'));
    main.append(h('p', { class: 'tiny muted' }, 'Оригиналы — общественное достояние (Project Gutenberg). Пересказы и переводы сделаны для «Моих слов».'));
  };
  function bookTile(b, p) {
    const n = b.chapters.length, done = p ? p.done.length : 0;
    const pill = done >= n ? h('span', { class: 'pill solid' }, '✓ прочитано') : done ? h('span', { class: 'pill learning' }, done + ' из ' + n) : null;
    return h('button', { class: 'tile wide', onclick: () => go('book-' + b.id) },
      h('span', { class: 'tile-ic' }, b.icon), h('span', { class: 'tile-t grow' }, h('b', { lang: 'en' }, b.title), h('small', null, b.ru + ' · ' + b.words + ' ' + C.plural(b.words, 'слово', 'слова', 'слов'))), pill);
  }
  function addMyBook() {
    const title = h('input', { class: 'input', id: 'mb-title', placeholder: 'Название' });
    const text = h('textarea', { class: 'input', id: 'mb-text', rows: 8, placeholder: 'Вставьте текст на английском: статью, главу книги, переписку…', spellcheck: 'false' });
    const s = sheet('Свой текст', h('div', { class: 'stack' },
      h('label', { class: 'field', for: 'mb-title' }, 'Название', title), h('label', { class: 'field', for: 'mb-text' }, 'Текст', text),
      h('p', { class: 'tiny muted' }, 'Текст хранится только у вас. Слова из нашего словарика переводятся сразу, остальные — онлайн по нажатию.'),
      h('button', { class: 'btn primary block', id: 'mb-save', onclick: async () => {
        const t = text.value.trim(); if (t.split(/\s+/).length < 3) return toast('Вставьте текст подлиннее');
        const list = await myBooks(); const id = 'my' + C.uid();
        list.unshift({ id, title: C.clean(title.value) || t.split(/\s+/).slice(0, 4).join(' ') + '…', text: t.slice(0, 60000), created: Date.now() });
        await kvSet('mybooks', list); s.close(); go('read-' + id + '-0');
      } }, 'Открыть для чтения')));
    setTimeout(() => text.focus(), 50);
  }

  // ---------- Книга: главы ----------
  routes.book = async function (id) {
    const b = await getBook(id); if (!b) return go('books');
    if (b.chapters.length === 1) { location.replace('#read-' + id + '-0'); return; }
    const main = screen({ title: b.title, back: 'books' });
    const p = (await progress())[id] || { done: [] };
    main.append(h('div', { class: 'card stack' }, h('div', { style: { fontSize: '44px' } }, b.icon), h('h2', { lang: 'en' }, b.title), h('p', { class: 'muted' }, b.ru), h('p', { class: 'tiny muted' }, b.author)));
    b.chapters.forEach((ch, i) => main.append(h('button', { class: 'tile wide', onclick: () => go('read-' + id + '-' + i) },
      h('span', { class: 'tile-ic' }, String(i + 1)), h('span', { class: 'tile-t grow' }, h('b', { lang: 'en' }, ch.title), h('small', null, ch.p.reduce((n, x) => n + x[0].split(' ').length, 0) + ' слов')),
      p.done.includes(i) ? h('span', { class: 'pill solid' }, '✓') : null)));
  };

  // ---------- Чтение ----------
  routes.read = async function (arg) {
    stopSpeech();
    const m = /^(.+)-(\d+)$/.exec(arg || ''); if (!m) return go('books');
    const b = await getBook(m[1]); const ci = +m[2];
    if (!b || !b.chapters[ci]) return go('books');
    const ch = b.chapters[ci];
    const showTr = () => S.ui.bookTr === true;
    const main = screen({ title: b.chapters.length > 1 ? 'Глава ' + (ci + 1) : b.title, back: b.chapters.length > 1 ? 'book-' + b.id : 'books' });
    const known = new Set(wordsArr().filter(w => !w.archived).map(w => C.keyEn(w.en)));
    const text = h('div', { class: 'reader', lang: 'en' });
    const paras = ch.p.map(([en, ru], i) => {
      const body = h('p', { class: 'rp-text' });
      en.split(/([A-Za-z]+(?:['’][A-Za-z]+)?)/).forEach((part, k) => {
        if (k % 2 === 1) {
          const lk = lookup(part); const isKnown = known.has(C.keyEn(lk.lemma));
          body.append(h('span', { class: 'rw' + (isKnown ? ' known' : ''), 'data-w': part }, part));
        } else if (part) body.append(document.createTextNode(part));
      });
      const tr = h('div', { class: 'rp-tr', lang: 'ru', hidden: !(showTr() && ru) }, ru || '');
      const trBtn = h('button', { class: 'btn ghost sm', onclick: async () => {
        if (!tr.hidden && tr.textContent) { tr.hidden = true; return; }
        if (!tr.textContent) {
          trBtn.disabled = true; trBtn.textContent = 'Перевожу…';
          try { tr.textContent = await translateParagraph(en); } catch (e) { toast('Перевод недоступен: ' + e.message); }
          trBtn.disabled = false; trBtn.textContent = 'Перевод';
        }
        tr.hidden = !tr.textContent;
      } }, 'Перевод');
      const el = h('div', { class: 'rp', 'data-i': i }, body, tr, h('div', { class: 'rp-tools' },
        h('button', { class: 'btn ghost sm', 'aria-label': 'Прослушать абзац', onclick: () => readFrom(i, true) }, icon('speaker')), trBtn));
      el._en = en; return el;
    });
    paras.forEach(p => text.append(p));
    text.addEventListener('click', e => { const t = e.target.closest('.rw'); if (t) wordSheet(t, b); });

    // Панель: слушать всё, медленно, перевод
    let playing = false;
    const playBtn = h('button', { class: 'btn primary', id: 'read-play', onclick: () => playing ? stop() : readFrom(0, false) }, icon('speaker'), 'Слушать всё');
    const slowSw = h('label', { class: 'chip' }, h('input', { type: 'checkbox', checked: !!S.ui.bookSlow, onchange: e => { S.ui.bookSlow = e.target.checked; }, style: { marginRight: '6px' } }), 'медленно');
    const hasRu = ch.p.some(x => x[1]);
    const trSw = hasRu ? h('label', { class: 'chip' }, h('input', { type: 'checkbox', checked: showTr(), style: { marginRight: '6px' }, onchange: e => { S.ui.bookTr = e.target.checked; paras.forEach((p, i) => { const tr = p.querySelector('.rp-tr'); if (ch.p[i][1]) tr.hidden = !e.target.checked; }); } }), 'перевод под абзацем') : null;
    function stop() { playing = false; stopSpeech(); paras.forEach(p => p.classList.remove('reading')); playBtn.lastChild.textContent = 'Слушать всё'; }
    async function readFrom(i, single) {
      stopSpeech(); playing = true; playBtn.lastChild.textContent = 'Стоп';
      for (let k = i; k < paras.length && playing; k++) {
        paras.forEach(p => p.classList.remove('reading')); paras[k].classList.add('reading');
        paras[k].scrollIntoView({ block: 'center', behavior: 'smooth' });
        const sentences = paras[k]._en.match(/[^.!?]+[.!?'"’”]*\s*/g) || [paras[k]._en];
        for (const s of sentences) { if (!playing) break; const ok = await sayP(s.trim(), { slow: !!S.ui.bookSlow }); if (ok === false) { playing = false; break; } }
        if (single) break;
      }
      if (playing) stop(); else paras.forEach(p => p.classList.remove('reading'));
    }

    main.append(h('div', { class: 'card stack' },
      h('div', { class: 'row', style: { justifyContent: 'space-between', alignItems: 'baseline' } }, h('h2', { lang: 'en' }, ch.title), b.lvl ? h('span', { class: 'pill' }, 'уровень ' + b.lvl) : null),
      h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '8px' } }, playBtn, slowSw, trSw),
      h('p', { class: 'tiny muted' }, 'Нажмите на слово — перевод и «в словарь». Подчёркнутые слова уже есть в вашем словаре.')),
      h('div', { class: 'card' }, text));

    // Вопросы и завершение
    const end = h('div', { class: 'card stack' });
    main.append(end);
    if (ch.q && ch.q.length) {
      end.append(h('h2', null, 'Проверьте себя'));
      ch.q.forEach(([q, opts, a]) => {
        const order = C.shuffle(opts.map((o, i) => i));
        const box = h('div', { class: 'options' });
        const fb = h('div', { class: 'small' });
        order.forEach(i => box.append(h('button', { class: 'opt', onclick: (e) => {
          [...box.children].forEach((btn, k) => { btn.disabled = true; if (order[k] === a) btn.classList.add('right'); });
          if (i !== a) e.currentTarget.classList.add('wrong');
          fb.textContent = i === a ? 'Верно!' : 'Правильный ответ отмечен зелёным.';
        } }, opts[i])));
        end.append(h('div', { class: 'stack', style: { gap: '8px' } }, h('b', null, q), box, fb));
      });
    }
    const next = ci + 1 < b.chapters.length;
    end.append(h('button', { class: 'btn primary big block', id: 'read-done', onclick: async () => {
      stop(); await setProgress(b.id, ci); toast(next ? 'Глава прочитана' : 'Книга прочитана! 🎉');
      go(next ? 'read-' + b.id + '-' + (ci + 1) : 'books');
    } }, next ? 'Следующая глава' : 'Готово — прочитано'));
    if (b.mine) end.append(h('button', { class: 'btn ghost block', onclick: async () => {
      if (!await dialog({ title: 'Удалить текст?', text: 'Слова, добавленные в словарь, останутся.', ok: 'Удалить', cancel: 'Отмена' })) return;
      await kvSet('mybooks', (await myBooks()).filter(x => x.id !== b.id)); go('books');
    } }, 'Удалить этот текст'));
  };

  // ---------- Слово: перевод и «в словарь» ----------
  function sentenceOf(span) {
    const p = span.closest('.rp'); const en = p ? p._en : '';
    const all = [...p.querySelectorAll('.rp-text')[0].childNodes];
    let pos = 0; for (const node of all) { if (node === span) break; pos += node.textContent.length; }
    const start = Math.max(en.lastIndexOf('.', pos), en.lastIndexOf('!', pos), en.lastIndexOf('?', pos)) + 1;
    const m = /[.!?]/.exec(en.slice(pos)); const endI = m ? pos + m.index + 1 : en.length;
    return en.slice(start, endI).replace(/^['"’”\s]+/, '').trim().slice(0, 220);
  }
  async function wordSheet(span, book) {
    document.querySelectorAll('.rw.sel').forEach(x => x.classList.remove('sel'));
    span.classList.add('sel');
    const raw = span.dataset.w; const r = lookup(raw);
    const sentence = sentenceOf(span);
    Speech.say(r.lemma);
    const ruBox = h('div', { class: 'big', style: { fontSize: '22px' } }, r.ru || '—');
    const actions = h('div', { class: 'stack' });
    const body = h('div', { class: 'stack' },
      h('div', { class: 'row', style: { alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' } }, h('b', { lang: 'en', style: { fontSize: '26px' } }, r.lemma),
        raw.toLowerCase() !== r.lemma.toLowerCase() ? h('span', { class: 'small muted', lang: 'en' }, 'в тексте: ' + raw) : null),
      ruBox,
      h('div', { class: 'row' }, h('button', { class: 'btn sm soft', onclick: () => Speech.say(r.lemma) }, icon('speaker'), 'Слушать'), h('button', { class: 'btn sm soft', onclick: () => Speech.say(r.lemma, true) }, icon('slow'), 'Медленно')),
      sentence ? h('div', { class: 'example small', lang: 'en' }, sentence) : null, actions);
    const s = sheet('Слово', body);
    s.el.addEventListener('click', e => { if (e.target === s.el) span.classList.remove('sel'); });
    const draw = () => {
      actions.innerHTML = '';
      const w = userWord(r.lemma);
      if (w) {
        actions.append(h('p', { class: 'small' }, '✓ Уже в вашем словаре'), h('button', { class: 'btn block', onclick: () => { s.close(); go('word-' + w.id); } }, 'Открыть карточку'));
        return;
      }
      if (!r.ru) actions.append(h('button', { class: 'btn block', id: 'w-online', onclick: async (e) => {
        e.currentTarget.disabled = true; e.currentTarget.textContent = 'Перевожу…';
        try { r.ru = await onlineTranslate(r.lemma); ruBox.textContent = r.ru; } catch (err) { toast('Перевод недоступен: ' + err.message); }
        draw();
      } }, 'Перевести онлайн'));
      actions.append(h('button', { class: 'btn primary block', id: 'w-add', disabled: !r.ru, onclick: async () => {
        const setId = await ensureSet('Из книг');
        const ru = String(r.ru).split(/[;(]/)[0].trim();
        const nw = newWord({ en: r.lemma, ru, example: sentence, source: 'Книга «' + book.title + '»', setIds: [setId] });
        await saveWord(nw);
        if (window.Pics) Pics.enqueue([nw.id]);
        document.querySelectorAll('.rw').forEach(x => { if (C.keyEn(lookup(x.dataset.w).lemma) === C.keyEn(r.lemma)) x.classList.add('known'); });
        toast('Добавлено в словарь: ' + r.lemma + ' — ' + ru); s.close();
      } }, 'В словарь'));
    };
    draw();
  }

  window.Books = { lookup, stems };
})();
