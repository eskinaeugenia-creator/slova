/* Мои слова — аудиокнига: книга читается вслух главами подряд, со скоростью, паузой,
   перемоткой по абзацам и продолжением с места остановки. Экран по возможности не гаснет (Wake Lock). */
(function () {
  'use strict';
  const { S, h, icon, toast, go, routes, screen, Speech, kvGet, kvSet, soundOn } = window.App;

  const RATES = [[0.6, 'Медленно'], [0.8, 'Спокойно'], [0.95, 'Обычно'], [1.1, 'Быстрее']];
  const say = (t, o) => window.Extra ? Extra.sayP(t, o) : Promise.resolve(true);
  const hush = () => { if (window.Extra) Extra.stopSpeech(); else try { speechSynthesis.cancel(); } catch (e) { /* нет */ } };
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const sentencesOf = (en) => (String(en).match(/[^.!?]+[.!?'"’”]*\s*/g) || [String(en)]).map(s => s.trim()).filter(Boolean);

  // ---------- Место остановки: { [id]: { ch, p, t, done } } ----------
  async function allPos() { return (await kvGet('audioPos')) || {}; }
  async function savePos(id, ch, p, done) {
    const all = await allPos(); all[id] = { ch, p, t: Date.now(), done: !!done }; await kvSet('audioPos', all);
  }
  async function getPos(id) { return (await allPos())[id] || null; }
  async function lastListened() {
    const all = await allPos(); let best = null;
    Object.keys(all).forEach(id => { const r = all[id]; if (r && !r.done && (!best || r.t > best.t)) best = Object.assign({ id }, r); });
    return best;
  }

  // ---------- Экран не гаснет ----------
  let lock = null;
  async function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); }
      if (!on && lock) { const l = lock; lock = null; await l.release(); }
    } catch (e) { /* не поддерживается или вкладка скрыта */ }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && AB.st && AB.st.playing) keepAwake(true); });

  // ---------- Плеер ----------
  const AB = { st: null };
  let runId = 0;
  const ui = {};

  routes.audio = async function (id) {
    stopAll();
    const b = window.Books ? await Books.getBook(id) : null;
    if (!b) return go('books');
    const pos = await getPos(id);
    let ch = 0, p = 0;
    if (pos && !pos.done && b.chapters[pos.ch]) { ch = pos.ch; p = Math.min(pos.p || 0, b.chapters[pos.ch].p.length - 1); }
    const rate = (await kvGet('audioRate')) || 0.95;
    AB.st = { b, ch, p, s: 0, playing: false, rate, resumed: !!(pos && !pos.done && (ch || p)) };
    render();
  };

  function render() {
    const st = AB.st; if (!st) return;
    const b = st.b, chap = b.chapters[st.ch];
    const main = screen({ title: 'Слушать книгу', back: b.chapters.length > 1 ? 'book-' + b.id : 'books', nav: false });
    const n = chap.p.length;
    const [en, ru] = chap.p[st.p];
    const sentEls = sentencesOf(en).map((s, i) => h('span', { class: 'ab-s' + (st.playing && i === st.s ? ' on' : ''), 'data-s': i }, s + ' '));
    ui.text = h('div', { class: 'ab-text', lang: 'en', id: 'ab-text' }, sentEls);
    ui.sents = sentEls;
    const showTr = S.ui.bookTr === true && ru;
    const quietNow = !soundOn();

    const chSel = b.chapters.length > 1 ? h('select', { class: 'input', id: 'ab-ch', 'aria-label': 'Глава', onchange: e => jumpTo(+e.target.value, 0) },
      b.chapters.map((c, i) => h('option', { value: i, selected: i === st.ch }, (i + 1) + '. ' + c.title))) : null;
    const rates = h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '8px' }, role: 'group', 'aria-label': 'Скорость' },
      RATES.map(([v, l]) => h('button', { class: 'chip', 'data-rate': v, 'aria-pressed': String(Math.abs(st.rate - v) < 0.01), onclick: async () => {
        st.rate = v; await kvSet('audioRate', v); render(); if (st.playing) play();
      } }, l)));

    main.append(...[
      h('div', { class: 'card stack', style: { textAlign: 'center' } },
        h('div', { style: { fontSize: '44px' } }, b.icon || '📖'),
        h('h2', { lang: 'en' }, b.title),
        h('p', { class: 'small muted', id: 'ab-where' }, (b.chapters.length > 1 ? 'Глава ' + (st.ch + 1) + ' из ' + b.chapters.length + ' · ' : '') + 'абзац ' + (st.p + 1) + ' из ' + n),
        st.resumed && !st.playing ? h('p', { class: 'small', id: 'ab-resume' }, 'Продолжим с того места, где вы остановились.') : null,
        h('div', { class: 'meter' }, h('i', { style: { width: Math.round((st.p + 1) / n * 100) + '%' } }))),
      h('div', { class: 'card stack' }, ui.text, showTr ? h('div', { class: 'rp-tr', lang: 'ru' }, ru) : null),
      h('div', { class: 'row', style: { justifyContent: 'center', gap: '14px', margin: '6px 0' } },
        h('button', { class: 'btn', id: 'ab-prev', 'aria-label': 'Предыдущий абзац', onclick: () => step(-1) }, '◀︎'),
        h('button', { class: 'speak-big', id: 'ab-play', disabled: quietNow || !Speech.supported, 'aria-label': st.playing ? 'Пауза' : 'Слушать', onclick: toggle },
          st.playing ? h('span', { style: { fontSize: '30px', fontWeight: 700 } }, '❚❚') : h('span', { style: { fontSize: '30px' } }, '▶︎')),
        h('button', { class: 'btn', id: 'ab-next', 'aria-label': 'Следующий абзац', onclick: () => step(1) }, '▶︎')),
      quietNow ? h('p', { class: 'small', style: { textAlign: 'center' } }, '🔇 Сейчас включён тихий режим — слушать можно, когда он закончится.') : null,
      !Speech.supported ? h('p', { class: 'small', style: { textAlign: 'center' } }, 'Озвучка недоступна на этом устройстве.') : null,
      h('div', { class: 'card stack' },
        h('b', null, 'Скорость'), rates,
        chSel ? h('label', { class: 'field', for: 'ab-ch' }, 'Глава', chSel) : null,
        ru ? h('label', { class: 'switch' }, h('span', null, 'Показывать перевод абзаца'), h('input', { type: 'checkbox', id: 'ab-tr', checked: S.ui.bookTr === true, onchange: e => { S.ui.bookTr = e.target.checked; render(); } })) : null,
        h('button', { class: 'btn ghost block', id: 'ab-read', onclick: () => { stopAll(); go('read-' + b.id + '-' + st.ch); } }, 'Открыть текст главы'),
        h('p', { class: 'tiny muted' }, 'Главы идут подряд. Место остановки запоминается — в следующий раз продолжите с него. Пока идёт чтение, экран старается не гаснуть; если телефон всё же выключил звук, нажмите ▶︎.'))].filter(Boolean));
  }
  // Подсветить текущее предложение без перерисовки экрана
  function mark() {
    const st = AB.st; if (!st || !ui.sents) return;
    ui.sents.forEach((el, i) => el.classList.toggle('on', st.playing && i === st.s));
  }

  function toggle() { const st = AB.st; if (!st) return; if (st.playing) pause(); else play(); }
  function pause() {
    const st = AB.st; if (!st) return;
    st.playing = false; runId++; hush(); keepAwake(false); savePos(st.b.id, st.ch, st.p); render();
  }
  function play() {
    const st = AB.st; if (!st) return;
    st.playing = true; st.resumed = false; hush(); render(); run();
  }
  function step(d) {
    const st = AB.st; if (!st) return;
    let ch = st.ch, p = st.p + d;
    if (p < 0) { if (ch > 0) { ch--; p = st.b.chapters[ch].p.length - 1; } else p = 0; }
    else if (p >= st.b.chapters[ch].p.length) { if (ch + 1 < st.b.chapters.length) { ch++; p = 0; } else p = st.b.chapters[ch].p.length - 1; }
    jumpTo(ch, p);
  }
  function jumpTo(ch, p) {
    const st = AB.st; if (!st) return;
    runId++; hush();
    st.ch = ch; st.p = p; st.s = 0; st.resumed = false;
    savePos(st.b.id, ch, p);
    render(); if (st.playing) run();
  }

  async function run() {
    const my = ++runId; const st = AB.st; if (!st) return;
    const alive = () => AB.st === st && st.playing && my === runId && location.hash === '#audio-' + st.b.id;
    keepAwake(true);
    while (alive()) {
      const chap = st.b.chapters[st.ch];
      savePos(st.b.id, st.ch, st.p);
      const sents = sentencesOf(chap.p[st.p][0]);
      for (let i = st.s; i < sents.length; i++) {
        st.s = i; mark();
        const ok = await say(sents[i], { rate: st.rate });
        if (!alive()) return;
        if (ok === false) return;
      }
      st.s = 0;
      await wait(500); if (!alive()) return;
      if (st.p + 1 < chap.p.length) { st.p++; render(); continue; }
      // глава дослушана — отмечаем её прочитанной
      if (window.Books && Books.markChapter) await Books.markChapter(st.b.id, st.ch);
      if (st.ch + 1 < st.b.chapters.length) {
        st.ch++; st.p = 0; render();
        toast('Глава ' + st.ch + ' дослушана. Дальше — глава ' + (st.ch + 1));
        await wait(1200); if (!alive()) return;
        continue;
      }
      // книга закончилась
      st.playing = false; keepAwake(false);
      await savePos(st.b.id, 0, 0, true);
      st.ch = 0; st.p = 0; render();
      toast('Книга дослушана! 🎉');
      return;
    }
  }
  function stopAll() { if (AB.st) { AB.st.playing = false; } runId++; hush(); keepAwake(false); }
  window.addEventListener('hashchange', () => {
    const st = AB.st; if (!st) return;
    if (location.hash !== '#audio-' + st.b.id) { if (st.playing) savePos(st.b.id, st.ch, st.p); stopAll(); AB.st = null; }
  });
  // Свернули приложение — запоминаем место
  document.addEventListener('visibilitychange', () => { const st = AB.st; if (st && document.visibilityState !== 'visible') savePos(st.b.id, st.ch, st.p); });

  // Кнопка «Слушать книгу» для экранов книги и чтения
  async function button(b, opts) {
    opts = opts || {};
    const pos = await getPos(b.id);
    const cont = pos && !pos.done && (pos.ch || pos.p) && b.chapters[pos.ch];
    const label = opts.chapter != null ? (cont && pos.ch === opts.chapter ? 'Продолжить слушать' : 'Слушать как аудиокнигу')
      : cont ? 'Продолжить слушать' + (b.chapters.length > 1 ? ' · гл. ' + (pos.ch + 1) : '') : 'Слушать книгу';
    return h('button', { class: 'btn ' + (opts.cls || 'soft') + ' block', id: 'ab-open', onclick: async () => {
      if (opts.chapter != null && (!cont || pos.ch !== opts.chapter)) await savePos(b.id, opts.chapter, 0);
      go('audio-' + b.id);
    } }, '🎧 ', label);
  }

  window.AudioBook = { button, lastListened, getPos, savePos, RATES };
})();
