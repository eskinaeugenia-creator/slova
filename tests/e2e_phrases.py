# «Из текста»: фразы из домашки целиком — нумерация убирается, перенос строки внутри фразы склеивается
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
SH='/tmp/claude-0/-home-claude/de85335f-0f5d-5bd4-b2db-7618e4b0e2be/scratchpad/'
HW = "DAILY ROUTINE\n1\nI wake up early\nin the morning.\n2\nI get out of bed.\n3 I brush my teeth.\n4. I wash my face.\nI get dressed\nfor the day.\nI have my\nbreakfast."
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':800}, is_mobile=True, has_touch=True, device_scale_factor=2)
    ctx.add_init_script(FAKE_TTS)
    ctx.route('https://api.mymemory.translated.net/**', lambda r: r.fulfill(status=500, body=''))
    ctx.route('https://commons.wikimedia.org/**', lambda r: r.fulfill(status=500, body='')); ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1')
    pg.evaluate("App.S.ui.addMode='text'"); pg.goto(BASE+'#add'); pg.wait_for_selector('#text-src')
    pg.fill('#text-src', HW); pg.click('#pick-btn'); pg.wait_for_selector('.phr')
    items=pg.locator('.phr').all_inner_texts()
    ok('для списка фраз сразу включён режим «Целые фразы»', pg.locator('[data-mode="sent"][aria-pressed="true"]').count()==1)
    ok('фразы склеены и без номеров', any('I wake up early in the morning.' in x for x in items) and any('I brush my teeth.' in x for x in items) and any('I get dressed for the day.' in x for x in items), items)
    ok('номера и заголовок КАПСОМ отдельно не появились', len(items)==6 and not any('ROUTINE' in x for x in items), items)
    pg.screenshot(path=SH+'phrases.png')
    pg.click('#phr-all')
    ok('«Выбрать все» — выбраны все', pg.locator('.phr.sel').count()==pg.locator('.phr').count())
    pg.click('#pick-next'); pg.wait_for_timeout(1200)
    vals=pg.evaluate("[...document.querySelectorAll('main input')].map(i=>i.value)")
    ok('в предпросмотре — фраза целиком одной карточкой', 'I wake up early in the morning' in vals and 'I have my breakfast' in vals, vals)
    # режим «Слова» по-прежнему работает
    pg.evaluate("App.S.ui.addMode='text'"); pg.goto(BASE+'#today'); pg.goto(BASE+'#add'); pg.wait_for_selector('#text-src')
    pg.fill('#text-src', 'I brush my teeth every morning before work and then I drink coffee.'); pg.click('#pick-btn'); pg.wait_for_selector('[data-mode]')
    ok('обычный текст — по умолчанию выбор слов', pg.locator('[data-mode="word"][aria-pressed="true"]').count()==1 and pg.locator('.tok').count()>5)
    ok('нет ошибок на странице', not errs, errs)
    print(f'Итог: {sum(res)} из {len(res)}')
