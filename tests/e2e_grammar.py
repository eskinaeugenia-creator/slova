from playwright.sync_api import sync_playwright
BASE='http://localhost:8765/'; res=[]
def ok(n,c,e=''): res.append(bool(c)); print(('✓ ' if c else '✗ ')+n+(' — '+str(e) if e!='' else ''))
HELP = """window.__item = () => {
  const title = (document.querySelector('.top h1') || {}).textContent || '';
  const cur = Grammar.LESSONS.find(l => title.replace('Повторение: ', '') === l.title);
  const L = cur ? cur.items : Grammar.LESSONS.flatMap(l => l.items);
  const gs = document.querySelector('.gap-sentence'); const mid = document.querySelector('.prompt .mid');
  const t = (gs ? gs.textContent : mid ? mid.textContent : '').replace('____', '___').trim();
  const isBuild = !gs && document.querySelector('.tiles');
  return L.find(i => (isBuild ? i.t === 'build' && i.ru === t : i.s === t)) || null; }"""
def answer(pg, correct=True):
    task=pg.locator('.task').inner_text()
    it=pg.evaluate("window.__item()")
    if 'Прочитайте' in task:
        if it is None: pg.locator('.opt').first.click()
        else: pg.locator('.opt').nth(it['a'] if correct else (it['a']+1)%len(it['o'])).click()
    elif 'Выберите' in task:
        if it is None:
            base = pg.locator('.prompt .small').inner_text().split(' — ')[0].strip()
            pg.evaluate("t => ([...document.querySelectorAll('.opt')].find(b => b.textContent === t) || document.querySelector('.opt')).click()", base)
        else:
            target = it['a'] if correct else [o for o in it['o'] if o!=it['a']][0]
            pg.locator('.opt').filter(has_text=target).first.click() if False else pg.evaluate("t => [...document.querySelectorAll('.opt')].find(b => b.textContent === t).click()", target)
    elif 'Напишите' in task:
        if it is None and correct:
            gs=pg.locator('.gap-sentence').inner_text(); verb=gs.split('(')[1].rstrip(')')
            fn='ing' if 'I am' in gs else 'past' if 'Yesterday' in gs else 's3'
            val=pg.evaluate("([f, v]) => Grammar[f](v).split(' / ')[0]", [fn, verb])
        else: val = it['a'][0] if (correct and it) else 'xxx'
        pg.fill('#g-ans', val); pg.click('button:has-text("Проверить")')
    elif 'Соберите' in task:
        words = it['a'].rstrip('.?!').split(' ') if (correct and it) else []
        for wd in words: pg.evaluate("w => [...document.querySelectorAll('.tiles .tile:not(.used)')].find(b => b.textContent === w).click()", wd)
        if not words: pg.locator('.tiles .tile').first.click()
        pg.click('button:has-text("Проверить")')
    pg.wait_for_selector('.feedback'); fb=pg.locator('.feedback').inner_text()
    pg.click('button:has-text("Дальше")'); pg.wait_for_timeout(250); return fb
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':375,'height':740}, is_mobile=True, has_touch=True)
    ctx.route('https://commons.wikimedia.org/**', lambda r: r.fulfill(status=500, body='')); ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1'); pg.evaluate(HELP)
    # Исправление: окно «Наборы» в словаре
    pg.goto(BASE+'#dict'); pg.wait_for_selector('#dict-search'); pg.click('button:has-text("Наборы")'); pg.wait_for_selector('.sheet')
    ok('окно «Наборы»: видны готовые темы', pg.locator('.sheet .tile.wide').count()==17)
    pg.screenshot(path='/home/claude/tests/shots/23-sets-sheet.png')
    pg.click('.sheet .tile.wide:has-text("Пляж")'); pg.wait_for_selector('.savebar .btn'); pg.click('.savebar .btn'); pg.wait_for_selector('#dict-search')
    pg.click('button:has-text("Наборы")'); pg.wait_for_selector('.sheet')
    ok('добавленный набор виден в «Мои наборы»', pg.locator('.sheet .btn.grow:has-text("Пляж")').count()==1)
    pg.click('.sheet .btn.grow:has-text("Пляж")'); pg.wait_for_timeout(300)
    n=pg.locator('.witem').count(); ok('нажатие на набор показывает его слова', n==18 and pg.evaluate("document.querySelector('#dict-set').selectedOptions[0].textContent").startswith('Пляж'), n)
    # Общие наборы: слово из двух тем попадает в обе
    pg.goto(BASE+'#set-body'); pg.wait_for_selector('.savebar .btn'); pg.click('.savebar .btn'); pg.wait_for_selector('#dict-search')
    pg.goto(BASE+'#set-time'); pg.wait_for_selector('.savebar .btn'); pg.click('.savebar .btn'); pg.wait_for_selector('#dict-search')
    tired=pg.evaluate("(() => { const ws=[...App.S.words.values()].filter(w=>w.en==='tired'); return [ws.length, ws[0] && ws[0].setIds.length]; })()")
    pg.goto(BASE+'#set-feelings'); pg.wait_for_selector('.savebar .btn'); pg.click('.savebar .btn'); pg.wait_for_selector('#dict-search')
    pg.goto(BASE+'#set-family'); pg.wait_for_selector('.savebar .btn'); pg.click('.savebar .btn'); pg.wait_for_selector('#dict-search')
    pg.goto(BASE+'#set-sport'); pg.wait_for_selector('.savebar .btn'); pg.click('.savebar .btn'); pg.wait_for_selector('#dict-search')
    tired=pg.evaluate("(() => { const ws=[...App.S.words.values()].filter(w=>w.en==='tired'); return [ws.length, ws[0] && ws[0].setIds.map(id => App.S.sets.get(id).name)]; })()")
    ok('общее слово (tired) — одна карточка в двух наборах', tired[0]==1 and len(tired[1])==2, tired)
    # Грамматика
    pg.goto(BASE+'#train'); pg.wait_for_selector('.tiles-grid')
    ok('плитка «Грамматика» активна', pg.locator('.tile:has-text("Грамматика"):not(.soon)').count()==1)
    pg.click('.tile:has-text("Грамматика")'); pg.wait_for_selector('.tile.wide')
    ok('30 тем грамматики (A1 + A2)', pg.locator('.tile.wide:not(.soon)').count()==30)
    pg.screenshot(path='/home/claude/tests/shots/24-grammar-list.png', full_page=True)
    pg.click('.tile.wide:has-text("am / is / are")'); pg.wait_for_selector('.gram-theory')
    ok('теория: правило, таблица, примеры с озвучкой', pg.locator('.gram-table').count()>=1 and pg.locator('.gram-ex').count()>=5)
    pg.screenshot(path='/home/claude/tests/shots/25-grammar-theory.png', full_page=True)
    pg.click('button:has-text("Перейти к практике")'); pg.wait_for_selector('.task')
    tasks=[]; wrong_done=False; k=0
    while pg.locator('.task').count() and k<20:
        tasks.append(pg.locator('.task').inner_text())
        if k==3: pg.screenshot(path='/home/claude/tests/shots/26-grammar-item.png')
        fb=answer(pg, correct=(k!=4)); k+=1
        if k==5: ok('при ошибке — объяснение «почему»', 'Правильно' in fb and len(fb)>20, fb.replace('\n',' | ')[:80])
    order=[t.split()[0] for t in tasks]
    ok('порядок: понимание → выбор → написать → собрать', order[:2]==['Прочитайте','Прочитайте'] and 'Соберите' in order[-3:], order)
    ok('ошибочное задание повторилось в конце', len(tasks)==11, len(tasks))
    pg.wait_for_selector('.report'); pct=pg.locator('.report b').first.inner_text()
    ok('итог: 90% и «Тема пройдена»', pct=='90%' and pg.locator('h1:has-text("Тема пройдена")').count()==1, pct)
    prog=pg.evaluate("App.kvGet('grammar')")
    ok('прогресс сохранён с датой повторения', prog['be']['done'] and prog['be']['card']['due']>0)
    pg.screenshot(path='/home/claude/tests/shots/27-grammar-result.png')
    # Повторение через несколько дней
    pg.evaluate("(async () => { const g = await App.kvGet('grammar'); g.be.card.due -= 864e5*30; g.be.card.last -= 864e5*30; await App.kvSet('grammar', g); })()")
    pg.goto(BASE+'#today'); pg.wait_for_timeout(500)
    ok('на «Сегодня» предложено повторить тему', pg.locator('text=Грамматика: пора повторить «am / is / are»').count()==1)
    pg.click('.banner button:has-text("Повторить")'); pg.wait_for_selector('.task')
    k=0
    while pg.locator('.task').count() and k<10: answer(pg, True); k+=1
    ok('повторение — 6–7 коротких заданий', k in (6,7), k)
    # Задания на ваших словах
    pg.evaluate("(async () => { const ws = [['cook','готовить'],['dance','танцевать'],['watch','смотреть']].map(([en,ru]) => App.newWord({en, ru, pos:'глагол'})); await App.saveWords(ws); })()")
    pg.goto(BASE+'#gram-ps2'); pg.wait_for_selector('.gram-theory'); pg.click('button:has-text("Перейти к практике")')
    mine=False; k=0
    while pg.locator('.task').count() and k<15:
        if pg.locator('.pill:has-text("на ваших словах")').count():
            mine=True; s=pg.locator('.gap-sentence').inner_text(); verb=s.split('(')[1].rstrip(')'); want=pg.evaluate("v => Grammar.s3(v)", verb)
            pg.fill('#g-ans', want); pg.click('button:has-text("Проверить")'); pg.wait_for_selector('.feedback'); ok('задание на вашем глаголе: '+verb+' → '+want, 'Верно' in pg.locator('.feedback').inner_text()); pg.click('button:has-text("Дальше")'); pg.wait_for_timeout(250)
        else: answer(pg, True)
        k+=1
    ok('в уроке есть задание на ваших словах', mine)
    for lid in ['can','was','pron','imp','prep','cont','past','did','some','going','comp']:
        pg.goto(BASE+'#gram-'+lid); pg.wait_for_selector('.gram-theory'); pg.click('button:has-text("Перейти к практике")'); k=0
        while pg.locator('.task').count() and k<15: answer(pg, True); k+=1
        pg.wait_for_selector('.report'); ok('урок «'+lid+'» проходится на 100%', pg.locator('.report b').first.inner_text()=='100%')
    pg.set_viewport_size({'width':320,'height':640})
    for r in ['grammar','gram-be','gram-prep','gram-cont','gram-past','gram-comp','sets']:
        pg.goto(BASE+'#'+r); pg.wait_for_timeout(250); sw=pg.evaluate('document.documentElement.scrollWidth'); ok('320px без прокрутки вбок: '+r, sw<=320, sw)
    ok('нет ошибок на странице', not errs, errs)
    b.close()
print(f'Итог: {sum(res)} из {len(res)}')
