/* Мои слова — добавление: одно слово, список, текст, файл, ответ из чата Claude; онлайн-подсказки; картинки; предпросмотр импорта. */
(function () {
  'use strict';
  const C = window.Core;
  const { S, h, $, icon, toast, dialog, go, routes, screen, Speech, saveWord, saveWords, kvSet, kvGet, newWord, mergeInto, wordsArr, setName, ensureSet } = window.App;

  // ---------- Онлайн-подсказки (только по нажатию) ----------
  async function fetchJSON(url, ms) {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), ms || 9000);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (r.status === 404) return { notFound: true };
      if (!r.ok) throw new Error('сервис ответил ' + r.status);
      return await r.json();
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('сервис не ответил вовремя');
      throw new Error(S.online ? 'сервис недоступен (' + e.message + ')' : 'нет интернета');
    } finally { clearTimeout(t); }
  }
  const Svc = {
    // MyMemory: бесплатно, без ключа, ~5000 символов в день
    async translate(text, from, to) {
      const j = await fetchJSON('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=' + from + '|' + to);
      const main = j && j.responseData && j.responseData.translatedText || '';
      if (/MYMEMORY WARNING|QUOTA/i.test(main) || j.responseStatus === 429) throw new Error('дневной лимит бесплатного перевода исчерпан — попробуйте завтра');
      const alts = [];
      (j.matches || []).forEach(m => {
        const tr = C.clean(m.translation); if (!tr || tr.length > 60) return;
        if (C.norm(tr) === C.norm(main) || alts.some(a => C.norm(a) === C.norm(tr))) return;
        if (C.script(tr) !== (to === 'ru' ? 'ru' : 'en')) return;
        alts.push(tr.toLowerCase() === tr ? tr : tr);
      });
      return { main: C.clean(main).replace(/[.。]$/, ''), alts: alts.slice(0, 4) };
    },
    // Free Dictionary API: часть речи, транскрипция, примеры
    async dictionary(en) {
      const j = await fetchJSON('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(en.toLowerCase()));
      if (!Array.isArray(j)) return null;
      const out = { pos: '', phonetic: '', examples: [] };
      j.forEach(e => {
        if (!out.phonetic) out.phonetic = e.phonetic || (e.phonetics || []).map(p => p.text).find(Boolean) || '';
        (e.meanings || []).forEach(m => {
          if (!out.pos) out.pos = C.POS_RU[m.partOfSpeech] || m.partOfSpeech;
          (m.definitions || []).forEach(d => { if (d.example) out.examples.push(d.example); });
        });
      });
      out.examples.sort((a, b) => a.split(' ').length - b.split(' ').length);
      out.example = out.examples.find(x => x.split(' ').length <= 10 && C.findInSentence(x, en)) || '';
      return out;
    },
    // Openverse: картинки под свободными лицензиями
    async images(q) {
      const j = await fetchJSON('https://api.openverse.org/v1/images/?q=' + encodeURIComponent(q) + '&page_size=12&mature=false', 12000);
      return (j.results || []).map(r => ({ thumb: r.thumbnail || r.url, url: r.url, title: r.title, creator: r.creator, license: r.license, licenseVersion: r.license_version, source: r.foreign_landing_url ? 'Openverse/' + (r.source || r.provider || '') : 'Openverse', landing: r.foreign_landing_url }));
    },
  };

  // Сжать картинку до ~480px JPEG (для своих фото и найденных)
  function imageToDataURL(src, max) {
    max = max || 400;
    return new Promise((resolve, reject) => {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        try { resolve(c.toDataURL('image/jpeg', 0.82)); } catch (e) { reject(new Error('картинку нельзя сохранить в словарь (ограничение сайта-источника)')); }
      };
      img.onerror = () => reject(new Error('картинка не загрузилась'));
      img.src = src;
    });
  }
  function fileToDataURL(file) {
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => imageToDataURL(r.result).then(res, rej); r.onerror = () => rej(r.error); r.readAsDataURL(file); });
  }

  // ---------- Форма слова (добавление и редактирование) ----------
  const FIELDS = [
    ['ru', 'Перевод (главное значение)', 'например: снимать (жильё)'],
    ['alt', 'Другие значения', 'через запятую'],
    ['example', 'Пример на английском', 'короткая простая фраза'],
    ['exampleRu', 'Перевод примера', ''],
    ['collocation', 'Частое сочетание', 'например: rent a car'],
    ['pos', 'Часть речи', 'сущ., глагол, выражение…'],
    ['forms', 'Формы слова', 'для неправильных глаголов заполнится сам'],
    ['comment', 'Мой комментарий', 'подсказка себе по-русски'],
    ['source', 'Откуда слово (контекст)', 'фраза, где встретили'],
  ];
  function wordForm(w, onSave, opts) {
    opts = opts || {};
    const isNew = !w;
    const data = w ? JSON.parse(JSON.stringify(w)) : { en: '', ru: '', setIds: S.ui.lastSetIds ? S.ui.lastSetIds.slice() : [], auto: {} };
    data.auto = data.auto || {};
    const form = h('form', { class: 'stack', autocomplete: 'off', onsubmit: e => { e.preventDefault(); submit(); } });
    const inputs = {};
    const status = h('div', { class: 'stack' });
    const enInput = h('input', { class: 'input big', id: 'f-en', value: data.en || '', placeholder: 'Слово или выражение', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', lang: 'en', enterkeyhint: 'next' });
    inputs.en = enInput;
    const dupBox = h('div');
    const autoBtn = h('button', { class: 'btn soft block', type: 'button', onclick: () => suggest() }, icon('search'), 'Подсказать перевод и пример');
    const ruToEnBtn = h('button', { class: 'btn soft block', type: 'button', hidden: true, onclick: () => ruToEn() }, 'Перевести на английский');
    const sayRow = h('div');
    form.append(h('div', { class: 'card stack' },
      h('label', { class: 'field', for: 'f-en' }, 'Английский (или по-русски — переведём)', enInput),
      sayRow, dupBox, h('div', { class: 'stack' }, ruToEnBtn, autoBtn), status));

    const fieldsCard = h('div', { class: 'card stack' });
    const moreInner = h('div', { class: 'stack', style: { marginTop: '10px' } });
    const moreBox = h('details', null, h('summary', null, 'Пример, комментарий и другие поля'), moreInner);
    FIELDS.forEach(([k, label, ph], i) => {
      const big = ['example', 'comment', 'source'].includes(k);
      const el = big ? h('textarea', { class: 'input', id: 'f-' + k, rows: 2, style: { minHeight: '64px' }, placeholder: ph, lang: ['example', 'collocation'].includes(k) ? 'en' : 'ru', autocapitalize: ['example'].includes(k) ? 'sentences' : 'off' }, data[k] || '')
        : h('input', { class: 'input', id: 'f-' + k, value: data[k] || '', placeholder: ph, autocapitalize: 'off', autocorrect: k === 'ru' ? 'on' : 'off', spellcheck: 'false' });
      inputs[k] = el;
      el.addEventListener('input', () => { delete data.auto[k]; badge(k); persist(); });
      const lab = h('label', { class: 'field', for: 'f-' + k }, h('span', null, label, h('span', { class: 'auto-badge', id: 'b-' + k, hidden: !data.auto[k] }, 'автоматически — проверьте')), el);
      if (i < 1 || !isNew) fieldsCard.append(lab); else moreInner.append(lab);
    });
    if (isNew) fieldsCard.append(moreBox);
    form.append(fieldsCard);

    // Картинка / ассоциация
    const picBox = h('div', { class: 'card stack' });
    form.append(picBox);
    function drawPic() {
      picBox.innerHTML = '';
      picBox.append(h('h3', null, 'Картинка или ассоциация'),
        h('p', { class: 'small muted' }, 'Не обязательно. Для абстрактных слов лучше картинка ситуации (например, для «rent» — ключи от квартиры).'));
      if (data.image) picBox.append(h('div', { class: 'stack' }, h('img', { src: data.image, alt: '', style: { borderRadius: '12px', maxHeight: '220px', objectFit: 'cover', width: '100%' } }),
        data.imageCredit ? h('div', { class: 'tiny muted' }, App.creditText(data.imageCredit)) : null,
        h('button', { class: 'btn sm', type: 'button', onclick: () => { data.image = ''; data.imageCredit = null; drawPic(); persist(); } }, 'Убрать картинку')));
      const file = h('input', { type: 'file', accept: 'image/*', hidden: true, onchange: async () => {
        const f = file.files[0]; if (!f) return;
        try { data.image = await fileToDataURL(f); data.imageCredit = { title: 'Моя картинка' }; drawPic(); persist(); } catch (e) { toast('Не получилось: ' + e.message); }
      } });
      const emoji = h('input', { class: 'input', id: 'f-emoji', value: data.emoji || '', placeholder: 'Эмодзи-ассоциация, напр. 🔑', style: { maxWidth: '100%' }, oninput: () => { data.emoji = emoji.value.trim(); persist(); } });
      picBox.append(h('div', { class: 'split stack-narrow' },
        h('button', { class: 'btn', type: 'button', onclick: () => file.click() }, 'Своё фото'),
        h('button', { class: 'btn', type: 'button', onclick: () => imageSearch() }, 'Найти картинку')), file,
        h('label', { class: 'field', for: 'f-emoji' }, 'Или эмодзи (работает без интернета)', emoji));
    }
    drawPic();

    // Наборы
    const setsBox = h('div', { class: 'card stack' });
    form.append(setsBox);
    function drawSets() {
      setsBox.innerHTML = '';
      setsBox.append(h('h3', null, 'Наборы'));
      const chips = h('div', { class: 'row', style: { gap: '8px' } });
      [...S.sets.values()].forEach(s => chips.append(h('button', { type: 'button', class: 'chip', 'aria-pressed': String(data.setIds.includes(s.id)), onclick: () => {
        data.setIds = data.setIds.includes(s.id) ? data.setIds.filter(x => x !== s.id) : data.setIds.concat(s.id); drawSets(); persist(); } }, s.name)));
      const nn = h('input', { class: 'input', id: 'f-newset', placeholder: 'Новый набор, напр. «К следующему уроку»' });
      setsBox.append(chips, h('div', { class: 'row nowrap' }, h('div', { class: 'grow' }, nn),
        h('button', { class: 'btn', type: 'button', onclick: async () => { const id = await ensureSet(nn.value); if (id) { if (!data.setIds.includes(id)) data.setIds.push(id); drawSets(); } } }, 'Создать')));
    }
    drawSets();

    const saveBtn = h('button', { class: 'btn primary big block', type: 'submit' }, isNew ? 'Сохранить' : 'Сохранить изменения');
    form.append(h('div', { class: 'savebar' + (isNew ? '' : ' nonav') }, saveBtn));

    function badge(k) { const b = form.querySelector('#b-' + k); if (b) b.hidden = !data.auto[k]; }
    function read() {
      data.en = C.clean(enInput.value);
      FIELDS.forEach(([k]) => { data[k] = C.clean(inputs[k].value); });
      return data;
    }
    let persistT = null;
    function persist() { if (!isNew) return; clearTimeout(persistT); persistT = setTimeout(() => kvSet('addDraft', read()), 350); }
    function refresh() {
      const v = enInput.value.trim();
      const isRu = C.script(v) === 'ru';
      ruToEnBtn.hidden = !isRu; autoBtn.hidden = isRu || !v;
      saveBtn.textContent = !v ? (isNew ? 'Сохранить' : 'Сохранить изменения') : !C.clean(inputs.ru.value) && isNew ? 'Сохранить черновик (без перевода)' : (isNew ? 'Сохранить' : 'Сохранить изменения');
      sayRow.innerHTML = ''; if (v && !isRu) sayRow.append(App.sayButtons(v));
      dupBox.innerHTML = '';
      if (v && !isRu) {
        const ke = C.keyEn(v);
        const same = wordsArr().filter(x => C.keyEn(x.en) === ke && (!w || x.id !== w.id));
        if (same.length) dupBox.append(h('div', { class: 'banner warn' }, h('div', { class: 'grow' },
          h('b', null, 'Уже в словаре: '), h('span', null, same.map(x => x.en + ' — ' + (x.ru || 'черновик')).join('; ')),
          h('span', { class: 'small' }, 'Если это другое значение — сохраните, будет отдельная карточка.'),
          h('div', null, h('a', { class: 'btn sm', href: '#word-' + same[0].id }, 'Открыть')))));
        if (!inputs.forms.value) { const irr = C.irregular(v); if (irr) { inputs.forms.value = irr.text; data.auto.forms = 1; badge('forms'); } }
      }
    }
    enInput.addEventListener('input', () => { refresh(); persist(); });
    inputs.ru.addEventListener('input', refresh);

    async function ruToEn() {
      const ru = enInput.value.trim();
      if (!S.settings.online) return toast('Онлайн-подсказки выключены в настройках');
      busy(true, 'Перевожу «' + ru + '» через MyMemory…');
      try {
        const r = await Svc.translate(ru, 'ru', 'en');
        if (!r.main) throw new Error('перевод не найден');
        if (!inputs.ru.value) { inputs.ru.value = ru; }
        enInput.value = r.main.toLowerCase() === r.main ? r.main : r.main.replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase());
        data.auto.en = 1;
        status.innerHTML = '';
        status.append(h('p', { class: 'small' }, 'Предложено: ', h('b', null, enInput.value), r.alts.length ? '. Ещё варианты: ' : '',
          r.alts.map(a => h('button', { type: 'button', class: 'chip', style: { margin: '2px' }, onclick: () => { enInput.value = a; refresh(); } }, a))));
        refresh();
      } catch (e) { busy(false); status.append(errorBox(e)); return; }
      busy(false, true);
    }
    async function suggest() {
      const en = enInput.value.trim(); if (!en) return enInput.focus();
      if (!S.settings.online) return toast('Онлайн-подсказки выключены в настройках');
      busy(true, 'Ищу перевод (MyMemory) и пример (Free Dictionary)…');
      const errs = [];
      const [tr, dict] = await Promise.all([
        Svc.translate(en, 'en', 'ru').catch(e => { errs.push('перевод: ' + e.message); return null; }),
        en.split(' ').length <= 3 ? Svc.dictionary(en).catch(e => { errs.push('словарь: ' + e.message); return null; }) : Promise.resolve(null),
      ]);
      const fill = (k, v) => { if (v && !inputs[k].value) { inputs[k].value = v; data.auto[k] = 1; badge(k); } };
      if (tr) { fill('ru', tr.main.toLowerCase() === tr.main ? tr.main : tr.main.charAt(0).toLowerCase() + tr.main.slice(1)); fill('alt', tr.alts.filter(a => C.norm(a) !== C.norm(inputs.ru.value)).join(', ')); }
      if (dict) { fill('pos', dict.pos); data.phonetic = data.phonetic || dict.phonetic; fill('example', dict.example); }
      if (inputs.example.value && !inputs.exampleRu.value && data.auto.example) {
        try { const t2 = await Svc.translate(inputs.example.value, 'en', 'ru'); fill('exampleRu', t2.main); } catch (e) { errs.push('перевод примера: ' + e.message); }
      }
      busy(false);
      status.innerHTML = '';
      const got = Object.keys(data.auto).length;
      status.append(h('p', { class: 'small muted' }, got ? 'Заполнила пустые поля. Проверьте: машинный перевод бывает неточным, а пример из словаря — сложнее уровня A1.' : 'Ничего не нашлось.'));
      if (errs.length) status.append(h('div', { class: 'banner warn' }, h('div', { class: 'grow' }, h('span', null, 'Не всё получилось: ' + errs.join('; ') + '.'), h('span', { class: 'small' }, 'Можно сохранить как есть и дополнить позже.'))));
      if (Object.keys(data.auto).some(k => k !== 'ru')) { const d = form.querySelector('details'); if (d) d.open = true; }
      persist(); refresh();
    }
    function busy(on, text) {
      autoBtn.disabled = ruToEnBtn.disabled = on;
      if (on) { status.innerHTML = ''; status.append(h('div', { class: 'row small muted' }, h('span', { class: 'spin' }), text)); }
    }
    function errorBox(e) { return h('div', { class: 'banner warn' }, h('div', { class: 'grow' }, 'Не получилось: ' + e.message + '. Можно вписать перевод вручную или сохранить черновик.')); }

    async function imageSearch() {
      const en = (enInput.value || data.en || '').trim();
      if (!S.settings.online) return toast('Онлайн-подсказки выключены в настройках');
      const q = h('input', { class: 'input', id: 'img-q', value: en, placeholder: 'Что искать (по-английски)' });
      const grid = h('div', { class: 'imgpick' });
      const note = h('p', { class: 'small muted' }, 'Картинки из Wikimedia Commons и Openverse — под свободными лицензиями. Подбираются по ключевым словам, поэтому выбирайте ту, что действительно подходит, или уточните запрос: для «rent» — «apartment keys».');
      const sh = App.sheet('Найти картинку', h('div', { class: 'stack' }, note,
        h('form', { class: 'row nowrap', onsubmit: e => { e.preventDefault(); run(); } }, h('div', { class: 'grow' }, q), h('button', { class: 'btn primary', type: 'submit' }, 'Искать')), grid));
      async function run() {
        grid.innerHTML = ''; grid.append(h('div', { class: 'row small muted', style: { gridColumn: '1/-1' } }, h('span', { class: 'spin' }), 'Ищу…'));
        try {
          const res = await Pics.search(q.value.trim());
          grid.innerHTML = '';
          if (!res.length) grid.append(h('p', { class: 'muted', style: { gridColumn: '1/-1' } }, 'Ничего не нашлось. Попробуйте другие слова или своё фото.'));
          res.forEach(r => grid.append(h('button', { type: 'button', 'aria-label': r.title || 'картинка', onclick: async () => {
            try {
              data.image = await imageToDataURL(r.thumb);
              data.imageCredit = { title: r.title, creator: r.creator, license: r.license, source: r.source, url: r.url };
              if (data.auto) delete data.auto.image;
              sh.close(); drawPic(); persist();
            } catch (e) { toast('Эту картинку нельзя сохранить: ' + e.message); }
          } }, h('img', { src: r.thumb, alt: r.title || '', loading: 'lazy' }))));
        } catch (e) { grid.innerHTML = ''; grid.append(h('p', { class: 'muted', style: { gridColumn: '1/-1' } }, 'Поиск не сработал: ' + e.message + '. Можно загрузить своё фото или выбрать эмодзи.')); }
      }
      if (q.value) run();
    }

    async function submit() {
      read();
      if (!data.en) { enInput.focus(); toast('Впишите слово или выражение'); return; }
      if (C.script(data.en) === 'ru') { toast('Слово написано по-русски — нажмите «Перевести на английский» или впишите английский вариант'); return; }
      S.ui.lastSetIds = data.setIds.slice();
      if (isNew) {
        const nw = newWord(Object.assign({}, data));
        nw.auto = data.auto; nw.phonetic = data.phonetic || '';
        await saveWord(nw);
        await kvSet('addDraft', null);
        toast(nw.ru ? 'Добавлено: ' + nw.en : 'Черновик сохранён: ' + nw.en, { label: 'Открыть', fn: () => go('word-' + nw.id) });
        if (!nw.image && window.Pics) Pics.enqueue([nw.id]);
        onSave && onSave(nw);
      } else onSave(data);
    }
    form.fill = (d) => { if (d.en) enInput.value = d.en; FIELDS.forEach(([k]) => { if (d[k]) inputs[k].value = d[k]; }); if (d.setIds) data.setIds = d.setIds; if (d.image) data.image = d.image; if (d.emoji) data.emoji = d.emoji; data.auto = d.auto || {}; drawPic(); drawSets(); refresh(); FIELDS.forEach(([k]) => badge(k)); };
    setTimeout(refresh, 0);
    return form;
  }

  // ---------- Экран «Добавить» ----------
  const MODES = [['sets', 'Наборы'], ['one', 'Слово'], ['list', 'Список'], ['text', 'Из текста'], ['file', 'Файл'], ['photo', 'Фото и голос']];
  routes.add = async function () {
    const mode = S.ui.addMode || 'one';
    if (mode === 'sets') { S.ui.addMode = 'one'; go('sets'); return; }
    const main = screen({ title: 'Добавить', tab: 'add' });
    const seg = h('div', { class: 'seg', role: 'tablist' }, MODES.map(([id, label]) => h('button', { role: 'tab', 'aria-pressed': String(mode === id), onclick: () => { S.ui.addMode = id; routes.add(); } }, label)));
    main.append(seg);
    const body = h('div', { class: 'stack' });
    main.append(body);
    // Незавершённый импорт (предпросмотр) переживает закрытие приложения
    const pending = await kvGet('importDraft');
    if (pending && pending.rows && pending.rows.length && mode !== 'preview') {
      body.append(h('div', { class: 'banner' }, h('div', { class: 'grow' }, h('b', null, 'Есть незавершённый импорт: ' + pending.rows.length + ' строк'),
        h('div', { class: 'row' }, h('button', { class: 'btn sm primary', onclick: () => showPreview(pending.rows, pending.meta) }, 'Продолжить'),
          h('button', { class: 'btn sm ghost', onclick: async () => { await kvSet('importDraft', null); routes.add(); } }, 'Отменить импорт')))));
    }
    if (mode === 'one') {
      const form = wordForm(null, () => routes.add());
      const draft = await kvGet('addDraft');
      if (S.ui.addPrefill) { form.fill({ en: S.ui.addPrefill }); S.ui.addPrefill = null; }
      else if (draft && (draft.en || draft.ru)) { form.fill(draft); body.append(h('p', { class: 'small muted' }, 'Восстановлено то, что вы не успели сохранить.')); }
      body.append(form);
      setTimeout(() => { const i = $('#f-en'); if (i && !i.value) i.focus(); }, 50);
    } else if (mode === 'list') listMode(body);
    else if (mode === 'text') textMode(body);
    else if (mode === 'claude') claudeMode(body);
    else if (mode === 'file') fileMode(body);
    else if (mode === 'photo') photoMode(body);
  };

  // --- Список ---
  function listMode(body) {
    const ta = h('textarea', { class: 'input', id: 'list-text', rows: 10, placeholder: 'rent — снимать (жильё)\nlook after - присматривать\nbeach\tпляж\ncheck in; регистрироваться\nsunscreen', autocapitalize: 'off', spellcheck: 'false' }, S.ui.listText || '');
    ta.addEventListener('input', () => { S.ui.listText = ta.value; kvSet('listText', ta.value); });
    kvGet('listText').then(v => { if (v && !ta.value) ta.value = S.ui.listText = v; });
    const delim = h('select', { class: 'input', id: 'list-delim' }, h('option', { value: 'auto' }, 'Определить автоматически'), C.DELIMS.map(d => h('option', { value: d.id }, d.label)), h('option', { value: 'none' }, 'Без перевода (одно слово в строке)'));
    const rows = h('select', { class: 'input', id: 'list-rows' }, h('option', { value: 'nl' }, 'Каждое слово с новой строки'), h('option', { value: 'semi' }, 'Записи через «;» (экспорт Quizlet)'));
    body.append(h('div', { class: 'card stack' },
      h('p', { class: 'small muted' }, 'Вставьте список. Слово и перевод можно разделять табуляцией, тире, «-», «=» или «;». Фразы вроде «look after» сохраняются целиком. Строки без перевода станут черновиками.'),
      ta,
      h('details', null, h('summary', null, 'Формат списка'), h('div', { class: 'stack', style: { marginTop: '8px' } },
        h('label', { class: 'field', for: 'list-delim' }, 'Разделитель слова и перевода', delim),
        h('label', { class: 'field', for: 'list-rows' }, 'Разделитель записей', rows),
        h('p', { class: 'tiny muted' }, 'Из Quizlet: в наборе «Экспорт» → между термином и определением «Табуляция», между строками «Новая строка» — и вставьте сюда.'))),
      h('button', { class: 'btn primary big block', onclick: () => {
        if (!ta.value.trim()) return toast('Вставьте хотя бы одно слово');
        const opts = { delimiter: delim.value === 'none' ? 'nonexistent' : delim.value, rowSep: rows.value };
        const r = C.parseList(ta.value, opts);
        showPreview(r.rows, { from: 'list', ambiguous: r.ambiguous, delimiter: r.delimiter });
      } }, 'Разобрать и проверить')));
  }

  // --- Из текста ---
  function textMode(body) {
    const ta = h('textarea', { class: 'input', id: 'text-src', rows: 8, placeholder: 'Вставьте текст, переписку или объявление об аренде на английском', spellcheck: 'false' }, S.ui.textSrc || '');
    ta.addEventListener('input', () => { S.ui.textSrc = ta.value; kvSet('textSrc', ta.value); });
    kvGet('textSrc').then(v => { if (v && !ta.value) ta.value = S.ui.textSrc = v; });
    const out = h('div', { class: 'stack' });
    body.append(h('div', { class: 'card stack' },
      h('p', { class: 'small muted' }, 'Вставьте текст → отметьте незнакомые слова или целые фразы. Предложение сохранится как контекст. Текст никуда не отправляется.'),
      ta, h('button', { class: 'btn primary block', onclick: () => pick() }, 'Выбрать слова')), out);
    function pick() {
      const sents = C.sentencesOf(ta.value);
      if (!sents.length) return toast('Вставьте текст');
      const known = new Set(wordsArr().map(w => C.keyEn(w.en)));
      const sel = []; // {si, a, b}
      let phraseMode = false, start = null;
      out.innerHTML = '';
      const modeSeg = h('div', { class: 'seg' });
      const reader = h('div', { class: 'card reader', lang: 'en' });
      const chosen = h('div', { class: 'stack' });
      out.append(modeSeg, h('p', { class: 'tiny muted' }, 'Подчёркнутые — уже в словаре. Нажмите слово, чтобы выбрать. Для фразы включите «Фраза» и нажмите первое и последнее слово.'), reader, chosen);
      const toks = sents.map(s => C.tokenize(s));
      function drawMode() {
        modeSeg.innerHTML = '';
        [['word', 'Слово'], ['phrase', 'Фраза (начало → конец)']].forEach(([id, l]) => modeSeg.append(h('button', { 'aria-pressed': String((id === 'phrase') === phraseMode), onclick: () => { phraseMode = id === 'phrase'; start = null; drawMode(); drawReader(); } }, l)));
      }
      function inSel(si, i) { return sel.find(x => x.si === si && i >= x.a && i <= x.b); }
      function drawReader() {
        reader.innerHTML = '';
        toks.forEach((ts, si) => {
          ts.forEach((t, i) => {
            if (/^[.,!?;:]$/.test(t)) { reader.append(t + ' '); return; }
            const isKnown = known.has(C.keyEn(t));
            const s = inSel(si, i);
            const el = h('span', { class: 'tok' + (isKnown ? ' known' : '') + (s ? ' sel' : '') + (start && start.si === si && start.i === i ? ' start' : ''), role: 'button', tabindex: '0', onclick: () => tap(si, i) }, t);
            reader.append(el, ' ');
          });
          reader.append(h('br'));
        });
        chosen.innerHTML = '';
        if (sel.length) {
          chosen.append(h('h3', null, 'Выбрано: ' + sel.length),
            h('div', { class: 'row', style: { gap: '6px' } }, sel.map((x, k) => h('button', { class: 'chip', 'aria-pressed': 'true', onclick: () => { sel.splice(k, 1); drawReader(); } }, phrase(x), ' ×'))),
            h('button', { class: 'btn primary big block', onclick: () => {
              const rows = sel.map((x, k) => {
                const sentence = sents[x.si];
                const ph = phrase(x);
                return { line: k + 1, en: ph, ru: '', source: sentence, example: sentence.split(' ').length <= 12 ? sentence : '' };
              });
              showPreview(rows, { from: 'text' });
            } }, 'Дальше: перевод и сохранение'));
        }
      }
      function phrase(x) { return toks[x.si].slice(x.a, x.b + 1).filter(t => !/^[.,!?;:]$/.test(t)).join(' ').replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase()); }
      function tap(si, i) {
        const ex = sel.findIndex(x => x.si === si && i >= x.a && i <= x.b);
        if (ex >= 0 && !phraseMode) { sel.splice(ex, 1); drawReader(); return; }
        if (!phraseMode) { sel.push({ si, a: i, b: i }); drawReader(); return; }
        if (!start || start.si !== si) { start = { si, i }; drawReader(); return; }
        const a = Math.min(start.i, i), b = Math.max(start.i, i);
        sel.push({ si, a, b }); start = null; drawReader();
      }
      drawMode(); drawReader();
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --- Из Claude ---
  function claudePrompt(words) {
    return [
      'Помоги мне с английскими словами (мой уровень A0–A1, учу для путешествий, аренды жилья, общения и спорта).',
      'Для каждого слова или выражения из списка ниже верни ТОЛЬКО JSON-массив в одном блоке кода, без пояснений.',
      'Поля каждого объекта:',
      '- "en": слово или выражение целиком, как в списке (фразовые глаголы не разбивай);',
      '- "ru": главный перевод в самом частом значении (коротко);',
      '- "alt": другие частые значения через запятую или "";',
      '- "pos": часть речи по-русски (сущ., глагол, прил., наречие, выражение);',
      '- "forms": для неправильного глагола три формы через « – », иначе "";',
      '- "example": короткий естественный пример уровня A1 (до 8 слов), обязательно с этим словом;',
      '- "example_ru": перевод примера;',
      '- "collocation": одно частое сочетание с этим словом;',
      '- "emoji": один эмодзи-ассоциация или "";',
      '- "image": 2–4 английских слова для поиска фото, конкретная сцена (для абстрактных слов — ситуация: для "rent" → "apartment keys").',
      'Если у слова два очень разных частых значения, сделай два отдельных объекта.',
      'Если в списке есть русское слово — дай английский вариант в "en", а русское в "ru".',
      '',
      'Список:',
      words && words.trim() ? words.trim() : '[вставьте сюда слова, по одному в строке]',
    ].join('\n');
  }
  async function copyText(text, okMsg) {
    try { await navigator.clipboard.writeText(text); toast(okMsg || 'Скопировано'); return true; }
    catch (e) { toast('Не получилось скопировать автоматически — выделите текст вручную'); return false; }
  }
  function claudeMode(body) {
    const drafts = wordsArr().filter(w => !w.ru && !w.archived);
    const words = h('textarea', { class: 'input', id: 'claude-words', rows: 5, placeholder: 'rent\nlook after\nпляж', spellcheck: 'false' }, S.ui.claudeDrafts ? drafts.map(w => w.en).join('\n') : (S.ui.claudeWords || ''));
    S.ui.claudeDrafts = false;
    words.addEventListener('input', () => { S.ui.claudeWords = words.value; });
    const prompt = h('pre', { class: 'code', id: 'claude-prompt' });
    const drawPrompt = () => { prompt.textContent = claudePrompt(words.value); };
    words.addEventListener('input', drawPrompt); drawPrompt();
    const answer = h('textarea', { class: 'input', id: 'claude-answer', rows: 8, placeholder: 'Вставьте сюда ответ Claude целиком (можно вместе с текстом вокруг — JSON найдётся сам)', spellcheck: 'false' });
    body.append(
      h('div', { class: 'card stack' }, h('h2', null, '1. Скопируйте запрос'),
        h('p', { class: 'small muted' }, 'Это самый качественный бесплатный способ: в обычном чате Claude вы получаете переводы, простые примеры и формы. Приложение не подключается к вашему чату — вы просто копируете и вставляете.'),
        h('label', { class: 'field', for: 'claude-words' }, 'Слова (по одному в строке)', words),
        drafts.length ? h('button', { class: 'btn sm soft', onclick: () => { words.value = drafts.map(w => w.en).join('\n'); drawPrompt(); } }, 'Подставить черновики без перевода (' + drafts.length + ')') : null,
        h('details', null, h('summary', null, 'Показать текст запроса'), prompt),
        h('button', { class: 'btn primary block', onclick: () => copyText(prompt.textContent, 'Запрос скопирован — вставьте его в чат Claude') }, 'Скопировать запрос')),
      h('div', { class: 'card stack' }, h('h2', null, '2. Вставьте ответ'),
        h('p', { class: 'small muted' }, 'В ответе Claude нажмите «Копировать» на блоке кода и вставьте сюда. Править JSON вручную не нужно.'),
        answer,
        h('button', { class: 'btn primary big block', onclick: () => {
          const r = C.parseStructured(answer.value);
          if (r.kind === 'json-error') return toast(r.error);
          if (!r.rows.length) return toast('Не нашла в тексте списка слов. Скопируйте ответ Claude целиком.');
          showPreview(r.rows.map(x => Object.assign({ auto: { claude: 1 } }, x)), { from: 'claude' });
        } }, 'Проверить и импортировать')),
      h('details', { class: 'card' }, h('summary', null, 'Формат для продвинутых (JSON и TSV)'),
        h('div', { class: 'stack', style: { marginTop: '8px' } },
          h('p', { class: 'small' }, 'JSON — массив объектов с полями en, ru, alt, pos, forms, example, example_ru, collocation, emoji, image (запрос для поиска фото), comment. Обязательно только en.'),
          h('pre', { class: 'code' }, '[\n  {"en": "look after", "ru": "присматривать", "example": "I look after my dog.", "example_ru": "Я присматриваю за собакой."}\n]'),
          h('p', { class: 'small' }, 'TSV — первая строка с заголовками (en, ru, example, example_ru, comment…), дальше значения через табуляцию.'))));
  }

  // --- Файл ---
  function loadXLSX() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'lib/xlsx.mini.min.js'; s.onload = () => res(window.XLSX); s.onerror = () => rej(new Error('модуль Excel не загрузился (нужен интернет при первом открытии)')); document.head.append(s); });
  }
  function fileMode(body) {
    const inp = h('input', { type: 'file', id: 'file-in', accept: '.txt,.csv,.tsv,.xlsx,.xls,.json,text/plain,text/csv', hidden: true, onchange: () => { if (inp.files[0]) handle(inp.files[0]); inp.value = ''; } });
    const out = h('div', { class: 'stack' });
    body.append(h('div', { class: 'card stack' },
      h('p', { class: 'small muted' }, 'TXT, CSV, TSV, XLSX (Excel) или JSON резервной копии. Для таблиц вы выберете, в каком столбце слово, перевод, пример и комментарий. Файл читается только на устройстве.'),
      h('button', { class: 'btn primary big block', onclick: () => inp.click() }, 'Выбрать файл'), inp), out);
    async function handle(file) {
      const name = file.name.toLowerCase();
      out.innerHTML = '';
      try {
        if (name.endsWith('.json')) {
          const text = await file.text();
          let obj = null; try { obj = JSON.parse(text); } catch (e) { /* не JSON целиком */ }
          if (obj && obj.app === 'slova') return Prefs.restoreFlow(obj);
          const r = C.parseStructured(text);
          if (!r.rows.length) throw new Error('в файле не найден список слов');
          return showPreview(r.rows, { from: 'file' });
        }
        let table;
        if (/\.xlsx?$/.test(name)) {
          const XLSX = await loadXLSX();
          const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
          table = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' });
        } else {
          const text = await file.text();
          if (name.endsWith('.txt')) { const r = C.parseList(text); return showPreview(r.rows, { from: 'file', ambiguous: r.ambiguous }); }
          table = C.parseCSV(text, name.endsWith('.tsv') ? '\t' : undefined).rows;
        }
        mapColumns(table.filter(r => r.some(c => String(c).trim())), out);
      } catch (e) { out.append(h('div', { class: 'banner bad' }, h('div', { class: 'grow' }, 'Не получилось прочитать файл: ' + e.message))); }
    }
  }
  const MAP_FIELDS = [['en', 'Слово (англ.)'], ['ru', 'Перевод'], ['example', 'Пример'], ['exampleRu', 'Перевод примера'], ['comment', 'Комментарий']];
  function mapColumns(table, out) {
    if (!table.length) { out.append(h('p', { class: 'muted' }, 'Таблица пустая.')); return; }
    const width = Math.max(...table.map(r => r.length));
    const head = table[0].map(x => C.norm(x));
    const guess = {};
    MAP_FIELDS.forEach(([f]) => {
      const aliases = { en: ['en', 'english', 'word', 'term', 'слово', 'английский', 'термин'], ru: ['ru', 'russian', 'translation', 'перевод', 'definition', 'определение', 'русский'],
        example: ['example', 'пример', 'sentence'], exampleRu: ['example ru', 'example_ru', 'перевод примера'], comment: ['comment', 'note', 'комментарий', 'заметка'] }[f];
      const k = head.findIndex(x => aliases.includes(x)); if (k >= 0) guess[f] = k;
    });
    const hasHeader = Object.keys(guess).length > 0;
    if (guess.en == null) guess.en = 0;
    if (guess.ru == null && width > 1) { const sample = table[hasHeader ? 1 : 0] || []; const k = sample.findIndex((c, i) => i !== guess.en && C.script(c) === 'ru'); guess.ru = k >= 0 ? k : 1; }
    const hdr = h('input', { type: 'checkbox', id: 'map-hdr', checked: hasHeader });
    const sels = {};
    const colOpt = (i) => h('option', { value: i }, 'Столбец ' + (i + 1) + ': ' + String((table[hasHeader ? 1 : 0] || [])[i] || table[0][i] || '').slice(0, 24));
    MAP_FIELDS.forEach(([f]) => {
      sels[f] = h('select', { class: 'input', id: 'map-' + f }, h('option', { value: '' }, '— нет —'), Array.from({ length: width }, (_, i) => colOpt(i)));
      sels[f].value = guess[f] != null ? String(guess[f]) : '';
    });
    out.append(h('div', { class: 'card stack' }, h('h2', null, 'Какие столбцы что означают?'),
      h('label', { class: 'switch' }, h('span', null, 'Первая строка — заголовки'), hdr),
      MAP_FIELDS.map(([f, l]) => h('label', { class: 'field', for: 'map-' + f }, l, sels[f])),
      h('p', { class: 'small muted' }, 'Строк в файле: ' + table.length),
      h('button', { class: 'btn primary big block', onclick: () => {
        if (sels.en.value === '') return toast('Выберите столбец со словом');
        const rows = table.slice(hdr.checked ? 1 : 0).map((r, i) => {
          const o = { line: i + 1 + (hdr.checked ? 1 : 0) };
          MAP_FIELDS.forEach(([f]) => { if (sels[f].value !== '') o[f] = C.clean(r[+sels[f].value]); });
          if (o.en && o.ru && C.script(o.en) === 'ru' && C.script(o.ru) === 'en') [o.en, o.ru] = [o.ru, o.en];
          if (!o.en) o.error = 'Нет слова'; else if (C.script(o.en) === 'ru') o.error = 'Слово написано по-русски';
          return o;
        });
        showPreview(rows, { from: 'file' });
      } }, 'Дальше: проверить')));
  }

  // --- Фото и голос: честно о возможностях первой версии ---
  function photoMode(body) {
    body.append(
      h('div', { class: 'card stack' }, h('h2', null, 'Со скриншота или фото'),
        h('p', null, 'В этой версии распознавания текста внутри приложения нет. На iPhone это быстро делает сама система:'),
        h('ol', { class: 'small', style: { margin: 0, paddingLeft: '20px', display: 'grid', gap: '4px' } },
          h('li', null, 'Откройте фото или скриншот в «Фото».'),
          h('li', null, 'Нажмите и подержите палец на тексте (функция «Живой текст») → «Выбрать все» → «Скопировать».'),
          h('li', null, 'Вернитесь сюда и вставьте во вкладку «Из текста» — там выберете нужные слова и фразы.')),
        h('button', { class: 'btn primary block', onclick: () => { S.ui.addMode = 'text'; routes.add(); } }, 'Перейти во «Из текста»'),
        h('p', { class: 'tiny muted' }, 'Встроенное распознавание (Tesseract, около 10–15 МБ загрузки) — в плане следующего этапа: его нужно проверить на скорость на iPhone.')),
      h('div', { class: 'card stack' }, h('h2', null, 'Голосом'),
        h('p', null, 'Расшифровки речи внутри приложения в первой версии нет. Используйте диктовку iPhone: в поле ввода нажмите значок микрофона на клавиатуре и скажите слово или фразу.'),
        h('div', { class: 'split stack-narrow' },
          h('button', { class: 'btn block', onclick: () => { S.ui.addMode = 'one'; routes.add(); } }, 'Одно слово'),
          h('button', { class: 'btn block', onclick: () => { S.ui.addMode = 'text'; routes.add(); } }, 'Целый текст')),
        h('p', { class: 'tiny muted' }, 'Для диктовки английских слов переключите язык клавиатуры на English. Импорт аудиофайлов с расшифровкой требует отдельного сервиса — в плане следующих этапов.')));
  }

  // ---------- Предпросмотр импорта ----------
  const ST = {
    new: ['новое', 'new'], meaning: ['другое значение', 'learning'], fill: ['дополнит черновик', 'new'],
    dup: ['уже есть', 'due'], dupList: ['повтор в списке', 'due'], error: ['ошибка', 'hard'],
  };
  async function showPreview(rows, meta) {
    meta = meta || {};
    S.ui.addMode = 'preview';
    const main = screen({ title: 'Проверка перед сохранением', tab: 'add', back: 'add' });
    rows = rows.map((r, i) => Object.assign({ line: i + 1, include: true, action: null }, r));
    const persist = () => kvSet('importDraft', { rows, meta });
    persist();
    const setSel = h('select', { class: 'input', id: 'imp-set' }, h('option', { value: '' }, 'Без набора'), [...S.sets.values()].map(s => h('option', { value: s.id }, s.name)), h('option', { value: '__new' }, '+ Новый набор…'));
    if (meta.setId) setSel.value = meta.setId;
    const newSet = h('input', { class: 'input', id: 'imp-newset', placeholder: 'Название нового набора', hidden: true });
    setSel.addEventListener('change', () => { newSet.hidden = setSel.value !== '__new'; meta.setId = setSel.value; persist(); });
    const summary = h('div', { class: 'row', style: { gap: '6px' } });
    const list = h('div', { class: 'stack' });
    const tools = h('div', { class: 'stack' });
    main.append(
      meta.ambiguous ? h('div', { class: 'banner warn' }, h('div', { class: 'grow' }, h('b', null, 'Формат списка неоднозначный.'), h('span', null, 'Проверьте, правильно ли разделены слово и перевод. Если нет — вернитесь и выберите разделитель в «Формат списка».'))) : null,
      h('div', { class: 'card stack' }, h('label', { class: 'field', for: 'imp-set' }, 'Добавить все слова в набор', setSel), newSet, summary, tools),
      list);
    const saveBar = h('div', { class: 'savebar' });
    const cancelBox = h('div');
    main.append(saveBar, cancelBox);

    function classifyAll() {
      const words = wordsArr();
      rows.forEach(r => { r.error = !r.en ? (r.ru ? 'Нет английского слова' : 'Пустая строка') : C.script(r.en) === 'ru' ? 'Слово написано по-русски' : null; });
      const cls = C.classifyBatch(rows.map(r => (!r.include ? Object.assign({}, r, { error: 'off' }) : r)), words);
      rows.forEach((r, i) => {
        const c = r.include ? cls[i] : C.classify(r, words, new Set()); r.status = c.status; r.target = c.target;
        if (!r.action || !validAction(r)) r.action = defaultAction(r.status);
      });
    }
    function defaultAction(st) { return { new: 'add', meaning: 'add', fill: 'merge', dup: 'skip', dupList: 'skip', error: 'skip' }[st]; }
    function validAction(r) { return ({ new: ['add'], meaning: ['add', 'skip', 'merge'], fill: ['merge', 'skip'], dup: ['skip', 'merge'], dupList: ['skip'], error: ['skip'] }[r.status] || []).includes(r.action); }
    function draw() {
      classifyAll(); persist();
      const cnt = {}; rows.forEach(r => { cnt[r.status] = (cnt[r.status] || 0) + 1; });
      summary.innerHTML = '';
      Object.keys(ST).forEach(k => { if (cnt[k]) summary.append(h('span', { class: 'pill ' + ST[k][1] }, ST[k][0] + ': ' + cnt[k])); });
      const missing = rows.filter(r => r.include && !r.ru && r.action !== 'skip' && !r.error);
      tools.innerHTML = '';
      if (missing.length) tools.append(h('p', { class: 'small muted' }, 'Без перевода: ' + missing.length + '. Они сохранятся черновиками — или дополните сейчас:'),
        h('div', { class: 'row' },
          h('button', { class: 'btn sm soft', onclick: () => translateMissing(missing) }, 'Перевести онлайн (MyMemory)')));
      list.innerHTML = '';
      rows.forEach((r, i) => list.append(rowEl(r, i)));
      const willAdd = rows.filter(r => r.include && r.action === 'add').length, willMerge = rows.filter(r => r.include && r.action === 'merge').length;
      saveBar.innerHTML = '';
      cancelBox.innerHTML = '';
      saveBar.append(h('button', { class: 'btn primary big block', disabled: !(willAdd + willMerge), onclick: save }, 'Сохранить: новых ' + willAdd + (willMerge ? ', дополнить ' + willMerge : '')));
      cancelBox.append(h('button', { class: 'btn ghost block', onclick: async () => { await kvSet('importDraft', null); S.ui.addMode = meta.from === 'claude' ? 'file' : meta.from || 'list'; routes.add(); } }, 'Отменить импорт'));
    }
    function rowEl(r, i) {
      const inc = h('input', { type: 'checkbox', checked: r.include && r.action !== 'skip', 'aria-label': 'Включить строку ' + r.line, onchange: () => { r.include = inc.checked; if (inc.checked && r.action === 'skip' && r.status !== 'dupList' && r.status !== 'error') r.action = r.status === 'dup' ? 'merge' : 'add'; draw(); } });
      const en = h('input', { class: 'input', value: r.en || '', 'aria-label': 'Английский', placeholder: 'английский', autocapitalize: 'off', spellcheck: 'false', onchange: () => { r.en = C.clean(en.value); draw(); } });
      const ru = h('input', { class: 'input', value: r.ru || '', 'aria-label': 'Перевод', placeholder: 'перевод (можно позже)', onchange: () => { r.ru = C.clean(ru.value); draw(); } });
      const st = ST[r.status];
      const target = r.target && S.words.get(r.target);
      let act = null;
      if (['meaning', 'dup', 'fill'].includes(r.status)) {
        act = h('select', { class: 'input', style: { minHeight: '38px', fontSize: '14px', padding: '6px 8px' }, 'aria-label': 'Что сделать', onchange: () => { r.action = act.value; r.include = r.action !== 'skip'; draw(); } },
          r.status === 'meaning' ? h('option', { value: 'add' }, 'Сохранить отдельной карточкой') : null,
          r.status !== 'new' ? h('option', { value: 'merge' }, r.status === 'fill' ? 'Дополнить черновик (прогресс сохранится)' : 'Дополнить пустые поля (прогресс сохранится)') : null,
          h('option', { value: 'skip' }, 'Пропустить'));
        act.value = r.action;
      }
      return h('div', { class: 'prow' + (!r.include || r.action === 'skip' ? ' off' : '') },
        h('div', { class: 'pline' }, inc, h('span', { class: 'tiny muted num' }, 'стр. ' + r.line), h('span', { class: 'pill ' + st[1] }, st[0]),
          null),
        h('div', { class: 'pinputs' }, en, ru),
        r.error ? h('div', { class: 'tiny', style: { color: 'var(--bad)' } }, r.error + '. Исправьте или строка будет пропущена.') : null,
        target ? h('div', { class: 'tiny muted' }, 'В словаре: ' + target.en + ' — ' + (target.ru || 'черновик')) : null,
        r.example ? h('div', { class: 'tiny muted', lang: 'en' }, 'Пример: ' + r.example + (r.exampleRu ? ' — ' + r.exampleRu : '')) : null,
        act);
    }
    async function translateMissing(missing) {
      if (!S.settings.online) return toast('Онлайн-подсказки выключены в настройках');
      const chars = missing.reduce((a, r) => a + r.en.length, 0);
      const ok = await dialog({ title: 'Перевести ' + missing.length + ' ' + C.plural(missing.length, 'слово', 'слова', 'слов') + '?', text: 'Слова (только они, ' + chars + ' символов) уйдут в бесплатный сервис MyMemory. Лимит — около 5000 символов в день. Переводы машинные, проверьте их.', ok: 'Перевести' });
      if (!ok) return;
      let done = 0, fail = 0;
      for (const r of missing) {
        try { const t = await Svc.translate(r.en, 'en', 'ru'); if (t.main) { r.ru = t.main.charAt(0).toLowerCase() + t.main.slice(1); r.auto = Object.assign({}, r.auto, { ru: 1 }); done++; } }
        catch (e) { fail++; if (/лимит|интернет/.test(e.message)) { toast(e.message); break; } }
        if ((done + fail) % 5 === 0) { draw(); }
      }
      draw(); toast('Переведено: ' + done + (fail ? ', не удалось: ' + fail : ''));
    }
    async function save() {
      let setId = setSel.value;
      if (setId === '__new') { setId = await ensureSet(newSet.value); if (!setId) { toast('Впишите название набора'); return; } }
      classifyAll();
      const toSave = [], report = { added: 0, merged: 0, skipped: 0, errors: [] };
      const now = Date.now();
      rows.forEach(r => {
        if (r.status === 'error') { report.errors.push('стр. ' + r.line + ': ' + r.error); return; }
        if (!r.include || r.action === 'skip') { report.skipped++; return; }
        const f = Object.assign({}, r, { setIds: setId ? [setId] : [] });
        if (r.action === 'merge' && r.target && S.words.get(r.target)) {
          const w = mergeInto(S.words.get(r.target), f, false); toSave.push(w); report.merged++;
        } else {
          const w = newWord(f); w.createdAt = now + toSave.length; w.auto = r.auto || {}; if (r.image) w.image = r.image;
          toSave.push(w); report.added++;
        }
      });
      await saveWords(toSave);
      if (window.Pics) Pics.enqueue(toSave.filter(w => !w.image && !w.imgTried).map(w => w.id));
      await kvSet('importDraft', null); await kvSet('listText', ''); await kvSet('textSrc', '');
      S.ui.listText = ''; S.ui.textSrc = '';
      showReport(report, setId);
    }
    draw();
  }
  function showReport(rep, setId) {
    const main = screen({ title: 'Готово', tab: 'add' });
    main.append(h('div', { class: 'card stack' },
      h('div', { class: 'report' },
        h('div', null, h('b', null, rep.added), h('span', null, 'добавлено')),
        h('div', null, h('b', null, rep.merged), h('span', null, 'дополнено')),
        h('div', null, h('b', null, rep.skipped), h('span', null, 'пропущено')),
        h('div', null, h('b', null, rep.errors.length), h('span', null, 'с ошибкой'))),
      rep.merged ? h('p', { class: 'small muted' }, 'У дополненных слов прогресс повторений сохранён.') : null,
      rep.errors.length ? h('details', null, h('summary', null, 'Строки с ошибкой'), h('ul', { class: 'small' }, rep.errors.map(e => h('li', null, e)))) : null,
      h('div', { class: 'split stack-narrow' },
        h('button', { class: 'btn primary', onclick: () => { if (setId) App.S.ui.dictSet = setId; App.S.ui.dictFilter = 'all'; go('dict'); } }, 'Открыть словарь'),
        h('button', { class: 'btn', onclick: () => { S.ui.addMode = 'list'; routes.add(); } }, 'Добавить ещё'))));
  }

  window.Add = { wordForm, showPreview, claudePrompt, copyText, Svc };
})();
