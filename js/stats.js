/* Мои слова — «Автор видит, кто занимается».
   Только с согласия человека: раз в несколько часов отправляем в Google Таблицу автора приложения
   имя, ник в Telegram, дату первого входа и последнего раза, сколько слов в словаре и сколько минут занимался.
   Сами слова, ответы и переводы не отправляются. Нет согласия или не задан адрес таблицы — не отправляется ничего.
   Код для таблицы — tools/stats-apps-script.gs, инструкция — в README. */
(function () {
  'use strict';
  const C = window.Core;
  const { S, h, toast, saveSettings, wordsArr, routes } = window.App;
  // Адрес веб-приложения Google Apps Script (…/exec). Пусто — функция выключена и нигде не показывается.
  const URL_ = window.STATS_URL_OVERRIDE || '';
  const OWNER = 'Евгения', OWNER_DAT = 'Евгении';
  const EVERY = 6 * 3600 * 1000; // не чаще раза в 6 часов
  const WA = window.Telegram && window.Telegram.WebApp;

  const enabled = () => !!URL_;
  function tgUser() { try { return WA && WA.initData && WA.initDataUnsafe && WA.initDataUnsafe.user || null; } catch (e) { return null; } }
  async function myId() {
    const u = tgUser();
    if (u && u.id) return 'tg' + u.id;
    if (!S.settings.statsUid) { S.settings.statsUid = 'web-' + Math.random().toString(36).slice(2, 10); await saveSettings(); }
    return S.settings.statsUid;
  }
  function post(data) {
    // text/plain без заголовков — Apps Script принимает такой запрос без лишних проверок браузера
    return fetch(URL_, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
  }
  async function payload() {
    const u = tgUser();
    const ws = wordsArr().filter(w => !w.archived);
    const now = Date.now();
    const tot = App.studyTotals ? await App.studyTotals() : { min: 0, days: 0 };
    return {
      id: await myId(),
      name: u ? [u.first_name, u.last_name].filter(Boolean).join(' ') : (S.settings.name || ''),
      username: u && u.username ? '@' + u.username : '',
      first: S.settings.installedAt || now,
      words: ws.length,
      solid: ws.filter(w => C.wordStatus(w, now) === 'solid').length,
      minutes: tot.min, days: tot.days,
      level: S.settings.level || '',
      where: u ? 'Telegram' + (WA.platform ? ' · ' + WA.platform : '') : 'браузер',
      v: App.APP_VERSION,
    };
  }
  let busy = false;
  async function send(force) {
    if (!enabled() || S.settings.shareStats !== true || busy) return false;
    if (!force && Date.now() - (S.settings.statsSentAt || 0) < EVERY) return false;
    if (navigator.onLine === false) return false;
    busy = true;
    try { await post(await payload()); S.settings.statsSentAt = Date.now(); await saveSettings(); return true; }
    catch (e) { return false; } finally { busy = false; }
  }
  async function setShare(v) {
    const was = S.settings.shareStats === true;
    S.settings.shareStats = v; S.settings.statsSentAt = 0; await saveSettings();
    if (v) send(true);
    else if (was && enabled()) { try { await post({ id: await myId(), optout: true }); } catch (e) { /* нет сети — строка останется до следующего раза */ } }
  }

  const WHAT = 'имя и ник из Telegram, когда вы заходили, сколько слов в словаре и сколько минут занимались. Сами слова и ответы не отправляются.';
  // ---------- Вопрос на «Сегодня» (один раз) ----------
  function todayCard() {
    if (!enabled() || S.settings.shareStats === true || S.settings.shareStats === false) return null;
    return h('div', { class: 'card stack', id: 'stats-offer' },
      h('h3', null, '👋 Можно ' + OWNER_DAT + ' видеть, что вы занимаетесь?'),
      h('p', { class: 'small muted', style: { margin: 0 } }, OWNER + ' сделала это приложение и радуется каждому, кто учит слова. Если согласитесь, она увидит ' + WHAT + ' Передумать можно в Настройках.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', id: 'stats-yes', onclick: async () => { await setShare(true); toast('Спасибо! ' + OWNER + ' увидит, что вы занимаетесь'); routes.today(); } }, 'Да, можно'),
        h('button', { class: 'btn ghost', id: 'stats-no', onclick: async () => { await setShare(false); toast('Хорошо, ничего не отправляем'); routes.today(); } }, 'Нет')));
  }
  // ---------- Переключатель в Настройках ----------
  function prefsCard() {
    if (!enabled()) return null;
    const cb = h('input', { type: 'checkbox', id: 'stats-share', checked: S.settings.shareStats === true, onchange: async e => { await setShare(e.target.checked); toast(e.target.checked ? 'Включено' : 'Выключено, ваша строка удалена из таблицы'); } });
    return h('div', { class: 'card stack', id: 'stats-prefs' }, h('h2', null, 'Автор приложения'),
      h('label', { class: 'switch' }, h('span', { class: 'stack', style: { gap: '0' } }, h('span', null, 'Пусть ' + OWNER + ' видит, что я занимаюсь'),
        h('span', { class: 'tiny muted' }, 'Отправляется: ' + WHAT + ' Если выключить — ваша строка удаляется из её таблицы.')), cb));
  }
  function start() {
    if (!enabled()) return;
    setTimeout(() => send(), 4000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') send(); });
  }
  window.Stats = { enabled, todayCard, prefsCard, send, setShare, payload, start };
})();
