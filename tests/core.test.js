const C = require('/home/claude/app/js/core.js');
const assert = require('assert'); let n = 0; const t = (name, f) => { f(); n++; console.log('✓', name); };

// 50 строк: разные разделители, дубли, фразовые глаголы, без перевода, нумерация
const lines = [];
for (let i = 0; i < 10; i++) lines.push(`word${i}\tслово${i}`);
for (let i = 10; i < 20; i++) lines.push(`${i - 9}. term${i} - термин${i}`);
for (let i = 20; i < 30; i++) lines.push(`phrase ${i} — фраза ${i}`);
lines.push('look after — присматривать', 'give up — сдаваться', 'check-in — регистрация', 'how much is it? — сколько это стоит?');
lines.push('word1\tслово1', 'word2\tслово2'); // дубли внутри списка
lines.push('rent', 'beach', 'sunscreen');      // без перевода
lines.push('пляж — beach');                    // перевёрнутый порядок
lines.push('только русский');                   // ошибка
lines.push('take off; снимать', 'wave; волна');
while (lines.length < 50) lines.push('extra' + lines.length + ' = доп' + lines.length);
const text = lines.join('\n');
t('50 строк: авторазделитель помечен как неоднозначный', () => {
  const r = C.parseList(text);
  assert.strictEqual(r.rows.length, 50); assert.ok(r.ambiguous);
});
t('построчный разбор с выбранным разделителем «—»', () => {
  const r = C.parseList(text, { delimiter: 'emdash' });
  const lookAfter = r.rows.find(x => x.en === 'look after');
  assert.ok(lookAfter && lookAfter.ru === 'присматривать');
  const flip = r.rows.find(x => x.ru === 'пляж'); assert.strictEqual(flip.en, 'beach');
  assert.ok(r.rows.find(x => x.ru === 'только русский').error);
  assert.strictEqual(r.rows.find(x => x.en === 'check-in').ru, 'регистрация');
});
t('автоопределение табуляции и дефиса', () => {
  assert.strictEqual(C.parseList('a\tб\nc\tд').delimiter, 'tab');
  const h = C.parseList('1. give up - сдаваться\n2. check-in - регистрация');
  assert.strictEqual(h.delimiter, 'hyphen'); assert.strictEqual(h.rows[1].en, 'check-in'); assert.strictEqual(h.rows[0].en, 'give up');
});
t('классификация дублей: новое / дубль / другое значение / черновик / дубль в списке', () => {
  const words = [{ id: 'a', en: 'rent', ru: 'аренда' }, { id: 'b', en: 'beach', ru: '' }];
  const seen = new Set();
  assert.strictEqual(C.classify({ en: 'wave', ru: 'волна' }, words, seen).status, 'new');
  assert.strictEqual(C.classify({ en: 'Rent', ru: 'Аренда' }, words, seen).status, 'dup');
  assert.strictEqual(C.classify({ en: 'rent', ru: 'снимать (жильё)' }, words, seen).status, 'meaning');
  assert.strictEqual(C.classify({ en: 'beach', ru: 'пляж' }, words, seen).status, 'fill');
  assert.strictEqual(C.classify({ en: 'wave', ru: 'волна' }, words, seen).status, 'dupList');
});
t('проверка ответа: регистр, пунктуация, варианты, to/артикли', () => {
  assert.strictEqual(C.checkAnswer('Rent!', 'to rent').result, 'correct');
  assert.strictEqual(C.checkAnswer('colour', 'color / colour').result, 'correct');
  assert.strictEqual(C.checkAnswer('how much is it', 'How much is it?').result, 'correct');
  assert.strictEqual(C.checkAnswer('dont', "don't").result, 'correct');
  assert.strictEqual(C.checkAnswer('a towel', 'towel').result, 'correct');
});
t('опечатка vs незнание + разметка букв', () => {
  assert.strictEqual(C.checkAnswer('aparment', 'apartment').result, 'typo');
  assert.strictEqual(C.checkAnswer('becah', 'beach').result, 'typo');
  assert.strictEqual(C.checkAnswer('house', 'apartment').result, 'wrong');
  assert.strictEqual(C.checkAnswer('cat', 'car').result, 'wrong'); // короткие слова без поблажек
  const d = C.checkAnswer('aparment', 'apartment').diff; assert.ok(d.some(o => o.t === 'miss' && o.c === 't'));
});
t('FSRS: интервалы растут при «вспомнила», сбрасываются при ошибке', () => {
  const day = C.DAY; let now = new Date(2026, 9, 1, 10).getTime();
  let c = C.review(null, 3, now); const i1 = (c.due - C.startOfDay(now)) / day;
  assert.ok(c.s > 3 && c.s < 4.5, 's0=' + c.s);
  now = c.due; c = C.review(c, 3, now); assert.ok(c.s > 8, 's after good=' + c.s);
  const before = c.s; now = c.due + 2 * day; const f = C.review(c, 1, now);
  assert.ok(f.s < before && f.lapses === 1); assert.strictEqual(Math.round((f.due - C.startOfDay(now)) / day * 10) / 10, 1.1);
  const hard = C.review(c, 2, c.due), good = C.review(c, 3, c.due), easy = C.review(c, 4, c.due);
  assert.ok(hard.s < good.s && good.s < easy.s); console.log('   интервалы: первый', Math.round(i1), 'дн.; после 2-го «вспомнила» s=', c.s.toFixed(1));
});
t('правило внеплановой тренировки', () => {
  const now = Date.now(); const c = C.review(null, 3, now - 1 * C.DAY);
  assert.strictEqual(C.shouldSchedule(c, 3, now), false);  // рано: верный ответ не меняет расписание
  assert.strictEqual(C.shouldSchedule(c, 1, now), true);   // ошибка засчитывается
  const today = C.review(null, 3, now);
  assert.strictEqual(C.shouldSchedule(today, 1, now + 1000), false); // тот же день — только история
  assert.strictEqual(C.shouldSchedule(null, 3, now), true);
});
t('план после пропуска: порция, а не вся очередь', () => {
  const now = Date.now(); const words = [];
  for (let i = 0; i < 200; i++) { const r = C.review(null, 3, now - 30 * C.DAY); words.push({ id: 'w' + i, en: 'w' + i, ru: 'с' + i, createdAt: i, srs: { recog: r, recall: r } }); }
  for (let i = 0; i < 20; i++) words.push({ id: 'n' + i, en: 'n' + i, ru: 'н' + i, createdAt: 1000 + i, srs: {} });
  const p = C.buildPlan(words, now, { minutes: 15, newPerDay: 7 });
  assert.ok(p.dueTotal === 400 && p.portion.length <= p.budget && p.fresh.length <= 2 && p.dueLeft > 0);
  console.log('   к повтору', p.dueTotal, '→ в порции', p.portion.length, '+ новых', p.fresh.length);
});
t('пример: поиск слова и форм', () => {
  assert.strictEqual(C.findInSentence('I rented a flat.', 'to rent').text, 'rented');
  assert.strictEqual(C.findInSentence('We look after the dog.', 'look after').text, 'look after');
  assert.strictEqual(C.findInSentence('I like it.', 'love'), null);
});
t('ответ Claude: JSON в ```json и TSV', () => {
  const j = C.parseStructured('Вот:\n```json\n[{"en":"lease","ru":"договор аренды","example":"Sign the lease.","example_ru":"Подпишите договор."}]\n```');
  assert.strictEqual(j.rows[0].exampleRu, 'Подпишите договор.');
  const tsv = C.parseStructured('en\tru\texample\nwave\tволна\tA big wave.');
  assert.strictEqual(tsv.kind, 'table'); assert.strictEqual(tsv.rows[0].ru, 'волна');
  assert.strictEqual(C.parseStructured('[{"en": broken').kind, 'json-error');
});
t('CSV с кавычками и запятыми внутри', () => {
  const r = C.parseCSV('word,translation\n"look after","присматривать, заботиться"\nbeach,пляж');
  assert.strictEqual(r.rows[1][1], 'присматривать, заботиться');
});
t('неправильные глаголы', () => { assert.strictEqual(C.irregular('to go').v2, 'went'); assert.strictEqual(C.irregular('rent'), null); });
console.log('\nВсе тесты логики пройдены:', n);
const C2 = require('/home/claude/app/js/core.js');
const mixed = C2.parseList('word0\tслово0\n1. term - термин\nphrase — фраза\nx = икс\nbeach\nпляж — beach\nтолько русский');
const errs = mixed.rows.filter(r => r.error).map(r => r.raw);
require('assert').deepStrictEqual(errs, ['только русский']);
const cb = C2.classifyBatch(mixed.rows, []);
require('assert').strictEqual(cb[4].status, 'dupList'); require('assert').strictEqual(cb[5].status, 'new');
console.log('✓ смешанные разделители в одном списке; черновик + перевод того же слова в списке → одна карточка');
