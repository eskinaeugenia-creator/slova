/* Мои слова — прогресс, настройки, резервные копии, напоминание в календаре, демо-слова. */
(function () {
  'use strict';
  const C = window.Core;
  const { S, h, $, icon, toast, dialog, go, routes, screen, Speech, saveWord, saveWords, saveSet, saveSettings, newWord, wordsArr, ensureSet, APP_VERSION, DATA_FORMAT } = window.App;

  // ---------- Прогресс ----------
  routes.progress = async function () {
    const main = screen({ title: 'Прогресс', tab: 'progress' });
    const now = Date.now();
    const words = wordsArr().filter(w => !w.demo || true);
    if (!words.length) { main.append(h('div', { class: 'card empty' }, h('p', { class: 'muted' }, 'Статистика появится после первых слов и занятий.'), h('a', { class: 'btn primary', href: '#add' }, 'Добавить слова'))); return; }
    const act = words.filter(w => !w.archived);
    const cnt = (st) => act.filter(w => C.wordStatus(w, now) === st).length;
    const due = act.filter(w => C.wordDue(w, now)).length;
    const weekAgo = now - 7 * C.DAY;
    const recogOk = act.filter(w => w.srs.recog && w.srs.recog.reps && w.srs.recog.s >= 7).length;
    const recallOk = act.filter(w => w.srs.recall && w.srs.recall.reps && w.srs.recall.s >= 7).length;
    main.append(h('div', { class: 'kpis' },
      kpi(act.length, 'слов в словаре', words.filter(w => w.createdAt >= weekAgo).length + ' за неделю'),
      kpi(cnt('learning') + cnt('hard'), 'изучаются'),
      kpi(due, 'пора повторить'),
      kpi(cnt('solid'), 'закреплены', 'повторы продолжаются'),
      kpi(cnt('new'), 'ещё не начаты'),
      kpi(cnt('draft'), 'черновиков', 'без перевода')));
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Узнаю и вспоминаю сама'),
      h('p', { class: 'small muted' }, 'Узнать слово (выбрать перевод) проще, чем вспомнить и написать его самой. Поэтому они считаются отдельно.'),
      bar('Узнаю уверенно', recogOk, act.length), bar('Вспоминаю и пишу сама', recallOk, act.length),
      h('p', { class: 'tiny muted' }, '«Уверенно» — следующее повторение не раньше чем через неделю.')));

    let logs = [], sessions = [];
    try { [logs, sessions] = await Promise.all([DB.all('logs'), DB.all('sessions')]); } catch (e) { /* пусто */ }
    // Минуты за 14 дней
    const days = []; const sod = C.startOfDay(now);
    for (let i = 13; i >= 0; i--) {
      const d0 = sod - i * C.DAY, d1 = d0 + C.DAY;
      days.push({ d: new Date(d0), min: Math.round(sessions.filter(s => s.ts >= d0 && s.ts < d1).reduce((a, s) => a + (s.durationSec || 0), 0) / 60) });
    }
    const max = Math.max(S.settings.minutes, ...days.map(d => d.min));
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Минуты занятий за 2 недели'),
      h('div', { class: 'bars', role: 'img', 'aria-label': 'Минуты по дням: ' + days.map(d => d.min).join(', ') }, days.map(d => h('i', { title: d.d.toLocaleDateString('ru-RU') + ': ' + d.min + ' мин', style: { height: Math.max(2, d.min / max * 100) + '%', opacity: d.min ? 1 : .25 } }))),
      h('div', { class: 'bars-x' }, days.map(d => h('span', null, d.d.getDate()))),
      h('p', { class: 'small muted' }, 'Цель — около ' + S.settings.minutes + ' минут в день. Пропуски ничего не обнуляют.')));
    const recent = logs.filter(l => l.ts >= weekAgo && !l.retry && l.wordId);
    const okRate = recent.length ? Math.round(recent.filter(l => l.grade >= 2).length / recent.length * 100) : null;
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Результаты за неделю'),
      h('p', null, recent.length ? 'Ответов: ' + recent.length + ', верных: ' + okRate + '%. Занятий: ' + sessions.filter(s => s.ts >= weekAgo).length + '.' : 'На этой неделе занятий ещё не было.')));
    const hard = act.filter(w => (w.stats && w.stats.wrong) > 0).sort((a, b) => (b.stats.wrong - b.stats.right * .3) - (a.stats.wrong - a.stats.right * .3)).slice(0, 8);
    if (hard.length) main.append(h('div', { class: 'section-title' }, 'Слова, которые даются труднее'), h('div', { class: 'wlist' }, hard.map(w => App.wordItem(w, now))));
  };
  function kpi(v, label, sub) { return h('div', { class: 'kpi' }, h('b', null, v), h('span', null, label), sub ? h('span', { class: 'tiny' }, sub) : null); }
  function bar(label, v, total) {
    const p = total ? Math.round(v / total * 100) : 0;
    return h('div', { class: 'stack', style: { gap: '4px' } }, h('div', { class: 'row small', style: { justifyContent: 'space-between' } }, h('span', null, label), h('span', { class: 'num' }, v + ' из ' + total)), h('div', { class: 'meter' }, h('i', { style: { width: p + '%' } })));
  }

  // ---------- Файлы: скачать / поделиться / показать текстом ----------
  async function deliver(filename, text, mime) {
    const blob = new Blob([text], { type: mime });
    try {
      const file = new File([blob], filename, { type: mime });
      if (/iPhone|iPad|Android/i.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return true;
      }
    } catch (e) { if (e && e.name === 'AbortError') return false; }
    try {
      const a = h('a', { href: URL.createObjectURL(blob), download: filename });
      document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    } catch (e) { /* ниже — запасной путь */ }
    toast('Файл «' + filename + '» сохранён', { label: 'Не появился?', fn: () => showAsText(filename, text) });
    return true;
  }
  function showAsText(filename, text) {
    const ta = h('textarea', { class: 'input', rows: 10, readonly: true }, text.length > 400000 ? text.slice(0, 400000) : text);
    App.sheet('Текст файла', h('div', { class: 'stack' },
      h('p', { class: 'small muted' }, 'Если браузер не дал скачать файл, скопируйте текст и сохраните его в «Заметки» или в файл ' + filename + '.' + (text.length > 400000 ? ' Копия большая (картинки) — показана не целиком, используйте скачивание.' : '')),
      ta, h('button', { class: 'btn primary block', onclick: () => Add.copyText(text, 'Скопировано') }, 'Скопировать всё')));
  }
  const stamp = () => new Date().toISOString().slice(0, 10);

  // ---------- Резервная копия ----------
  async function buildBackup() {
    let logs = [], sessions = [];
    try { [logs, sessions] = await Promise.all([DB.all('logs'), DB.all('sessions')]); } catch (e) { /* пусто */ }
    return { app: 'slova', format: DATA_FORMAT, appVersion: APP_VERSION, exportedAt: new Date().toISOString(),
      settings: S.settings, sets: [...S.sets.values()], words: wordsArr(), logs, sessions };
  }
  async function exportBackup() {
    const b = await buildBackup();
    const ok = await deliver('slova-backup-' + stamp() + '.json', JSON.stringify(b), 'application/json');
    if (ok) { S.settings.lastBackup = Date.now(); S.settings.changesSinceBackup = 0; await saveSettings(); }
  }
  function csvCell(v) { v = String(v == null ? '' : v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  async function exportCSV() {
    const now = Date.now();
    const head = ['english', 'russian', 'other_meanings', 'part_of_speech', 'forms', 'example', 'example_ru', 'collocation', 'comment', 'sets', 'status', 'next_review'];
    const rows = wordsArr().map(w => {
      const nx = [w.srs.recog, w.srs.recall].filter(c => c && c.reps).map(c => c.due).sort()[0];
      return [w.en, w.ru, w.alt, w.pos, w.forms, w.example, w.exampleRu, w.collocation, w.comment, w.setIds.map(App.setName).join('; '), C.wordStatus(w, now), nx ? new Date(nx).toISOString().slice(0, 10) : ''];
    });
    const csv = '﻿' + [head].concat(rows).map(r => r.map(csvCell).join(',')).join('\n');
    deliver('slova-' + stamp() + '.csv', csv, 'text/csv');
  }
  function backupDue() {
    if (window.TG && TG.cloudOK) return null; // в Telegram словарь и так в облаке
    const n = wordsArr().filter(w => !w.demo).length;
    if (n < 5) return null;
    const changes = S.settings.changesSinceBackup || 0;
    const last = S.settings.lastBackup;
    const days = last ? Math.floor((Date.now() - last) / C.DAY) : null;
    if (!last && changes >= 5) return 'Копий ещё не было. Память браузера — не резервная копия: при очистке данных Safari слова пропадут.';
    if (last && days >= (S.settings.backupEveryDays || 7) && changes > 0) return 'Последняя копия — ' + days + ' ' + C.plural(days, 'день', 'дня', 'дней') + ' назад, с тех пор ' + changes + ' ' + C.plural(changes, 'изменение', 'изменения', 'изменений') + '.';
    return null;
  }
  // Восстановление: объединить (по умолчанию) или заменить всё
  async function restoreFlow(obj) {
    if (!obj || obj.app !== 'slova' || !Array.isArray(obj.words)) { toast('Это не резервная копия «Моих слов»'); return; }
    if (obj.format > DATA_FORMAT) { toast('Копия сделана более новой версией приложения. Обновите приложение.'); return; }
    const mode = h('div', { class: 'seg' });
    let m = 'merge';
    const drawMode = () => { mode.innerHTML = ''; [['merge', 'Объединить'], ['replace', 'Заменить всё']].forEach(([id, l]) => mode.append(h('button', { 'aria-pressed': String(m === id), onclick: () => { m = id; drawMode(); note.textContent = m === 'merge' ? 'Слова из копии добавятся к текущим. Для одинаковых слов останется версия с бо́льшим прогрессом. Ничего не удаляется.' : 'Текущий словарь будет полностью заменён копией. Сначала сохраните копию текущих данных, если они нужны.'; } }, l))); };
    const note = h('p', { class: 'small muted' }, 'Слова из копии добавятся к текущим. Для одинаковых слов останется версия с бо́льшим прогрессом. Ничего не удаляется.');
    drawMode();
    const ok = await dialog({ title: 'Восстановить из копии?', text: 'В копии от ' + (obj.exportedAt ? new Date(obj.exportedAt).toLocaleString('ru-RU') : '?') + ': слов ' + obj.words.length + ', наборов ' + (obj.sets || []).length + '.', ok: 'Восстановить', body: h('div', { class: 'stack' }, mode, note) });
    if (!ok) return;
    const rep = await restore(obj, m);
    toast('Готово: добавлено ' + rep.added + ', обновлено ' + rep.updated + ', без изменений ' + rep.kept);
    go('dict');
  }
  function reps(w) { return ((w.srs && w.srs.recog && w.srs.recog.reps) || 0) + ((w.srs && w.srs.recall && w.srs.recall.reps) || 0); }
  async function restore(obj, mode) {
    const rep = { added: 0, updated: 0, kept: 0 };
    if (mode === 'replace') {
      await DB.clear('words'); await DB.clear('sets'); await DB.clear('logs'); await DB.clear('sessions');
      S.words.clear(); S.sets.clear();
    }
    for (const s of obj.sets || []) if (!S.sets.has(s.id)) await saveSet(s);
    const byKey = new Map(wordsArr().map(w => [C.keyEn(w.en) + '|' + C.keyRu(w.ru), w]));
    const toSave = [];
    for (const w0 of obj.words) {
      const w = Object.assign({ setIds: [], stats: { right: 0, wrong: 0, hints: 0, hist: [] }, srs: { recog: null, recall: null } }, w0);
      const ex = S.words.get(w.id) || byKey.get(C.keyEn(w.en) + '|' + C.keyRu(w.ru));
      if (!ex) { S.words.set(w.id, w); toSave.push(w); rep.added++; continue; }
      // конфликт: берём более прогрессивное расписание и более свежий текст, наборы объединяем
      const better = reps(w) > reps(ex) ? w : ex;
      const newer = (w.updatedAt || 0) > (ex.updatedAt || 0) ? w : ex;
      const merged = Object.assign({}, newer, { id: ex.id, srs: better.srs, stats: better.stats, setIds: [...new Set((ex.setIds || []).concat(w.setIds || []))], createdAt: Math.min(ex.createdAt || Date.now(), w.createdAt || Date.now()) });
      if (JSON.stringify(merged) !== JSON.stringify(ex)) { S.words.set(ex.id, merged); toSave.push(merged); rep.updated++; } else rep.kept++;
    }
    await DB.putMany('words', toSave);
    if (obj.logs) await DB.putMany('logs', obj.logs);
    if (obj.sessions) await DB.putMany('sessions', obj.sessions);
    if (mode === 'replace' && obj.settings) { Object.assign(S.settings, obj.settings); }
    S.settings.lastBackup = Date.now(); S.settings.changesSinceBackup = 0; await saveSettings();
    return rep;
  }

  // ---------- Напоминание в календаре (.ics) ----------
  function ics() {
    const [hh, mm] = (S.settings.reminderTime || '20:00').split(':').map(Number);
    const d = new Date(); d.setHours(hh, mm, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 1);
    const p = (n) => String(n).padStart(2, '0');
    const local = d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + 'T' + p(hh) + p(mm) + '00';
    const tz = S.settings.tz && S.settings.tz !== 'device' ? S.settings.tz : null;
    const url = location.href.split('#')[0];
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Moi slova//RU', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:slova-daily-' + Date.now() + '@slova', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
      (tz ? 'DTSTART;TZID=' + tz + ':' : 'DTSTART:') + local, 'DURATION:PT' + S.settings.minutes + 'M', 'RRULE:FREQ=DAILY',
      'SUMMARY:Английский — ' + S.settings.minutes + ' минут', 'DESCRIPTION:Мои слова: ' + url, 'URL:' + url,
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Английский — ' + S.settings.minutes + ' минут', 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }

  // ---------- Демо-слова ----------
  const DEMO = [
    ['rent', 'снимать (жильё), арендовать', '🔑', 'I want to rent a flat.', 'Я хочу снять квартиру.', 'rent a car', 'глагол'],
    ['apartment', 'квартира', '🏢', 'The apartment is small.', 'Квартира маленькая.', 'a nice apartment', 'сущ.'],
    ['beach', 'пляж', '🏖️', 'We go to the beach.', 'Мы идём на пляж.', 'on the beach', 'сущ.'],
    ['wave', 'волна', '🌊', 'The wave is big today.', 'Сегодня волна большая.', 'catch a wave', 'сущ.'],
    ['how much is it?', 'сколько это стоит?', '💰', 'How much is it per night?', 'Сколько стоит за ночь?', '', 'выражение'],
    ['I would like', 'я бы хотела', '🙋', 'I would like a coffee, please.', 'Я бы хотела кофе, пожалуйста.', '', 'выражение'],
    ['check in', 'заселиться, зарегистрироваться', '🛎️', 'We check in at two.', 'Мы заселяемся в два.', 'check in at the hotel', 'фразовый глагол'],
    ['towel', 'полотенце', '🧺', 'Can I have a towel?', 'Можно мне полотенце?', 'a beach towel', 'сущ.'],
    ['go', 'идти, ехать', '🚶', 'I go to the gym.', 'Я хожу в спортзал.', 'go home', 'глагол'],
    ['look after', 'присматривать, заботиться', '🐕', 'I look after my dog.', 'Я забочусь о своей собаке.', 'look after children', 'фразовый глагол'],
    ['lesson', 'урок, занятие', '📘', 'The lesson starts at ten.', 'Урок начинается в десять.', 'a surf lesson', 'сущ.'],
    ['help', 'помогать; помощь', '🤝', 'Can you help me?', 'Вы можете мне помочь?', 'ask for help', 'глагол'],
  ];
  async function loadDemo() {
    let set = [...S.sets.values()].find(s => s.demo);
    if (!set) { set = { id: C.uid(), name: 'Демо', demo: true, createdAt: Date.now() }; await saveSet(set); }
    const existing = new Set(wordsArr().map(w => C.keyEn(w.en)));
    const list = DEMO.filter(d => !existing.has(C.keyEn(d[0]))).map(([en, ru, emoji, example, exampleRu, collocation, pos], i) => {
      const w = newWord({ en, ru, emoji, example, exampleRu, collocation, pos, demo: true, setIds: [set.id] }); w.createdAt += i; return w;
    });
    await saveWords(list);
    toast('Добавлено демо-слов: ' + list.length + '. Они помечены «демо».');
  }
  async function removeDemo() {
    const list = wordsArr().filter(w => w.demo);
    list.forEach(w => S.words.delete(w.id));
    await DB.delMany('words', list.map(w => w.id));
    const sets = [...S.sets.values()].filter(s => s.demo);
    for (const s of sets) { S.sets.delete(s.id); await DB.del('sets', s.id); }
    toast('Демо-слова удалены: ' + list.length + '. Ваши слова не тронуты.');
  }

  // ---------- Настройки ----------
  routes.prefs = async function () {
    const main = screen({ title: 'Настройки', back: 'today', noGear: true });
    const st = S.settings;
    const save = async (msg) => { await saveSettings(); if (msg) toast(msg); };
    const sel = (id, value, options, onchange) => { const s = h('select', { class: 'input', id, onchange: () => onchange(s.value) }, options.map(([v, l]) => h('option', { value: v }, l))); s.value = String(value); return s; };
    const sw = (label, checked, onchange, sub) => h('label', { class: 'switch' }, h('span', { class: 'stack', style: { gap: '0' } }, h('span', null, label), sub ? h('span', { class: 'tiny muted' }, sub) : null), h('input', { type: 'checkbox', checked, onchange: e => onchange(e.target.checked) }));

    const name = h('input', { class: 'input', id: 'p-name', value: st.name, onchange: () => { st.name = C.clean(name.value); save('Сохранено'); } });
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Занятия'),
      h('label', { class: 'field', for: 'p-name' }, 'Как к вам обращаться', name),
      h('label', { class: 'field', for: 'p-min' }, 'Время в день', sel('p-min', st.minutes, [[10, '10 минут'], [15, '15 минут'], [20, '20 минут'], [30, '30 минут']], v => { st.minutes = +v; save(); })),
      h('label', { class: 'field', for: 'p-new' }, 'Новых слов в день (если повторений много — меньше)', sel('p-new', st.newPerDay, [[3, '3'], [5, '5'], [7, '7'], [10, '10'], [15, '15']], v => { st.newPerDay = +v; save(); })),
      sw('Таймер в играх', st.timer, v => { st.timer = v; save(); }, 'Только «выбрать перевод» и «пары». Время вышло — просто показываем ответ, без штрафа.'),
      h('label', { class: 'field', for: 'p-tsec' }, 'Секунд на ответ', sel('p-tsec', st.timerSec, [[8, '8'], [12, '12'], [20, '20']], v => { st.timerSec = +v; save(); }))));

    // Звук
    const voiceSel = h('select', { class: 'input', id: 'p-voice', onchange: () => { st.voiceURI = voiceSel.value; save(); Speech.say('Hello! Nice to meet you.'); } });
    const fillVoices = () => {
      voiceSel.innerHTML = '';
      voiceSel.append(h('option', { value: '' }, 'Автоматически'));
      Speech.voices.forEach(v => voiceSel.append(h('option', { value: v.voiceURI }, v.name + ' (' + v.lang + ')' + (v.localService ? '' : ' — нужен интернет'))));
      voiceSel.value = st.voiceURI || '';
    };
    fillVoices(); if (Speech.supported) speechSynthesis.addEventListener('voiceschanged', fillVoices);
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Звук и произношение'),
      sw('Озвучка слов', st.sound, v => { st.sound = v; save(); }, 'Если выключить, упражнения «на слух» не будут предлагаться.'),
      sw('Произносить слово автоматически', st.autoplay, v => { st.autoplay = v; save(); }),
      Speech.supported ? h('label', { class: 'field', for: 'p-voice' }, 'Голос', voiceSel) : h('p', { class: 'small', style: { color: 'var(--bad)' } }, 'Этот браузер не умеет озвучивать текст.'),
      h('label', { class: 'field', for: 'p-rate' }, 'Обычная скорость', sel('p-rate', st.rate, [[0.8, 'Чуть медленнее'], [0.95, 'Нормально'], [1.05, 'Быстрее']], v => { st.rate = +v; save(); })),
      h('label', { class: 'field', for: 'p-slow' }, 'Замедленная скорость', sel('p-slow', st.slowRate, [[0.45, 'Очень медленно'], [0.6, 'Медленно'], [0.75, 'Чуть медленнее']], v => { st.slowRate = +v; save(); })),
      h('button', { class: 'btn soft', onclick: () => Speech.say('I would like to rent an apartment near the beach.') }, icon('speaker'), 'Проверить голос'),
      h('p', { class: 'tiny muted' }, 'Голоса берутся из устройства. На iPhone они работают без интернета; более естественные голоса можно скачать: Настройки → Универсальный доступ → Устный контент → Голоса → English. В Chrome на компьютере часть голосов («Google …») требует интернет.')));

    // Напоминание
    const time = h('input', { class: 'input', type: 'time', id: 'p-time', value: st.reminderTime, onchange: () => { st.reminderTime = time.value; save(); } });
    const tzs = ['device', 'Europe/Moscow', 'Asia/Makassar', 'Asia/Dubai', 'Asia/Bangkok', 'Europe/Kaliningrad', 'Asia/Yekaterinburg', 'Asia/Novosibirsk', 'Asia/Vladivostok'];
    let deviceTz = ''; try { deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { /* нет */ }
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Мягкое напоминание'),
      h('p', { class: 'small muted' }, 'Push-уведомлений в этой версии нет: для них нужен отдельный сервер. Вместо этого приложение создаёт ежедневное событие для календаря iPhone или компьютера — календарь и напомнит. Отказаться можно в любой момент, удалив событие.'),
      h('label', { class: 'field', for: 'p-time' }, 'Время', time),
      h('label', { class: 'field', for: 'p-tz' }, 'Часовой пояс', sel('p-tz', st.tz, tzs.map(z => [z, z === 'device' ? 'Как на устройстве' + (deviceTz ? ' (' + deviceTz + ')' : '') + ' — удобно в поездках' : z]), v => { st.tz = v; save(); })),
      h('button', { class: 'btn primary', onclick: () => deliver('slova-reminder.ics', ics(), 'text/calendar') }, 'Добавить напоминание в календарь'),
      h('p', { class: 'tiny muted' }, 'На iPhone откроется окно «Добавить в календарь». Серий и штрафов нет: пропущенный день ничего не обнуляет.')));

    // Telegram
    if (window.TG && TG.inTG) {
      const stEl = h('p', { class: 'small' }, 'Состояние: ' + TG.status + (TG.lastSync ? ' · ' + new Date(TG.lastSync).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''));
      main.append(h('div', { class: 'card stack' }, h('h2', null, 'Синхронизация через Telegram'),
        TG.cloudOK ? h('p', { class: 'small muted' }, 'Словарь и прогресс хранятся в облаке Telegram вашего аккаунта и одинаковы на телефоне и компьютере. У каждого человека, открывшего бота, — свой отдельный словарь. Картинки не синхронизируются: каждое устройство подбирает их само. Лимит облака — около 1000 слов.')
          : h('p', { class: 'small', style: { color: 'var(--warn)' } }, 'Эта версия Telegram не поддерживает облачное хранилище — обновите Telegram.'),
        stEl, TG.cloudOK ? h('button', { class: 'btn', onclick: async () => { await TG.sync({ manual: true }); routes.prefs(); } }, 'Синхронизировать сейчас') : null));
    }

    // Резервная копия
    const fileIn = h('input', { type: 'file', accept: '.json,application/json', hidden: true, onchange: async () => {
      const f = fileIn.files[0]; fileIn.value = ''; if (!f) return;
      try { restoreFlow(JSON.parse(await f.text())); } catch (e) { toast('Не получилось прочитать файл: ' + e.message); }
    } });
    const pasteBox = h('textarea', { class: 'input', rows: 4, placeholder: 'Или вставьте сюда текст резервной копии', id: 'p-paste' });
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Резервная копия и перенос'),
      h('p', { class: 'small' }, 'Последняя копия: ' + (st.lastBackup ? new Date(st.lastBackup).toLocaleString('ru-RU') : 'ещё не делали') + '.'),
      h('p', { class: 'small muted' }, 'Копия — один файл JSON со всеми словами, примерами, комментариями, картинками и прогрессом. Сохраните её в «Файлы» / iCloud Drive / Google Drive.'),
      h('button', { class: 'btn primary', onclick: exportBackup }, 'Сохранить резервную копию'),
      h('button', { class: 'btn', onclick: () => fileIn.click() }, 'Восстановить из файла'), fileIn,
      h('details', null, h('summary', null, 'Восстановить из текста'), h('div', { class: 'stack', style: { marginTop: '8px' } }, pasteBox,
        h('button', { class: 'btn', onclick: () => { try { restoreFlow(JSON.parse(pasteBox.value)); } catch (e) { toast('Это не похоже на копию: ' + e.message); } } }, 'Восстановить'))),
      h('button', { class: 'btn', onclick: exportCSV }, 'Экспорт словаря в CSV (Excel, Google Таблицы, Anki, Quizlet)'),
      h('p', { class: 'tiny muted' }, 'iPhone ↔ компьютер: автоматической синхронизации пока нет. Сохраните копию на одном устройстве и «Восстановить → Объединить» на другом. При совпадении слов остаётся версия с бо́льшим прогрессом.')));

    // Хранилище
    const storeInfo = h('p', { class: 'small muted' }, 'Проверяю…');
    (async () => {
      try {
        const persisted = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : null;
        const est = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : null;
        storeInfo.textContent = (DB.isMemory() ? 'Хранилище недоступно — данные только до закрытия страницы. ' : 'Данные хранятся в памяти браузера на этом устройстве. ') +
          (est ? 'Занято около ' + Math.max(0.1, est.usage / 1048576).toFixed(1) + ' МБ. ' : '') +
          (persisted === true ? 'Браузер обещал не удалять их автоматически.' : persisted === false ? 'Браузер может очистить их при нехватке места.' : '');
      } catch (e) { storeInfo.textContent = 'Нет сведений о хранилище.'; }
    })();
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Где хранятся данные'), storeInfo,
      h('p', { class: 'small muted' }, 'Память браузера — не резервная копия. В обычной вкладке Safari данные сайта могут удалиться, если не открывать его 7 дней; у приложения на экране «Домой» этого ограничения нет. Обновления приложения данные не трогают.')));

    // Онлайн-сервисы
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Онлайн-подсказки'),
      sw('Разрешить онлайн-подсказки', st.online, v => { st.online = v; save(); }, 'Перевод и пример — только по кнопке.'),
      sw('Подбирать картинки автоматически', st.autoImages !== false, v => { st.autoImages = v; save(); if (v) Pics.resume(); }, 'После сохранения слова приложение само ищет подходящее фото. Отправляется только английское слово (или запрос из Claude).'),
      h('ul', { class: 'small', style: { margin: 0, paddingLeft: '20px', display: 'grid', gap: '6px' } },
        h('li', null, h('b', null, 'MyMemory'), ' — перевод слова и примера. Бесплатно, без ключа, около 5000 символов в день. Отправляется только само слово или пример.'),
        h('li', null, h('b', null, 'Free Dictionary (dictionaryapi.dev)'), ' — часть речи, транскрипция, пример. Бесплатно, без ключа. Отправляется только английское слово.'),
        h('li', null, h('b', null, 'Wikimedia Commons'), ' — основной источник картинок: свободные лицензии, бесплатно, без ключа. Отправляется только поисковый запрос.'),
        h('li', null, h('b', null, 'Openverse'), ' — запасной источник картинок (Creative Commons). Бесплатно, у анонимных запросов есть лимит.')),
      h('p', { class: 'tiny muted' }, 'Тексты, скриншоты, голос и ваши фото никуда не отправляются. Секретных ключей в приложении нет.')));

    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Без интернета'),
      h('ul', { class: 'small', style: { margin: 0, paddingLeft: '20px', display: 'grid', gap: '4px' } },
        h('li', null, 'Работает: словарь, поиск, все тренировки, повторения, прогресс, добавление и импорт файлов, резервная копия, озвучка голосами iPhone.'),
        h('li', null, 'Нужен интернет: онлайн-перевод, подбор картинок (без сети он подождёт и продолжит сам), первое открытие приложения.'),
        h('li', null, 'Эмодзи-ассоциации для частых слов подбираются сразу и без интернета.'))));

    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Шаблон запроса для Claude'),
      h('p', { class: 'small muted' }, 'Тот же, что во вкладке «Добавить → Из Claude».'),
      h('button', { class: 'btn', onclick: () => Add.copyText(Add.claudePrompt(''), 'Шаблон скопирован') }, 'Скопировать шаблон')));

    const hasDemo = wordsArr().some(w => w.demo);
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Демо-слова'),
      h('p', { class: 'small muted' }, '12 слов для знакомства с приложением. Помечены «демо» и удаляются отдельно от ваших.'),
      hasDemo ? h('button', { class: 'btn', onclick: async () => { await removeDemo(); routes.prefs(); } }, 'Удалить демо-слова') : h('button', { class: 'btn', onclick: async () => { await loadDemo(); routes.prefs(); } }, 'Добавить демо-слова')));

    const confirmInp = h('input', { class: 'input', placeholder: 'впишите: удалить', id: 'p-wipe' });
    main.append(h('div', { class: 'card stack' }, h('h2', null, 'Удалить все данные'),
      h('p', { class: 'small muted' }, 'Сотрёт словарь, наборы и прогресс на этом устройстве. Сначала сохраните резервную копию.'),
      confirmInp,
      h('button', { class: 'btn danger', onclick: async () => {
        if (C.norm(confirmInp.value) !== 'удалить') return toast('Впишите слово «удалить», чтобы подтвердить');
        for (const s of ['words', 'sets', 'logs', 'sessions']) await DB.clear(s);
        S.words.clear(); S.sets.clear(); await App.kvSet('session', null); toast('Все данные удалены'); go('today');
      } }, 'Удалить всё')));

    main.append(h('p', { class: 'tiny muted', style: { textAlign: 'center' } }, 'Мои слова · версия ' + APP_VERSION + ' · формат данных ' + DATA_FORMAT + ' · алгоритм повторений FSRS-4.5'));
  };

  window.Prefs = { exportBackup, exportCSV, backupDue, restoreFlow, restore, buildBackup, loadDemo, removeDemo, ics };
})();
