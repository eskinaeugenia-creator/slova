# Тест по изученным словам + типы вопросов в занятии
import re
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':375,'height':740}, is_mobile=True, has_touch=True)
    ctx.add_init_script(FAKE_TTS)
    ctx.route('https://commons.wikimedia.org/**', lambda r: r.fulfill(status=500, body='')); ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1')
    pg.goto(BASE+'#set-family'); pg.wait_for_selector('text=Добавить в словарь'); pg.click('text=Добавить в словарь'); pg.wait_for_timeout(600)
    pg.goto(BASE+'#test'); pg.wait_for_selector('h1')
    ok('без изученных слов — объяснение', pg.locator('text=Пока рано для теста').count()==1)
    n=pg.evaluate("""(async () => { const ws=[...App.S.words.values()].slice(0,12); ws.forEach(w => { w.srs.recog = Core.review(null, 3, Date.now()-86400000*3); }); for (const w of ws) await App.saveWord(w,{quiet:true}); return ws.length; })()""")
    pg.goto(BASE+'#train'); pg.wait_for_selector('.tile')
    ok('плитка «Тест» на экране тренировок', pg.locator('.tile:has-text("Тест")').count()==1)
    pg.click('.tile:has-text("Тест")'); pg.wait_for_selector('#test-start')
    ok('в тесте только изученные слова', pg.locator('#test-set option').first.inner_text().find('(12)')>0)
    pg.click('.seg button:has-text("10")'); pg.click('#test-start'); pg.wait_for_selector('.sbar')
    ok('идёт тест 1/10, есть время', pg.locator('.sbar >> text=1/10').count()==1 and re.match(r'\d+:\d\d', pg.locator('.sbar .num').last.inner_text()) is not None)
    srs_before=pg.evaluate("JSON.stringify([...App.S.words.values()].map(w=>w.srs))")
    right=0
    for i in range(10):
        pg.wait_for_selector('.sbody .task')
        task=pg.locator('.sbody .task').inner_text()
        if pg.locator('#test-input').count():
            ru=pg.locator('.prompt .big').inner_text()
            en=pg.evaluate(f"[...App.S.words.values()].find(w=>w.ru==={ru!r}).en")
            if i%3==0: pg.fill('#test-input','zzz')
            else: pg.fill('#test-input',en); right+=1
            pg.click('text=Проверить')
        else:
            if i%3==0: pg.click('text=Не знаю')
            else:
                if 'английское' in task:
                    ru=pg.locator('.prompt .big').inner_text(); ans=pg.evaluate(f"[...App.S.words.values()].find(w=>w.ru==={ru!r}).en")
                elif 'Послушайте' in task:
                    pg.evaluate("window.__spoken=[]"); pg.click('.speak-big'); pg.wait_for_function("window.__spoken.length>0")
                    en=pg.evaluate("window.__spoken.slice(-1)[0][1]"); ans=pg.evaluate(f"[...App.S.words.values()].find(w=>w.en==={en!r}).ru")
                else:
                    en=pg.locator('.prompt .big').inner_text(); ans=pg.evaluate(f"[...App.S.words.values()].find(w=>w.en==={en!r}).ru")
                pg.locator('.opt', has_text=ans).first.click(); right+=1
        pg.locator('.actions .btn.primary').first.click()
    pg.wait_for_selector('.test-ring')
    pct=pg.locator('.test-ring b').inner_text()
    ok('результат в процентах верный', pct==f'{right*10}%', (pct,right))
    ok('список ошибок и кнопка «Потренировать ошибки»', pg.locator('text=Потренировать ошибки').count()==1)
    ok('тест не меняет расписание повторений', srs_before==pg.evaluate("JSON.stringify([...App.S.words.values()].map(w=>w.srs))"))
    pg.click('text=Пройти ещё раз'); pg.wait_for_selector('#test-start')
    ok('прошлый результат виден', pg.locator('text=Прошлые результаты').count()==1)
    # типы вопросов в занятии
    pg.goto(BASE+'#prefs'); pg.wait_for_selector('text=Типы вопросов в занятии')
    for lab in ['Карточки','С выбором ответа','На слух']:
        pg.locator('label.switch', has_text=lab).first.locator('input').uncheck(); pg.wait_for_timeout(150)
    ok('настройка сохранена', pg.evaluate("JSON.stringify(App.S.settings.kinds)")=='{"cards":false,"choice":false,"write":true,"listen":false}')
    pg.locator('label.switch', has_text='Письменные').first.locator('input').click(); pg.wait_for_timeout(200)
    ok('последний тип выключить нельзя', pg.evaluate("App.S.settings.kinds.write")==True)
    pg.goto(BASE+'#today'); pg.wait_for_selector('h1')
    pg.evaluate("Train.startDaily()"); pg.wait_for_selector('.sbody .task')
    types=pg.evaluate("JSON.parse(JSON.stringify(App.S.ui))") 
    tasks=set()
    for i in range(8):
        t=pg.locator('.sbody .task').inner_text(); tasks.add(t)
        if pg.locator('text=Не знаю').count(): pg.locator('text=Не знаю').first.click()
        elif pg.locator('button:has-text("Не помню")').count(): pg.locator('button:has-text("Не помню")').first.click()
        btn=pg.locator('.actions .btn.primary')
        if btn.count(): btn.first.click()
        else: break
        pg.wait_for_timeout(150)
        if not pg.locator('.sbody .task').count(): break
    bad=[t for t in tasks if 'Выберите' in t or 'Послушайте' in t]
    ok('в занятии только письменные (и знакомство)', not bad, tasks)
    ok('нет ошибок на странице', not errs, errs)
    print(f'Итог: {sum(res)} из {len(res)}')
