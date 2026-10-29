/* Мои слова — каркас: состояние, сохранение, помощники интерфейса, навигация, Сегодня, Словарь, карточка слова. */
(function () {
  'use strict';
  const C = window.Core;
  const APP_VERSION = '1.2.0', DATA_FORMAT = 1;

  // ---------- Состояние ----------
  const S = {
    words: new Map(), sets: new Map(), settings: null, kv: {}, storage: { ok: true },
    online: navigator.onLine !== false, ui: { dictFilter: 'all', dictSet: 'all', dictQuery: '', select: false, selected: new Set(), shown: 150 },
  };
  const DEFAULTS = {
    name: '', autoImages: true, minutes: 15, newPerDay: 7, sound: true, autoplay: true, voiceURI: '', rate: 0.95, slowRate: 0.6,
    timer: false, timerSec: 12, reminderTime: '20:00', tz: 'device', retention: 0.9, online: true,
    lastBackup: 0, changesSinceBackup: 0, backupEveryDays: 7,
  };

  // ---------- DOM-помощники ----------
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else if (k === 'checked') el.checked = !!v;
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
    kids.flat(Infinity).forEach(c => { if (c == null || c === false) return; el.append(c.nodeType ? c : document.createTextNode(String(c))); });
    return el;
  }
  const $ = (s, r) => (r || document).querySelector(s);
  const ICONS = {
    today: '<path d="M4 7h16M4 7v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7M4 7l1-3h14l1 3M9 12h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    dict: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4zM5 17a3 3 0 0 1 3-3h11M9 8h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    train: '<path d="M7 4h10M7 20h10M8 4c0 4 8 4 8 8s-8 4-8 8M16 4c0 4-8 4-8 8s8 4 8 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    progress: '<path d="M4 20h16M7 16v-4M12 16V8M17 16v-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    gear: '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    close: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    speaker: '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    slow: '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    search: '<circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  };
  const icon = (n) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = ICONS[n]; return s; };

  let toastTimer = null;
  function toast(msg, action) {
    const old = $('.toast'); if (old) old.remove();
    clearTimeout(toastTimer);
    const t = h('div', { class: 'toast', role: 'status' }, h('span', null, msg),
      action ? h('button', { onclick: () => { t.remove(); action.fn(); } }, action.label) : null);
    document.body.append(t);
    toastTimer = setTimeout(() => t.remove(), action ? 7000 : 3200);
  }
  // Подтверждение внутри страницы (без системных confirm)
  function dialog({ title, text, ok = 'Да', cancel = 'Отмена', danger = false, body }) {
    return new Promise(resolve => {
      const close = (v) => { scrim.remove(); resolve(v); };
      const scrim = h('div', { class: 'scrim', onclick: e => { if (e.target === scrim) close(false); } },
        h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' },
          h('h2', null, title), text ? h('p', { class: 'muted' }, text) : null, body || null,
          h('div', { class: 'split' },
            h('button', { class: 'btn', onclick: () => close(false) }, cancel),
            h('button', { class: 'btn ' + (danger ? 'danger' : 'primary'), onclick: () => close(true) }, ok))));
      document.body.append(scrim);
      scrim.querySelector('.btn.' + (danger ? 'danger' : 'primary')).focus();
    });
  }
  function sheet(title, body) {
    const scrim = h('div', { class: 'scrim', onclick: e => { if (e.target === scrim) scrim.remove(); } },
      h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' },
        h('div', { class: 'row nowrap' }, h('h2', { class: 'grow' }, title), h('button', { class: 'icon-btn', 'aria-label': 'Закрыть', onclick: () => scrim.remove() }, icon('close'))),
        body));
    document.body.append(scrim);
    return { close: () => scrim.remove(), el: scrim };
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function fmtDate(ts) { return ts ? new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : '—'; }

  // ---------- Озвучка (голоса устройства) ----------
  const Speech = {
    voices: [], ready: false,
    supported: typeof window.speechSynthesis !== 'undefined',
    load() {
      if (!this.supported) return;
      const pick = () => { this.voices = speechSynthesis.getVoices().filter(v => /^en(-|_|$)/i.test(v.lang)); this.ready = true; };
      pick(); speechSynthesis.onvoiceschanged = pick;
    },
    voice() {
      const uri = S.settings.voiceURI;
      return this.voices.find(v => v.voiceURI === uri) || this.voices.find(v => v.localService && /en-US/i.test(v.lang)) ||
        this.voices.find(v => /en-US/i.test(v.lang)) || this.voices.find(v => /en-GB/i.test(v.lang)) || this.voices[0] || null;
    },
    say(text, slow) {
      if (!text) return;
      if (!this.supported) { toast('На этом устройстве нет встроенной озвучки'); return; }
      if (!S.settings.sound) { toast('Звук выключен в настройках'); return; }
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(String(text).replace(/\s*\/\s*/g, ', '));
        const v = this.voice(); if (v) u.voice = v;
        u.lang = v ? v.lang : 'en-US';
        u.rate = slow ? S.settings.slowRate : S.settings.rate;
        speechSynthesis.speak(u);
      } catch (e) { toast('Не получилось воспроизвести: ' + e.message); }
    },
  };
  function sayButtons(text, opts) {
    if (!text) return null;
    opts = opts || {};
    return h('div', { class: 'say' },
      h('button', { class: 'btn soft sm', type: 'button', onclick: e => { e.stopPropagation(); Speech.say(text); } }, icon('speaker'), opts.label || 'Слушать'),
      h('button', { class: 'btn soft sm', type: 'button', onclick: e => { e.stopPropagation(); Speech.say(text, true); } }, icon('slow'), 'Медленно'));
  }

  // ---------- Сохранение ----------
  async function saveWord(w, opts) {
    w.updatedAt = Date.now();
    if (!opts || !opts.quiet) w.editedAt = w.updatedAt; // время правки текста (для синхронизации)
    S.words.set(w.id, w);
    await DB.put('words', w);
    if (!opts || !opts.quiet) bumpChanges();
  }
  async function saveWords(list) {
    const now = Date.now(); list.forEach(w => { w.updatedAt = now; w.editedAt = now; S.words.set(w.id, w); });
    await DB.putMany('words', list); bumpChanges(list.length);
  }
  async function saveSet(s) { S.sets.set(s.id, s); await DB.put('sets', s); }
  async function saveSettings() { await DB.put('kv', S.settings, 'settings'); }
  async function kvSet(k, v) { S.kv[k] = v; try { await DB.put('kv', v, k); } catch (e) { /* не критично */ } }
  async function kvGet(k) { try { return await DB.get('kv', k); } catch (e) { return undefined; } }
  function bumpChanges(n) { S.settings.changesSinceBackup = (S.settings.changesSinceBackup || 0) + (n || 1); saveSettings(); }

  function newWord(f) {
    const now = Date.now();
    const w = {
      id: C.uid(), en: C.clean(f.en), ru: C.clean(f.ru), alt: C.clean(f.alt), pos: C.clean(f.pos), forms: C.clean(f.forms),
      example: C.clean(f.example), exampleRu: C.clean(f.exampleRu), collocation: C.clean(f.collocation), comment: C.clean(f.comment),
      emoji: C.clean(f.emoji), image: f.image || '', imageCredit: f.imageCredit || null, phonetic: C.clean(f.phonetic),
      source: C.clean(f.source), imageQuery: C.clean(f.imageQuery), tags: f.tags || [], setIds: f.setIds || [], auto: f.auto || {},
      archived: false, demo: !!f.demo, createdAt: now, updatedAt: now,
      srs: { recog: null, recall: null }, stats: { right: 0, wrong: 0, hints: 0, hist: [], recentWrong: 0 },
    };
    if (!w.forms) { const irr = C.irregular(w.en); if (irr) w.forms = irr.text; }
    if (!w.emoji && window.Pics) { const e = Pics.emojiFor(w.en); if (e) { w.emoji = e; w.auto = Object.assign({}, w.auto, { emoji: 1 }); } }
    return w;
  }
  // Дополнить существующее слово: заполняются только пустые поля, прогресс не трогается
  function mergeInto(w, f, overwrite) {
    ['ru', 'alt', 'pos', 'forms', 'example', 'exampleRu', 'collocation', 'comment', 'emoji', 'source', 'phonetic', 'imageQuery'].forEach(k => {
      const v = C.clean(f[k]); if (!v) return;
      if (!w[k] || overwrite) w[k] = v;
    });
    if (f.setIds) f.setIds.forEach(id => { if (!w.setIds.includes(id)) w.setIds.push(id); });
    return w;
  }
  function wordsArr() { return [...S.words.values()]; }
  function activeWords() { return wordsArr().filter(w => !w.archived); }
  function setName(id) { const s = S.sets.get(id); return s ? s.name : '—'; }
  async function ensureSet(name) {
    name = C.clean(name); if (!name) return null;
    const ex = [...S.sets.values()].find(s => s.name.toLowerCase() === name.toLowerCase());
    if (ex) return ex.id;
    const s = { id: C.uid(), name, createdAt: Date.now() }; await saveSet(s); return s.id;
  }

  // ---------- Журнал ----------
  async function logAnswer(entry) {
    entry.id = C.uid(); entry.ts = entry.ts || Date.now();
    try { await DB.put('logs', entry); } catch (e) { /* журнал не критичен */ }
  }

  // ---------- Сеть ----------
  window.addEventListener('online', () => { S.online = true; rerenderBanner(); });
  window.addEventListener('offline', () => { S.online = false; rerenderBanner(); });
  function rerenderBanner() { const b = $('#net'); if (b) b.hidden = S.online; }

  // ---------- Навигация ----------
  const TABS = [
    { id: 'today', label: 'Сегодня', icon: 'today' },
    { id: 'dict', label: 'Словарь', icon: 'dict' },
    { id: 'add', label: 'Добавить', icon: 'plus', cls: 'add-tab' },
    { id: 'train', label: 'Тренировки', icon: 'train' },
    { id: 'progress', label: 'Прогресс', icon: 'progress' },
  ];
  const routes = {};
  function route() {
    let hash = (location.hash || '#today').slice(1);
    if (/^tgWebApp/.test(hash)) hash = 'today';
    const [name, ...rest] = hash.split('-');
    const arg = rest.join('-');
    const fn = routes[name] || routes.today;
    if (window.Train && Train.active() && name !== 'session') Train.abort(true);
    window.scrollTo(0, 0);
    fn(arg);
  }
  function go(h) { if (location.hash === '#' + h) route(); else location.hash = h; }
  // Отрисовать экран с шапкой и нижней навигацией
  function screen(opts) {
    const root = $('#app'); root.innerHTML = '';
    const top = h('header', { class: 'top' },
      opts.back ? h('button', { class: 'icon-btn', 'aria-label': 'Назад', onclick: () => history.length > 1 ? history.back() : go(opts.back) }, icon('back')) : null,
      h('h1', null, opts.title),
      opts.actions || null,
      opts.noGear ? null : h('a', { class: 'icon-btn', href: '#prefs', 'aria-label': 'Настройки' }, icon('gear')));
    const net = h('div', { id: 'net', class: 'banner warn', hidden: S.online },
      h('div', { class: 'grow' }, h('b', null, 'Нет интернета.'), h('span', null, 'Словарь и тренировки работают. Онлайн-подсказки перевода и картинок недоступны.')));
    const main = h('main', { class: 'main' + (opts.nav === false ? ' no-nav' : '') }, net,
      S.storage.ok ? null : h('div', { class: 'banner bad' }, h('div', { class: 'grow' }, h('b', null, 'Хранилище браузера недоступно.'),
        h('span', null, 'Данные будут жить только до закрытия страницы. Откройте приложение в обычном (не приватном) окне или сохраните резервную копию.'))));
    root.append(top, main);
    if (opts.nav !== false) {
      const cur = opts.tab;
      root.append(h('nav', { class: 'nav', 'aria-label': 'Разделы' }, TABS.map(t => h('a', { href: '#' + t.id, class: t.cls || '', 'aria-current': cur === t.id ? 'page' : null },
        t.cls ? h('span', { class: 'plus' }, icon(t.icon)) : icon(t.icon), h('span', null, t.label)))));
    }
    return main;
  }

  // ---------- Сегодня ----------
  function todayStats() {
    const now = Date.now(); const sod = C.startOfDay(now);
    const words = wordsArr();
    const introducedToday = words.filter(w => w.srs.recog && w.srs.recog.reps && w.firstSeen >= sod).length;
    const plan = C.buildPlan(words, now, { minutes: S.settings.minutes, newPerDay: S.settings.newPerDay, introducedToday });
    return { plan, introducedToday };
  }
  routes.today = async function () {
    const main = screen({ title: 'Сегодня', tab: 'today' });
    const words = wordsArr();
    const now = Date.now();
    if (!S.settings.name) {
      const nm = h('input', { class: 'input', id: 'ask-name', placeholder: 'Ваше имя', autocomplete: 'given-name' });
      main.append(h('form', { class: 'card stack', onsubmit: async e => { e.preventDefault(); const v = C.clean(nm.value); if (!v) return nm.focus(); S.settings.name = v; await saveSettings(); routes.today(); } },
        h('h3', null, 'Как к вам обращаться?'), h('div', { class: 'row nowrap' }, h('div', { class: 'grow' }, nm), h('button', { class: 'btn primary', type: 'submit' }, 'Готово'))));
    }
    main.append(h('p', { class: 'muted' }, (S.settings.name ? 'Привет, ' + S.settings.name + '! ' : '') + new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })));

    if (!words.length) {
      main.append(h('div', { class: 'card empty' },
        h('div', { class: 'glyph' }, 'Aa'),
        h('h2', null, 'Словарь пока пуст'),
        h('p', { class: 'muted' }, 'Добавьте первые слова: по одному, списком или из текста. Перевод и пример можно подсказать онлайн или получить из чата Claude.'),
        h('div', { class: 'stack', style: { width: '100%', maxWidth: '360px' } },
          h('a', { class: 'btn primary big block', href: '#add' }, 'Добавить первое слово'),
          h('a', { class: 'btn block', href: '#add', onclick: () => { S.ui.addMode = 'list'; } }, 'Вставить список слов'),
          h('button', { class: 'btn ghost block', onclick: async () => { await Prefs.loadDemo(); routes.today(); } }, 'Посмотреть на демо-словах'))));
      return;
    }
    const saved = window.Train ? await Train.savedSession() : null;
    if (saved) main.append(h('div', { class: 'banner' }, h('div', { class: 'grow' }, h('b', null, 'Незаконченное занятие: «' + saved.title + '»'),
      h('span', null, 'Осталось заданий: ' + (saved.queue.length - saved.idx) + '. Все прежние ответы уже сохранены.'),
      h('div', { class: 'row' }, h('button', { class: 'btn sm primary', onclick: () => Train.resume(saved) }, 'Продолжить'), h('button', { class: 'btn sm ghost', onclick: async () => { await kvSet('session', null); routes.today(); } }, 'Не нужно')))));
    const { plan } = todayStats();
    const minutesToday = await minutesStudiedToday();
    const goal = S.settings.minutes;
    const total = plan.portion.length + plan.fresh.length;
    const estMin = Math.max(1, Math.round((plan.portion.length * 20 + plan.fresh.length * 45) / 60));
    const hero = h('section', { class: 'hero' },
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', null, plan.portion.length), h('span', null, 'повторить')),
        h('div', { class: 'stat' }, h('b', null, plan.fresh.length), h('span', null, 'новых')),
        h('div', { class: 'stat' }, h('b', null, '≈' + (total ? estMin : 0)), h('span', null, 'мин'))),
      total ? h('button', { class: 'btn primary big block', onclick: () => Train.startDaily() }, 'Начать «Мои ' + goal + ' минут»')
        : h('p', null, plan.newAvailable ? 'Повторений на сегодня нет. Новые слова на сегодня уже были — можно потренировать набор в «Тренировках».' : 'Всё повторено. Добавьте новые слова или потренируйте набор.'),
      plan.dueLeft > 0 ? h('p', { class: 'small', style: { opacity: .8 } }, 'Ещё ' + plan.dueLeft + ' ' + C.plural(plan.dueLeft, 'повторение подождёт', 'повторения подождут', 'повторений подождут') + '. Это не долг: после занятия можно взять ещё порцию или продолжить завтра.') : null,
      h('div', { class: 'stack', style: { gap: '6px' } },
        h('div', { class: 'row small', style: { justifyContent: 'space-between' } }, h('span', null, 'Сегодня занимались'), h('span', { class: 'num' }, minutesToday + ' из ' + goal + ' мин')),
        h('div', { class: 'meter' }, h('i', { style: { width: Math.min(100, minutesToday / goal * 100) + '%' } }))));
    main.append(hero);

    // Быстрое добавление
    const q = h('input', { class: 'input', id: 'quick-add', placeholder: 'Встретили слово? Впишите сюда', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false' });
    main.append(h('form', { class: 'card', onsubmit: e => { e.preventDefault(); if (!q.value.trim()) return q.focus(); S.ui.addPrefill = q.value.trim(); S.ui.addMode = 'one'; go('add'); } },
      h('h3', null, 'Быстро добавить'), h('div', { class: 'row nowrap' }, h('div', { class: 'grow' }, q), h('button', { class: 'btn primary', type: 'submit' }, 'Добавить'))));

    // Подсказки и напоминания
    const drafts = words.filter(w => !w.ru && !w.archived);
    if (drafts.length) main.append(h('div', { class: 'banner' }, h('div', { class: 'grow' },
      h('b', null, drafts.length + ' ' + C.plural(drafts.length, 'черновик', 'черновика', 'черновиков') + ' без перевода'),
      h('span', null, 'В тренировки они попадут после перевода.'),
      h('div', { class: 'row' }, h('button', { class: 'btn sm soft', onclick: () => { S.ui.addMode = 'claude'; S.ui.claudeDrafts = true; go('add'); } }, 'Дополнить через Claude'),
        h('button', { class: 'btn sm ghost', onclick: () => { S.ui.dictFilter = 'draft'; go('dict'); } }, 'Показать')))));
    const backupDue = Prefs.backupDue();
    if (backupDue) main.append(h('div', { class: 'banner warn' }, h('div', { class: 'grow' },
      h('b', null, 'Пора сохранить резервную копию'),
      h('span', null, backupDue),
      h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: () => Prefs.exportBackup() }, 'Сохранить копию')))));
    if (words.some(w => w.demo)) main.append(h('div', { class: 'banner warn' }, h('div', { class: 'grow' },
      h('span', null, 'В словаре есть демо-слова (помечены «демо»). Ваши слова они не затрагивают.'),
      h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: async () => { await Prefs.removeDemo(); routes.today(); } }, 'Удалить демо-слова')))));

    // Недавно добавленные
    const recent = words.filter(w => !w.archived).sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
    if (recent.length) {
      main.append(h('div', { class: 'section-title' }, 'Недавно добавлены'));
      main.append(h('div', { class: 'wlist' }, recent.map(w => wordItem(w, now))));
    }
  };
  async function minutesStudiedToday() {
    try {
      const sod = C.startOfDay(Date.now());
      const sess = (await DB.all('sessions')).filter(s => s.ts >= sod);
      return Math.round(sess.reduce((a, s) => a + (s.durationSec || 0), 0) / 60);
    } catch (e) { return 0; }
  }

  // ---------- Элемент списка слов ----------
  const STATUS_LABEL = { new: 'новое', learning: 'изучаю', hard: 'сложное', solid: 'закреплено', draft: 'черновик', archived: 'архив' };
  function thumb(w) {
    return h('div', { class: 'thumb' }, w.image ? h('img', { src: w.image, alt: '', loading: 'lazy' }) : (w.emoji || h('span', { class: 'muted', style: { fontSize: '18px', fontWeight: 700 } }, (w.en || '?')[0].toUpperCase())));
  }
  function statusPills(w, now) {
    const st = C.wordStatus(w, now);
    const out = [h('span', { class: 'pill ' + st }, STATUS_LABEL[st])];
    if (C.wordDue(w, now)) out.push(h('span', { class: 'pill due' }, 'повторить'));
    if (w.demo) out.push(h('span', { class: 'pill demo' }, 'демо'));
    return out;
  }
  function wordItem(w, now, sel) {
    const selecting = sel && S.ui.select;
    const checked = selecting && S.ui.selected.has(w.id);
    const el = h('div', { class: 'witem' + (checked ? ' sel' : ''), role: 'button', tabindex: '0', 'data-id': w.id,
      onclick: () => {
        if (selecting) { S.ui.selected.has(w.id) ? S.ui.selected.delete(w.id) : S.ui.selected.add(w.id); sel(); }
        else go('word-' + w.id);
      } },
      selecting ? h('input', { type: 'checkbox', checked, tabindex: '-1', 'aria-label': 'Выбрать ' + w.en }) : null,
      thumb(w),
      h('div', { class: 't' }, h('div', { class: 'en' }, w.en), h('div', { class: 'ru' }, w.ru || 'перевода пока нет')),
      h('div', { class: 'side' }, h('div', { class: 'row', style: { gap: '4px', justifyContent: 'flex-end' } }, statusPills(w, now)),
        S.settings.sound && Speech.supported ? h('button', { class: 'icon-btn', style: { width: '40px', height: '40px' }, 'aria-label': 'Произнести ' + w.en, onclick: e => { e.stopPropagation(); Speech.say(w.en); } }, icon('speaker')) : null));
    el.addEventListener('keydown', e => { if (e.key === 'Enter') el.click(); });
    return el;
  }

  // ---------- Мой словарь ----------
  const FILTERS = [
    ['all', 'Все'], ['new', 'Новые'], ['learning', 'Изучаю'], ['due', 'Пора повторить'], ['hard', 'Сложные'], ['solid', 'Закреплённые'], ['draft', 'Черновики'], ['archived', 'Архив'],
  ];
  function matchFilter(w, f, now) {
    if (f === 'archived') return !!w.archived;
    if (w.archived) return false;
    if (f === 'all') return true;
    if (f === 'due') return C.wordDue(w, now);
    return C.wordStatus(w, now) === f;
  }
  routes.dict = function () {
    const main = screen({ title: 'Мой словарь', tab: 'dict', actions: h('button', { class: 'btn ghost sm', onclick: () => { S.ui.select = !S.ui.select; S.ui.selected.clear(); draw(); } }, S.ui.select ? 'Готово' : 'Выбрать') });
    const now = Date.now();
    const q = h('input', { class: 'input', type: 'search', id: 'dict-search', placeholder: 'Поиск: английский, русский, комментарий', value: S.ui.dictQuery, autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false',
      oninput: () => { S.ui.dictQuery = q.value; S.ui.shown = 150; drawList(); } });
    const setSel = h('select', { class: 'input', id: 'dict-set', 'aria-label': 'Набор', onchange: () => { S.ui.dictSet = setSel.value; drawList(); } },
      h('option', { value: 'all' }, 'Все наборы'), h('option', { value: 'none' }, 'Без набора'),
      [...S.sets.values()].sort((a, b) => a.name.localeCompare(b.name, 'ru')).map(s => h('option', { value: s.id }, s.name)));
    setSel.value = S.sets.has(S.ui.dictSet) || ['all', 'none'].includes(S.ui.dictSet) ? S.ui.dictSet : 'all';
    const chips = h('div', { class: 'chips', role: 'toolbar', 'aria-label': 'Фильтр' });
    const list = h('div', { class: 'wlist' });
    const bulk = h('div', { class: 'bulkbar', hidden: true });
    main.append(q, h('div', { class: 'row nowrap' }, h('div', { class: 'grow' }, setSel), h('button', { class: 'btn', onclick: manageSets }, 'Наборы')), chips, list);
    document.getElementById('app').append(bulk);

    function filtered() {
      const qq = C.norm(S.ui.dictQuery);
      return wordsArr().filter(w => matchFilter(w, S.ui.dictFilter, now))
        .filter(w => S.ui.dictSet === 'all' ? true : S.ui.dictSet === 'none' ? !w.setIds.length : w.setIds.includes(S.ui.dictSet))
        .filter(w => !qq || [w.en, w.ru, w.alt, w.comment, w.example, w.collocation].some(v => C.norm(v).includes(qq)))
        .sort((a, b) => b.createdAt - a.createdAt);
    }
    function drawChips() {
      chips.innerHTML = '';
      const base = wordsArr();
      FILTERS.forEach(([id, label]) => {
        const n = base.filter(w => matchFilter(w, id, now)).length;
        chips.append(h('button', { class: 'chip', 'aria-pressed': String(S.ui.dictFilter === id), onclick: () => { S.ui.dictFilter = id; S.ui.shown = 150; draw(); } }, label, h('span', { class: 'count' }, n)));
      });
    }
    function drawList() {
      list.innerHTML = '';
      const items = filtered();
      if (!items.length) {
        list.append(h('div', { class: 'card empty' }, h('p', { class: 'muted' }, wordsArr().length ? 'Ничего не найдено. Измените фильтр или поиск.' : 'Здесь появятся ваши слова.'),
          h('a', { class: 'btn primary', href: '#add' }, 'Добавить слово')));
      } else {
        items.slice(0, S.ui.shown).forEach(w => list.append(wordItem(w, now, drawSel)));
        if (items.length > S.ui.shown) list.append(h('button', { class: 'btn block', onclick: () => { S.ui.shown += 300; drawList(); } }, 'Показать ещё (' + (items.length - S.ui.shown) + ')'));
      }
      drawBulk(items);
    }
    function drawSel() { drawList(); }
    function drawBulk(items) {
      bulk.hidden = !S.ui.select; bulk.innerHTML = '';
      if (!S.ui.select) return;
      const n = S.ui.selected.size;
      const ids = [...S.ui.selected];
      bulk.append(
        h('button', { class: 'btn sm', onclick: () => { if (n === items.length) S.ui.selected.clear(); else items.forEach(w => S.ui.selected.add(w.id)); drawList(); } }, n === items.length && n ? 'Снять всё' : 'Выбрать все'),
        h('span', { class: 'small muted num', style: { whiteSpace: 'nowrap' } }, 'Выбрано: ' + n),
        h('button', { class: 'btn sm soft', disabled: !n, onclick: () => pickSet(ids, draw) }, 'В набор…'),
        S.ui.dictSet !== 'all' && S.ui.dictSet !== 'none' ? h('button', { class: 'btn sm', disabled: !n, onclick: async () => {
          const list2 = ids.map(id => S.words.get(id)).filter(Boolean); list2.forEach(w => { w.setIds = w.setIds.filter(x => x !== S.ui.dictSet); });
          await saveWords(list2); toast('Убрано из набора: ' + list2.length); S.ui.selected.clear(); draw(); } }, 'Убрать из набора') : null,
        S.ui.dictFilter === 'archived'
          ? h('button', { class: 'btn sm', disabled: !n, onclick: () => archive(ids, false, draw) }, 'Вернуть')
          : h('button', { class: 'btn sm', disabled: !n, onclick: () => archive(ids, true, draw) }, 'В архив'),
        h('button', { class: 'btn sm danger', disabled: !n, onclick: () => removeWords(ids, draw) }, 'Удалить'));
    }
    function draw() { routes.dict(); }
    drawChips(); drawList();
  };
  async function archive(ids, on, after) {
    const list = ids.map(id => S.words.get(id)).filter(Boolean);
    list.forEach(w => { w.archived = on; });
    await saveWords(list); S.ui.selected.clear();
    toast((on ? 'В архиве: ' : 'Возвращено: ') + list.length, { label: 'Отменить', fn: async () => { list.forEach(w => { w.archived = !on; }); await saveWords(list); after && after(); } });
    after && after();
  }
  async function removeWords(ids, after) {
    const list = ids.map(id => S.words.get(id)).filter(Boolean);
    const ok = await dialog({ title: 'Удалить ' + list.length + ' ' + C.plural(list.length, 'слово', 'слова', 'слов') + '?', text: 'Вместе с ними удалится их прогресс. Если хотите просто убрать слово из занятий — отправьте его в архив.', ok: 'Удалить', danger: true });
    if (!ok) return;
    list.forEach(w => S.words.delete(w.id));
    await DB.delMany('words', list.map(w => w.id)); bumpChanges(list.length);
    S.ui.selected.clear();
    toast('Удалено: ' + list.length, { label: 'Вернуть', fn: async () => { await saveWords(list); after && after(); } });
    after && after();
  }
  function pickSet(ids, after) {
    const name = h('input', { class: 'input', id: 'new-set-name', placeholder: 'Новый набор' });
    const sh = sheet('Добавить в набор', h('div', { class: 'stack' },
      h('p', { class: 'small muted' }, 'Слово может быть в нескольких наборах — прогресс у него один.'),
      [...S.sets.values()].map(s => h('button', { class: 'btn block', onclick: () => apply(s.id) }, s.name)),
      h('div', { class: 'row nowrap' }, h('div', { class: 'grow' }, name), h('button', { class: 'btn primary', onclick: async () => { const id = await ensureSet(name.value); if (id) apply(id); } }, 'Создать'))));
    async function apply(setId) {
      const list = ids.map(id => S.words.get(id)).filter(Boolean);
      list.forEach(w => { if (!w.setIds.includes(setId)) w.setIds.push(setId); });
      await saveWords(list); sh.close(); S.ui.selected.clear();
      toast('Добавлено в «' + setName(setId) + '»: ' + list.length); after && after();
    }
  }
  function manageSets() {
    const body = h('div', { class: 'stack' });
    const sh = sheet('Наборы', body);
    function draw() {
      body.innerHTML = '';
      const sets = [...S.sets.values()].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      if (!sets.length) body.append(h('p', { class: 'muted' }, 'Наборов пока нет. Например: «К следующему уроку», «Аренда жилья», «Спорт».'));
      sets.forEach(s => {
        const n = wordsArr().filter(w => w.setIds.includes(s.id)).length;
        const inp = h('input', { class: 'input', value: s.name, 'aria-label': 'Название набора' });
        body.append(h('div', { class: 'row nowrap' }, h('div', { class: 'grow' }, inp), h('span', { class: 'small muted num' }, n),
          h('button', { class: 'btn sm', onclick: async () => { const v = C.clean(inp.value); if (!v) return; s.name = v; await saveSet(s); toast('Переименовано'); } }, 'Сохранить'),
          h('button', { class: 'btn sm ghost', onclick: async () => {
            const ok = await dialog({ title: 'Удалить набор «' + s.name + '»?', text: 'Слова останутся в словаре со всем прогрессом — удалится только сам набор.', ok: 'Удалить набор', danger: true });
            if (!ok) return;
            const list = wordsArr().filter(w => w.setIds.includes(s.id)); list.forEach(w => { w.setIds = w.setIds.filter(x => x !== s.id); });
            await saveWords(list); S.sets.delete(s.id); await DB.del('sets', s.id); draw(); } }, 'Удалить')));
      });
      const nn = h('input', { class: 'input', id: 'set-new', placeholder: 'Название нового набора' });
      body.append(h('form', { class: 'row nowrap', onsubmit: async e => { e.preventDefault(); if (await ensureSet(nn.value)) draw(); } }, h('div', { class: 'grow' }, nn), h('button', { class: 'btn primary', type: 'submit' }, 'Создать')));
    }
    draw();
    sh.el.addEventListener('click', () => {}, { once: true });
  }

  // ---------- Карточка слова ----------
  routes.word = function (id) {
    const w = S.words.get(id);
    if (!w) { go('dict'); return; }
    const now = Date.now();
    const main = screen({ title: w.en, back: 'dict', actions: h('a', { class: 'icon-btn', href: '#edit-' + w.id, 'aria-label': 'Изменить' }, icon('edit')) });
    const card = h('article', { class: 'card wcard' });
    if (w.image || w.emoji) {
      card.append(h('div', { class: 'pic' }, w.image ? h('img', { src: w.image, alt: w.en }) : w.emoji));
      if (w.image && w.imageCredit) card.append(h('div', { class: 'credit' }, creditText(w.imageCredit)));
    }
    if (window.Pics) card.append(Pics.controls(w, () => routes.word(id)));
    card.append(h('div', { class: 'row', style: { gap: '6px' } }, statusPills(w, now), w.pos ? h('span', { class: 'pill' }, w.pos) : null));
    card.append(h('div', { class: 'stack', style: { gap: '4px' } }, h('div', { class: 'word-en', lang: 'en' }, w.en), sayButtons(w.en)));
    card.append(h('div', { class: 'stack', style: { gap: '2px' } },
      h('div', { class: 'word-ru' }, w.ru || h('span', { class: 'muted' }, 'Перевода пока нет — это черновик')),
      w.alt ? h('div', { class: 'muted small' }, 'Другие значения: ' + w.alt) : null));
    const irr = C.irregular(w.en);
    if (irr) card.append(h('div', { class: 'stack', style: { gap: '6px' } }, h('h3', null, 'Неправильный глагол'),
      h('div', { class: 'forms' },
        h('div', null, h('b', { lang: 'en' }, irr.v1), h('span', null, 'сейчас, обычно: I ' + irr.v1)),
        h('div', null, h('b', { lang: 'en' }, irr.v2), h('span', null, 'в прошлом: вчера I ' + irr.v2.split(' / ')[0])),
        h('div', null, h('b', { lang: 'en' }, irr.v3), h('span', null, '3-я форма: после have — I have ' + irr.v3.split(' / ')[0]))),
      h('div', { class: 'say' }, h('button', { class: 'btn soft sm', onclick: () => Speech.say(irr.v1 + ', ' + irr.v2 + ', ' + irr.v3, true) }, icon('speaker'), 'Все три формы'))));
    else if (w.forms) card.append(kv('Формы', w.forms));
    if (w.example) card.append(h('div', { class: 'example' }, h('div', { class: 'en-s', lang: 'en' }, w.example), w.exampleRu ? h('div', { class: 'muted' }, w.exampleRu) : null, sayButtons(w.example, { label: 'Пример' })));
    if (w.collocation) card.append(h('div', { class: 'stack', style: { gap: '4px' } }, kv('Частое сочетание', w.collocation), sayButtons(w.collocation, { label: 'Сочетание' })));
    if (w.comment) card.append(kv('Мой комментарий', w.comment));
    if (w.setIds.length) card.append(kv('Наборы', w.setIds.map(setName).join(', ')));
    if (w.source) card.append(kv('Откуда слово', w.source));
    const rg = w.srs.recog, rc = w.srs.recall;
    card.append(h('div', { class: 'stack', style: { gap: '4px' } }, h('h3', null, 'Повторения'),
      h('p', { class: 'small' }, 'Узнавание (видите слово → понимаете): ' + (rg && rg.reps ? 'следующее ' + C.inDays(rg.due, now) : 'ещё не начато')),
      h('p', { class: 'small' }, 'Вспоминание (сами пишете слово): ' + (rc && rc.reps ? 'следующее ' + C.inDays(rc.due, now) : (rg && rg.reps ? 'начнётся после узнавания' : 'ещё не начато'))),
      h('p', { class: 'small muted' }, 'Ответов: верно ' + (w.stats.right || 0) + ', ошибок ' + (w.stats.wrong || 0) + ', с подсказкой ' + (w.stats.hints || 0) + '. «Закреплено» не значит «выучено навсегда» — повторы продолжаются всё реже.')));
    const more = h('details', null, h('summary', null, 'Дополнительно'),
      h('div', { class: 'stack', style: { marginTop: '8px' } },
        w.phonetic ? kv('Транскрипция', w.phonetic) : null,
        kv('Добавлено', fmtDate(w.createdAt)),
        Object.keys(w.auto || {}).length ? h('p', { class: 'tiny muted' }, 'Часть полей заполнена автоматически: ' + Object.keys(w.auto).join(', ') + '. Проверьте и исправьте при необходимости.') : null));
    card.append(more);
    main.append(card);
    main.append(h('div', { class: 'stack' },
      h('a', { class: 'btn primary block', href: '#edit-' + w.id }, icon('edit'), 'Изменить перевод, пример, картинку'),
      h('div', { class: 'split stack-narrow' },
        h('button', { class: 'btn', onclick: () => pickSet([w.id], () => routes.word(id)) }, 'В набор…'),
        h('button', { class: 'btn', onclick: async () => {
          if (w.archived) { w.archived = false; await saveWord(w); toast('Слово снова в занятиях'); }
          else { w.archived = true; await saveWord(w); toast('Слово в архиве', { label: 'Отменить', fn: async () => { w.archived = false; await saveWord(w); routes.word(id); } }); }
          routes.word(id); } }, w.archived ? 'Вернуть из архива' : 'В архив')),
      h('div', { class: 'split stack-narrow' },
        h('button', { class: 'btn', onclick: async () => {
          const ok = await dialog({ title: 'Начать слово заново?', text: 'Расписание повторений сбросится, слово снова станет новым. История ответов сохранится.', ok: 'Начать заново' });
          if (!ok) return; w.srs = { recog: null, recall: null }; w.archived = false; w.firstSeen = 0; await saveWord(w); toast('Слово снова в изучении'); routes.word(id); } }, 'Вернуть к изучению'),
        h('button', { class: 'btn ghost', style: { color: 'var(--bad)' }, onclick: () => removeWords([w.id], () => go('dict')) }, 'Удалить'))));
  };
  function kv(k, v) { return h('dl', { class: 'kv', style: { margin: 0 } }, h('dt', null, k), h('dd', null, v)); }
  function creditText(c) {
    return [c.title ? '«' + c.title + '»' : 'Фото', c.creator ? c.creator : null, c.license ? 'лицензия ' + String(c.license).toUpperCase() + (c.licenseVersion ? ' ' + c.licenseVersion : '') : null, c.source].filter(Boolean).join(' · ');
  }

  // ---------- Редактирование ----------
  routes.edit = function (id) {
    const w = S.words.get(id);
    if (!w) { go('dict'); return; }
    const main = screen({ title: 'Изменить', back: 'word-' + id, nav: false });
    const form = Add.wordForm(w, async (data) => {
      Object.assign(w, data);
      await saveWord(w); toast('Сохранено'); history.length > 1 ? history.back() : go('word-' + id);
    });
    main.append(form);
  };

  // ---------- Запуск ----------
  async function boot() {
    Speech.load();
    S.storage = await DB.open();
    try {
      const [words, sets, settings] = await Promise.all([DB.all('words'), DB.all('sets'), DB.get('kv', 'settings')]);
      words.forEach(w => { w.setIds = w.setIds || []; w.stats = w.stats || { right: 0, wrong: 0, hints: 0, hist: [] }; w.srs = w.srs || { recog: null, recall: null }; S.words.set(w.id, w); });
      sets.forEach(s => S.sets.set(s.id, s));
      S.settings = Object.assign({}, DEFAULTS, settings || {});
    } catch (e) { S.settings = Object.assign({}, DEFAULTS); S.storage = { ok: false, error: e.message }; }
    if (!S.settings.installedAt) { S.settings.installedAt = Date.now(); saveSettings(); }
    // попросить браузер не удалять данные (на iPhone с домашнего экрана это и так соблюдается)
    try { if (navigator.storage && navigator.storage.persist) { const p = await navigator.storage.persisted(); if (!p) navigator.storage.persist(); } } catch (e) { /* нет поддержки */ }
    window.addEventListener('hashchange', route);
    if (window.TG && TG.inTG) TG.start();
    route();
    if (window.Pics) Pics.resume();
    if ('serviceWorker' in navigator && window.isSecureContext && !window.__ARTIFACT__) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* офлайн-режим недоступен в этой среде */ });
    }
  }

  window.App = { S, h, $, icon, toast, dialog, sheet, esc, go, routes, screen, Speech, sayButtons, saveWord, saveWords, saveSet, saveSettings,
    kvSet, kvGet, newWord, mergeInto, wordsArr, activeWords, setName, ensureSet, logAnswer, wordItem, thumb, creditText, fmtDate,
    APP_VERSION, DATA_FORMAT, DEFAULTS, todayStats, pickSet, minutesStudiedToday };
  document.addEventListener('DOMContentLoaded', boot);
})();
