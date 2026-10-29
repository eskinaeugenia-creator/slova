/* Слова — чистая логика без интерфейса (разбор, проверка ответов, FSRS, план дня).
   Работает и в браузере (window.Core), и в Node (require) — для тестов. */
(function (root) {
  'use strict';
  const DAY = 86400000;

  // ---------- Текст ----------
  const CYR = /[а-яё]/i, LAT = /[a-z]/i;
  function script(s) {
    s = String(s || '');
    const c = (s.match(/[а-яё]/gi) || []).length, l = (s.match(/[a-z]/gi) || []).length;
    if (!c && !l) return 'none';
    return c > l ? 'ru' : 'en';
  }
  function clean(s) {
    return String(s == null ? '' : s).replace(/ /g, ' ').replace(/[ \t]+/g, ' ').trim();
  }
  // Нормализация для сравнения ответов: регистр, ё, апострофы, пунктуация, пробелы
  function norm(s) {
    return String(s || '').toLowerCase().replace(/ё/g, 'е')
      .replace(/[’‘`´]/g, "'")
      .replace(/[.,!?;:"«»“”()\[\]{}…]/g, ' ')
      .replace(/'/g, '')
      .replace(/[-–—]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function stripArticle(s) { return s.replace(/^(to|a|an|the) /, ''); }

  // Допустимые варианты английского ответа: "colour / color", "(to) rent", "to rent"
  function variants(en) {
    const out = new Set();
    String(en || '').split(/\s*[\/|]\s*/).forEach(part => {
      part = part.trim(); if (!part) return;
      const withOpt = part.replace(/[()]/g, '');
      const noOpt = part.replace(/\([^)]*\)/g, ' ');
      [withOpt, noOpt].forEach(v => {
        const n = norm(v); if (!n) return;
        out.add(n); out.add(stripArticle(n));
      });
    });
    return [...out].filter(Boolean);
  }

  // Расстояние Дамерау–Левенштейна (перестановка соседних букв = 1 ошибка)
  function lev(a, b) {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    const D = Array.from({ length: m + 1 }, (_, i) => { const r = new Array(n + 1).fill(0); r[0] = i; return r; });
    for (let j = 0; j <= n; j++) D[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) D[i][j] = Math.min(D[i][j], D[i - 2][j - 2] + 1);
    }
    return D[m][n];
  }

  // Посимвольная разметка: что пропущено / лишнее / верно (по LCS)
  function diffChars(typed, expected) {
    const a = typed, b = expected, m = a.length, n = b.length;
    const L = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--)
      L[i][j] = a[i].toLowerCase() === b[j].toLowerCase() ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const ops = []; let i = 0, j = 0;
    while (i < m && j < n) {
      if (a[i].toLowerCase() === b[j].toLowerCase()) { ops.push({ t: 'ok', c: b[j] }); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) { ops.push({ t: 'extra', c: a[i] }); i++; }
      else { ops.push({ t: 'miss', c: b[j] }); j++; }
    }
    while (i < m) ops.push({ t: 'extra', c: a[i++] });
    while (j < n) ops.push({ t: 'miss', c: b[j++] });
    return ops;
  }

  // Проверка письменного ответа. result: correct | typo | wrong | empty
  function checkAnswer(input, en, extra) {
    const typed = norm(input);
    const vars = variants(en).concat((extra || []).map(norm).filter(Boolean));
    const display = String(en || '').split(/\s*[\/|]\s*/)[0].replace(/[()]/g, '').trim();
    if (!typed) return { result: 'empty', expected: display };
    if (vars.includes(typed) || vars.includes(stripArticle(typed))) return { result: 'correct', expected: display };
    let best = Infinity, bestV = vars[0] || '';
    vars.forEach(v => { const d = lev(stripArticle(typed), stripArticle(v)); if (d < best) { best = d; bestV = v; } });
    const len = stripArticle(bestV).replace(/ /g, '').length;
    const allowed = len <= 3 ? 0 : len <= 6 ? 1 : 2;
    const res = best <= allowed ? 'typo' : 'wrong';
    return { result: res, expected: display, diff: diffChars(String(input).trim(), display) };
  }

  // ---------- Разбор списков ----------
  const DELIMS = [
    { id: 'tab', s: '\t', label: 'Табуляция' },
    { id: 'emdash', s: ' — ', label: 'Тире «—»' },
    { id: 'endash', s: ' – ', label: 'Тире «–»' },
    { id: 'hyphen', s: ' - ', label: 'Дефис с пробелами « - »' },
    { id: 'eq', s: ' = ', label: 'Знак «=»' },
    { id: 'semi', s: ';', label: 'Точка с запятой' },
    { id: 'colon', s: ':', label: 'Двоеточие' },
    { id: 'comma', s: ',', label: 'Запятая' },
  ];
  function stripBullet(line) {
    return line.replace(/^\s*(?:\d{1,3}[.)]\s+|[-•*·▪●]\s+)/, '');
  }
  function unquote(s) { return clean(s).replace(/^["'«“](.*)["'»”]$/, '$1').trim(); }

  function splitRows(text, rowSep) {
    text = String(text || '').replace(/\r\n?/g, '\n');
    let rows = rowSep === 'semi' ? text.split(/;|\n/) : text.split('\n');
    return rows.map(r => r.replace(/ /g, ' ')).filter(r => r.trim());
  }
  function detectDelimiter(lines) {
    const counts = {};
    DELIMS.forEach(d => { counts[d.id] = lines.filter(l => l.includes(d.s)).length; });
    // запятую и двоеточие предлагаем только если других нет (переводы часто содержат запятые)
    const order = ['tab', 'emdash', 'endash', 'hyphen', 'eq', 'semi', 'colon', 'comma'];
    const strong = order.slice(0, 6);
    let best = null;
    // запятую и двоеточие берём только если других разделителей нет (переводы часто содержат запятые)
    strong.forEach(id => { if (counts[id] && (!best || counts[id] > counts[best])) best = id; });
    if (!best) ['colon', 'comma'].forEach(id => { if (counts[id] && (!best || counts[id] > counts[best])) best = id; });
    if (counts.tab && counts.tab >= lines.length * 0.5) best = 'tab';
    const withAny = lines.filter(l => DELIMS.some(d => l.includes(d.s))).length;
    const used = order.filter(id => counts[id] > 0);
    let ambiguous = false;
    if (best) {
      const share = counts[best] / lines.length;
      if (share < 0.8 && withAny > 0 && withAny < lines.length) ambiguous = true;
      if (used.length > 1 && used.some(id => id !== best && !['comma', 'colon'].includes(id) && counts[id] >= counts[best] * 0.5)) ambiguous = true;
      if (['comma', 'colon'].includes(best)) ambiguous = true;
    }
    return { best: best || 'none', counts, ambiguous };
  }
  function parseList(text, opts) {
    opts = opts || {};
    const lines = splitRows(text, opts.rowSep);
    const det = detectDelimiter(lines);
    const delimId = !opts.delimiter || opts.delimiter === 'auto' ? det.best : opts.delimiter;
    const d = DELIMS.find(x => x.id === delimId);
    const auto = !opts.delimiter || opts.delimiter === 'auto';
    const rows = lines.map((raw, idx) => {
      const line = stripBullet(raw);
      let en = '', ru = '', note = '';
      let parts = [line];
      // В авто-режиме каждая строка делится своим разделителем: списки бывают смешанными
      let dd = d;
      if (auto && (!dd || !line.includes(dd.s))) dd = DELIMS.slice(0, 6).find(x => line.includes(x.s)) || dd;
      if (dd) {
        const k = line.indexOf(dd.s);
        if (k >= 0) parts = [line.slice(0, k), line.slice(k + dd.s.length)];
        if (dd.id === 'tab') parts = line.split('\t');
      }
      parts = parts.map(unquote);
      if (parts.length === 1) {
        const s = script(parts[0]);
        if (s === 'ru') ru = parts[0]; else en = parts[0];
      } else {
        let [a, b, ...rest] = parts;
        if (script(a) === 'ru' && script(b) === 'en') [a, b] = [b, a];
        en = a; ru = b; note = rest.filter(Boolean).join(' ');
      }
      const row = { line: idx + 1, raw, en, ru, comment: note };
      if (!en && ru) row.error = 'Нет английского слова';
      else if (!en) row.error = 'Пустая строка';
      else if (script(en) === 'ru') row.error = 'Английская часть написана по-русски';
      return row;
    });
    return { rows, delimiter: delimId, detected: det.best, ambiguous: det.ambiguous && (!opts.delimiter || opts.delimiter === 'auto'), counts: det.counts };
  }

  // CSV / TSV с кавычками
  function parseCSV(text, delim) {
    text = String(text || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    if (!delim) {
      const first = text.split('\n').slice(0, 5).join('\n');
      const c = { '\t': (first.match(/\t/g) || []).length, ';': (first.match(/;/g) || []).length, ',': (first.match(/,/g) || []).length };
      delim = Object.keys(c).sort((x, y) => c[y] - c[x])[0];
      if (!c[delim]) delim = ',';
    }
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += ch;
      } else if (ch === '"' && cell === '') q = true;
      else if (ch === delim) { row.push(cell); cell = ''; }
      else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return { rows: rows.filter(r => r.some(c => String(c).trim())), delim };
  }

  // Ответ из чата Claude: JSON-массив (с ```json или без) или TSV с заголовком
  const FIELD_ALIASES = {
    en: ['en', 'english', 'word', 'term', 'слово', 'английский'],
    ru: ['ru', 'russian', 'translation', 'перевод', 'русский'],
    alt: ['alt', 'other', 'meanings', 'другие значения', 'значения'],
    pos: ['pos', 'part_of_speech', 'часть речи'],
    forms: ['forms', 'формы'],
    example: ['example', 'sentence', 'пример'],
    exampleRu: ['example_ru', 'exampleru', 'example_translation', 'перевод примера'],
    collocation: ['collocation', 'phrase', 'сочетание'],
    emoji: ['emoji', 'эмодзи'],
    imageQuery: ['image', 'image_query', 'picture', 'photo', 'картинка'],
    comment: ['comment', 'note', 'notes', 'комментарий'],
  };
  function mapFields(obj) {
    const out = {};
    const keys = Object.keys(obj || {});
    for (const f in FIELD_ALIASES) {
      const k = keys.find(k => FIELD_ALIASES[f].includes(String(k).toLowerCase().trim()));
      if (k != null && obj[k] != null) out[f] = clean(Array.isArray(obj[k]) ? obj[k].join(', ') : obj[k]);
    }
    return out;
  }
  function parseStructured(text) {
    let t = String(text || '').trim();
    const fence = t.match(/```(?:json|tsv|csv)?\s*([\s\S]*?)```/i);
    if (fence) t = fence[1].trim();
    const a = t.indexOf('['), b = t.lastIndexOf(']');
    if (a >= 0 && b > a) {
      try {
        const arr = JSON.parse(t.slice(a, b + 1));
        if (Array.isArray(arr)) return { kind: 'json', rows: arr.map((o, i) => Object.assign({ line: i + 1 }, mapFields(o))) };
      } catch (e) { return { kind: 'json-error', error: 'Не получилось прочитать JSON: ' + e.message, rows: [] }; }
    }
    if (/\[\s*\{/.test(t)) return { kind: 'json-error', error: 'Ответ похож на JSON, но он неполный. Скопируйте ответ целиком кнопкой «Копировать».', rows: [] };
    // TSV/CSV с заголовком
    const lines = t.split(/\r?\n/).filter(Boolean);
    if (lines.length >= 2) {
      const { rows } = parseCSV(t, lines[0].includes('\t') ? '\t' : undefined);
      const head = rows[0].map(h => String(h).toLowerCase().trim());
      const recognized = head.filter(h => Object.values(FIELD_ALIASES).some(a => a.includes(h))).length;
      if (recognized >= 2) {
        return { kind: 'table', rows: rows.slice(1).map((r, i) => {
          const o = {}; head.forEach((h, j) => { o[h] = r[j]; });
          return Object.assign({ line: i + 2 }, mapFields(o));
        }) };
      }
    }
    return { kind: 'none', rows: [] };
  }

  // ---------- Ключи дублей ----------
  function keyEn(en) { return stripArticle(norm(en)); }
  function keyRu(ru) { return norm(String(ru || '').split(/[,;]/)[0]); }

  // Классификация строки импорта относительно словаря и уже разобранных строк
  function classify(row, words, seen) {
    if (row.error) return { status: 'error' };
    const ke = keyEn(row.en), kr = keyRu(row.ru);
    const batchKey = ke + '|' + kr;
    if (seen.has(batchKey)) return { status: 'dupList' };
    seen.add(batchKey);
    const same = words.filter(w => keyEn(w.en) === ke);
    if (!same.length) return { status: 'new' };
    const draft = same.find(w => !w.ru);
    if (draft && kr) return { status: 'fill', target: draft.id };
    const exact = same.find(w => !kr || keyRu(w.ru) === kr || norm(w.ru) === norm(row.ru));
    if (exact) return { status: 'dup', target: exact.id };
    return { status: 'meaning', target: same[0].id };
  }

  // Классифицировать весь список: строка без перевода, если в этом же списке есть то же слово с переводом, — повтор
  function classifyBatch(rows, words) {
    const seen = new Set();
    const withRu = new Set(rows.filter(r => !r.error && r.en && r.ru).map(r => keyEn(r.en)));
    return rows.map(r => {
      if (!r.error && r.en && !r.ru && withRu.has(keyEn(r.en))) return { status: 'dupList' };
      return classify(r, words, seen);
    });
  }

  // ---------- FSRS-4.5 (параметры по умолчанию open-spaced-repetition) ----------
  const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
  const DECAY = -0.5, FACTOR = 19 / 81;
  const clampD = d => Math.min(10, Math.max(1, d));
  const initS = g => Math.max(0.1, W[g - 1]);
  const initD = g => clampD(W[4] - (g - 3) * W[5]);
  const retr = (t, s) => Math.pow(1 + FACTOR * t / s, DECAY);
  function nextD(d, g) { return clampD(W[7] * initD(4) + (1 - W[7]) * (d - W[6] * (g - 3))); }
  function recallS(d, s, r, g) {
    return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp((1 - r) * W[10]) - 1) * (g === 2 ? W[15] : 1) * (g === 4 ? W[16] : 1));
  }
  function forgetS(d, s, r) {
    return Math.min(s, W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]));
  }
  function intervalDays(s, retention) {
    const i = s / FACTOR * (Math.pow(retention || 0.9, 1 / DECAY) - 1);
    return Math.min(36500, Math.max(1, Math.round(i)));
  }
  function startOfDay(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function sameDay(a, b) { return a && b && startOfDay(a) === startOfDay(b); }
  function emptyCard() { return { reps: 0, lapses: 0, s: 0, d: 0, last: 0, due: 0 }; }

  // Применить оценку (1 не вспомнила, 2 с трудом, 3 вспомнила, 4 легко). Возвращает новую карточку.
  function review(card, g, now, retention) {
    card = Object.assign(emptyCard(), card || {});
    const c = Object.assign({}, card);
    if (!card.reps) { c.s = initS(g); c.d = initD(g); }
    else {
      const t = Math.max(0, (now - card.last) / DAY);
      const r = retr(t, card.s);
      c.d = nextD(card.d, g);
      if (g === 1) { c.s = forgetS(card.d, card.s, r); c.lapses = card.lapses + 1; }
      else c.s = recallS(card.d, card.s, r, g);
    }
    c.reps = card.reps + 1; c.last = now;
    const days = g === 1 ? 1 : intervalDays(c.s, retention);
    // срок — начало дня через N дней + 3 ч, чтобы «на сегодня» считалось по календарным дням
    c.due = startOfDay(now) + days * DAY + 3 * 3600000;
    return c;
  }
  function retrievability(card, now) {
    if (!card || !card.reps) return 0;
    return retr(Math.max(0, (now - card.last) / DAY), card.s);
  }
  function isDue(card, now) { return !!card && card.reps > 0 && card.due <= endOfDay(now); }
  function endOfDay(ts) { return startOfDay(ts) + DAY - 1; }

  /* Как тренировка влияет на расписание:
     - в один календарный день расписание меняет только ПЕРВЫЙ ответ по каждому направлению;
     - в плановом занятии и в «Подготовке к уроку» расписание меняется, если направление пора повторять
       или слово видите впервые;
     - если слово повторять ещё рано, верный ответ лишь записывается в историю (не раздувает интервалы),
       а ошибка (не в тот же день) засчитывается как забывание — это честный сигнал. */
  function shouldSchedule(card, grade, now, mode) {
    if (!card || !card.reps) return true;
    if (sameDay(card.last, now)) return false;
    if (isDue(card, now)) return true;
    return grade === 1;
  }

  // ---------- Статусы слова ----------
  function wordStatus(w, now) {
    if (w.archived) return 'archived';
    if (!w.ru) return 'draft';
    const rg = w.srs && w.srs.recog, rc = w.srs && w.srs.recall;
    if (!rg || !rg.reps) return 'new';
    const lapses = (rg.lapses || 0) + (rc && rc.lapses || 0);
    if (lapses >= 3 || (w.stats && w.stats.recentWrong >= 2)) return 'hard';
    if (rc && rc.reps && rc.s >= 21 && rg.s >= 21) return 'solid';
    return 'learning';
  }
  function wordDue(w, now) {
    if (w.archived || !w.ru) return false;
    const rg = w.srs && w.srs.recog, rc = w.srs && w.srs.recall;
    return isDue(rg, now) || isDue(rc, now);
  }

  // ---------- План на сегодня ----------
  // Возвращает элементы {wordId, dir} — сначала самые «забытые» повторения, потом новые слова.
  function buildPlan(words, now, opts) {
    opts = Object.assign({ minutes: 15, newPerDay: 7, introducedToday: 0, secPerItem: 20 }, opts || {});
    const budget = Math.max(8, Math.round(opts.minutes * 60 / opts.secPerItem));
    const active = words.filter(w => !w.archived && w.ru);
    const due = [];
    active.forEach(w => {
      ['recog', 'recall'].forEach(dir => {
        const c = w.srs && w.srs[dir];
        if (isDue(c, now) && !sameDay(c.last, now)) due.push({ wordId: w.id, dir, r: retrievability(c, now) });
      });
    });
    due.sort((a, b) => a.r - b.r);
    // Первое самостоятельное вспоминание — на следующий день после знакомства с узнаванием
    const recallNew = active.filter(w => {
      const rg = w.srs && w.srs.recog, rc = w.srs && w.srs.recall;
      return rg && rg.reps && !(rc && rc.reps) && !sameDay(rg.last, now) && rg.last < now;
    }).sort((a, b) => a.srs.recog.last - b.srs.recog.last)
      .map(w => ({ wordId: w.id, dir: 'recall', r: 0.95 }));
    due.push(...recallNew);
    const dueTotal = due.length;
    // новые слова: меньше, если много повторений; после пропуска очередь не обязательна целиком
    let newLimit = Math.max(0, opts.newPerDay - opts.introducedToday);
    if (dueTotal > budget) newLimit = Math.min(newLimit, 2);
    else if (dueTotal > budget * 0.6) newLimit = Math.min(newLimit, 4);
    const fresh = active.filter(w => !(w.srs && w.srs.recog && w.srs.recog.reps))
      .sort((a, b) => (a.demo ? 1 : 0) - (b.demo ? 1 : 0) || a.createdAt - b.createdAt)
      .slice(0, newLimit);
    const newCost = 2; // знакомство + первое упражнение
    const dueTake = Math.max(0, budget - fresh.length * newCost);
    const portion = due.slice(0, dueTake);
    return { portion, fresh: fresh.map(w => w.id), dueTotal, dueLeft: dueTotal - portion.length, budget, newAvailable: active.filter(w => !(w.srs && w.srs.recog && w.srs.recog.reps)).length };
  }

  // ---------- Предложения ----------
  function tokenize(sentence) { return String(sentence || '').match(/[A-Za-z0-9'’-]+|[.,!?;:]/g) || []; }
  // Найти слово/выражение в примере (с учётом простых окончаний: -s, -es, -ed, -ing, -d)
  function findInSentence(sentence, en) {
    const base = String(en || '').split(/\s*[\/|]\s*/)[0].replace(/\([^)]*\)/g, '').replace(/^(to|a|an|the)\s+/i, '').trim();
    if (!base || !sentence) return null;
    const esc = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const stem = base.length > 3 && /e$/.test(base) ? esc.slice(0, -1) + '(?:e)?' : esc;
    const re = new RegExp('\\b(' + stem + '(?:s|es|ed|d|ing)?)\\b', 'i');
    const m = String(sentence).match(re);
    if (!m) return null;
    return { start: m.index, end: m.index + m[1].length, text: m[1], base };
  }

  // Разбить текст на предложения и токены (для режима «Из текста»)
  function sentencesOf(text) {
    const t = String(text || '').replace(/\r/g, '');
    const out = []; const re = /[^.!?\n]+[.!?]*\s*/g; let m;
    while ((m = re.exec(t))) { const s = m[0].trim(); if (s) out.push(s); }
    return out;
  }

  // ---------- Неправильные глаголы (локально, без интернета) ----------
  const IRREG = {
    be: ['was / were', 'been', 'быть'], become: ['became', 'become', 'становиться'], begin: ['began', 'begun', 'начинать'],
    break: ['broke', 'broken', 'ломать'], bring: ['brought', 'brought', 'приносить'], build: ['built', 'built', 'строить'],
    buy: ['bought', 'bought', 'покупать'], catch: ['caught', 'caught', 'ловить'], choose: ['chose', 'chosen', 'выбирать'],
    come: ['came', 'come', 'приходить'], cost: ['cost', 'cost', 'стоить'], cut: ['cut', 'cut', 'резать'],
    do: ['did', 'done', 'делать'], drink: ['drank', 'drunk', 'пить'], drive: ['drove', 'driven', 'водить машину'],
    eat: ['ate', 'eaten', 'есть'], fall: ['fell', 'fallen', 'падать'], feel: ['felt', 'felt', 'чувствовать'],
    find: ['found', 'found', 'находить'], fly: ['flew', 'flown', 'летать'], forget: ['forgot', 'forgotten', 'забывать'],
    get: ['got', 'got / gotten', 'получать'], give: ['gave', 'given', 'давать'], go: ['went', 'gone', 'идти, ехать'],
    have: ['had', 'had', 'иметь'], hear: ['heard', 'heard', 'слышать'], hold: ['held', 'held', 'держать'],
    keep: ['kept', 'kept', 'хранить'], know: ['knew', 'known', 'знать'], leave: ['left', 'left', 'уходить, оставлять'],
    lend: ['lent', 'lent', 'одалживать'], let: ['let', 'let', 'позволять'], lose: ['lost', 'lost', 'терять'],
    make: ['made', 'made', 'делать, создавать'], mean: ['meant', 'meant', 'значить'], meet: ['met', 'met', 'встречать'],
    pay: ['paid', 'paid', 'платить'], put: ['put', 'put', 'класть'], read: ['read', 'read', 'читать'],
    ride: ['rode', 'ridden', 'кататься'], ring: ['rang', 'rung', 'звонить'], run: ['ran', 'run', 'бегать'],
    say: ['said', 'said', 'сказать'], see: ['saw', 'seen', 'видеть'], sell: ['sold', 'sold', 'продавать'],
    send: ['sent', 'sent', 'отправлять'], set: ['set', 'set', 'устанавливать'], show: ['showed', 'shown', 'показывать'],
    shut: ['shut', 'shut', 'закрывать'], sing: ['sang', 'sung', 'петь'], sit: ['sat', 'sat', 'сидеть'],
    sleep: ['slept', 'slept', 'спать'], speak: ['spoke', 'spoken', 'говорить'], spend: ['spent', 'spent', 'тратить'],
    stand: ['stood', 'stood', 'стоять'], swim: ['swam', 'swum', 'плавать'], take: ['took', 'taken', 'брать'],
    teach: ['taught', 'taught', 'учить'], tell: ['told', 'told', 'рассказывать'], think: ['thought', 'thought', 'думать'],
    throw: ['threw', 'thrown', 'бросать'], understand: ['understood', 'understood', 'понимать'], wake: ['woke', 'woken', 'просыпаться'],
    wear: ['wore', 'worn', 'носить (одежду)'], win: ['won', 'won', 'побеждать'], write: ['wrote', 'written', 'писать'],
    sweep: ['swept', 'swept', 'подметать'], dive: ['dove / dived', 'dived', 'нырять'], light: ['lit', 'lit', 'зажигать'],
    lie: ['lay', 'lain', 'лежать'], lay: ['laid', 'laid', 'класть'], hurt: ['hurt', 'hurt', 'причинять боль'],
    hit: ['hit', 'hit', 'ударять'], grow: ['grew', 'grown', 'расти'], draw: ['drew', 'drawn', 'рисовать'],
    dream: ['dreamt / dreamed', 'dreamt / dreamed', 'мечтать'], learn: ['learnt / learned', 'learnt / learned', 'учить(ся)'],
    burn: ['burnt / burned', 'burnt / burned', 'гореть'], forgive: ['forgave', 'forgiven', 'прощать'], hide: ['hid', 'hidden', 'прятать'],
    rise: ['rose', 'risen', 'подниматься'], shake: ['shook', 'shaken', 'трясти'], steal: ['stole', 'stolen', 'красть'],
    stick: ['stuck', 'stuck', 'приклеивать'], feed: ['fed', 'fed', 'кормить'], fight: ['fought', 'fought', 'драться'],
  };
  function irregular(en) {
    const k = norm(en).replace(/^to /, '');
    let f = IRREG[k], base = k, tail = '';
    // фразовый глагол: wake up → woke up → woken up
    if (!f) { const parts = k.split(' '); if (parts.length === 2 && IRREG[parts[0]] && /^(up|down|in|out|on|off|away|back|over|after)$/.test(parts[1])) { base = parts[0]; tail = ' ' + parts[1]; f = IRREG[base]; } }
    if (!f) return null;
    const add = (v) => v.split(' / ').map(x => x + tail).join(' / ');
    return { v1: base + tail, v2: add(f[0]), v3: add(f[1]), ru: f[2], text: base + tail + ' – ' + add(f[0]) + ' – ' + add(f[1]) };
  }
  function irregularAll() { return Object.keys(IRREG).map(k => ({ v1: k, v2: IRREG[k][0], v3: IRREG[k][1], ru: IRREG[k][2] })); }
  const POS_RU = { noun: 'сущ.', verb: 'глагол', adjective: 'прил.', adverb: 'наречие', pronoun: 'местоим.', preposition: 'предлог', conjunction: 'союз', interjection: 'междометие', determiner: 'определитель', phrase: 'выражение' };

  // ---------- Мелочи ----------
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }
  function inDays(ts, now) {
    const d = Math.round((startOfDay(ts) - startOfDay(now)) / DAY);
    if (d <= 0) return 'сегодня';
    if (d === 1) return 'завтра';
    if (d < 31) return 'через ' + d + ' ' + plural(d, 'день', 'дня', 'дней');
    const m = Math.round(d / 30);
    if (m < 12) return 'через ' + m + ' ' + plural(m, 'месяц', 'месяца', 'месяцев');
    return 'больше чем через год';
  }

  const Core = { DAY, script, clean, norm, variants, lev, diffChars, checkAnswer, DELIMS, parseList, detectDelimiter, parseCSV,
    parseStructured, mapFields, keyEn, keyRu, classify, classifyBatch, review, retrievability, isDue, intervalDays, shouldSchedule, sameDay,
    startOfDay, endOfDay, emptyCard, wordStatus, wordDue, buildPlan, tokenize, findInSentence, sentencesOf, irregular, irregularAll,
    POS_RU, uid, shuffle, plural, inDays, CYR, LAT };
  if (typeof module !== 'undefined' && module.exports) module.exports = Core; else root.Core = Core;
})(typeof window !== 'undefined' ? window : globalThis);
