// Проверка содержания уроков без браузера
const fs = require('fs');
global.window = { App: { S: { ui: {}, settings: {} }, h(){}, icon(){}, toast(){}, go(){}, routes: {}, screen(){}, wordsArr: () => [], kvSet: async () => {}, kvGet: async () => ({}) } };
window.Core = require('/home/claude/app/js/core.js');
eval(fs.readFileSync('/home/claude/app/js/grammar.js', 'utf8'));
const G = window.Grammar; let n = 0, bad = [];
G.LESSONS.forEach(l => l.items.forEach(it => {
  n++;
  if (it.t === 'choose' && !it.o.includes(it.a)) bad.push(l.id + ': ответ не среди вариантов: ' + it.s);
  if (it.t === 'choose' && new Set(it.o).size !== it.o.length) bad.push(l.id + ': повтор вариантов: ' + it.s);
  if (it.t === 'meaning' && !(it.a >= 0 && it.a < it.o.length)) bad.push(l.id + ': meaning a: ' + it.s);
  if ((it.t === 'choose' || it.t === 'type') && !it.s.includes('___')) bad.push(l.id + ': нет пропуска: ' + it.s);
  if (it.t === 'type' && !Array.isArray(it.a)) bad.push(l.id + ': type a не массив');
  if (it.t === 'build' && it.a.replace(/[.?!]$/, '').split(' ').length > 9) bad.push(l.id + ': слишком длинная фраза: ' + it.a);
  if (!it.why && it.t !== 'build') bad.push(l.id + ': нет объяснения: ' + it.s);
}));
const s3 = G.s3; const cases = { work: 'works', watch: 'watches', go: 'goes', study: 'studies', play: 'plays', have: 'has', fix: 'fixes', wash: 'washes', swim: 'swims', pay: 'pays' };
Object.keys(cases).forEach(v => { if (s3(v) !== cases[v]) bad.push('s3(' + v + ') = ' + s3(v)); });
console.log('Уроков:', G.LESSONS.length, '· заданий:', n);
G.LESSONS.forEach(l => { const c = {}; l.items.forEach(i => c[i.t] = (c[i.t] || 0) + 1); console.log('  ', l.id, JSON.stringify(c)); });
if (bad.length) { console.log('ПРОБЛЕМЫ:\n' + bad.join('\n')); process.exit(1); } else console.log('Содержание уроков проверено: ошибок нет');
