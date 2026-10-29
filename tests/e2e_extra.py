from playwright.sync_api import sync_playwright
BASE='http://localhost:8765/'; res=[]
def ok(n,c,e=''): res.append(bool(c)); print(('✓ ' if c else '✗ ')+n+(' — '+str(e) if e!='' else ''))
FAKE_TTS = """
(() => { window.__spoken = [];
  class U { constructor(t){ this.text=t; } }
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: U, configurable: true, writable: true });
  const vs = [{name:'Samantha',lang:'en-US',localService:true,voiceURI:'s'},{name:'Milena',lang:'ru-RU',localService:true,voiceURI:'m'}];
  const fake = { getVoices:()=>vs, speak(u){ window.__spoken.push([u.lang,u.text]); setTimeout(()=>u.onend&&u.onend(), 30); }, cancel(){}, onvoiceschanged:null, addEventListener(){} };
  Object.defineProperty(window, 'speechSynthesis', { get: () => fake, configurable: true });
})();"""
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':375,'height':740}, is_mobile=True, has_touch=True)
    ctx.add_init_script(FAKE_TTS)
    ctx.route('https://commons.wikimedia.org/**', lambda r: r.fulfill(status=500, body='')); ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1')
    ok('пустой экран предлагает готовый набор', pg.locator('text=Начать с готового набора').count()==1)
    pg.click('text=Начать с готового набора'); pg.wait_for_selector('.tile.wide')
    n_sets=pg.locator('.tile.wide').count(); ok('17 готовых наборов в 3 группах', n_sets==17 and pg.locator('.section-title').count()>=3, n_sets)
    pg.screenshot(path='/home/claude/tests/shots/16-sets.png')
    pg.click('.tile.wide:has-text("Аренда жилья")'); pg.wait_for_selector('.witem')
    cnt=pg.locator('.witem').count(); btn=pg.locator('.savebar .btn').inner_text()
    ok('в наборе слова с примерами, все выбраны', cnt>=15 and str(cnt) in btn, btn)
    pg.screenshot(path='/home/claude/tests/shots/17-set-detail.png')
    pg.locator('.witem input[type=checkbox]').nth(0).uncheck()
    pg.click('.savebar .btn'); pg.wait_for_selector('#dict-search')
    w=pg.evaluate("(() => { const ws=[...App.S.words.values()]; const s=[...App.S.sets.values()][0]; return {n: ws.length, set: s && s.name, inSet: ws.filter(w=>w.setIds.includes(s.id)).length, ex: ws.every(w=>w.example && w.exampleRu && w.ru), q: ws.find(w=>w.en==='flat').imageQuery}; })()")
    ok('слова добавлены в набор с тем же названием (кроме снятого)', w['n']==cnt-1 and w['set']=='Аренда жилья' and w['inSet']==cnt-1, w)
    ok('у каждого слова перевод, пример и перевод примера', w['ex'])
    pg.goto(BASE+'#set-rent'); pg.wait_for_selector('.witem')
    ok('повторно: добавленные помечены «уже есть», дублей нет', pg.locator('.pill.solid:has-text("уже есть")').count()==cnt-1)
    # Сегодня: счётчики
    pg.goto(BASE+'#today'); pg.wait_for_selector('.counters')
    ok('на «Сегодня» счётчики словарь / изучаю / закреплено', pg.locator('.counter').count()==3 and pg.locator('.counter b').first.inner_text()==str(cnt-1))
    pg.screenshot(path='/home/claude/tests/shots/18-today-counters.png')
    # Тренировки плитками
    pg.goto(BASE+'#train'); pg.wait_for_selector('.tiles-grid')
    ok('тренировки плитками (10 плиток, все активны)', pg.locator('.tiles-grid > *').count()==10 and pg.locator('.tile.soon').count()==0)
    pg.screenshot(path='/home/claude/tests/shots/19-train-tiles.png', full_page=True)
    pg.click('.tile:has-text("Подготовка к уроку")'); pg.wait_for_selector('text=Типы упражнений')
    ok('«Подготовка к уроку» открывается отдельным экраном', True)
    # Слушать
    pg.goto(BASE+'#listen'); pg.wait_for_selector('#ls-src')
    pg.select_option('#ls-gap', '1'); pg.click('button:has-text("Начать")'); pg.wait_for_selector('#ls-en')
    pg.wait_for_timeout(4500)
    sp=pg.evaluate("window.__spoken")
    langs=[s[0] for s in sp]
    ok('«Слушать»: английский → перевод по-русски → пример', 'ru-RU' in langs and langs[0].startswith('en') and len(sp)>=4, sp[:4])
    pos=pg.locator('.small.muted.num').inner_text(); ok('переходит к следующему слову сам', not pos.startswith('1 из'), pos)
    pg.screenshot(path='/home/claude/tests/shots/20-listen.png')
    pg.click('button[aria-label="Пауза"]'); n1=len(pg.evaluate("window.__spoken")); pg.wait_for_timeout(1500); n2=len(pg.evaluate("window.__spoken"))
    ok('пауза останавливает озвучку', n1==n2)
    pg.click('text=Закончить'); pg.wait_for_selector('.tiles-grid')
    # Числа
    pg.goto(BASE+'#numbers'); pg.wait_for_selector('.num-cell')
    ok('числа: words', pg.evaluate("[Extra.numWord(0),Extra.numWord(13),Extra.numWord(21),Extra.numWord(100),Extra.numWord(70)].join('|')")=='zero|thirteen|twenty-one|one hundred|seventy')
    pg.click('text=Тренировка: 10 заданий'); 
    for i in range(10):
        pg.wait_for_selector('.opt'); pg.locator('.opt').first.click(); pg.click('text=Дальше')
    ok('числа: 10 заданий и итог', pg.locator('text=Верно').count()>=1 and pg.locator('h2:has-text("Готово")').count()==1)
    # Алфавит
    pg.goto(BASE+'#abc'); pg.wait_for_selector('.num-cell'); ok('алфавит: 26 букв', pg.locator('.num-cell').count()==26)
    pg.click('text=Тренировка: 10 заданий')
    for i in range(10):
        pg.wait_for_selector('.opt'); pg.locator('.opt').first.click(); pg.click('text=Дальше')
    ok('алфавит: 10 заданий и итог', pg.locator('h2:has-text("Готово")').count()==1)
    spelled=[s for s in pg.evaluate("window.__spoken") if ',' in s[1]]
    ok('слово диктуется по буквам из вашего словаря', len(spelled)>0, spelled[:1])
    # Неправильные глаголы
    pg.goto(BASE+'#train'); pg.wait_for_selector('.tiles-grid')
    ok('плитка «Неправильные глаголы»', pg.locator('.tile:has-text("Неправильные глаголы")').count()==1)
    pg.click('.tile:has-text("Неправильные глаголы")'); pg.wait_for_selector('.irr-row')
    ok('таблица: 40 главных глаголов', pg.locator('.irr-row:not(.head)').count()==40)
    ok('в таблице go – went – gone', pg.locator('.irr-row:has-text("went")').count()>=1)
    pg.screenshot(path='/home/claude/tests/shots/21-irregular.png')
    pg.click('button:has-text("Тренировка")')
    for i in range(10):
        pg.wait_for_selector('.opt'); n=pg.locator('.opt').count(); assert n==4, n; pg.locator('.opt').first.click(); pg.click('text=Дальше')
    ok('тренировка 3 форм: 10 заданий по 4 варианта', pg.locator('h2:has-text("Готово")').count()==1)
    pg.goto(BASE+'#set-irregular'); pg.wait_for_selector('.witem'); pg.click('.savebar .btn'); pg.wait_for_selector('#dict-search')
    f=pg.evaluate("(() => { const w=[...App.S.words.values()].find(w=>w.en==='wake up'); const g=[...App.S.words.values()].find(w=>w.en==='go'); return [w && w.forms, g && g.forms]; })()")
    ok('набор глаголов: формы заполнены сами (в т.ч. wake up)', f==['wake up – woke up – woken up','go – went – gone'], f)
    pg.goto(BASE+'#irregular'); pg.wait_for_selector('.irr-row'); pg.click('.seg button:has-text("Из словаря")'); pg.wait_for_timeout(200)
    ok('режим «Из словаря» показывает ваши глаголы', pg.locator('.irr-row:not(.head)').count()>=30)
    # Инструкция
    pg.goto(BASE+'#help'); pg.wait_for_selector('.help')
    ok('инструкция: 9 разделов (с грамматикой)', pg.locator('.help').count()==9)
    pg.screenshot(path='/home/claude/tests/shots/22-help.png', full_page=True)
    # Узкий экран
    pg.set_viewport_size({'width':320,'height':640})
    for r in ['today','train','sets','set-beach','listen','numbers','abc','irregular','help']:
        pg.goto(BASE+'#'+r); pg.wait_for_timeout(250)
        sw=pg.evaluate('document.documentElement.scrollWidth'); ok('320px без прокрутки вбок: '+r, sw<=320, sw)
    ok('нет ошибок на странице', not errs, errs)
    b.close()
print(f'Итог: {sum(res)} из {len(res)}')
