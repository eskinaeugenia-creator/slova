/* Мои слова — «Повтори за мной»: записать свой голос и прослушать рядом с образцом.
   Без оценки произношения — сравниваете на слух. Запись живёт только в этом окне, никуда не отправляется. */
(function () {
  'use strict';
  const { h, toast, sheet, quiet } = window.App;
  const MAX_SEC = 30; // запись останавливается сама

  // Можно ли записывать: нужен микрофон и MediaRecorder (в старых браузерах и некоторых окнах Telegram — нет)
  let denied = false; // человек запретил микрофон — до перезагрузки кнопки не показываем
  function supported() {
    return !denied && !!(window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.isSecureContext !== false;
  }
  function pickType() {
    const list = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
    try { return list.find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || ''; } catch (e) { return ''; }
  }

  // Кнопка 🎙 для реплики/абзаца. say(text, slow) — как звучит образец. Возвращает null, если запись недоступна.
  function button(text, say, opts) {
    if (!supported() || (quiet && quiet())) return null;
    return h('button', { class: 'btn ghost sm rep-btn', 'aria-label': 'Повтори за мной: записать свой голос', title: 'Повтори за мной', onclick: () => open(text, say, opts) }, '🎙');
  }

  function open(text, say, opts) {
    opts = opts || {};
    let rec = null, stream = null, chunks = [], url = null, timer = null, started = 0, myAudio = null;
    const status = h('div', { class: 'small muted', id: 'rep-status' }, '1) Послушайте образец. 2) Нажмите «Записать» и повторите. 3) Сравните.');
    const sampleBtn = h('button', { class: 'btn', id: 'rep-sample', onclick: () => { stopMine(); say(text, false); } }, '🔊 Образец');
    const slowBtn = h('button', { class: 'btn', id: 'rep-slow', onclick: () => { stopMine(); say(text, true); } }, '🐢 Медленно');
    const recBtn = h('button', { class: 'btn primary big block', id: 'rep-rec', onclick: () => rec ? stopRec() : startRec() }, '🎙 Записать');
    const mineBtn = h('button', { class: 'btn', id: 'rep-mine', disabled: true, onclick: playMine }, '▶ Мой голос');
    const bothBtn = h('button', { class: 'btn', id: 'rep-both', disabled: true, onclick: async () => { stopMine(); await say(text, false); playMine(); } }, '🔁 Образец, потом я');
    const body = h('div', { class: 'stack' },
      h('div', { class: 'example', lang: 'en', style: { fontSize: '18px' } }, text),
      opts.ru ? h('div', { class: 'small muted', lang: 'ru' }, opts.ru) : null,
      h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '8px' } }, sampleBtn, slowBtn),
      recBtn,
      h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '8px' } }, mineBtn, bothBtn),
      status,
      h('p', { class: 'tiny muted' }, 'Оценки произношения здесь нет — сравните на слух: ударения, паузы, мелодию фразы. Запись остаётся только на этом экране и никуда не отправляется.'));
    const s = sheet('Повтори за мной', body);
    // закрыли окно — выключаем микрофон и освобождаем запись
    const cleanup = () => { clearInterval(timer); try { if (rec && rec.state !== 'inactive') rec.stop(); } catch (e) { /* уже */ } releaseMic(); stopMine(); if (url) URL.revokeObjectURL(url); };
    const obs = new MutationObserver(() => { if (!s.el.isConnected) { obs.disconnect(); cleanup(); } });
    obs.observe(document.body, { childList: true });

    function releaseMic() { if (stream) { stream.getTracks().forEach(t => { try { t.stop(); } catch (e) { /* уже */ } }); stream = null; } }
    function stopMine() { if (myAudio) { try { myAudio.pause(); } catch (e) { /* нет */ } } }
    function playMine() {
      if (!url) return;
      try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* нет озвучки */ }
      myAudio = myAudio || new Audio(); myAudio.src = url; myAudio.currentTime = 0;
      const p = myAudio.play(); if (p && p.catch) p.catch(() => toast('Не получилось воспроизвести запись'));
    }
    async function startRec() {
      stopMine(); try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* нет */ }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        const no = e && (e.name === 'NotAllowedError' || e.name === 'SecurityError');
        if (no) denied = true;
        status.textContent = no ? 'Нет доступа к микрофону. Разрешите его в настройках браузера или Telegram — и попробуйте снова.' : 'Микрофон недоступен на этом устройстве.';
        return;
      }
      if (!s.el.isConnected) { releaseMic(); return; }
      chunks = [];
      const type = pickType();
      try { rec = type ? new MediaRecorder(stream, { mimeType: type }) : new MediaRecorder(stream); } catch (e) { releaseMic(); status.textContent = 'Запись не поддерживается в этом окне.'; return; }
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        releaseMic();
        if (url) URL.revokeObjectURL(url);
        url = chunks.length ? URL.createObjectURL(new Blob(chunks, { type: rec && rec.mimeType || type || 'audio/webm' })) : null;
        rec = null;
        recBtn.textContent = '🎙 Записать ещё раз'; recBtn.classList.remove('danger');
        mineBtn.disabled = bothBtn.disabled = !url;
        status.textContent = url ? 'Готово! Послушайте себя и образец. Не похоже — запишите ещё раз.' : 'Запись пустая — попробуйте ещё раз.';
        if (url) playMine();
      };
      rec.start();
      started = Date.now();
      recBtn.textContent = '⏹ Стоп'; recBtn.classList.add('danger');
      status.textContent = 'Идёт запись… говорите. 0 с';
      clearInterval(timer);
      timer = setInterval(() => {
        const sec = Math.floor((Date.now() - started) / 1000);
        if (rec) status.textContent = 'Идёт запись… говорите. ' + sec + ' с';
        if (sec >= MAX_SEC) stopRec();
      }, 250);
    }
    function stopRec() { clearInterval(timer); try { if (rec && rec.state !== 'inactive') rec.stop(); } catch (e) { rec = null; releaseMic(); } }
    return s;
  }

  window.Repeat = { supported, button, open };
})();
