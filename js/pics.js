/* Мои слова — автоматические картинки.
   1) Эмодзи-ассоциация: сразу и без интернета (встроенный словарь частых слов).
   2) Фото: само подбирается в фоне после сохранения слова — сначала Wikimedia Commons, запасной источник Openverse.
      Только свободные лицензии; автор и лицензия сохраняются. Картинку можно заменить «Другая», убрать или загрузить свою. */
(function () {
  'use strict';
  const C = window.Core;
  const { S, h, toast, saveWord, wordsArr } = window.App;

  // ---------- Эмодзи для частых слов A0–A2 (путешествия, жильё, спорт, быт) ----------
  const EMOJI = {
    apartment: '🏢', flat: '🏢', house: '🏠', home: '🏠', room: '🚪', door: '🚪', key: '🔑', keys: '🔑', rent: '🔑', bed: '🛏️', bedroom: '🛏️', sofa: '🛋️',
    kitchen: '🍳', bathroom: '🛁', shower: '🚿', toilet: '🚽', towel: '🧺', window: '🪟', chair: '🪑', table: '🍽️', lamp: '💡', light: '💡', wifi: '📶', internet: '🌐',
    air: '🌬️', 'air conditioner': '❄️', fan: '🌀', hot: '🥵', cold: '🥶', warm: '☀️', rain: '🌧️', sun: '☀️', sunny: '☀️', weather: '🌤️', wind: '🌬️', storm: '⛈️', cloud: '☁️',
    beach: '🏖️', sea: '🌊', ocean: '🌊', wave: '🌊', waves: '🌊', surf: '🏄', surfing: '🏄', surfboard: '🏄', swim: '🏊', swimming: '🏊', pool: '🏊', sand: '🏖️', island: '🏝️',
    boat: '⛵', ship: '🚢', board: '🏄', fish: '🐟', sunscreen: '🧴', sunglasses: '🕶️', hat: '👒', swimsuit: '👙', diving: '🤿', dive: '🤿', mountain: '⛰️', river: '🏞️',
    gym: '🏋️', sport: '⚽', run: '🏃', running: '🏃', walk: '🚶', yoga: '🧘', bike: '🚲', bicycle: '🚲', ball: '⚽', football: '⚽', tennis: '🎾', train: '🚆', coach: '🧑‍🏫',
    lesson: '📘', teacher: '🧑‍🏫', student: '🧑‍🎓', school: '🏫', book: '📖', read: '📖', write: '✍️', pen: '🖊️', learn: '📚', study: '📚', word: '🔤', question: '❓', answer: '💬',
    car: '🚗', taxi: '🚕', bus: '🚌', plane: '✈️', airplane: '✈️', airport: '🛫', flight: '✈️', ticket: '🎫', passport: '🛂', luggage: '🧳', suitcase: '🧳', bag: '👜', map: '🗺️',
    hotel: '🏨', 'check in': '🛎️', 'check out': '🧳', booking: '📅', reservation: '📅', price: '🏷️', money: '💰', cash: '💵', card: '💳', pay: '💳', bill: '🧾', receipt: '🧾',
    'how much': '💰', cheap: '💸', expensive: '💎', discount: '🏷️', shop: '🛍️', buy: '🛒', sell: '🏷️', market: '🧺', supermarket: '🛒', pharmacy: '💊', doctor: '🩺', hospital: '🏥',
    food: '🍽️', eat: '🍽️', drink: '🥤', water: '💧', coffee: '☕', tea: '🍵', breakfast: '🥐', lunch: '🥗', dinner: '🍝', bread: '🍞', rice: '🍚', egg: '🥚', chicken: '🍗',
    meat: '🥩', fruit: '🍎', apple: '🍎', banana: '🍌', coconut: '🥥', mango: '🥭', milk: '🥛', beer: '🍺', wine: '🍷', juice: '🧃', ice: '🧊', menu: '📋', restaurant: '🍴', cafe: '☕',
    phone: '📱', call: '📞', message: '💬', email: '📧', photo: '📷', camera: '📷', computer: '💻', laptop: '💻', charger: '🔌', battery: '🔋', music: '🎵', song: '🎵',
    friend: '🧑‍🤝‍🧑', family: '👨‍👩‍👧', mother: '👩', father: '👨', child: '🧒', baby: '👶', dog: '🐕', cat: '🐈', love: '❤️', like: '👍', happy: '😊', sad: '😢', tired: '😴',
    sleep: '😴', wake: '⏰', 'wake up': '⏰', morning: '🌅', evening: '🌇', night: '🌙', day: '📅', week: '🗓️', month: '🗓️', year: '🗓️', today: '📅', tomorrow: '➡️', yesterday: '⬅️',
    time: '⏰', clock: '🕐', early: '🌅', late: '⏰', help: '🤝', hello: '👋', hi: '👋', goodbye: '👋', bye: '👋', thanks: '🙏', 'thank you': '🙏', please: '🙏', sorry: '🙇', yes: '✅', no: '❌',
    go: '🚶', come: '👋', stop: '🛑', open: '🔓', close: '🔒', clean: '🧽', dirty: '🧹', wash: '🧼', laundry: '🧺', cook: '👩‍🍳', work: '💼', job: '💼', office: '🏢', meeting: '🤝',
    big: '🐘', small: '🐜', new: '✨', old: '🏚️', fast: '⚡', slow: '🐢', left: '⬅️', right: '➡️', up: '⬆️', down: '⬇️', near: '📍', far: '🔭', here: '📍', there: '👉',
    street: '🛣️', city: '🏙️', village: '🏡', road: '🛣️', bridge: '🌉', park: '🌳', garden: '🌷', tree: '🌳', flower: '🌸', motorbike: '🏍️', scooter: '🛵', helmet: '⛑️', fuel: '⛽', petrol: '⛽',
    neighbour: '🏘️', neighbor: '🏘️', landlord: '🏠', deposit: '💰', contract: '📝', lease: '📝', sign: '✍️', broken: '🔧', repair: '🔧', fix: '🔧', noise: '🔊', quiet: '🤫',
    'look after': '🐕', 'i would like': '🙋', 'how much is it': '💰',
  };
  function emojiFor(en) {
    const n = C.norm(en).replace(/^(to|a|an|the) /, '');
    if (EMOJI[n]) return EMOJI[n];
    const base = n.replace(/(ies)$/, 'y').replace(/(es|s|ed|ing)$/, '');
    if (EMOJI[base]) return EMOJI[base];
    return '';
  }

  // ---------- Источники фото ----------
  async function getJSON(url) {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 12000);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (r.status === 429) { const e = new Error('limit'); e.limit = true; throw e; }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }
  const stripHtml = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  // Wikimedia Commons: поиск файлов-фотографий со свободной лицензией, миниатюра 480px
  async function commons(q) {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6' +
      '&gsrsearch=' + encodeURIComponent(q + ' filetype:bitmap') + '&gsrlimit=10&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=480';
    const j = await getJSON(url);
    const pages = Object.values((j.query && j.query.pages) || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
    return pages.map(p => {
      const ii = (p.imageinfo || [])[0] || {}; const m = ii.extmetadata || {};
      return { thumb: ii.thumburl, title: stripHtml((m.ObjectName || {}).value) || String(p.title || '').replace(/^File:|\.\w+$/g, ''),
        creator: stripHtml((m.Artist || {}).value).slice(0, 80), license: stripHtml((m.LicenseShortName || {}).value), source: 'Wikimedia Commons', url: ii.descriptionurl, mime: ii.mime };
    }).filter(r => r.thumb && /jpeg|png|webp/.test(r.mime || 'image/jpeg'));
  }
  async function openverse(q) {
    const j = await getJSON('https://api.openverse.org/v1/images/?q=' + encodeURIComponent(q) + '&page_size=10&mature=false');
    return (j.results || []).map(r => ({ thumb: r.thumbnail || r.url, title: r.title, creator: r.creator, license: (r.license || '').toUpperCase() + (r.license_version ? ' ' + r.license_version : ''), source: 'Openverse', url: r.foreign_landing_url }));
  }
  // Общий поиск: Commons, при пустом ответе или ошибке — Openverse
  async function search(q) {
    let res = [], err = null;
    try { res = await commons(q); } catch (e) { err = e; }
    if (res.length < 3) { try { res = res.concat(await openverse(q)); } catch (e) { err = err || e; } }
    if (!res.length && err) throw err;
    return res;
  }
  function queryFor(w) {
    if (w.imageQuery) return w.imageQuery;
    // для выражений ищем по сочетанию или по самому выражению без служебных слов
    return C.clean(w.en).replace(/^(to|a|an|the)\s+/i, '').replace(/[?!.]/g, '');
  }
  async function toDataURL(src) {
    // через fetch → blob, чтобы не зависеть от crossOrigin у <img>
    const r = await fetch(src); if (!r.ok) throw new Error('картинка не загрузилась');
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    try {
      return await new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => {
          const k = Math.min(1, 480 / Math.max(img.width, img.height));
          const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          try { res(c.toDataURL('image/jpeg', 0.82)); } catch (e) { rej(e); }
        };
        img.onerror = () => rej(new Error('картинка повреждена'));
        img.src = url;
      });
    } finally { URL.revokeObjectURL(url); }
  }

  // Подобрать картинку для слова (index — какой по счёту результат взять: для кнопки «Другая»)
  async function pickFor(w, index) {
    const res = await search(queryFor(w));
    const list = res.slice(index || 0).concat(res.slice(0, index || 0));
    for (let i = 0; i < Math.min(list.length, 4); i++) {
      const r = list[i];
      try {
        const data = await toDataURL(r.thumb);
        w.image = data;
        w.imageCredit = { title: r.title, creator: r.creator, license: r.license, source: r.source, url: r.url };
        w.auto = Object.assign({}, w.auto, { image: 1 });
        w.imgIdx = ((index || 0) + i + 1) % Math.max(1, res.length);
        return true;
      } catch (e) { /* пробуем следующий результат */ }
    }
    return false;
  }

  // ---------- Фоновая очередь ----------
  const queue = []; let running = false, stoppedUntil = 0;
  function enabled() { return S.settings.autoImages !== false && S.settings.online !== false; }
  function enqueue(ids) {
    if (!enabled()) return;
    ids.forEach(id => { if (!queue.includes(id)) queue.push(id); });
    run();
  }
  async function run() {
    if (running || !queue.length) return;
    if (!navigator.onLine || Date.now() < stoppedUntil) return;
    running = true;
    const total = queue.length; let done = 0, found = 0;
    const showProgress = total >= 3;
    while (queue.length && enabled()) {
      if (!navigator.onLine) break;
      const id = queue.shift(); const w = S.words.get(id);
      if (!w || w.image || w.imgTried) continue;
      try {
        const ok = await pickFor(w, 0);
        if (!S.words.has(id)) continue; // слово удалили, пока искали картинку
        w.imgTried = true; if (ok) found++;
        await saveWord(w, { quiet: true });
        refreshIfShown(w);
      } catch (e) {
        if (e.limit) { stoppedUntil = Date.now() + 30 * 60000; queue.unshift(id); toast('Бесплатный источник картинок попросил паузу — продолжу позже'); break; }
        if (!navigator.onLine) { queue.unshift(id); break; }
        if (S.words.has(id)) { w.imgTried = true; await saveWord(w, { quiet: true }); }
      }
      done++;
      if (showProgress && done % 5 === 0) toast('Подбираю картинки: ' + done + ' из ' + total);
      await new Promise(r => setTimeout(r, 400));
    }
    running = false;
    if (showProgress && done) toast('Картинки подобраны: ' + found + ' из ' + done + '. Проверьте их в карточках');
  }
  function refreshIfShown(w) {
    const hsh = location.hash;
    if (hsh === '#word-' + w.id) App.routes.word(w.id);
    else if (hsh === '#dict' || hsh === '#today' || hsh === '' ) {
      document.querySelectorAll('.witem').forEach(el => { if (el.dataset.id === w.id) el.replaceWith(App.wordItem(w, Date.now())); });
    }
  }
  // При запуске: докачать картинки для слов без них (по чуть-чуть)
  function resume() {
    if (!enabled()) return;
    const ids = wordsArr().filter(w => !w.archived && !w.image && !w.imgTried && !w.demo).sort((a, b) => b.createdAt - a.createdAt).slice(0, 40).map(w => w.id);
    if (ids.length) setTimeout(() => enqueue(ids), 2500);
  }
  window.addEventListener('online', () => setTimeout(run, 1500));

  // Кнопки под картинкой в карточке слова
  function controls(w, rerender) {
    const busy = h('span', { class: 'spin', hidden: true });
    const another = h('button', { class: 'btn sm soft', onclick: async () => {
      if (!S.online) return toast('Нужен интернет');
      another.disabled = true; busy.hidden = false;
      try { const ok = await pickFor(w, w.imgIdx || 1); if (!S.words.has(w.id)) return; if (!ok) toast('Других подходящих картинок не нашлось'); w.imgTried = true; await saveWord(w); rerender(); }
      catch (e) { toast(e.limit ? 'Источник картинок попросил паузу, попробуйте позже' : 'Не получилось: ' + e.message); }
      finally { another.disabled = false; busy.hidden = true; }
    } }, w.image ? 'Другая картинка' : 'Подобрать картинку');
    return h('div', { class: 'row', style: { gap: '8px' } },
      w.image && w.auto && w.auto.image ? h('span', { class: 'pill due' }, 'подобрана автоматически — проверьте') : null,
      another, busy,
      w.image ? h('button', { class: 'btn sm ghost', onclick: async () => { w.image = ''; w.imageCredit = null; w.imgTried = true; if (w.auto) delete w.auto.image; await saveWord(w); rerender(); } }, 'Убрать') : null,
      h('a', { class: 'btn sm ghost', href: '#edit-' + w.id }, 'Своё фото'));
  }

  window.Pics = { emojiFor, search, pickFor, enqueue, resume, controls, queryFor };
})();
