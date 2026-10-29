/* Мои слова — готовые наборы, режим «Слушать», тренажёры «Числа» и «Алфавит», экран тренировок плитками. */
(function () {
  'use strict';
  const C = window.Core;
  const { S, h, $, icon, toast, dialog, go, routes, screen, Speech, saveWords, wordsArr, newWord, ensureSet } = window.App;

  // ---------- Озвучка с ожиданием окончания (для «Слушать» и тренажёров) ----------
  let ruVoice = null;
  function pickRu() {
    if (!Speech.supported) return null;
    const vs = speechSynthesis.getVoices();
    return vs.find(v => /^ru(-|_|$)/i.test(v.lang) && v.localService) || vs.find(v => /^ru/i.test(v.lang)) || null;
  }
  let speakToken = 0;
  function sayP(text, opts) {
    opts = opts || {};
    return new Promise(resolve => {
      if (!text || !Speech.supported || !S.settings.sound) { setTimeout(resolve, opts.silentMs || 600); return; }
      const my = ++speakToken;
      try {
        const u = new SpeechSynthesisUtterance(String(text));
        if (opts.lang === 'ru') { ruVoice = ruVoice || pickRu(); if (ruVoice) u.voice = ruVoice; u.lang = 'ru-RU'; u.rate = 1; }
        else { const v = Speech.voice(); if (v) u.voice = v; u.lang = v ? v.lang : 'en-US'; u.rate = opts.slow ? S.settings.slowRate : S.settings.rate; }
        let done = false; const fin = () => { if (done) return; done = true; resolve(my === speakToken); };
        u.onend = fin; u.onerror = fin;
        // страховка: некоторые браузеры не присылают onend
        setTimeout(fin, 1500 + String(text).length * 140 / (u.rate || 1));
        speechSynthesis.speak(u);
      } catch (e) { resolve(true); }
    });
  }
  function stopSpeech() { speakToken++; try { speechSynthesis.cancel(); } catch (e) { /* нет озвучки */ } }
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // ---------- Готовые наборы ----------
  function inDict(en) { const k = C.keyEn(en); return wordsArr().some(w => C.keyEn(w.en) === k); }
  function setsList(container) {
    let lastGroup = null;
    (window.ReadySets || []).forEach(rs => {
      if (rs.group !== lastGroup) { lastGroup = rs.group; container.append(h('div', { class: 'section-title', style: { margin: '8px 2px 0' } }, (window.ReadyGroups || {})[rs.group] || '')); }
      const have = rs.words.filter(w => inDict(w.en)).length;
      container.append(h('button', { class: 'tile wide', onclick: () => go('set-' + rs.id) },
        h('span', { class: 'tile-ic' }, rs.icon),
        h('span', { class: 'tile-t' }, h('b', null, rs.name), h('small', null, rs.words.length + ' ' + C.plural(rs.words.length, 'слово', 'слова', 'слов') + (have ? ' · уже в словаре: ' + have : '')))));
    });
  }
  routes.sets = function () {
    const main = screen({ title: 'Готовые наборы', back: 'add' });
    main.append(h('p', { class: 'muted small' }, (window.ReadySets || []).length + ' тем, слова уровня A0–A1 с переводом, простым примером и озвучкой. Картинки подберутся сами. Выберите тему, отметьте нужные слова — и они появятся в вашем словаре.'));
    const grid = h('div', { class: 'tiles-grid one' });
    setsList(grid); main.append(grid);
  };
  routes.set = function (id) {
    const rs = (window.ReadySets || []).find(s => s.id === id);
    if (!rs) { go('sets'); return; }
    const main = screen({ title: rs.name, back: 'sets' });
    const picked = new Set(rs.words.filter(w => !inDict(w.en)).map(w => w.en));
    const list = h('div', { class: 'stack', style: { gap: '6px' } });
    const btn = h('button', { class: 'btn primary big block' });
    const bar = h('div', { class: 'savebar' }, btn);
    function draw() {
      list.innerHTML = '';
      rs.words.forEach(w => {
        const have = inDict(w.en);
        const cb = h('input', { type: 'checkbox', checked: picked.has(w.en), disabled: have, 'aria-label': 'Добавить ' + w.en, onchange: () => { cb.checked ? picked.add(w.en) : picked.delete(w.en); drawBtn(); } });
        list.append(h('label', { class: 'witem', style: { cursor: have ? 'default' : 'pointer' } },
          h('div', { class: 'thumb' }, w.emoji || ''),
          h('div', { class: 't' }, h('div', { class: 'en', lang: 'en' }, w.en), h('div', { class: 'ru' }, w.ru), h('div', { class: 'tiny muted', lang: 'en', style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, w.example)),
          h('div', { class: 'side' }, have ? h('span', { class: 'pill solid' }, 'уже есть') : cb,
            h('button', { class: 'icon-btn', style: { width: '40px', height: '40px' }, type: 'button', 'aria-label': 'Произнести ' + w.en, onclick: e => { e.preventDefault(); Speech.say(w.en); } }, icon('speaker')))));
      });
      drawBtn();
    }
    function drawBtn() {
      btn.textContent = picked.size ? 'Добавить в словарь: ' + picked.size : 'Все слова уже в словаре';
      btn.disabled = !picked.size;
    }
    btn.onclick = async () => {
      const setId = await ensureSet(rs.name);
      const now = Date.now();
      const list2 = rs.words.filter(w => picked.has(w.en) && !inDict(w.en)).map((w, i) => {
        const nw = newWord(Object.assign({}, w, { setIds: [setId], source: 'Готовый набор «' + rs.name + '»' }));
        nw.createdAt = now + i; return nw;
      });
      // слова этой темы, которые уже были в словаре, тоже попадают в набор (прогресс сохраняется)
      const keys = new Set(rs.words.map(w => C.keyEn(w.en)));
      const existing = wordsArr().filter(w => keys.has(C.keyEn(w.en)) && !w.setIds.includes(setId));
      existing.forEach(w => w.setIds.push(setId));
      await saveWords(list2.concat(existing));
      if (window.Pics) Pics.enqueue(list2.map(w => w.id));
      toast('Добавлено слов: ' + list2.length + '. Картинки подберутся в фоне');
      S.ui.dictSet = setId; S.ui.dictFilter = 'all'; go('dict');
    };
    main.append(h('div', { class: 'row' },
      h('button', { class: 'btn sm', onclick: () => { rs.words.forEach(w => { if (!inDict(w.en)) picked.add(w.en); }); draw(); } }, 'Выбрать все'),
      h('button', { class: 'btn sm', onclick: () => { picked.clear(); draw(); } }, 'Снять все'),
      h('button', { class: 'btn sm soft', onclick: () => Listen.start({ words: rs.words.map(w => Object.assign({ id: 'x' + w.en }, w)), title: rs.name }) }, icon('speaker'), 'Прослушать набор')),
      list, bar);
    draw();
  };

  // ---------- «Слушать»: слово → пауза → перевод → пример ----------
  const Listen = { state: null };
  routes.listen = function () {
    if (Listen.state && Listen.state.words) return renderPlayer();
    const main = screen({ title: 'Слушать', back: 'train' });
    const now = Date.now();
    const active = wordsArr().filter(w => !w.archived && w.ru);
    const sources = [
      ['due', 'К повтору сегодня', active.filter(w => C.wordDue(w, now))],
      ['learning', 'Изучаю и новые', active.filter(w => ['new', 'learning', 'hard'].includes(C.wordStatus(w, now)))],
      ['recent', 'Добавленные за неделю', active.filter(w => w.createdAt >= now - 7 * C.DAY)],
      ['all', 'Все слова', active],
    ].concat([...S.sets.values()].map(s => ['set:' + s.id, 'Набор «' + s.name + '»', active.filter(w => w.setIds.includes(s.id))]));
    const st = S.ui.listenOpts || (S.ui.listenOpts = { src: 'learning', ru: true, example: true, gap: 2, twice: false, shuffle: true });
    const srcSel = h('select', { class: 'input', id: 'ls-src', onchange: () => { st.src = srcSel.value; } }, sources.map(([v, l, arr]) => h('option', { value: v, disabled: !arr.length }, l + ' (' + arr.length + ')')));
    if (!sources.find(s => s[0] === st.src && s[2].length)) st.src = (sources.find(s => s[2].length) || ['all'])[0];
    srcSel.value = st.src;
    const sw = (label, key) => h('label', { class: 'switch' }, h('span', null, label), h('input', { type: 'checkbox', checked: st[key], onchange: e => { st[key] = e.target.checked; } }));
    const gap = h('select', { class: 'input', id: 'ls-gap', onchange: () => { st.gap = +gap.value; } }, [[1, '1 секунда'], [2, '2 секунды'], [3, '3 секунды'], [5, '5 секунд — успеть вспомнить']].map(([v, l]) => h('option', { value: v }, l)));
    gap.value = String(st.gap);
    main.append(h('div', { class: 'card stack' },
      h('p', { class: 'small muted' }, 'Слово по-английски → пауза, чтобы вспомнить → перевод → пример. Можно слушать на ходу. Держите экран включённым: на iPhone озвучка останавливается, если экран гаснет. На расписание повторений не влияет.'),
      h('label', { class: 'field', for: 'ls-src' }, 'Что слушать', srcSel),
      h('label', { class: 'field', for: 'ls-gap' }, 'Пауза перед переводом', gap),
      sw('Говорить перевод по-русски', 'ru'), sw('Читать пример', 'example'), sw('Повторять слово дважды (второй раз медленно)', 'twice'), sw('Перемешать', 'shuffle'),
      h('button', { class: 'btn primary big block', disabled: !Speech.supported, onclick: () => {
        const arr = (sources.find(s => s[0] === st.src) || [0, 0, []])[2];
        if (!arr.length) return toast('Здесь пока нет слов');
        Listen.start({ words: arr, title: 'Слушать' });
      } }, Speech.supported ? 'Начать' : 'Озвучка недоступна на этом устройстве')));
  };
  Listen.start = function (o) {
    const st = S.ui.listenOpts || (S.ui.listenOpts = { src: 'learning', ru: true, example: true, gap: 2, twice: false, shuffle: true });
    Listen.state = { words: st.shuffle ? C.shuffle(o.words) : o.words.slice(), idx: 0, playing: true, title: o.title, phase: '' };
    if (location.hash !== '#listen') location.hash = 'listen'; else renderPlayer();
    run();
  };
  let wakeLock = null;
  async function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
      if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) { /* не поддерживается */ }
  }
  function renderPlayer() {
    const s = Listen.state; if (!s) return;
    const main = screen({ title: s.title || 'Слушать', back: 'train', nav: false });
    const w = s.words[s.idx] || {};
    main.append(h('div', { class: 'prompt', style: { marginTop: '8px' } },
      w.image ? h('div', { class: 'pic' }, h('img', { src: w.image, alt: '' })) : w.emoji ? h('div', { class: 'pic' }, w.emoji) : null,
      h('div', { class: 'big', lang: 'en', id: 'ls-en' }, w.en || ''),
      h('div', { class: 'mid', id: 'ls-ru', style: { opacity: s.phase === 'ru' || s.phase === 'ex' || !s.playing ? 1 : 0, transition: 'opacity .2s' } }, w.ru || ''),
      w.example ? h('div', { class: 'small', lang: 'en', style: { opacity: s.phase === 'ex' || !s.playing ? 1 : 0.0 } }, w.example, w.exampleRu ? h('div', { class: 'muted' }, w.exampleRu) : null) : null),
      h('div', { class: 'meter' }, h('i', { style: { width: Math.round((s.idx + 1) / s.words.length * 100) + '%' } })),
      h('p', { class: 'small muted num', style: { textAlign: 'center' } }, (s.idx + 1) + ' из ' + s.words.length),
      h('div', { class: 'row', style: { justifyContent: 'center', gap: '14px' } },
        h('button', { class: 'btn', 'aria-label': 'Предыдущее слово', onclick: () => jump(-1) }, '◀︎'),
        h('button', { class: 'speak-big', 'aria-label': s.playing ? 'Пауза' : 'Продолжить', onclick: toggle }, s.playing ? h('span', { style: { fontSize: '30px', fontWeight: 700 } }, '❚❚') : h('span', { style: { fontSize: '30px' } }, '▶︎')),
        h('button', { class: 'btn', 'aria-label': 'Следующее слово', onclick: () => jump(1) }, '▶︎')),
      h('button', { class: 'btn ghost block', onclick: () => { stopListen(); go('train'); } }, 'Закончить'));
  }
  function stopListen() { if (Listen.state) Listen.state.playing = false; stopSpeech(); keepAwake(false); Listen.state = null; }
  function toggle() { const s = Listen.state; s.playing = !s.playing; if (s.playing) run(); else { stopSpeech(); keepAwake(false); } renderPlayer(); }
  function jump(d) { const s = Listen.state; stopSpeech(); s.idx = Math.max(0, Math.min(s.words.length - 1, s.idx + d)); s.phase = ''; renderPlayer(); if (s.playing) run(); }
  let runId = 0;
  async function run() {
    const my = ++runId; const s = Listen.state; if (!s) return;
    keepAwake(true);
    const st = S.ui.listenOpts;
    const alive = () => Listen.state === s && s.playing && my === runId && location.hash === '#listen';
    while (alive() && s.idx < s.words.length) {
      const w = s.words[s.idx];
      s.phase = 'en'; renderPlayer();
      await sayP(w.en); if (!alive()) return;
      if (st.twice) { await wait(500); if (!alive()) return; await sayP(w.en, { slow: true }); if (!alive()) return; }
      await wait(st.gap * 1000); if (!alive()) return;
      s.phase = 'ru'; renderPlayer();
      if (st.ru) { await sayP(w.ru, { lang: 'ru' }); if (!alive()) return; }
      if (st.example && w.example) { s.phase = 'ex'; renderPlayer(); await wait(400); await sayP(w.example); if (!alive()) return; }
      await wait(900); if (!alive()) return;
      if (s.idx >= s.words.length - 1) { s.playing = false; keepAwake(false); renderPlayer(); toast('Готово! Прослушано слов: ' + s.words.length); return; }
      s.idx++; s.phase = '';
    }
  }
  window.addEventListener('hashchange', () => { if (location.hash !== '#listen' && Listen.state) stopListen(); });

  // ---------- Числа ----------
  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function numWord(n) {
    if (n < 20) return ONES[n];
    if (n === 100) return 'one hundred';
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
    if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + numWord(n % 100) : '');
    return String(n);
  }
  // ---------- Мини-тренажёр (общий для чисел и алфавита) ----------
  function quiz(o) {
    // o: { title, back, make(i) → {task, prompt(el), say?, options[], answer, typed?}, count }
    let i = 0, right = 0;
    const started = Date.now();
    function step() {
      if (i >= o.count) return finish();
      const q = o.make(i);
      const main = screen({ title: o.title, back: o.back, nav: false });
      main.append(h('div', { class: 'meter' }, h('i', { style: { width: Math.round(i / o.count * 100) + '%' } })), h('div', { class: 'task' }, q.task));
      const p = h('div', { class: 'prompt' });
      q.prompt(p); main.append(p);
      if (q.say) { setTimeout(() => sayP(q.say), 250); p.append(h('div', { class: 'helpers' }, h('button', { class: 'btn sm', onclick: () => sayP(q.say) }, icon('speaker'), 'Ещё раз'), h('button', { class: 'btn sm', onclick: () => sayP(q.say, { slow: true }) }, icon('slow'), 'Медленно'))); }
      const fb = h('div');
      const opts = h('div', { class: 'options' });
      let done = false;
      q.options.forEach(opt => opts.append(h('button', { class: 'opt', lang: q.optLang || null, onclick: (e) => {
        if (done) return; done = true;
        const ok = String(opt) === String(q.answer);
        if (ok) right++;
        [...opts.children].forEach((b, k) => { b.disabled = true; if (String(q.options[k]) === String(q.answer)) b.classList.add('right'); });
        if (!ok) e.currentTarget.classList.add('wrong');
        fb.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') }, h('div', { class: 'title' }, ok ? 'Верно!' : 'Правильно: ' + q.answerText), q.note ? h('div', { class: 'small' }, q.note) : null));
        if (q.sayAfter) sayP(q.sayAfter);
        main.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary big block', onclick: () => { i++; step(); } }, 'Дальше')));
      } }, String(opt))));
      main.append(opts, fb);
    }
    function finish() {
      const main = screen({ title: o.title, back: o.back });
      main.append(h('div', { class: 'card stack' }, h('h2', null, 'Готово'), h('p', null, 'Верно ' + right + ' из ' + o.count + '.'),
        h('button', { class: 'btn primary block', onclick: () => quiz(o) }, 'Ещё раз'), h('button', { class: 'btn block', onclick: () => go('train') }, 'К тренировкам')));
      try { DB.put('sessions', { id: C.uid(), ts: started, mode: o.mode, n: o.count, correct: right, durationSec: Math.round((Date.now() - started) / 1000) }); } catch (e) { /* не критично */ }
    }
    step();
  }
  routes.numbers = function () {
    const main = screen({ title: 'Числа', back: 'train' });
    const lvl = S.ui.numLevel || 20;
    const seg = h('div', { class: 'seg' }, [[10, '0–10'], [20, '0–20'], [100, '0–100']].map(([v, l]) => h('button', { 'aria-pressed': String(lvl === v), onclick: () => { S.ui.numLevel = v; routes.numbers(); } }, l)));
    const table = h('div', { class: 'num-grid' });
    const shown = lvl === 100 ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 30, 40, 50, 60, 70, 80, 90, 100] : Array.from({ length: lvl + 1 }, (_, k) => k);
    shown.forEach(n => table.append(h('button', { class: 'num-cell', onclick: () => sayP(numWord(n)) }, h('b', null, n), h('small', { lang: 'en' }, numWord(n)))));
    main.append(seg, h('div', { class: 'card stack' }, h('h3', null, 'Нажмите на число — услышите, как оно звучит'), table),
      h('button', { class: 'btn primary big block', onclick: () => numbersQuiz(lvl) }, 'Тренировка: 10 заданий'));
  };
  function numbersQuiz(max) {
    const pickN = () => Math.floor(Math.random() * (max + 1));
    const around = (n) => { const s = new Set([n]); while (s.size < 4) { const d = max <= 20 ? pickN() : (n + [1, -1, 10, -10, 2, 5, 11, 20][Math.floor(Math.random() * 8)]); if (d >= 0 && d <= max) s.add(d); } return C.shuffle([...s]); };
    quiz({ title: 'Числа', back: 'numbers', count: 10, mode: 'numbers', make: (i) => {
      const n = pickN();
      if (i % 2 === 0) return { task: 'Послушайте и выберите число', say: numWord(n), prompt: (p) => p.append(h('div', { class: 'mid' }, '🔊')), options: around(n), answer: n, answerText: n + ' — ' + numWord(n) };
      const opts = around(n).map(numWord);
      return { task: 'Выберите, как это пишется по-английски', prompt: (p) => p.append(h('div', { class: 'big' }, n)), options: opts, optLang: 'en', answer: numWord(n), answerText: numWord(n), sayAfter: numWord(n),
        note: n >= 13 && n <= 19 ? 'Числа 13–19 оканчиваются на -teen: ударение на конец (thir-TEEN). А 30, 40… — на -ty с ударением в начале (THIR-ty).' : null };
    } });
  }
  // ---------- Алфавит ----------
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  routes.abc = function () {
    const main = screen({ title: 'Алфавит', back: 'train' });
    const table = h('div', { class: 'num-grid abc' });
    ABC.forEach(l => table.append(h('button', { class: 'num-cell', onclick: () => sayP(l) }, h('b', null, l + l.toLowerCase()))));
    main.append(h('div', { class: 'card stack' }, h('h3', null, 'Нажмите на букву — услышите её название'), table,
      h('p', { class: 'tiny muted' }, 'Названия букв нужны, чтобы продиктовать имя, e-mail или номер брони по буквам.')),
      h('button', { class: 'btn primary big block', onclick: abcQuiz }, 'Тренировка: 10 заданий'));
  };
  function abcQuiz() {
    const own = wordsArr().filter(w => /^[a-z]{3,6}$/i.test(w.en)).map(w => w.en.toLowerCase());
    const pool = own.length >= 4 ? own : ['cat', 'sea', 'sun', 'key', 'bus', 'tea', 'map', 'gym', 'flat', 'wave', 'taxi', 'room'];
    quiz({ title: 'Алфавит', back: 'abc', count: 10, mode: 'abc', make: (i) => {
      if (i % 3 !== 2) {
        const l = ABC[Math.floor(Math.random() * 26)];
        const confusable = { E: 'I', I: 'E', G: 'J', J: 'G', A: 'R', R: 'A', B: 'P', P: 'B', V: 'W', W: 'V', Y: 'I', K: 'Q', Q: 'K' };
        const s = new Set([l]); if (confusable[l]) s.add(confusable[l]);
        while (s.size < 4) s.add(ABC[Math.floor(Math.random() * 26)]);
        return { task: 'Послушайте и выберите букву', say: l, prompt: (p) => p.append(h('div', { class: 'mid' }, '🔊')), options: C.shuffle([...s]), answer: l, answerText: l };
      }
      const word = pool[Math.floor(Math.random() * pool.length)];
      const others = C.shuffle(pool.filter(x => x !== word)).slice(0, 3);
      const spelled = word.toUpperCase().split('').join(', ');
      return { task: 'Слово продиктовали по буквам — какое?', say: spelled, prompt: (p) => p.append(h('div', { class: 'mid' }, '🔊 ' + word.length + ' букв')),
        options: C.shuffle([word].concat(others)), optLang: 'en', answer: word, answerText: word + ' (' + spelled + ')' };
    } });
  }

  // ---------- Неправильные глаголы: 3 формы ----------
  const TOP = ['be', 'have', 'do', 'go', 'get', 'make', 'say', 'see', 'come', 'take', 'give', 'know', 'think', 'eat', 'drink', 'buy', 'pay', 'find', 'leave', 'meet',
    'sleep', 'swim', 'ride', 'fly', 'write', 'read', 'speak', 'tell', 'feel', 'sit', 'begin', 'forget', 'understand', 'wake', 'fall', 'run', 'send', 'spend', 'bring', 'teach'];
  function irrList(scope) {
    const all = C.irregularAll();
    if (scope === 'mine') {
      const mine = new Set(wordsArr().filter(w => !w.archived).map(w => C.irregular(w.en)).filter(Boolean).map(x => x.v1.split(' ')[0]));
      return all.filter(v => mine.has(v.v1));
    }
    if (scope === 'top') return TOP.map(k => all.find(v => v.v1 === k)).filter(Boolean);
    return all;
  }
  routes.irregular = function () {
    const main = screen({ title: 'Неправильные глаголы', back: 'train' });
    let scope = S.ui.irrScope || 'top';
    const mineN = irrList('mine').length;
    if (scope === 'mine' && !mineN) scope = 'top';
    main.append(h('div', { class: 'seg' }, [['top', 'Главные 40'], ['mine', 'Из словаря (' + mineN + ')'], ['all', 'Все ' + C.irregularAll().length]].map(([v, l]) =>
      h('button', { 'aria-pressed': String(scope === v), disabled: v === 'mine' && !mineN, onclick: () => { S.ui.irrScope = v; routes.irregular(); } }, l))));
    main.append(h('div', { class: 'card stack' },
      h('p', { class: 'small' }, h('b', null, 'Три формы: '), 'сейчас (I ', h('i', null, 'go'), ') → в прошлом (вчера I ', h('i', null, 'went'), ') → после have (I have ', h('i', null, 'gone'), '). У обычных глаголов 2-я и 3-я форма — просто +ed (work → worked). Неправильные нужно запомнить.'),
      h('div', { class: 'split' },
        h('button', { class: 'btn primary', onclick: () => irrQuiz(scope) }, 'Тренировка'),
        h('button', { class: 'btn soft', onclick: () => Listen.start({ title: 'Неправильные глаголы', words: irrList(scope).map(v => ({ id: 'irr' + v.v1, en: v.v1 + ', ' + v.v2 + ', ' + v.v3, ru: v.ru })) }) }, icon('speaker'), 'Слушать')),
      h('button', { class: 'btn block', onclick: () => go('set-irregular') }, 'Добавить в словарь набор с примерами')));
    const tbl = h('div', { class: 'irr-table' }, h('div', { class: 'irr-row head' }, h('span', null, 'сейчас'), h('span', null, 'прошлое'), h('span', null, 'после have'), h('span', null, '')));
    irrList(scope).forEach(v => tbl.append(h('button', { class: 'irr-row', onclick: () => sayP(v.v1 + ', ' + v.v2 + ', ' + v.v3, { slow: true }) },
      h('span', { lang: 'en' }, h('b', null, v.v1), h('small', null, v.ru)), h('span', { lang: 'en' }, v.v2), h('span', { lang: 'en' }, v.v3), h('span', { 'aria-hidden': 'true' }, '🔊'))));
    main.append(h('div', { class: 'card', style: { padding: '6px' } }, tbl));
  };
  function irrQuiz(scope) {
    const list = irrList(scope);
    const all = C.irregularAll();
    const ed = (v) => v.replace(/e$/, '') + 'ed';
    quiz({ title: 'Неправильные глаголы', back: 'irregular', count: 10, mode: 'irregular', make: () => {
      const v = list[Math.floor(Math.random() * list.length)];
      const which = Math.random() < 0.55 ? 2 : 3;
      const ans = which === 2 ? v.v2 : v.v3;
      const other = all.filter(x => x.v1 !== v.v1);
      const s = new Set([ans]);
      [ed(v.v1), which === 2 ? v.v3 : v.v2, v.v1, other[Math.floor(Math.random() * other.length)][which === 2 ? 'v2' : 'v3']].forEach(x => { if (s.size < 4 && x !== ans) s.add(x); });
      while (s.size < 4) s.add(other[Math.floor(Math.random() * other.length)].v2);
      return { task: which === 2 ? 'Как будет в прошлом (2-я форма)?' : 'Третья форма (после have)?', optLang: 'en',
        prompt: (p) => p.append(h('div', { class: 'big', lang: 'en' }, v.v1), h('div', { class: 'muted' }, v.ru),
          h('div', { class: 'small', lang: 'en' }, which === 2 ? 'Yesterday I ___ …' : 'I have ___ …')),
        options: C.shuffle([...s]), answer: ans, answerText: v.v1 + ' – ' + v.v2 + ' – ' + v.v3, sayAfter: v.v1 + ', ' + v.v2 + ', ' + v.v3 };
    } });
  }

  // ---------- Как пользоваться ----------
  routes.help = function () {
    const main = screen({ title: 'Как пользоваться', back: 'today' });
    const sec = (ic, t, ...body) => h('div', { class: 'card stack help' }, h('h2', null, h('span', { 'aria-hidden': 'true' }, ic + ' '), t), ...body);
    const li = (...x) => h('li', null, ...x);
    main.append(
      sec('1️⃣', 'Начните с готового набора',
        h('p', null, 'Добавить → Наборы → выберите тему: семья, работа, дом, время и погода, здоровье, город, одежда, чувства, хобби, путешествия, аренда жилья, пляж… → «Добавить в словарь». Перевод, пример, озвучка и картинка уже есть.'),
        h('a', { class: 'btn primary block', href: '#sets' }, 'Открыть наборы')),
      sec('2️⃣', 'Добавляйте свои слова',
        h('ul', null,
          li(h('b', null, 'Одно слово: '), 'кнопка «+» → впишите слово (можно по-русски) → «Подсказать перевод» → «Сохранить».'),
          li(h('b', null, 'Список: '), '«+» → Список → вставьте строки вида «beach — пляж». Можно без перевода — получатся черновики.'),
          li(h('b', null, 'Из текста: '), 'вставьте переписку или объявление и нажмите на незнакомые слова.'),
          li(h('b', null, 'С фото: '), 'на iPhone зажмите текст на фото → «Скопировать» → «Из текста».'),
          li(h('b', null, 'Лучшее качество: '), '«Из Claude» — скопируйте запрос в чат Claude и вставьте ответ обратно.'))),
      sec('3️⃣', 'Занимайтесь 15 минут в день',
        h('p', null, 'Сегодня → «Начать». Приложение само собирает занятие: сначала то, что пора повторить, потом несколько новых слов.'),
        h('ul', null,
          li('Не знаете — жмите «Не знаю», это нормально: слово вернётся скоро.'),
          li('В карточках оценивайте честно: «Не вспомнила», «С трудом», «Вспомнила», «Легко». От этого зависит, когда слово появится снова.'),
          li('Пропустили дни — ничего не сгорает. Сегодня покажется посильная порция, остальное подождёт.'))),
      sec('🎧', 'Слушать на ходу',
        h('p', null, 'Тренировки → «Слушать»: слово, пауза, перевод, пример. Экран должен оставаться включённым.')),
      sec('📚', 'Если слов много',
        h('ul', null,
          li('Добавляйте сколько угодно — хоть 3000. В Telegram в облако помещается около 10 000 слов.'),
          li('Новых слов в день по умолчанию 7 — так не будет перегруза. Поменять: Настройки → «Новых слов в день».'),
          li('Раскладывайте слова по наборам (например, «К уроку») и тренируйте нужный в «Подготовке к уроку».'),
          li('Ненужные — в архив: из занятий исчезнут, но не удалятся.'))),
      sec('🔁', 'Неправильные глаголы',
        h('p', null, 'Тренировки → «Неправильные глаголы»: таблица трёх форм с озвучкой, тренировка и готовый набор с примерами.'),
        h('a', { class: 'btn block', href: '#irregular' }, 'Открыть')),
      sec('📝', 'Грамматика',
        h('p', null, 'Тренировки → «Грамматика». 18 тем по порядку — от am/is/are до Past Simple, going to и сравнения (cheaper). Короткое правило по-русски → задания на понимание → свои ответы. Через несколько дней приложение предложит повторить тему за 2 минуты.'),
        h('a', { class: 'btn block', href: '#grammar' }, 'Открыть')),
      sec('📱', 'Telegram, телефон и компьютер',
        h('ul', null,
          li('В боте словарь хранится в облаке вашего Telegram — одинаковый на телефоне и компьютере.'),
          li('Нужно ответить в чате? Смахните приложение вниз — оно свернётся в полоску. Нажмите на неё и продолжайте с того же места.'),
          li('У подруг будет свой отдельный словарь — просто отправьте им ссылку на бота.'))),
      sec('💾', 'Сохранность',
        h('p', null, 'В Telegram всё сохраняется само. Если пользуетесь сайтом без Telegram — иногда делайте резервную копию: Настройки → «Сохранить резервную копию».')));
  };

  // ---------- Экран «Тренировки» плитками ----------
  const legacyPrep = routes.train; // прежний экран — теперь это «Подготовка к уроку»
  routes.prep = legacyPrep;
  routes.train = async function () {
    const main = screen({ title: 'Тренировки', tab: 'train' });
    const words = wordsArr().filter(w => !w.archived && w.ru);
    const { plan } = App.todayStats();
    const daily = plan.portion.length + plan.fresh.length;
    main.append(h('section', { class: 'hero' },
      h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('h2', null, 'Мои ' + S.settings.minutes + ' минут'), h('span', { class: 'small', style: { opacity: .8 } }, 'повторить ' + plan.portion.length + ' · новых ' + plan.fresh.length)),
      h('button', { class: 'btn primary big block', disabled: !daily, onclick: () => Train.startDaily() }, daily ? 'Начать' : (words.length ? 'На сегодня всё сделано' : 'Сначала добавьте слова'))));
    let mist = [];
    try { mist = await Train.mistakesWordIds(7); } catch (e) { /* пусто */ }
    let gramInfo = 'A1: am/is/are, Present Simple…';
    if (window.Grammar) { await Grammar.loadProgress(); const n = Grammar.LESSONS.filter(l => ['done', 'due'].includes(Grammar.stateOf(l.id, Date.now()))).length; const d = Grammar.dueLessons().length; gramInfo = d ? 'пора повторить: ' + d : n ? 'пройдено ' + n + ' из ' + Grammar.LESSONS.length : Grammar.LESSONS.length + ' тем уровня A1'; }
    const tile = (ic, title, sub, onclick, disabled) => h('button', { class: 'tile', disabled: !!disabled, onclick }, h('span', { class: 'tile-ic' }, ic), h('span', { class: 'tile-t' }, h('b', null, title), h('small', null, sub)));
    const grid = h('div', { class: 'tiles-grid' },
      tile('🎯', 'Подготовка к уроку', 'набор, слова, упражнения', () => go('prep'), !words.length),
      tile('🩹', 'Ошибки', mist.length ? mist.length + ' ' + C.plural(mist.length, 'слово', 'слова', 'слов') : 'ошибок нет', () => Train.startPrep({ wordIds: mist, types: ['ruEn', 'gap', 'enRu', 'listenWrite'], limit: 20, mode: 'mistakes', title: 'Работа над ошибками' }), !mist.length),
      tile('🎧', 'Слушать', 'слово → пауза → перевод', () => go('listen'), !words.length),
      tile('🧩', 'Пары', 'быстрая разминка', () => Train.startPrep({ wordIds: words.map(w => w.id), types: ['match'], limit: 15, mode: 'match', title: 'Пары' }), words.length < 3),
      tile('🔢', 'Числа', '0–100 на слух', () => go('numbers')),
      tile('🔤', 'Алфавит', 'буквы и диктовка', () => go('abc')),
      tile('🔁', 'Неправильные глаголы', 'go – went – gone', () => go('irregular')),
      tile('📚', 'Готовые наборы', 'путешествия, жильё, пляж…', () => go('sets')),
      tile('📝', 'Грамматика', gramInfo, () => go('grammar')));
    main.append(grid, h('a', { class: 'btn ghost block', href: '#help' }, 'Как пользоваться'));
    if (!words.length) main.append(h('div', { class: 'banner' }, h('div', { class: 'grow' }, h('span', null, 'Начните с готового набора или добавьте свои слова — тогда откроются тренировки по словам. «Числа» и «Алфавит» работают сразу.'),
      h('div', { class: 'row' }, h('a', { class: 'btn sm primary', href: '#sets' }, 'Готовые наборы')))));
  };

  window.Extra = { numWord, Listen, sayP };
})();
