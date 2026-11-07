// «Мои слова» — таблица учеников для автора приложения (Google Apps Script, бесплатно).
// Как подключить: создать Google Таблицу → Расширения → Apps Script → вставить этот код вместо всего,
// что там есть → Сохранить → Развернуть → Новое развертывание → тип «Веб-приложение»,
// «Запуск от имени: я», «У кого есть доступ: все» → Развернуть → разрешить доступ → скопировать ссылку …/exec.
// В таблицу попадают только люди, которые нажали в приложении «Да, можно». Кто выключил — строка удаляется.
const HEAD = ['id', 'Имя', 'Ник в Telegram', 'Первый вход', 'Последний раз', 'Слов в словаре', 'Закреплено', 'Минут всего', 'Дней занятий', 'Уровень', 'Где', 'Версия'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sh.getLastRow() === 0) { sh.appendRow(HEAD); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold'); }
    const id = txt(d.id, 40);
    if (!id) return out('no id');
    const last = sh.getLastRow();
    const ids = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(r => String(r[0])) : [];
    const i = ids.indexOf(id);
    if (d.optout) { if (i >= 0) sh.deleteRow(i + 2); return out('deleted'); }
    const first = Number(d.first) > 1e12 ? new Date(Number(d.first)) : new Date();
    const row = [id, txt(d.name, 80), txt(d.username, 40), first, new Date(), num(d.words), num(d.solid), num(d.minutes), num(d.days), txt(d.level, 10), txt(d.where, 40), txt(d.v, 12)];
    if (i >= 0) {
      const old = sh.getRange(i + 2, 4).getValue();
      if (old) row[3] = old; // дату первого входа не переписываем
      sh.getRange(i + 2, 1, 1, row.length).setValues([row]);
    } else sh.appendRow(row);
    return out('ok');
  } finally { lock.releaseLock(); }
}

// Текст без формул (защита от «=…» в имени) и ограниченной длины
function txt(v, n) { let s = String(v == null ? '' : v).slice(0, n); if (/^[=+\-@]/.test(s)) s = "'" + s; return s; }
function num(v) { const x = Math.round(Number(v) || 0); return Math.max(0, Math.min(1000000, x)); }
function out(t) { return ContentService.createTextOutput(t); }
