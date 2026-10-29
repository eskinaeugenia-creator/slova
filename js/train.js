/* Мои слова — тренировки: «Мои 15 минут», «Подготовка к уроку», работа над ошибками, упражнения. */
(function () {
  'use strict';
  const C = window.Core;
  const { S, h, $, icon, toast, dialog, go, routes, screen, Speech, saveWord, logAnswer, wordsArr, setName, todayStats } = window.App;

  const TYPES = {
    flash: { label: 'Карточка: вспомнить и перевернуть', dir: 'recog' },
    enRu: { label: 'Английское → выбрать перевод', dir: 'recog' },
    listenChoice: { label: 'Услышать → выбрать значение', dir: 'recog', sound: true },
    ruEn: { label: 'Перевод → написать по-английски', dir: 'recall' },
    listenWrite: { label: 'Услышать → написать', dir: 'recall', sound: true },
    gap: { label: 'Вставить слово в предложение', dir: 'recall' },
    build: { label: 'Собрать предложение', dir: null },
    match: { label: 'Подобрать пары', dir: null },
  };
  let cur = null; // текущее занятие

  const soundOn = () => S.settings.sound && Speech.supported;
  const trainable = () => wordsArr().filter(w => !w.archived && w.ru);
  function distractorsFor(w, n) {
    const kr = C.keyRu(w.ru), ke = C.keyEn(w.en);
    const pool = trainable().filter(x => x.id !== w.id && C.keyRu(x.ru) !== kr && C.keyEn(x.en) !== ke);
    const same = C.shuffle(pool.filter(x => w.pos && x.pos === w.pos));
    const rest = C.shuffle(pool.filter(x => !(w.pos && x.pos === w.pos)));
    const out = []; const seenRu = new Set([kr]);
    for (const x of same.concat(rest)) { const k = C.keyRu(x.ru); if (seenRu.has(k)) continue; seenRu.add(k); out.push(x); if (out.length >= n) break; }
    return out;
  }
  const canChoice = (w) => distractorsFor(w, 2).length >= 2;
  const hasGap = (w) => !!(w.example && C.findInSentence(w.example, w.en));
  const canBuild = (w) => { const t = C.tokenize(w.example).filter(x => !/^[.,!?;:]$/.test(x)); return w.example && t.length >= 3 && t.length <= 9; };
  function applicable(type, w) {
    if (TYPES[type].sound && !soundOn()) return false;
    if ((type === 'enRu' || type === 'listenChoice') && !canChoice(w)) return false;
    if (type === 'gap' && !hasGap(w)) return false;
    if (type === 'build' && !canBuild(w)) return false;
    return true;
  }
  // Выбор упражнения: сначала узнавание и подсказки, потом самостоятельное вспоминание
  function pickType(w, dir, allowed) {
    const ok = (t) => (!allowed || allowed.includes(t)) && applicable(t, w);
    const card = w.srs[dir];
    const reps = card ? card.reps : 0;
    let pref;
    if (dir === 'recog') pref = reps < 2 ? ['enRu', 'listenChoice', 'flash'] : C.shuffle(['flash', 'listenChoice', 'enRu']);
    else pref = reps === 0 ? ['gap', 'ruEn', 'listenWrite'] : C.shuffle(['ruEn', 'listenWrite', 'gap', 'ruEn']);
    const t = pref.find(ok);
    if (t) return t;
    // если направления нет среди разрешённых — любое разрешённое
    return (allowed || Object.keys(TYPES)).find(x => TYPES[x].dir && ok(x)) || (dir === 'recog' ? 'flash' : 'ruEn');
  }

  // ---------- Сборка занятий ----------
  function startDaily() {
    const { plan } = todayStats();
    const queue = [];
    plan.fresh.forEach(id => { const w = S.words.get(id); queue.push({ type: 'intro', wordId: id }); queue.push({ type: pickType(w, 'recog'), wordId: id, dir: 'recog' }); });
    // новые слова не идут подряд: перемешиваем повторения между ними
    const reviews = plan.portion.map(it => ({ type: pickType(S.words.get(it.wordId), it.dir), wordId: it.wordId, dir: it.dir }));
    const mixed = interleave(queue, reviews);
    addExtras(mixed);
    begin({ mode: 'daily', title: 'Мои ' + S.settings.minutes + ' минут', queue: mixed });
  }
  function interleave(fresh, reviews) {
    if (!fresh.length) return reviews;
    const out = []; const pairs = [];
    for (let i = 0; i < fresh.length; i += 2) pairs.push(fresh.slice(i, i + 2));
    const gap = Math.max(1, Math.floor(reviews.length / (pairs.length + 1)));
    let r = 0;
    pairs.forEach(p => { out.push(...reviews.slice(r, r + gap)); r += gap; out.push(...p); });
    out.push(...reviews.slice(r));
    return out;
  }
  // Немного разнообразия без влияния на расписание: пары и сборка предложения
  function addExtras(queue) {
    const ids = [...new Set(queue.filter(q => q.dir === 'recog').map(q => q.wordId))];
    if (ids.length >= 4) queue.push({ type: 'match', wordIds: C.shuffle(ids).slice(0, 5) });
    const b = C.shuffle([...new Set(queue.map(q => q.wordId).filter(Boolean))]).map(id => S.words.get(id)).find(w => w && w.srs.recog && w.srs.recog.reps && canBuild(w));
    if (b && queue.length >= 6) queue.splice(Math.floor(queue.length * 0.6), 0, { type: 'build', wordId: b.id });
  }
  function startPrep(o) {
    // o: { wordIds, types, limit }
    let ids = C.shuffle(o.wordIds).slice(0, o.limit || 9999);
    const queue = [];
    const choiceTypes = o.types.filter(t => t !== 'match');
    ids.forEach(id => {
      const w = S.words.get(id);
      if (!(w.srs.recog && w.srs.recog.reps) && o.intro) queue.push({ type: 'intro', wordId: id });
      const opts = choiceTypes.filter(t => applicable(t, w));
      if (!opts.length) return;
      const t = opts[Math.floor(Math.random() * opts.length)];
      queue.push({ type: t, wordId: id, dir: TYPES[t].dir });
    });
    if (o.types.includes('match')) {
      const pool = C.shuffle(ids.filter(id => S.words.get(id).ru));
      for (let i = 0; i + 3 <= pool.length && i < 15; i += 5) queue.push({ type: 'match', wordIds: pool.slice(i, i + 5) });
    }
    if (!queue.length) { toast('Для выбранных упражнений не хватает данных (нужны перевод, пример или звук)'); return; }
    begin({ mode: o.mode || 'prep', title: o.title || 'Подготовка к уроку', queue });
  }
  function mistakesWordIds(days) {
    return DB.all('logs').then(logs => {
      const since = Date.now() - (days || 7) * C.DAY;
      const ids = new Set(logs.filter(l => l.ts >= since && l.grade === 1).map(l => l.wordId).filter(Boolean));
      wordsArr().forEach(w => { if (!w.archived && w.ru && C.wordStatus(w, Date.now()) === 'hard') ids.add(w.id); });
      return [...ids].filter(id => { const w = S.words.get(id); return w && !w.archived && w.ru; });
    }).catch(() => []);
  }

  // ---------- Ход занятия ----------
  function begin(sess) {
    cur = Object.assign({ idx: 0, results: [], wrongIds: new Set(), requeued: new Set(), started: Date.now(), firstTry: 0, answered: 0 }, sess);
    S.ui.sessionBack = location.hash || '#today';
    if (location.hash !== '#session') location.hash = 'session'; else render();
  }
  routes.session = function () { if (!cur) { go('today'); return; } render(); };
  function active() { return !!cur; }
  async function abort(silent) {
    if (!cur) return;
    const s = cur; cur = null;
    await saveSession(s);
    if (!silent) go(S.ui.sessionBack ? S.ui.sessionBack.slice(1) : 'today');
  }
  async function saveSession(s) {
    if (!s.answered) return;
    const rec = { id: C.uid(), ts: s.started, mode: s.mode, n: s.answered, correct: s.firstTry, durationSec: Math.min(Math.round((Date.now() - s.started) / 1000), 60 * 90) };
    try { await DB.put('sessions', rec); } catch (e) { /* не критично */ }
  }

  function render() {
    const root = $('#app'); root.innerHTML = '';
    if (!cur) return;
    if (cur.idx >= cur.queue.length) return finish();
    const step = cur.queue[cur.idx];
    const pct = Math.round(cur.idx / cur.queue.length * 100);
    const wrap = h('div', { class: 'session' });
    wrap.append(h('div', { class: 'sbar' },
      h('button', { class: 'icon-btn', 'aria-label': 'Закончить занятие', onclick: async () => {
        const ok = cur.answered ? await dialog({ title: 'Закончить занятие?', text: 'Все ответы уже сохранены. Остаток можно пройти позже.', ok: 'Закончить', cancel: 'Продолжить' }) : true;
        if (ok) abort(); } }, icon('close')),
      h('div', { class: 'meter', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: { width: pct + '%' } })),
      h('span', { class: 'small muted num' }, (cur.idx + 1) + '/' + cur.queue.length)));
    const body = h('div', { class: 'sbody' });
    wrap.append(body); root.append(wrap);
    const w = step.wordId ? S.words.get(step.wordId) : null;
    if (step.wordId && !w) { next(); return; }
    const ex = EX[step.type] || EX.flash;
    ex(body, w, step);
  }
  function next() { if (!cur) return; cur.idx++; window.scrollTo(0, 0); render(); }

  // Записать ответ: расписание FSRS, статистика слова, журнал
  async function record(step, grade, info) {
    info = info || {};
    const w = step.wordId && S.words.get(step.wordId);
    if (!cur) return;
    const retry = !!step.retry;
    if (!retry && step.type !== 'intro') { cur.answered++; if (grade >= 3) cur.firstTry++; }
    if (!w) return;
    const now = Date.now();
    let scheduled = false;
    if (step.dir && !retry && !info.noSchedule) {
      const card = w.srs[step.dir];
      if (C.shouldSchedule(card, grade, now)) {
        w.srs[step.dir] = C.review(card, grade, now, S.settings.retention);
        scheduled = true;
        if (step.dir === 'recog' && (!card || !card.reps)) w.firstSeen = now;
      }
    }
    if (!retry && step.type !== 'intro') {
      w.stats = w.stats || { right: 0, wrong: 0, hints: 0, hist: [] };
      if (grade === 1) w.stats.wrong++; else w.stats.right++;
      if (info.hinted) w.stats.hints++;
      w.stats.hist = (w.stats.hist || []).concat(grade === 1 ? 0 : 1).slice(-5);
      w.stats.recentWrong = w.stats.hist.filter(x => x === 0).length;
      if (grade === 1) cur.wrongIds.add(w.id);
    }
    await saveWord(w, { quiet: true });
    await logAnswer({ wordId: w.id, dir: step.dir || null, type: step.type, grade, sched: scheduled, mode: cur ? cur.mode : '', hinted: !!info.hinted, retry });
    // ошибка → слово вернётся в этом занятии ещё раз (в другом упражнении, без влияния на расписание)
    if (grade === 1 && cur && !cur.requeued.has(w.id) && step.dir) {
      cur.requeued.add(w.id);
      const t = step.dir === 'recall' ? pickType(w, 'recall') : (applicable('enRu', w) ? 'enRu' : 'flash');
      const pos = Math.min(cur.queue.length, cur.idx + 4);
      cur.queue.splice(pos, 0, { type: t, wordId: w.id, dir: step.dir, retry: true });
    }
  }

  // ---------- Общие элементы упражнений ----------
  function task(text) { return h('div', { class: 'task' }, text); }
  function picEl(w) { return w.image ? h('div', { class: 'pic' }, h('img', { src: w.image, alt: '' })) : w.emoji ? h('div', { class: 'pic' }, w.emoji) : null; }
  function speakBig(text, autoplay) {
    const b = h('button', { class: 'speak-big', 'aria-label': 'Прослушать', onclick: () => Speech.say(text) }, icon('speaker'));
    if (autoplay && S.settings.autoplay) setTimeout(() => Speech.say(text), 250);
    return b;
  }
  function helperRow(...btns) { return h('div', { class: 'helpers' }, btns.filter(Boolean)); }
  function nextBtn(label) { const b = h('button', { class: 'btn primary big block', onclick: next }, label || 'Дальше'); setTimeout(() => b.focus(), 30); return b; }
  function cardSummary(w) {
    return h('div', { class: 'stack', style: { gap: '4px' } },
      h('div', null, h('b', { lang: 'en' }, w.en), ' — ', w.ru),
      w.example ? h('div', { class: 'small muted', lang: 'en' }, w.example + (w.exampleRu ? ' — ' + w.exampleRu : '')) : null,
      w.comment ? h('div', { class: 'small' }, 'Мой комментарий: ' + w.comment) : null);
  }
  // Необязательный таймер для игровых упражнений
  function gameTimer(body, onTimeout) {
    if (!S.settings.timer) return { stop() {} };
    const bar = h('i', { style: { width: '100%' } });
    body.prepend(h('div', { class: 'timer' }, bar));
    const sec = S.settings.timerSec || 12;
    requestAnimationFrame(() => { bar.style.transitionDuration = sec + 's'; bar.style.width = '0%'; });
    const t = setTimeout(onTimeout, sec * 1000);
    return { stop() { clearTimeout(t); bar.style.transitionDuration = '0s'; } };
  }

  // ---------- Упражнения ----------
  const EX = {};

  // Знакомство с новым словом
  EX.intro = function (body, w, step) {
    body.append(task('Новое слово'),
      h('div', { class: 'prompt' }, picEl(w), h('div', { class: 'big', lang: 'en' }, w.en), soundOn() ? App.sayButtons(w.en) : null,
        h('div', { class: 'mid' }, w.ru), w.alt ? h('div', { class: 'small muted' }, 'Ещё: ' + w.alt) : null,
        w.example ? h('div', { class: 'stack', style: { gap: '2px' } }, h('div', { lang: 'en', style: { fontWeight: 550 } }, w.example), w.exampleRu ? h('div', { class: 'small muted' }, w.exampleRu) : null, soundOn() ? h('button', { class: 'btn ghost sm', onclick: () => Speech.say(w.example) }, icon('speaker'), 'Пример') : null) : null,
        w.comment ? h('div', { class: 'small' }, w.comment) : null),
      h('div', { class: 'actions' },
        h('button', { class: 'btn primary big block', onclick: next }, 'Понятно, дальше'),
        h('button', { class: 'btn ghost block', onclick: async () => {
          // «Уже знаю»: узнавание сразу с оценкой «легко», упражнение на узнавание пропускаем
          await record({ wordId: w.id, dir: 'recog', type: 'intro' }, 4);
          const n = cur.queue[cur.idx + 1]; if (n && n.wordId === w.id && n.dir === 'recog') cur.queue.splice(cur.idx + 1, 1);
          next(); } }, 'Я это уже знаю')));
    if (soundOn() && S.settings.autoplay) setTimeout(() => Speech.say(w.en), 250);
  };

  // 1) Карточка с самооценкой
  EX.flash = function (body, w, step) {
    const back = h('div', { class: 'stack', hidden: true, style: { justifyItems: 'center' } }, picEl(w), h('div', { class: 'mid' }, w.ru), w.alt ? h('div', { class: 'small muted' }, 'Ещё: ' + w.alt) : null,
      w.example ? h('div', { class: 'small', lang: 'en' }, w.example) : null, w.exampleRu ? h('div', { class: 'small muted' }, w.exampleRu) : null);
    const actions = h('div', { class: 'actions' });
    body.append(task('Вспомните перевод, потом переверните карточку'),
      h('div', { class: 'prompt' }, h('div', { class: 'big', lang: 'en' }, w.en), soundOn() ? speakBig(w.en, true) : null, back), actions);
    const show = h('button', { class: 'btn primary big block', onclick: () => {
      back.hidden = false; actions.innerHTML = '';
      const r = (g, label, sub, cls) => h('button', { class: 'btn ' + (cls || ''), onclick: async () => { await record(step, g); next(); } }, label, h('small', null, sub));
      actions.append(h('p', { class: 'small muted', style: { textAlign: 'center' } }, 'Насколько легко вспомнили?'),
        h('div', { class: 'rate' }, r(1, 'Не вспомнила', 'повторим скоро'), r(2, 'С трудом', ''), r(3, 'Вспомнила', '', 'primary'), r(4, 'Легко', 'реже')));
    } }, 'Показать ответ');
    actions.append(show);
    setTimeout(() => show.focus(), 30);
  };

  // 2) и 4) Выбор перевода (по тексту или на слух)
  function choiceEx(listen) {
    return function (body, w, step) {
      const opts = C.shuffle([w].concat(distractorsFor(w, 3)));
      const list = h('div', { class: 'options' });
      const fb = h('div');
      const actions = h('div', { class: 'actions' });
      let done = false;
      const timer = gameTimer(body, () => { if (done) return; done = true; reveal(null, true); });
      body.append(task(listen ? 'Послушайте и выберите значение' : 'Выберите перевод'),
        h('div', { class: 'prompt' }, listen ? speakBig(w.en, true) : h('div', { class: 'big', lang: 'en' }, w.en), !listen && soundOn() ? h('button', { class: 'btn ghost sm', onclick: () => Speech.say(w.en) }, icon('speaker'), 'Произнести') : null),
        list, fb, actions);
      opts.forEach(o => list.append(h('button', { class: 'opt', onclick: (e) => pick(o, e.currentTarget) }, o.ru)));
      actions.append(helperRow(listen ? h('button', { class: 'btn sm', onclick: () => Speech.say(w.en, true) }, icon('slow'), 'Медленнее') : null,
        h('button', { class: 'btn sm', onclick: () => { if (!done) { done = true; timer.stop(); reveal(null); } } }, 'Не знаю')));
      async function pick(o, el) {
        if (done) return; done = true; timer.stop();
        if (o.id === w.id) {
          el.classList.add('right'); [...list.children].forEach(b => b.disabled = true);
          await record(step, 3);
          fb.append(h('div', { class: 'feedback ok' }, h('div', { class: 'title' }, 'Верно!'), listen ? h('div', null, h('b', { lang: 'en' }, w.en), ' — ', w.ru) : null));
          actions.innerHTML = ''; actions.append(nextBtn());
        } else { el.classList.add('wrong'); reveal(o); }
      }
      async function reveal(wrongPick, timeout) {
        [...list.children].forEach((b, i) => { b.disabled = true; if (opts[i].id === w.id) b.classList.add('right'); });
        if (!timeout) await record(step, 1);
        fb.innerHTML = '';
        fb.append(h('div', { class: 'feedback ' + (timeout ? 'typo' : 'no') },
          h('div', { class: 'title' }, timeout ? 'Время вышло — ничего страшного' : wrongPick ? 'Не совсем' : 'Вот ответ'),
          wrongPick ? h('div', { class: 'small' }, '«' + wrongPick.ru + '» — это ', h('b', { lang: 'en' }, wrongPick.en), '.') : null,
          cardSummary(w), h('div', { class: 'small muted' }, timeout ? 'Без последствий для расписания. Слово можно пройти ещё раз.' : 'Слово вернётся ещё раз в этом занятии.')));
        actions.innerHTML = '';
        actions.append(timeout ? h('button', { class: 'btn block', onclick: () => { cur.queue.splice(cur.idx + 1, 0, Object.assign({}, step)); next(); } }, 'Повторить это задание') : null, nextBtn());
      }
    };
  }
  EX.enRu = choiceEx(false);
  EX.listenChoice = choiceEx(true);

  // 3), 5), 6) Письменный ответ: по переводу, на слух, в предложение
  function writeEx(kind) {
    return function (body, w, step) {
      const gap = kind === 'gap' ? C.findInSentence(w.example, w.en) : null;
      const expected = gap ? gap.text : w.en;
      const extra = gap && C.norm(gap.text) !== C.norm(gap.base) ? [] : [];
      let hintLevel = 0, done = false, retrying = false;
      const sameRu = trainable().some(x => x.id !== w.id && C.keyRu(x.ru) === C.keyRu(w.ru));
      const input = h('input', { class: 'input big', id: 'ans', autocapitalize: 'off', autocorrect: 'off', autocomplete: 'off', spellcheck: 'false', lang: 'en', enterkeyhint: 'done', placeholder: 'Напишите по-английски', 'aria-label': 'Ответ' });
      const hintBox = h('div', { class: 'small muted', style: { textAlign: 'center' } });
      const fb = h('div');
      const actions = h('div', { class: 'actions' });
      let prompt;
      if (kind === 'ruEn') prompt = h('div', { class: 'prompt' }, picEl(w), h('div', { class: 'mid' }, w.ru),
        sameRu && w.example ? h('div', { class: 'small muted' }, 'Контекст: ', h('span', { lang: 'en' }, blank(w.example, w.en))) : sameRu && w.comment ? h('div', { class: 'small muted' }, w.comment) : null);
      else if (kind === 'listenWrite') prompt = h('div', { class: 'prompt' }, speakBig(w.en, true));
      else prompt = h('div', { class: 'prompt' }, h('div', { class: 'gap-sentence', lang: 'en' }, ...gapParts(w.example, gap)), w.exampleRu ? h('div', { class: 'small muted' }, w.exampleRu) : null,
        h('div', { class: 'small' }, 'Подсказка: ', h('b', null, w.ru)));
      body.append(task({ ruEn: 'Напишите по-английски', listenWrite: 'Послушайте и напишите', gap: 'Вставьте пропущенное слово' }[kind]), prompt,
        h('form', { class: 'stack', onsubmit: e => { e.preventDefault(); check(); } }, input, hintBox, fb, actions));
      drawActions();
      setTimeout(() => input.focus(), 60);
      function drawActions() {
        actions.innerHTML = '';
        actions.append(h('button', { class: 'btn primary big block', type: 'submit' }, retrying ? 'Проверить ещё раз' : 'Проверить'),
          helperRow(!retrying ? h('button', { class: 'btn sm', type: 'button', onclick: hint }, 'Подсказка') : null,
            kind === 'listenWrite' || soundOn() && kind !== 'ruEn' ? h('button', { class: 'btn sm', type: 'button', onclick: () => Speech.say(kind === 'gap' ? w.example : w.en, true) }, icon('slow'), 'Прослушать ещё раз') : null,
            !retrying ? h('button', { class: 'btn sm', type: 'button', onclick: () => giveUp() }, 'Не знаю') : h('button', { class: 'btn sm', type: 'button', onclick: next }, 'Пропустить')));
      }
      function hint() {
        hintLevel++;
        const letters = expected.split('');
        if (hintLevel === 1 && kind === 'ruEn' && w.example && C.findInSentence(w.example, w.en)) hintBox.textContent = 'В предложении: ' + blank(w.example, w.en);
        else if (hintLevel <= 2) hintBox.textContent = 'Начинается на «' + expected[0] + '», букв: ' + expected.replace(/[^A-Za-z]/g, '').length;
        else hintBox.textContent = letters.map((c, i) => i < Math.ceil(letters.length / 2) || c === ' ' ? c : '_').join(' ');
        if (hintLevel === 1 && !(kind === 'ruEn' && w.example && C.findInSentence(w.example, w.en))) hintLevel = 2;
        input.focus();
      }
      async function giveUp() {
        if (done) return; done = true;
        await record(step, 1);
        showWrong('', null);
      }
      async function check() {
        const val = input.value;
        if (!val.trim()) { input.focus(); return; }
        const r = C.checkAnswer(val, expected, gap ? [w.en] : extra);
        // в предложении базовая форма вместо нужной (rent вместо rented) — почти верно
        if (gap && r.result === 'wrong' && C.checkAnswer(val, w.en).result !== 'wrong') { r.result = 'typo'; r.formNote = true; }
        if (retrying) {
          if (r.result === 'correct' || r.result === 'typo') { fb.innerHTML = ''; fb.append(h('div', { class: 'feedback ok' }, h('div', { class: 'title' }, 'Теперь верно'))); actions.innerHTML = ''; actions.append(nextBtn()); }
          else { fb.innerHTML = ''; fb.append(diffBox(val, r)); input.select(); }
          return;
        }
        if (done) return; done = true;
        const hinted = hintLevel > 0;
        if (r.result === 'correct') {
          await record(step, hinted ? 2 : 3, { hinted });
          fb.append(h('div', { class: 'feedback ok' }, h('div', { class: 'title' }, hinted ? 'Верно, с подсказкой' : 'Верно!'), kind !== 'ruEn' ? h('div', null, w.ru) : null));
          input.disabled = true; actions.innerHTML = ''; actions.append(nextBtn());
          if (soundOn()) Speech.say(w.en);
        } else if (r.result === 'typo') {
          await record(step, 2, { hinted });
          fb.append(h('div', { class: 'feedback typo' }, h('div', { class: 'title' }, r.formNote ? 'Почти: нужна форма из предложения' : 'Почти! Небольшая опечатка'),
            h('div', { class: 'diff', lang: 'en' }, diffSpans(r.diff || C.diffChars(val.trim(), r.expected))),
            h('div', { class: 'small' }, 'Правильно: ', h('b', { lang: 'en' }, r.expected), r.formNote ? ' (базовая форма — ' + w.en + ')' : ''),
            h('div', { class: 'tiny muted' }, 'Зелёное подчёркнутое — пропущенные буквы, зачёркнутое — лишние. Засчитано как «с трудом».')));
          input.disabled = true; actions.innerHTML = ''; actions.append(nextBtn());
        } else {
          await record(step, 1, { hinted });
          showWrong(val, r);
        }
      }
      function showWrong(val, r) {
        fb.innerHTML = '';
        fb.append(val ? diffBox(val, r) : h('div', { class: 'feedback no' }, h('div', { class: 'title' }, 'Правильный ответ'), h('div', { class: 'diff', lang: 'en' }, expected)));
        fb.append(h('div', { class: 'small', style: { marginTop: '8px' } }, cardSummary(w)));
        hintBox.textContent = '';
        retrying = true; input.value = ''; input.placeholder = 'Напишите правильный ответ'; drawActions(); input.focus();
        if (soundOn()) Speech.say(expected);
      }
      function diffBox(val, r) {
        return h('div', { class: 'feedback no' }, h('div', { class: 'title' }, 'Пока не так'),
          h('div', { class: 'small' }, 'Ваш ответ с разметкой ошибок:'),
          h('div', { class: 'diff', lang: 'en' }, diffSpans(r.diff || C.diffChars(val.trim(), expected))),
          h('div', { class: 'small' }, 'Правильно: ', h('b', { lang: 'en' }, expected)),
          h('div', { class: 'tiny muted' }, 'Напишите правильный вариант ещё раз — так слово лучше запомнится.'));
      }
    };
  }
  function diffSpans(ops) { return ops.map(o => o.t === 'ok' ? o.c : h('span', { class: o.t }, o.c === ' ' ? '·' : o.c)); }
  function blank(sentence, en) { const g = C.findInSentence(sentence, en); return g ? sentence.slice(0, g.start) + '___' + sentence.slice(g.end) : sentence; }
  function gapParts(sentence, g) { return [sentence.slice(0, g.start), h('span', { class: 'blank' }, ' '), sentence.slice(g.end)]; }
  EX.ruEn = writeEx('ruEn');
  EX.listenWrite = writeEx('listenWrite');
  EX.gap = writeEx('gap');

  // 7) Собрать предложение (тренирует применение; на расписание не влияет)
  EX.build = function (body, w, step) {
    const target = C.tokenize(w.example).filter(x => !/^[.,!?;:]$/.test(x));
    let tiles = C.shuffle(target.map((t, i) => ({ t, i })));
    if (tiles.map(x => x.t).join(' ') === target.join(' ')) tiles = tiles.reverse();
    const chosen = [];
    const line = h('div', { class: 'answer-line', 'aria-live': 'polite' });
    const pool = h('div', { class: 'tiles' });
    const fb = h('div'), actions = h('div', { class: 'actions' });
    body.append(task('Соберите предложение из слов'),
      h('div', { class: 'prompt' }, h('div', { class: 'mid' }, w.exampleRu || ('Предложение со словом «' + w.en + '»'))),
      line, pool, fb, actions);
    function draw() {
      line.innerHTML = ''; pool.innerHTML = '';
      chosen.forEach((c, k) => line.append(h('button', { class: 'tile', onclick: () => { chosen.splice(k, 1); draw(); } }, c.t)));
      tiles.forEach(c => pool.append(h('button', { class: 'tile' + (chosen.includes(c) ? ' used' : ''), onclick: () => { if (!chosen.includes(c)) { chosen.push(c); draw(); } } }, c.t)));
    }
    draw();
    let tries = 0;
    actions.append(h('button', { class: 'btn primary big block', onclick: async () => {
      if (chosen.length < target.length) return toast('Используйте все слова');
      const ok = C.norm(chosen.map(c => c.t).join(' ')) === C.norm(target.join(' '));
      tries++;
      fb.innerHTML = '';
      if (ok) {
        await record(step, tries === 1 ? 3 : 2, { noSchedule: true });
        fb.append(h('div', { class: 'feedback ok' }, h('div', { class: 'title' }, 'Верно!'), h('div', { lang: 'en' }, w.example)));
        actions.innerHTML = ''; actions.append(nextBtn()); if (soundOn()) Speech.say(w.example);
      } else {
        if (tries === 1) await record(step, 1, { noSchedule: true });
        fb.append(h('div', { class: 'feedback no' }, h('div', { class: 'title' }, 'Порядок другой'), h('div', null, 'Правильно: ', h('b', { lang: 'en' }, w.example)), h('div', { class: 'tiny muted' }, 'Нажмите на слова сверху, чтобы вернуть их, и соберите ещё раз.')));
        if (tries >= 2) { actions.innerHTML = ''; actions.append(nextBtn()); }
      }
    } }, 'Проверить'), helperRow(soundOn() ? h('button', { class: 'btn sm', onclick: () => Speech.say(w.example, true) }, icon('slow'), 'Прослушать') : null, h('button', { class: 'btn sm', onclick: next }, 'Пропустить')));
  };

  // 8) Подобрать пары (разминка; на расписание не влияет)
  EX.match = function (body, w, step) {
    const ws = step.wordIds.map(id => S.words.get(id)).filter(x => x && x.ru);
    const uniq = []; const seen = new Set();
    ws.forEach(x => { const k = C.keyRu(x.ru); if (!seen.has(k)) { seen.add(k); uniq.push(x); } });
    if (uniq.length < 3) { next(); return; }
    const left = C.shuffle(uniq), right = C.shuffle(uniq);
    let picked = null, errors = 0, left2 = uniq.length;
    const colL = h('div', { class: 'col' }), colR = h('div', { class: 'col' });
    const fb = h('div'), actions = h('div', { class: 'actions' });
    const timer = gameTimer(body, () => { fb.innerHTML = ''; fb.append(h('div', { class: 'feedback typo' }, h('div', { class: 'title' }, 'Время вышло'), uniq.map(x => h('div', { class: 'small' }, x.en + ' — ' + x.ru)))); actions.innerHTML = ''; actions.append(nextBtn()); });
    body.append(task('Соедините слово и перевод'), h('div', { class: 'pairs' }, colL, colR), fb, actions);
    left.forEach(x => colL.append(h('button', { class: 'opt', lang: 'en', 'data-id': x.id, onclick: (e) => tap('L', x, e.currentTarget) }, x.en)));
    right.forEach(x => colR.append(h('button', { class: 'opt', 'data-id': x.id, onclick: (e) => tap('R', x, e.currentTarget) }, x.ru)));
    actions.append(helperRow(h('button', { class: 'btn sm', onclick: () => { timer.stop(); next(); } }, 'Пропустить')));
    function tap(side, x, el) {
      if (side === 'L' && soundOn()) Speech.say(x.en);
      if (!picked || picked.side === side) { if (picked) picked.el.classList.remove('picked'); picked = { side, x, el }; el.classList.add('picked'); return; }
      if (picked.x.id === x.id) {
        picked.el.classList.add('done'); el.classList.add('done'); picked = null; left2--;
        if (!left2) {
          timer.stop();
          fb.append(h('div', { class: 'feedback ok' }, h('div', { class: 'title' }, errors ? 'Готово! Ошибок: ' + errors : 'Все пары верно!')));
          logAnswer({ wordId: null, dir: null, type: 'match', grade: errors ? 2 : 3, sched: false, mode: cur.mode });
          if (cur) { cur.answered++; if (!errors) cur.firstTry++; }
          actions.innerHTML = ''; actions.append(nextBtn());
        }
      } else {
        errors++; el.classList.add('wrong'); picked.el.classList.remove('picked');
        const e2 = el; setTimeout(() => e2.classList.remove('wrong'), 600); picked = null;
      }
    }
  };

  // ---------- Итог ----------
  async function finish() {
    const s = cur; cur = null;
    await saveSession(s);
    const root = $('#app'); root.innerHTML = '';
    const main = h('main', { class: 'main no-nav', style: { paddingTop: '24px' } });
    root.append(main);
    const pct = s.answered ? Math.round(s.firstTry / s.answered * 100) : 0;
    const mins = Math.max(1, Math.round((Date.now() - s.started) / 60000));
    const wrong = [...s.wrongIds].map(id => S.words.get(id)).filter(Boolean);
    const { plan } = todayStats();
    main.append(h('div', { class: 'card stack' }, h('h1', null, 'Занятие готово'),
      h('div', { class: 'report', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
        h('div', null, h('b', null, s.answered), h('span', null, 'заданий')),
        h('div', null, h('b', null, pct + '%'), h('span', null, 'верно сразу')),
        h('div', null, h('b', null, mins), h('span', null, 'мин'))),
      wrong.length ? h('div', { class: 'stack' }, h('h3', null, 'Стоит обратить внимание'), h('div', { class: 'wlist' }, wrong.slice(0, 8).map(w => App.wordItem(w, Date.now())))) : h('p', { class: 'muted' }, 'Ошибок не было. Отлично!'),
      wrong.length ? h('button', { class: 'btn block', onclick: () => startPrep({ wordIds: wrong.map(w => w.id), types: ['ruEn', 'enRu', 'flash'], mode: 'mistakes', title: 'Работа над ошибками' }) }, 'Повторить ошибки сейчас') : null,
      s.mode === 'daily' && plan.portion.length ? h('button', { class: 'btn soft block', onclick: () => startDaily() }, 'Ещё порция (' + plan.portion.length + ')') : null,
      h('button', { class: 'btn primary big block', onclick: () => go('today') }, 'Готово')));
  }

  // ---------- Экран «Тренировки» ----------
  routes.train = async function () {
    const main = screen({ title: 'Тренировки', tab: 'train' });
    const words = trainable();
    if (!words.length) {
      main.append(h('div', { class: 'card empty' }, h('h2', null, 'Пока нечего тренировать'), h('p', { class: 'muted' }, 'Тренировки появятся, когда в словаре будут слова с переводом. Черновики без перевода сюда не попадают.'), h('a', { class: 'btn primary', href: '#add' }, 'Добавить слова')));
      return;
    }
    const { plan } = todayStats();
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Мои ' + S.settings.minutes + ' минут'),
      h('p', { class: 'small muted' }, 'Приложение само соберёт занятие: сначала повторения, которые пора сделать, потом немного новых слов. Сейчас: повторить ' + plan.portion.length + ', новых ' + plan.fresh.length + '.'),
      h('button', { class: 'btn primary big block', disabled: !(plan.portion.length + plan.fresh.length), onclick: startDaily }, plan.portion.length + plan.fresh.length ? 'Начать' : 'На сегодня всё сделано')));

    // Подготовка к уроку
    const prep = h('div', { class: 'card stack' });
    main.append(prep);
    const st = S.ui.prep || (S.ui.prep = { set: 'all', scope: 'all', types: ['flash', 'enRu', 'ruEn', 'gap', 'listenChoice'], limit: 20, picked: [] });
    function drawPrep() {
      prep.innerHTML = '';
      const setSel = h('select', { class: 'input', id: 'prep-set', onchange: () => { st.set = setSel.value; st.picked = []; drawPrep(); } }, h('option', { value: 'all' }, 'Все слова'), [...S.sets.values()].map(s => h('option', { value: s.id }, s.name)));
      setSel.value = st.set === 'all' || S.sets.has(st.set) ? st.set : 'all';
      const pool = words.filter(w => st.set === 'all' || w.setIds.includes(st.set));
      const recent = pool.filter(w => w.createdAt >= Date.now() - 7 * C.DAY);
      const scope = h('div', { class: 'seg' }, [['all', 'Весь набор (' + pool.length + ')'], ['recent', 'Новые за неделю (' + recent.length + ')'], ['pick', 'Выбрать слова']].map(([id, l]) => h('button', { 'aria-pressed': String(st.scope === id), onclick: () => { st.scope = id; drawPrep(); } }, l)));
      const pickBox = h('div', { class: 'stack', hidden: st.scope !== 'pick' });
      if (st.scope === 'pick') {
        pickBox.append(h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: () => { st.picked = pool.map(w => w.id); drawPrep(); } }, 'Выбрать все'), h('button', { class: 'btn sm', onclick: () => { st.picked = []; drawPrep(); } }, 'Снять')),
          h('div', { class: 'stack', style: { maxHeight: '280px', overflow: 'auto', gap: '4px' } }, pool.map(w => h('label', { class: 'switch', style: { minHeight: '40px' } }, h('span', { class: 'small' }, h('b', { lang: 'en' }, w.en), ' — ', w.ru),
            h('input', { type: 'checkbox', checked: st.picked.includes(w.id), onchange: e => { st.picked = e.target.checked ? st.picked.concat(w.id) : st.picked.filter(x => x !== w.id); } })))));
      }
      const typeBoxes = h('div', { class: 'stack', style: { gap: '2px' } }, Object.keys(TYPES).map(t => {
        const disabled = TYPES[t].sound && !soundOn();
        return h('label', { class: 'switch', style: { minHeight: '40px' } }, h('span', { class: 'small' + (disabled ? ' muted' : '') }, TYPES[t].label + (disabled ? ' (звук выключен)' : '')),
          h('input', { type: 'checkbox', disabled, checked: st.types.includes(t) && !disabled, onchange: e => { st.types = e.target.checked ? st.types.concat(t) : st.types.filter(x => x !== t); } }));
      }));
      const lim = h('select', { class: 'input', id: 'prep-limit', onchange: () => { st.limit = +lim.value; } }, [10, 20, 30, 50, 9999].map(n => h('option', { value: n }, n === 9999 ? 'Все выбранные слова' : n + ' слов')));
      lim.value = String(st.limit);
      prep.append(h('h2', null, 'Подготовка к уроку'),
        h('p', { class: 'small muted' }, 'Вы выбираете набор, слова и упражнения. Можно заниматься сколько угодно: повторы того же дня не «накручивают» прогресс — расписание учитывает только первый ответ за день, а ранние верные ответы просто записываются в историю.'),
        h('label', { class: 'field', for: 'prep-set' }, 'Набор', setSel), scope, pickBox,
        h('details', null, h('summary', null, 'Типы упражнений'), typeBoxes),
        h('label', { class: 'field', for: 'prep-limit' }, 'Сколько слов', lim),
        h('button', { class: 'btn primary big block', onclick: () => {
          const ids = st.scope === 'pick' ? st.picked : (st.scope === 'recent' ? recent : pool).map(w => w.id);
          if (!ids.length) return toast('Не выбрано ни одного слова');
          const types = st.types.filter(t => !(TYPES[t].sound && !soundOn()));
          if (!types.length) return toast('Выберите хотя бы один тип упражнений');
          startPrep({ wordIds: ids, types, limit: st.limit, intro: true });
        } }, 'Начать'));
    }
    drawPrep();

    const mist = await mistakesWordIds(7);
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Работа над ошибками'),
      h('p', { class: 'small muted' }, mist.length ? 'Слова с ошибками за последнюю неделю и сложные слова: ' + mist.length + '.' : 'Ошибок за последнюю неделю нет.'),
      h('button', { class: 'btn block', disabled: !mist.length, onclick: () => startPrep({ wordIds: mist, types: ['ruEn', 'gap', 'enRu', 'listenWrite'], limit: 20, mode: 'mistakes', title: 'Работа над ошибками' }) }, 'Повторить ошибки')));
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Подобрать пары'),
      h('p', { class: 'small muted' }, 'Быстрая разминка на 5 слов. На расписание повторений не влияет.'),
      h('button', { class: 'btn block', disabled: words.length < 3, onclick: () => startPrep({ wordIds: words.map(w => w.id), types: ['match'], limit: 15, mode: 'match', title: 'Пары' }) }, 'Играть')));
    main.append(h('div', { class: 'card flat stack' }, h('h3', null, 'Скоро: следующие этапы'),
      h('p', { class: 'small muted' }, 'Эти разделы ещё не работают и появятся в следующих версиях:'),
      h('ul', { class: 'small muted', style: { margin: 0, paddingLeft: '20px' } },
        h('li', null, 'Грамматика на ваших словах: am/is/are, do/does, Present Simple, вопросы и отрицания, артикли, предлоги, Past Simple.'),
        h('li', null, 'Ответ голосом (без оценки «акцента» — только распознанное слово).'),
        h('li', null, 'Короткие сценарные диалоги: аренда, кафе, спорт. Это будут заранее написанные сценарии, а не свободный разговор с ИИ.'))));
  };

  window.Train = { startDaily, startPrep, active, abort, TYPES };
})();
