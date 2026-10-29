/* Хранилище на устройстве: IndexedDB. Если браузер его не даёт — работа в памяти с предупреждением. */
(function (root) {
  'use strict';
  const DB_NAME = 'slova', DB_VERSION = 1;
  const STORES = ['words', 'sets', 'logs', 'sessions', 'kv'];
  let db = null, memory = null;

  function open() {
    return new Promise((resolve) => {
      let req;
      try { req = indexedDB.open(DB_NAME, DB_VERSION); } catch (e) { return resolve(fallback(e)); }
      req.onupgradeneeded = (ev) => {
        const d = req.result;
        // Миграции по версиям: новые хранилища добавляются, старые данные не трогаются
        if (ev.oldVersion < 1) {
          d.createObjectStore('words', { keyPath: 'id' });
          d.createObjectStore('sets', { keyPath: 'id' });
          const logs = d.createObjectStore('logs', { keyPath: 'id' });
          logs.createIndex('ts', 'ts'); logs.createIndex('wordId', 'wordId');
          d.createObjectStore('sessions', { keyPath: 'id' });
          d.createObjectStore('kv');
        }
      };
      req.onsuccess = () => { db = req.result; db.onversionchange = () => db.close(); resolve({ ok: true }); };
      req.onerror = () => resolve(fallback(req.error));
      req.onblocked = () => resolve(fallback(new Error('blocked')));
    });
  }
  function fallback(err) {
    memory = {}; STORES.forEach(s => { memory[s] = new Map(); });
    return { ok: false, error: String(err && err.message || err) };
  }
  function tx(store, mode, fn) {
    if (memory) return Promise.resolve(fn(null));
    return new Promise((resolve, reject) => {
      const t = db.transaction(store, mode); const s = t.objectStore(store);
      let out; try { out = fn(s); } catch (e) { reject(e); return; }
      t.oncomplete = () => resolve(out && out.result !== undefined && out instanceof IDBRequest ? out.result : out);
      t.onerror = () => reject(t.error); t.onabort = () => reject(t.error || new Error('abort'));
    });
  }
  function all(store) {
    if (memory) return Promise.resolve([...memory[store].values()].map(clone));
    return new Promise((resolve, reject) => {
      const r = db.transaction(store).objectStore(store).getAll();
      r.onsuccess = () => resolve(r.result || []); r.onerror = () => reject(r.error);
    });
  }
  function put(store, value, key) {
    if (memory) { memory[store].set(key != null ? key : value.id, clone(value)); return Promise.resolve(); }
    return tx(store, 'readwrite', s => { key != null ? s.put(value, key) : s.put(value); });
  }
  function putMany(store, values) {
    if (memory) { values.forEach(v => memory[store].set(v.id, clone(v))); return Promise.resolve(); }
    return tx(store, 'readwrite', s => { values.forEach(v => s.put(v)); });
  }
  function del(store, key) {
    if (memory) { memory[store].delete(key); return Promise.resolve(); }
    return tx(store, 'readwrite', s => { s.delete(key); });
  }
  function delMany(store, keys) {
    if (memory) { keys.forEach(k => memory[store].delete(k)); return Promise.resolve(); }
    return tx(store, 'readwrite', s => { keys.forEach(k => s.delete(k)); });
  }
  function clear(store) {
    if (memory) { memory[store].clear(); return Promise.resolve(); }
    return tx(store, 'readwrite', s => { s.clear(); });
  }
  function get(store, key) {
    if (memory) return Promise.resolve(clone(memory[store].get(key)));
    return new Promise((resolve, reject) => {
      const r = db.transaction(store).objectStore(store).get(key);
      r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
    });
  }
  function clone(v) { return v === undefined ? v : JSON.parse(JSON.stringify(v)); }

  root.DB = { open, all, put, putMany, del, delMany, clear, get, isMemory: () => !!memory, STORES };
})(window);
