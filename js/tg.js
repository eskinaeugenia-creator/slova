/* Мои слова — режим Telegram Mini App.
   Внутри Telegram: тёмные цвета, кнопка «Назад», имя из Telegram и синхронизация словаря через облако Telegram
   (CloudStorage: у каждого пользователя своё, до 1024 ключей по 4096 символов). Вне Telegram модуль ничего не делает. */
(function () {
  'use strict';
  const C = window.Core;
  const WA = window.Telegram && window.Telegram.WebApp;
  const inTG = !!(WA && WA.initData);
  const cloudOK = inTG && WA.isVersionAtLeast && WA.isVersionAtLeast('6.9') && !!WA.CloudStorage;
  const TG = { inTG, cloudOK, status: inTG ? (cloudOK ? 'ожидание' : 'облако недоступно в этой версии Telegram') : 'вне Telegram', lastSync: 0, remoteCount: 0 };
  window.TG = TG;
  if (!inTG) return;

  try {
    WA.ready(); WA.expand();
    if (WA.setHeaderColor) WA.setHeaderColor('#000000');
    if (WA.setBackgroundColor) WA.setBackgroundColor('#000000');
    if (WA.setBottomBarColor && WA.isVersionAtLeast('7.10')) WA.setBottomBarColor('#0A0D0E');
    document.documentElement.classList.add('in-telegram');
  } catch (e) { /* старый клиент */ }

  // Кнопка «Назад» Telegram вместо браузерной
  const MAIN = ['', '#today', '#dict', '#add', '#train', '#progress'];
  function syncBack() {
    if (!WA.BackButton) return;
    if (MAIN.includes(location.hash) || location.hash.startsWith('#tgWebApp')) WA.BackButton.hide(); else WA.BackButton.show();
  }
  if (WA.BackButton) WA.BackButton.onClick(() => { if (history.length > 1) history.back(); else location.hash = 'today'; });
  window.addEventListener('hashchange', syncBack);

  // ---------- Облако Telegram (обёртки над колбэками) ----------
  const cs = WA.CloudStorage;
  const p = (fn, ...args) => new Promise((res, rej) => fn.call(cs, ...args, (err, val) => err ? rej(new Error(String(err))) : res(val)));
  const cGetKeys = () => p(cs.getKeys);
  const cGetItems = (keys) => p(cs.getItems, keys);
  const cSet = (k, v) => p(cs.setItem, k, v);
  const cRemove = (keys) => p(cs.removeItems, keys);

  // Компактная запись слова (без картинки — её каждое устройство подбирает само)
  const card = (c) => c && c.reps ? [c.reps, c.lapses, +c.s.toFixed(3), +c.d.toFixed(3), c.last, c.due] : 0;
  const uncard = (a) => a ? { reps: a[0], lapses: a[1], s: a[2], d: a[3], last: a[4], due: a[5] } : null;
  // level: 0 — всё; 1..3 — короче (если «пачка» не влезает в 4096 символов)
  function pack(w, level) {
    level = level || 0;
    const o = { e: w.en, r: w.ru, a: w.alt, p: w.pos, f: w.forms, x: w.example, xr: w.exampleRu, c: w.collocation, m: w.comment, em: w.emoji, q: w.imageQuery,
      src: w.source, st: w.setIds, ar: w.archived ? 1 : 0, dm: w.demo ? 1 : 0, ca: w.createdAt, ua: w.updatedAt, ea: w.editedAt || w.createdAt, fs: w.firstSeen || 0,
      g: [card(w.srs.recog), card(w.srs.recall)], h: [w.stats.right || 0, w.stats.wrong || 0, w.stats.hints || 0, (w.stats.hist || []).join('')] };
    if (level >= 1) { delete o.src; delete o.q; delete o.ua; }
    if (level >= 2) { delete o.xr; delete o.c; delete o.a; o.h = [o.h[0], o.h[1]]; }
    if (level >= 3) { delete o.x; delete o.p; if (o.m) o.m = o.m.slice(0, 80); }
    Object.keys(o).forEach(k => { if (o[k] === '' || o[k] == null || (Array.isArray(o[k]) && !o[k].length)) delete o[k]; });
    return JSON.stringify(o);
  }
  function unpack(id, s) {
    const o = JSON.parse(s); const hist = String(o.h && o.h[3] || '').split('').map(Number);
    return { id, en: o.e || '', ru: o.r || '', alt: o.a || '', pos: o.p || '', forms: o.f || '', example: o.x || '', exampleRu: o.xr || '', collocation: o.c || '',
      comment: o.m || '', emoji: o.em || '', imageQuery: o.q || '', source: o.src || '', setIds: o.st || [], archived: !!o.ar, demo: !!o.dm,
      createdAt: o.ca || Date.now(), updatedAt: o.ua || 0, editedAt: o.ea || o.ca || 0, firstSeen: o.fs || 0, image: '', imageCredit: null, auto: {}, tags: [], phonetic: '',
      srs: { recog: uncard(o.g && o.g[0]), recall: uncard(o.g && o.g[1]) },
      stats: { right: o.h ? o.h[0] : 0, wrong: o.h ? o.h[1] : 0, hints: o.h && o.h[2] || 0, hist, recentWrong: hist.filter(x => x === 0).length } };
  }
  const reps = (w) => ((w.srs.recog && w.srs.recog.reps) || 0) + ((w.srs.recall && w.srs.recall.reps) || 0);
  function mergeWord(local, remote) {
    const textFrom = (remote.editedAt || 0) > (local.editedAt || local.createdAt || 0) ? remote : local;
    const out = Object.assign({}, local);
    ['en', 'ru', 'alt', 'pos', 'forms', 'example', 'exampleRu', 'collocation', 'comment', 'emoji', 'imageQuery', 'source', 'setIds', 'archived'].forEach(k => { out[k] = textFrom[k]; });
    ['recog', 'recall'].forEach(d => {
      const a = local.srs[d], b = remote.srs[d];
      out.srs[d] = !a ? b : !b ? a : ((b.last || 0) > (a.last || 0) ? b : a);
    });
    if (reps(remote) > reps(local)) out.stats = remote.stats;
    out.updatedAt = Math.max(local.updatedAt || 0, remote.updatedAt || 0);
    out.editedAt = Math.max(local.editedAt || 0, remote.editedAt || 0);
    if (!local.firstSeen && remote.firstSeen) out.firstSeen = remote.firstSeen;
    return out;
  }

  // ---------- «Пачки»: слова хранятся по 10–15 в одной записи облака ----------
  // У облака Telegram лимит 1024 записи по 4096 символов. Слово → пачка b_000…b_899 по хешу id.
  // 900 пачек × ~13 слов ≈ 11 000 слов. Старые записи w_<id> (версия 1.2) переносятся автоматически.
  const NB = 900;
  function bucketOf(id) { let h = 2166136261; for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); } return 'b_' + String((h >>> 0) % NB).padStart(3, '0'); }
  // Собрать пачку, чтобы влезла в лимит: при переполнении сначала сжимаются самые старые слова
  function fitBucket(entries) {
    // entries: Map id → word
    const ids = [...entries.keys()].sort((x, y) => (entries.get(x).createdAt || 0) - (entries.get(y).createdAt || 0));
    const lvl = {}; ids.forEach(id => { lvl[id] = 0; });
    const build = () => { const o = {}; ids.forEach(id => { o[id] = pack(entries.get(id), lvl[id]); }); return JSON.stringify(o); };
    let str = build();
    for (let L = 1; L <= 3 && str.length > 4096; L++) for (const id of ids) { lvl[id] = L; str = build(); if (str.length <= 4096) break; }
    TG.overflow = str.length > 4096;
    return str.length > 4096 ? null : str;
  }
  function parseBucket(str) { try { return JSON.parse(str || '{}') || {}; } catch (e) { return {}; } }
  function withLocalExtras(m, w) { m.image = w.image; m.imageCredit = w.imageCredit; m.imgTried = w.imgTried; m.auto = w.auto; return m; }

  // ---------- Отправка изменений ----------
  const dirty = new Set(), removed = new Set(); let pushT = null, pushing = false, syncing = false;
  // не откладываем бесконечно: отправка не позже чем через 1,5 с после первого изменения
  function schedulePush() { if (pushT) return; pushT = setTimeout(() => { pushT = null; push(); }, 1500); }
  async function push() {
    if (!cloudOK || pushing || syncing) { if (cloudOK) schedulePush(); return; }
    pushing = true;
    const ids = [...dirty], rem = [...removed];
    dirty.clear(); removed.clear();
    try {
      const del = new Set((await deletedList()).concat(rem));
      // группируем изменения по пачкам
      const groups = new Map();
      ids.concat(rem).forEach(id => { const b = bucketOf(id); if (!groups.has(b)) groups.set(b, []); groups.get(b).push(id); });
      const bks = [...groups.keys()];
      const localUpdates = [];
      for (let i = 0; i < bks.length; i += 40) {
        const part = bks.slice(i, i + 40);
        const remote = await cGetItems(part);
        for (const b of part) {
          // сначала читаем облако и объединяем: свежая правка с другого устройства не потеряется
          const robj = parseBucket(remote[b]);
          const entries = new Map();
          Object.keys(robj).forEach(id => { if (!del.has(id)) { try { entries.set(id, unpack(id, robj[id])); } catch (e) { /* испорченная запись */ } } });
          for (const id of groups.get(b)) {
            if (del.has(id)) { entries.delete(id); continue; }
            let w = App.S.words.get(id); if (!w) continue;
            const r = entries.get(id);
            if (r) { const m = withLocalExtras(mergeWord(w, r), w); if (JSON.stringify(m) !== JSON.stringify(w)) { App.S.words.set(id, m); localUpdates.push(m); w = m; } }
            entries.set(id, w);
          }
          const str = fitBucket(entries);
          if (str && str !== remote[b]) await cSet(b, str);
        }
      }
      if (localUpdates.length) { applyingRemote = true; try { await orig.putMany.call(DB, 'words', localUpdates); } finally { applyingRemote = false; } }
      if (rem.length) await rememberDeleted(rem);
      if (setsDirty) { setsDirty = false; await cSet('sets', JSON.stringify([...App.S.sets.values()].map(s => ({ i: s.id, n: s.name, dm: s.demo ? 1 : 0 }))).slice(0, 4096)); }
      if (cfgDirty) { cfgDirty = false; await cSet('cfg', JSON.stringify(cfgSubset())); }
      TG.lastSync = Date.now(); TG.status = TG.overflow ? 'синхронизировано (облако почти заполнено)' : 'синхронизировано';
    } catch (e) {
      TG.status = 'ошибка: ' + e.message;
      ids.forEach(id => dirty.add(id)); rem.forEach(id => removed.add(id)); // повторим позже
    } finally { pushing = false; if (dirty.size || removed.size) schedulePush(); }
  }
  let setsDirty = false, cfgDirty = false;
  const CFG = ['name', 'minutes', 'newPerDay', 'sound', 'autoplay', 'rate', 'slowRate', 'timer', 'timerSec', 'autoImages', 'online', 'retention'];
  const cfgSubset = () => { const o = {}; CFG.forEach(k => { o[k] = App.S.settings[k]; }); return o; };
  // Список удалённых слов, чтобы другое устройство не вернуло их обратно
  async function deletedList() { try { const v = await cGetItems(['deleted']); return JSON.parse(v.deleted || '[]'); } catch (e) { return []; } }
  async function rememberDeleted(ids) {
    let cur = await deletedList();
    cur = cur.concat(ids).slice(-300);
    await cSet('deleted', JSON.stringify(cur));
  }

  // Перехватываем запись в локальную базу: всё, что сохраняется, отправляется и в облако
  const orig = { put: DB.put, putMany: DB.putMany, del: DB.del, delMany: DB.delMany, clear: DB.clear };
  let applyingRemote = false;
  DB.put = function (store, value, key) {
    if (cloudOK && !applyingRemote) {
      if (store === 'words') { dirty.add(value.id); removed.delete(value.id); schedulePush(); }
      if (store === 'sets') { setsDirty = true; schedulePush(); }
      if (store === 'kv' && key === 'settings') { cfgDirty = true; schedulePush(); }
    }
    return orig.put.apply(DB, arguments);
  };
  DB.putMany = function (store, values) {
    if (cloudOK && !applyingRemote && store === 'words') { values.forEach(v => { dirty.add(v.id); removed.delete(v.id); }); schedulePush(); }
    return orig.putMany.apply(DB, arguments);
  };
  DB.del = function (store, key) {
    if (cloudOK && !applyingRemote) {
      if (store === 'words') { removed.add(key); dirty.delete(key); schedulePush(); }
      if (store === 'sets') { setsDirty = true; schedulePush(); }
    }
    return orig.del.apply(DB, arguments);
  };
  DB.delMany = function (store, keys) {
    if (cloudOK && !applyingRemote && store === 'words') { keys.forEach(k => { removed.add(k); dirty.delete(k); }); schedulePush(); }
    return orig.delMany.apply(DB, arguments);
  };
  DB.clear = function (store) {
    if (cloudOK && !applyingRemote && store === 'words') { App.S.words.forEach((w, id) => removed.add(id)); schedulePush(); }
    return orig.clear.apply(DB, arguments);
  };

  // ---------- Полная синхронизация (при запуске и по кнопке) ----------
  async function sync(opts) {
    if (!cloudOK || syncing) return;
    syncing = true; TG.status = 'синхронизация…';
    try {
      const keys = await cGetKeys();
      const legacy = keys.filter(k => k.startsWith('w_'));
      const bucketKeys = keys.filter(k => /^b_\d{3}$/.test(k));
      const extra = keys.filter(k => ['sets', 'cfg', 'deleted'].includes(k));
      const raw = {};
      const all = legacy.concat(bucketKeys);
      for (let i = 0; i < all.length; i += 40) Object.assign(raw, await cGetItems(all.slice(i, i + 40)));
      const meta = extra.length ? await cGetItems(extra) : {};
      const deleted = new Set(JSON.parse(meta.deleted || '[]'));
      // все слова из облака: id → упакованная строка (новые пачки важнее старых записей)
      const remote = {};
      legacy.forEach(k => { remote[k.slice(2)] = raw[k]; });
      bucketKeys.forEach(k => Object.assign(remote, parseBucket(raw[k])));
      TG.remoteCount = Object.keys(remote).length;
      applyingRemote = true;
      const changed = [], fetchPics = [];
      if (meta.sets) JSON.parse(meta.sets).forEach(s => { if (!App.S.sets.has(s.i)) { const set = { id: s.i, name: s.n, demo: !!s.dm, createdAt: Date.now() }; App.S.sets.set(s.i, set); orig.put.call(DB, 'sets', set); } });
      if (meta.cfg && !App.S.settings.cloudCfgApplied) { Object.assign(App.S.settings, JSON.parse(meta.cfg)); App.S.settings.cloudCfgApplied = true; await orig.put.call(DB, 'kv', App.S.settings, 'settings'); }
      const toDelete = [...App.S.words.keys()].filter(id => deleted.has(id));
      toDelete.forEach(id => App.S.words.delete(id));
      if (toDelete.length) await orig.delMany.call(DB, 'words', toDelete);
      for (const id of Object.keys(remote)) {
        if (deleted.has(id)) continue;
        let rw; try { rw = unpack(id, remote[id]); } catch (e) { continue; }
        const lw = App.S.words.get(id);
        if (!lw) { App.S.words.set(id, rw); changed.push(rw); fetchPics.push(id); continue; }
        const m = withLocalExtras(mergeWord(lw, rw), lw);
        if (JSON.stringify(m) !== JSON.stringify(lw)) { App.S.words.set(id, m); changed.push(m); }
        if (pack(m) !== remote[id]) dirty.add(id);
      }
      if (changed.length) await orig.putMany.call(DB, 'words', changed);
      applyingRemote = false;
      App.S.words.forEach((w, id) => { if (!remote[id]) dirty.add(id); });
      // перенос со старого формата: всё, что было в w_*, переписываем в пачки
      legacy.forEach(k => { const id = k.slice(2); if (App.S.words.has(id)) dirty.add(id); });
      setsDirty = true; cfgDirty = true;
      syncing = false;
      await push();
      if (legacy.length && !dirty.size) { for (let i = 0; i < legacy.length; i += 40) await cRemove(legacy.slice(i, i + 40)); }
      TG.lastSync = Date.now(); if (!/ошибка/.test(TG.status)) TG.status = TG.overflow ? 'синхронизировано (облако почти заполнено)' : 'синхронизировано';
      TG.remoteCount = Math.max(TG.remoteCount, App.S.words.size);
      if (changed.length || toDelete.length) {
        if (window.Pics && fetchPics.length) Pics.enqueue(fetchPics);
        if (!(window.Train && Train.active())) App.go((location.hash || '#today').slice(1) || 'today');
        if (opts && opts.manual || changed.length) App.toast('Синхронизировано с Telegram: ' + changed.length + ' ' + C.plural(changed.length, 'изменение', 'изменения', 'изменений'));
      } else if (opts && opts.manual) App.toast('Всё уже синхронизировано');
    } catch (e) {
      applyingRemote = false; syncing = false;
      TG.status = 'ошибка: ' + e.message;
      if (opts && opts.manual) App.toast('Не получилось синхронизировать: ' + e.message);
    }
  }

  // Запуск после загрузки приложения
  function start() {
    try {
      const u = WA.initDataUnsafe && WA.initDataUnsafe.user;
      if (u && !App.S.settings.name) { App.S.settings.name = u.first_name || ''; DB.put('kv', App.S.settings, 'settings'); }
    } catch (e) { /* нет данных пользователя */ }
    syncBack();
    if (cloudOK) setTimeout(() => sync(), 300);
    // при возвращении из свёрнутого состояния — подтянуть изменения с других устройств
    if (WA.onEvent) WA.onEvent('activated', () => { if (Date.now() - TG.lastSync > 60000) sync(); });
  }
  TG._debug = () => ({ dirty: dirty.size, removed: removed.size, pushing, syncing, applyingRemote });
  TG.sync = sync; TG.start = start; TG.bucketOf = bucketOf; TG.fitBucket = fitBucket; TG.pack = pack; TG.unpack = unpack; TG.mergeWord = mergeWord;
})();
