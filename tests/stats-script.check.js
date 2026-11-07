// Проверка кода таблицы tools/stats-apps-script.gs на поддельной Google Таблице
const fs = require('fs'), path = require('path'), assert = require('assert');
const rows = [];
const sh = {
  getLastRow: () => rows.length, appendRow: r => rows.push(r.slice()), setFrozenRows() {}, deleteRow: i => rows.splice(i - 1, 1),
  getRange: (r, c, nr, nc) => ({ setFontWeight() {}, getValue: () => rows[r - 1][c - 1],
    getValues: () => rows.slice(r - 1, r - 1 + nr).map(x => x.slice(c - 1, c - 1 + (nc || 1))),
    setValues: v => { rows[r - 1] = v[0].slice(); } }),
};
const g = { SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheets: () => [sh] }) }, LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  ContentService: { createTextOutput: t => t } };
const vm = require('vm'); const ctx = vm.createContext(Object.assign({ Date, Math, Number, String, JSON }, g));
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'tools', 'stats-apps-script.gs'), 'utf8'), ctx);
const post = d => ctx.doPost({ postData: { contents: JSON.stringify(d) } });
assert.strictEqual(post({ id: 'tg1', name: 'Аня', first: 1.7e12, words: 5 }), 'ok');
assert.strictEqual(rows.length, 2); assert.strictEqual(rows[0][0], 'id'); assert.strictEqual(rows[1][1], 'Аня');
post({ id: 'tg1', name: 'Аня', first: 1.8e12, words: 9 });
assert.strictEqual(rows.length, 2, 'тот же человек — та же строка'); assert.strictEqual(rows[1][5], 9);
assert.strictEqual(rows[1][3].getTime(), 1.7e12, 'дата первого входа не меняется');
post({ id: 'tg2', name: '=HYPERLINK("x")', words: -5 });
assert.ok(rows[2][1].startsWith("'="), 'формулы в имени обезврежены'); assert.strictEqual(rows[2][5], 0);
assert.strictEqual(post({ id: 'tg1', optout: true }), 'deleted');
assert.strictEqual(rows.length, 2); assert.strictEqual(rows[1][0], 'tg2');
assert.strictEqual(post({ name: 'без id' }), 'no id');
console.log('Код таблицы проверен: всё верно');
