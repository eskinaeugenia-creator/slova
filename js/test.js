/* Мои слова — «Тест» по изученным словам: результат в %, время, список ошибок.
   Тест только проверяет: расписание повторений (FSRS) он не меняет. */
(function () {
  'use strict';
  const C = window.Core;
  const { S, h, $, icon, toast, dialog, go, routes, screen, Speech, wordsArr } = window.App;

  const KINDS = [
    ['choice', 'С выбором ответа', 'английское → перевод и наоборот'],
    ['write', 'Письменные', 'перевод → написать по-английски'],
    ['listen', 'На слух', 'услышать → выбрать перевод'],
  ];
  const soundOn = () => S.settings.sound && Speech.supported;
  const learned = () => wordsArr().filter(w => !w.archived && w.ru && w.srs && w.srs.recog && w.srs.recog.reps > 0);
  let T = null; // текущий тест

  function others(w, n) {
    const kr = C.keyRu(w.ru), ke = C.keyEn(w.en);
    const pool = C.shuffle(wordsArr().filter(x => !x.archived && x.ru && x.id !== w.id && C.keyRu(x.ru) !== kr && C.keyEn(x.en) !== ke));
    const out = []; const seen = new Set([kr]);
    for (const x of pool) { const k = C.keyRu(x.ru); if (seen.has(k)) continue; seen.add(k); out.push(x); if (out.length >= n) break; }
    return out;
  }
  const fmt = (sec) => Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  const st = () => S.ui.test || (S.ui.test = { set: 'all', n: 20, kinds: ['choice', 'write', 'listen'], timer: true });

  // ---------- Настройка теста ----------
  routes.test = async function () {
    const main = screen({ title: 'Тест', back: 'train' });
    const all = learned();
    if (all.length < 4) {
      main.append(h('div', { class: 'card empty' }, h('h2', null, 'Пока рано для теста'),
        h('p', { class: 'muted' }, 'В тест попадают слова, которые вы уже проходили хотя бы раз. Нужно минимум 4 таких слова — сейчас ' + all.length + '.'),
        h('button', { class: 'btn primary', onclick: () => window.Train && Train.startDaily() }, 'Позаниматься')));
      return;
    }
    const o = st();
    const history = (await App.kvGet('tests')) || [];
    const card = h('div', { class: 'card stack' });
    main.append(card);
    const draw = () => {
      card.innerHTML = '';
      const sets = [...S.sets.values()].filter(s => all.some(w => w.setIds.includes(s.id)));
      const setSel = h('select', { class: 'input', id: 'test-set', onchange: () => { o.set = setSel.value; draw(); } },
        h('option', { value: 'all' }, 'Все изученные слова (' + all.length + ')'),
        sets.map(s => h('option', { value: s.id }, s.name + ' (' + all.filter(w => w.setIds.includes(s.id)).length + ')')));
      setSel.value = o.set === 'all' || sets.some(s => s.id === o.set) ? o.set : 'all';
      const pool = all.filter(w => setSel.value === 'all' || w.setIds.includes(setSel.value));
      const nSel = h('div', { class: 'seg' }, [10, 20, 30, 9999].map(n => h('button', { 'aria-pressed': String(o.n === n), onclick: () => { o.n = n; draw(); } }, n === 9999 ? 'Все (' + pool.length + ')' : String(n))));
      const kinds = h('div', { class: 'stack', style: { gap: '2px' } }, KINDS.map(([id, label, sub]) => {
        const off = id === 'listen' && !soundOn();
        return h('label', { class: 'switch' }, h('span', { class: 'stack', style: { gap: 0 } }, h('span', { class: off ? 'muted' : '' }, label), h('span', { class: 'tiny muted' }, off ? 'звук выключен в настройках' : sub)),
          h('input', { type: 'checkbox', disabled: off, checked: o.kinds.includes(id) && !off, onchange: e => { o.kinds = e.target.checked ? o.kinds.concat(id) : o.kinds.filter(x => x !== id); } }));
      }));
      const timerSw = h('label', { class: 'switch' }, h('span', null, 'Показывать время'), h('input', { type: 'checkbox', checked: o.timer, onchange: e => { o.timer = e.target.checked; } }));
      card.append(h('h2', null, 'Проверьте себя'),
        h('p', { class: 'small muted' }, 'Только слова, которые вы уже учили. В конце — процент верных, время и список ошибок. Тест ничего не портит: расписание повторений он не меняет.'),
        h('label', { class: 'field', for: 'test-set' }, 'Что проверяем', setSel),
        h('div', { class: 'field' }, h('span', null, 'Сколько вопросов'), nSel),
        h('div', { class: 'field' }, h('span', null, 'Типы вопросов'), kinds), timerSw,
        h('button', { class: 'btn primary big block', id: 'test-start', onclick: () => {
          const kinds = o.kinds.filter(k => !(k === 'listen' && !soundOn()));
          if (!kinds.length) return toast('Выберите хотя бы один тип вопросов');
          start(pool.map(w => w.id), kinds, o.n, setSel.value);
        } }, 'Начать тест'));
    };
    draw();
    if (history.length) main.append(h('div', { class: 'card stack' }, h('h3', null, 'Прошлые результаты'),
      h('div', { class: 'stack', style: { gap: '6px' } }, history.slice(0, 5).map(r => h('div', { class: 'row', style: { justifyContent: 'space-between' } },
        h('span', { class: 'small' }, new Date(r.ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) + ' · ' + r.n + ' ' + C.plural(r.n, 'вопрос', 'вопроса', 'вопросов') + ' · ' + fmt(r.sec)),
        h('b', { class: 'num', style: { color: r.pct >= 80 ? 'var(--good)' : r.pct >= 50 ? 'var(--accent)' : 'var(--bad)' } }, r.pct + '%'))))));
  };

  function start(ids, kinds, n, setId) {
    const words = C.shuffle(ids).slice(0, n).map(id => S.words.get(id)).filter(Boolean);
    const qs = words.map((w, i) => {
      let k = kinds[i % kinds.length];
      if (k === 'choice') k = Math.random() < 0.5 ? 'enRu' : 'ruEn';
      if ((k === 'enRu' || k === 'ruEn' || k === 'listen') && others(w, 3).length < 3) k = kinds.includes('write') ? 'write' : 'enRu';
      return { wordId: w.id, k };
    });
    T = { qs: C.shuffle(qs), idx: 0, right: 0, almost: 0, wrong: [], started: Date.now(), timer: st().timer, setId };
    go('testrun');
  }

  // ---------- Ход теста ----------
  let clock = null;
  routes.testrun = function () {
    if (!T) return go('test');
    clearInterval(clock);
    if (T.idx >= T.qs.length) return result();
    const q = T.qs[T.idx]; const w = S.words.get(q.wordId);
    if (!w) { T.idx++; return routes.testrun(); }
    const root = $('#app'); root.innerHTML = '';
    const pct = Math.round(T.idx / T.qs.length * 100);
    const time = h('span', { class: 'small muted num' }, '');
    const tick = () => { time.textContent = fmt(Math.round((Date.now() - T.started) / 1000)); };
    if (T.timer) { tick(); clock = setInterval(tick, 1000); }
    const body = h('div', { class: 'sbody' });
    root.append(h('div', { class: 'session' }, h('div', { class: 'sbar' },
      h('button', { class: 'icon-btn', 'aria-label': 'Прервать тест', onclick: async () => { if (await dialog({ title: 'Прервать тест?', text: 'Результат не сохранится.', ok: 'Прервать', cancel: 'Продолжить' })) { clearInterval(clock); T = null; go('test'); } } }, icon('close')),
      h('div', { class: 'meter' }, h('i', { style: { width: pct + '%' } })),
      h('span', { class: 'small muted num' }, (T.idx + 1) + '/' + T.qs.length), T.timer ? time : null), body));
    const fb = h('div'); const actions = h('div', { class: 'actions' });
    let done = false;
    const answer = (ok, almost) => {
      if (done) return; done = true;
      if (ok) { T.right++; if (almost) T.almost++; } else T.wrong.push(w.id);
      fb.append(h('div', { class: 'feedback ' + (ok ? (almost ? 'typo' : 'ok') : 'no') },
        h('div', { class: 'title' }, ok ? (almost ? 'Почти — засчитано' : 'Верно!') : 'Неверно'),
        h('div', null, h('b', { lang: 'en' }, w.en), ' — ', w.ru)));
      actions.innerHTML = '';
      const nb = h('button', { class: 'btn primary big block', onclick: () => { T.idx++; routes.testrun(); } }, T.idx + 1 >= T.qs.length ? 'К результату' : 'Дальше');
      actions.append(nb); setTimeout(() => nb.focus(), 30);
      if (ok && !almost) setTimeout(() => { if (T && T.qs[T.idx] === q) { T.idx++; routes.testrun(); } }, 900);
    };
    if (q.k === 'write') {
      const input = h('input', { class: 'input answer', id: 'test-input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', lang: 'en', placeholder: 'По-английски' });
      const check = () => {
        if (done) return;
        const v = input.value; if (!v.trim()) return input.focus();
        const r = C.checkAnswer(v, w.en);
        input.disabled = true;
        answer(r.result === 'correct' || r.result === 'typo', r.result === 'typo');
      };
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      body.append(h('div', { class: 'task' }, 'Напишите по-английски'), h('div', { class: 'prompt' }, h('div', { class: 'big' }, w.ru)), input, fb, actions);
      actions.append(h('button', { class: 'btn primary big block', onclick: check }, 'Проверить'), h('button', { class: 'btn ghost block', onclick: () => { input.disabled = true; answer(false); } }, 'Не знаю'));
      setTimeout(() => input.focus(), 50);
    } else {
      const opts = C.shuffle([w].concat(others(w, 3)));
      const enOpts = q.k === 'ruEn';
      const list = h('div', { class: 'options' });
      opts.forEach(o => list.append(h('button', { class: 'opt', lang: enOpts ? 'en' : null, onclick: (e) => {
        if (done) return;
        [...list.children].forEach((b, i) => { b.disabled = true; if (opts[i].id === w.id) b.classList.add('right'); });
        if (o.id !== w.id) e.currentTarget.classList.add('wrong');
        answer(o.id === w.id);
      } }, enOpts ? o.en : o.ru)));
      const prompt = q.k === 'listen'
        ? h('div', { class: 'prompt' }, h('button', { class: 'speak-big', 'aria-label': 'Прослушать', onclick: () => Speech.say(w.en) }, icon('speaker')))
        : h('div', { class: 'prompt' }, h('div', { class: 'big', lang: enOpts ? null : 'en' }, enOpts ? w.ru : w.en));
      if (q.k === 'listen') setTimeout(() => Speech.say(w.en), 250);
      body.append(h('div', { class: 'task' }, q.k === 'listen' ? 'Послушайте и выберите перевод' : enOpts ? 'Выберите английское слово' : 'Выберите перевод'), prompt, list, fb, actions);
      actions.append(h('button', { class: 'btn ghost block', onclick: () => { [...list.children].forEach((b, i) => { b.disabled = true; if (opts[i].id === w.id) b.classList.add('right'); }); answer(false); } }, 'Не знаю'));
    }
  };

  async function result() {
    const t = T; T = null;
    const sec = Math.max(1, Math.round((Date.now() - t.started) / 1000));
    const n = t.qs.length; const pct = Math.round(t.right / n * 100);
    const hist = (await App.kvGet('tests')) || [];
    hist.unshift({ ts: Date.now(), n, right: t.right, pct, sec, set: t.setId });
    await App.kvSet('tests', hist.slice(0, 30));
    const main = screen({ title: 'Результат теста', back: 'train', nav: false });
    const wrong = [...new Set(t.wrong)].map(id => S.words.get(id)).filter(Boolean);
    const deg = Math.round(pct * 3.6);
    const msg = pct >= 90 ? 'Отлично! Эти слова вы знаете.' : pct >= 70 ? 'Хороший результат. Ошибки — ниже, их стоит повторить.' : pct >= 50 ? 'Неплохо. Повторите ошибки — и пройдите тест ещё раз через пару дней.' : 'Это нормально: тест показывает, что повторить. Начните с ошибок.';
    main.append(h('div', { class: 'card stack', style: { alignItems: 'center', textAlign: 'center' } },
      h('div', { class: 'test-ring', style: { background: 'conic-gradient(var(--accent) ' + deg + 'deg, var(--surface-2) 0)' } }, h('div', null, h('b', { class: 'num' }, pct + '%'))),
      h('p', null, msg),
      h('div', { class: 'report', style: { gridTemplateColumns: 'repeat(3, 1fr)', width: '100%' } },
        h('div', null, h('b', { style: { color: 'var(--good)' } }, t.right), h('span', null, 'верно')),
        h('div', null, h('b', { style: { color: 'var(--bad)' } }, n - t.right), h('span', null, 'ошибок')),
        h('div', null, h('b', { class: 'num' }, fmt(sec)), h('span', null, 'время'))),
      t.almost ? h('p', { class: 'small muted' }, 'С опечаткой засчитано: ' + t.almost + '.') : null));
    if (wrong.length) main.append(h('div', { class: 'card stack' }, h('h3', null, 'Ошибки'),
      h('div', { class: 'wlist' }, wrong.map(w => App.wordItem(w, Date.now()))),
      h('button', { class: 'btn primary block', onclick: () => Train.startPrep({ wordIds: wrong.map(w => w.id), types: ['ruEn', 'enRu', 'flash'], mode: 'mistakes', title: 'Работа над ошибками' }) }, 'Потренировать ошибки')));
    main.append(h('div', { class: 'stack' },
      h('button', { class: 'btn block', onclick: () => go('test') }, 'Пройти ещё раз'),
      h('button', { class: 'btn ghost block', onclick: () => go('train') }, 'Готово')));
  }

  window.WordTest = { learned };
})();
