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
  function pack(w) {
    const o = { e: w.en, r: w.ru, a: w.alt, p: w.pos, f: w.forms, x: w.example, xr: w.exampleRu, c: w.collocation, m: w.comment, em: w.emoji, q: w.imageQuery,
      src: w.source, st: w.setIds, ar: w.archived ? 1 : 0, dm: w.demo ? 1 : 0, ca: w.createdAt, ua: w.updatedAt, ea: w.editedAt || w.createdAt, fs: w.firstSeen || 0,
      g: [card(w.srs.recog), card(w.srs.recall)], h: [w.stats.right || 0, w.stats.wrong || 0, w.stats.hints || 0, (w.stats.hist || []).join('')] };
    Object.keys(o).forEach(k => { if (o[k] === '' || o[k] == null) delete o[k]; });
    let s = JSON.stringify(o);
    // не влезло в 4096 символов — убираем второстепенное
    for (const k of ['src', 'xr', 'x', 'c', 'a']) { if (s.length <= 4000) break; delete o[k]; s = JSON.stringify(o); }
    if (s.length > 4000 && o.m) { o.m = o.m.slice(0, 500); s = JSON.stringify(o); }
    return s;
  }
  function unpack(id, s) {
    const o = JSON.parse(s); const hist = String(o.h && o.h[3] || '').split('').map(Number);
    return { id, en: o.e || '', ru: o.r || '', alt: o.a || '', pos: o.p || '', forms: o.f || '', example: o.x || '', exampleRu: o.xr || '', collocation: o.c || '',
      comment: o.m || '', emoji: o.em || '', imageQuery: o.q || '', source: o.src || '', setIds: o.st || [], archived: !!o.ar, demo: !!o.dm,
      createdAt: o.ca || Date.now(), updatedAt: o.ua || 0, editedAt: o.ea || o.ca || 0, firstSeen: o.fs || 0, image: '', imageCredit: null, auto: {}, tags: [], phonetic: '',
      srs: { recog: uncard(o.g && o.g[0]), recall: uncard(o.g && o.g[1]) },
      stats: { right: o.h ? o.h[0] : 0, wrong: o.h ? o.h[1] : 0, hints: o.h ? o.h[2] : 0, hist, recentWrong: hist.filter(x => x === 0).length } };
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

  // ---------- Отправка изменений ----------
  const dirty = new Set(), removed = new Set(); let pushT = null, pushing = false, syncing = false;
  // не откладываем бесконечно: отправка не позже чем через 1,5 с после первого изменения
  function schedulePush() { if (pushT) return; pushT = setTimeout(() => { pushT = null; push(); }, 1500); }
  async function push() {
    if (!cloudOK || pushing || syncing) { if (cloudOK) schedulePush(); return; }
    pushing = true;
    try {
      const ids = [...dirty]; dirty.clear();
      // сначала читаем облако и объединяем: свежая правка с другого устройства не потеряется
      for (let i = 0; i < ids.length; i += 40) {
        const part = ids.slice(i, i + 40).filter(id => App.S.words.has(id));
        if (!part.length) continue;
        const remote = await cGetItems(part.map(id => 'w_' + id));
        const del = new Set(await deletedList());
        const localUpdates = [];
        for (const id of part) {
          if (del.has(id)) continue;
          let w = App.S.words.get(id);
          const rv = remote['w_' + id];
          if (rv) { try { const m = mergeWord(w, unpack(id, rv)); if (JSON.stringify(m) !== JSON.stringify(w)) { m.image = w.image; m.imageCredit = w.imageCredit; m.imgTried = w.imgTried; m.auto = w.auto; App.S.words.set(id, m); localUpdates.push(m); w = m; } } catch (e) { /* испорченная запись — перезапишем */ } }
          const packed = pack(w);
          if (packed !== rv) await cSet('w_' + id, packed);
        }
        if (localUpdates.length) { applyingRemote = true; try { await orig.putMany.call(DB, 'words', localUpdates); } finally { applyingRemote = false; } }
      }
      if (removed.size) {
        const del = [...removed]; removed.clear();
        await cRemove(del.map(id => 'w_' + id));
        await rememberDeleted(del);
      }
      if (setsDirty) { setsDirty = false; await cSet('sets', JSON.stringify([...App.S.sets.values()].map(s => ({ i: s.id, n: s.name, dm: s.demo ? 1 : 0 }))).slice(0, 4096)); }
      if (cfgDirty) { cfgDirty = false; await cSet('cfg', JSON.stringify(cfgSubset())); }
      TG.lastSync = Date.now(); TG.status = 'синхронизировано';
    } catch (e) { TG.status = 'ошибка: ' + e.message; ids_back(); }
    finally { pushing = false; if (dirty.size || removed.size) schedulePush(); }
    function ids_back() { /* при ошибке повторим всё при следующей синхронизации */ }
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
      const wordKeys = keys.filter(k => k.startsWith('w_'));
      TG.remoteCount = wordKeys.length;
      const extra = keys.filter(k => ['sets', 'cfg', 'deleted'].includes(k));
      const remote = {};
      for (let i = 0; i < wordKeys.length; i += 40) Object.assign(remote, await cGetItems(wordKeys.slice(i, i + 40)));
      const meta = extra.length ? await cGetItems(extra) : {};
      const deleted = new Set(JSON.parse(meta.deleted || '[]'));
      applyingRemote = true;
      const changed = [], fetchPics = [];
      // наборы
      if (meta.sets) JSON.parse(meta.sets).forEach(s => { if (!App.S.sets.has(s.i)) { const set = { id: s.i, name: s.n, demo: !!s.dm, createdAt: Date.now() }; App.S.sets.set(s.i, set); orig.put.call(DB, 'sets', set); } });
      // настройки (только если локальные ещё не трогали — первый запуск на этом устройстве)
      if (meta.cfg && !App.S.settings.cloudCfgApplied) { Object.assign(App.S.settings, JSON.parse(meta.cfg)); App.S.settings.cloudCfgApplied = true; await orig.put.call(DB, 'kv', App.S.settings, 'settings'); }
      // удалённые на другом устройстве
      const toDelete = [...App.S.words.keys()].filter(id => deleted.has(id));
      toDelete.forEach(id => App.S.words.delete(id));
      if (toDelete.length) await orig.delMany.call(DB, 'words', toDelete);
      // слова
      for (const k of wordKeys) {
        const id = k.slice(2); if (deleted.has(id)) continue;
        let rw; try { rw = unpack(id, remote[k]); } catch (e) { continue; }
        const lw = App.S.words.get(id);
        if (!lw) { App.S.words.set(id, rw); changed.push(rw); fetchPics.push(id); continue; }
        const m = mergeWord(lw, rw);
        if (JSON.stringify(m) !== JSON.stringify(lw)) { App.S.words.set(id, m); changed.push(m); }
        if (pack(m) !== remote[k]) dirty.add(id);
      }
      if (changed.length) await orig.putMany.call(DB, 'words', changed);
      applyingRemote = false;
      // локальные слова, которых нет в облаке — отправить
      App.S.words.forEach((w, id) => { if (!remote['w_' + id]) dirty.add(id); });
      setsDirty = true; cfgDirty = true;
      syncing = false;
      await push();
      TG.lastSync = Date.now(); TG.status = 'синхронизировано'; TG.remoteCount = Math.max(TG.remoteCount, App.S.words.size);
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
  TG.sync = sync; TG.start = start; TG.pack = pack; TG.unpack = unpack; TG.mergeWord = mergeWord;
})();
